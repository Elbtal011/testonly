import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  Clock, 
  Users, 
  Eye, 
  Settings,
  RefreshCw,
  Save,
  Trash2,
  BarChart3,
  Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BlockedVisitor {
  id: number;
  ip_address: string;
  user_agent: string;
  detection_method: string;
  detection_score: number;
  detection_reasons: string;
  requested_path: string;
  geo_country: string;
  geo_region: string;
  blocked_at: string;
}

interface SecurityStats {
  totalBlocked: number;
  blockedToday: number;
  blockedThisWeek: number;
  blockedInRange: number;
  topBlockedCountries: Array<{ country: string; count: number }>;
  topDetectionMethods: Array<{ method: string; count: number }>;
  topUserAgents: Array<{ user_agent: string; count: number }>;
  hourlyStats: Array<{ hour: string; count: number }>;
}

interface AntiBotConfig {
  [key: string]: {
    value: any;
    description: string;
    type: 'boolean' | 'number' | 'string' | 'array';
    updated_at: string;
  };
}

export const Security: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'blocked' | 'config'>('overview');
  const [configChanges, setConfigChanges] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  
  // Get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });
  
  // Fetch blocked visitors
  const { data: blockedData, isLoading: loadingBlocked } = useQuery({
    queryKey: ['blocked-visitors', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/security/blocked-visitors?range=${timeRange}&limit=50`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch blocked visitors');
      return response.json();
    }
  });
  
  // Fetch security stats
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['security-stats', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/security/stats?range=${timeRange}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch security stats');
      return response.json();
    }
  });
  
  // Fetch anti-bot configuration
  const { data: configData, isLoading: loadingConfig } = useQuery({
    queryKey: ['antibot-config'],
    queryFn: async () => {
      const response = await fetch('/api/security/config', {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch anti-bot config');
      return response.json();
    }
  });
  
  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (configs: Record<string, any>) => {
      const response = await fetch('/api/security/config/bulk', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ configs })
      });
      if (!response.ok) throw new Error('Failed to update configuration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['antibot-config'] });
      setConfigChanges({});
    }
  });
  
  // Refresh patterns mutation
  const refreshPatternsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security/refresh-patterns', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to refresh patterns');
      return response.json();
    }
  });
  
  // Cleanup old records mutation
  const cleanupMutation = useMutation({
    mutationFn: async (days: number) => {
      const response = await fetch(`/api/security/blocked-visitors/cleanup?days=${days}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to cleanup records');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-visitors'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
    }
  });
  
  const stats = statsData?.stats;
  const blockedVisitors = blockedData?.visitors || [];
  const config = configData?.config || {};
  
  // Handle configuration changes
  const handleConfigChange = (key: string, value: any) => {
    setConfigChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save configuration changes
  const handleSaveConfig = () => {
    if (Object.keys(configChanges).length > 0) {
      updateConfigMutation.mutate(configChanges);
    }
  };
  
  // Reset configuration changes
  const handleResetConfig = () => {
    setConfigChanges({});
  };
  
  // Get current config value (with pending changes)
  const getCurrentConfigValue = (key: string) => {
    if (key in configChanges) {
      return configChanges[key];
    }
    return config[key]?.value;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Anti-Bot</h1>
          <p className="text-gray-600 mt-1">Monitor blocked visitors and configure anti-detection settings</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white"
          >
            <option value="24h">Letzte 24 Stunden</option>
            <option value="7d">Letzte 7 Tage</option>
            <option value="30d">Letzte 30 Tage</option>
            <option value="90d">Letzte 90 Tage</option>
          </select>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'blocked', label: 'Blocked Visitors', icon: Shield },
            { id: 'config', label: 'Configuration', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Blocked</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalBlocked || 0}</p>
                </div>
                <Shield className="h-10 w-10 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Blocked Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.blockedToday || 0}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.blockedThisWeek || 0}</p>
                </div>
                <Eye className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Range</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.blockedInRange || 0}</p>
                </div>
                <Users className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Countries */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Meistblockierte Länder</h3>
              <div className="space-y-3">
                {stats?.topBlockedCountries?.slice(0, 5).map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {country.country || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (country.count / (stats?.topBlockedCountries[0]?.count || 1)) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{country.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Detection Methods */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detection Methods</h3>
              <div className="space-y-3">
                {stats?.topDetectionMethods?.map((method, index) => (
                  <div key={method.method} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        method.method === 'user-agent' ? 'bg-red-500' :
                        method.method === 'headers' ? 'bg-orange-500' :
                        method.method === 'geo' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {method.method.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">{method.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Blocked Visitors Tab */}
      {activeTab === 'blocked' && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => cleanupMutation.mutate(30)}
                disabled={cleanupMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Cleanup Old Records</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing {blockedVisitors.length} of {blockedData?.pagination?.total || 0} blocked visitors
            </div>
          </div>
          
          {/* Blocked Visitors Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reasons</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingBlocked ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Loading blocked visitors...
                      </td>
                    </tr>
                  ) : blockedVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No blocked visitors in selected time range
                      </td>
                    </tr>
                  ) : (
                    blockedVisitors.map((visitor: BlockedVisitor) => (
                      <tr key={visitor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(visitor.blocked_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {visitor.ip_address}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            visitor.detection_method === 'user-agent' ? 'bg-red-100 text-red-800' :
                            visitor.detection_method === 'headers' ? 'bg-orange-100 text-orange-800' :
                            visitor.detection_method === 'geo' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {visitor.detection_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`font-medium ${
                            visitor.detection_score >= 10 ? 'text-red-600' :
                            visitor.detection_score >= 6 ? 'text-orange-600' :
                            'text-yellow-600'
                          }`}>
                            {visitor.detection_score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                          <div className="truncate" title={visitor.detection_reasons}>
                            {visitor.detection_reasons}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {visitor.geo_country || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <div className="truncate" title={visitor.requested_path}>
                            {visitor.requested_path}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveConfig}
                disabled={Object.keys(configChanges).length === 0 || updateConfigMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Änderungen speichern</span>
              </button>
              
              <button
                onClick={handleResetConfig}
                disabled={Object.keys(configChanges).length === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={() => refreshPatternsMutation.mutate()}
                disabled={refreshPatternsMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Muster aktualisieren</span>
              </button>
            </div>
            
            {Object.keys(configChanges).length > 0 && (
              <div className="text-sm text-orange-600 font-medium">
                {Object.keys(configChanges).length} unsaved changes
              </div>
            )}
          </div>
          
          {/* Configuration Form */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Anti-Bot Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">Erkennungsschwellen und Verhalten konfigurieren</p>
            </div>
            
            <div className="p-6 space-y-6">
              {loadingConfig ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Lade Konfiguration...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(config).map(([key, configItem]) => (
                    <div key={key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-xs text-gray-500">{configItem.description}</p>
                      
                      {configItem.type === 'boolean' ? (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={getCurrentConfigValue(key)}
                            onChange={(e) => handleConfigChange(key, e.target.checked)}
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            {getCurrentConfigValue(key) ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : configItem.type === 'number' ? (
                        <input
                          type="number"
                          value={getCurrentConfigValue(key)}
                          onChange={(e) => handleConfigChange(key, parseInt(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      ) : configItem.type === 'array' ? (
                        <input
                          type="text"
                          value={Array.isArray(getCurrentConfigValue(key)) ? getCurrentConfigValue(key).join(', ') : getCurrentConfigValue(key)}
                          onChange={(e) => handleConfigChange(key, e.target.value.split(',').map((s: string) => s.trim()))}
                          placeholder="Comma-separated values"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          value={getCurrentConfigValue(key)}
                          onChange={(e) => handleConfigChange(key, e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      )}
                      
                      {key in configChanges && (
                        <div className="text-xs text-orange-600">
                          Changed from: {JSON.stringify(config[key]?.value)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
