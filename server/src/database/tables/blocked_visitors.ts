import SQLiteDatabase from 'better-sqlite3';

export function initBlockedVisitorsTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create blocked_visitors table for anti-bot logging
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocked_visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT NOT NULL,
      user_agent TEXT,
      detection_method TEXT NOT NULL,
      detection_score INTEGER,
      detection_reasons TEXT,
      requested_path TEXT,
      headers_json TEXT,
      geo_country TEXT,
      geo_region TEXT,
      blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create indices for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_blocked_visitors_ip
    ON blocked_visitors (ip_address)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_blocked_visitors_blocked_at
    ON blocked_visitors (blocked_at)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_blocked_visitors_detection_method
    ON blocked_visitors (detection_method)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_blocked_visitors_geo_country
    ON blocked_visitors (geo_country)
  `);
  
  console.log('✅ Blocked visitors table initialized');
}

export function initAntiBotConfigTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create antibot_config table for admin dashboard configuration
  db.exec(`
    CREATE TABLE IF NOT EXISTS antibot_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      config_key TEXT UNIQUE NOT NULL,
      config_value TEXT NOT NULL,
      description TEXT,
      config_type TEXT DEFAULT 'string',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert default configuration values
  const defaultConfigs = [
    {
      key: 'enable_antibot',
      value: 'true',
      description: 'Master switch for anti-bot protection',
      type: 'boolean'
    },
    {
      key: 'header_threshold',
      value: '4',
      description: 'Scoring threshold for header detection (lower = stricter)',
      type: 'number'
    },
    {
      key: 'enable_cloaking',
      value: 'true',
      description: 'Show portfolio site to detected bots',
      type: 'boolean'
    },
    {
      key: 'enable_scheduled_cloaking',
      value: 'false',
      description: 'Enable time-based cloaking (business hours only)',
      type: 'boolean'
    },
    {
      key: 'scheduled_hours',
      value: '9-17',
      description: 'Active hours for scheduled cloaking (e.g., 9-17)',
      type: 'string'
    },
    {
      key: 'enable_geo_filter',
      value: 'false',
      description: 'Block visitors from outside target countries',
      type: 'boolean'
    },
    {
      key: 'allowed_countries',
      value: 'DE,AT,CH',
      description: 'Comma-separated list of allowed country codes',
      type: 'array'
    },
    {
      key: 'enable_referrer_check',
      value: 'false',
      description: 'Validate HTTP referrer headers',
      type: 'boolean'
    },
    {
      key: 'allowed_referrers',
      value: '',
      description: 'Comma-separated list of allowed referrer domains',
      type: 'array'
    },
    {
      key: 'allow_empty_referrer',
      value: 'true',
      description: 'Allow requests with no referrer header',
      type: 'boolean'
    }
  ];
  
  // Insert default configs if they don't exist
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO antibot_config (config_key, config_value, description, config_type)
    VALUES (?, ?, ?, ?)
  `);
  
  let insertedCount = 0;
  defaultConfigs.forEach(config => {
    const result = insertStmt.run(config.key, config.value, config.description, config.type);
    if (result.changes > 0) {
      insertedCount++;
    }
  });
  
  if (insertedCount > 0) {
    console.log(`✅ Added ${insertedCount} default anti-bot configuration values`);
  }
  
  console.log('✅ Anti-bot configuration table initialized');
}

// Add columns to existing tracking table
export function updateTrackingTableForAntiBot(db: ReturnType<typeof SQLiteDatabase>): void {
  const columnsToAdd = [
    'is_bot BOOLEAN DEFAULT 0',
    'bot_score INTEGER DEFAULT 0',
    'bot_reasons TEXT',
    'detection_bypassed BOOLEAN DEFAULT 0'
  ];
  
  columnsToAdd.forEach(column => {
    try {
      db.exec(`ALTER TABLE tracking ADD COLUMN ${column}`);
      console.log(`✅ Added column to tracking: ${column}`);
    } catch (error) {
      // Column already exists, ignore
    }
  });
}
