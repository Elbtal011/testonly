import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  Mail,
  Edit, 
  Trash, 
  Eye, 
  PauseCircle, 
  PlayCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useCampaigns } from '../../hooks/useCampaigns';
import { Campaign, CampaignStatus } from '../../types/campaign';
import { useNavigate } from 'react-router-dom';

interface CampaignListProps {
  onEditCampaign: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ onEditCampaign }) => {
  const navigate = useNavigate();
  const { 
    campaigns, 
    isLoading, 
    error, 
    deleteCampaign,
    startCampaign,
    pauseCampaign,
    isDeleting,
    isStarting,
    isPausing
  } = useCampaigns();
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Get campaign counts by status
  const activeCount = campaigns.filter(c => 
    c.status === CampaignStatus.SENDING || 
    c.status === CampaignStatus.PROCESSING
  ).length;
  
  const scheduledCount = campaigns.filter(c => 
    c.status === CampaignStatus.SCHEDULED
  ).length;
  
  const completedCount = campaigns.filter(c => 
    c.status === CampaignStatus.COMPLETED
  ).length;
  
  const recipientCount = campaigns.reduce((sum, campaign) => 
    sum + (campaign.recipientCount || 0), 0
  );
  
  // Get status badge style
  const getStatusBadge = (status: CampaignStatus) => {
    switch(status) {
      case CampaignStatus.DRAFT:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            <Edit size={12} className="mr-1" /> 
            Entwurf
          </span>
        );
      case CampaignStatus.SCHEDULED:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <Calendar size={12} className="mr-1" /> 
            Geplant
          </span>
        );
      case CampaignStatus.PROCESSING:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            <Loader size={12} className="mr-1 animate-spin" /> 
            Wird verarbeitet
          </span>
        );
      case CampaignStatus.SENDING:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            <Mail size={12} className="mr-1" /> 
            Wird gesendet
          </span>
        );
      case CampaignStatus.COMPLETED:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" /> 
            Abgeschlossen
          </span>
        );
      case CampaignStatus.PAUSED:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
            <PauseCircle size={12} className="mr-1" /> 
            Pausiert
          </span>
        );
      case CampaignStatus.CANCELLED:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            <XCircle size={12} className="mr-1" /> 
            Abgebrochen
          </span>
        );
      case CampaignStatus.FAILED:
        return (
          <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" /> 
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
  
  // Handle delete confirmation
  const handleDeleteClick = (id: number) => {
    setDeleteConfirmId(id);
  };
  
  const handleDeleteConfirm = (id: number) => {
    deleteCampaign(id);
    setDeleteConfirmId(null);
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };
  
  // Handle start/pause campaign
  const handleStartCampaign = (id: number) => {
    startCampaign(id);
  };
  
  const handlePauseCampaign = (id: number) => {
    pauseCampaign(id);
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader className="animate-spin h-8 w-8 text-red-600" />
        <span className="ml-2 text-gray-600">Lade Kampagnen...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span className="font-medium">Fehler beim Laden der Kampagnen</span>
        </div>
        <p className="text-sm text-red-600 ml-7">
          {error?.message || 'Unbekannter Fehler'}
        </p>
        <p className="text-xs text-red-500 mt-2 ml-7">
          Überprüfen Sie, ob der Server läuft und Sie angemeldet sind.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <Mail className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Aktive Kampagnen</h2>
              <p className="text-2xl font-semibold text-gray-900">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Geplante Kampagnen</h2>
              <p className="text-2xl font-semibold text-gray-900">{scheduledCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Abgeschlossene Kampagnen</h2>
              <p className="text-2xl font-semibold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Empfänger Gesamt</h2>
              <p className="text-2xl font-semibold text-gray-900">{recipientCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Kampagnen vorhanden</h3>
            <p className="text-gray-500 mb-4">
              Erstellen Sie Ihre erste E-Mail-Kampagne, um Kontakte zu erreichen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kampagne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betreff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empfänger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geplant für
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className={deleteConfirmId === campaign.id ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.fromName} &lt;{campaign.fromEmail}&gt;</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{campaign.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.recipientCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(campaign.scheduledFor)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {deleteConfirmId === campaign.id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteConfirm(campaign.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isDeleting}
                          >
                            Löschen
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => onEditCampaign(campaign)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Bearbeiten"
                          >
                            <Edit size={18} />
                          </button>
                          
                          {campaign.status === CampaignStatus.PAUSED && (
                            <button
                              onClick={() => handleStartCampaign(campaign.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Fortsetzen"
                              disabled={isStarting}
                            >
                              <PlayCircle size={18} />
                            </button>
                          )}
                          
                          {(campaign.status === CampaignStatus.SENDING || campaign.status === CampaignStatus.PROCESSING) && (
                            <button
                              onClick={() => handlePauseCampaign(campaign.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Pausieren"
                              disabled={isPausing}
                            >
                              <PauseCircle size={18} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Details anzeigen"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {(campaign.status === CampaignStatus.DRAFT || 
                            campaign.status === CampaignStatus.COMPLETED || 
                            campaign.status === CampaignStatus.FAILED || 
                            campaign.status === CampaignStatus.CANCELLED) && (
                            <button
                              onClick={() => handleDeleteClick(campaign.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Löschen"
                            >
                              <Trash size={18} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
