import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the EmailTemplate interface
export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  design_json?: string;
  category: string;
  bank_name?: string;
  template_type?: string;
  version?: number;
  is_active?: boolean;
  deliverability_score?: number;
  last_tested?: string;
  created_at: string;
  last_modified: string;
}

// API URL
const API_URL = '/api/email-templates';

// Helper function to get Authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Fetch all email templates
const fetchEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const response = await fetch(API_URL, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch email templates');
  }
  
  const data = await response.json();
  return data.templates;
};

// Fetch a single email template by ID
const fetchEmailTemplate = async (id: number): Promise<EmailTemplate> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch email template');
  }
  
  const data = await response.json();
  return data.template;
};

// Create a new email template
const createEmailTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'last_modified'>): Promise<EmailTemplate> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create email template');
  }
  
  const data = await response.json();
  return data.template;
};

// Update an existing email template
const updateEmailTemplate = async (template: Partial<EmailTemplate> & { id: number }): Promise<EmailTemplate> => {
  const response = await fetch(`${API_URL}/${template.id}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update email template');
  }
  
  const data = await response.json();
  return data.template;
};

// Delete an email template
const deleteEmailTemplate = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete email template');
  }
};

// Custom hook to use email templates
export const useEmailTemplates = () => {
  const queryClient = useQueryClient();
  
  // Query to fetch all templates
  const allTemplatesQuery = useQuery<EmailTemplate[], Error>({
    queryKey: ['emailTemplates'],
    queryFn: fetchEmailTemplates,
  });
  
  // Mutation to create a template
  const createTemplateMutation = useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });
  
  // Mutation to update a template
  const updateTemplateMutation = useMutation({
    mutationFn: updateEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });
  
  // Mutation to delete a template
  const deleteTemplateMutation = useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
    },
  });
  
  return {
    templates: allTemplatesQuery.data || [],
    isLoading: allTemplatesQuery.isLoading,
    error: allTemplatesQuery.error,
    fetchTemplate: fetchEmailTemplate,
    createTemplate: createTemplateMutation.mutateAsync,
    updateTemplate: updateTemplateMutation.mutateAsync,
    deleteTemplate: deleteTemplateMutation.mutateAsync,
    isCreating: createTemplateMutation.isPending,
    isUpdating: updateTemplateMutation.isPending,
    isDeleting: deleteTemplateMutation.isPending,
  };
};
