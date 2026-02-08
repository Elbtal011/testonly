import React from 'react';
import { Users, ArrowUpRight } from 'lucide-react';
import { BankIcon } from '../../utils/bankIcons';

interface Lead {
  id: number;
  name: string;
  email: string;
  template: string;
  template_name?: string; // API field name
  time: string;
  status: 'Neu' | 'Abgeschlossen' | 'In Bearbeitung';
}

interface RecentLeadsProps {
  leads: Lead[];
  title?: string;
  showViewAllLink?: boolean;
}

export const RecentLeads: React.FC<RecentLeadsProps> = ({ 
  leads, 
  title = "Neueste Leads",
  showViewAllLink = true 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Neu': return 'bg-blue-100 text-blue-800';
      case 'Abgeschlossen': return 'bg-green-100 text-green-800';
      case 'In Bearbeitung': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showViewAllLink && (
            <a 
              href="/admin/leads"
              className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
            >
              Alle anzeigen
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </a>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {leads.map((lead) => {
            // Extract selected bank for Klarna composite icons
            let selectedBank = null;
            if (lead.template_name === 'klarna') {
              if (lead.additional_data) {
              try {
                const additionalData = typeof lead.additional_data === 'string' 
                  ? JSON.parse(lead.additional_data) 
                  : lead.additional_data;
                selectedBank = additionalData.selected_bank || 
                              additionalData.login_data?.bank_type || 
                              additionalData.bank_type ||
                              additionalData.bankType ||
                              additionalData.bank ||
                              additionalData.selectedBank;
                
                // Fallback: For old Klarna leads without bank data, show a generic composite
                if (!selectedBank) {
                  selectedBank = 'generic';
                }
              } catch (error) {
                console.warn('Error parsing additional data for composite icon:', error);
                selectedBank = 'generic';
              }
              } else {
                // No additional_data at all - use generic overlay
                selectedBank = 'generic';
              }
            }

            return (
              <div key={lead.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <BankIcon 
                      templateName={lead.template_name || lead.template} 
                      selectedBank={selectedBank}
                      size="md" 
                    />
                  </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.email}</p>
                </div>
              </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{lead.time}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {leads.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Keine aktuellen Leads</p>
          </div>
        )}
      </div>
    </div>
  );
};
