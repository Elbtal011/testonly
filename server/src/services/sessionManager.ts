/**
 * Session Manager Service
 * Handles secure session management with database persistence and encryption
 */

import crypto from 'crypto';
import { getDb } from '../database';
import { config } from '../config';
import { SessionData, QRData, SessionRecord } from '../database/tables/sessions';

class SessionManager {
  private encryptionKey: Buffer;
  private encryptionIV: Buffer;

  constructor() {
    // Initialize encryption keys from config
    this.encryptionKey = Buffer.from(config.encryption.key, 'utf8');
    this.encryptionIV = Buffer.from(config.encryption.iv, 'utf8');
  }

  /**
   * Create a new session
   */
  async createSession(
    templateName: string, 
    ipAddress?: string, 
    userAgent?: string, 
    referrer?: string
  ): Promise<string> {
    const db = getDb();
    const sessionKey = this.generateSessionKey();
    const expiresAt = new Date(Date.now() + (config.session.expireHours * 60 * 60 * 1000));

    try {
      const result = db.prepare(`
        INSERT INTO sessions (
          session_key, template_name, ip_address, user_agent, referrer, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(sessionKey, templateName, ipAddress, userAgent, referrer, expiresAt.toISOString());

      console.log(`🔑 Created session ${sessionKey} for template ${templateName}`);
      return sessionKey;
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Get session by key
   */
  async getSession(sessionKey: string): Promise<SessionRecord | null> {
    const db = getDb();

    try {
      const session = db.prepare(`
        SELECT * FROM sessions WHERE session_key = ? AND expires_at > datetime('now')
      `).get(sessionKey) as SessionRecord | undefined;

      if (!session) {
        console.log(`❌ Session ${sessionKey} not found or expired`);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Update session state
   */
  async updateSessionState(sessionKey: string, newState: string): Promise<boolean> {
    const db = getDb();

    try {
      const result = db.prepare(`
        UPDATE sessions 
        SET current_state = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE session_key = ? AND expires_at > datetime('now')
      `).run(newState, sessionKey);

      return result.changes > 0;
    } catch (error) {
      console.error('Error updating session state:', error);
      return false;
    }
  }

  /**
   * Store session data (encrypted)
   */
  async storeSessionData(sessionKey: string, data: Partial<SessionData>): Promise<boolean> {
    const db = getDb();

    try {
      // Get existing session data
      const session = await this.getSession(sessionKey);
      if (!session) return false;

      // Decrypt existing data if any
      let existingData: SessionData = {};
      if (session.session_data) {
        existingData = this.decryptData(session.session_data);
      }

      // Merge with new data
      const updatedData = { ...existingData, ...data };

      // Encrypt the updated data
      const encryptedData = this.encryptData(updatedData);

      const result = db.prepare(`
        UPDATE sessions 
        SET session_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE session_key = ?
      `).run(encryptedData, sessionKey);

      console.log(`💾 Stored session data for ${sessionKey}`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error storing session data:', error);
      return false;
    }
  }

  /**
   * Get session data (decrypted)
   */
  async getSessionData(sessionKey: string): Promise<SessionData | null> {
    const session = await this.getSession(sessionKey);
    if (!session || !session.session_data) return null;

    try {
      return this.decryptData(session.session_data);
    } catch (error) {
      console.error('Error decrypting session data:', error);
      return null;
    }
  }

  /**
   * Store QR upload data
   */
  async storeQRData(sessionKey: string, qrData: Partial<QRData>): Promise<boolean> {
    const db = getDb();

    try {
      const session = await this.getSession(sessionKey);
      if (!session) return false;

      // Get existing QR data
      let existingQRData: QRData = { upload_attempts: 0, files: [] };
      if (session.qr_data) {
        existingQRData = JSON.parse(session.qr_data);
      }

      // Merge with new QR data
      const updatedQRData = { ...existingQRData, ...qrData };

      const result = db.prepare(`
        UPDATE sessions 
        SET qr_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE session_key = ?
      `).run(JSON.stringify(updatedQRData), sessionKey);

      console.log(`📎 Stored QR data for ${sessionKey}`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error storing QR data:', error);
      return false;
    }
  }

  /**
   * Get QR upload data
   */
  async getQRData(sessionKey: string): Promise<QRData | null> {
    const session = await this.getSession(sessionKey);
    if (!session || !session.qr_data) return null;

    try {
      return JSON.parse(session.qr_data);
    } catch (error) {
      console.error('Error parsing QR data:', error);
      return null;
    }
  }

  /**
   * Mark session as completed
   */
  async completeSession(sessionKey: string, leadId?: number): Promise<boolean> {
    const db = getDb();

    try {
      const result = db.prepare(`
        UPDATE sessions 
        SET is_completed = 1, lead_created = ?, lead_id = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE session_key = ?
      `).run(leadId ? 1 : 0, leadId || null, sessionKey);

      console.log(`✅ Marked session ${sessionKey} as completed`);
      return result.changes > 0;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionKey: string): Promise<boolean> {
    const db = getDb();

    try {
      const result = db.prepare('DELETE FROM sessions WHERE session_key = ?').run(sessionKey);
      
      if (result.changes > 0) {
        console.log(`🗑️ Deleted session ${sessionKey}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const db = getDb();

    try {
      // First, update sessions to remove lead references to avoid foreign key constraint
      const updateResult = db.prepare(`
        UPDATE sessions 
        SET lead_id = NULL 
        WHERE expires_at < datetime('now') AND lead_id IS NOT NULL
      `).run();
      
      if (updateResult.changes > 0) {
        console.log(`🔗 Cleared ${updateResult.changes} lead references from expired sessions`);
      }

      // Then delete expired sessions
      const result = db.prepare(`
        DELETE FROM sessions WHERE expires_at < datetime('now')
      `).run();

      if (result.changes > 0) {
        console.log(`🧹 Cleaned up ${result.changes} expired sessions`);
      }
      
      return result.changes;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    expired: number;
  }> {
    const db = getDb();

    try {
      const total = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number };
      const active = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime(\'now\') AND is_completed = 0').get() as { count: number };
      const completed = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_completed = 1').get() as { count: number };
      const expired = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at <= datetime(\'now\')').get() as { count: number };

      return {
        total: total.count,
        active: active.count,
        completed: completed.count,
        expired: expired.count
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return { total: 0, active: 0, completed: 0, expired: 0 };
    }
  }

  /**
   * Get sessions by template name
   */
  async getSessionsByTemplate(templateName: string): Promise<SessionRecord[]> {
    const db = getDb();
    
    try {
      const sessions = db.prepare(`
        SELECT * FROM sessions 
        WHERE template_name = ? AND expires_at > datetime('now')
        ORDER BY created_at DESC
      `).all(templateName) as SessionRecord[];
      
      return sessions;
    } catch (error) {
      console.error('Error getting sessions by template:', error);
      return [];
    }
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<SessionRecord[]> {
    const db = getDb();
    
    try {
      const sessions = db.prepare(`
        SELECT 
          session_key,
          template_name,
          current_state,
          created_at,
          updated_at,
          expires_at,
          is_completed,
          ip_address,
          session_mode,
          is_waiting_for_admin
        FROM sessions 
        WHERE expires_at > datetime('now') AND is_completed = 0
        ORDER BY created_at DESC
      `).all() as SessionRecord[];
      
      console.log(`📊 Retrieved ${sessions.length} active sessions from database`);
      sessions.forEach(session => {
        console.log(`   Session: ${session.session_key?.substring(0, 16)}... | Template: ${session.template_name} | State: ${session.current_state} | Created: ${session.created_at}`);
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Rotate session token for security
   */
  async rotateSessionToken(oldSessionKey: string): Promise<string> {
    const db = getDb();
    
    try {
      // Get existing session
      const session = await this.getSession(oldSessionKey);
      if (!session) {
        throw new Error('Session not found');
      }

      // Generate new session key
      const newSessionKey = this.generateSessionKey();
      
      // Update session with new key
      db.prepare(`
        UPDATE sessions 
        SET session_key = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_key = ?
      `).run(newSessionKey, oldSessionKey);

      console.log(`🔄 Rotated session token: ${oldSessionKey} -> ${newSessionKey}`);
      return newSessionKey;
    } catch (error) {
      console.error('Error rotating session token:', error);
      throw new Error('Failed to rotate session token');
    }
  }

  /**
   * Update session mode (AFK/LIVE)
   */
  async updateSessionMode(sessionKey: string, mode: 'AFK' | 'LIVE'): Promise<void> {
    const db = getDb();
    
    try {
      db.prepare(`
        UPDATE sessions 
        SET session_mode = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_key = ?
      `).run(mode, sessionKey);
      
      console.log(`🎛️ Updated session ${sessionKey} mode to: ${mode}`);
    } catch (error) {
      console.error('Error updating session mode:', error);
      throw new Error('Failed to update session mode');
    }
  }

  /**
   * Set waiting for admin status
   */
  async setWaitingForAdmin(sessionKey: string, waiting: boolean): Promise<void> {
    const db = getDb();
    
    try {
      db.prepare(`
        UPDATE sessions 
        SET is_waiting_for_admin = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_key = ?
      `).run(waiting ? 1 : 0, sessionKey);
      
      console.log(`⏳ Set session ${sessionKey} waiting for admin: ${waiting}`);
    } catch (error) {
      console.error('Error setting waiting for admin:', error);
      throw new Error('Failed to set waiting for admin');
    }
  }

  /**
   * Validate session IP address with flexible matching for proxies
   */
  async validateSessionIP(sessionKey: string, currentIP: string): Promise<boolean> {
    const db = getDb();
    
    try {
      const session = db.prepare(`
        SELECT ip_address FROM sessions 
        WHERE session_key = ?
      `).get(sessionKey) as any;

      if (!session) {
        return false;
      }

      // Allow if no IP recorded
      if (!session.ip_address) {
        return true;
      }

      // Extract and normalize IPs for comparison
      const normalizeIP = (ip: string) => {
        if (!ip) return '';
        // Handle x-forwarded-for format (comma-separated)
        const cleanIP = ip.split(',')[0].trim();
        // Handle IPv6 mapped IPv4 addresses
        if (cleanIP.startsWith('::ffff:')) {
          return cleanIP.substring(7);
        }
        return cleanIP;
      };

      const sessionIP = normalizeIP(session.ip_address);
      const currentNormalizedIP = normalizeIP(currentIP);

      console.log(`🔍 IP Validation Debug for session ${sessionKey}:`);
      console.log(`   Original session IP: "${session.ip_address}"`);
      console.log(`   Normalized session IP: "${sessionIP}"`);
      console.log(`   Current IP: "${currentIP}"`);
      console.log(`   Normalized current IP: "${currentNormalizedIP}"`);
      console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);

      // Allow if IPs match after normalization
      if (sessionIP === currentNormalizedIP) {
        console.log(`✅ IP match: ${sessionIP} === ${currentNormalizedIP}`);
        return true;
      }

      // In development, be more lenient with localhost variations
      if (process.env.NODE_ENV === 'development') {
        const localhostIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
        const isSessionLocalhost = localhostIPs.includes(sessionIP) || sessionIP.startsWith('192.168.') || sessionIP.startsWith('10.0.') || sessionIP.includes('127.0.0.1');
        const isCurrentLocalhost = localhostIPs.includes(currentNormalizedIP) || currentNormalizedIP.startsWith('192.168.') || currentNormalizedIP.startsWith('10.0.') || currentNormalizedIP.includes('127.0.0.1');
        
        console.log(`🔍 Development check: sessionLocalhost=${isSessionLocalhost}, currentLocalhost=${isCurrentLocalhost}`);
        
        // In development, allow any localhost variation
        if (isSessionLocalhost || isCurrentLocalhost) {
          console.log(`🔓 Development mode: Allowing localhost/development IP variation ${sessionIP} -> ${currentNormalizedIP}`);
          return true;
        }
        
        // Also allow if both IPs are from the same local network
        const bothLocal = (sessionIP.startsWith('127.') || sessionIP.startsWith('::')) && 
                         (currentNormalizedIP.startsWith('127.') || currentNormalizedIP.startsWith('::'));
        if (bothLocal) {
          console.log(`🔓 Development mode: Both IPs are localhost variants`);
          return true;
        }
      }

      // In production with proxy, allow if both IPs are from the same subnet or proxy chain
      if (process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY === 'true') {
        // Check if IPs are from same /24 subnet (common for load balancers)
        const getSubnet = (ip: string) => {
          const parts = ip.split('.');
          if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.${parts[2]}`;
          }
          return ip;
        };
        
        const sessionSubnet = getSubnet(sessionIP);
        const currentSubnet = getSubnet(currentNormalizedIP);
        
        if (sessionSubnet === currentSubnet) {
          console.log(`🔓 Production proxy mode: Allowing same subnet ${sessionSubnet}.x`);
          return true;
        }
        
        // Allow common proxy/CDN IP ranges (Cloudflare, AWS ALB, etc.)
        const isProxyIP = (ip: string) => {
          return ip.startsWith('10.') || 
                 ip.startsWith('172.') || 
                 ip.startsWith('192.168.') ||
                 ip.startsWith('169.254.') || // AWS metadata
                 ip === '127.0.0.1';
        };
        
        if (isProxyIP(sessionIP) || isProxyIP(currentNormalizedIP)) {
          console.log(`🔓 Production proxy mode: Allowing proxy IP range`);
          return true;
        }
      }

      console.warn(`⚠️ IP mismatch for session ${sessionKey}: ${sessionIP} vs ${currentNormalizedIP}`);
      return false;
    } catch (error) {
      console.error('Error validating session IP:', error);
      return false; // Fail secure
    }
  }

  /**
   * Add session security event
   */
  async addSecurityEvent(sessionKey: string, eventType: string, details: any): Promise<void> {
    const db = getDb();
    
    try {
      // Create security events table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS session_security_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_key TEXT NOT NULL,
          event_type TEXT NOT NULL,
          event_details TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert security event
      db.prepare(`
        INSERT INTO session_security_events 
        (session_key, event_type, event_details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        sessionKey, 
        eventType, 
        JSON.stringify(details),
        details.ip_address || null,
        details.user_agent || null
      );

      console.log(`🛡️ Security event logged: ${sessionKey} -> ${eventType}`);
    } catch (error) {
      console.error('Error adding security event:', error);
    }
  }

  /**
   * Generate secure session key
   */
  private generateSessionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data
   */
  private encryptData(data: any): string {
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, this.encryptionIV);
    const plaintext = JSON.stringify(data);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag for GCM mode
    const authTag = cipher.getAuthTag();
    
    return encrypted + ':' + authTag.toString('hex');
  }

  /**
   * Decrypt sensitive data
   */
  private decryptData(encryptedData: string): any {
    const [encrypted, authTagHex] = encryptedData.split(':');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, this.encryptionIV);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
}

// Singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
