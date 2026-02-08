/**
 * Bank Font Loading System
 * 
 * Provides @font-face declarations for each bank's custom fonts
 * to ensure emails render with proper branding
 */

export interface BankFontConfig {
  fontFamily: string;
  fontFaces: string[];
  fallbacks: string[];
}

export const BANK_FONTS: Record<string, BankFontConfig> = {
  commerzbank: {
    fontFamily: 'Gotham',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'Gotham';
        src: url('/fonts/gotham/Gotham-Book.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'Gotham';
        src: url('/fonts/gotham/Gotham-Medium.woff2') format('woff2');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'Gotham';
        src: url('/fonts/gotham/Gotham-Bold.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  apobank: {
    fontFamily: 'Source Sans Pro',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'Source Sans Pro';
        src: url('/fonts/apobank/SourceSansPro-Regular.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'Source Sans Pro';
        src: url('/fonts/apobank/SourceSansPro-Semibold.woff2') format('woff2');
        font-weight: 600;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'Source Sans Pro';
        src: url('/fonts/apobank/SourceSansPro-Bold.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  sparkasse: {
    fontFamily: 'SparkasseWeb',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'SparkasseWeb';
        src: url('/fonts/sparkasse/Sparkasse_web_Rg.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'SparkasseWebMedium';
        src: url('/fonts/sparkasse/Sparkasse_web_Md.woff2') format('woff2');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'SparkasseWebBold';
        src: url('/fonts/sparkasse/Sparkasse_web_Bd.woff') format('woff');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  santander: {
    fontFamily: 'santander_regular',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'santander_regular';
        src: url('/templates/santander/fonts/SantanderText-Regular.bf509714.woff') format('woff');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'santander_regular';
        src: url('/templates/santander/fonts/SantanderText-Bold.d92c02b7.woff') format('woff');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  postbank: {
    fontFamily: 'Frutiger LT Pro',
    fallbacks: ['Frutiger', 'Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'Frutiger LT Pro';
        src: url('/assets/FrutigerLTPro-Roman-K6TIG941.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'Frutiger LT Pro';
        src: url('/assets/FrutigerLTPro-Bold-DwgzyGSQ.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  consorsbank: {
    fontFamily: 'Proxima Nova Vara',
    fallbacks: ['system-ui', 'Arial', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'Proxima Nova Vara';
        src: url('/templates/consorsbank/fonts/Proxima_Vara.woff2') format('woff2');
        font-weight: 100 1000;
        font-stretch: 25% 151%;
        font-display: swap;
      }`
    ]
  },
  
  volksbank: {
    fontFamily: 'VB-Regular',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'VB-Regular';
        src: url('/templates/volksbank/fonts/Font_2.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }`,
      `@font-face {
        font-family: 'VB-Bold';
        src: url('/templates/volksbank/fonts/Font.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: block;
      }`
    ]
  },
  
  // Banks with standard fonts (fallback to web-safe fonts)
  dkb: {
    fontFamily: 'DKBEuclid',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'DKBEuclid';
        src: url('/templates/dkb/fonts/DKBEuclid-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'DKBEuclid';
        src: url('/templates/dkb/fonts/DKBEuclid-Medium.woff2') format('woff2');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'DKBEuclid';
        src: url('/templates/dkb/fonts/DKBEuclid-Bold.woff2') format('woff2');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  comdirect: {
    fontFamily: 'MarkWebPro',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'MarkWebPro';
        src: url('/fonts/MarkWebPro-MediumW01-Rg.woff2') format('woff2');
        font-weight: 500;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  ingdiba: {
    fontFamily: 'INGMe',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif'],
    fontFaces: [
      `@font-face {
        font-family: 'INGMe';
        src: url('/templates/ingdiba/fonts/INGMe-Regular.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }`,
      `@font-face {
        font-family: 'INGMe';
        src: url('/templates/ingdiba/fonts/INGMe-Bold.woff2') format('woff2');
        font-weight: bold;
        font-style: normal;
        font-display: swap;
      }`
    ]
  },
  
  deutsche_bank: {
    fontFamily: 'Arial',
    fallbacks: ['Helvetica', 'sans-serif'],
    fontFaces: []
  }
};

/**
 * Get font configuration for a bank
 */
export const getBankFontConfig = (bankName: string): BankFontConfig => {
  return BANK_FONTS[bankName] || {
    fontFamily: 'Arial',
    fallbacks: ['Helvetica', 'sans-serif'],
    fontFaces: []
  };
};

/**
 * Generate CSS font declarations for a bank
 */
export const generateBankFontCSS = (bankName: string): string => {
  const config = getBankFontConfig(bankName);
  return config.fontFaces.join('\n\n');
};

/**
 * Get complete font family string with fallbacks
 */
export const getBankFontFamily = (bankName: string): string => {
  const config = getBankFontConfig(bankName);
  return `'${config.fontFamily}', ${config.fallbacks.join(', ')}`;
};

/**
 * Generate complete email CSS with bank fonts
 */
export const generateEmailCSS = (bankName?: string): string => {
  const fontCSS = bankName ? generateBankFontCSS(bankName) : '';
  const fontFamily = bankName ? getBankFontFamily(bankName) : 'Arial, Helvetica, sans-serif';
  
  return `
    ${fontCSS}
    
    /* Email base styles */
    body { 
      font-family: ${fontFamily}; 
      margin: 0; 
      padding: 0; 
      background-color: #f4f4f4; 
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      font-family: ${fontFamily};
    }
    .component { 
      margin: 0; 
      font-family: ${fontFamily};
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .mobile-full { width: 100% !important; display: block !important; }
      .component { padding-left: 15px !important; padding-right: 15px !important; }
    }
  `;
};

export default {
  BANK_FONTS,
  getBankFontConfig,
  generateBankFontCSS,
  getBankFontFamily,
  generateEmailCSS
};
