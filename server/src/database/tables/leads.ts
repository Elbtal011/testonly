import SQLiteDatabase from 'better-sqlite3';

export function initLeadTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create leads table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      domain_id INTEGER NOT NULL,
      tracking_id TEXT,
      name TEXT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      username TEXT, 
      password TEXT,
      pin TEXT,
      tan TEXT,
      additional_data TEXT, -- Store JSON with additional form fields
      ip_address TEXT,
      user_agent TEXT,
      status TEXT DEFAULT 'new', -- new, contacted, converted, etc.
      source TEXT DEFAULT 'submission', -- submission, import, partial
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      submission_count INTEGER DEFAULT 1,
      FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
      FOREIGN KEY (domain_id) REFERENCES domains (id) ON DELETE CASCADE
    )
  `);
  
  // Create indices for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_template_id
    ON leads (template_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_domain_id
    ON leads (domain_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_tracking_id
    ON leads (tracking_id)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_created_at
    ON leads (created_at)
  `);
  
  // Add new columns if they don't exist (for existing databases)
  // IMPORTANT: This must happen BEFORE creating indexes on new columns
  addNewColumnsIfNeeded(db);
  
  // Create index for duplicate detection on normalized first_name + last_name
  // This index is created AFTER ensuring columns exist
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leads_first_last_name
      ON leads (first_name COLLATE NOCASE, last_name COLLATE NOCASE)
    `);
  } catch (error: any) {
    console.warn('⚠️ Could not create first_last_name index:', error.message);
  }
  
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_leads_updated_at
      ON leads (updated_at)
    `);
  } catch (error: any) {
    console.warn('⚠️ Could not create updated_at index:', error.message);
  }
  
  // Migrate existing data to populate first_name and last_name from additional_data
  migrateExistingLeads(db);
}

/**
 * Add new columns to existing leads table if they don't exist
 */
function addNewColumnsIfNeeded(db: ReturnType<typeof SQLiteDatabase>): void {
  const columns = db.prepare("PRAGMA table_info(leads)").all() as any[];
  const columnNames = columns.map(col => col.name);
  
  // Note: SQLite doesn't allow non-constant defaults (like CURRENT_TIMESTAMP) when adding columns
  // So we use NULL default for updated_at and set it via trigger or application logic
  const newColumns = [
    { name: 'first_name', definition: 'TEXT' },
    { name: 'last_name', definition: 'TEXT' },
    { name: 'source', definition: "TEXT DEFAULT 'submission'" },
    { name: 'updated_at', definition: 'TIMESTAMP' }, // No default - SQLite limitation
    { name: 'submission_count', definition: 'INTEGER DEFAULT 1' }
  ];
  
  for (const col of newColumns) {
    if (!columnNames.includes(col.name)) {
      try {
        db.exec(`ALTER TABLE leads ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`✅ Added column '${col.name}' to leads table`);
      } catch (error: any) {
        if (!error.message.includes('duplicate column name')) {
          console.error(`❌ Error adding column '${col.name}':`, error.message);
        }
      }
    }
  }
}

/**
 * Migrate existing leads to populate first_name and last_name from additional_data
 */
function migrateExistingLeads(db: ReturnType<typeof SQLiteDatabase>): void {
  try {
    // Check if first_name column exists before attempting migration
    const columns = db.prepare("PRAGMA table_info(leads)").all() as any[];
    const columnNames = columns.map(col => col.name);
    
    if (!columnNames.includes('first_name')) {
      console.log('⏭️ Skipping lead migration: first_name column does not exist');
      return;
    }
    
    // Find leads that have additional_data but no first_name/last_name
    const leadsToMigrate = db.prepare(`
      SELECT id, name, additional_data 
      FROM leads 
      WHERE (first_name IS NULL OR first_name = '') 
        AND additional_data IS NOT NULL
    `).all() as any[];
    
    if (leadsToMigrate.length === 0) {
      return;
    }
    
    console.log(`🔄 Migrating ${leadsToMigrate.length} leads to populate first_name/last_name...`);
    
    // Check if updated_at column exists to decide which UPDATE statement to use
    const hasUpdatedAt = columnNames.includes('updated_at');
    
    const updateStmt = hasUpdatedAt 
      ? db.prepare(`
          UPDATE leads 
          SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `)
      : db.prepare(`
          UPDATE leads 
          SET first_name = ?, last_name = ?
          WHERE id = ?
        `);
    
    let migrated = 0;
    for (const lead of leadsToMigrate) {
      try {
        let firstName = '';
        let lastName = '';
        
        // Try to extract from additional_data JSON
        if (lead.additional_data) {
          const data = JSON.parse(lead.additional_data);
          firstName = data.personal_data?.first_name || data.first_name || '';
          lastName = data.personal_data?.last_name || data.last_name || '';
        }
        
        // Fallback: parse from full name if available
        if (!firstName && !lastName && lead.name) {
          const nameParts = lead.name.trim().split(/\s+/);
          if (nameParts.length >= 2) {
            lastName = nameParts.pop() || '';
            firstName = nameParts.join(' ');
          } else if (nameParts.length === 1) {
            firstName = nameParts[0];
          }
        }
        
        if (firstName || lastName) {
          updateStmt.run(firstName, lastName, lead.id);
          migrated++;
        }
      } catch (parseError) {
        // Skip leads with invalid JSON
        console.warn(`⚠️ Could not migrate lead ${lead.id}: invalid additional_data`);
      }
    }
    
    if (migrated > 0) {
      console.log(`✅ Migrated ${migrated} leads with first_name/last_name`);
    }
  } catch (error) {
    console.error('❌ Error migrating existing leads:', error);
  }
}
