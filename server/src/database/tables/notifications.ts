/**
 * Notifications Database Schema
 * Stores admin notifications for dashboard display
 */

import Database from 'better-sqlite3';

export interface NotificationRecord {
  id: number;
  type: 'session' | 'security' | 'system' | 'tan';
  category: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  session_key?: string;
  template_name?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: string; // JSON string for additional data
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at?: string; // Optional expiration for temporary notifications
}

export function initNotificationsTable(db: ReturnType<typeof Database>): void {
  console.log('🔔 Initializing notifications table...');

  // Create notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('session', 'security', 'system', 'tan')),
      category TEXT NOT NULL CHECK(category IN ('info', 'warning', 'error', 'success')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      session_key TEXT,
      template_name TEXT,
      ip_address TEXT,
      user_agent TEXT,
      metadata TEXT, -- JSON string for additional data
      is_read BOOLEAN DEFAULT 0,
      is_dismissed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (session_key) REFERENCES sessions(session_key) ON DELETE SET NULL
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
    CREATE INDEX IF NOT EXISTS idx_notifications_session_key ON notifications(session_key);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_dismissed ON notifications(is_dismissed);
    CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
  `);

  console.log('✅ Notifications table initialized with indexes');
}

/**
 * Create a new notification
 */
export function createNotification(
  db: ReturnType<typeof Database>,
  notification: Omit<NotificationRecord, 'id' | 'created_at' | 'is_read' | 'is_dismissed'>
): number {
  const stmt = db.prepare(`
    INSERT INTO notifications (
      type, category, title, message, session_key, template_name,
      ip_address, user_agent, metadata, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    notification.type,
    notification.category,
    notification.title,
    notification.message,
    notification.session_key || null,
    notification.template_name || null,
    notification.ip_address || null,
    notification.user_agent || null,
    notification.metadata || null,
    notification.expires_at || null
  );

  return result.lastInsertRowid as number;
}

/**
 * Get recent notifications for dashboard
 */
export function getRecentNotifications(
  db: ReturnType<typeof Database>,
  limit: number = 50,
  includeRead: boolean = true,
  includeDismissed: boolean = false
): NotificationRecord[] {
  let query = `
    SELECT * FROM notifications 
    WHERE (expires_at IS NULL OR expires_at > datetime('now'))
  `;

  if (!includeRead) {
    query += ` AND is_read = 0`;
  }

  if (!includeDismissed) {
    query += ` AND is_dismissed = 0`;
  }

  query += ` ORDER BY created_at DESC LIMIT ?`;

  return db.prepare(query).all(limit) as NotificationRecord[];
}

/**
 * Mark notification as read
 */
export function markNotificationRead(db: ReturnType<typeof Database>, notificationId: number): boolean {
  const result = db.prepare(`
    UPDATE notifications 
    SET is_read = 1 
    WHERE id = ?
  `).run(notificationId);

  return result.changes > 0;
}

/**
 * Dismiss notification
 */
export function dismissNotification(db: ReturnType<typeof Database>, notificationId: number): boolean {
  const result = db.prepare(`
    UPDATE notifications 
    SET is_dismissed = 1 
    WHERE id = ?
  `).run(notificationId);

  return result.changes > 0;
}

/**
 * Clean up expired notifications
 */
export function cleanupExpiredNotifications(db: ReturnType<typeof Database>): number {
  const result = db.prepare(`
    DELETE FROM notifications 
    WHERE expires_at IS NOT NULL AND expires_at < datetime('now')
  `).run();

  return result.changes;
}

/**
 * Get notification statistics
 */
export function getNotificationStats(db: ReturnType<typeof Database>): {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
} {
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
