import React, { useState } from 'react';
import { Globe, Check, X, Plus, Edit, Trash2, Loader, AlertTriangle, Shield, Calendar, BarChart3, Power } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDomains } from '../hooks/useDomains';
import { useAuth } from '../context/AuthContext';
import { templateAPI } from '../utils/api';

interface Domain {
  id: number;
  domain_name: string;
  template_id: number;
  template_name: string;
  template_folder: string;
  is_active: number;
  ssl_enabled: number;
  nginx_config: string;
  created_at: string;
  last_modified: string;
}

interface CreateDomainData {
  domain_name: string;
  template_id: number;
  is_active: boolean;
  ssl_enabled: boolean;
}

export const Domains: React.FC = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<number | null>(null);

  // Fetch domains using the hook
  const { domains, isLoading, error, refetch } = useDomains();

  // Fetch templates for domain creation using the working templateAPI
  const { data: templatesWithStats = [], isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['templates-with-stats'],
    queryFn: templateAPI.getTemplatesWithStats,
    onError: (error: any) => {
      console.error('Templates query error:', error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      }
    }
  });

  // Extract just the template data for the dropdown
  const templates = templatesWithStats.map(t => ({
    id: t.id,
    name: t.name,
    folder_name: t.folder_name
  }));

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: async (domainData: CreateDomainData) => {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(domainData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create domain');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      console.error('Create domain error:', error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      } else {
        alert(`Fehler beim Erstellen der Domain: ${error.message}`);
      }
    }
  });

  // Toggle domain status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (domainId: number) => {
      const response = await fetch(`/api/domains/${domainId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle domain status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
    onError: (error: any) => {
      console.error('Toggle domain status error:', error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      } else {
        alert(`Fehler beim Ändern des Domain-Status: ${error.message}`);
      }
    }
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: number) => {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete domain');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setDeletingDomain(null);
    },
    onError: (error: any) => {
      console.error('Delete domain error:', error);
      setDeletingDomain(null);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      } else {
        alert(`Fehler beim Löschen der Domain: ${error.message}`);
      }
    }
  });

  // Handle form submission
  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const domainData: CreateDomainData = {
      domain_name: formData.get('domain_name') as string,
      template_id: parseInt(formData.get('template_id') as string),
      is_active: formData.get('is_active') === 'on',
      ssl_enabled: formData.get('ssl_enabled') === 'on'
    };

    createDomainMutation.mutate(domainData);
  };

  // Handle toggle domain status
  const handleToggleStatus = (domainId: number) => {
    toggleStatusMutation.mutate(domainId);
  };

  // Handle delete domain
  const handleDeleteDomain = (domainId: number) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Domain löschen möchten?')) {
      setDeletingDomain(domainId);
      deleteDomainMutation.mutate(domainId);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-red-600 animate-spin" />
        <span className="ml-2 text-gray-600">Lade Domains...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>Fehler beim Laden der Domains: {error.message}</span>
        </div>
        <button 
          onClick={() => refetch()}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domains</h1>
          <p className="text-sm text-gray-500 mt-1">
            Verwalten Sie Ihre Domains und deren Template-Zuordnungen
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Domain hinzufügen
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Globe className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gesamt Domains</p>
              <p className="text-2xl font-semibold text-gray-900">{domains.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktive Domains</p>
              <p className="text-2xl font-semibold text-gray-900">
                {domains.filter(d => d.is_active === 1).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">SSL Aktiviert</p>
              <p className="text-2xl font-semibold text-gray-900">
                {domains.filter(d => d.ssl_enabled === 1).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Templates</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(domains.map(d => d.template_id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>Domain</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Template</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SSL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Erstellt am</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Globe className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Keine Domains gefunden</h3>
                      <p className="text-sm text-gray-500">
                        Erstellen Sie Ihre erste Domain, um zu beginnen.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                domains.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{domain.domain_name}</div>
                          <div className="text-xs text-gray-500">ID: {domain.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-6 w-6 bg-gray-100 rounded flex items-center justify-center">
                          <Shield className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{domain.template_name}</div>
                          <div className="text-xs text-gray-500">{domain.template_folder}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          domain.is_active === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {domain.is_active === 1 ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {domain.ssl_enabled === 1 ? (
                          <div className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" />
                            <span className="text-xs">SSL</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <X className="h-4 w-4 mr-1" />
                            <span className="text-xs">Kein SSL</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(domain.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(domain.created_at).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleToggleStatus(domain.id)}
                          disabled={toggleStatusMutation.isPending}
                          className={`p-2 rounded-full transition-colors ${
                            domain.is_active === 1 
                              ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={domain.is_active === 1 ? 'Domain deaktivieren' : 'Domain aktivieren'}
                        >
                          {toggleStatusMutation.isPending ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => setEditingDomain(domain)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                          title="Domain bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDomain(domain.id)}
                          disabled={deletingDomain === domain.id}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Domain löschen"
                        >
                          {deletingDomain === domain.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Domain Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Domain erstellen</h3>
            <form onSubmit={handleCreateDomain}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domain Name</label>
                  <input
                    name="domain_name"
                    type="text"
                    placeholder="z.B. meine-bank.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <select
                    name="template_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                    required
                    disabled={templatesLoading}
                  >
                    <option value="">
                      {templatesLoading ? 'Templates werden geladen...' : '-- Template auswählen --'}
                    </option>
                    {templates.map((template: any) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.folder_name})
                      </option>
                    ))}
                  </select>
                  {templatesError && (
                    <p className="mt-1 text-sm text-red-600">
                      Fehler beim Laden der Templates: {templatesError.message}
                    </p>
                  )}
                  {!templatesLoading && templates.length === 0 && (
                    <p className="mt-1 text-sm text-yellow-600">
                      Keine Templates verfügbar
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      name="is_active"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Domain aktivieren</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      name="ssl_enabled"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">SSL aktivieren</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={createDomainMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createDomainMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Erstelle...
                    </>
                  ) : (
                    'Domain erstellen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};