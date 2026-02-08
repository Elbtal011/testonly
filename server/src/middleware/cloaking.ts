/**
 * Cloaking Middleware
 * Implements time-based cloaking to hide site during off-hours
 */

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { config } from '../config';
import { getDb } from '../database';
import { getRandomErrorPagePath } from '../utils/errorPageSelector';

/**
 * Parse scheduled hours from config
 */
function parseScheduledHours(hoursRange: string): { startHour: number; endHour: number } {
  const [startStr, endStr] = hoursRange.split('-');
  
  const startHour = parseInt(startStr, 10);
  const endHour = parseInt(endStr, 10);
  
  if (isNaN(startHour) || isNaN(endHour) || 
      startHour < 0 || startHour > 23 || 
      endHour < 0 || endHour > 23) {
    console.warn(`Invalid hours format: ${hoursRange}, using default 9-17`);
    return { startHour: 9, endHour: 17 };
  }
  
  return { startHour, endHour };
}

/**
 * Check if current time is within allowed hours
 */
export function isWithinAllowedHours(scheduledHours: string = '9-17'): boolean {
  const { startHour, endHour } = parseScheduledHours(scheduledHours);
  const currentHour = new Date().getHours();
  
  if (endHour > startHour) {
    // Simple range (e.g., 9-17)
    return currentHour >= startHour && currentHour < endHour;
  } else {
    // Overnight range (e.g., 22-6)
    return currentHour >= startHour || currentHour < endHour;
  }
}

/**
 * Get cloaking configuration from database
 */
async function getCloakingConfig() {
  try {
    const db = getDb();
    const configs = db.prepare(`
      SELECT config_key, config_value FROM antibot_config 
      WHERE config_key IN ('enable_cloaking', 'enable_scheduled_cloaking', 'scheduled_hours')
    `).all() as Array<{config_key: string, config_value: string}>;
    
    const configObj: any = {};
    configs.forEach(row => {
      let value: any = row.config_value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      configObj[row.config_key] = value;
    });
    
    return configObj;
  } catch (error) {
    console.error('Error loading cloaking config:', error);
    return {};
  }
}

/**
 * Time-based cloaking middleware
 */
export async function timeBasedCloaking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get configuration (database overrides environment)
    const dbConfig = await getCloakingConfig();
    const cloakingEnabled = dbConfig.enable_cloaking ?? config.antiBot?.cloaking ?? true;
    const scheduledCloaking = dbConfig.enable_scheduled_cloaking ?? config.antiBot?.scheduledCloaking ?? false;
    
    // Skip if cloaking disabled or not in scheduled mode
    if (!cloakingEnabled || !scheduledCloaking) {
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
    
    // Check if outside allowed hours
    const scheduledHours = dbConfig.scheduled_hours ?? config.antiBot?.scheduledHours ?? '9-17';
    
    if (!isWithinAllowedHours(scheduledHours)) {
      const currentHour = new Date().getHours();
      console.log(`🌙 [TIME-CLOAK] Outside hours (${currentHour} not in ${scheduledHours})`);
      
      return res.sendFile(getRandomErrorPagePath());
    }
    
    // Within allowed hours
    next();
  } catch (error) {
    console.error('Error in time-based cloaking:', error);
    // On error, allow through
    next();
  }
}
