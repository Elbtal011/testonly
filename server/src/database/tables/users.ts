import SQLiteDatabase from 'better-sqlite3';
import { config } from '../../config';

export function initUserTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      is_admin BOOLEAN NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )
  `);
  
  // Check if an admin user exists, if not create one from environment variables
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1').get() as { count: number };
  
  if (adminCount.count === 0) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync(config.admin.password, 12); // Increased rounds for security
    
    db.prepare(`
      INSERT INTO users (username, password, email, is_admin)
      VALUES (?, ?, ?, ?)
    `).run(config.admin.username, hashedPassword, config.admin.email, 1);
    
    console.log(`✅ Created admin user: ${config.admin.username}`);
  } else {
    // ALWAYS update existing admin user with credentials from environment variables
    const existingAdmin = db.prepare('SELECT * FROM users WHERE is_admin = 1 LIMIT 1').get() as any;
    
    if (existingAdmin) {
      console.log(`🔄 Updating admin user credentials from environment variables`);
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync(config.admin.password, 12);
      
      db.prepare(`
        UPDATE users 
        SET username = ?, password = ?, email = ? 
        WHERE id = ?
      `).run(config.admin.username, hashedPassword, config.admin.email, existingAdmin.id);
      
      console.log(`✅ Admin user updated: ${config.admin.username} with password from environment`);
    }
  }
}
