// Dashboard calculation utilities

export interface TrendData {
  current: number;
  previous: number;
  growth: number;
  direction: 'up' | 'down' | 'neutral';
}

/**
 * Calculate weekly growth percentage
 */
export const calculateWeeklyGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

/**
 * Get trend direction based on growth value
 */
export const getTrendDirection = (growth: number): 'up' | 'down' | 'neutral' => {
  if (growth > 0) return 'up';
  if (growth < 0) return 'down';
  return 'neutral';
};

/**
 * Calculate trend data with growth and direction
 */
export const calculateTrend = (current: number, previous: number): TrendData => {
  const growth = calculateWeeklyGrowth(current, previous);
  return {
    current,
    previous,
    growth,
    direction: getTrendDirection(growth)
  };
};

/**
 * Get date range for API queries
 */
export const getDateRange = (timeRange: string) => {
  const now = new Date();
  
  switch (timeRange) {
    case '24h':
      return {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        end: now
      };
    case '7d':
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case '30d':
      return {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    case '90d':
      return {
        start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        end: now
      };
    default:
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
  }
};

/**
 * Get previous period for comparison
 */
export const getPreviousPeriod = (timeRange: string) => {
  const { start, end } = getDateRange(timeRange);
  const duration = end.getTime() - start.getTime();
  
  return {
    start: new Date(start.getTime() - duration),
    end: start
  };
};

/**
 * Format relative time for activity feed
 */
export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Gerade eben';
  if (diffInMinutes < 60) return `${diffInMinutes} Min`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} Std`;
  return `${Math.floor(diffInMinutes / 1440)} Tag${diffInMinutes >= 2880 ? 'e' : ''}`;
};

/**
 * Get template performance color based on ranking
 */
export const getTemplatePerformanceColor = (rank: number, total: number): string => {
  const percentage = rank / total;
  
  if (percentage <= 0.2) return 'bg-red-500'; // Top 20%
  if (percentage <= 0.4) return 'bg-red-400'; // Top 40%
  if (percentage <= 0.6) return 'bg-red-300'; // Top 60%
  return 'bg-gray-400'; // Bottom 40%
};

/**
 * Aggregate recent activities from different sources
 */
export const aggregateRecentActivities = (
  recentLeads: any[],
  recentCampaigns: any[],
  recentTemplateChanges: any[]
): RecentActivity[] => {
  const activities: any[] = [];
  
  // Add recent leads
  recentLeads.slice(0, 3).forEach(lead => {
    activities.push({
      id: `lead-${lead.id}`,
      type: 'lead',
      template: lead.template_name,
      message: `Neue Anmeldung von ${lead.name || 'Unbekannt'}`,
      time: getRelativeTime(lead.created_at),
      timestamp: new Date(lead.created_at),
      icon: 'Users',
      color: 'text-green-600'
    });
  });
  
  // Add recent campaigns (if available)
  recentCampaigns.slice(0, 2).forEach(campaign => {
    activities.push({
      id: `campaign-${campaign.id}`,
      type: 'campaign',
      template: campaign.template_name,
      message: `Kampagne "${campaign.name}" gestartet`,
      time: getRelativeTime(campaign.created_at),
      timestamp: new Date(campaign.created_at),
      icon: 'Mail',
      color: 'text-gray-600'
    });
  });
  
  // Sort by timestamp (newest first) and return top 5
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);
};

interface RecentActivity {
  id: string;
  type: 'lead' | 'campaign' | 'template' | 'alert';
  template?: string;
  message: string;
  time: string;
  timestamp: Date;
  icon: string;
  color: string;
}
