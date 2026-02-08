import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Domain } from '../types/campaign';

// API URL
const API_URL = '/api/domains';

// Helper function to get Authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fetch all domains
const fetchDomains = async (forceRefresh = false): Promise<Domain[]> => {
  const url = forceRefresh ? `${API_URL}?refresh=true` : API_URL;
  
  const response = await fetch(url, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch domains');
  }
  
  const data = await response.json();
  return data.domains;
};

// Fetch domain by ID
const fetchDomainById = async (id: string): Promise<Domain> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch domain');
  }
  
  const data = await response.json();
  return data.domain;
};

// Force refresh domain cache
const refreshDomainCache = async (): Promise<Domain[]> => {
  const response = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh domain cache');
  }
  
  const data = await response.json();
  return data.domains;
};

// Get domain cache status
const getDomainCacheStatus = async (): Promise<{ lastSyncTime: string | null; age: number | null; ageInMinutes: number | null }> => {
  const response = await fetch(`${API_URL}/cache-status`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get domain cache status');
  }
  
  const data = await response.json();
  return data.cacheStatus;
};

// Custom hook for domain management
export const useDomains = (forceRefresh = false) => {
  const queryClient = useQueryClient();
  
  // Query for fetching all domains
  const { data: domains = [], isLoading, error, refetch } = useQuery({
    queryKey: ['domains', forceRefresh],
    queryFn: () => fetchDomains(forceRefresh),
  });
  
  // Mutation for refreshing domain cache
  const refreshDomainsMutation = useMutation({
    mutationFn: refreshDomainCache,
    onSuccess: (data) => {
      queryClient.setQueryData(['domains'], data);
    },
  });
  
  return {
    domains,
    isLoading,
    error,
    refetch,
    refreshDomains: refreshDomainsMutation.mutate,
    isRefreshing: refreshDomainsMutation.isPending,
    fetchDomainById,
    getDomainCacheStatus
  };
};
