import React from 'react';
import { AlertTriangle, CheckCircle, Zap, Clock, X } from 'lucide-react';

interface SystemAlert {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp?: string;
  dismissible?: boolean;
}

interface SystemAlertsProps {
  alerts: SystemAlert[];
  title?: string;
  onDismiss?: (alertId: number) => void;
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ 
  alerts, 
  title = "System Meldungen",
  onDismiss 
}) => {
  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'info':
        return {
          icon: Zap,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          icon: AlertTriangle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <AlertTriangle className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {alerts.map((alert) => {
            const config = getAlertConfig(alert.type);
            return (
              <div key={alert.id} className={`flex items-start space-x-3 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg relative`}>
                <config.icon className={`h-5 w-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${config.titleColor}`}>{alert.title}</p>
                  <p className={`text-xs ${config.messageColor} mt-1`}>
                    {alert.message}
                  </p>
                  {alert.timestamp && (
                    <div className="flex items-center mt-2">
                      <Clock className={`h-3 w-3 ${config.iconColor} mr-1`} />
                      <span className={`text-xs ${config.messageColor}`}>{alert.timestamp}</span>
                    </div>
                  )}
                </div>
                {alert.dismissible && onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className={`${config.iconColor} hover:text-gray-800 transition-colors`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Alle Systeme funktionieren einwandfrei</p>
          </div>
        )}
      </div>
    </div>
  );
};
