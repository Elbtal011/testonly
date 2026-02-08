import express from 'express';
import { getDb } from '../database';
import crypto from 'crypto';

const router = express.Router();

// Track a page visit (no authentication required, called from templates)
router.post('/visit', async (req, res) => {
  const { 
    tracking_id, 
    template_id, 
    domain_id, 
    path, 
    query_params,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content
  } = req.body;
  
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.headers['user-agent'];
  
  // Basic validation
  if (!template_id || !domain_id) {
    return res.status(400).json({ message: 'Template ID and Domain ID are required' });
  }
  
  try {
    const db = getDb();
    
    // Check if template and domain exist and are active
    const template = db.prepare('SELECT * FROM templates WHERE id = ? AND is_active = 1').get(template_id);
    if (!template) {
      return res.status(404).json({ message: 'Active template not found' });
    }
    
    const domain = db.prepare('SELECT * FROM domains WHERE id = ? AND is_active = 1').get(domain_id);
    if (!domain) {
      return res.status(404).json({ message: 'Active domain not found' });
    }
    
    let visitorTrackingId = tracking_id;
    let isNewVisitor = false;
    
    // If no tracking ID is provided, create a new one
    if (!visitorTrackingId) {
      visitorTrackingId = generateTrackingId();
      isNewVisitor = true;
      
      // Create a unique short URL for this visitor
      const uniqueUrl = generateShortUrl();
      
      // Insert new tracking record
      db.prepare(`
        INSERT INTO tracking (
          tracking_id, template_id, domain_id, unique_url, ip_address, user_agent,
          referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        visitorTrackingId,
        template_id,
        domain_id,
        uniqueUrl,
        ip_address || null,
        user_agent || null,
        referrer || null,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null,
        utm_term || null,
        utm_content || null
      );
    } else {
      // Update existing tracking record
      db.prepare(`
        UPDATE tracking
        SET 
          last_visit = CURRENT_TIMESTAMP,
          visit_count = visit_count + 1
        WHERE tracking_id = ?
      `).run(visitorTrackingId);
    }
    
    // Always record the page visit
    if (path) {
      db.prepare(`
        INSERT INTO page_visits (
          tracking_id, path, query_params, visited_at
        )
        VALUES (
          (SELECT id FROM tracking WHERE tracking_id = ?),
          ?, ?, CURRENT_TIMESTAMP
        )
      `).run(
        visitorTrackingId,
        path,
        query_params || null
      );
    }
    
    // Get tracking and unique URL information
    const trackingInfo = db.prepare(`
      SELECT tracking_id, unique_url
      FROM tracking
      WHERE tracking_id = ?
    `).get(visitorTrackingId);
    
    return res.json({
      tracking_id: visitorTrackingId,
      unique_url: trackingInfo?.unique_url,
      is_new_visitor: isNewVisitor
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    
    // Still return a tracking ID even if there was an error
    return res.json({
      tracking_id: tracking_id || generateTrackingId(),
      is_new_visitor: !tracking_id
    });
  }
});

// Record form interactions (no authentication required)
router.post('/interaction', async (req, res) => {
  const { tracking_id, page_visit_id, interaction_type, time_spent } = req.body;
  
  if (!tracking_id) {
    return res.status(400).json({ message: 'Tracking ID is required' });
  }
  
  try {
    const db = getDb();
    
    // Find tracking record
    const tracking = db.prepare('SELECT id FROM tracking WHERE tracking_id = ?').get(tracking_id);
    
    if (!tracking) {
      return res.status(404).json({ message: 'Tracking record not found' });
    }
    
    // Find the most recent page visit if page_visit_id not provided
    let visitId = page_visit_id;
    
    if (!visitId) {
      const recentVisit = db.prepare(`
        SELECT id FROM page_visits
        WHERE tracking_id = ?
        ORDER BY visited_at DESC
        LIMIT 1
      `).get(tracking.id);
      
      if (recentVisit) {
        visitId = recentVisit.id;
      }
    }
    
    if (visitId) {
      // Update the page visit record with interaction data
      if (interaction_type === 'form') {
        db.prepare(`
          UPDATE page_visits
          SET form_interactions = form_interactions + 1
          WHERE id = ?
        `).run(visitId);
      } else if (interaction_type === 'submit') {
        db.prepare(`
          UPDATE page_visits
          SET form_submissions = form_submissions + 1
          WHERE id = ?
        `).run(visitId);
      }
      
      // Update time spent if provided
      if (time_spent) {
        db.prepare(`
          UPDATE page_visits
          SET time_spent = ?
          WHERE id = ?
        `).run(time_spent, visitId);
      }
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return res.json({ success: false });
  }
});

// Redirect from short URL to actual template page (no authentication required)
router.get('/r/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  
  try {
    const db = getDb();
    
    // Find the tracking record with this short URL
    const tracking = db.prepare(`
      SELECT t.*, tm.folder_name, d.domain_name
      FROM tracking t
      JOIN templates tm ON t.template_id = tm.id
      JOIN domains d ON t.domain_id = d.id
      WHERE t.unique_url = ?
    `).get(shortCode);
    
    if (!tracking) {
      return res.status(404).send('Link not found');
    }
    
    // Update the tracking record
    db.prepare(`
      UPDATE tracking
      SET 
        last_visit = CURRENT_TIMESTAMP,
        visit_count = visit_count + 1
      WHERE id = ?
    `).run(tracking.id);
    
    // Redirect to the appropriate template with tracking ID
    const protocol = tracking.ssl_enabled ? 'https' : 'http';
    const redirectUrl = `${protocol}://${tracking.domain_name}/${tracking.folder_name}?tid=${tracking.tracking_id}`;
    
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error redirecting from short URL:', error);
    return res.status(500).send('Server error');
  }
});

// Get tracking statistics (requires authentication)
router.get('/statistics', async (req, res) => {
  try {
    const db = getDb();
    
    // Get total visitors
    const totalVisitors = db.prepare('SELECT COUNT(*) as count FROM tracking').get().count;
    
    // Get visitors in the last 24 hours
    const recentVisitors = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tracking
      WHERE last_visit >= datetime('now', '-1 day')
    `).get().count;
    
    // Get conversion rate
    const conversionStats = db.prepare(`
      SELECT 
        COUNT(*) as total_visitors,
        SUM(CASE WHEN converted_to_lead = 1 THEN 1 ELSE 0 END) as converted_visitors
      FROM tracking
    `).get();
    
    const conversionRate = conversionStats.total_visitors > 0 
      ? (conversionStats.converted_visitors / conversionStats.total_visitors) * 100 
      : 0;
    
    // Get visitors by template
    const visitorsByTemplate = db.prepare(`
      SELECT 
        t.id as template_id,
        t.name as template_name,
        COUNT(tr.id) as visitor_count,
        SUM(CASE WHEN tr.converted_to_lead = 1 THEN 1 ELSE 0 END) as conversion_count
      FROM templates t
      LEFT JOIN tracking tr ON t.id = tr.template_id
      GROUP BY t.id
      ORDER BY visitor_count DESC
    `).all();
    
    return res.json({
      statistics: {
        total_visitors: totalVisitors,
        recent_visitors: recentVisitors,
        conversion_rate: parseFloat(conversionRate.toFixed(2)),
        visitors_by_template: visitorsByTemplate
      }
    });
  } catch (error) {
    console.error('Error fetching tracking statistics:', error);
    return res.status(500).json({ message: 'Server error fetching tracking statistics' });
  }
});

// Generate a unique tracking ID
function generateTrackingId(): string {
  return 'tr_' + crypto.randomBytes(16).toString('hex');
}

// Generate a short URL code
function generateShortUrl(): string {
  // Characters that won't be confused with each other
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // Generate a 6-character code
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export default router;
