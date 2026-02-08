import React, { useState } from 'react';
import { Mail, Edit, Trash, Copy, Loader, AlertCircle, Eye, Plus } from 'lucide-react';
import { useEmailTemplates, EmailTemplate } from '../hooks/useEmailTemplates';
import { useNavigate } from 'react-router-dom';

export const EmailTemplates: React.FC = () => {
  const {
    templates,
    isLoading,
    error,
    createTemplate,
    deleteTemplate,
    isCreating,
    isDeleting
  } = useEmailTemplates();

  const navigate = useNavigate();
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | undefined>(undefined);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);

  // Navigate to create new template page
  const handleCreateNew = () => {
    navigate('/admin/email-templates/new');
  };

  // Navigate to edit template page
  const handleEdit = (template: EmailTemplate) => {
    navigate(`/admin/email-templates/${template.id}`);
  };

  // Handle template deletion
  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id);
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Toggle preview panel for a template
  const togglePreview = (template: EmailTemplate) => {
    if (previewTemplate?.id === template.id) {
      setPreviewTemplate(undefined); // Close preview if already open
    } else {
      setPreviewTemplate(template); // Open preview for this template
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">E-Mail Vorlagen</h1>
        <button 
          onClick={handleCreateNew}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Neue Vorlage
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin h-8 w-8 text-indigo-600" />
          <span className="ml-2 text-gray-600">Lade E-Mail-Vorlagen...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Fehler beim Laden der E-Mail-Vorlagen
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine E-Mail-Vorlagen vorhanden</h3>
          <p className="text-gray-500 mb-4">Erstellen Sie Ihre erste E-Mail-Vorlage, um zu beginnen.</p>
          <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Erste Vorlage erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{template.name}</h2>
                    <p className="text-sm text-gray-500">{template.subject}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      {template.bank_name && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {template.bank_name}
                        </span>
                      )}
                      {template.template_type && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {template.template_type}
                        </span>
                      )}
                      {template.deliverability_score && template.deliverability_score > 0 && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.deliverability_score >= 80 ? 'bg-green-100 text-green-800' :
                          template.deliverability_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          Score: {template.deliverability_score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => togglePreview(template)}
                    className={`p-1 ${previewTemplate?.id === template.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-500'}`}
                    title="Vorschau"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => {
                      const templateCopy = { ...template };
                      // Create a copy by changing the name slightly
                      templateCopy.name = `${templateCopy.name} (Kopie)`;
                      delete (templateCopy as any).id;
                      delete (templateCopy as any).created_at;
                      delete (templateCopy as any).last_modified;
                      createTemplate(templateCopy);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Duplizieren"
                    disabled={isCreating}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => handleEdit(template)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                    title="Bearbeiten"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmationId(template.id)}
                    className="p-1 text-red-400 hover:text-red-500"
                    title="Löschen"
                  >
                    <Trash className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded-full">
                  {template.category || 'Keine Kategorie'}
                </span>
                <span>Zuletzt bearbeitet: {new Date(template.last_modified).toLocaleDateString('de-DE')}</span>
              </div>
              
              {/* Delete confirmation */}
              {deleteConfirmationId === template.id && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 mb-2">Sind Sie sicher, dass Sie diese E-Mail-Vorlage löschen möchten?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setDeleteConfirmationId(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Preview panel */}
              {previewTemplate?.id === template.id && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-medium">Vorschau: {template.subject}</span>
                    <button 
                      onClick={() => setPreviewTemplate(undefined)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 max-h-96 overflow-auto bg-white">
                    <div dangerouslySetInnerHTML={{ __html: template.html_content }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
