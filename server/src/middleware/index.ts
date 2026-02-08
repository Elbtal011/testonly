import { Express, Request, Response, NextFunction } from 'express';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import cors from 'cors';

// Set up all middleware for the application
export function setupMiddleware(app: Express): void {
  // Security headers to hide server identity
  app.use((req, res, next) => {
    // Remove server identification headers
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'Apache/2.4.41 (Ubuntu)'); // Mimic Apache server
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  });

  // Apply CORS middleware
  const corsOptions = {
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: true
  };
  app.use(cors(corsOptions));

  // Apply request logging middleware (only in development)
  if (process.env.NODE_ENV !== 'production') {
    app.use(requestLogger);
  }
  
  // Apply error handling middleware
  app.use(errorHandler);
}

// Authentication middleware
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(401).json({ message: 'Authorization header required' });
    return;
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    res.status(401).json({ message: 'Bearer token not found' });
    return;
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Admin authorization middleware
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }
  
  if (!user.isAdmin) {
    res.status(403).json({ message: 'Admin privileges required' });
    return;
  }
  
  next();
}

// Request logging middleware
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
}

// Error handling middleware
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err.message);
  console.error(err.stack);
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body) {
    // Implement sanitization logic for request body
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Simple example - remove script tags
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    });
  }
  
  next();
}

export default {
  setupMiddleware,
  authenticateJWT,
  requireAdmin,
  sanitizeInput
};
