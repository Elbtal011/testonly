/**
 * Geo-Filtering Middleware
 * Blocks visitors from outside target countries
 */

import { Request, Response, NextFunction } from 'express';
import * as geoip from 'geoip-lite';
import path from 'path';
import { config } from '../config';
import { getClientIP, isLocalIP } from '../utils/ipUtils';
import { getDb } from '../database';
import { getRandomErrorPagePath } from '../utils/errorPageSelector';

/**
 * Get geo-filtering configuration from database
 */
async function getGeoFilterConfig() {
  try {
    const db = getDb();
    const configs = db.prepare(`
      SELECT config_key, config_value FROM antibot_config 
      WHERE config_key IN ('enable_geo_filter', 'allowed_countries', 'enable_cloaking')
    `).all() as Array<{config_key: string, config_value: string}>;
    
    const configObj: any = {};
    configs.forEach(row => {
      let value: any = row.config_value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (value.includes(',')) value = value.split(',').map((s: string) => s.trim());
      configObj[row.config_key] = value;
    });
    
    return configObj;
  } catch (error) {
    console.error('Error loading geo-filter config:', error);
    return {};
  }
}

/**
 * Geo-filtering middleware
 */
export async function geoFilter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get configuration (database overrides environment)
    const dbConfig = await getGeoFilterConfig();
    const enabled = dbConfig.enable_geo_filter ?? config.antiBot?.geoFiltering ?? false;
    
    // Skip if disabled
    if (!enabled) {
      return next();
    }
    
    // Skip portfolio and static assets
    if (req.path === '/portfolio' || 
        req.path.startsWith('/portfolio/') ||
        req.path.includes('/assets/') ||
        req.path.match(/\.(js|css|png|jpg|svg|ico|woff)$/)) {
      return next();
    }
    
    // Skip admin routes (admins should always have access)
    if (req.path.startsWith('/admin') || req.path.startsWith('/login')) {
      return next();
    }
    
    const clientIP = getClientIP(req, config.server.trustProxy);
    
    // Allow localhost in development
    if (isLocalIP(clientIP)) {
      return next();
    }
    
    const allowedCountries = dbConfig.allowed_countries ?? config.antiBot?.allowedCountries ?? ['DE', 'AT', 'CH'];
    
    console.log(`🌍 [GEO-FILTER] Checking IP: ${clientIP}`);
    
    // Lookup geolocation
    const geo = geoip.lookup(clientIP);
    
    if (geo) {
      console.log(`   Country: ${geo.country}, Region: ${geo.region}`);
    } else {
      console.log(`   Could not determine country`);
    }
    
    // Block if not in allowed countries
    if (!geo || !geo.country || !allowedCountries.includes(geo.country)) {
      console.log(`🚫 [GEO-FILTER] Blocked ${geo?.country || 'unknown'} (${clientIP})`);
      
      // Log to database
      try {
        const db = getDb();
        db.prepare(`
          INSERT INTO blocked_visitors (
            ip_address, user_agent, detection_method, detection_score,
            detection_reasons, requested_path, headers_json, geo_country, geo_region
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          clientIP,
          req.headers['user-agent'] || '',
          'geo',
          10,
          `Country not allowed: ${geo?.country || 'unknown'}`,
          req.path,
          JSON.stringify(req.headers),
          geo?.country || null,
          geo?.region || null
        );
      } catch (dbError) {
        console.error('Error logging geo block:', dbError);
      }
      
      // Redirect to portfolio if cloaking enabled
      const cloakingEnabled = dbConfig.enable_cloaking ?? config.antiBot?.cloaking ?? true;
      
      if (cloakingEnabled) {
        return res.sendFile(getRandomErrorPagePath());
      }
      
      return res.status(403).send('Access Denied');
    }
    
    console.log(`✅ [GEO-FILTER] Allowed ${geo.country} (${clientIP})`);
    
    // Update tracking table with geo data (non-blocking)
    try {
      const db = getDb();
      db.prepare(`
        UPDATE tracking 
        SET geo_country = ?, geo_region = ?, geo_city = ?
        WHERE ip_address = ?
        AND first_visit > datetime('now', '-1 hour')
      `).run(geo.country, geo.region, geo.city, clientIP);
    } catch (error) {
      // Non-critical error, don't block request
    }
    
    next();
  } catch (error) {
    console.error('Error in geo-filter middleware:', error);
    // On error, allow through
    next();
  }
}
