import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <footer style={{
      marginTop: '0'
    }}>
      {/* Main Footer with dark background matching Consors Bank */}
      <div style={{
        backgroundColor: '#4a4a4a',
        padding: isMobile ? '30px 0 20px 0' : '40px 0 20px 0',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 15px' : '0 24px'
        }}>
          {/* Top section with help icons */}
          <div style={{
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: isMobile ? '15px' : '20px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <div style={{
              display: 'flex',
              gap: isMobile ? '20px' : '40px',
              alignItems: 'center',
              flexWrap: 'wrap',
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '1px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>?</div>
                <span style={{
                  fontSize: isMobile ? '14px' : '14px',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
                }}>Hilfe & Kontakt</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <span style={{
                  fontSize: isMobile ? '14px' : '14px',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
                }}>Karte sperren</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 2.5l.5.5H19v11H5V7h3.5l.5-.5h6z"/>
                  </svg>
                </div>
                <span style={{
                  fontSize: isMobile ? '14px' : '14px',
                  fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
                }}>Chatten Sie mit uns</span>
              </div>
            </div>
            
            {/* Award Badge Image */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              order: isMobile ? -1 : 0,
              marginBottom: isMobile ? '20px' : '0'
            }}>
              <img 
                src="/templates/consorsbank/images/footer-image.jpg" 
                alt="MONEY BESTER ONLINE-BROKER Award" 
                style={{ 
                  height: isMobile ? '80px' : '120px',
                  width: 'auto',
                  maxWidth: isMobile ? '120px' : '150px'
                }} 
              />
            </div>
          </div>

          {/* Navigation sections */}
          <div style={{
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: isMobile ? '15px' : '20px',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start'
          }}>
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>Kunde werden</a>
            
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>Aktion</a>
            
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>Preise & Zinsen</a>
            
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>Über uns</a>
            
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>Karriere</a>
            
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>Presse</a>
            
            <a href="#" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: isMobile ? '16px' : '14px',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              fontWeight: '400',
              padding: isMobile ? '8px 0' : '0',
              textAlign: isMobile ? 'center' : 'left'
            }}>B2B</a>
          </div>

          {/* Market data disclaimer */}
          <div style={{
            marginBottom: '20px',
            fontSize: isMobile ? '11px' : '12px',
            lineHeight: '1.4',
            color: '#ccc',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Mit † gekennzeichnete Kurse stehen in Realtime zur Verfügung.<br/>
            Mit * gekennzeichnete Kurse sind Realtime-Indikationen.<br/>
            Sonstige Kurse der deutschen / internationalen Börsen sind 15 bzw. 20 Min. verzögert.
          </div>

          {/* Social Media Icons */}
          <div style={{
            display: 'flex',
            gap: isMobile ? '20px' : '16px',
            marginBottom: '20px',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <a href="#" style={{
              color: 'white',
              fontSize: '20px',
              textDecoration: 'none'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" style={{
              color: 'white',
              fontSize: '20px',
              textDecoration: 'none'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </a>
            <a href="#" style={{
              color: 'white',
              fontSize: '20px',
              textDecoration: 'none'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" style={{
              color: 'white',
              fontSize: '20px',
              textDecoration: 'none'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.886 2.748.097.118.112.223.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
              </svg>
            </a>
          </div>

          {/* Company info */}
          <div style={{
            display: 'flex',
            justifyContent: isMobile ? 'center' : 'space-between',
            alignItems: isMobile ? 'center' : 'flex-start',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '15px' : '20px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: isMobile ? '12px' : '12px',
              color: '#ccc',
              fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Consors Finanz BNP Paribas S.A. Niederlassung Deutschland<br/>
              Schwanthalerstraße 31, 80336 München
            </div>
            
            <div style={{
              display: 'flex',
              gap: isMobile ? '15px' : '20px',
              fontSize: isMobile ? '12px' : '12px',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-end'
            }}>
              <a href="#" style={{
                color: '#ccc',
                textDecoration: 'none',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
              }}>Impressum</a>
              <a href="#" style={{
                color: '#ccc',
                textDecoration: 'none',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
              }}>Datenschutz</a>
              <a href="#" style={{
                color: '#ccc',
                textDecoration: 'none',
                fontFamily: 'Proxima Nova Vara, system-ui, sans-serif'
              }}>AGB</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary footer with lighter background */}
      <div style={{
        backgroundColor: '#333333',
        padding: isMobile ? '15px 0' : '20px 0',
        borderTop: '1px solid #666'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 15px' : '0 24px',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#999',
            fontSize: isMobile ? '11px' : '12px',
            fontFamily: 'Proxima Nova Vara, system-ui, sans-serif',
            margin: 0,
            lineHeight: '1.4'
          }}>
            © 2024 Consors Finanz BNP Paribas S.A. Niederlassung Deutschland. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
