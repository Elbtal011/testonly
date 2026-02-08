#!/usr/bin/env node

/**
 * Session Migration Script
 * Migrates any existing global session data to the new database-backed system
 */

import fs from 'fs';
import path from 'path';
import SQLite from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateSessions() {
  console.log('🔄 Session Migration Script');
  console.log('============================\n');

  const dbPath = process.env.DB_PATH || './server/data/database.sqlite';
  
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file not found. Please run the server first to initialize the database.');
    process.exit(1);
  }

  const db = new SQLite(dbPath);
  
  // Check if sessions table exists
  const tablesResult = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'").get();
  
  if (!tablesResult) {
    console.log('❌ Sessions table not found. Please update your database schema first.');
    process.exit(1);
  }

  // Clean up any existing expired sessions
  const cleanupResult = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  console.log(`🧹 Cleaned up ${cleanupResult.changes} expired sessions`);

  // Get session statistics
  const stats = {
    total: db.prepare('SELECT COUNT(*) as count FROM sessions').get().count,
    active: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now") AND is_completed = 0').get().count,
    completed: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_completed = 1').get().count,
    expired: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at <= datetime("now")').get().count
  };

  console.log('📊 Current session statistics:');
  console.log(`   - Total sessions: ${stats.total}`);
  console.log(`   - Active sessions: ${stats.active}`);
  console.log(`   - Completed sessions: ${stats.completed}`);
  console.log(`   - Expired sessions: ${stats.expired}`);

  // Check for any old session files (if they exist)
  const oldSessionFiles = [
    './server/sessions.json',
    './sessions.json',
    './data/sessions.json'
  ];

  let migratedCount = 0;
  
  for (const sessionFile of oldSessionFiles) {
    if (fs.existsSync(sessionFile)) {
      console.log(`\n📁 Found old session file: ${sessionFile}`);
      
      try {
        const oldSessions = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
        
        for (const [sessionKey, sessionData] of Object.entries(oldSessions)) {
          // Check if session already exists in database
          const existingSession = db.prepare('SELECT id FROM sessions WHERE session_key = ?').get(sessionKey);
          
          if (!existingSession && sessionData && typeof sessionData === 'object') {
            // Create new session record
            const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours from now
            
            const result = db.prepare(`
              INSERT INTO sessions (
                session_key, template_name, current_state, session_data, 
                created_at, updated_at, expires_at, is_completed
              ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), ?, ?)
            `).run(
              sessionKey,
              sessionData.template_name || 'unknown',
              sessionData.current_state || 'unknown',
              JSON.stringify(sessionData),
              expiresAt.toISOString(),
              sessionData.completed ? 1 : 0
            );
            
            if (result.changes > 0) {
              migratedCount++;
              console.log(`   ✅ Migrated session: ${sessionKey}`);
            }
          }
        }
        
        // Backup and remove old file
        const backupFile = sessionFile + '.backup.' + Date.now();
        fs.renameSync(sessionFile, backupFile);
        console.log(`   📦 Backed up old file to: ${backupFile}`);
        
      } catch (error) {
        console.log(`   ❌ Error processing ${sessionFile}:`, error.message);
      }
    }
  }

  if (migratedCount > 0) {
    console.log(`\n✅ Successfully migrated ${migratedCount} sessions to the database`);
  } else {
    console.log('\n✅ No old sessions found to migrate');
  }

  // Final statistics
  const finalStats = {
    total: db.prepare('SELECT COUNT(*) as count FROM sessions').get().count,
    active: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now") AND is_completed = 0').get().count,
    completed: db.prepare('SELECT COUNT(*) as count FROM sessions WHERE is_completed = 1').get().count
  };

  console.log('\n📊 Updated session statistics:');
  console.log(`   - Total sessions: ${finalStats.total}`);
  console.log(`   - Active sessions: ${finalStats.active}`);
  console.log(`   - Completed sessions: ${finalStats.completed}`);

  db.close();
  console.log('\n🎉 Session migration completed successfully!');
}

// Run the migration
migrateSessions().catch(console.error);
