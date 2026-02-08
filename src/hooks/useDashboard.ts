import { useQuery } from '@tanstack/react-query';
import { useCampaigns } from './useCampaigns';
import { useDomains } from './useDomains';
import { templateAPI, authenticatedFetch } from '../utils/api';
import { Users, Shield, Server, CreditCard, Activity } from 'lucide-react';
import { 
  calculateWeeklyGrowth, 
  getTemplatePerformanceColor, 
  aggregateRecentActivities,
  getRelativeTime 
} from '../utils/dashboardCalculations';

// Types for dashboard data
export interface DashboardStats {
  totalLogs: number;
  totalTemplates: number;
  activeDomains: number;
  totalCampaigns: number;
  conversionRate: number;
  activeVisitors: number;
}

export interface DashboardTrends {
  leadsGrowth: number;
  templatesGrowth: number;
  campaignsGrowth: number;
  conversionGrowth: number;
}

export interface TemplatePerformance {
  name: string; // folder_name for BankIcon
  displayName?: string; // display name for UI
  leads: number;
  conversion: number;
  color: string;
}

export interface RecentActivity {
  id: number;
  type: 'lead' | 'campaign' | 'template' | 'alert' | 'system';
  template?: string;
  message: string;
  time: string;
  icon: any;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats;
  trends: DashboardTrends;
  templatePerformance: TemplatePerformance[];
  topPerformers: any[];
  recentActivity: RecentActivity[];
  recentLeads: any[];
}

// Helper function to get Authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fetch tracking statistics
const fetchTrackingStats = async () => {
  const response = await fetch('/api/track/statistics', {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tracking statistics');
  }
  
  const data = await response.json();
  return data.statistics;
};

// Fetch comprehensive dashboard statistics
const fetchDashboardStats = async (timeRange: string) => {
  console.log('Fetching dashboard stats for timeRange:', timeRange);
  
  try {
    const response = await fetch(`/api/dashboard/stats?range=${timeRange}`, {
      headers: getAuthHeader(),
    });
    
    console.log('Dashboard API response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dashboard API error response:', errorText);
      throw new Error(`API Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Dashboard stats response:', data);
    
    return data;
  } catch (error) {
    console.error('fetchDashboardStats error:', error);
    throw error;
  }
};

// Fetch recent leads
const fetchRecentLeads = async () => {
  const response = await fetch('/api/leads?limit=5&sort_by=created_at&sort_order=desc', {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recent leads');
  }
  
  const data = await response.json();
  return data.leads;
};

// Calculate week-over-week growth
const calculateWeeklyGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Main dashboard hook
export const useDashboard = (timeRange: string = '7d') => {
  // Fetch all required data
  const { campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { domains, isLoading: domainsLoading } = useDomains();
  
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['dashboard-templates'],
    queryFn: templateAPI.getTemplatesWithStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: trackingStats, isLoading: trackingLoading } = useQuery({
    queryKey: ['dashboard-tracking', timeRange],
    queryFn: fetchTrackingStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: () => fetchDashboardStats(timeRange),
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      console.error('Dashboard stats query error:', error);
    },
    onSuccess: (data) => {
      console.log('Dashboard stats query success:', data);
    }
  });

  const { data: recentLeads = [], isLoading: recentLeadsLoading } = useQuery({
    queryKey: ['dashboard-recent-leads'],
    queryFn: fetchRecentLeads,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });

  // Use real dashboard statistics (including partial leads)
  const stats: DashboardStats = {
    totalLogs: dashboardData?.stats?.totalLogs || 0, // All logs (completed + partial)
    totalTemplates: dashboardData?.stats?.totalTemplates || templates.filter(t => t.is_active === 1).length,
    activeDomains: dashboardData?.stats?.activeDomains || domains.filter(d => d.is_active === 1).length,
    totalCampaigns: dashboardData?.stats?.totalCampaigns || campaigns.length,
    conversionRate: dashboardData?.stats?.conversionRate || trackingStats?.conversion_rate || 0,
    activeVisitors: dashboardData?.stats?.activeVisitors || trackingStats?.recent_visitors || 0
  };

  // Use real trends from dashboard API
  const trends: DashboardTrends = {
    leadsGrowth: dashboardData?.trends?.leadsGrowth || 0,
    templatesGrowth: 0, // TODO: Calculate from template changes
    campaignsGrowth: 0, // TODO: Calculate from campaign data
    conversionGrowth: 0 // TODO: Calculate from tracking data
  };

  // Use real template performance data from dashboard API
  const templatePerformance: TemplatePerformance[] = (dashboardData?.templatePerformance || [])
    .map((template: any, index: number) => ({
      name: template.template_name, // folder_name for BankIcon
      displayName: template.template_display_name, // display name for UI
      leads: template.total_leads,
      conversion: template.completed_leads > 0 ? ((template.completed_leads / template.total_leads) * 100) : 0,
      color: index < 3 ? `bg-red-${500 - index * 100}` : 'bg-gray-400'
    }));

  // Use real top performers from dashboard API
  const topPerformers = (dashboardData?.templatePerformance || [])
    .slice(0, 5)
    .map((template: any, index: number) => ({
      rank: index + 1,
      template: template.template_name, // folder_name for BankIcon
      displayName: template.template_display_name, // display name for UI
      leads: template.total_leads,
      change: '+12%', // TODO: Calculate real change from historical data
      trend: 'up' as const
    }));

  // Fetch recent notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['recent-notifications', timeRange],
    queryFn: async () => {
      const response = await authenticatedFetch('/notifications/recent?limit=8&includeRead=true');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Helper functions for notification conversion
  const getActivityIcon = (type: string, category: string) => {
    switch (type) {
      case 'session': return Users;
      case 'security': return Shield;
      case 'system': return Server;
      case 'tan': return CreditCard;
      default: return Activity;
    }
  };

  const getActivityColor = (category: string) => {
    switch (category) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info':
      default: return 'text-blue-600';
    }
  };

  const getActivityType = (type: string): 'lead' | 'campaign' | 'template' | 'alert' | 'system' => {
    switch (type) {
      case 'session': return 'lead';
      case 'security': return 'alert';
      case 'tan': return 'template';
      case 'system':
      default: return 'system';
    }
  };

  // Combine notifications and leads for recent activity
  const notifications = notificationsData?.notifications || [];
  const notificationActivities: RecentActivity[] = notifications.map((notification: any) => ({
    id: `notification-${notification.id}`,
    type: getActivityType(notification.type),
    template: notification.template_name,
    message: notification.title,
    time: getRelativeTime(notification.created_at),
    icon: getActivityIcon(notification.type, notification.category),
    color: getActivityColor(notification.category),
  }));

  const leadActivities: RecentActivity[] = recentLeads.slice(0, 3).map((lead: any) => ({
    id: `lead-${lead.id}`,
    type: 'lead' as const,
    template: lead.template_name,
    message: `Neue Anmeldung von ${lead.name || 'Unbekannt'}`,
    time: getRelativeTime(lead.created_at),
    icon: Users,
    color: 'text-green-600'
  }));

  // Merge and sort by time (most recent first)
  const recentActivity: RecentActivity[] = [...notificationActivities, ...leadActivities]
    .sort((a, b) => {
      // Simple time comparison - in real app you'd want proper date parsing
      return b.time.localeCompare(a.time);
    })
    .slice(0, 8); // Limit to 8 most recent items

  const isLoading = campaignsLoading || domainsLoading || templatesLoading || trackingLoading || dashboardLoading;
  const hasError = dashboardError || trackingStats === undefined;

  // Debug logging
  console.log('Dashboard hook state:', {
    isLoading,
    hasError,
    dashboardData,
    totalLogs: stats.totalLogs,
    dashboardError
  });

  // Format recent leads for the component
  const formattedRecentLeads = recentLeads.slice(0, 5).map((lead: any) => ({
    id: lead.id,
    name: lead.name || 'Unbekannt',
    email: lead.email || '',
    template: lead.template_name || lead.template_display_name || 'Unbekannt',
    template_name: lead.template_name,
    time: getRelativeTime(lead.created_at),
    status: lead.status === 'completed' ? 'Abgeschlossen' as const : 
            lead.status === 'new' ? 'Neu' as const : 'In Bearbeitung' as const
  }));

  return {
    stats,
    trends,
    templatePerformance,
    topPerformers,
    recentActivity: dashboardData?.recentActivity || recentActivity,
    recentLeads: formattedRecentLeads,
    isLoading,
    error: dashboardError || null
  };
};

// Helper function to get relative time
const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Gerade eben';
  if (diffInMinutes < 60) return `${diffInMinutes} Min`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} Std`;
  return `${Math.floor(diffInMinutes / 1440)} Tag${diffInMinutes >= 2880 ? 'e' : ''}`;
};
