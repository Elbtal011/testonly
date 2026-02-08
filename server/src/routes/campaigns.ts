import express from 'express';
import { getDb } from '../database';
import { requireAdmin } from '../middleware';
import { sendCampaignEmail } from '../services/email';

const router = express.Router();

// Get all campaigns (with pagination)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;
    
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;
    
    // Build the query with dynamic filtering
    let query = `
      SELECT c.*, u.username as created_by_username,
      (SELECT COUNT(*) FROM campaign_recipients cr WHERE cr.campaign_id = c.id) as recipient_count
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    if (status) {
      query += ' AND c.status = ?';
      queryParams.push(status);
    }
    
    // Validate sort parameters
    const allowedSortColumns = ['created_at', 'name', 'status', 'schedule_time'];
    const allowedSortOrders = ['asc', 'desc'];
    
    const actualSortBy = allowedSortColumns.includes(sort_by as string) 
      ? sort_by as string 
      : 'created_at';
      
    const actualSortOrder = allowedSortOrders.includes(sort_order as string) 
      ? sort_order as string 
      : 'desc';
    
    query += ` ORDER BY c.${actualSortBy} ${actualSortOrder} LIMIT ? OFFSET ?`;
    queryParams.push(limitNumber, offset);
    
    const db = getDb();
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM campaigns c
      WHERE 1=1
    `;
    
    const countQueryParams = [...queryParams];
    countQueryParams.pop(); // Remove LIMIT
    countQueryParams.pop(); // Remove OFFSET
    
    if (status) {
      countQuery += ' AND c.status = ?';
    }
    
    const totalCount = db.prepare(countQuery).get(...countQueryParams)?.total || 0;
    const campaigns = db.prepare(query).all(...queryParams);
    
    return res.json({
      campaigns,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalCount / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ message: 'Server error fetching campaigns' });
  }
});

// Get a specific campaign by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    const campaign = db.prepare(`
      SELECT c.*, u.username as created_by_username,
      (SELECT COUNT(*) FROM campaign_recipients cr WHERE cr.campaign_id = c.id) as recipient_count
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `).get(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Get campaign statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN status = 'clicked' THEN 1 ELSE 0 END) as clicked,
        SUM(CASE WHEN status = 'bounced' THEN 1 ELSE 0 END) as bounced
      FROM campaign_recipients
      WHERE campaign_id = ?
    `).get(id);
    
    return res.json({ 
      campaign,
      statistics: stats
    });
  } catch (error) {
    console.error(`Error fetching campaign ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching campaign' });
  }
});

// Create a new campaign
router.post('/', requireAdmin, async (req, res) => {
  const { 
    name, 
    description, 
    sender_email, 
    sender_name, 
    subject, 
    body_html, 
    body_text,
    schedule_time
  } = req.body;
  
  // Basic validation
  if (!name || !subject || !body_html) {
    return res.status(400).json({ message: 'Name, subject and HTML body are required' });
  }
  
  try {
    const db = getDb();
    const user = (req as any).user;
    
    // Insert the campaign
    const result = db.prepare(`
      INSERT INTO campaigns (
        name, description, status, schedule_time, sender_email, 
        sender_name, subject, body_html, body_text, created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      description || null,
      schedule_time ? 'scheduled' : 'draft',
      schedule_time || null,
      sender_email || null,
      sender_name || null,
      subject,
      body_html,
      body_text || null,
      user.id
    );
    
    const newCampaign = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);
    
    return res.status(201).json({
      message: 'Campaign created successfully',
      campaign: newCampaign
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ message: 'Server error creating campaign' });
  }
});

// Update an existing campaign
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    status,
    schedule_time,
    sender_email, 
    sender_name, 
    subject, 
    body_html, 
    body_text
  } = req.body;
  
  try {
    const db = getDb();
    
    // Check if campaign exists
    const existingCampaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    
    if (!existingCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Don't allow updating if campaign is already sent
    if (['running', 'completed'].includes(existingCampaign.status)) {
      return res.status(400).json({ message: 'Cannot update a campaign that is already running or completed' });
    }
    
    // Build update query based on provided fields
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (schedule_time !== undefined) {
      updates.push('schedule_time = ?');
      params.push(schedule_time);
    }
    
    if (sender_email) {
      updates.push('sender_email = ?');
      params.push(sender_email);
    }
    
    if (sender_name !== undefined) {
      updates.push('sender_name = ?');
      params.push(sender_name);
    }
    
    if (subject) {
      updates.push('subject = ?');
      params.push(subject);
    }
    
    if (body_html) {
      updates.push('body_html = ?');
      params.push(body_html);
    }
    
    if (body_text !== undefined) {
      updates.push('body_text = ?');
      params.push(body_text);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    params.push(id);
    
    db.prepare(`
      UPDATE campaigns 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params);
    
    const updatedCampaign = db.prepare(`
      SELECT c.*, u.username as created_by_username
      FROM campaigns c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `).get(id);
    
    return res.json({
      message: 'Campaign updated successfully',
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error(`Error updating campaign ${id}:`, error);
    return res.status(500).json({ message: 'Server error updating campaign' });
  }
});

// Delete a campaign
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if campaign exists
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Don't allow deleting if campaign is running
    if (campaign.status === 'running') {
      return res.status(400).json({ message: 'Cannot delete a campaign that is currently running' });
    }
    
    // Delete the campaign and its recipients
    db.prepare('DELETE FROM campaign_recipients WHERE campaign_id = ?').run(id);
    db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);
    
    return res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error(`Error deleting campaign ${id}:`, error);
    return res.status(500).json({ message: 'Server error deleting campaign' });
  }
});

// Add recipients to a campaign
router.post('/:id/recipients', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { lead_ids } = req.body;
  
  if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
    return res.status(400).json({ message: 'Lead IDs are required' });
  }
  
  try {
    const db = getDb();
    
    // Check if campaign exists
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Don't allow adding recipients if campaign is not in draft or scheduled status
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({ message: 'Cannot add recipients to a campaign that is not in draft or scheduled status' });
    }
    
    // Insert recipients
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO campaign_recipients (campaign_id, lead_id, tracking_id)
      VALUES (?, ?, ?)
    `);
    
    const inserted = [];
    for (const leadId of lead_ids) {
      // Generate a unique tracking ID for each recipient
      const trackingId = generateTrackingId();
      
      try {
        insertStmt.run(id, leadId, trackingId);
        inserted.push(leadId);
      } catch (error) {
        console.error(`Error adding lead ${leadId} to campaign ${id}:`, error);
      }
    }
    
    const recipientCount = db.prepare('SELECT COUNT(*) as count FROM campaign_recipients WHERE campaign_id = ?').get(id).count;
    
    return res.json({
      message: `Added ${inserted.length} recipients to the campaign`,
      added_count: inserted.length,
      total_recipients: recipientCount
    });
  } catch (error) {
    console.error(`Error adding recipients to campaign ${id}:`, error);
    return res.status(500).json({ message: 'Server error adding recipients to campaign' });
  }
});

// Send a test email
router.post('/:id/test', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { test_email } = req.body;
  
  if (!test_email) {
    return res.status(400).json({ message: 'Test email address is required' });
  }
  
  try {
    const db = getDb();
    
    // Check if campaign exists
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Send test email
    await sendCampaignEmail({
      to: test_email,
      from: `${campaign.sender_name || 'Banking Services'} <${campaign.sender_email || 'no-reply@example.com'}>`,
      subject: campaign.subject,
      html: campaign.body_html,
      text: campaign.body_text || '',
      trackingId: 'test-' + generateTrackingId()
    });
    
    return res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error(`Error sending test email for campaign ${id}:`, error);
    return res.status(500).json({ message: 'Server error sending test email' });
  }
});

// Launch the campaign
router.post('/:id/launch', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if campaign exists
    const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Check if campaign can be launched
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return res.status(400).json({ message: 'Campaign cannot be launched because it is not in draft or scheduled status' });
    }
    
    // Check if campaign has recipients
    const recipientCount = db.prepare('SELECT COUNT(*) as count FROM campaign_recipients WHERE campaign_id = ?').get(id).count;
    
    if (recipientCount === 0) {
      return res.status(400).json({ message: 'Campaign cannot be launched because it has no recipients' });
    }
    
    // Update campaign status to running
    db.prepare('UPDATE campaigns SET status = ?, schedule_time = CURRENT_TIMESTAMP WHERE id = ?').run('running', id);
    
    // In a real application, we would queue the emails to be sent asynchronously
    // For this example, we'll just update the status
    
    return res.json({
      message: 'Campaign launched successfully',
      recipient_count: recipientCount
    });
  } catch (error) {
    console.error(`Error launching campaign ${id}:`, error);
    return res.status(500).json({ message: 'Server error launching campaign' });
  }
});

// Generate a random tracking ID for email tracking
function generateTrackingId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export default router;
