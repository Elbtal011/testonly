import SQLiteDatabase from 'better-sqlite3';

export function initDomainTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create domains table
  db.exec(`
    CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain_name TEXT NOT NULL UNIQUE,
      template_id INTEGER NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT 0,
      ssl_enabled BOOLEAN NOT NULL DEFAULT 0,
      dns_configured BOOLEAN NOT NULL DEFAULT 0,
      nginx_config TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_checked TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
    )
  `);
  
  // Create an index on template_id for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_domains_template_id
    ON domains (template_id)
  `);
}
