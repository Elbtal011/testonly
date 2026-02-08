import SQLiteDatabase from 'better-sqlite3';
import { getDb } from '../index';
import fs from 'fs';
import path from 'path';

export interface VolksbankBranch {
  id: number;
  branch_name: string;
  city: string;
  zip_code: string;
  section: string;
  search_text: string;
  created_at: number;
}

export function createVolksbankBranchesTable(db: ReturnType<typeof SQLiteDatabase>): void {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS volksbank_branches (
      id INTEGER PRIMARY KEY,
      branch_name TEXT NOT NULL,
      city TEXT NOT NULL,
      zip_code TEXT NOT NULL,
      section TEXT NOT NULL,
      search_text TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `;
  
  db.exec(createTableSQL);
  
  // Create indexes for better search performance
  db.exec('CREATE INDEX IF NOT EXISTS idx_volksbank_branches_search ON volksbank_branches(search_text)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_volksbank_branches_city ON volksbank_branches(city)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_volksbank_branches_zip ON volksbank_branches(zip_code)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_volksbank_branches_name ON volksbank_branches(branch_name)');
}

export function initVolksbankBranchesTable(): void {
  const db = getDb();
  
  // Create the table first
  createVolksbankBranchesTable(db);
  
  // Check if table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM volksbank_branches').get() as { count: number };
  
  if (count.count === 0) {
    console.log('Volksbank branches table is empty, importing data...');
    
    try {
      // Read the JSON file
      const jsonPath = path.join(__dirname, '../../data/volksbank_branches.json');
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      const branches: VolksbankBranch[] = JSON.parse(jsonData);
      
      console.log(`Found ${branches.length} Volksbank branches to import`);
      
      // Prepare insert statement
      const insertStmt = db.prepare(`
        INSERT INTO volksbank_branches (id, branch_name, city, zip_code, section, search_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Begin transaction for better performance
      const insertMany = (db as any).transaction((branches: VolksbankBranch[]) => {
        for (const branch of branches) {
          insertStmt.run(
            branch.id,
            branch.branch_name,
            branch.city,
            branch.zip_code,
            branch.section,
            branch.search_text,
            branch.created_at
          );
        }
      });
      
      // Execute the transaction
      insertMany(branches);
      
      console.log(`Successfully imported ${branches.length} Volksbank branches`);
      
    } catch (error) {
      console.error('Error importing Volksbank branches:', error);
    }
  } else {
    console.log(`Volksbank branches table already has ${count.count} entries`);
  }
}

export function searchVolksbankBranches(query: string, limit: number = 10): VolksbankBranch[] {
  const db = getDb();
  
  // Normalize the search query
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return [];
  }
  
  // Multi-criteria search with ranking
  const searchSQL = `
    SELECT *,
      CASE 
        -- Exact city match gets highest priority
        WHEN LOWER(city) = ? THEN 100
        -- Exact zip code match
        WHEN zip_code = ? THEN 95
        -- City starts with query
        WHEN LOWER(city) LIKE ? || '%' THEN 90
        -- Branch name starts with query
        WHEN LOWER(branch_name) LIKE ? || '%' THEN 85
        -- City contains query
        WHEN LOWER(city) LIKE '%' || ? || '%' THEN 80
        -- Branch name contains query
        WHEN LOWER(branch_name) LIKE '%' || ? || '%' THEN 75
        -- Search text contains query
        WHEN search_text LIKE '%' || ? || '%' THEN 70
        -- Zip code starts with query
        WHEN zip_code LIKE ? || '%' THEN 65
        ELSE 60
      END as rank
    FROM volksbank_branches 
    WHERE search_text LIKE '%' || ? || '%'
       OR LOWER(city) LIKE '%' || ? || '%'
       OR LOWER(branch_name) LIKE '%' || ? || '%'
       OR zip_code LIKE '%' || ? || '%'
    ORDER BY rank DESC, city ASC, branch_name ASC
    LIMIT ?
  `;
  
  const results = db.prepare(searchSQL).all(
    normalizedQuery, // exact city match
    normalizedQuery, // exact zip match
    normalizedQuery, // city starts with
    normalizedQuery, // branch name starts with
    normalizedQuery, // city contains
    normalizedQuery, // branch name contains
    normalizedQuery, // search text contains
    normalizedQuery, // zip starts with
    normalizedQuery, // search text wildcard
    normalizedQuery, // city wildcard
    normalizedQuery, // branch name wildcard
    normalizedQuery, // zip wildcard
    limit
  ) as VolksbankBranch[];
  
  return results;
}
