import React from 'react';

interface SelectedBranch {
  branch_id: number;
  branch_name: string;
  city: string;
  zip_code: string;
}

interface HeaderProps {
  selectedBranch?: SelectedBranch | null;
}

const Header: React.FC<HeaderProps> = ({ selectedBranch }) => {
  // Format branch name for better display
  const formatBranchName = (branchName: string): string => {
    // Branch names should already be well-formatted from the database
    // Just apply minimal display optimizations
    let formatted = branchName;
    
    // Remove redundant "eG" for display
    formatted = formatted.replace(/\s+eG\b/g, '');
    
    // Simplify long bank names for display in header (more aggressive than search)
    formatted = formatted.replace(/^Kreissparkasse\s+([A-Za-z\-]+)\s+-\s+/, 'KSK $1 - ');
    formatted = formatted.replace(/^Stadtsparkasse\s+([A-Za-z\-]+)\s+-\s+/, 'SSK $1 - ');
    formatted = formatted.replace(/^Sparkasse\s+([A-Za-z\-]+)\s+-\s+/, 'SPK $1 - ');
    
    return formatted;
  };
  
  return (
    <>
      {/* Top Red Header Row with tabs */}
      <header style={{
        backgroundColor: '#ff0018',
        padding: '0',
        position: 'relative',
        zIndex: 1000,
        height: '40px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '24px'
        }}>
          {/* Customer type tabs */}
          <div style={{
            display: 'flex',
            height: '100%'
          }}>
            <div style={{
              backgroundColor: '#ff0018',
              color: 'white',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              borderRadius: '20px 20px 0 0',
              height: '40px',
              marginRight: '2px'
            }}>
              Privatkunden
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              fontFamily: 'SparkasseWeb, Arial, sans-serif',
              cursor: 'pointer',
              height: '40px'
            }}>
              Firmenkunden
            </div>
          </div>
        </div>
      </header>

      {/* Main Header Row with Logo and Navigation - ALL RED */}
      <div style={{
        backgroundColor: '#ff0018',
        padding: '0',
        borderBottom: 'none'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          height: '76px'
        }}>
          {/* Left side with logo, branch info, and navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '40px',
            flex: 1
          }}>
            <img 
              src="/templates/sparkasse/images/tenant_header_logo.svg" 
              alt="Sparkasse" 
              style={{ 
                height: '40px',
                width: 'auto',
                maxWidth: '200px',
                filter: 'brightness(0) invert(1)'
              }}
            />
            
            {/* Branch Information */}
            {selectedBranch && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>|</span>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  lineHeight: '1.2'
                }}>
                  <span style={{ 
                    fontWeight: '600',
                    color: 'white',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {formatBranchName(selectedBranch.branch_name)}
                  </span>
                  <span style={{ 
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {selectedBranch.city} • {selectedBranch.zip_code}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation menu - LEFT ALIGNED */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px'
            }}>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                Produkte
              </a>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                Beratung
              </a>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                Service-Center
              </a>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                Ratgeber
              </a>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                Ihre Sparkasse
              </a>
              <a href="#" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontFamily: 'SparkasseWeb, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                Karriere
              </a>
            </nav>
          </div>

          {/* Search - RIGHT ALIGNED */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'white',
            fontSize: '16px',
            fontFamily: 'SparkasseWeb, Arial, sans-serif',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Suche</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;