import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BankIcon } from '../../utils/bankIcons';

interface TemplatePerformance {
  name: string; // folder_name for BankIcon
  displayName?: string; // display name for UI
  leads: number;
  conversion: number;
  color: string;
}

interface PerformanceChartProps {
  data: TemplatePerformance[];
  title?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  title = "Template-Leistung" 
}) => {
  const maxLeads = Math.max(...data.map(t => t.leads));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Leads pro Template</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {data.map((template, index) => (
            <div key={template.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                  {index + 1}
                </div>
                <BankIcon templateName={template.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{template.displayName || template.name}</p>
                  <p className="text-xs text-gray-500">{template.conversion.toFixed(1)}% Konversion</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                  <div 
                    className={`h-2 rounded-full ${template.color}`}
                    style={{ width: `${(template.leads / maxLeads) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {template.leads}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Keine Performance-Daten verfügbar</p>
          </div>
        )}
      </div>
    </div>
  );
};
