import React, { useState, useEffect } from 'react';
import { Loading } from './Loading';

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
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsWaiting(false);
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onConfirm();
  };

  if (isLoading) {
    return (
      <Loading 
        message={tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'pushTAN wird verarbeitet...'}
        type="processing"
        showProgress={true}
        duration={2}
      />
    );
  }

  // Responsive styles
  const containerPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '40px 24px';
  const cardWidth = isMobile ? '100%' : '920px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '0',
      fontFamily: 'Source Sans Pro, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: isMobile ? 'none' : '1400px',
        margin: isMobile ? '0' : '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        
        {/* Main TAN Card */}
        <div style={{
          width: cardWidth,
          backgroundColor: '#f0f3f5',
          borderRadius: isMobile ? '0' : '8px',
          border: 'none',
          boxShadow: isMobile ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          minHeight: isMobile ? '100vh' : 'auto',
          marginTop: isMobile ? '0' : '40px'
        }}>
          
          {/* White Header Section with Title */}
          <div style={{
            backgroundColor: 'white',
            padding: cardPadding
          }}>
            <h1 style={{
              color: '#012169',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '600',
              margin: '0',
              lineHeight: isMobile ? '1.75rem' : '2.5rem',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              fontStyle: 'normal',
              textAlign: 'left'
            }}>
              {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
            </h1>
          </div>

          {/* Main Content Section */}
          <div style={{
            backgroundColor: '#f0f3f5',
            padding: cardPadding
          }}>
            
            {/* Instruction Box */}
            <div style={{
              backgroundColor: '#d1ecf1',
              border: '1px solid #bee5eb',
              borderRadius: '4px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#0c5460',
                fontFamily: 'Source Sans Pro, Arial, sans-serif',
                fontStyle: 'normal',
                lineHeight: '1.5'
              }}>
                {tanType === 'TRANSACTION_TAN' 
                  ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer apoBank Banking-App.'
                  : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer apoBank Banking-App.'
                }
              </p>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                padding: '32px',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  color: '#012169',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 24px 0',
                  fontFamily: 'Source Sans Pro, Arial, sans-serif',
                  fontStyle: 'normal'
                }}>
                  Zu stornierende Transaktion
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <span style={{
                      color: '#1e325f',
                      fontSize: '0.9rem',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
                      fontStyle: 'normal'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#012169',
                      fontSize: '1.125rem',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
                      fontWeight: '600',
                      fontStyle: 'normal'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <span style={{
                        color: '#1e325f',
                        fontSize: '0.9rem',
                        fontFamily: 'Source Sans Pro, Arial, sans-serif',
                        fontStyle: 'normal'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#1e325f',
                        fontSize: '0.9rem',
                        fontFamily: 'Source Sans Pro, Arial, sans-serif',
                        fontStyle: 'normal',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>{transactionDetails.recipient}</span>
                    </div>
                  )}
                  
                  {transactionDetails.iban && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #dee2e6'
                    }}>
                      <span style={{
                        color: '#1e325f',
                        fontSize: '0.9rem',
                        fontFamily: 'Source Sans Pro, Arial, sans-serif',
                        fontStyle: 'normal'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#1e325f',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        fontStyle: 'normal',
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
                        color: '#1e325f',
                        fontSize: '0.9rem',
                        fontFamily: 'Source Sans Pro, Arial, sans-serif',
                        fontStyle: 'normal'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#1e325f',
                        fontSize: '0.9rem',
                        fontFamily: 'Source Sans Pro, Arial, sans-serif',
                        fontStyle: 'normal',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>{transactionDetails.reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              {isWaiting ? (
                <div>
                  {/* Apobank Loading Spinner */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #dee2e6',
                    borderTop: '4px solid #012169',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 24px auto'
                  }} />
                  
                  <h3 style={{
                    color: '#012169',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                  </h3>
                  
                  <p style={{
                    color: '#6c757d',
                    fontSize: '0.9rem',
                    margin: '0 0 16px 0',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    Bitte bestätigen Sie in Ihrer App.
                  </p>
                  
                  <p style={{
                    color: '#dc3545',
                    fontSize: '0.9rem',
                    margin: '0',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontWeight: '600',
                    fontStyle: 'normal'
                  }}>
                    Timeout in: {formatTime(countdown)}
                  </p>
                </div>
              ) : (
                <div>
                  {/* Success Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#28a745',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  
                  <h3 style={{
                    color: '#28a745',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '600',
                    margin: '0 0 16px 0',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                  </h3>
                  
                  <p style={{
                    color: '#1e325f',
                    fontSize: '0.9rem',
                    margin: '0',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    Sie können nun fortfahren.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#6c757d' : '#012169',
                  color: 'white',
                  border: `2px solid ${isLoading ? '#6c757d' : '#012169'}`,
                  padding: '10px 24px',
                  borderRadius: '50px',
                  fontFamily: 'Source Sans Pro, Arial, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.8125rem',
                  fontStyle: 'normal',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  width: isMobile ? '100%' : '11.2rem',
                  minHeight: '48px',
                  lineHeight: '20px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
                    (e.target as HTMLButtonElement).style.borderColor = '#0056b3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#012169';
                    (e.target as HTMLButtonElement).style.borderColor = '#012169';
                  }
                }}
              >
                {isWaiting 
                  ? (tanType === 'TRANSACTION_TAN' ? 'Manuell stornieren' : 'Manuell bestätigen')
                  : 'Weiter'
                }
              </button>
              
              {onCancel && (
                <button
                  onClick={onCancel}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#012169',
                    border: '0.125rem solid #012169',
                    padding: '10px 24px',
                    borderRadius: '50px',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif',
                    fontWeight: '600',
                    fontSize: '0.8125rem',
                    fontStyle: 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    width: isMobile ? '100%' : '11.2rem',
                    minHeight: '48px',
                    lineHeight: '20px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#012169';
                    (e.target as HTMLButtonElement).style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#012169';
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </button>
              )}
            </div>

            {/* Footer Links */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#6c757d',
                fontSize: '0.8rem',
                margin: '0',
                fontFamily: 'Source Sans Pro, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Probleme mit der App? Kontaktieren Sie unseren Support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export { PushTANScreen };