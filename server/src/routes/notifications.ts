/**
 * Notifications API Routes
 * Handles admin notification management
 */

import express from 'express';
import { getDb } from '../database';
import { authenticateJWT, requireAdmin } from '../middleware';
import { 
  getRecentNotifications, 
  markNotificationRead, 
  dismissNotification,
  getNotificationStats,
  NotificationRecord 
} from '../database/tables/notifications';
import notificationService from '../services/notificationService';

const router = express.Router();

// Get recent notifications (admin only)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { 
      limit = '50', 
      include_read = 'true', 
      include_dismissed = 'false',
      type,
      category 
    } = req.query;

    const db = getDb();
    let notifications = getRecentNotifications(
      db, 
      parseInt(limit as string), 
      include_read === 'true',
      include_dismissed === 'true'
    );

    // Filter by type if specified
    if (type && typeof type === 'string') {
      notifications = notifications.filter(n => n.type === type);
    }

    // Filter by category if specified
    if (category && typeof category === 'string') {
      notifications = notifications.filter(n => n.category === category);
    }

    // Parse metadata JSON
    const processedNotifications = notifications.map(notification => ({
      ...notification,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null
    }));

    res.json({
      success: true,
      notifications: processedNotifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notifications' 
    });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    const stats = await notificationService.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch notification stats' 
    });
  }
});

// Mark notification as read (admin only)
router.put('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid notification ID' 
      });
    }

    const db = getDb();
    const success = markNotificationRead(db, notificationId);

    if (success) {
      // Notify other admins of read status change
      const io = require('../services/socketManager').default.getIO();
      if (io) {
        io.to('admins').emit('notification_read', { id: notificationId });
      }

      res.json({ success: true });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Notification not found' 
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark notification as read' 
    });
  }
});

// Dismiss notification (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid notification ID' 
      });
    }

    const db = getDb();
    const success = dismissNotification(db, notificationId);

    if (success) {
      // Notify other admins of dismissal
      const io = require('../services/socketManager').default.getIO();
      if (io) {
        io.to('admins').emit('notification_dismissed', { id: notificationId });
      }

      res.json({ success: true });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Notification not found' 
      });
    }
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to dismiss notification' 
    });
  }
});

// Mark all notifications as read (admin only)
router.put('/bulk/read', authenticateJWT, async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead();
    res.json({ 
      success: true, 
      message: `Marked ${count} notifications as read` 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to mark all notifications as read' 
    });
  }
});

// Dismiss all read notifications (admin only)
router.delete('/bulk/read', authenticateJWT, async (req, res) => {
  try {
    const count = await notificationService.dismissAllRead();
    res.json({ 
      success: true, 
      message: `Dismissed ${count} read notifications` 
    });
  } catch (error) {
    console.error('Error dismissing read notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to dismiss read notifications' 
    });
  }
});

// Create test notification (admin only, development only)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', authenticateJWT, requireAdmin, async (req, res) => {
    try {
      const { type = 'system', category = 'info', title = 'Test Notification', message = 'This is a test notification' } = req.body;

      const notificationId = await notificationService.createNotification({
        type: type as any,
        category: category as any,
        title,
        message,
        metadata: { event: 'test', timestamp: new Date().toISOString() }
      });

      res.json({ 
        success: true, 
        notificationId,
        message: 'Test notification created' 
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to create test notification' 
      });
    }
  });
}

export default router;
