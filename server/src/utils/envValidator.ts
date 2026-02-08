/**
 * Environment Variable Validation Utility
 * Ensures all required environment variables are set with proper validation
 */

import crypto from 'crypto';

interface EnvConfig {
  [key: string]: {
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'array';
    minLength?: number;
    validate?: (value: any) => boolean;
    description: string;
    default?: any;
  };
}

const ENV_CONFIG: EnvConfig = {
  // Security
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'JWT signing secret (minimum 32 characters)'
  },
  SESSION_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    description: 'Session encryption secret (minimum 32 characters)'
  },
  ENCRYPTION_KEY: {
    required: true,
    type: 'string',
    minLength: 32,
    validate: (value: string) => value.length === 32 && /^[0-9a-fA-F]+$/.test(value),
    description: 'AES encryption key (exactly 32 hex characters)'
  },
  ENCRYPTION_IV: {
    required: true,
    type: 'string',
    minLength: 16,
    validate: (value: string) => value.length === 16 && /^[0-9a-fA-F]+$/.test(value),
    description: 'AES initialization vector (exactly 16 hex characters)'
  },
  
  // Admin Credentials
  ADMIN_USERNAME: {
    required: true,
    type: 'string',
    minLength: 3,
    description: 'Admin username (minimum 3 characters)'
  },
  ADMIN_PASSWORD: {
    required: true,
    type: 'string',
    minLength: 8,
    description: 'Admin password (minimum 8 characters)'
  },
  ADMIN_EMAIL: {
    required: true,
    type: 'string',
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    description: 'Admin email address'
  },
  
  // Database
  DB_PATH: {
    required: false,
    type: 'string',
    default: './data/database.sqlite',
    description: 'SQLite database file path'
  },
  
  // Server
  PORT: {
    required: false,
    type: 'number',
    default: 3001,
    validate: (value: number) => value > 0 && value < 65536,
    description: 'Server port number'
  },
  NODE_ENV: {
    required: false,
    type: 'string',
    default: 'development',
    validate: (value: string) => ['development', 'production', 'test'].includes(value),
    description: 'Node environment'
  },
  
  // CORS
  CORS_ORIGIN: {
    required: false,
    type: 'array',
    default: ['http://localhost:5173', 'http://localhost:5174'],
    description: 'Allowed CORS origins (comma-separated)'
  },
  
  // Email
  EMAIL_HOST: {
    required: false,
    type: 'string',
    default: 'smtp.example.com',
    description: 'SMTP server host'
  },
  EMAIL_PORT: {
    required: false,
    type: 'number',
    default: 587,
    validate: (value: number) => value > 0 && value < 65536,
    description: 'SMTP server port'
  },
  EMAIL_SECURE: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Use SSL/TLS for SMTP'
  },
  EMAIL_USER: {
    required: false,
    type: 'string',
    default: '',
    description: 'SMTP username'
  },
  EMAIL_PASS: {
    required: false,
    type: 'string',
    default: '',
    description: 'SMTP password'
  },
  EMAIL_FROM: {
    required: false,
    type: 'string',
    default: 'no-reply@multibanking-panel.com',
    description: 'Default from email address'
  },
  
  
  // Session Configuration
  SESSION_EXPIRE_HOURS: {
    required: false,
    type: 'number',
    default: 24,
    validate: (value: number) => value > 0 && value <= 168, // Max 1 week
    description: 'Session expiration time in hours'
  },
  
  // File Upload
  UPLOAD_DIR: {
    required: false,
    type: 'string',
    default: './uploads',
    description: 'File upload directory'
  },
  MAX_FILE_SIZE: {
    required: false,
    type: 'number',
    default: 10485760, // 10MB
    description: 'Maximum file upload size in bytes'
  },
  
  // Security
  TRUST_PROXY: {
    required: false,
    type: 'boolean',
    default: false,
    description: 'Trust proxy headers'
  },
  
  // Logging
  LOG_LEVEL: {
    required: false,
    type: 'string',
    default: 'info',
    validate: (value: string) => ['error', 'warn', 'info', 'debug'].includes(value),
    description: 'Logging level'
  }
};

class EnvironmentValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validate all environment variables
   */
  validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    this.errors = [];
    this.warnings = [];

    // Check for required variables
    for (const [key, config] of Object.entries(ENV_CONFIG)) {
      const value = process.env[key];

      if (config.required && (!value || value.trim() === '')) {
        this.errors.push(`Missing required environment variable: ${key} - ${config.description}`);
        continue;
      }

      if (value) {
        this.validateValue(key, value, config);
      } else if (!config.required && config.default === undefined) {
        this.warnings.push(`Optional environment variable not set: ${key} - ${config.description}`);
      }
    }

    // Check for insecure development values in production
    if (process.env.NODE_ENV === 'production') {
      this.checkProductionSecurity();
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate individual environment variable value
   */
  private validateValue(key: string, value: string, config: any): void {
    // Type validation
    switch (config.type) {
      case 'number':
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
          this.errors.push(`${key} must be a valid number, got: ${value}`);
          return;
        }
        if (config.validate && !config.validate(numValue)) {
          this.errors.push(`${key} validation failed: ${config.description}`);
        }
        break;

      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          this.errors.push(`${key} must be a boolean (true/false), got: ${value}`);
        }
        break;

      case 'array':
        // Arrays are comma-separated strings
        if (value.includes(',')) {
          const arrayValue = value.split(',').map(v => v.trim());
          if (config.validate && !config.validate(arrayValue)) {
            this.errors.push(`${key} validation failed: ${config.description}`);
          }
        }
        break;

      case 'string':
      default:
        if (config.minLength && value.length < config.minLength) {
          this.errors.push(`${key} must be at least ${config.minLength} characters long`);
        }
        if (config.validate && !config.validate(value)) {
          this.errors.push(`${key} validation failed: ${config.description}`);
        }
        break;
    }
  }

  /**
   * Check for production security issues
   */
  private checkProductionSecurity(): void {
    const insecurePatterns = [
      'password',
      'secret',
      'admin',
      'test',
      'example',
      'localhost',
      '127.0.0.1'
    ];

    const sensitiveVars = ['JWT_SECRET', 'SESSION_SECRET', 'ADMIN_PASSWORD', 'ENCRYPTION_KEY'];

    for (const varName of sensitiveVars) {
      const value = process.env[varName]?.toLowerCase();
      if (value) {
        for (const pattern of insecurePatterns) {
          if (value.includes(pattern)) {
            this.errors.push(`Production security issue: ${varName} appears to contain insecure value`);
            break;
          }
        }
      }
    }

    // Check for development URLs in production
    if (process.env.CORS_ORIGIN?.includes('localhost')) {
      this.warnings.push('Production warning: CORS_ORIGIN contains localhost URLs');
    }
  }

  /**
   * Generate secure random values for missing secrets
   */
  static generateSecrets(): { [key: string]: string } {
    return {
      JWT_SECRET: crypto.randomBytes(32).toString('hex'),
      SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
      ENCRYPTION_IV: crypto.randomBytes(16).toString('hex'),
      ADMIN_PASSWORD: crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 12)
    };
  }

  /**
   * Get typed environment variable with validation
   */
  static getEnv<T>(key: string, defaultValue?: T): T {
    const config = ENV_CONFIG[key];
    const value = process.env[key];

    if (!value) {
      if (config?.default !== undefined) {
        return config.default as T;
      }
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      if (config?.required) {
        throw new Error(`Required environment variable ${key} is not set`);
      }
    }

    if (!value) return defaultValue as T;

    // Type conversion
    switch (config?.type) {
      case 'number':
        return parseInt(value, 10) as T;
      case 'boolean':
        return (['true', '1'].includes(value.toLowerCase())) as T;
      case 'array':
        return value.split(',').map(v => v.trim()) as T;
      default:
        return value as T;
    }
  }
}

export { EnvironmentValidator, ENV_CONFIG };
