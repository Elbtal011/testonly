import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Loader } from 'lucide-react';
import { Campaign } from '../../types/campaign';
import { useDomains } from '../../hooks/useDomains';
import { useEmailTemplates } from '../../hooks/useEmailTemplates';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ 
  campaign, 
  onSubmit, 
  onCancel,
  isSubmitting
}) => {
  // Get domains and email templates
  const { domains, isLoading: isLoadingDomains, error: domainsError } = useDomains();
  const { templates, isLoading: isLoadingTemplates, error: templatesError } = useEmailTemplates();
  
  // Form state
  const [name, setName] = useState(campaign?.name || '');
  const [subject, setSubject] = useState(campaign?.subject || '');
  const [fromName, setFromName] = useState(campaign?.fromName || '');
  const [fromEmail, setFromEmail] = useState(campaign?.fromEmail || '');
  const [domainId, setDomainId] = useState(campaign?.domainId || '');
  const [templateId, setTemplateId] = useState<number | undefined>(campaign?.templateId);
  const [content, setContent] = useState(campaign?.content || '');
  const [trackOpens, setTrackOpens] = useState(campaign?.trackOpens !== false);
  const [trackClicks, setTrackClicks] = useState(campaign?.trackClicks !== false);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(
    campaign?.scheduledFor ? new Date(campaign.scheduledFor) : null
  );
  
  const [useTemplate, setUseTemplate] = useState(!!campaign?.templateId);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Update the fromEmail domain suffix when domainId changes
  useEffect(() => {
    if (domainId && domains.length > 0) {
      const selectedDomain = domains.find(d => d.id === domainId);
      if (selectedDomain) {
        // Set email suffix based on domain
        const emailParts = fromEmail.split('@');
        if (emailParts.length === 2) {
          setFromEmail(`${emailParts[0]}@${selectedDomain.name}`);
        } else if (fromEmail === '') {
          setFromEmail(`info@${selectedDomain.name}`);
        }
      }
    }
  }, [domainId, domains, fromEmail]);
  
  // Update content when template changes
  useEffect(() => {
    if (useTemplate && templateId) {
      const selectedTemplate = templates.find(t => t.id === templateId);
      if (selectedTemplate) {
        setContent(selectedTemplate.html_content);
      }
    }
  }, [templateId, templates, useTemplate]);
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) errors.name = 'Name ist erforderlich';
    if (!subject.trim()) errors.subject = 'Betreff ist erforderlich';
    if (!fromName.trim()) errors.fromName = 'Absender-Name ist erforderlich';
    if (!fromEmail.trim()) errors.fromEmail = 'Absender-E-Mail ist erforderlich';
    if (!domainId) errors.domainId = 'Domain ist erforderlich';
    
    if (useTemplate && !templateId) {
      errors.templateId = 'Vorlage ist erforderlich';
    }
    
    if (!useTemplate && !content.trim()) {
      errors.content = 'HTML-Inhalt ist erforderlich';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const formData = {
      name,
      subject,
      fromName,
      fromEmail,
      domainId,
      templateId: useTemplate ? templateId : undefined,
      content: !useTemplate ? content : undefined,
      trackOpens,
      trackClicks,
      scheduledFor: scheduledFor ? scheduledFor.toISOString() : undefined
    };
    
    onSubmit(formData);
  };
  
  const isLoading = isLoadingDomains || isLoadingTemplates;
  const error = domainsError || templatesError;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin h-8 w-8 text-red-600" />
        <span className="ml-2 text-gray-600">Lade Daten...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        Fehler beim Laden der erforderlichen Daten
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Campaign Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 mb-2">
            Name der Kampagne <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm hover:border-gray-400 transition-colors ${
              formErrors.name ? 'border-red-300' : ''
            }`}
            placeholder="z.B. Black Friday Promotion"
          />
          {formErrors.name && (
            <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
          )}
        </div>
        
        {/* Email Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            E-Mail-Betreff <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors ${
              formErrors.subject ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {formErrors.subject && (
            <p className="mt-1 text-sm text-red-600">{formErrors.subject}</p>
          )}
        </div>
        
        {/* Sender Name */}
        <div>
          <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-2">
            Absender-Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fromName"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors ${
              formErrors.fromName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Beispiel: Commerzbank Service"
          />
          {formErrors.fromName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.fromName}</p>
          )}
        </div>
        
        {/* Domain Selection */}
        <div>
          <label htmlFor="domainId" className="block text-sm font-medium text-gray-700 mb-2">
            Sende-Domain <span className="text-red-500">*</span>
          </label>
          <select
            id="domainId"
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors ${
              formErrors.domainId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">-- Domain auswählen --</option>
            {domains.map((domain) => (
              <option 
                key={domain.id} 
                value={domain.id}
                disabled={domain.status !== 'active'}
              >
                {domain.name} {domain.status !== 'active' ? `(${domain.status})` : ''}
              </option>
            ))}
          </select>
          {formErrors.domainId && (
            <p className="mt-1 text-sm text-red-600">{formErrors.domainId}</p>
          )}
        </div>
        
        {/* Sender Email */}
        <div>
          <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Absender-E-Mail <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="fromEmail"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors ${
              formErrors.fromEmail ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="info@domain.com"
          />
          {formErrors.fromEmail && (
            <p className="mt-1 text-sm text-red-600">{formErrors.fromEmail}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Stellen Sie sicher, dass die E-Mail-Domain mit der ausgewählten Sende-Domain übereinstimmt.
          </p>
        </div>
        
        {/* Scheduled Date */}
        <div>
          <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 mb-2">
            Geplanter Versandzeitpunkt
          </label>
          <div className="relative mt-1">
            <DatePicker
              id="scheduledFor"
              selected={scheduledFor}
              onChange={(date: Date | null) => setScheduledFor(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd.MM.yyyy HH:mm"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 focus:ring-1 transition-colors duration-200 sm:text-sm"
              placeholderText="Datum und Uhrzeit auswählen"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Lassen Sie dieses Feld leer, um die Kampagne manuell zu starten.
          </p>
        </div>
      </div>
      
      {/* Email Content Selection */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">E-Mail-Inhalt</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center">
            <input
              id="useTemplate"
              name="contentType"
              type="radio"
              checked={useTemplate}
              onChange={() => setUseTemplate(true)}
              className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="useTemplate" className="ml-3 block text-sm font-medium text-gray-700 mb-2">
              Bestehende E-Mail-Vorlage verwenden
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="useCustom"
              name="contentType"
              type="radio"
              checked={!useTemplate}
              onChange={() => setUseTemplate(false)}
              className="h-4 w-4 border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="useCustom" className="ml-3 block text-sm font-medium text-gray-700 mb-2">
              Eigenen HTML-Inhalt eingeben
            </label>
          </div>
        </div>
        
        {useTemplate ? (
          <div className="mt-4">
            <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail-Vorlage <span className="text-red-500">*</span>
            </label>
            <select
              id="templateId"
              value={templateId || ''}
              onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : undefined)}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors ${
                formErrors.templateId ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">-- Vorlage auswählen --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.category || 'Allgemein'}
                </option>
              ))}
            </select>
            {formErrors.templateId && (
              <p className="mt-1 text-sm text-red-600">{formErrors.templateId}</p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              HTML-Inhalt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors font-mono ${
                formErrors.content ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.content && (
              <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Sie können Personalisierungsvariablen wie {'{{email}}'} oder {'{{firstName}}'} verwenden.
            </p>
          </div>
        )}
      </div>
      
      {/* Advanced Options */}
      <div className="border-t border-gray-200 pt-6">
        <button
          type="button"
          className="text-sm font-medium text-red-600 hover:text-red-500"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Erweiterte Optionen ausblenden' : 'Erweiterte Optionen anzeigen'}
        </button>
        
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="trackOpens"
                  type="checkbox"
                  checked={trackOpens}
                  onChange={(e) => setTrackOpens(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="trackOpens" className="font-medium text-gray-700">
                  Öffnungen tracken
                </label>
                <p className="text-gray-500">Verfolgen, wann E-Mails geöffnet werden</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="trackClicks"
                  type="checkbox"
                  checked={trackClicks}
                  onChange={(e) => setTrackClicks(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="trackClicks" className="font-medium text-gray-700">
                  Klicks tracken
                </label>
                <p className="text-gray-500">Verfolgen, welche Links angeklickt werden</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="border-t border-gray-200 pt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md border-gray-300 shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
        >
          {isSubmitting && <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />}
          Speichern
        </button>
      </div>
    </form>
  );
};
