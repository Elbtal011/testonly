import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Users,
  Shield,
  Server,
  CreditCard,
  Clock,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { authenticatedFetch } from '../../utils/api';

interface Notification {
  id: number;
  type: 'session' | 'security' | 'system' | 'tan';
  category: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  sessionKey?: string;
  templateName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', filter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: '100',
        include_read: filter === 'all' ? 'true' : 'false',
        include_dismissed: 'false'
      });
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await authenticatedFetch(`/notifications?${params}`);
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    enabled: isOpen
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedFetch(`/notifications/${id}/read`, {
        method: 'PUT'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  // Dismiss notification mutation
  const dismissMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await authenticatedFetch(`/notifications/${id}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch('/notifications/bulk/read', {
        method: 'PUT'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    }
  });

  const notifications: Notification[] = notificationsData?.notifications || [];

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    if (category === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    if (category === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    
    switch (type) {
      case 'session': return <Users className="h-5 w-5 text-blue-500" />;
      case 'security': return <Shield className="h-5 w-5 text-red-500" />;
      case 'system': return <Server className="h-5 w-5 text-gray-500" />;
      case 'tan': return <CreditCard className="h-5 w-5 text-purple-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (category: string, isRead: boolean) => {
    const opacity = isRead ? 'bg-opacity-50' : 'bg-opacity-100';
    switch (category) {
      case 'error': return `bg-red-50 border-red-200 ${opacity}`;
      case 'warning': return `bg-yellow-50 border-yellow-200 ${opacity}`;
      case 'success': return `bg-green-50 border-green-200 ${opacity}`;
      default: return `bg-blue-50 border-blue-200 ${opacity}`;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
  };

  const translateNotificationType = (type: string) => {
    switch (type) {
      case 'session': return 'Sitzung';
      case 'security': return 'Sicherheit';
      case 'system': return 'System';
      case 'tan': return 'TAN';
      default: return type;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ungelesen
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Alle
              </button>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Alle Typen</option>
              <option value="session">Sitzungen</option>
              <option value="security">Sicherheit</option>
              <option value="system">System</option>
              <option value="tan">TAN-Ereignisse</option>
            </select>

            {notifications.some(n => !n.is_read) && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <Check className="h-4 w-4 mr-2 inline" />
                Alle als gelesen markieren
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Benachrichtigungen werden geladen...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Keine Benachrichtigungen</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-1">
                            {!notification.is_read && (
                              <button
                                onClick={() => markReadMutation.mutate(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Als gelesen markieren"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => dismissMutation.mutate(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Verwerfen"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              notification.type === 'session' ? 'bg-blue-100 text-blue-800' :
                              notification.type === 'security' ? 'bg-red-100 text-red-800' :
                              notification.type === 'system' ? 'bg-gray-100 text-gray-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {translateNotificationType(notification.type)}
                            </span>
                            {notification.templateName && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                                {notification.templateName}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(notification.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
