import React from 'react';

interface SelectedBranch {
  branch_id: number;
  branch_name: string;
  city: string;
  zip_code: string;
}

interface HeaderProps {
  selectedBranch?: SelectedBranch | null;
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedBranch, onLogoClick }) => {
  // Format branch name for better display
  const formatBranchName = (branchName: string): string => {
    // Remove redundant "Filiale" text and clean up formatting
    let formatted = branchName;
    
    // For "Bank 1 Saar eG Filiale [Location]" format, extract just the location
    const bank1SaarMatch = formatted.match(/^Bank 1 Saar eG\s+Filiale\s+(.+)$/);
    if (bank1SaarMatch) {
      return `Bank 1 Saar - ${bank1SaarMatch[1]}`;
    }
    
    // For other banks with "Filiale [Location]" pattern
    const filialeMatch = formatted.match(/^(.+?)\s+Filiale\s+(.+)$/);
    if (filialeMatch) {
      return `${filialeMatch[1]} - ${filialeMatch[2]}`;
    }
    
    // For "eG" banks, clean up the name
    if (formatted.includes(' eG')) {
      formatted = formatted.replace(' eG', '');
    }
    
    return formatted;
  };
  
  return (
    <>
      {/* Top Blue Header Row */}
      <header style={{
        backgroundColor: '#002d67',
        padding: '0',
        position: 'relative',
        zIndex: 1000,
        height: '45px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          height: '100%'
        }}>
          {/* Empty blue header - just the blue bar */}
        </div>
      </header>

      {/* Second Header Row with Logo */}
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '0', 
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 24px',
          height: '80px'
        }}>
          {/* VR Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img 
              src="/templates/volksbank/images/logo-vr.svg" 
              alt="VR" 
              onClick={onLogoClick}
              style={{ 
                height: '32px',
                width: 'auto',
                maxWidth: '200px',
                cursor: onLogoClick ? 'pointer' : 'default',
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (onLogoClick) {
                  e.currentTarget.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (onLogoClick) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            />
            
            {/* Branch Information */}
            {selectedBranch && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#002d67',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <span style={{ color: '#666' }}>|</span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  lineHeight: '1.2'
                }}>
                  <span style={{ 
                    fontWeight: '600',
                    color: '#002d67',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatBranchName(selectedBranch.branch_name)}
                  </span>
                  <span style={{ 
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {selectedBranch.city} • {selectedBranch.zip_code}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
