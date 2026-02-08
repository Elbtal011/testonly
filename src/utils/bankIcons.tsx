import React from 'react';
import CompositeIcon from '../components/CompositeIcon';

// Shared bank icon utility for dashboard components

export const getBankIconPath = (templateName: string): string | null => {
  if (!templateName) return null;
  
  const iconPaths: { [key: string]: string } = {
    'commerzbank': '/images/icons/commerzbank.png',
    'santander': '/images/icons/santander.png',
    'apobank': '/images/icons/apobank.png',
    'sparkasse': '/images/icons/sparkasse.png',
    'postbank': '/images/icons/postbank.png',
    'dkb': '/images/icons/dkb.png',
    'volksbank': '/images/icons/volksbank.png',
    'deutsche_bank': '/images/icons/deutschebank.png',
    'comdirect': '/images/icons/comdirect.png',
    'consorsbank': '/images/icons/Consorsbank.png',
    'ingdiba': '/images/icons/ingdiba.png',
    'klarna': '/images/icons/klarna.png',
    'credit-landing': '/images/icons/klarna.png',
    'targobank': '/images/icons/targobank.png'
  };
  
  return iconPaths[templateName.toLowerCase()] || null;
};

interface BankIconProps {
  templateName: string;
  selectedBank?: string; // For composite icons (Klarna + bank)
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BankIcon: React.FC<BankIconProps> = ({ 
  templateName, 
  selectedBank,
  size = 'md', 
  className = '' 
}) => {
  // Handle undefined templateName
  if (!templateName) {
    return (
      <div className={`flex items-center justify-center ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} bg-gray-100 rounded text-xs font-medium text-gray-600 ${className}`}>
        ?
      </div>
    );
  }

  // Handle Klarna composite icons (Klarna logo + bank icon overlay)
  if (templateName.toLowerCase() === 'klarna') {
    const klarnaIconPath = getBankIconPath('klarna');
    
    if (selectedBank && selectedBank !== 'generic') {
      // Show specific bank overlay
      const bankIconPath = getBankIconPath(selectedBank);
      if (klarnaIconPath && bankIconPath) {
        return (
          <CompositeIcon
            mainIcon={klarnaIconPath}
            overlayIcon={bankIconPath}
            mainAlt="Klarna"
            overlayAlt={selectedBank}
            size={size}
            className={className}
          />
        );
      }
    } else if (selectedBank === 'generic') {
      // Show generic bank overlay for old leads
      const genericBankIcon = '/images/icons/bankingsuote.png';
      if (klarnaIconPath) {
        return (
          <CompositeIcon
            mainIcon={klarnaIconPath}
            overlayIcon={genericBankIcon}
            mainAlt="Klarna"
            overlayAlt="Bank"
            size={size}
            className={className}
          />
        );
      }
    }
    
    // Fallback: Show regular Klarna icon if no bank data or composite fails
    if (klarnaIconPath) {
      return (
        <img 
          src={klarnaIconPath}
          alt="Klarna"
          className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} object-contain ${className}`}
          onError={(e) => {
            console.warn('Klarna icon failed to load, using fallback');
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<div class="flex items-center justify-center ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'} bg-pink-100 rounded text-xs font-medium text-pink-600">K</div>`;
            }
          }}
        />
      );
    }
  }

  const iconPath = getBankIconPath(templateName);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };
  
  if (iconPath) {
    return (
      <img 
        src={iconPath}
        alt={`${templateName} Logo`}
        className={`${sizeClasses[size]} object-contain ${className}`}
        onError={(e) => {
          // Fallback to first letter if image fails
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<div class="flex items-center justify-center ${sizeClasses[size]} bg-gray-100 rounded text-xs font-medium text-gray-600">${templateName.charAt(0).toUpperCase()}</div>`;
          }
        }}
      />
    );
  }
  
  // Fallback to first letter
  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} bg-gray-100 rounded text-xs font-medium text-gray-600 ${className}`}>
      {templateName.charAt(0).toUpperCase()}
    </div>
  );
};
