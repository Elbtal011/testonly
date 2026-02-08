import { useMutation } from '@tanstack/react-query';

// API URL
const API_URL = '/api/recipients';

// Helper function to get Authorization header with token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Upload a recipient list file (CSV/TXT)
const uploadRecipientList = async (file: File, options?: {
  emailField?: string;
  firstNameField?: string;
  lastNameField?: string;
  metadataFields?: string[];
  hasHeaderRow?: boolean;
  campaignId?: number;
}): Promise<{
  recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
  processed: number;
  valid: number;
  invalid: number;
  duplicates: number;
}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add options to the form data
  if (options) {
    if (options.emailField) formData.append('emailField', options.emailField);
    if (options.firstNameField) formData.append('firstNameField', options.firstNameField);
    if (options.lastNameField) formData.append('lastNameField', options.lastNameField);
    if (options.metadataFields) formData.append('metadataFields', options.metadataFields.join(','));
    if (options.hasHeaderRow !== undefined) formData.append('hasHeaderRow', String(options.hasHeaderRow));
    if (options.campaignId) formData.append('campaignId', String(options.campaignId));
  }
  
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader().Authorization
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload recipient list');
  }
  
  const data = await response.json();
  return data;
};

// Process a recipient list from string data
const processRecipientListFromString = async (content: string): Promise<{
  recipients: Array<{ email: string }>;
  processed: number;
  valid: number;
  invalid: number;
  duplicates: number;
}> => {
  const response = await fetch(`${API_URL}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to process recipient list');
  }
  
  const data = await response.json();
  return data;
};

// Validate a batch of recipients
const validateRecipients = async (recipients: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>): Promise<{
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  valid: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
  invalid: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
  duplicates: Array<{ email: string; firstName?: string; lastName?: string; metadata?: Record<string, any> }>;
}> => {
  const response = await fetch(`${API_URL}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ recipients }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to validate recipients');
  }
  
  const data = await response.json();
  return data;
};

// Custom hook for recipient management
export const useRecipients = () => {
  // Mutation for uploading a recipient list
  const uploadMutation = useMutation({
    mutationFn: uploadRecipientList,
  });
  
  // Mutation for processing a recipient list from string
  const processMutation = useMutation({
    mutationFn: processRecipientListFromString,
  });
  
  // Mutation for validating recipients
  const validateMutation = useMutation({
    mutationFn: validateRecipients,
  });
  
  return {
    uploadRecipientList: uploadMutation.mutate,
    processRecipientListFromString: processMutation.mutate,
    validateRecipients: validateMutation.mutate,
    isUploading: uploadMutation.isPending,
    isProcessing: processMutation.isPending,
    isValidating: validateMutation.isPending,
    uploadError: uploadMutation.error,
    processError: processMutation.error,
    validateError: validateMutation.error,
    uploadResult: uploadMutation.data,
    processResult: processMutation.data,
    validateResult: validateMutation.data
  };
};
