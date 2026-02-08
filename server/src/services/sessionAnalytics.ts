/**
 * Session Analytics Service
 * Tracks session duration, steps, conversion rates, and user behavior
 */

import { getDb } from '../database';

interface SessionAnalytics {
  sessionKey: string;
  templateName: string;
  totalDuration: number; // in seconds
  stepsCompleted: string[];
  conversionRate: number;
  abandonmentPoint?: string;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
}

interface TemplateAnalytics {
  templateName: string;
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
  averageDuration: number;
  commonAbandonmentPoints: { step: string; count: number }[];
  stepsAnalysis: { step: string; completionRate: number }[];
}

class SessionAnalyticsService {
  /**
   * Track session step completion
   */
  async trackStepCompletion(sessionKey: string, step: string, duration: number): Promise<void> {
    const db = getDb();
    
    try {
      // Create session_analytics table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS session_analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_key TEXT NOT NULL,
          step_name TEXT NOT NULL,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          duration_seconds INTEGER DEFAULT 0,
          FOREIGN KEY (session_key) REFERENCES sessions(session_key)
        )
      `);

      // Insert step completion record
      db.prepare(`
        INSERT INTO session_analytics (session_key, step_name, duration_seconds)
        VALUES (?, ?, ?)
      `).run(sessionKey, step, duration);

      console.log(`📊 Tracked step completion: ${sessionKey} -> ${step} (${duration}s)`);
    } catch (error) {
      console.error('Error tracking step completion:', error);
    }
  }

  /**
   * Track session abandonment
   */
  async trackSessionAbandonment(sessionKey: string, abandonmentPoint: string): Promise<void> {
    const db = getDb();
    
    try {
      // Update session with abandonment info
      db.prepare(`
        UPDATE sessions 
        SET current_state = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_key = ?
      `).run(`abandoned_at_${abandonmentPoint}`, sessionKey);

      console.log(`📉 Tracked abandonment: ${sessionKey} at ${abandonmentPoint}`);
    } catch (error) {
      console.error('Error tracking abandonment:', error);
    }
  }

  /**
   * Get session analytics for a specific session
   */
  async getSessionAnalytics(sessionKey: string): Promise<SessionAnalytics | null> {
    const db = getDb();
    
    try {
      // Get session info
      const session = db.prepare(`
        SELECT s.*, 
               (strftime('%s', 'now') - strftime('%s', s.created_at)) as duration_seconds
        FROM sessions s 
        WHERE s.session_key = ?
      `).get(sessionKey) as any;

      if (!session) return null;

      // Get completed steps
      const steps = db.prepare(`
        SELECT step_name, duration_seconds, completed_at
        FROM session_analytics 
        WHERE session_key = ?
        ORDER BY completed_at ASC
      `).all(sessionKey) as any[];

      // Calculate conversion rate (simplified)
      const isCompleted = session.is_completed === 1;
      const conversionRate = isCompleted ? 100 : 0;

      return {
        sessionKey,
        templateName: session.template_name,
        totalDuration: parseInt(session.duration_seconds) || 0,
        stepsCompleted: steps.map(s => s.step_name),
        conversionRate,
        abandonmentPoint: session.current_state?.startsWith('abandoned_at_') 
          ? session.current_state.replace('abandoned_at_', '') 
          : undefined,
        userAgent: session.user_agent || '',
        ipAddress: session.ip_address || '',
        referrer: session.referrer
      };
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return null;
    }
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(templateName: string): Promise<TemplateAnalytics> {
    const db = getDb();
    
    try {
      // Get basic template stats
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
          AVG(strftime('%s', updated_at) - strftime('%s', created_at)) as avg_duration
        FROM sessions 
        WHERE template_name = ?
      `).get(templateName) as any;

      const totalSessions = stats.total_sessions || 0;
      const completedSessions = stats.completed_sessions || 0;
      const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      const averageDuration = Math.round(stats.avg_duration || 0);

      // Get abandonment points
      const abandonmentPoints = db.prepare(`
        SELECT 
          REPLACE(current_state, 'abandoned_at_', '') as step,
          COUNT(*) as count
        FROM sessions 
        WHERE template_name = ? AND current_state LIKE 'abandoned_at_%'
        GROUP BY current_state
        ORDER BY count DESC
        LIMIT 5
      `).all(templateName) as any[];

      // Get step completion rates
      const stepAnalysis = db.prepare(`
        SELECT 
          sa.step_name as step,
          COUNT(DISTINCT sa.session_key) as completed,
          (COUNT(DISTINCT sa.session_key) * 100.0 / ?) as completion_rate
        FROM session_analytics sa
        JOIN sessions s ON sa.session_key = s.session_key
        WHERE s.template_name = ?
        GROUP BY sa.step_name
        ORDER BY completion_rate DESC
      `).all(totalSessions || 1, templateName) as any[];

      return {
        templateName,
        totalSessions,
        completedSessions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageDuration,
        commonAbandonmentPoints: abandonmentPoints.map(p => ({
          step: p.step,
          count: p.count
        })),
        stepsAnalysis: stepAnalysis.map(s => ({
          step: s.step,
          completionRate: Math.round(s.completion_rate * 100) / 100
        }))
      };
    } catch (error) {
      console.error('Error getting template analytics:', error);
      return {
        templateName,
        totalSessions: 0,
        completedSessions: 0,
        conversionRate: 0,
        averageDuration: 0,
        commonAbandonmentPoints: [],
        stepsAnalysis: []
      };
    }
  }

  /**
   * Get overall analytics dashboard data
   */
  async getDashboardAnalytics(): Promise<any> {
    const db = getDb();
    
    try {
      // Get overall stats
      const overallStats = db.prepare(`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
          COUNT(DISTINCT template_name) as active_templates,
          COUNT(CASE WHEN expires_at > datetime('now') THEN 1 END) as active_sessions
        FROM sessions
      `).get() as any;

      // Get template breakdown
      const templateBreakdown = db.prepare(`
        SELECT 
          template_name,
          COUNT(*) as sessions,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed,
          (SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as conversion_rate
        FROM sessions
        GROUP BY template_name
        ORDER BY sessions DESC
      `).all() as any[];

      // Get recent activity (last 24 hours)
      const recentActivity = db.prepare(`
        SELECT 
          template_name,
          current_state,
          created_at,
          ip_address
        FROM sessions
        WHERE created_at > datetime('now', '-24 hours')
        ORDER BY created_at DESC
        LIMIT 20
      `).all() as any[];

      return {
        overview: {
          totalSessions: overallStats.total_sessions || 0,
          completedSessions: overallStats.completed_sessions || 0,
          activeTemplates: overallStats.active_templates || 0,
          activeSessions: overallStats.active_sessions || 0,
          overallConversionRate: overallStats.total_sessions > 0 
            ? Math.round((overallStats.completed_sessions / overallStats.total_sessions) * 100 * 100) / 100
            : 0
        },
        templateBreakdown: templateBreakdown.map(t => ({
          templateName: t.template_name,
          sessions: t.sessions,
          completed: t.completed,
          conversionRate: Math.round(t.conversion_rate * 100) / 100
        })),
        recentActivity: recentActivity.map(a => ({
          templateName: a.template_name,
          state: a.current_state,
          createdAt: a.created_at,
          ipAddress: a.ip_address
        }))
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      return {
        overview: { totalSessions: 0, completedSessions: 0, activeTemplates: 0, activeSessions: 0, overallConversionRate: 0 },
        templateBreakdown: [],
        recentActivity: []
      };
    }
  }

  /**
   * Track conversion funnel for a template
   */
  async getConversionFunnel(templateName: string): Promise<any[]> {
    const db = getDb();
    
    try {
      const funnelSteps = ['login', 'personal_data', 'bank_card', 'qr_upload', 'final_success'];
      const funnel = [];

      for (const step of funnelSteps) {
        const stepData = db.prepare(`
          SELECT COUNT(DISTINCT session_key) as count
          FROM session_analytics sa
          JOIN sessions s ON sa.session_key = s.session_key
          WHERE s.template_name = ? AND sa.step_name = ?
        `).get(templateName, step) as any;

        funnel.push({
          step,
          count: stepData.count || 0
        });
      }

      return funnel;
    } catch (error) {
      console.error('Error getting conversion funnel:', error);
      return [];
    }
  }
}

// Export singleton instance
const sessionAnalytics = new SessionAnalyticsService();
export default sessionAnalytics;
