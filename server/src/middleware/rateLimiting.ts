/**
 * Rate Limiting Middleware for Session Security
 * Prevents abuse and ensures session security
 */

import { Request, Response, NextFunction } from 'express';
import { getDb } from '../database';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string; // Error message
}

// Rate limit configurations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'template-submission': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per IP
    message: 'Too many template submissions. Please try again later.'
  },
  'login-attempts': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts per 15 minutes per IP
    message: 'Too many login attempts. Please try again later.'
  },
  'qr-upload': {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 QR uploads per 5 minutes per session
    message: 'Too many QR upload attempts. Please wait before trying again.'
  }
};

class RateLimitService {
  /**
   * Initialize rate limiting tables
   */
  initTables(): void {
    const db = getDb();
    
    try {
      // Create rate limiting table
      db.exec(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          identifier TEXT NOT NULL, -- IP address or session key
          endpoint TEXT NOT NULL,
          request_count INTEGER DEFAULT 1,
          window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(identifier, endpoint)
        )
      `);

      // Create index for performance
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint 
        ON rate_limits(identifier, endpoint)
      `);

      // Create index for cleanup
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start 
        ON rate_limits(window_start)
      `);

      console.log('✅ Rate limiting tables initialized');
    } catch (error) {
      console.error('❌ Error initializing rate limiting tables:', error);
    }
  }

  /**
   * Check if request is within rate limits
   */
  async checkRateLimit(identifier: string, endpoint: string, config: RateLimitConfig): Promise<boolean> {
    const db = getDb();
    
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - config.windowMs);

      // Clean up old entries first
      db.prepare(`
        DELETE FROM rate_limits 
        WHERE window_start < ?
      `).run(windowStart.toISOString());

      // Get current count for this identifier/endpoint
      const current = db.prepare(`
        SELECT request_count, window_start
        FROM rate_limits 
        WHERE identifier = ? AND endpoint = ?
      `).get(identifier, endpoint) as any;

      if (!current) {
        // First request - create entry
        db.prepare(`
          INSERT OR REPLACE INTO rate_limits (identifier, endpoint, request_count, window_start)
          VALUES (?, ?, 1, ?)
        `).run(identifier, endpoint, now.toISOString());
        
        return true; // Allow request
      }

      const windowStartTime = new Date(current.window_start);
      
      if (now.getTime() - windowStartTime.getTime() > config.windowMs) {
        // Window expired - reset counter
        db.prepare(`
          UPDATE rate_limits 
          SET request_count = 1, window_start = ?
          WHERE identifier = ? AND endpoint = ?
        `).run(now.toISOString(), identifier, endpoint);
        
        return true; // Allow request
      }

      if (current.request_count >= config.maxRequests) {
        // Rate limit exceeded
        console.warn(`🚫 Rate limit exceeded: ${identifier} on ${endpoint} (${current.request_count}/${config.maxRequests})`);
        return false;
      }

      // Increment counter
      db.prepare(`
        UPDATE rate_limits 
        SET request_count = request_count + 1
        WHERE identifier = ? AND endpoint = ?
      `).run(identifier, endpoint);

      return true; // Allow request
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow request on error (fail open)
    }
  }

  /**
   * Get rate limit status for identifier
   */
  async getRateLimitStatus(identifier: string, endpoint: string): Promise<{
    remaining: number;
    resetTime: Date;
    isLimited: boolean;
  }> {
    const db = getDb();
    const config = RATE_LIMITS[endpoint];
    
    if (!config) {
      return { remaining: 999, resetTime: new Date(), isLimited: false };
    }

    try {
      const current = db.prepare(`
        SELECT request_count, window_start
        FROM rate_limits 
        WHERE identifier = ? AND endpoint = ?
      `).get(identifier, endpoint) as any;

      if (!current) {
        return { 
          remaining: config.maxRequests, 
          resetTime: new Date(Date.now() + config.windowMs), 
          isLimited: false 
        };
      }

      const windowStartTime = new Date(current.window_start);
      const resetTime = new Date(windowStartTime.getTime() + config.windowMs);
      const remaining = Math.max(0, config.maxRequests - current.request_count);
      const isLimited = remaining === 0 && Date.now() < resetTime.getTime();

      return { remaining, resetTime, isLimited };
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return { remaining: 0, resetTime: new Date(), isLimited: false };
    }
  }
}

// Export singleton instance
const rateLimitService = new RateLimitService();

/**
 * Rate limiting middleware factory
 */
export function createRateLimit(endpoint: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const config = RATE_LIMITS[endpoint];
    
    if (!config) {
      return next(); // No rate limit configured
    }

    const identifier = req.ip || req.socket.remoteAddress || 'unknown';
    const isAllowed = await rateLimitService.checkRateLimit(identifier, endpoint, config);

    if (!isAllowed) {
      const status = await rateLimitService.getRateLimitStatus(identifier, endpoint);
      
      return res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil((status.resetTime.getTime() - Date.now()) / 1000),
        remaining: status.remaining
      });
    }

    next();
  };
}

export default rateLimitService;
