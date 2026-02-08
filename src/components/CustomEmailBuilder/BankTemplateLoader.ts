import { EmailComponent } from './EmailBuilder';
import { getBankBranding } from '../../constants/bankEmailBranding';
import { getBankFontFamily } from '../../utils/bankFonts';

/**
 * Creates accurate bank-specific email template components
 * Based on real bank template styling (NO gradients, correct colors)
 */
export const createBankTemplate = (bankName: string): EmailComponent[] => {
  const branding = getBankBranding(bankName);
  if (!branding) return [];

  switch (bankName.toLowerCase()) {
    case 'commerzbank':
      return createCommerzbankTemplate(branding);
    case 'santander':
      return createSantanderTemplate(branding);
    case 'dkb':
      return createDKBTemplate(branding);
    case 'sparkasse':
      return createSparkasseTemplate(branding);
    case 'apobank':
      return createApobankTemplate(branding);
    case 'postbank':
      return createPostbankTemplate(branding);
    case 'volksbank':
      return createVolksbankTemplate(branding);
    case 'deutsche_bank':
      return createDeutscheBankTemplate(branding);
    case 'comdirect':
      return createComdirectTemplate(branding);
    case 'consorsbank':
      return createConsorsbankTemplate(branding);
    case 'ingdiba':
      return createINGDiBaTemplate(branding);
    default:
      return createGenericTemplate(branding);
  }
};

/**
 * Commerzbank Template - Dark blue header, yellow buttons, NO gradients
 */
const createCommerzbankTemplate = (branding: any): EmailComponent[] => {
  return [
    {
      id: 'commerzbank-header-1',
      type: 'header',
      content: '⚠️ Sicherheitswarnung - Commerzbank',
      props: {
        backgroundColor: '#002e3c',  // CORRECT: Dark blue (no gradients!)
        color: '#ffffff',            // CORRECT: White text
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '40px 30px',
        fontFamily: 'Gotham, Arial, sans-serif'
      }
    },
    {
      id: 'commerzbank-alert-1',
      type: 'alert',
      content: 'WICHTIGE SICHERHEITSBENACHRICHTIGUNG\nWir haben ungewöhnliche Aktivitäten in Ihrem Commerzbank-Konto festgestellt. Zu Ihrem Schutz müssen wir Ihre Identität verifizieren.',
      props: {
        backgroundColor: '#fff5f5',  // Light red background
        borderColor: '#ef4444',      // Red border
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '25px',
        textAlign: 'center',
        margin: '25px 0',
        color: '#dc2626'             // Red text
      }
    },
    {
      id: 'commerzbank-text-1',
      type: 'text',
      content: 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nunser Sicherheitssystem hat verdächtige Aktivitäten in Ihrem Commerzbank-Konto entdeckt. Um Ihr Konto zu schützen, müssen wir Ihre Identität verifizieren.\n\nBitte klicken Sie auf den unten stehenden Button, um den Verifizierungsprozess zu starten.',
      props: {
        backgroundColor: '#ffffff',
        color: '#002e3c',            // CORRECT: Dark blue text
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '30px',
        fontFamily: 'Gotham, Arial, sans-serif',
        lineHeight: '1.6'
      }
    },
    {
      id: 'commerzbank-button-1',
      type: 'button',
      content: 'Konto jetzt sichern',
      props: {
        backgroundColor: '#ffffff',
        buttonBackgroundColor: '#ffed00',  // CORRECT: Yellow button
        color: '#002e3c',                  // CORRECT: Dark blue text
        textAlign: 'center',
        borderRadius: '6px',
        padding: '20px 30px',
        href: '#verify',
        buttonPadding: '16px 32px',
        buttonFontWeight: 'bold',
        buttonFontSize: '16px',
        fontFamily: 'Gotham, Arial, sans-serif'
      }
    },
    {
      id: 'commerzbank-table-1',
      type: 'table',
      content: 'Transaktionsdetails',
      props: {
        backgroundColor: '#f1efed',     // CORRECT: Light gray background
        borderColor: '#002e3c',         // CORRECT: Dark blue border
        padding: '20px',
        margin: '20px 0',
        borderRadius: '8px',
        tableTitle: 'Verdächtige Transaktion',
        dateLabel: 'Datum:',
        dateValue: '{{date}}',
        amountLabel: 'Betrag:',
        amountValue: '{{amount}}',
        accountLabel: 'Konto:',
        accountValue: '{{accountNumber}}',
        referenceLabel: 'Referenz:',
        referenceValue: '{{transactionId}}'
      }
    },
    {
      id: 'commerzbank-footer-1',
      type: 'footer',
      content: 'Commerzbank Kundenservice\nTelefon: +49 69 136 20000\nE-Mail: service@commerzbank.de\n\nCommerzbank AG, Kaiserstraße 16, 60311 Frankfurt am Main',
      props: {
        backgroundColor: '#f8f9fa',
        color: '#666666',
        fontSize: '14px',
        textAlign: 'center',
        padding: '30px 20px',
        borderTopColor: '#002e3c',      // CORRECT: Dark blue border
        borderTopWidth: '3px',
        borderTopStyle: 'solid'
      }
    }
  ];
};

/**
 * Santander Template - Red header, purple accents, NO gradients
 */
const createSantanderTemplate = (branding: any): EmailComponent[] => {
  return [
    {
      id: 'santander-header-1',
      type: 'header',
      content: '🔒 Sicherheitshinweis - Santander',
      props: {
        backgroundColor: '#EC0000',     // CORRECT: Santander Red
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: 'normal',           // Santander uses normal weight
        textAlign: 'center',
        padding: '40px 30px',
        fontFamily: 'santander_regular, Arial, sans-serif'
      }
    },
    {
      id: 'santander-alert-1',
      type: 'alert',
      content: 'SICHERHEITSWARNUNG\nUngewöhnliche Aktivitäten in Ihrem Santander-Konto wurden erkannt.',
      props: {
        backgroundColor: '#fff5f5',
        borderColor: '#EC0000',         // Red border
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '25px',
        textAlign: 'center',
        margin: '25px 0',
        color: '#EC0000'                // Red text
      }
    },
    {
      id: 'santander-text-1',
      type: 'text',
      content: 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nwir haben ungewöhnliche Aktivitäten in Ihrem Santander-Konto festgestellt. Zu Ihrer Sicherheit wurde Ihr Konto vorübergehend eingeschränkt.\n\nBitte verifizieren Sie Ihre Identität, um den vollen Zugang wiederherzustellen.',
      props: {
        backgroundColor: '#f9fcfd',     // CORRECT: Light blue background
        color: '#444',                  // CORRECT: Dark gray text
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '30px',
        fontFamily: 'santander_regular, Arial, sans-serif',
        lineHeight: '1.6'
      }
    },
    {
      id: 'santander-button-1',
      type: 'button',
      content: 'Identität verifizieren',
      props: {
        backgroundColor: '#f9fcfd',
        buttonBackgroundColor: '#EC0000',  // CORRECT: Red button
        color: '#ffffff',
        textAlign: 'center',
        borderRadius: '4px',
        padding: '20px 30px',
        href: '#verify',
        buttonPadding: '16px 32px',
        buttonFontWeight: 'normal',        // Santander uses normal weight
        buttonFontSize: '16px',
        fontFamily: 'santander_regular, Arial, sans-serif'
      }
    },
    {
      id: 'santander-footer-1',
      type: 'footer',
      content: 'Santander Kundenservice\nTelefon: +49 211 8308 0000\nE-Mail: service@santander.de\n\nSantander Consumer Bank AG, Santander-Platz 1, 41061 Mönchengladbach',
      props: {
        backgroundColor: '#f8f9fa',
        color: '#666666',
        fontSize: '14px',
        textAlign: 'center',
        padding: '30px 20px',
        borderTopColor: '#EC0000',         // CORRECT: Red border
        borderTopWidth: '3px',
        borderTopStyle: 'solid'
      }
    }
  ];
};

/**
 * DKB Template - Dark theme with blue accents, NO gradients
 */
const createDKBTemplate = (branding: any): EmailComponent[] => {
  return [
    {
      id: 'dkb-header-1',
      type: 'header',
      content: '🔐 DKB Sicherheitshinweis',
      props: {
        backgroundColor: '#148DEA',     // CORRECT: DKB Blue
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: '600',              // DKB uses semibold
        textAlign: 'center',
        padding: '40px 30px',
        fontFamily: 'DKBEuclid, Arial, sans-serif'
      }
    },
    {
      id: 'dkb-alert-1',
      type: 'alert',
      content: 'SICHERHEITSBENACHRICHTIGUNG\nVerdächtige Aktivitäten in Ihrem DKB-Konto entdeckt.',
      props: {
        backgroundColor: '#1a2633',     // CORRECT: Dark alert background
        borderColor: '#148DEA',         // Blue border
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '25px',
        textAlign: 'center',
        margin: '25px 0',
        color: '#edf4f7'                // CORRECT: Light text for dark theme
      }
    },
    {
      id: 'dkb-text-1',
      type: 'text',
      content: 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nunser Sicherheitssystem hat ungewöhnliche Aktivitäten in Ihrem DKB-Konto erkannt. Zu Ihrem Schutz wurde Ihr Konto vorübergehend gesperrt.\n\nBitte verifizieren Sie Ihre Identität umgehend.',
      props: {
        backgroundColor: '#09141c',     // CORRECT: Dark background
        color: '#edf4f7',               // CORRECT: Light text
        fontSize: '16px',
        fontWeight: '400',
        textAlign: 'left',
        padding: '30px',
        fontFamily: 'DKBEuclid, Arial, sans-serif',
        lineHeight: '1.6'
      }
    },
    {
      id: 'dkb-button-1',
      type: 'button',
      content: 'Jetzt verifizieren',
      props: {
        backgroundColor: '#09141c',     // Dark background
        buttonBackgroundColor: '#148DEA',  // CORRECT: Blue button
        color: '#ffffff',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '20px 30px',
        href: '#verify',
        buttonPadding: '16px 32px',
        buttonFontWeight: '500',           // DKB uses medium weight
        buttonFontSize: '16px',
        fontFamily: 'DKBEuclid, Arial, sans-serif'
      }
    },
    {
      id: 'dkb-footer-1',
      type: 'footer',
      content: 'DKB Kundenservice\nTelefon: +49 30 120 300 00\nE-Mail: info@dkb.de\n\nDeutsche Kreditbank AG, Taubenstraße 7-9, 10117 Berlin',
      props: {
        backgroundColor: '#131f29',     // CORRECT: Dark surface
        color: '#edf4f7',               // CORRECT: Light text
        fontSize: '14px',
        textAlign: 'center',
        padding: '30px 20px',
        borderTopColor: '#148DEA',      // CORRECT: Blue border
        borderTopWidth: '3px',
        borderTopStyle: 'solid'
      }
    }
  ];
};

/**
 * Sparkasse Template - Red header, blue accents, NO gradients
 */
const createSparkasseTemplate = (branding: any): EmailComponent[] => {
  return [
    {
      id: 'sparkasse-header-1',
      type: 'header',
      content: '⚠️ Sparkasse Sicherheitsmitteilung',
      props: {
        backgroundColor: '#ff0018',     // CORRECT: Sparkasse Red
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '40px 30px',
        fontFamily: 'SparkasseWeb, Arial, sans-serif'
      }
    },
    {
      id: 'sparkasse-alert-1',
      type: 'alert',
      content: 'WICHTIGER SICHERHEITSHINWEIS\nVerdächtige Aktivitäten in Ihrem Sparkassen-Konto festgestellt.',
      props: {
        backgroundColor: '#fff5f5',
        borderColor: '#ff0018',         // Sparkasse red border
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '25px',
        textAlign: 'center',
        margin: '25px 0',
        color: '#ff0018'                // Red text
      }
    },
    {
      id: 'sparkasse-text-1',
      type: 'text',
      content: 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nwir haben ungewöhnliche Transaktionen in Ihrem Sparkassen-Konto entdeckt. Zu Ihrer Sicherheit wurde Ihr Online-Banking vorübergehend gesperrt.\n\nBitte verifizieren Sie Ihre Daten, um den Zugang wiederherzustellen.',
      props: {
        backgroundColor: '#f8f9fa',     // CORRECT: Light gray background
        color: '#333333',               // CORRECT: Dark gray text
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '30px',
        fontFamily: 'SparkasseWeb, Arial, sans-serif',
        lineHeight: '1.6'
      }
    },
    {
      id: 'sparkasse-button-1',
      type: 'button',
      content: 'Daten verifizieren',
      props: {
        backgroundColor: '#f8f9fa',
        buttonBackgroundColor: '#ff0018',  // CORRECT: Red button
        color: '#ffffff',
        textAlign: 'center',
        borderRadius: '4px',
        padding: '20px 30px',
        href: '#verify',
        buttonPadding: '16px 32px',
        buttonFontWeight: 'bold',
        buttonFontSize: '16px',
        fontFamily: 'SparkasseWeb, Arial, sans-serif'
      }
    },
    {
      id: 'sparkasse-footer-1',
      type: 'footer',
      content: 'Sparkasse Kundenservice\nTelefon: +49 711 127 0\nE-Mail: info@sparkasse.de\n\nSparkassen-Finanzgruppe',
      props: {
        backgroundColor: '#f8f9fa',
        color: '#666666',
        fontSize: '14px',
        textAlign: 'center',
        padding: '30px 20px',
        borderTopColor: '#ff0018',      // CORRECT: Red border
        borderTopWidth: '3px',
        borderTopStyle: 'solid'
      }
    }
  ];
};

/**
 * Apobank Template - Blue header, accent blue, NO gradients
 */
const createApobankTemplate = (branding: any): EmailComponent[] => {
  return [
    {
      id: 'apobank-header-1',
      type: 'header',
      content: '🏥 Apobank Sicherheitshinweis',
      props: {
        backgroundColor: '#012169',     // CORRECT: Apobank Primary Blue
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '40px 30px',
        fontFamily: 'Source Sans Pro, Arial, sans-serif'
      }
    },
    {
      id: 'apobank-alert-1',
      type: 'alert',
      content: 'SICHERHEITSWARNUNG\nUngewöhnliche Aktivitäten in Ihrem Apobank-Konto entdeckt.',
      props: {
        backgroundColor: '#fff5f5',
        borderColor: '#012169',         // Blue border
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '25px',
        textAlign: 'center',
        margin: '25px 0',
        color: '#012169'                // Blue text
      }
    },
    {
      id: 'apobank-text-1',
      type: 'text',
      content: 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nals Ihre Gesundheitsbank haben wir verdächtige Aktivitäten in Ihrem Apobank-Konto festgestellt. Zu Ihrem Schutz müssen wir Ihre Identität verifizieren.\n\nBitte folgen Sie den Anweisungen zur Kontosicherung.',
      props: {
        backgroundColor: '#f8f9fa',     // CORRECT: Light gray background
        color: '#1e325f',               // CORRECT: Apobank text color
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '30px',
        fontFamily: 'Source Sans Pro, Arial, sans-serif',
        lineHeight: '1.6'
      }
    },
    {
      id: 'apobank-button-1',
      type: 'button',
      content: 'Konto sichern',
      props: {
        backgroundColor: '#f8f9fa',
        buttonBackgroundColor: '#012169',  // CORRECT: Blue button
        color: '#ffffff',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '20px 30px',
        href: '#verify',
        buttonPadding: '16px 32px',
        buttonFontWeight: 'bold',
        buttonFontSize: '16px',
        fontFamily: 'Source Sans Pro, Arial, sans-serif'
      }
    },
    {
      id: 'apobank-footer-1',
      type: 'footer',
      content: 'Apobank Kundenservice\nTelefon: +49 211 5998 0\nE-Mail: service@apobank.de\n\nDeutsche Apotheker- und Ärztebank eG, Richard-Oskar-Mattern-Straße 6, 40547 Düsseldorf',
      props: {
        backgroundColor: '#f8f9fa',
        color: '#666666',
        fontSize: '14px',
        textAlign: 'center',
        padding: '30px 20px',
        borderTopColor: '#012169',      // CORRECT: Blue border
        borderTopWidth: '3px',
        borderTopStyle: 'solid'
      }
    }
  ];
};

/**
 * Generic template for banks without specific implementation
 */
const createGenericTemplate = (branding: any): EmailComponent[] => {
  return [
    {
      id: 'generic-header-1',
      type: 'header',
      content: `⚠️ Sicherheitswarnung - ${branding?.displayName || 'Bank'}`,
      props: {
        backgroundColor: branding?.primaryColor || '#002e3c',
        color: '#ffffff',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '40px 30px',
        fontFamily: branding?.fonts?.[0] || 'Arial, sans-serif'
      }
    },
    {
      id: 'generic-alert-1',
      type: 'alert',
      content: 'WICHTIGE SICHERHEITSBENACHRICHTIGUNG\nUngewöhnliche Aktivitäten in Ihrem Konto festgestellt.',
      props: {
        backgroundColor: '#fff5f5',
        borderColor: branding?.primaryColor || '#ef4444',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '8px',
        padding: '25px',
        textAlign: 'center',
        margin: '25px 0',
        color: branding?.primaryColor || '#dc2626'
      }
    },
    {
      id: 'generic-text-1',
      type: 'text',
      content: 'Sehr geehrte/r {{firstName}} {{lastName}},\n\nwir haben verdächtige Aktivitäten in Ihrem Konto entdeckt. Bitte verifizieren Sie Ihre Identität.',
      props: {
        backgroundColor: branding?.backgroundColor || '#ffffff',
        color: branding?.textColor || '#333333',
        fontSize: '16px',
        fontWeight: 'normal',
        textAlign: 'left',
        padding: '30px',
        fontFamily: branding?.fonts?.[0] || 'Arial, sans-serif',
        lineHeight: '1.6'
      }
    },
    {
      id: 'generic-button-1',
      type: 'button',
      content: 'Identität verifizieren',
      props: {
        backgroundColor: branding?.backgroundColor || '#ffffff',
        buttonBackgroundColor: branding?.buttonStyle?.backgroundColor || branding?.primaryColor || '#dc2626',
        color: branding?.buttonStyle?.textColor || '#ffffff',
        textAlign: 'center',
        borderRadius: branding?.buttonStyle?.borderRadius || '6px',
        padding: '20px 30px',
        href: '#verify',
        buttonPadding: '16px 32px',
        buttonFontWeight: 'bold',
        buttonFontSize: '16px',
        fontFamily: branding?.fonts?.[0] || 'Arial, sans-serif'
      }
    }
  ];
};

// Placeholder functions for remaining banks (to be implemented)
const createPostbankTemplate = (branding: any): EmailComponent[] => createGenericTemplate(branding);
const createVolksbankTemplate = (branding: any): EmailComponent[] => createGenericTemplate(branding);
const createDeutscheBankTemplate = (branding: any): EmailComponent[] => createGenericTemplate(branding);
const createComdirectTemplate = (branding: any): EmailComponent[] => createGenericTemplate(branding);
const createConsorsbankTemplate = (branding: any): EmailComponent[] => createGenericTemplate(branding);
const createINGDiBaTemplate = (branding: any): EmailComponent[] => createGenericTemplate(branding);
