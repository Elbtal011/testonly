import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authenticatedFetch } from '../utils/api';
import { BarChart, TrendingUp, Users, Target, Clock, AlertTriangle } from 'lucide-react';

interface DashboardAnalytics {
  overview: {
    totalSessions: number;
    completedSessions: number;
    activeTemplates: number;
    activeSessions: number;
    overallConversionRate: number;
  };
  templateBreakdown: {
    templateName: string;
    sessions: number;
    completed: number;
    conversionRate: number;
  }[];
  recentActivity: {
    templateName: string;
    state: string;
    createdAt: string;
    ipAddress: string;
  }[];
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

export const Analytics: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Fetch dashboard analytics
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardAnalytics>({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await authenticatedFetch('/analytics/dashboard');
      const data = await response.json();
      return data.analytics;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch template-specific analytics
  const { data: templateData, isLoading: templateLoading } = useQuery<TemplateAnalytics>({
    queryKey: ['template-analytics', selectedTemplate],
    queryFn: async () => {
      if (!selectedTemplate) return null;
      const response = await authenticatedFetch(`/analytics/template/${selectedTemplate}`);
      const data = await response.json();
      return data.analytics;
    },
    enabled: !!selectedTemplate,
    refetchInterval: 30000
  });

  const overview = dashboardData?.overview || {};
  const templateBreakdown = dashboardData?.templateBreakdown || [];
  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sitzungsanalysen</h1>
          <p className="text-gray-600">Template-Leistung und Benutzerverhalten überwachen</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Gesamte Sitzungen</h3>
                <p className="text-2xl font-bold text-gray-900">{overview.totalSessions || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Abgeschlossen</h3>
                <p className="text-2xl font-bold text-gray-900">{overview.completedSessions || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Konversionsrate</h3>
                <p className="text-2xl font-bold text-gray-900">{overview.overallConversionRate || 0}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Aktive Templates</h3>
                <p className="text-2xl font-bold text-gray-900">{overview.activeTemplates || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Aktive Sitzungen</h3>
                <p className="text-2xl font-bold text-gray-900">{overview.activeSessions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Performance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Template Performance</h2>
            </div>
            <div className="p-6">
              {dashboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Lade Analysen...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {templateBreakdown.map((template) => (
                    <div
                      key={template.templateName}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTemplate(template.templateName)}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {template.templateName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {template.sessions} sessions • {template.completed} completed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {template.conversionRate}%
                        </div>
                        <div className="text-sm text-gray-500">conversion</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Neueste Aktivitäten</h2>
            </div>
            <div className="p-6">
              {dashboardLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <span className="font-medium capitalize">{activity.templateName}</span>
                        <span className="text-gray-500"> → {activity.state}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template-Specific Analytics */}
        {selectedTemplate && (
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 capitalize">
                  {selectedTemplate} Analytics
                </h2>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {templateLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : templateData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Template Stats */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Sessions:</span>
                        <span className="font-medium">{templateData.totalSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Abgeschlossene Sitzungen:</span>
                        <span className="font-medium">{templateData.completedSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Konversionsrate:</span>
                        <span className="font-medium">{templateData.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Durchschnittliche Dauer:</span>
                        <span className="font-medium">{Math.round(templateData.averageDuration / 60)}m</span>
                      </div>
                    </div>
                  </div>

                  {/* Abandonment Points */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Häufige Abbruchpunkte</h3>
                    <div className="space-y-2">
                      {templateData.commonAbandonmentPoints.slice(0, 5).map((point, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm font-medium capitalize">{point.step.replace('_', ' ')}</span>
                          </div>
                          <span className="text-sm text-red-600">{point.count} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
