import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { authenticatedFetch } from '../../utils/api';
import { io, Socket } from 'socket.io-client';
import NotificationCenter from './NotificationCenter';

interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  // Fetch notification stats
  const { data: statsData, refetch } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await authenticatedFetch('/notifications/stats');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const stats: NotificationStats = statsData?.stats || {
    total: 0,
    unread: 0,
    byType: {},
    byCategory: {}
  };

  // Setup Socket.IO for real-time notifications
  useEffect(() => {
    const backendUrl = import.meta.env.MODE === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';

    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      // Join admin room for notifications
      newSocket.emit('join_session', {
        userType: 'admin',
        sessionKey: 'notification_listener'
      });
    });

    // Listen for new notifications
    newSocket.on('new_notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      setHasNewNotification(true);
      refetch(); // Refresh stats
      
      // Auto-clear the "new" indicator after 3 seconds
      setTimeout(() => {
        setHasNewNotification(false);
      }, 3000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [refetch]);

  // Clear new notification indicator when opening
  const handleOpen = () => {
    setIsOpen(true);
    setHasNewNotification(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg shadow transition-colors"
      >
        <Bell className={`h-5 w-5 ${hasNewNotification ? 'animate-bounce' : ''}`} />
        
        {/* Unread count badge */}
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
        
        {/* New notification pulse */}
        {hasNewNotification && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3 animate-ping"></span>
        )}
      </button>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationBell;
