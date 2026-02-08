import React from 'react';

const PostbankFooter: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #e0e0e0',
      padding: '0',
      marginTop: '60px',
      width: '100vw',
      position: 'relative',
      left: '50%',
      right: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw'
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '40px 0',
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
        {/* Social Media and Newsletter Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '30px'
        }}>
          {/* Social Media */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Folgen Sie uns
            </h3>
            <div style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'center'
            }}>
              <a href="#" style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ff0000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}>
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>▶</span>
              </a>
              <a href="#" style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#0077b5',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}>
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>in</span>
              </a>
              <a href="#" style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1877f2',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}>
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>f</span>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div style={{ flex: '1', maxWidth: '400px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Postbank Newsletter
            </h3>
            <div style={{
              display: 'flex',
              gap: '0'
            }}>
              <input
                type="email"
                placeholder="E-Mail-Adresse"
                style={{
                  flex: '1',
                  padding: '12px 16px',
                  border: '1px solid #ccc',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  fontSize: '14px',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                  outline: 'none'
                }}
              />
              <button style={{
                backgroundColor: '#0018a8',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '0 4px 4px 0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Abonnieren
              </button>
            </div>
          </div>

          {/* Awards */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Auszeichnungen
            </h3>
            <div style={{
              display: 'flex',
              gap: '10px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                textAlign: 'center',
                color: '#333'
              }}>
                BESTES<br/>GIROKONTO
              </div>
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Aktuell */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Aktuell
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {['Apple Pay', 'Unternehmen', 'Postbank App', 'BestSign-App', 'Wero'].map((item) => (
                <li key={item} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{
                    color: '#0018a8',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hilfreich */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Hilfreich
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {['Login-Probleme', 'Karte sperren', 'Western Union', 'Kontakt', 'myBHW'].map((item) => (
                <li key={item} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{
                    color: '#0018a8',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Interessant */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Interessant
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {['Freundschaftswerbung', 'Schufa-Auskunft', 'Soziales Engagement', 'Nachhaltigkeit', 'ETF-Sparplanrechner'].map((item) => (
                <li key={item} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{
                    color: '#0018a8',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Beliebt */}
          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '15px',
              fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
            }}>
              Beliebt
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {['Umzugskredit', 'Gemeinschaftskonto', 'ETFs', 'Gehaltskonto', 'Anschlussfinanzierung'].map((item) => (
                <li key={item} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{
                    color: '#0018a8',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        </div>
      </div>
      
      {/* Bottom Section - Full Width Yellow */}
      <div style={{
        backgroundColor: '#fc0',
        width: '100%',
        padding: '20px 0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Legal Links */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            alignItems: 'center'
          }}>
            {[
              'Sicherheit Einstellungen',
              'Impressum',
              'Datenschutz',
              'Barrierefreiheit',
              'AGB',
              'Formulare',
              'Medien',
              'Über uns',
              'Cookie-Einstellungen'
            ].map((item) => (
              <a key={item} href="#" style={{
                color: '#0018a8',
                textDecoration: 'none',
                fontSize: '12px',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontWeight: '600'
              }}>
                {item}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div style={{
            fontSize: '12px',
            color: '#333',
            fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
          }}>
            © 2025 Postbank – eine Niederlassung der Deutsche Bank AG
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PostbankFooter;
