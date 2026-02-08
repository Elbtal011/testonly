import express from 'express';
import { getDb } from '../database';
import { requireAdmin } from '../middleware';

const router = express.Router();

// Comprehensive database diagnostics for lead counting issues
router.get('/lead-counts', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    console.log('🔍 [DIAGNOSTICS] Starting comprehensive lead count analysis...');
    
    // 1. Raw lead counts
    const totalLeadsRaw = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    console.log(`📊 Total leads (raw): ${totalLeadsRaw.count}`);
    
    // 2. Leads with valid template_id
    const leadsWithValidTemplate = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      WHERE l.template_id IN (SELECT id FROM templates)
    `).get() as { count: number };
    console.log(`📊 Leads with valid template_id: ${leadsWithValidTemplate.count}`);
    
    // 3. Leads with JOIN (what Protokolle page uses)
    const leadsWithJoin = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      JOIN templates t ON l.template_id = t.id
      JOIN domains d ON l.domain_id = d.id
    `).get() as { count: number };
    console.log(`📊 Leads with JOIN (Protokolle query): ${leadsWithJoin.count}`);
    
    // 4. Orphaned leads (invalid template_id)
    const orphanedLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      WHERE l.template_id NOT IN (SELECT id FROM templates)
    `).get() as { count: number };
    console.log(`⚠️ Orphaned leads (invalid template_id): ${orphanedLeads.count}`);
    
    // 5. Orphaned leads (invalid domain_id)
    const orphanedDomainLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      WHERE l.domain_id NOT IN (SELECT id FROM domains)
    `).get() as { count: number };
    console.log(`⚠️ Orphaned leads (invalid domain_id): ${orphanedDomainLeads.count}`);
    
    // 6. Breakdown by status
    const statusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count FROM leads
      GROUP BY status
      ORDER BY count DESC
    `).all();
    console.log('📊 Status breakdown:', statusBreakdown);
    
    // 7. Template-specific counts (what template stats show)
    const templateCounts = db.prepare(`
      SELECT 
        t.id,
        t.name,
        t.folder_name,
        (SELECT COUNT(*) FROM leads WHERE template_id = t.id) as direct_count,
        COUNT(l.id) as join_count
      FROM templates t
      LEFT JOIN leads l ON l.template_id = t.id
      GROUP BY t.id
      ORDER BY direct_count DESC
    `).all();
    console.log('📊 Template counts comparison:', templateCounts);
    
    // 8. Find specific Klarna leads
    const klarnaTemplate = db.prepare('SELECT id FROM templates WHERE folder_name = "klarna"').get() as { id: number } | undefined;
    if (klarnaTemplate) {
      const klarnaLeadsRaw = db.prepare('SELECT COUNT(*) as count FROM leads WHERE template_id = ?').get(klarnaTemplate.id) as { count: number };
      const klarnaLeadsJoin = db.prepare(`
        SELECT COUNT(*) as count FROM leads l
        JOIN templates t ON l.template_id = t.id
        JOIN domains d ON l.domain_id = d.id
        WHERE t.folder_name = 'klarna'
      `).get() as { count: number };
      
      console.log(`🎯 Klarna leads (direct): ${klarnaLeadsRaw.count}`);
      console.log(`🎯 Klarna leads (JOIN): ${klarnaLeadsJoin.count}`);
      
      // Get sample of Klarna leads that might be missing from JOIN
      const missingFromJoin = db.prepare(`
        SELECT l.id, l.template_id, l.domain_id, l.status, l.created_at
        FROM leads l
        WHERE l.template_id = ?
        AND l.id NOT IN (
          SELECT l2.id FROM leads l2
          JOIN templates t ON l2.template_id = t.id
          JOIN domains d ON l2.domain_id = d.id
          WHERE t.folder_name = 'klarna'
        )
        LIMIT 10
      `).all(klarnaTemplate.id);
      
      console.log('🔍 Klarna leads missing from JOIN:', missingFromJoin);
    }
    
    // 9. Check for duplicate leads
    const duplicateCheck = db.prepare(`
      SELECT tracking_id, COUNT(*) as count
      FROM leads
      WHERE tracking_id IS NOT NULL
      GROUP BY tracking_id
      HAVING count > 1
      ORDER BY count DESC
      LIMIT 10
    `).all();
    console.log('🔍 Potential duplicate leads:', duplicateCheck);
    
    res.json({
      diagnostics: {
        totalLeadsRaw: totalLeadsRaw.count,
        leadsWithValidTemplate: leadsWithValidTemplate.count,
        leadsWithJoin: leadsWithJoin.count,
        orphanedLeads: orphanedLeads.count,
        orphanedDomainLeads: orphanedDomainLeads.count,
        statusBreakdown,
        templateCounts,
        duplicateCheck,
        discrepancy: totalLeadsRaw.count - leadsWithJoin.count
      }
    });
  } catch (error) {
    console.error('Error running lead diagnostics:', error);
    res.status(500).json({ error: 'Failed to run diagnostics' });
  }
});

// Fix orphaned leads by creating default domains
router.post('/fix-orphaned-leads', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    // Find orphaned leads (invalid domain_id)
    const orphanedLeads = db.prepare(`
      SELECT DISTINCT l.template_id, t.folder_name
      FROM leads l
      JOIN templates t ON l.template_id = t.id
      WHERE l.domain_id NOT IN (SELECT id FROM domains)
    `).all();
    
    let fixedCount = 0;
    
    for (const orphan of orphanedLeads) {
      // Create a default domain for this template
      const result = db.prepare(`
        INSERT OR IGNORE INTO domains (domain_name, template_id, is_active)
        VALUES (?, ?, 1)
      `).run(`default-${orphan.folder_name}.local`, orphan.template_id);
      
      if (result.lastInsertRowid) {
        // Update orphaned leads to use this domain
        const updateResult = db.prepare(`
          UPDATE leads 
          SET domain_id = ?
          WHERE template_id = ? AND domain_id NOT IN (SELECT id FROM domains)
        `).run(result.lastInsertRowid, orphan.template_id);
        
        fixedCount += updateResult.changes;
        console.log(`✅ Fixed ${updateResult.changes} orphaned leads for ${orphan.folder_name}`);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} orphaned leads`,
      fixedCount
    });
  } catch (error) {
    console.error('Error fixing orphaned leads:', error);
    res.status(500).json({ error: 'Failed to fix orphaned leads' });
  }
});

export default router;
