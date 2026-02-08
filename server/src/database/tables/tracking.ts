import SQLiteDatabase from 'better-sqlite3';

export function initTrackingTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create tracking table for visitor tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id TEXT NOT NULL UNIQUE, -- Unique identifier for the visitor
      template_id INTEGER NOT NULL,
      domain_id INTEGER NOT NULL,
      unique_url TEXT UNIQUE, -- Shortened/personalized URL
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      first_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      visit_count INTEGER DEFAULT 1,
      converted_to_lead BOOLEAN DEFAULT 0,
      lead_id INTEGER, -- Reference to the lead if converted
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT, 
      utm_content TEXT,
      geo_country TEXT,
      geo_region TEXT,
      geo_city TEXT,
      FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
      FOREIGN KEY (domain_id) REFERENCES domains (id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL
    )
  `);
  
  // Create page_visits table to track the visitor journey across pages
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      query_params TEXT,
      time_spent INTEGER, -- in milliseconds
      form_interactions INTEGER DEFAULT 0,
      form_submissions INTEGER DEFAULT 0,
      visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tracking_id) REFERENCES tracking (id) ON DELETE CASCADE
    )
  `);
  
  // Create indices for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tracking_tracking_id
    ON tracking (tracking_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tracking_unique_url
    ON tracking (unique_url)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tracking_domain_id
    ON tracking (domain_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tracking_converted
    ON tracking (converted_to_lead)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_page_visits_tracking_id
    ON page_visits (tracking_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at
    ON page_visits (visited_at)
  `);
}
