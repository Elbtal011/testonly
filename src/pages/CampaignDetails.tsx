import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Loader,
  PauseCircle,
  PlayCircle,
  Users,
  Trash,
  Upload,
  RefreshCw,
  Mail,
  Eye
} from 'lucide-react';
import { EmailTrackingStats } from '../components/EmailTrackingStats';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignStatus } from '../types/campaign';
import { RecipientUploader } from '../components/campaigns/RecipientUploader';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignId = id ? parseInt(id, 10) : 0;
  const [showRecipientUploader, setShowRecipientUploader] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTrackingStats, setShowTrackingStats] = useState(true);
  
  const { 
    fetchCampaign, 
    getCampaignStatus, 
    getCampaignRecipients,
    startCampaign,
    pauseCampaign,
    isStarting,
    isPausing,
    addCampaignRecipients,
    deleteCampaign,
    isDeleting
  } = useCampaigns();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [campaignStats, setCampaignStats] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [, setIsLoadingRecipients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load campaign data
  useEffect(() => {
    if (!campaignId) return;
    
    setIsLoadingCampaign(true);
    fetchCampaign(campaignId)
      .then(data => {
        setCampaign(data);
        setIsLoadingCampaign(false);
      })
      .catch(err => {
        setError('Fehler beim Laden der Kampagne');
        setIsLoadingCampaign(false);
        console.error(err);
      });
  }, [campaignId, fetchCampaign]);
  
  // Load campaign stats
  useEffect(() => {
    if (!campaignId) return;
    
    const loadStats = () => {
      setIsLoadingStats(true);
      getCampaignStatus(campaignId)
        .then(data => {
          setCampaignStats(data.stats);
          setIsLoadingStats(false);
        })
        .catch(err => {
          setError('Fehler beim Laden der Kampagnenstatistiken');
          setIsLoadingStats(false);
          console.error(err);
        });
    };
    
    loadStats();
    
    // Refresh stats every 30 seconds if campaign is active
    const intervalId = setInterval(() => {
      if (campaign?.status === CampaignStatus.SENDING || 
          campaign?.status === CampaignStatus.PROCESSING) {
        loadStats();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [campaignId, getCampaignStatus, campaign?.status, campaignStats]);
  
  // Load campaign recipients
  useEffect(() => {
    if (!campaignId) return;
    
    setIsLoadingRecipients(true);
    getCampaignRecipients(campaignId)
      .then(data => {
        setRecipients(data);
        setIsLoadingRecipients(false);
      })
      .catch(err => {
        setError('Fehler beim Laden der Empfänger');
        setIsLoadingRecipients(false);
        console.error(err);
      });
  }, [campaignId, getCampaignRecipients]);
  
  // Handle recipient list processing
  const handleRecipientListProcessed = (data: {
    recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
    valid: number;
    invalid: number;
    duplicates: number;
    processed: number;
  }) => {
    addCampaignRecipients({
      id: campaignId,
      recipients: data.recipients
    }, {
      onSuccess: () => {
        // Refresh recipient list
        getCampaignRecipients(campaignId)
          .then(data => {
            setRecipients(data);
            setShowRecipientUploader(false);
          })
          .catch(err => {
            console.error(err);
          });
      }
    });
  };
  
  // Handle start campaign
  const handleStartCampaign = () => {
    startCampaign(campaignId, {
      onSuccess: (updatedCampaign) => {
        setCampaign(updatedCampaign);
      }
    });
  };
  
  // Handle pause campaign
  const handlePauseCampaign = () => {
    pauseCampaign(campaignId, {
      onSuccess: (updatedCampaign) => {
        setCampaign(updatedCampaign);
      }
    });
  };

  // Handle delete campaign
  const handleDeleteCampaign = () => {
    deleteCampaign(campaignId, {
      onSuccess: () => {
        navigate('/admin/campaigns');
      }
    });
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // We'll calculate pagination when rendering the recipient list
  
  // We don't need pagination functions since we're not displaying a paginated list
  
  // Get status badge style
  const getStatusBadge = (status: CampaignStatus) => {
    switch(status) {
      case CampaignStatus.DRAFT:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Entwurf
          </span>
        );
      case CampaignStatus.SCHEDULED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            Geplant
          </span>
        );
      case CampaignStatus.PROCESSING:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            Wird verarbeitet
          </span>
        );
      case CampaignStatus.SENDING:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Wird gesendet
          </span>
        );
      case CampaignStatus.COMPLETED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Abgeschlossen
          </span>
        );
      case CampaignStatus.PAUSED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
            Pausiert
          </span>
        );
      case CampaignStatus.CANCELLED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Abgebrochen
          </span>
        );
      case CampaignStatus.FAILED:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Fehlgeschlagen
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Unbekannt
          </span>
        );
    }
  };
  
  if (isLoadingCampaign) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-red-600 animate-spin" />
        <span className="ml-2 text-gray-600">Lade Kampagne...</span>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        {error || 'Kampagne nicht gefunden'}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/campaigns')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <div className="flex items-center mt-1">
              {getStatusBadge(campaign.status)}
              <span className="ml-2 text-sm text-gray-500">
                Erstellt am {formatDate(campaign.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {(campaign.status === CampaignStatus.DRAFT || campaign.status === CampaignStatus.SCHEDULED) && (
            <button
              onClick={handleStartCampaign}
              disabled={isStarting || recipients.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {isStarting ? (
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              ) : (
                <PlayCircle className="h-5 w-5 mr-1" />
              )}
              Kampagne starten
            </button>
          )}
          
          {(campaign.status === CampaignStatus.SENDING || campaign.status === CampaignStatus.PROCESSING) && (
            <button
              onClick={handlePauseCampaign}
              disabled={isPausing}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
            >
              {isPausing ? (
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              ) : (
                <PauseCircle className="h-5 w-5 mr-1" />
              )}
              Kampagne pausieren
            </button>
          )}
          
          {campaign.status === CampaignStatus.DRAFT && (
            <button
              onClick={() => setShowRecipientUploader(true)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
            >
              <Upload className="h-5 w-5 mr-1" />
              Empfänger hinzufügen
            </button>
          )}

          {(campaign.status === CampaignStatus.DRAFT || 
            campaign.status === CampaignStatus.COMPLETED || 
            campaign.status === CampaignStatus.CANCELLED || 
            campaign.status === CampaignStatus.FAILED) && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" />
              ) : (
                <Trash className="h-5 w-5 mr-1" />
              )}
              Löschen
            </button>
          )}
        </div>
      </div>
      
      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Kampagnendetails</h2>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Betreff</dt>
              <dd className="mt-1 text-sm text-gray-900">{campaign.subject}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Absender</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {campaign.fromName} &lt;{campaign.fromEmail}&gt;
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Domain</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {campaign.domainId}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Geplant für</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {campaign.scheduledFor ? formatDate(campaign.scheduledFor) : 'Nicht geplant'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tracking</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {campaign.trackOpens && campaign.trackClicks ? 'Öffnungen & Klicks' : 
                 campaign.trackOpens ? 'Nur Öffnungen' : 
                 campaign.trackClicks ? 'Nur Klicks' : 'Kein Tracking'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Letzte Aktualisierung</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(campaign.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Campaign Stats */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Kampagnenstatistik</h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCampaignStats(null)}
                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Statistiken aktualisieren"
              >
                <RefreshCw size={16} className={isLoadingStats ? 'animate-spin' : ''} />
                <span className="sr-only">Aktualisieren</span>
              </button>
              <button
                onClick={() => setShowTrackingStats(!showTrackingStats)}
                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                title={showTrackingStats ? "Statistiken ausblenden" : "Statistiken anzeigen"}
              >
                <Eye size={16} />
                <span className="sr-only">{showTrackingStats ? "Ausblenden" : "Anzeigen"}</span>
              </button>
            </div>
          </div>
          
          {isLoadingStats ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="h-8 w-8 text-red-600 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Empfänger</p>
                      <p className="text-2xl font-bold text-gray-800">{campaignStats?.totalRecipients || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Gesendet</p>
                      <p className="text-2xl font-bold text-gray-800">{campaignStats?.sent || 0}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Fehler</p>
                      <p className="text-2xl font-bold text-gray-800">{campaignStats?.failed || 0}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detailed Email Tracking Stats */}
              {showTrackingStats && campaign && campaign.status !== CampaignStatus.DRAFT && (
                <div className="mt-4">
                  <EmailTrackingStats 
                    campaignId={campaignId.toString()} 
                    refreshInterval={campaign.status === CampaignStatus.SENDING ? 30 : 0}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Recipient List */}
      {showRecipientUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Empfänger hinzufügen</h3>
              <button
                onClick={() => setShowRecipientUploader(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Schließen</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <RecipientUploader 
              campaignId={campaignId} 
              onRecipientListProcessed={handleRecipientListProcessed}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kampagne löschen</h3>
            <p className="text-gray-600 mb-4">
              Sind Sie sicher, dass Sie diese Kampagne löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteCampaign}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
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

export default CampaignDetails;
