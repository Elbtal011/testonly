import express from 'express';
import { getDb } from '../database';
import { authenticateJWT, requireAdmin } from '../middleware';
import notificationService from '../services/notificationService';
import { refreshCrawlerPatterns } from '../middleware/antiBot';

const router = express.Router();

// Get blocked visitors with filtering and pagination
router.get('/blocked-visitors', authenticateJWT, (req, res) => {
  const { 
    range = '7d', 
    limit = 100, 
    page = 1,
    method,
    country 
  } = req.query;
  
  try {
    const db = getDb();
    
    // Calculate time range
    let timeFilter = "datetime('now', '-7 days')";
    if (range === '24h') timeFilter = "datetime('now', '-1 day')";
    if (range === '30d') timeFilter = "datetime('now', '-30 days')";
    if (range === '90d') timeFilter = "datetime('now', '-90 days')";
    
    // Build query with filters
    let query = `
      SELECT * FROM blocked_visitors
      WHERE blocked_at > ${timeFilter}
    `;
    const params: any[] = [];
    
    if (method) {
      query += ' AND detection_method = ?';
      params.push(method);
    }
    
    if (country) {
      query += ' AND geo_country = ?';
      params.push(country);
    }
    
    // Add pagination
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const offset = (pageNum - 1) * limitNum;
    
    query += ' ORDER BY blocked_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);
    
    const visitors = db.prepare(query).all(...params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total FROM blocked_visitors
      WHERE blocked_at > ${timeFilter}
    `;
    const countParams = params.slice(0, -2); // Remove limit and offset
    
    if (method) countQuery += ' AND detection_method = ?';
    if (country) countQuery += ' AND geo_country = ?';
    
    const totalCount = db.prepare(countQuery).get(...countParams) as { total: number };
    
    res.json({ 
      visitors,
      pagination: {
        total: totalCount.total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount.total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching blocked visitors:', error);
    res.status(500).json({ error: 'Failed to fetch blocked visitors' });
  }
});

// Get security statistics
router.get('/stats', authenticateJWT, (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    const db = getDb();
    
    let timeFilter = "datetime('now', '-7 days')";
    if (range === '24h') timeFilter = "datetime('now', '-1 day')";
    if (range === '30d') timeFilter = "datetime('now', '-30 days')";
    if (range === '90d') timeFilter = "datetime('now', '-90 days')";
    
    const totalBlocked = db.prepare(`
      SELECT COUNT(*) as count FROM blocked_visitors
    `).get() as { count: number };
    
    const blockedToday = db.prepare(`
      SELECT COUNT(*) as count FROM blocked_visitors
      WHERE blocked_at > datetime('now', '-1 day')
    `).get() as { count: number };
    
    const blockedThisWeek = db.prepare(`
      SELECT COUNT(*) as count FROM blocked_visitors
      WHERE blocked_at > datetime('now', '-7 days')
    `).get() as { count: number };
    
    const blockedInRange = db.prepare(`
      SELECT COUNT(*) as count FROM blocked_visitors
      WHERE blocked_at > ${timeFilter}
    `).get() as { count: number };
    
    const topBlockedCountries = db.prepare(`
      SELECT geo_country as country, COUNT(*) as count
      FROM blocked_visitors
      WHERE blocked_at > ${timeFilter} AND geo_country IS NOT NULL
      GROUP BY geo_country
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    const topDetectionMethods = db.prepare(`
      SELECT detection_method as method, COUNT(*) as count
      FROM blocked_visitors
      WHERE blocked_at > ${timeFilter}
      GROUP BY detection_method
      ORDER BY count DESC
    `).all();
    
    const topUserAgents = db.prepare(`
      SELECT user_agent, COUNT(*) as count
      FROM blocked_visitors
      WHERE blocked_at > ${timeFilter} AND user_agent IS NOT NULL
      GROUP BY user_agent
      ORDER BY count DESC
      LIMIT 10
    `).all();
    
    const hourlyStats = db.prepare(`
      SELECT 
        strftime('%H', blocked_at) as hour,
        COUNT(*) as count
      FROM blocked_visitors
      WHERE blocked_at > datetime('now', '-24 hours')
      GROUP BY hour
      ORDER BY hour
    `).all();
    
    res.json({
      stats: {
        totalBlocked: totalBlocked.count,
        blockedToday: blockedToday.count,
        blockedThisWeek: blockedThisWeek.count,
        blockedInRange: blockedInRange.count,
        topBlockedCountries,
        topDetectionMethods,
        topUserAgents,
        hourlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({ error: 'Failed to fetch security stats' });
  }
});

// Get anti-bot configuration
router.get('/config', authenticateJWT, (req, res) => {
  try {
    const db = getDb();
    const configs = db.prepare('SELECT * FROM antibot_config ORDER BY config_key').all();
    
    const configObj: any = {};
    configs.forEach((row: any) => {
      let value: any = row.config_value;
      
      // Parse values based on type
      if (row.config_type === 'boolean') {
        value = value === 'true';
      } else if (row.config_type === 'number') {
        value = parseInt(value, 10);
      } else if (row.config_type === 'array') {
        value = value ? value.split(',').map((s: string) => s.trim()) : [];
      }
      
      configObj[row.config_key] = {
        value,
        description: row.description,
        type: row.config_type,
        updated_at: row.updated_at
      };
    });
    
    res.json({ config: configObj });
  } catch (error) {
    console.error('Error fetching anti-bot config:', error);
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// Update anti-bot configuration
router.put('/config', requireAdmin, async (req, res) => {
  const { config_key, config_value } = req.body;
  
  if (!config_key || config_value === undefined) {
    return res.status(400).json({ error: 'config_key and config_value required' });
  }
  
  try {
    const db = getDb();
    
    // Validate config key exists
    const existingConfig = db.prepare('SELECT * FROM antibot_config WHERE config_key = ?').get(config_key);
    if (!existingConfig) {
      return res.status(404).json({ error: 'Configuration key not found' });
    }
    
    // Convert value to string for storage
    let valueToStore = config_value;
    if (typeof config_value === 'boolean') {
      valueToStore = config_value.toString();
    } else if (Array.isArray(config_value)) {
      valueToStore = config_value.join(',');
    } else {
      valueToStore = config_value.toString();
    }
    
    // Update configuration
    db.prepare(`
      UPDATE antibot_config 
      SET config_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE config_key = ?
    `).run(valueToStore, config_key);
    
    console.log(`✅ Updated anti-bot config: ${config_key} = ${valueToStore}`);
    
    // Create notification for config change
    const user = (req as any).user;
    await notificationService.notifySecurityConfigChange(
      user?.username || 'Unknown Admin',
      [config_key]
    );
    
    res.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config_key,
      config_value: valueToStore
    });
  } catch (error) {
    console.error('Error updating anti-bot config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Bulk update anti-bot configuration
router.put('/config/bulk', requireAdmin, async (req, res) => {
  const { configs } = req.body;
  
  if (!configs || typeof configs !== 'object') {
    return res.status(400).json({ error: 'configs object required' });
  }
  
  try {
    const db = getDb();
    
    // Use transaction for bulk updates
    const updateStmt = db.prepare(`
      UPDATE antibot_config 
      SET config_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE config_key = ?
    `);
    
    const results: any[] = [];
    
    // Process updates one by one (SQLite handles this efficiently)
    for (const [key, value] of Object.entries(configs)) {
      // Convert value to string for storage
      let valueToStore = value;
      if (typeof value === 'boolean') {
        valueToStore = value.toString();
      } else if (Array.isArray(value)) {
        valueToStore = (value as any[]).join(',');
      } else {
        valueToStore = (value as any).toString();
      }
      
      const result = updateStmt.run(valueToStore, key);
      results.push({ key, value: valueToStore, updated: result.changes > 0 });
    }
    const updatedCount = results.filter(r => r.updated).length;
    
    console.log(`✅ Bulk updated ${updatedCount} anti-bot configurations`);
    
    // Create notification for bulk config changes
    const user = (req as any).user;
    await notificationService.notifySecurityConfigChange(
      user?.username || 'Unknown Admin',
      Object.keys(configs)
    );
    
    res.json({ 
      success: true, 
      message: `Updated ${updatedCount} configurations`,
      results
    });
  } catch (error) {
    console.error('Error bulk updating anti-bot config:', error);
    res.status(500).json({ error: 'Failed to update configurations' });
  }
});

// Refresh crawler patterns from file
router.post('/refresh-patterns', requireAdmin, (req, res) => {
  try {
    refreshCrawlerPatterns();
    
    res.json({ 
      success: true, 
      message: 'Crawler patterns refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing crawler patterns:', error);
    res.status(500).json({ error: 'Failed to refresh crawler patterns' });
  }
});

// Get detection method breakdown
router.get('/detection-methods', authenticateJWT, (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    const db = getDb();
    
    let timeFilter = "datetime('now', '-7 days')";
    if (range === '24h') timeFilter = "datetime('now', '-1 day')";
    if (range === '30d') timeFilter = "datetime('now', '-30 days')";
    
    const methods = db.prepare(`
      SELECT 
        detection_method,
        COUNT(*) as count,
        AVG(detection_score) as avg_score,
        MIN(detection_score) as min_score,
        MAX(detection_score) as max_score
      FROM blocked_visitors
      WHERE blocked_at > ${timeFilter}
      GROUP BY detection_method
      ORDER BY count DESC
    `).all();
    
    res.json({ methods });
  } catch (error) {
    console.error('Error fetching detection methods:', error);
    res.status(500).json({ error: 'Failed to fetch detection methods' });
  }
});

// Clear old blocked visitors (cleanup)
router.delete('/blocked-visitors/cleanup', requireAdmin, (req, res) => {
  const { days = 30 } = req.query;
  
  try {
    const db = getDb();
    
    const result = db.prepare(`
      DELETE FROM blocked_visitors
      WHERE blocked_at < datetime('now', '-${days} days')
    `).run();
    
    console.log(`🧹 Cleaned up ${result.changes} old blocked visitor records`);
    
    res.json({ 
      success: true, 
      message: `Cleaned up ${result.changes} old records`,
      deleted_count: result.changes
    });
  } catch (error) {
    console.error('Error cleaning up blocked visitors:', error);
    res.status(500).json({ error: 'Failed to cleanup blocked visitors' });
  }
});

export default router;
