import React, { useState, useEffect } from 'react';
import { EmailTemplate } from '../hooks/useEmailTemplates';

interface EmailTemplateModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  template?: EmailTemplate;
  onClose: () => void;
  onSave: (template: Partial<EmailTemplate>) => void;
  isLoading: boolean;
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  mode,
  template,
  onClose,
  onSave,
  isLoading
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [category, setCategory] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (template && mode === 'edit') {
      setName(template.name);
      setSubject(template.subject);
      setHtmlContent(template.html_content);
      setCategory(template.category || '');
    } else {
      // Default template for new email
      setName('');
      setSubject('');
      setHtmlContent(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #003366; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ihre E-Mail-Überschrift</h1>
    </div>
    <div class="content">
      <p>Sehr geehrte/r {{name}},</p>
      <p>Hier ist der Hauptinhalt Ihrer E-Mail.</p>
      <p>Mit freundlichen Grüßen,<br>Ihr Team</p>
    </div>
    <div class="footer">
      <p>Diese E-Mail wurde automatisch generiert.</p>
    </div>
  </div>
</body>
</html>`);
      setCategory('');
    }
  }, [template, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData = {
      ...(template && { id: template.id }),
      name,
      subject,
      html_content: htmlContent,
      category: category || undefined
    };
    
    onSave(templateData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'create' ? 'Neue E-Mail-Vorlage erstellen' : 'E-Mail-Vorlage bearbeiten'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`px-4 py-2 rounded ${!previewMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`px-4 py-2 rounded ${previewMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Vorschau
            </button>
          </div>

          {previewMode ? (
            <div className="border rounded-lg p-4 h-[60vh] overflow-auto">
              <div className="mb-4">
                <h3 className="font-bold text-gray-700">Betreff: {subject}</h3>
              </div>
              <div 
                className="email-preview"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name der Vorlage
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:border-gray-400 transition-colors focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail-Betreff
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:border-gray-400 transition-colors focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:border-gray-400 transition-colors focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  >
                    <option value="">-- Wählen Sie eine Kategorie --</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Vertrieb">Vertrieb</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Support">Support</option>
                    <option value="Benachrichtigung">Benachrichtigung</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700 mb-2">
                    HTML-Inhalt
                  </label>
                  <textarea
                    id="htmlContent"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:border-gray-400 transition-colors focus:border-red-500 focus:ring-red-500 sm:text-sm font-mono"
                    rows={15}
                    required
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Abbrechen
          </button>
          {!previewMode && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Wird gespeichert...' : 'Speichern'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
