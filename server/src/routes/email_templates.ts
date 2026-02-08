import express from 'express';
import { getDb } from '../database';
import { authenticateJWT } from '../middleware';

const router = express.Router();

// Get all email templates with optional filtering
router.get('/', authenticateJWT, (req, res) => {
  const { bank_name, template_type, is_active } = req.query;
  
  try {
    const db = getDb();
    
    let query = 'SELECT * FROM email_templates WHERE 1=1';
    const params = [];
    
    if (bank_name) {
      query += ' AND bank_name = ?';
      params.push(bank_name);
    }
    
    if (template_type) {
      query += ' AND template_type = ?';
      params.push(template_type);
    }
    
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }
    
    query += ' ORDER BY bank_name ASC, template_type ASC, created_at DESC';
    
    const templates = db.prepare(query).all(...params);
    
    return res.json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return res.status(500).json({ message: 'Error fetching email templates' });
  }
});

// Get a single email template by ID
router.get('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    
    return res.json({ template });
  } catch (error) {
    console.error(`Error fetching email template with ID ${id}:`, error);
    return res.status(500).json({ message: 'Error fetching email template' });
  }
});

// Create a new email template
router.post('/', authenticateJWT, (req, res) => {
  const { 
    name, 
    subject, 
    html_content,
    design_json,
    category, 
    bank_name, 
    template_type, 
    version = 1,
    is_active = 1,
    deliverability_score = 0
  } = req.body;
  
  // Validate input
  if (!name || !subject || !html_content) {
    return res.status(400).json({ message: 'Name, subject, and HTML content are required' });
  }
  
  try {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO email_templates (
        name, subject, html_content, design_json, category, bank_name, template_type, 
        version, is_active, deliverability_score, created_at, last_modified
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      name, 
      subject, 
      html_content,
      design_json || null,
      category || null, 
      bank_name || null, 
      template_type || null,
      version,
      is_active,
      deliverability_score
    );
    
    // Get the inserted template
    const template = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(result.lastInsertRowid);
    
    return res.status(201).json({ 
      message: 'Email template created successfully',
      template 
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    return res.status(500).json({ message: 'Error creating email template' });
  }
});

// Update an existing email template
router.put('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    subject, 
    html_content,
    design_json,
    category, 
    bank_name, 
    template_type, 
    version,
    is_active,
    deliverability_score
  } = req.body;
  
  // Validate input
  if (!name || !subject || !html_content) {
    return res.status(400).json({ message: 'Name, subject, and HTML content are required' });
  }
  
  try {
    const db = getDb();
    
    // Check if template exists
    const existingTemplate = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(id);
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    
    // Update the template with new fields
    db.prepare(`
      UPDATE email_templates
      SET name = ?, subject = ?, html_content = ?, design_json = ?, category = ?, 
          bank_name = ?, template_type = ?, version = ?, is_active = ?, 
          deliverability_score = ?, last_modified = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name, 
      subject, 
      html_content,
      design_json !== undefined ? design_json : existingTemplate.design_json,
      category || null, 
      bank_name || existingTemplate.bank_name,
      template_type || existingTemplate.template_type,
      version || existingTemplate.version,
      is_active !== undefined ? is_active : existingTemplate.is_active,
      deliverability_score || existingTemplate.deliverability_score,
      id
    );
    
    // Get the updated template
    const updatedTemplate = db.prepare('SELECT * FROM email_templates WHERE id = ?').get(id);
    
    return res.json({ 
      message: 'Email template updated successfully',
      template: updatedTemplate 
    });
  } catch (error) {
    console.error(`Error updating email template with ID ${id}:`, error);
    return res.status(500).json({ message: 'Error updating email template' });
  }
});

// Delete an email template
router.delete('/:id', authenticateJWT, (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const existingTemplate = db.prepare('SELECT id FROM email_templates WHERE id = ?').get(id);
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Email template not found' });
    }
    
    // Delete the template
    db.prepare('DELETE FROM email_templates WHERE id = ?').run(id);
    
    return res.json({ message: 'Email template deleted successfully' });
  } catch (error) {
    console.error(`Error deleting email template with ID ${id}:`, error);
    return res.status(500).json({ message: 'Error deleting email template' });
  }
});

// Get available banks for email templates
router.get('/banks/list', authenticateJWT, (req, res) => {
  try {
    const db = getDb();
    const banks = db.prepare(`
      SELECT DISTINCT bank_name, COUNT(*) as template_count
      FROM email_templates 
      WHERE bank_name IS NOT NULL 
      GROUP BY bank_name 
      ORDER BY bank_name ASC
    `).all();
    
    return res.json({ banks });
  } catch (error) {
    console.error('Error fetching available banks:', error);
    return res.status(500).json({ message: 'Error fetching available banks' });
  }
});

// Get template types
router.get('/types/list', authenticateJWT, (req, res) => {
  try {
    const db = getDb();
    const types = db.prepare(`
      SELECT DISTINCT template_type, COUNT(*) as template_count
      FROM email_templates 
      WHERE template_type IS NOT NULL 
      GROUP BY template_type 
      ORDER BY template_type ASC
    `).all();
    
    return res.json({ types });
  } catch (error) {
    console.error('Error fetching template types:', error);
    return res.status(500).json({ message: 'Error fetching template types' });
  }
});

export default router;
