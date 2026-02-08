import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Inbox, Send, Eye, MousePointer, UserMinus, RefreshCw } from 'lucide-react';

interface EmailTrackingStatsProps {
  campaignId: string;
  refreshInterval?: number; // in seconds
}

interface StatsData {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  failed: number;
}

// Define colors for charts

export const EmailTrackingStats: React.FC<EmailTrackingStatsProps> = ({ campaignId, refreshInterval = 0 }) => {
  const [stats, setStats] = useState<StatsData>({
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    unsubscribed: 0,
    failed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/campaigns/${campaignId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaign statistics');
      }

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign stats:', err);
      setError('Fehler beim Laden der Kampagnenstatistiken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up auto-refresh if interval is provided and greater than 0
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchStats, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [campaignId, refreshInterval]);

  const barChartData = [
    { name: 'Gesendet', value: stats.sent, color: '#0088FE' },
    { name: 'Zugestellt', value: stats.delivered, color: '#00C49F' },
    { name: 'Geöffnet', value: stats.opened, color: '#FFBB28' },
    { name: 'Geklickt', value: stats.clicked, color: '#FF8042' },
    { name: 'Abgemeldet', value: stats.unsubscribed, color: '#8884d8' },
    { name: 'Fehlgeschlagen', value: stats.failed, color: '#FF0000' }
  ];

  const pieChartData = [
    { name: 'Nicht geöffnet', value: stats.delivered - stats.opened - stats.failed, color: '#0088FE' },
    { name: 'Geöffnet', value: stats.opened - stats.clicked, color: '#FFBB28' },
    { name: 'Geklickt', value: stats.clicked, color: '#FF8042' },
    { name: 'Abgemeldet', value: stats.unsubscribed, color: '#8884d8' },
    { name: 'Fehlgeschlagen', value: stats.failed, color: '#FF0000' }
  ].filter(item => item.value > 0);

  const statCards = [
    { title: 'Gesendet', value: stats.sent, icon: Send, color: '#0088FE' },
    { title: 'Zugestellt', value: stats.delivered, icon: Inbox, color: '#00C49F' },
    { title: 'Geöffnet', value: stats.opened, icon: Eye, color: '#FFBB28' },
    { title: 'Geklickt', value: stats.clicked, icon: MousePointer, color: '#FF8042' },
    { title: 'Abgemeldet', value: stats.unsubscribed, icon: UserMinus, color: '#8884d8' }
  ];

  // Calculate open rate and click rate
  const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered * 100).toFixed(1) : '0';
  const clickRate = stats.opened > 0 ? (stats.clicked / stats.opened * 100).toFixed(1) : '0';
  const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent * 100).toFixed(1) : '0';

  if (loading && !lastUpdated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-2"></div>
        <span className="text-gray-600">Lade Statistiken...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw size={14} className="mr-1" />
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Kampagnenstatistiken</h2>
        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Zuletzt aktualisiert: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStats}
            className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Aktualisieren</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full" style={{ backgroundColor: `${card.color}20` }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-xl font-semibold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Zustellrate</h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">{deliveryRate}%</span>
            <span className="text-xs text-gray-500 mb-1">({stats.delivered}/{stats.sent})</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${deliveryRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Öffnungsrate</h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">{openRate}%</span>
            <span className="text-xs text-gray-500 mb-1">({stats.opened}/{stats.delivered})</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${openRate}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Klickrate</h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">{clickRate}%</span>
            <span className="text-xs text-gray-500 mb-1">({stats.clicked}/{stats.opened})</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${clickRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Übersicht nach Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Verteilung der Interaktionen</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
