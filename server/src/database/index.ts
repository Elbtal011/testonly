import SQLiteDatabase from 'better-sqlite3';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import { initUserTable } from './tables/users';
import { initTemplateTable } from './tables/templates';
import { initDomainTable } from './tables/domains';
import { initLeadTable } from './tables/leads';
import { initCampaignTable } from './tables/campaigns';
import { initTrackingTable } from './tables/tracking';
import { initEmailTemplatesTable } from './tables/email_templates';
import { initSessionTable } from './tables/sessions';
import { initSparkasseBranchesTable } from './tables/sparkasse_branches';
import { initVolksbankBranchesTable } from './tables/volksbank_branches';
import { initTemplateStepConfigsTable, insertDefaultStepConfigs } from './tables/template_step_configs';
import { initTelegramSettingsTable, insertDefaultTelegramSettings, addNotificationFieldsToLeads } from './tables/telegram_settings';
import { initBlockedVisitorsTable, initAntiBotConfigTable, updateTrackingTableForAntiBot } from './tables/blocked_visitors';
import { initNotificationsTable } from './tables/notifications';

// Ensure the data directory exists
const dataDir = path.dirname(config.database.path);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize the database connection
let db: ReturnType<typeof SQLiteDatabase>;

export function initDatabase(): void {
  try {
    db = new SQLiteDatabase(config.database.path);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize all tables
    initUserTable(db);
    initTemplateTable(db);
    initDomainTable(db);
    initLeadTable(db);
    initCampaignTable(db);
    initTrackingTable(db);
    initEmailTemplatesTable(db);
    initSessionTable(db);
    
    // Initialize branches tables
    initSparkasseBranchesTable(db);
    initVolksbankBranchesTable();
    
    // Initialize template step configs table
    initTemplateStepConfigsTable(db);
    
    // Insert default step configurations (only if they don't exist)
    insertDefaultStepConfigs(db);
    
    // Initialize Telegram settings table
    initTelegramSettingsTable(db);
    
    // Insert default Telegram settings (only if they don't exist)
    insertDefaultTelegramSettings(db);
    
    // Add notification fields to leads table
    addNotificationFieldsToLeads(db);
    
  // Initialize anti-bot tables
  initBlockedVisitorsTable(db);
  initAntiBotConfigTable(db);
  updateTrackingTableForAntiBot(db);
  
  // Initialize notifications table
  initNotificationsTable(db);
    
    // Initialize rate limiting tables
    const rateLimitService = require('../middleware/rateLimiting').default;
    rateLimitService.initTables();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

export function getDb(): ReturnType<typeof SQLiteDatabase> {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Gracefully close the database connection when the application terminates
process.on('exit', () => {
  if (db) {
    db.close();
  }
});

export default { initDatabase, getDb };
