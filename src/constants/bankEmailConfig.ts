// Bank-specific email configuration and branding data

export interface BankEmailConfig {
  name: string;
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  fontFamily: string;
  fontUrls: string[];
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  legalName: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  compliance: {
    regulatoryText: string;
    disclaimerText: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
}

export const BANK_EMAIL_CONFIGS: Record<string, BankEmailConfig> = {
  commerzbank: {
    name: 'commerzbank',
    displayName: 'Commerzbank',
    primaryColor: '#002e3c',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/commerzbank/images/commerzbank.svg',
    faviconUrl: '/templates/commerzbank/images/commerzbank-favicon.ico',
    fontFamily: 'Gotham, Arial, sans-serif',
    fontUrls: [
      '/templates/commerzbank/fonts/Gotham-Book.woff2',
      '/templates/commerzbank/fonts/Gotham-Medium.woff2',
      '/templates/commerzbank/fonts/Gotham-Bold.woff2'
    ],
    supportEmail: 'service@commerzbank.de',
    supportPhone: '+49 69 136 20000',
    websiteUrl: 'https://www.commerzbank.de',
    legalName: 'Commerzbank AG',
    address: {
      street: 'Kaiserstraße 16',
      city: 'Frankfurt am Main',
      postalCode: '60311',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/commerzbank',
      twitter: 'https://twitter.com/commerzbank',
      linkedin: 'https://www.linkedin.com/company/commerzbank'
    },
    compliance: {
      regulatoryText: 'Commerzbank AG ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen. Bei versehentlichem Empfang bitten wir um Benachrichtigung und Löschung.',
      privacyPolicyUrl: 'https://www.commerzbank.de/de/hauptnavigation/datenschutz/datenschutz.html',
      termsOfServiceUrl: 'https://www.commerzbank.de/de/hauptnavigation/agb/agb.html'
    }
  },

  santander: {
    name: 'santander',
    displayName: 'Santander',
    primaryColor: '#9e3667',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/santander/images/santander-logo.svg',
    faviconUrl: '/templates/santander/images/santander-favicon.ico',
    fontFamily: 'SantanderText, Arial, sans-serif',
    fontUrls: [
      '/templates/santander/fonts/SantanderText-Regular.bf509714.woff',
      '/templates/santander/fonts/SantanderText-Bold.d92c02b7.woff',
      '/templates/santander/fonts/SantanderHeadlineW05-Rg.a5ec6e62.woff'
    ],
    supportEmail: 'info@santander.de',
    supportPhone: '+49 2161 690 0000',
    websiteUrl: 'https://www.santander.de',
    legalName: 'Santander Consumer Bank AG',
    address: {
      street: 'Santander-Platz 1',
      city: 'Mönchengladbach',
      postalCode: '41061',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/santanderdeutschland',
      twitter: 'https://twitter.com/santander_de'
    },
    compliance: {
      regulatoryText: 'Santander Consumer Bank AG ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese Nachricht ist ausschließlich für den bezeichneten Adressaten bestimmt.',
      privacyPolicyUrl: 'https://www.santander.de/datenschutz',
      termsOfServiceUrl: 'https://www.santander.de/agb'
    }
  },

  apobank: {
    name: 'apobank',
    displayName: 'Apobank',
    primaryColor: '#005ca9',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/apobank/images/apobank-logo.svg',
    faviconUrl: '/templates/apobank/images/apobank-logo.svg',
    fontFamily: 'SourceSansPro, Arial, sans-serif',
    fontUrls: [
      '/templates/apobank/fonts/SourceSansPro-Regular.woff2',
      '/templates/apobank/fonts/SourceSansPro-Bold.woff2',
      '/templates/apobank/fonts/SourceSansPro-Semibold.woff2'
    ],
    supportEmail: 'service@apobank.de',
    supportPhone: '+49 211 5998 0',
    websiteUrl: 'https://www.apobank.de',
    legalName: 'Deutsche Apotheker- und Ärztebank eG',
    address: {
      street: 'Richard-Oskar-Mattern-Straße 6',
      city: 'Düsseldorf',
      postalCode: '40547',
      country: 'Deutschland'
    },
    socialMedia: {
      linkedin: 'https://www.linkedin.com/company/apobank'
    },
    compliance: {
      regulatoryText: 'Deutsche Apotheker- und Ärztebank eG ist eine eingetragene Genossenschaft.',
      disclaimerText: 'Diese E-Mail ist ausschließlich für Angehörige der Heilberufe bestimmt.',
      privacyPolicyUrl: 'https://www.apobank.de/datenschutz',
      termsOfServiceUrl: 'https://www.apobank.de/agb'
    }
  },

  sparkasse: {
    name: 'sparkasse',
    displayName: 'Sparkasse',
    primaryColor: '#ff0018',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/sparkasse/images/sparkasse-logo.svg',
    faviconUrl: '/templates/sparkasse/images/favicon2x.png',
    fontFamily: 'SparkasseWeb, Arial, sans-serif',
    fontUrls: [
      '/templates/sparkasse/fonts/SparkasseWeb-Regular.woff',
      '/templates/sparkasse/fonts/SparkasseWeb-Bold.woff'
    ],
    supportEmail: 'info@sparkasse.de',
    supportPhone: '+49 30 20225 5555',
    websiteUrl: 'https://www.sparkasse.de',
    legalName: 'Sparkassen-Finanzgruppe',
    address: {
      street: 'Charlottenstraße 47',
      city: 'Berlin',
      postalCode: '10117',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/sparkasse',
      twitter: 'https://twitter.com/sparkasse',
      instagram: 'https://www.instagram.com/sparkasse'
    },
    compliance: {
      regulatoryText: 'Ihre örtliche Sparkasse ist eine Anstalt des öffentlichen Rechts.',
      disclaimerText: 'Diese E-Mail wurde von Ihrer Sparkasse versendet.',
      privacyPolicyUrl: 'https://www.sparkasse.de/datenschutz',
      termsOfServiceUrl: 'https://www.sparkasse.de/agb'
    }
  },

  postbank: {
    name: 'postbank',
    displayName: 'Postbank',
    primaryColor: '#fc0',
    secondaryColor: '#0018a8',
    logoUrl: '/templates/postbank/images/postbank-logo.svg',
    faviconUrl: '/templates/postbank/images/Logo_App Icon.svg',
    fontFamily: 'FrutigerLTPro, Arial, sans-serif',
    fontUrls: [
      '/templates/postbank/fonts/FrutigerLTPro-Roman.woff2',
      '/templates/postbank/fonts/FrutigerLTPro-Bold.woff2',
      '/templates/postbank/fonts/FrutigerLTPro-Light.woff2'
    ],
    supportEmail: 'service@postbank.de',
    supportPhone: '+49 228 920 20',
    websiteUrl: 'https://www.postbank.de',
    legalName: 'Postbank - eine Niederlassung der Deutsche Bank AG',
    address: {
      street: 'Kennedyallee 51',
      city: 'Bonn',
      postalCode: '53175',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/postbank',
      twitter: 'https://twitter.com/postbank'
    },
    compliance: {
      regulatoryText: 'Postbank ist eine Niederlassung der Deutsche Bank AG.',
      disclaimerText: 'Diese E-Mail ist ausschließlich für den bezeichneten Empfänger bestimmt.',
      privacyPolicyUrl: 'https://www.postbank.de/datenschutz',
      termsOfServiceUrl: 'https://www.postbank.de/agb'
    }
  },

  dkb: {
    name: 'dkb',
    displayName: 'DKB',
    primaryColor: '#148DEA',
    secondaryColor: '#09141c',
    logoUrl: '/templates/dkb/images/dkb-logo.svg',
    faviconUrl: '/templates/dkb/images/dkb-favicon.ico',
    fontFamily: 'DKBEuclid, Arial, sans-serif',
    fontUrls: [
      '/templates/dkb/fonts/DKBEuclid-Regular.woff2',
      '/templates/dkb/fonts/DKBEuclid-Medium.woff2',
      '/templates/dkb/fonts/DKBEuclid-Bold.woff2'
    ],
    supportEmail: 'info@dkb.de',
    supportPhone: '+49 30 120 300 00',
    websiteUrl: 'https://www.dkb.de',
    legalName: 'Deutsche Kreditbank AG',
    address: {
      street: 'Taubenstraße 7-9',
      city: 'Berlin',
      postalCode: '10117',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/dkb.de',
      twitter: 'https://twitter.com/dkb_ag',
      instagram: 'https://www.instagram.com/dkb.de'
    },
    compliance: {
      regulatoryText: 'Deutsche Kreditbank AG ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen der DKB.',
      privacyPolicyUrl: 'https://www.dkb.de/datenschutz',
      termsOfServiceUrl: 'https://www.dkb.de/agb'
    }
  },

  volksbank: {
    name: 'volksbank',
    displayName: 'Volksbank',
    primaryColor: '#003d7a',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/volksbank/images/volksbank-logo.png',
    faviconUrl: '/templates/volksbank/images/volksbank-logo.png',
    fontFamily: 'VRFont, Arial, sans-serif',
    fontUrls: [
      '/templates/volksbank/fonts/Font.woff2',
      '/templates/volksbank/fonts/Font_2.woff2'
    ],
    supportEmail: 'service@volksbank.de',
    supportPhone: '+49 30 2021 1333',
    websiteUrl: 'https://www.volksbank.de',
    legalName: 'Bundesverband der Deutschen Volksbanken und Raiffeisenbanken',
    address: {
      street: 'Schellingstraße 4',
      city: 'Berlin',
      postalCode: '10785',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/volksbanken',
      twitter: 'https://twitter.com/volksbanken'
    },
    compliance: {
      regulatoryText: 'Ihre örtliche Volksbank ist eine eingetragene Genossenschaft.',
      disclaimerText: 'Diese E-Mail wurde von Ihrer Volksbank versendet.',
      privacyPolicyUrl: 'https://www.volksbank.de/datenschutz',
      termsOfServiceUrl: 'https://www.volksbank.de/agb'
    }
  },

  comdirect: {
    name: 'comdirect',
    displayName: 'comdirect',
    primaryColor: '#ffcc00',
    secondaryColor: '#005ca9',
    logoUrl: '/templates/comdirect/images/comdirect-logo.svg',
    faviconUrl: '/templates/comdirect/images/comdirect-favicon.ico',
    fontFamily: 'ComdirectSans, Arial, sans-serif',
    fontUrls: [],
    supportEmail: 'service@comdirect.de',
    supportPhone: '+49 4106 708 25 00',
    websiteUrl: 'https://www.comdirect.de',
    legalName: 'comdirect bank AG',
    address: {
      street: 'Pascalkehre 15',
      city: 'Quickborn',
      postalCode: '25451',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/comdirect',
      twitter: 'https://twitter.com/comdirect'
    },
    compliance: {
      regulatoryText: 'comdirect bank AG ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen der comdirect.',
      privacyPolicyUrl: 'https://www.comdirect.de/datenschutz',
      termsOfServiceUrl: 'https://www.comdirect.de/agb'
    }
  },

  consorsbank: {
    name: 'consorsbank',
    displayName: 'Consorsbank',
    primaryColor: '#005ca9',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/consorsbank/images/logo.svg',
    faviconUrl: '/templates/consorsbank/images/logo.svg',
    fontFamily: 'ProximaVara, Arial, sans-serif',
    fontUrls: [
      '/templates/consorsbank/fonts/Proxima_Vara.woff2',
      '/templates/consorsbank/fonts/Proxima_Vara_Italic.woff2'
    ],
    supportEmail: 'service@consorsbank.de',
    supportPhone: '+49 911 369 30 00',
    websiteUrl: 'https://www.consorsbank.de',
    legalName: 'Consorsbank',
    address: {
      street: 'Bahnhofstraße 55',
      city: 'Nürnberg',
      postalCode: '90402',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/consorsbank',
      twitter: 'https://twitter.com/consorsbank'
    },
    compliance: {
      regulatoryText: 'Consorsbank ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen der Consorsbank.',
      privacyPolicyUrl: 'https://www.consorsbank.de/datenschutz',
      termsOfServiceUrl: 'https://www.consorsbank.de/agb'
    }
  },

  ingdiba: {
    name: 'ingdiba',
    displayName: 'ING DiBa',
    primaryColor: '#ff6200',
    secondaryColor: '#ffffff',
    logoUrl: '/templates/ingdiba/images/logo.svg',
    faviconUrl: '/templates/ingdiba/images/logo.svg',
    fontFamily: 'INGMe, Arial, sans-serif',
    fontUrls: [],
    supportEmail: 'info@ing.de',
    supportPhone: '+49 69 34 22 24',
    websiteUrl: 'https://www.ing.de',
    legalName: 'ING-DiBa AG',
    address: {
      street: 'Theodor-Heuss-Allee 2',
      city: 'Frankfurt am Main',
      postalCode: '60486',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/INGDeutschland',
      twitter: 'https://twitter.com/ING_Deutschland'
    },
    compliance: {
      regulatoryText: 'ING-DiBa AG ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen der ING.',
      privacyPolicyUrl: 'https://www.ing.de/datenschutz',
      termsOfServiceUrl: 'https://www.ing.de/agb'
    }
  },

  deutsche_bank: {
    name: 'deutsche_bank',
    displayName: 'Deutsche Bank',
    primaryColor: '#012169',
    secondaryColor: '#00a0e6',
    logoUrl: '/templates/deutsche_bank/images/db-logo-blue-B3ZUXW6W.svg',
    faviconUrl: '/templates/deutsche_bank/images/favicon.ico',
    fontFamily: 'DBScreen, Arial, sans-serif',
    fontUrls: [],
    supportEmail: 'service@deutsche-bank.de',
    supportPhone: '+49 69 910 00',
    websiteUrl: 'https://www.deutsche-bank.de',
    legalName: 'Deutsche Bank AG',
    address: {
      street: 'Taunusanlage 12',
      city: 'Frankfurt am Main',
      postalCode: '60325',
      country: 'Deutschland'
    },
    socialMedia: {
      facebook: 'https://www.facebook.com/DeutscheBank',
      twitter: 'https://twitter.com/DeutscheBank',
      linkedin: 'https://www.linkedin.com/company/deutsche-bank'
    },
    compliance: {
      regulatoryText: 'Deutsche Bank AG ist ein Kreditinstitut im Sinne des KWG.',
      disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen der Deutsche Bank.',
      privacyPolicyUrl: 'https://www.deutsche-bank.de/datenschutz',
      termsOfServiceUrl: 'https://www.deutsche-bank.de/agb'
    }
  }
};

// Helper functions
export function getBankConfig(bankName: string): BankEmailConfig | null {
  return BANK_EMAIL_CONFIGS[bankName] || null;
}

export function getAllBankNames(): string[] {
  return Object.keys(BANK_EMAIL_CONFIGS);
}

export function getBankDisplayNames(): Record<string, string> {
  const displayNames: Record<string, string> = {};
  Object.entries(BANK_EMAIL_CONFIGS).forEach(([key, config]) => {
    displayNames[key] = config.displayName;
  });
  return displayNames;
}

