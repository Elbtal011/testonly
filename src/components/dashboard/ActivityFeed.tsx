import React from 'react';
import { LucideIcon, Activity } from 'lucide-react';
import { BankIcon } from '../../utils/bankIcons';

interface ActivityItem {
  id: number;
  type: 'lead' | 'campaign' | 'template' | 'alert' | 'system';
  template?: string;
  selectedBank?: string; // For Klarna composite icons
  message: string;
  time: string;
  icon: LucideIcon;
  color: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  showLiveIndicator?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  showLiveIndicator = true 
}) => {
  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-green-100';
      case 'alert': return 'bg-red-100';
      case 'campaign': return 'bg-gray-100';
      case 'template': return 'bg-gray-100';
      case 'system': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Neueste Aktivitäten</h3>
          {showLiveIndicator && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Live-Updates</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {activity.template ? (
                  <BankIcon 
                    templateName={activity.template} 
                    selectedBank={activity.selectedBank}
                    size="md" 
                  />
                ) : (
                  <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.message}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Keine aktuellen Aktivitäten</p>
          </div>
        )}
      </div>
    </div>
  );
};
