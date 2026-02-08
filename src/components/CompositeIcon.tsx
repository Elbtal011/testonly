import React from 'react';

interface CompositeIconProps {
  mainIcon: string;
  overlayIcon: string;
  mainAlt: string;
  overlayAlt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * CompositeIcon - Shows a main icon with a smaller overlay icon in the bottom-right corner
 * Perfect for showing Klarna logo with bank icon overlay
 */
export const CompositeIcon: React.FC<CompositeIconProps> = ({
  mainIcon,
  overlayIcon,
  mainAlt,
  overlayAlt,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: { container: 'h-6 w-6', main: 'h-6 w-6', overlay: 'h-3 w-3' },
    md: { container: 'h-8 w-8', main: 'h-8 w-8', overlay: 'h-4 w-4' },
    lg: { container: 'h-10 w-10', main: 'h-10 w-10', overlay: 'h-5 w-5' }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={`composite-icon-container ${sizes.container} ${className}`}>
      {/* Main Icon */}
      <img
        src={mainIcon}
        alt={mainAlt}
        className={`composite-icon-main ${sizes.main} object-contain`}
        onError={(e) => {
          // Fallback for main icon
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      
      {/* Overlay Icon - Bottom Right Corner */}
      <div className="composite-icon-overlay">
        <img
          src={overlayIcon}
          alt={overlayAlt}
          className={`${sizes.overlay} object-contain`}
          onError={(e) => {
            // Fallback for overlay icon
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
    </div>
  );
};

export default CompositeIcon;
