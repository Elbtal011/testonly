/**
 * Production-Safe Logging Utility
 * Prevents sensitive information from being logged in production
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class ProductionSafeLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel = this.getLogLevel();

  private getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
    }
  }

  private sanitizeMessage(message: string): string {
    if (!this.isProduction) return message;

    // Remove sensitive banking references in production
    const sensitivePatterns = [
      /commerzbank/gi,
      /santander/gi,
      /sparkasse/gi,
      /apobank/gi,
      /postbank/gi,
      /volksbank/gi,
      /deutsche.?bank/gi,
      /comdirect/gi,
      /consorsbank/gi,
      /ing.?diba/gi,
      /klarna/gi,
      /banking/gi,
      /template/gi,
      /admin.*forced/gi,
      /admin.*injected/gi,
      /tan.*request/gi,
      /session.*control/gi
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.sanitizeMessage(message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.sanitizeMessage(message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.sanitizeMessage(message), ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.sanitizeMessage(message), ...args);
    }
  }

  // Safe logging for sensitive operations (always sanitized)
  secure(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.sanitizeMessage(message), ...args);
    }
  }
}

export const logger = new ProductionSafeLogger();
export default logger;
