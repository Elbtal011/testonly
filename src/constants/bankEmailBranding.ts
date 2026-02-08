/**
 * Bank Email Branding Configuration
 * 
 * Defines brand colors, logos, and styling for each bank's email templates
 * Used to customize the Unlayer email editor and apply consistent branding
 */

export interface BankBranding {
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor?: string;
  textColor: string;
  backgroundColor?: string;
  logoUrl: string;
  fonts: string[];
  buttonStyle: {
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
  };
  headerStyle: {
    backgroundColor: string;
    textColor: string;
  };
  supportPhone?: string;
  supportEmail?: string;
}

export const BANK_EMAIL_BRANDING: Record<string, BankBranding> = {
  commerzbank: {
    name: 'commerzbank',
    displayName: 'Commerzbank',
    primaryColor: '#002e3c', // CORRECT: Commerzbank Dark Blue
    secondaryColor: '#ffed00', // CORRECT: Commerzbank Yellow
    textColor: '#002e3c', // CORRECT: Dark blue text
    backgroundColor: '#f1efed', // CORRECT: Light gray background
    logoUrl: '/images/icons/commerzbank.png',
    fonts: ['Gotham', 'Arial', 'sans-serif'], // Actual Commerzbank font
    buttonStyle: {
      backgroundColor: '#ffed00', // CORRECT: Yellow buttons
      textColor: '#002e3c', // CORRECT: Dark blue text
      borderRadius: '6px'
    },
    headerStyle: {
      backgroundColor: '#002e3c', // CORRECT: Dark blue header
      textColor: '#ffffff' // CORRECT: White text
    },
    supportPhone: '+49 69 136 20000',
    supportEmail: 'service@commerzbank.de'
  },
  
  santander: {
    name: 'santander',
    displayName: 'Santander',
    primaryColor: '#EC0000', // CORRECT: Red (already correct)
    secondaryColor: '#9e3667', // CORRECT: Santander Purple
    textColor: '#444', // CORRECT: Dark gray text
    backgroundColor: '#f9fcfd', // CORRECT: Light blue background
    logoUrl: '/images/icons/santander.png',
    fonts: ['santander_regular', 'Arial', 'sans-serif'], // CORRECT: Santander font
    buttonStyle: {
      backgroundColor: '#EC0000',
      textColor: '#FFFFFF',
      borderRadius: '4px'
    },
    headerStyle: {
      backgroundColor: '#EC0000',
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 211 8308 0000',
    supportEmail: 'service@santander.de'
  },
  
  apobank: {
    name: 'apobank',
    displayName: 'Apobank',
    primaryColor: '#012169', // CORRECT: Apobank primary blue
    secondaryColor: '#00a0e6', // CORRECT: Apobank accent blue
    textColor: '#1e325f', // CORRECT: Apobank text color
    backgroundColor: '#f8f9fa', // CORRECT: Light gray background
    logoUrl: '/images/icons/apobank.png',
    fonts: ['Source Sans Pro', 'Arial', 'sans-serif'], // CORRECT: Apobank font
    buttonStyle: {
      backgroundColor: '#012169',
      textColor: '#FFFFFF',
      borderRadius: '6px'
    },
    headerStyle: {
      backgroundColor: '#012169', // CORRECT: Deep blue header
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 211 5998 0',
    supportEmail: 'service@apobank.de'
  },
  
  sparkasse: {
    name: 'sparkasse',
    displayName: 'Sparkasse',
    primaryColor: '#ff0018', // CORRECT: Sparkasse Red
    secondaryColor: '#005ca9', // CORRECT: Sparkasse Blue
    textColor: '#333333', // CORRECT: Dark gray (already correct)
    backgroundColor: '#f8f9fa', // CORRECT: Light gray background
    logoUrl: '/images/icons/sparkasse.png',
    fonts: ['SparkasseWeb', 'Arial', 'Helvetica', 'sans-serif'], // CORRECT: Already correct
    buttonStyle: {
      backgroundColor: '#ff0018', // CORRECT: Sparkasse Red
      textColor: '#FFFFFF',
      borderRadius: '4px'
    },
    headerStyle: {
      backgroundColor: '#ff0018', // CORRECT: Sparkasse Red
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 711 127 0',
    supportEmail: 'info@sparkasse.de'
  },
  
  postbank: {
    name: 'postbank',
    displayName: 'Postbank',
    primaryColor: '#fc0', // CORRECT: Postbank yellow (already correct)
    secondaryColor: '#0018a8', // CORRECT: Postbank blue (already correct)
    textColor: '#333333', // CORRECT: Dark gray (already correct)
    backgroundColor: '#ffffff', // CORRECT: White background
    logoUrl: '/images/icons/postbank.png',
    fonts: ['Frutiger LT Pro', 'Frutiger', 'Arial', 'sans-serif'], // CORRECT: Postbank font
    buttonStyle: {
      backgroundColor: '#fc0',
      textColor: '#000000', // CORRECT: Black text on yellow
      borderRadius: '6px'
    },
    headerStyle: {
      backgroundColor: '#0018a8', // CORRECT: Blue header
      textColor: '#fc0' // CORRECT: Yellow text
    },
    supportPhone: '+49 228 5500 5500',
    supportEmail: 'service@postbank.de'
  },
  
  dkb: {
    name: 'dkb',
    displayName: 'DKB',
    primaryColor: '#148DEA', // CORRECT: DKB Blue
    secondaryColor: '#09141c', // CORRECT: Dark background
    textColor: '#edf4f7', // CORRECT: Light text for dark theme
    backgroundColor: '#09141c', // CORRECT: Dark background
    logoUrl: '/images/icons/dkb.png',
    fonts: ['DKBEuclid', 'Arial', 'sans-serif'], // CORRECT: DKB font
    buttonStyle: {
      backgroundColor: '#148DEA', // CORRECT: Blue buttons
      textColor: '#ffffff', // CORRECT: White text
      borderRadius: '6px'
    },
    headerStyle: {
      backgroundColor: '#148DEA', // CORRECT: Blue header
      textColor: '#ffffff' // CORRECT: White text
    },
    supportPhone: '+49 30 120 300 00',
    supportEmail: 'info@dkb.de'
  },
  
  volksbank: {
    name: 'volksbank',
    displayName: 'Volksbank',
    primaryColor: '#003d7a', // CORRECT: Volksbank blue (already correct)
    secondaryColor: '#ff6600', // CORRECT: Volksbank orange (already correct)
    textColor: '#333333', // CORRECT: Dark gray (already correct)
    backgroundColor: '#ffffff', // CORRECT: White background
    logoUrl: '/images/icons/volksbank.png',
    fonts: ['VB-Regular', 'Arial', 'sans-serif'], // CORRECT: Volksbank font
    buttonStyle: {
      backgroundColor: '#003d7a',
      textColor: '#FFFFFF',
      borderRadius: '6px'
    },
    headerStyle: {
      backgroundColor: '#003d7a', // CORRECT: Volksbank blue header
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 800 888 6666',
    supportEmail: 'service@volksbank.de'
  },
  
  comdirect: {
    name: 'comdirect',
    displayName: 'Comdirect',
    primaryColor: '#FFD500',
    secondaryColor: '#333333',
    textColor: '#333333',
    logoUrl: '/images/banks/comdirect-logo.png',
    fonts: ['Arial', 'Helvetica', 'sans-serif'],
    buttonStyle: {
      backgroundColor: '#FFD500',
      textColor: '#333333',
      borderRadius: '4px'
    },
    headerStyle: {
      backgroundColor: '#333333',
      textColor: '#FFD500'
    },
    supportPhone: '+49 4106 704 0000',
    supportEmail: 'service@comdirect.de'
  },
  
  consorsbank: {
    name: 'consorsbank',
    displayName: 'Consorsbank',
    primaryColor: '#0080a6', // Real Consorsbank blue
    secondaryColor: '#05a9c3', // Consorsbank secondary blue
    textColor: '#000000', // Black text
    logoUrl: '/images/banks/consorsbank-logo.png',
    fonts: ['Proxima Nova Vara', 'system-ui', 'sans-serif'], // Real Consorsbank font
    buttonStyle: {
      backgroundColor: '#0080a6',
      textColor: '#FFFFFF',
      borderRadius: '6px'
    },
    headerStyle: {
      backgroundColor: '#0080a6', // Consorsbank blue header
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 911 369 0000',
    supportEmail: 'info@consorsbank.de'
  },
  
  ingdiba: {
    name: 'ingdiba',
    displayName: 'ING DiBa',
    primaryColor: '#FF6200',
    secondaryColor: '#FFFFFF',
    textColor: '#333333',
    logoUrl: '/images/banks/ing-logo.png',
    fonts: ['ING Me', 'Arial', 'Helvetica', 'sans-serif'],
    buttonStyle: {
      backgroundColor: '#FF6200',
      textColor: '#FFFFFF',
      borderRadius: '4px'
    },
    headerStyle: {
      backgroundColor: '#FF6200',
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 69 50 500 105',
    supportEmail: 'info@ing.de'
  },
  
  deutsche_bank: {
    name: 'deutsche_bank',
    displayName: 'Deutsche Bank',
    primaryColor: '#0550d1', // CORRECT: Deutsche Bank Blue
    secondaryColor: '#42a5f5', // CORRECT: Light blue
    textColor: '#333333', // CORRECT: Dark gray (already correct)
    backgroundColor: '#ffffff', // CORRECT: White background
    logoUrl: '/images/icons/deutschebank.png',
    fonts: ['DeutscheBank UI', 'Arial', 'Helvetica', 'sans-serif'],
    buttonStyle: {
      backgroundColor: '#0550d1', // CORRECT: Blue button
      textColor: '#FFFFFF',
      borderRadius: '4px'
    },
    headerStyle: {
      backgroundColor: '#0550d1', // CORRECT: Blue header
      textColor: '#FFFFFF'
    },
    supportPhone: '+49 69 910 10000',
    supportEmail: 'service@db.com'
  }
};

/**
 * Get branding configuration for a specific bank
 */
export const getBankBranding = (bankName: string): BankBranding | null => {
  return BANK_EMAIL_BRANDING[bankName] || null;
};

/**
 * Get all available banks
 */
export const getAllBanks = (): BankBranding[] => {
  return Object.values(BANK_EMAIL_BRANDING);
};

/**
 * Get bank display name
 */
export const getBankDisplayName = (bankName: string): string => {
  const branding = getBankBranding(bankName);
  return branding?.displayName || bankName;
};
