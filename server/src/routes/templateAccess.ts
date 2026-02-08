/**
 * Template Access Control Routes
 * Handles server-side template activation checking and serving
 */

import express from 'express';
import { getDb } from '../database';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Serve template or blocked page based on activation status
router.get('/:templateName', async (req, res) => {
  const { templateName } = req.params;
  const { key } = req.query;
  
  try {
    const db = getDb();
    
    // Check if template exists and is active
    const template = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get(templateName);
    
    if (!template || template.is_active !== 1) {
      // Template is deactivated or doesn't exist - serve blocked page
      return res.send(generateBlockedPage());
    }
    
    // Template is active - serve the React app which will render the template
    const indexPath = path.join(__dirname, '../../../dist/index.html');
    
    if (fs.existsSync(indexPath)) {
      return res.sendFile(path.resolve(indexPath));
    } else {
      // Fallback if dist doesn't exist (development mode)
      return res.redirect(`http://localhost:5173/${templateName}${key ? `/${key}` : ''}`);
    }
    
  } catch (error) {
    console.error(`Error serving template ${templateName}:`, error);
    return res.status(500).send(generateErrorPage());
  }
});

// Generate blocked page HTML
function generateBlockedPage(): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Temporarily Unavailable</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #374151;
        }
        
        .container {
            max-width: 28rem;
            width: 100%;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
        }
        
        .icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            opacity: 0.5;
        }
        
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
        }
        
        .description {
            color: #6b7280;
            margin-bottom: 1.5rem;
        }
        
        .info-box {
            background-color: #f9fafb;
            border-radius: 0.5rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .info-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
        }
        
        .info-list {
            list-style: none;
            font-size: 0.875rem;
            color: #6b7280;
        }
        
        .info-list li {
            margin-bottom: 0.25rem;
        }
        
        .error-code {
            font-size: 0.75rem;
            color: #9ca3af;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9m9 9c5 0 9-4 9-9m-9 9V3m0 18V3"></path>
        </svg>
        
        <h1>Service Temporarily Unavailable</h1>
        <p class="description">
            This service is currently under maintenance. Please try again later.
        </p>
        
        <div class="info-box">
            <h2 class="info-title">What can you do?</h2>
            <ul class="info-list">
                <li>• Check back in a few minutes</li>
                <li>• Contact our support team</li>
                <li>• Visit our main website</li>
            </ul>
        </div>
        
        <div class="error-code">
            Error Code: SERVICE_UNAVAILABLE
        </div>
    </div>
</body>
</html>
  `;
}

// Generate error page HTML
function generateErrorPage(): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Error</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #374151;
        }
        
        .container {
            max-width: 28rem;
            width: 100%;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 2rem;
            text-align: center;
        }
        
        .icon {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            color: #ef4444;
        }
        
        h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
        }
        
        .description {
            color: #6b7280;
            margin-bottom: 1rem;
        }
        
        .error-box {
            background-color: #fef2f2;
            border-radius: 0.5rem;
            padding: 0.75rem;
        }
        
        .error-text {
            font-size: 0.75rem;
            color: #dc2626;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        
        <h1>Service Error</h1>
        <p class="description">
            We're experiencing technical difficulties. Please try again later.
        </p>
        
        <div class="error-box">
            <p class="error-text">INTERNAL_SERVER_ERROR</p>
        </div>
    </div>
</body>
</html>
  `;
}

export default router;
