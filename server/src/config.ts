// Configuration settings for the application
import { EnvironmentValidator } from './utils/envValidator';

// Validate environment variables on startup
const envValidator = new EnvironmentValidator();
const validation = envValidator.validate();

if (!validation.isValid) {
  console.error('❌ Environment validation failed:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
  
  if (process.env.NODE_ENV === 'production') {
    console.error('Exiting due to environment validation failures in production');
    process.exit(1);
  } else {
    console.warn('⚠️  Continuing with validation errors in development mode');
  }
}

if (validation.warnings.length > 0) {
  console.warn('⚠️  Environment warnings:');
  validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

export const config = {
  // JWT configuration
  jwt: {
    secret: EnvironmentValidator.getEnv<string>('JWT_SECRET'),
    expiresIn: '12h'
  },
  
  // Session configuration
  session: {
    secret: EnvironmentValidator.getEnv<string>('SESSION_SECRET'),
    expireHours: EnvironmentValidator.getEnv<number>('SESSION_EXPIRE_HOURS', 24)
  },
  
  // Encryption configuration
  encryption: {
    key: EnvironmentValidator.getEnv<string>('ENCRYPTION_KEY'),
    iv: EnvironmentValidator.getEnv<string>('ENCRYPTION_IV')
  },
  
  // Database configuration
  database: {
    path: EnvironmentValidator.getEnv<string>('DB_PATH', './data/database.sqlite')
  },
  
  // Admin configuration
  admin: {
    username: EnvironmentValidator.getEnv<string>('ADMIN_USERNAME'),
    password: EnvironmentValidator.getEnv<string>('ADMIN_PASSWORD'),
    email: EnvironmentValidator.getEnv<string>('ADMIN_EMAIL')
  },
  
  // Server configuration
  server: {
    port: EnvironmentValidator.getEnv<number>('PORT', 3001),
    nodeEnv: EnvironmentValidator.getEnv<string>('NODE_ENV', 'development'),
    trustProxy: EnvironmentValidator.getEnv<boolean>('TRUST_PROXY', false)
  },
  
  // CORS settings
  cors: {
    origin: EnvironmentValidator.getEnv<string[]>('CORS_ORIGIN', ['http://localhost:5173', 'http://localhost:5174']),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Email server configuration
  email: {
    host: EnvironmentValidator.getEnv<string>('EMAIL_HOST', 'smtp.example.com'),
    port: EnvironmentValidator.getEnv<number>('EMAIL_PORT', 587),
    secure: EnvironmentValidator.getEnv<boolean>('EMAIL_SECURE', false),
    auth: {
      user: EnvironmentValidator.getEnv<string>('EMAIL_USER', ''),
      pass: EnvironmentValidator.getEnv<string>('EMAIL_PASS', '')
    },
    defaultFrom: EnvironmentValidator.getEnv<string>('EMAIL_FROM', 'no-reply@multibanking-panel.com')
  },
  
  // File upload configuration
  upload: {
    directory: EnvironmentValidator.getEnv<string>('UPLOAD_DIR', './uploads'),
    maxSize: EnvironmentValidator.getEnv<number>('MAX_FILE_SIZE', 10485760), // 10MB
    allowedTypes: EnvironmentValidator.getEnv<string>('ALLOWED_FILE_TYPES', 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,application/pdf').split(',')
  },
  
  // Logging configuration
  logging: {
    level: EnvironmentValidator.getEnv<string>('LOG_LEVEL', 'info')
  },
  
  // Anti-bot protection configuration
  antiBot: {
    enabled: EnvironmentValidator.getEnv<boolean>('ENABLE_ANTIBOT', true),
    headerThreshold: EnvironmentValidator.getEnv<number>('ANTIBOT_HEADER_THRESHOLD', 4),
    cloaking: EnvironmentValidator.getEnv<boolean>('ENABLE_CLOAKING', true),
    scheduledCloaking: EnvironmentValidator.getEnv<boolean>('ENABLE_SCHEDULED_CLOAKING', false),
    scheduledHours: EnvironmentValidator.getEnv<string>('SCHEDULED_HOURS', '9-17'),
    geoFiltering: EnvironmentValidator.getEnv<boolean>('ENABLE_GEO_FILTER', false),
    allowedCountries: EnvironmentValidator.getEnv<string>('ALLOWED_COUNTRIES', 'DE,AT,CH').split(',').map(c => c.trim()),
    referrerCheck: EnvironmentValidator.getEnv<boolean>('ENABLE_REFERRER_CHECK', false),
    allowedReferrers: EnvironmentValidator.getEnv<string>('ALLOWED_REFERRERS', '').split(',').filter(Boolean),
    allowEmptyReferrer: EnvironmentValidator.getEnv<boolean>('ALLOW_EMPTY_REFERRER', true),
    crawlerPatternsPath: EnvironmentValidator.getEnv<string>('CRAWLER_PATTERNS_PATH', './src/data/crawler-user-agents.json')
  }
};
