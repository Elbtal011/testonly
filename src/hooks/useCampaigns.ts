import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Campaign, CampaignStatus } from '../types/campaign';

// API URL (connects to main server)
const API_URL = '/api/campaigns';

// Helper function to get Authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fetch all campaigns
const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeader(),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Nicht authentifiziert - bitte erneut anmelden');
      }
      if (response.status === 404) {
        throw new Error('Kampagnen-Endpoint nicht gefunden');
      }
      throw new Error(`Server-Fehler: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Campaigns API response:', data); // Debug log
    
    // Handle different response formats
    if (data.campaigns) {
      return data.campaigns;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.warn('Unexpected campaigns response format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
};

// Fetch a single campaign by ID
const fetchCampaign = async (id: number): Promise<Campaign> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch campaign');
  }
  
  const data = await response.json();
  return data.campaign;
};

// Create a new campaign
const createCampaign = async (campaign: Omit<Campaign, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(campaign),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create campaign');
  }
  
  const data = await response.json();
  return data.campaign;
};

// Update an existing campaign
const updateCampaign = async ({ id, ...campaign }: Partial<Campaign> & { id: number }): Promise<Campaign> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(campaign),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update campaign');
  }
  
  const data = await response.json();
  return data.campaign;
};

// Delete a campaign
const deleteCampaign = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete campaign');
  }
};

// Schedule a campaign
const scheduleCampaign = async ({ id, scheduledFor }: { id: number; scheduledFor: string }): Promise<Campaign> => {
  const response = await fetch(`${API_URL}/${id}/schedule`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ scheduledFor }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to schedule campaign');
  }
  
  const data = await response.json();
  return data.campaign;
};

// Start a campaign immediately
const startCampaign = async (id: number): Promise<Campaign> => {
  const response = await fetch(`${API_URL}/${id}/start`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to start campaign');
  }
  
  const data = await response.json();
  return data.campaign;
};

// Pause a running campaign
const pauseCampaign = async (id: number): Promise<Campaign> => {
  const response = await fetch(`${API_URL}/${id}/pause`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to pause campaign');
  }
  
  const data = await response.json();
  return data.campaign;
};

// Get campaign status and metrics
const getCampaignStatus = async (id: number): Promise<{ status: CampaignStatus; stats: any }> => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get campaign status');
  }
  
  const data = await response.json();
  return {
    status: data.status,
    stats: data.stats
  };
};

// Add recipients to campaign
const addCampaignRecipients = async ({ id, recipients }: { id: number; recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }> }): Promise<{ added: number; duplicates: number; invalid: number; total: number }> => {
  const response = await fetch(`${API_URL}/${id}/recipients`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ recipients }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add recipients to campaign');
  }
  
  const data = await response.json();
  return {
    added: data.added,
    duplicates: data.duplicates,
    invalid: data.invalid,
    total: data.total
  };
};

// Get campaign recipients
const getCampaignRecipients = async (id: number): Promise<Array<{ id: number; email: string; status: string; firstName?: string; lastName?: string }>> => {
  const response = await fetch(`${API_URL}/${id}/recipients`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get campaign recipients');
  }
  
  const data = await response.json();
  return data.recipients;
};

// Custom hook for campaign management
export const useCampaigns = () => {
  const queryClient = useQueryClient();
  
  // Query for fetching all campaigns
  const { data: campaigns = [], isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: fetchCampaigns,
    retry: 2, // Only retry twice
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
  
  // Mutation for creating a campaign
  const createCampaignMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  // Mutation for updating a campaign
  const updateCampaignMutation = useMutation({
    mutationFn: updateCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  // Mutation for deleting a campaign
  const deleteCampaignMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  // Mutation for scheduling a campaign
  const scheduleCampaignMutation = useMutation({
    mutationFn: scheduleCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  // Mutation for starting a campaign
  const startCampaignMutation = useMutation({
    mutationFn: startCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  // Mutation for pausing a campaign
  const pauseCampaignMutation = useMutation({
    mutationFn: pauseCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  // Mutation for adding recipients
  const addRecipientsMutation = useMutation({
    mutationFn: addCampaignRecipients,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  return {
    campaigns,
    isLoading,
    error,
    fetchCampaign,
    createCampaign: createCampaignMutation.mutate,
    updateCampaign: updateCampaignMutation.mutate,
    deleteCampaign: deleteCampaignMutation.mutate,
    scheduleCampaign: scheduleCampaignMutation.mutate,
    startCampaign: startCampaignMutation.mutate,
    pauseCampaign: pauseCampaignMutation.mutate,
    getCampaignStatus,
    getCampaignRecipients,
    addCampaignRecipients: addRecipientsMutation.mutate,
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending,
    isDeleting: deleteCampaignMutation.isPending,
    isScheduling: scheduleCampaignMutation.isPending,
    isStarting: startCampaignMutation.isPending,
    isPausing: pauseCampaignMutation.isPending,
    isAddingRecipients: addRecipientsMutation.isPending
  };
};
