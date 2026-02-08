import express from 'express';
import { getDb } from '../database';
import { authenticateJWT, requireAdmin } from '../middleware';
import partialLeadService from '../services/partialLeadService';

const router = express.Router();

// Get partial lead statistics
router.get('/stats', authenticateJWT, (req, res) => {
  try {
    const db = getDb();
    
    // Get counts by status
    const totalPartial = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status LIKE "partial%"').get() as { count: number };
    const immediateCapture = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "partial_immediate"').get() as { count: number };
    const abandonedCapture = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "partial"').get() as { count: number };
    
    // Get recent partial leads (last 24 hours)
    const recentPartial = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE status LIKE "partial%" 
      AND created_at > datetime('now', '-1 day')
    `).get() as { count: number };
    
    // Get partial leads by template
    const byTemplate = db.prepare(`
      SELECT 
        t.name as template_name,
        COUNT(*) as count,
        AVG(CASE WHEN l.additional_data LIKE '%data_completeness%' 
            THEN CAST(json_extract(l.additional_data, '$.data_completeness') as INTEGER)
            ELSE 0 END) as avg_completeness
      FROM leads l
      JOIN templates t ON l.template_id = t.id
      WHERE l.status LIKE "partial%"
      GROUP BY t.name
      ORDER BY count DESC
    `).all();
    
    res.json({
      stats: {
        totalPartial: totalPartial.count,
        immediateCapture: immediateCapture.count,
        abandonedCapture: abandonedCapture.count,
        recentPartial: recentPartial.count,
        byTemplate
      }
    });
  } catch (error) {
    console.error('Error fetching partial lead stats:', error);
    res.status(500).json({ error: 'Failed to fetch partial lead statistics' });
  }
});

// Get recent partial leads with details
router.get('/recent', authenticateJWT, (req, res) => {
  const { limit = 50 } = req.query;
  
  try {
    const db = getDb();
    
    const partialLeads = db.prepare(`
      SELECT 
        l.*,
        t.name as template_name,
        d.domain_name
      FROM leads l
      JOIN templates t ON l.template_id = t.id
      JOIN domains d ON l.domain_id = d.id
      WHERE l.status LIKE "partial%"
      ORDER BY l.created_at DESC
      LIMIT ?
    `).all(parseInt(limit as string));
    
    // Parse additional_data JSON for each lead
    const enrichedLeads = partialLeads.map(lead => ({
      ...lead,
      additional_data: JSON.parse(lead.additional_data || '{}')
    }));
    
    res.json({ partialLeads: enrichedLeads });
  } catch (error) {
    console.error('Error fetching recent partial leads:', error);
    res.status(500).json({ error: 'Failed to fetch recent partial leads' });
  }
});

// Update partial lead service configuration
router.put('/config', requireAdmin, (req, res) => {
  const { minDataThreshold, abandonmentTimeMinutes, enabledTemplates } = req.body;
  
  try {
    const updates: any = {};
    
    if (typeof minDataThreshold === 'number' && minDataThreshold >= 1) {
      updates.minDataThreshold = minDataThreshold;
    }
    
    if (typeof abandonmentTimeMinutes === 'number' && abandonmentTimeMinutes >= 1) {
      updates.abandonmentTimeMinutes = abandonmentTimeMinutes;
    }
    
    if (Array.isArray(enabledTemplates)) {
      updates.enabledTemplates = enabledTemplates;
    }
    
    partialLeadService.updateConfig(updates);
    
    res.json({
      success: true,
      message: 'Partial lead configuration updated',
      config: updates
    });
  } catch (error) {
    console.error('Error updating partial lead config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Manually trigger processing of abandoned sessions
router.post('/process-abandoned', requireAdmin, async (req, res) => {
  try {
    await partialLeadService.processAbandonedSessions();
    
    res.json({
      success: true,
      message: 'Abandoned session processing triggered'
    });
  } catch (error) {
    console.error('Error processing abandoned sessions:', error);
    res.status(500).json({ error: 'Failed to process abandoned sessions' });
  }
});

// Get session data for a specific partial lead
router.get('/:leadId/session-data', authenticateJWT, (req, res) => {
  const { leadId } = req.params;
  
  try {
    const db = getDb();
    
    // Get lead and associated session
    const lead = db.prepare(`
      SELECT l.*, s.session_data, s.qr_data, s.created_at as session_created
      FROM leads l
      LEFT JOIN sessions s ON l.tracking_id = s.session_key
      WHERE l.id = ? AND l.status LIKE "partial%"
    `).get(leadId);
    
    if (!lead) {
      return res.status(404).json({ error: 'Partial lead not found' });
    }
    
    // Parse session data
    const sessionData = lead.session_data ? JSON.parse(lead.session_data) : {};
    const qrData = lead.qr_data ? JSON.parse(lead.qr_data) : {};
    const additionalData = JSON.parse(lead.additional_data || '{}');
    
    res.json({
      lead: {
        ...lead,
        session_data: sessionData,
        qr_data: qrData,
        additional_data: additionalData
      }
    });
  } catch (error) {
    console.error('Error fetching partial lead session data:', error);
    res.status(500).json({ error: 'Failed to fetch session data' });
  }
});

export default router;
