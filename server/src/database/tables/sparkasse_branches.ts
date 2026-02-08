import SQLiteDatabase from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function initSparkasseBranchesTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create sparkasse_branches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sparkasse_branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      url TEXT,
      search_text TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // Create indexes for branch search performance
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sparkasse_city ON sparkasse_branches(city)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sparkasse_zip ON sparkasse_branches(zip_code)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sparkasse_search ON sparkasse_branches(search_text)`);
  
  // Check if we need to import branch data
  const branchCount = db.prepare('SELECT COUNT(*) as count FROM sparkasse_branches').get() as { count: number };
  
  if (branchCount.count === 0) {
    console.log('📊 No Sparkasse branches found, importing default data...');
    
    try {
      // Load branch data from JSON file
      const branchDataPath = path.join(__dirname, '../../data/sparkasse-branches.json');
      const branchData = JSON.parse(fs.readFileSync(branchDataPath, 'utf8'));
      
      importSparkasseBranches(db, branchData);
      console.log('✅ Sparkasse branch data imported successfully');
    } catch (error) {
      console.error('❌ Error importing Sparkasse branch data:', error);
    }
  }
  
  console.log('✅ Sparkasse branches table initialized with indexes');
}

/**
 * Search Sparkasse branches by query (city, branch name, or ZIP code)
 */
export function searchSparkasseBranches(db: ReturnType<typeof SQLiteDatabase>, query: string, limit: number = 10) {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = query.trim().toLowerCase();
  
  // Multi-field search with ranking:
  // 1. Exact ZIP code match (highest priority)
  // 2. City name starts with query
  // 3. Branch name contains query
  const sql = `
    SELECT id, city, branch_name, zip_code, url,
      CASE 
        WHEN zip_code = ? THEN 1
        WHEN LOWER(city) LIKE ? THEN 2
        WHEN LOWER(branch_name) LIKE ? THEN 3
        WHEN LOWER(search_text) LIKE ? THEN 4
        ELSE 5
      END as rank
    FROM sparkasse_branches 
    WHERE zip_code = ? 
       OR LOWER(city) LIKE ? 
       OR LOWER(branch_name) LIKE ? 
       OR LOWER(search_text) LIKE ?
    ORDER BY rank, city, branch_name
    LIMIT ?
  `;
  
  const exactZip = searchTerm;
  const cityStartsWith = searchTerm + '%';
  const branchContains = '%' + searchTerm + '%';
  const searchContains = '%' + searchTerm + '%';
  
  return db.prepare(sql).all(
    exactZip, cityStartsWith, branchContains, searchContains,
    exactZip, cityStartsWith, branchContains, searchContains,
    limit
  );
}

/**
 * Get Sparkasse branch by ID
 */
export function getSparkasseBranchById(db: ReturnType<typeof SQLiteDatabase>, id: number) {
  return db.prepare('SELECT * FROM sparkasse_branches WHERE id = ?').get(id);
}

/**
 * Import Sparkasse branch data
 */
export function importSparkasseBranches(db: ReturnType<typeof SQLiteDatabase>, branchesData: any[]) {
  if (!Array.isArray(branchesData)) {
    throw new Error('Branch data must be an array');
  }
  
  console.log(`📊 Importing ${branchesData.length} Sparkasse branches...`);
  
  // Clear existing data first
  db.prepare('DELETE FROM sparkasse_branches').run();
  
  // Prepare insert statement
  const stmt = db.prepare(`
    INSERT INTO sparkasse_branches (city, branch_name, zip_code, url, search_text)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  let imported = 0;
  let errors = 0;
  
  // Insert each branch
  for (const branch of branchesData) {
    try {
      const searchText = `${branch.city} ${branch.branch_name} ${branch.zip_code}`.toLowerCase();
      
      stmt.run(
        branch.city,
        branch.branch_name,
        branch.zip_code,
        branch.url || '',
        searchText
      );
      
      imported++;
    } catch (error) {
      console.error(`Error importing branch:`, error);
      errors++;
    }
  }
  
  console.log(`✅ Sparkasse branch import completed: ${imported} imported, ${errors} errors`);
  return { imported, errors };
}
