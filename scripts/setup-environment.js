#!/usr/bin/env node

/**
 * Environment Setup Script
 * Generates secure environment variables and creates .env files
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generatePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function setupEnvironment() {
  console.log('🔧 Multi-Banking Panel - Environment Setup');
  console.log('==========================================\n');

  // Generate secure keys
  const jwtSecret = generateSecureKey(64);
  const sessionSecret = generateSecureKey(64);
  const encryptionKey = crypto.randomBytes(16).toString('hex'); // 32 hex chars = 16 bytes
  const encryptionIV = crypto.randomBytes(8).toString('hex'); // 16 hex chars = 8 bytes
  const mailerJwtSecret = generateSecureKey(64);
  const adminPassword = generatePassword(16);

  console.log('🔐 Generated secure keys:');
  console.log(`JWT Secret: ${jwtSecret.substring(0, 16)}...`);
  console.log(`Session Secret: ${sessionSecret.substring(0, 16)}...`);
  console.log(`Encryption Key: ${encryptionKey.substring(0, 16)}...`);
  console.log(`Admin Password: ${adminPassword}\n`);

  // Get user input
  const adminUsername = await question('👤 Admin username (default: admin): ') || 'admin';
  const adminEmail = await question('📧 Admin email: ') || 'admin@example.com';
  const serverPort = await question('🌐 Server port (default: 3001): ') || '3001';
  const mailerPort = await question('📮 Mailer service port (default: 3002): ') || '3002';
  const corsOrigin = await question('🔗 CORS origins (comma-separated, default: localhost URLs): ') || 'http://localhost:5173,http://localhost:5174';
  
  console.log('\n📧 Email Configuration (optional - press Enter to skip):');
  const emailHost = await question('SMTP Host: ') || 'smtp.example.com';
  const emailPort = await question('SMTP Port (default: 587): ') || '587';
  const emailUser = await question('SMTP Username: ') || '';
  const emailPass = await question('SMTP Password: ') || '';
  const emailFrom = await question('From Email: ') || 'no-reply@multibanking-panel.com';

  console.log('\n🔌 Resend API Configuration (optional):');
  const resendApiKey = await question('Resend API Key: ') || '';

  rl.close();

  // Create main server .env file
  const mainEnvContent = `# Multi-Banking Panel - Main Server Environment
# Generated on ${new Date().toISOString()}

# ==============================================
# SECURITY CONFIGURATION
# ==============================================
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}
ENCRYPTION_KEY=${encryptionKey}
ENCRYPTION_IV=${encryptionIV}

# ==============================================
# ADMIN CONFIGURATION
# ==============================================
ADMIN_USERNAME=${adminUsername}
ADMIN_PASSWORD=${adminPassword}
ADMIN_EMAIL=${adminEmail}

# ==============================================
# SERVER CONFIGURATION
# ==============================================
PORT=${serverPort}
NODE_ENV=development
SERVER_URL=http://localhost:${serverPort}

# ==============================================
# DATABASE CONFIGURATION
# ==============================================
DB_PATH=./data/database.sqlite

# ==============================================
# CORS CONFIGURATION
# ==============================================
CORS_ORIGIN=${corsOrigin}

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ==============================================
# EMAIL CONFIGURATION
# ==============================================
EMAIL_HOST=${emailHost}
EMAIL_PORT=${emailPort}
EMAIL_SECURE=false
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}
EMAIL_FROM=${emailFrom}

# ==============================================
# FILE UPLOAD CONFIGURATION
# ==============================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# ==============================================
# SESSION CONFIGURATION
# ==============================================
SESSION_EXPIRE_HOURS=24

# ==============================================
# SECURITY SETTINGS
# ==============================================
TRUST_PROXY=false
TRUSTED_PROXIES=

# ==============================================
# LOGGING CONFIGURATION
# ==============================================
LOG_LEVEL=info
LOG_FILE=./logs/app.log
`;

  // Create mailer service .env file
  const mailerEnvContent = `# Multi-Banking Panel - Mailer Service Environment
# Generated on ${new Date().toISOString()}

# ==============================================
# MAILER SERVICE CONFIGURATION
# ==============================================
PORT=${mailerPort}
NODE_ENV=development
MAILER_URL=http://localhost:${mailerPort}

# ==============================================
# SECURITY CONFIGURATION
# ==============================================
JWT_SECRET=${mailerJwtSecret}

# ==============================================
# RESEND API CONFIGURATION
# ==============================================
RESEND_API_KEY=${resendApiKey}

# ==============================================
# CAMPAIGN CONFIGURATION
# ==============================================
CAMPAIGN_BATCH_SIZE=100
CAMPAIGN_RATE_LIMIT=10
CAMPAIGN_RETRY_ATTEMPTS=3
CAMPAIGN_RETRY_DELAY=5000

# ==============================================
# EMAIL CONFIGURATION
# ==============================================
DEFAULT_FROM_NAME=Multi-Banking Panel
DEFAULT_FROM_EMAIL=${emailFrom}

# ==============================================
# CORS CONFIGURATION
# ==============================================
CORS_ORIGIN=${corsOrigin}

# ==============================================
# LOGGING CONFIGURATION
# ==============================================
LOG_LEVEL=info
LOG_FILE=./logs/mailer.log

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
`;

  // Write .env files
  const rootDir = path.join(__dirname, '..');
  const serverDir = path.join(rootDir, 'server');
  const mailerDir = path.join(rootDir, 'mailer-service');

  // Main server .env
  fs.writeFileSync(path.join(rootDir, '.env'), mainEnvContent);
  fs.writeFileSync(path.join(serverDir, '.env'), mainEnvContent);

  // Mailer service .env
  if (fs.existsSync(mailerDir)) {
    fs.writeFileSync(path.join(mailerDir, '.env'), mailerEnvContent);
  }

  console.log('\n✅ Environment files created successfully!');
  console.log('📁 Files created:');
  console.log(`   - ${path.join(rootDir, '.env')}`);
  console.log(`   - ${path.join(serverDir, '.env')}`);
  if (fs.existsSync(mailerDir)) {
    console.log(`   - ${path.join(mailerDir, '.env')}`);
  }

  console.log('\n🔐 IMPORTANT SECURITY NOTES:');
  console.log('   - Keep your .env files secure and never commit them to version control');
  console.log('   - Change the admin password after first login');
  console.log('   - Use strong, unique secrets in production');
  console.log(`   - Admin credentials: ${adminUsername} / ${adminPassword}`);
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Review the generated .env files');
  console.log('   2. Install dependencies: npm install');
  console.log('   3. Start the servers: npm run dev');
  console.log('   4. Access admin panel: http://localhost:' + serverPort + '/admin');
}

// Run the setup
setupEnvironment().catch(console.error);
