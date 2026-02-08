/**
 * Crawler Pattern Utilities
 * Loads and manages crawler user agent patterns for bot detection
 */

import fs from 'fs';
import path from 'path';

interface CrawlerPattern {
  pattern: string;
  url?: string;
  instances?: string[];
}

// Default patterns as fallback
const DEFAULT_PATTERNS = [
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
  /uptimerobot/i, /pingdom/i, /freshping/i, /betteruptime/i,
  /headlesschrome/i, /puppeteer/i, /selenium/i, /webdriver/i,
  /curl/i, /wget/i, /python-requests/i, /axios/i, /postman/i,
  /ahrefsbot/i, /semrushbot/i, /mj12bot/i, /dotbot/i,
  /chrome-lighthouse/i, /pagespeed/i, /gtmetrix/i
];

const crawlerFilePath = path.join(__dirname, '../data/crawler-user-agents.json');

/**
 * Load crawler patterns from JSON file
 */
export function loadCrawlerPatterns(): RegExp[] {
  try {
    if (!fs.existsSync(crawlerFilePath)) {
      console.warn('⚠️ Crawler patterns file not found, using defaults');
      return DEFAULT_PATTERNS;
    }
    
    const rawData = fs.readFileSync(crawlerFilePath, 'utf8');
    const crawlerList: CrawlerPattern[] = JSON.parse(rawData);
    
    const patterns = crawlerList
      .map(item => {
        try {
          return new RegExp(item.pattern, 'i');
        } catch (error) {
          console.error(`Invalid regex pattern: ${item.pattern}`);
          return null;
        }
      })
      .filter((p): p is RegExp => p !== null);
    
    console.log(`✅ Loaded ${patterns.length} crawler patterns for anti-bot detection`);
    return patterns;
  } catch (error) {
    console.error('Error loading crawler patterns:', error);
    return DEFAULT_PATTERNS;
  }
}

/**
 * Check if user agent matches any crawler pattern
 */
export function matchesCrawlerPattern(userAgent: string, patterns: RegExp[]): boolean {
  if (!userAgent) return false;
  return patterns.some(pattern => pattern.test(userAgent));
}

/**
 * Get default patterns
 */
export function getDefaultPatterns(): RegExp[] {
  return DEFAULT_PATTERNS;
}

/**
 * Refresh crawler patterns from file (for runtime updates)
 */
export function refreshCrawlerPatterns(): RegExp[] {
  return loadCrawlerPatterns();
}
