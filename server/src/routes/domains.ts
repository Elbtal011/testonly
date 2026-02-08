import express from 'express';
import { getDb } from '../database';
import { requireAdmin } from '../middleware';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get all domains
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const domains = db.prepare(`
      SELECT d.*, t.name as template_name, t.folder_name as template_folder 
      FROM domains d
      JOIN templates t ON d.template_id = t.id
      ORDER BY d.domain_name
    `).all();
    
    return res.json({ domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return res.status(500).json({ message: 'Server error fetching domains' });
  }
});

// Get a specific domain by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    const domain = db.prepare(`
      SELECT d.*, t.name as template_name, t.folder_name as template_folder 
      FROM domains d
      JOIN templates t ON d.template_id = t.id
      WHERE d.id = ?
    `).get(id);
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    return res.json({ domain });
  } catch (error) {
    console.error(`Error fetching domain ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching domain' });
  }
});

// Create a new domain (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { domain_name, template_id, is_active = false, ssl_enabled = false } = req.body;
  
  // Validate input
  if (!domain_name || !template_id) {
    return res.status(400).json({ message: 'Domain name and template ID are required' });
  }
  
  // Basic domain validation
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain_name)) {
    return res.status(400).json({ message: 'Invalid domain name format' });
  }
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(template_id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check if domain already exists
    const existingDomain = db.prepare('SELECT * FROM domains WHERE domain_name = ?').get(domain_name);
    
    if (existingDomain) {
      return res.status(409).json({ message: 'Domain already exists' });
    }
    
    // Generate NGINX configuration
    const nginxConfig = generateNginxConfig(domain_name, template.folder_name);
    
    // Insert the new domain
    const result = db.prepare(`
      INSERT INTO domains (domain_name, template_id, is_active, ssl_enabled, nginx_config)
      VALUES (?, ?, ?, ?, ?)
    `).run(domain_name, template_id, is_active ? 1 : 0, ssl_enabled ? 1 : 0, nginxConfig);
    
    const newDomain = db.prepare(`
      SELECT d.*, t.name as template_name, t.folder_name as template_folder 
      FROM domains d
      JOIN templates t ON d.template_id = t.id
      WHERE d.id = ?
    `).get(result.lastInsertRowid);
    
    return res.status(201).json({ 
      message: 'Domain created successfully',
      domain: newDomain
    });
  } catch (error) {
    console.error('Error creating domain:', error);
    return res.status(500).json({ message: 'Server error creating domain' });
  }
});

// Toggle domain status (admin only)
router.post('/:id/toggle-status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if domain exists
    const domain = db.prepare('SELECT * FROM domains WHERE id = ?').get(id);
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    // Toggle the active status
    const newStatus = domain.is_active === 1 ? 0 : 1;
    
    db.prepare(`
      UPDATE domains 
      SET is_active = ?, last_checked = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, id);
    
    // Get updated domain with template info
    const updatedDomain = db.prepare(`
      SELECT d.*, t.name as template_name, t.folder_name as template_folder 
      FROM domains d
      JOIN templates t ON d.template_id = t.id
      WHERE d.id = ?
    `).get(id);
    
    console.log(`🔄 Domain ${domain.domain_name} status toggled: ${domain.is_active === 1 ? 'deactivated' : 'activated'}`);
    
    return res.json({
      message: `Domain ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
      domain: updatedDomain
    });
  } catch (error) {
    console.error(`Error toggling domain ${id} status:`, error);
    return res.status(500).json({ message: 'Server error toggling domain status' });
  }
});

// Update a domain (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { template_id, is_active, ssl_enabled, dns_configured } = req.body;
  
  try {
    const db = getDb();
    
    // Check if domain exists
    const existingDomain = db.prepare('SELECT * FROM domains WHERE id = ?').get(id);
    
    if (!existingDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    // Check if template exists if provided
    if (template_id) {
      const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(template_id);
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' });
      }
      
      // Update NGINX config if template is changed
      if (template_id !== existingDomain.template_id) {
        const newNginxConfig = generateNginxConfig(existingDomain.domain_name, template.folder_name);
        
        db.prepare(`
          UPDATE domains 
          SET template_id = ?, nginx_config = ?, last_checked = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(template_id, newNginxConfig, id);
      }
    }
    
    // Build the update queries dynamically based on what was provided
    const updates = [];
    const params = [];
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }
    
    if (ssl_enabled !== undefined) {
      updates.push('ssl_enabled = ?');
      params.push(ssl_enabled ? 1 : 0);
    }
    
    if (dns_configured !== undefined) {
      updates.push('dns_configured = ?');
      params.push(dns_configured ? 1 : 0);
    }
    
    if (template_id === undefined && updates.length > 0) {
      updates.push('last_checked = CURRENT_TIMESTAMP');
      params.push(id);
      
      db.prepare(`
        UPDATE domains 
        SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...params);
    }
    
    const updatedDomain = db.prepare(`
      SELECT d.*, t.name as template_name, t.folder_name as template_folder 
      FROM domains d
      JOIN templates t ON d.template_id = t.id
      WHERE d.id = ?
    `).get(id);
    
    return res.json({ 
      message: 'Domain updated successfully',
      domain: updatedDomain
    });
  } catch (error) {
    console.error(`Error updating domain ${id}:`, error);
    return res.status(500).json({ message: 'Server error updating domain' });
  }
});

// Delete a domain (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if domain exists
    const domain = db.prepare('SELECT * FROM domains WHERE id = ?').get(id);
    
    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }
    
    // Delete the domain
    db.prepare('DELETE FROM domains WHERE id = ?').run(id);
    
    return res.json({ 
      message: 'Domain deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting domain ${id}:`, error);
    return res.status(500).json({ message: 'Server error deleting domain' });
  }
});

// Generate NGINX configuration
function generateNginxConfig(domain: string, templateFolder: string): string {
  return `
server {
    listen 80;
    listen [::]:80;
    server_name ${domain} www.${domain};

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain} www.${domain};

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/${domain}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${domain}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Document root
    root /var/www/html/dist;
    index index.html;

    # Application routing
    location / {
        try_files $uri $uri/ /${templateFolder}/index.html;
    }

    # Handle /api requests
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Logging
    access_log /var/log/nginx/${domain}.access.log;
    error_log /var/log/nginx/${domain}.error.log;
}
`.trim();
}

// Check if a domain is active by domain name (public endpoint)
router.get('/check/:domainName', async (req, res) => {
  const { domainName } = req.params;
  
  try {
    const db = getDb();
    
    // Look up domain by domain name
    const domain = db.prepare(`
      SELECT d.*, t.name as template_name, t.folder_name as template_folder 
      FROM domains d
      JOIN templates t ON d.template_id = t.id
      WHERE d.domain_name = ?
    `).get(domainName);
    
    if (!domain) {
      return res.status(404).json({ 
        message: 'Domain not found',
        domain: {
          exists: false,
          is_active: false,
          name: domainName
        }
      });
    }
    
    return res.json({
      domain: {
        exists: true,
        is_active: domain.is_active === 1,
        name: domain.domain_name,
        template_name: domain.template_name,
        template_folder: domain.template_folder
      }
    });
  } catch (error) {
    console.error(`Error checking domain ${domainName} status:`, error);
    return res.status(500).json({ message: 'Server error checking domain status' });
  }
});

// Generate blocked page HTML for inactive domains
function generateDomainBlockedPage(): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Domain Temporarily Unavailable</title>
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
        
        <h1>Domain Temporarily Unavailable</h1>
        <p class="description">
            This domain is currently deactivated. Please contact the administrator.
        </p>
        
        <div class="info-box">
            <h2 class="info-title">What can you do?</h2>
            <ul class="info-list">
                <li>• Contact the domain administrator</li>
                <li>• Check back later</li>
                <li>• Verify the domain URL</li>
            </ul>
        </div>
        
        <div class="error-code">
            Error Code: DOMAIN_DEACTIVATED
        </div>
    </div>
</body>
</html>
  `;
}

export default router;
