import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CampaignList } from '../components/campaigns/CampaignList';
import { CampaignForm } from '../components/campaigns/CampaignForm';
import { RecipientUploader } from '../components/campaigns/RecipientUploader';
import { useCampaigns } from '../hooks/useCampaigns';
import { Campaign, CampaignStatus } from '../types/campaign';

export const Campaigns: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showRecipientUploader, setShowRecipientUploader] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | undefined>(undefined);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [uploadCampaignId, setUploadCampaignId] = useState<number | undefined>(undefined);
  
  const { 
    createCampaign, 
    updateCampaign, 
    isCreating, 
    isUpdating,
    addCampaignRecipients
  } = useCampaigns();
  
  // Handle creating a new campaign
  const handleCreateCampaign = () => {
    setCurrentCampaign(undefined);
    setFormMode('create');
    setShowForm(true);
    setShowRecipientUploader(false);
  };
  
  // Handle editing an existing campaign
  const handleEditCampaign = (campaign: Campaign) => {
    setCurrentCampaign(campaign);
    setFormMode('edit');
    setShowForm(true);
    setShowRecipientUploader(false);
  };
  
  // Handle form submission (create or edit)
  const handleFormSubmit = (data: any) => {
    if (formMode === 'create') {
      createCampaign({
        ...data,
        status: CampaignStatus.DRAFT
      }, {
        onSuccess: (newCampaign) => {
          setShowForm(false);
          setShowRecipientUploader(true);
          setUploadCampaignId(newCampaign.id);
        }
      });
    } else if (formMode === 'edit' && currentCampaign) {
      updateCampaign({
        id: currentCampaign.id,
        ...data
      }, {
        onSuccess: () => {
          setShowForm(false);
        }
      });
    }
  };
  
  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
  };
  
  // Handle recipient list processing
  const handleRecipientListProcessed = (data: {
    recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
    valid: number;
    invalid: number;
    duplicates: number;
    processed: number;
  }) => {
    if (uploadCampaignId) {
      addCampaignRecipients({
        id: uploadCampaignId,
        recipients: data.recipients
      }, {
        onSuccess: () => {
          // Keep the uploader open in case they want to add more recipients
        }
      });
    }
  };
  
  // Handle finishing the recipient upload
  const handleFinishRecipientUpload = () => {
    setShowRecipientUploader(false);
    setUploadCampaignId(undefined);
  };
  
  return (
    <div className="space-y-6">
      {!showForm && !showRecipientUploader && (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">E-Mail Kampagnen</h1>
            <button 
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              Neue Kampagne
            </button>
          </div>
          
          <CampaignList onEditCampaign={handleEditCampaign} />
        </>
      )}
      
      {showForm && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {formMode === 'create' ? 'Neue Kampagne erstellen' : 'Kampagne bearbeiten'}
            </h1>
            <button 
              onClick={handleFormCancel}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          <CampaignForm 
            campaign={currentCampaign}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={formMode === 'create' ? isCreating : isUpdating}
          />
        </div>
      )}
      
      {showRecipientUploader && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Empfängerliste hinzufügen</h1>
            <div className="flex space-x-2">
              <button 
                onClick={handleFinishRecipientUpload}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Fertig
              </button>
            </div>
          </div>
          
          <p className="text-gray-600">
            Laden Sie eine CSV- oder TXT-Datei mit E-Mail-Adressen hoch, um Empfänger zur Kampagne hinzuzufügen.
          </p>
          
          <RecipientUploader 
            campaignId={uploadCampaignId}
            onRecipientListProcessed={handleRecipientListProcessed}
          />
        </div>
      )}
    </div>
  );
};