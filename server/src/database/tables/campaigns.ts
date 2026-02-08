import SQLiteDatabase from 'better-sqlite3';

export function initCampaignTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create campaigns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft', -- draft, scheduled, running, completed, cancelled
      schedule_time TIMESTAMP,
      completed_time TIMESTAMP,
      template_id INTEGER, -- The email template used for the campaign
      sender_email TEXT,
      sender_name TEXT,
      subject TEXT,
      body_html TEXT,
      body_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
    )
  `);
  
  // Create campaign_recipients table (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_recipients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      lead_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, unsubscribed
      send_time TIMESTAMP,
      open_time TIMESTAMP,
      click_time TIMESTAMP,
      tracking_id TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE,
      UNIQUE(campaign_id, lead_id)
    )
  `);
  
  // Create indexes for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_campaigns_status
    ON campaigns (status)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_campaigns_schedule_time
    ON campaigns (schedule_time)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status
    ON campaign_recipients (status)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_campaign_recipients_tracking_id
    ON campaign_recipients (tracking_id)
  `);
}
