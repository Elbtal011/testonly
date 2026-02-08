declare module 'better-sqlite3' {
  interface Statement {
    run(...params: any[]): { lastInsertRowid: number; changes: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(pragma: string, options?: any): any;
    close(): void;
  }

  interface DatabaseConstructor {
    new(filename: string, options?: any): Database;
    (filename: string, options?: any): Database;
  }

  const Database: DatabaseConstructor;
  export default Database;
}

// Add type definitions for express-rate-limit
declare module 'express-rate-limit' {
  import { RequestHandler } from 'express';
  
  interface Options {
    windowMs?: number;
    max?: number;
    message?: string | object;
    statusCode?: number;
    headers?: boolean;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    keyGenerator?: (req: any) => string;
    handler?: (req: any, res: any, next: any) => void;
    onLimitReached?: (req: any, res: any, options: Options) => void;
    draft_polli_ratelimit_headers?: boolean;
  }
  
  function rateLimit(options?: Options): RequestHandler;
  
  export = rateLimit;
}
