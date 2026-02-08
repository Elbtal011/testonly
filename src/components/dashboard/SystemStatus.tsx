import React from 'react';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface SystemService {
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'warning';
  description?: string;
}

interface SystemStatusProps {
  services: SystemService[];
  title?: string;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ 
  services, 
  title = "Systemstatus" 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return { dot: 'bg-green-500', text: 'text-green-600', label: 'Online' };
      case 'offline': return { dot: 'bg-red-500', text: 'text-red-600', label: 'Offline' };
      case 'maintenance': return { dot: 'bg-yellow-500', text: 'text-yellow-600', label: 'Wartung' };
      case 'warning': return { dot: 'bg-orange-500', text: 'text-orange-600', label: 'Warnung' };
      default: return { dot: 'bg-gray-500', text: 'text-gray-600', label: 'Unbekannt' };
    }
  };

  const overallStatus = services.every(s => s.status === 'online') ? 'healthy' : 
                      services.some(s => s.status === 'offline') ? 'critical' : 'warning';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <div className={`w-2 h-2 rounded-full ${
              overallStatus === 'healthy' ? 'bg-green-500' :
              overallStatus === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {services.map((service, index) => {
            const statusConfig = getStatusColor(service.status);
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{service.name}</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 ${statusConfig.dot} rounded-full`}></div>
                  <span className={`text-sm font-semibold ${statusConfig.text}`}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {services.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Keine System-Informationen verfügbar</p>
          </div>
        )}
      </div>
    </div>
  );
};
