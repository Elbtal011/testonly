/**
 * Import Routes
 * Handles file upload and batch import of leads
 */

import express from 'express';
import multer from 'multer';
import { requireAdmin } from '../middleware';
import { getDb } from '../database';
import { leadService, LeadData } from '../services/leadService';
import { parseImportFile, previewImportFile, ParsedLeadData } from '../utils/importParser';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept text files and CSV
    const allowedMimes = [
      'text/plain',
      'text/csv',
      'application/csv',
      'text/comma-separated-values',
      'application/vnd.ms-excel'
    ];
    
    const allowedExtensions = ['.txt', '.csv', '.tsv'];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} (${ext}) not allowed. Use .txt, .csv, or .tsv`));
    }
  }
});

/**
 * POST /api/import/preview
 * Preview import file without committing to database
 */
router.post('/preview', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log(`📁 [IMPORT] Preview request for file: ${req.file.originalname}`);
    
    // Parse file content
    const content = req.file.buffer.toString('utf-8');
    const maxPreviewRows = parseInt(req.body.maxRows) || 10;
    
    const parseResult = previewImportFile(content, maxPreviewRows);
    
    console.log(`📊 [IMPORT] Preview parsed: ${parseResult.stats.parsed_successfully} leads, ${parseResult.stats.parse_errors} errors`);
    
    // Check for potential duplicates
    const duplicateCheck = parseResult.leads.map(lead => {
      const existing = leadService.findExistingLead(lead.first_name, lead.last_name);
      return {
        ...lead,
        existing_lead_id: existing?.id || null,
        is_duplicate: !!existing,
        existing_submission_count: existing?.submission_count || 0
      };
    });
    
    res.json({
      success: true,
      preview: {
        leads: duplicateCheck,
        errors: parseResult.errors,
        stats: {
          ...parseResult.stats,
          duplicates_found: duplicateCheck.filter(l => l.is_duplicate).length,
          new_leads: duplicateCheck.filter(l => !l.is_duplicate).length
        }
      },
      file_info: {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ [IMPORT] Preview error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to preview file'
    });
  }
});

/**
 * POST /api/import/leads
 * Import leads from uploaded file
 */
router.post('/leads', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log(`📁 [IMPORT] Import request for file: ${req.file.originalname}`);
    
    // Parse file content
    const content = req.file.buffer.toString('utf-8');
    const parseResult = parseImportFile(content);
    
    if (!parseResult.success || parseResult.leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid leads found in file',
        parse_errors: parseResult.errors,
        stats: parseResult.stats
      });
    }
    
    console.log(`📊 [IMPORT] Parsed ${parseResult.leads.length} leads from file`);
    
    // Get default template and domain for imports
    const db = getDb();
    
    // Get or create a default "import" template
    let template: any = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get('import');
    if (!template) {
      const result = db.prepare(`
        INSERT INTO templates (name, folder_name, description, is_active)
        VALUES (?, ?, ?, ?)
      `).run('Import', 'import', 'Imported leads from file', 1);
      template = { id: result.lastInsertRowid, name: 'Import', folder_name: 'import' };
      console.log(`✅ [IMPORT] Created import template (ID: ${template.id})`);
    }
    
    // Get or create a default domain for imports
    let domain: any = db.prepare('SELECT * FROM domains WHERE domain_name = ?').get('file-import');
    if (!domain) {
      const result = db.prepare(`
        INSERT INTO domains (domain_name, template_id, is_active)
        VALUES (?, ?, ?)
      `).run('file-import', template.id, 1);
      domain = { id: result.lastInsertRowid, domain_name: 'file-import' };
      console.log(`✅ [IMPORT] Created import domain (ID: ${domain.id})`);
    }
    
    // Process each lead
    const results = {
      created: 0,
      updated: 0,
      errors: [] as Array<{ lead: ParsedLeadData; error: string }>
    };
    
    for (const parsedLead of parseResult.leads) {
      try {
        const leadData: LeadData = {
          template_id: template.id,
          domain_id: domain.id,
          first_name: parsedLead.first_name,
          last_name: parsedLead.last_name,
          phone: parsedLead.phone,
          email: parsedLead.email,
          date_of_birth: parsedLead.date_of_birth,
          street: parsedLead.street,
          street_number: parsedLead.street_number,
          plz: parsedLead.plz,
          city: parsedLead.city,
          status: 'imported',
          source: 'import',
          additional_data: {
            import_source: req.file.originalname,
            import_timestamp: new Date().toISOString(),
            raw_line: parsedLead.raw_line
          }
        };
        
        const { isUpdate } = leadService.upsertLead(leadData);
        
        if (isUpdate) {
          results.updated++;
        } else {
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          lead: parsedLead,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`✅ [IMPORT] Import complete: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`);
    
    res.json({
      success: true,
      results: {
        total_processed: parseResult.leads.length,
        created: results.created,
        updated: results.updated,
        errors: results.errors.length,
        error_details: results.errors.slice(0, 10) // Return first 10 errors
      },
      parse_stats: parseResult.stats,
      file_info: {
        name: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('❌ [IMPORT] Import error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import file'
    });
  }
});

/**
 * POST /api/import/manual
 * Manually import a single lead (for testing or single entries)
 */
router.post('/manual', requireAdmin, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      date_of_birth,
      street,
      street_number,
      plz,
      city
    } = req.body;
    
    if (!first_name && !last_name) {
      return res.status(400).json({
        success: false,
        error: 'At least first_name or last_name is required'
      });
    }
    
    // Get default template and domain
    const db = getDb();
    
    let template: any = db.prepare('SELECT * FROM templates WHERE folder_name = ?').get('import');
    if (!template) {
      const result = db.prepare(`
        INSERT INTO templates (name, folder_name, description, is_active)
        VALUES (?, ?, ?, ?)
      `).run('Import', 'import', 'Imported leads', 1);
      template = { id: result.lastInsertRowid };
    }
    
    let domain: any = db.prepare('SELECT * FROM domains WHERE domain_name = ?').get('manual-import');
    if (!domain) {
      const result = db.prepare(`
        INSERT INTO domains (domain_name, template_id, is_active)
        VALUES (?, ?, ?)
      `).run('manual-import', template.id, 1);
      domain = { id: result.lastInsertRowid };
    }
    
    const leadData: LeadData = {
      template_id: template.id,
      domain_id: domain.id,
      first_name,
      last_name,
      phone,
      email,
      date_of_birth,
      street,
      street_number,
      plz,
      city,
      status: 'imported',
      source: 'import',
      additional_data: {
        import_source: 'manual_entry',
        import_timestamp: new Date().toISOString()
      }
    };
    
    const { leadId, isUpdate, existingLead } = leadService.upsertLead(leadData);
    
    res.json({
      success: true,
      lead_id: leadId,
      is_update: isUpdate,
      message: isUpdate 
        ? `Updated existing lead (ID: ${leadId}, submissions: ${(existingLead?.submission_count || 0) + 1})`
        : `Created new lead (ID: ${leadId})`
    });
  } catch (error) {
    console.error('❌ [IMPORT] Manual import error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import lead'
    });
  }
});

/**
 * GET /api/import/template
 * Download a sample import template
 */
router.get('/template', requireAdmin, (req, res) => {
  const format = req.query.format || 'pipe';
  
  let content: string;
  let filename: string;
  
  if (format === 'csv') {
    content = `first_name,last_name,phone,date_of_birth,street,street_number,plz,city,email
Max,Mustermann,+491234567890,01.01.1990,Musterstr.,1,12345,Berlin,max@example.com
Anna,Schmidt,+499876543210,15.06.1985,Hauptstr.,42,54321,München,anna@example.com`;
    filename = 'import_template.csv';
  } else {
    content = `Full Name | Phone | DOB | Address
Max Mustermann | +491234567890 | 01.01.1990 | Musterstr. 1, 12345 Berlin
Anna Schmidt | +499876543210 | 15.06.1985 | Hauptstr. 42, 54321 München`;
    filename = 'import_template.txt';
  }
  
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(content);
});

/**
 * GET /api/import/stats
 * Get import statistics
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    const totalImported = db.prepare(`
      SELECT COUNT(*) as count FROM leads WHERE source = 'import'
    `).get() as { count: number };
    
    const recentImports = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM leads 
      WHERE source = 'import'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all();
    
    const duplicatesUpdated = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE source = 'import' AND submission_count > 1
    `).get() as { count: number };
    
    res.json({
      success: true,
      stats: {
        total_imported: totalImported.count,
        duplicates_updated: duplicatesUpdated.count,
        recent_imports: recentImports
      }
    });
  } catch (error) {
    console.error('❌ [IMPORT] Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch import stats'
    });
  }
});

export default router;

