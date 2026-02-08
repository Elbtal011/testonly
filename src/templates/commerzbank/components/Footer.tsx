import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ marginTop: isMobile ? '40px' : '60px' }}>
      {/* White background section behind the yellow banner */}
      <div style={{ 
        backgroundColor: '#ffffff',
        height: isMobile ? '170px' : '200px',
        width: '100%'
      }}></div>
      
      <footer style={{ 
        backgroundColor: '#002e3c', 
        color: 'white', 
        position: 'relative', 
        paddingTop: isMobile ? '65px' : '60px',
        fontFamily: 'Gotham, Arial, sans-serif'
      }}>
        {/* Yellow help section - responsive */}
        <div style={{ 
          position: 'absolute', 
          top: isMobile ? '-85px' : '-100px', 
          left: '50%', 
          transform: 'translate(-50%, 0)', 
          width: isMobile ? '90%' : '1440px',
          maxWidth: isMobile ? '380px' : '1440px',
          height: isMobile ? '170px' : '200px',
          zIndex: 10
        }}>
          <div style={{ 
            backgroundColor: '#FFD700', 
          color: '#002e3c', 
            width: '100%',
            height: '100%',
          borderRadius: '12px', 
          display: 'flex', 
          justifyContent: 'space-between', 
            alignItems: 'center',
            padding: isMobile ? '25px 30px 35px 30px' : '0 60px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '25px' : '0'
        }}>
          <div>
              <p style={{ 
                fontWeight: '600', 
                margin: 0, 
                fontSize: isMobile ? '20px' : '28px',
                fontFamily: 'Gotham, Arial, sans-serif',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                Wie können wir helfen?
              </p>
        </div>
            <div style={{ display: 'flex', gap: isMobile ? '25px' : '40px' }}>
            <a href="#" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none', 
                color: '#002e3c'
              }}
              >
              <div style={{ 
                  width: isMobile ? '45px' : '60px',
                  height: isMobile ? '45px' : '60px', 
                borderRadius: '50%', 
                  border: '1px solid #002e3c', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                  marginBottom: isMobile ? '10px' : '12px',
                  backgroundColor: 'transparent',
                  transition: 'border 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #002e3c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid #002e3c';
              }}
              >
                  <svg fill="currentColor" width={isMobile ? "20px" : "24px"} height={isMobile ? "20px" : "24px"} focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M23.58 12.63 20 18.84a5.52 5.52 0 0 0-.18-.92c-.11-.41-.39-1.26-.48-1.49a10.51 10.51 0 0 0-.85-1.79L15.83 10s-1.76-3-2.66-4.62c-.11-.19-.26-.43-.44-.71l.78-.91a5.25 5.25 0 0 1 1.89-1.43A3.93 3.93 0 0 1 16.93 2h.52Zm-5.14 8.93-.25.43H5.91L2.32 15.8a6.47 6.47 0 0 0 .88.3c.42.11 1.3.29 1.54.33a11.54 11.54 0 0 0 2 .16H18.2c.16.45.38 1.07.4 1.14a5.27 5.27 0 0 1 .32 2.37 4.11 4.11 0 0 1-.48 1.46ZM12 3.78a12.68 12.68 0 0 0-1.13 1.63C10 7 8.25 10 8.25 10l-2.66 4.64c-.11.19-.25.44-.39.73L4 15.15a5.14 5.14 0 0 1-2.2-.9 4 4 0 0 1-1.05-1.17l-.25-.43.19-.33L6.64 2h7.16a7.7 7.7 0 0 0-.71.61c-.3.31-.89.98-1.09 1.17Z" />
                  </svg>
              </div>
                <span style={{ 
                  fontSize: isMobile ? '13px' : '18px',
                  fontWeight: '500',
                  fontFamily: 'Gotham, Arial, sans-serif'
                }}>
                  Service
                </span>
            </a>
            <a href="#" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textDecoration: 'none', 
                color: '#002e3c'
              }}
              >
              <div style={{ 
                  width: isMobile ? '45px' : '60px', 
                  height: isMobile ? '45px' : '60px', 
                borderRadius: '50%', 
                  border: '1px solid #002e3c', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                  marginBottom: isMobile ? '10px' : '12px',
                  backgroundColor: 'transparent',
                  transition: 'border 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '2px solid #002e3c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid #002e3c';
              }}
              >
                  <svg fill="currentColor" width={isMobile ? "20px" : "24px"} height={isMobile ? "20px" : "24px"} focusable="false" role="" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="m12 12.78 11-7.61V4H1v1.17l11 7.61z" />
                    <path d="M13.14 14.43a2 2 0 0 1-2.28 0L1 7.6V20h22V7.6Z" />
                  </svg>
              </div>
                <span style={{ 
                  fontSize: isMobile ? '13px' : '18px', 
                  fontWeight: '500',
                  fontFamily: 'Gotham, Arial, sans-serif'
                }}>
                  Kontakt
                </span>
            </a>
          </div>
        </div>
      </div>
      
        {/* Dark blue section with logo and links - responsive container */}
        <div style={{ 
          maxWidth: '1440px', 
          margin: '0 auto', 
          padding: '0'
        }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: isMobile ? '0.25rem' : '1rem',
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            padding: isMobile ? '2rem 1rem 0 1rem' : '1.5rem 0 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ 
                height: isMobile ? '6rem' : '8rem', 
                width: isMobile ? '12rem' : '16rem', 
                marginLeft: '0'
              }} viewBox="0 0 300 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="Wortmarke">
                  <path id="Commerzbank" d="M10.474,33.059 L10.474,33.059 C4.704,33.059 0.01,28.608 0.01,22.159 C0.01,15.993 4.785,11.056 10.751,11.056 C13.697,11.056 16.282,12.254 18.032,14.162 L15.05,17.264 C13.856,16.112 12.385,15.472 10.672,15.472 C7.41,15.472 5.104,18.381 5.104,22.04 C5.104,25.822 7.371,28.642 10.751,28.642 C12.702,28.642 14.214,27.971 15.407,26.694 L18.271,29.64 C16.322,31.87 13.776,33.059 10.474,33.059 L10.474,33.059 z M30.9,28.725 L30.9,28.725 C34.638,28.725 36.907,25.66 36.907,22.076 C36.907,18.301 34.559,15.394 30.9,15.394 C27.16,15.394 24.891,18.461 24.891,22.04 C24.891,25.822 27.239,28.725 30.9,28.725 L30.9,28.725 z M30.818,33.059 L30.818,33.059 C24.375,33.059 19.879,28.367 19.879,22.159 C19.879,16.032 24.652,11.056 30.979,11.056 C37.425,11.056 41.919,15.754 41.919,21.959 C41.919,28.091 37.145,33.059 30.818,33.059 L30.818,33.059 z M59.573,32.663 L63.154,21.005 C63.79,18.975 64.267,16.669 64.267,16.669 L64.348,16.669 C64.348,16.669 64.388,18.975 64.587,21.285 L65.542,32.663 L70.234,32.663 L68.168,11.419 L62.001,11.419 L58.777,21.959 C58.261,23.673 57.704,25.861 57.704,25.861 C57.704,25.861 57.149,23.673 56.589,21.92 L53.326,11.419 L47.04,11.419 L44.972,32.663 L49.388,32.663 L50.345,21.205 C50.542,18.975 50.582,16.669 50.582,16.669 L50.661,16.669 C50.661,16.669 51.179,18.975 51.814,21.087 L55.396,32.663 L59.573,32.663 L59.573,32.663 z M89.213,32.663 L92.793,21.005 C93.43,18.975 93.909,16.669 93.909,16.669 L93.987,16.669 C93.987,16.669 94.028,18.975 94.226,21.285 L95.18,32.663 L99.876,32.663 L97.806,11.419 L91.64,11.419 L88.419,21.959 C87.9,23.673 87.344,25.861 87.344,25.861 C87.344,25.861 86.785,23.673 86.229,21.92 L82.966,11.419 L76.679,11.419 L74.611,32.663 L79.027,32.663 L79.983,21.205 C80.182,18.975 80.222,16.669 80.222,16.669 L80.301,16.669 C80.301,16.669 80.817,18.975 81.454,21.087 L85.034,32.663 L89.213,32.663 L89.213,32.663 z M104.96,32.663 L118.766,32.663 L118.766,28.608 L109.575,28.608 L109.575,23.951 L117.373,23.951 L117.373,19.971 L109.575,19.971 L109.575,15.472 L118.645,15.472 L118.645,11.419 L104.96,11.419 L104.96,32.663 L104.96,32.663 z M134.662,18.223 L134.662,18.223 C134.662,16.151 133.23,15.394 130.761,15.394 L128.854,15.394 L128.854,21.049 L130.761,21.049 C133.35,21.049 134.662,20.212 134.662,18.223 L134.662,18.223 z M140.351,32.663 L134.862,32.663 L130.325,24.946 L128.855,24.946 L128.855,32.663 L124.239,32.663 L124.239,11.419 L130.604,11.419 C137.009,11.419 139.436,13.924 139.436,18.223 C139.436,20.968 137.885,23.074 135.139,24.109 L140.351,32.663 L140.351,32.663 z M143.077,32.663 L157.875,32.663 L157.875,28.608 L148.884,28.608 L157.678,14.922 L157.678,11.419 L143.277,11.419 L143.277,15.472 L151.867,15.472 L143.077,29.162 L143.077,32.663 L143.077,32.663 z M167.281,23.912 L167.281,28.685 L170.706,28.685 C173.055,28.685 174.088,27.849 174.088,26.219 C174.088,24.547 172.773,23.912 170.706,23.912 L167.281,23.912 L167.281,23.912 z M167.281,15.394 L167.281,20.01 L170.149,20.01 C171.622,20.01 172.892,19.335 172.892,17.626 C172.892,15.874 171.42,15.394 169.952,15.394 L167.281,15.394 L167.281,15.394 z M162.669,32.663 L162.669,11.419 L170.029,11.419 C173.731,11.419 177.791,12.254 177.791,16.87 C177.791,19.218 176.434,20.886 174.251,21.563 L174.251,21.602 C177.033,21.959 178.784,23.792 178.784,26.536 C178.784,30.954 174.565,32.663 170.787,32.663 L162.669,32.663 L162.669,32.663 z M184.984,32.663 L180.324,32.663 L187.886,11.419 L193.613,11.419 L201.171,32.663 L196.201,32.663 L194.728,28.328 L186.451,28.328 L184.984,32.663 L184.984,32.663 z M193.377,24.35 L191.507,18.699 C190.992,17.147 190.592,15.715 190.592,15.715 C190.592,15.715 190.193,17.147 189.677,18.739 L187.805,24.35 L193.377,24.35 L193.377,24.35 z M204.059,32.663 L208.357,32.663 L208.357,22.558 C208.357,20.65 208.238,18.699 208.238,18.699 C208.238,18.699 209.233,20.408 210.344,22.076 L217.544,32.663 L221.642,32.663 L221.642,11.419 L217.345,11.419 L217.345,21.049 C217.345,22.952 217.469,24.907 217.469,24.907 C217.469,24.907 216.471,23.196 215.358,21.521 L208.477,11.419 L204.059,11.419 L204.059,32.663 L204.059,32.663 z M226.75,11.419 L226.75,32.663 L231.366,32.663 L231.366,22.717 L238.17,32.663 L243.859,32.663 L236.064,21.285 L243.105,11.419 L237.771,11.419 L231.366,20.968 L231.366,11.419 L226.75,11.419 L226.75,11.419 z" fill="white" />
                  <path id="Bildmarke" d="M289.998,30.987 C289.979,30.836 289.969,30.741 289.953,30.6 C289.929,30.39 289.895,30.164 289.873,30.006 C289.845,29.802 289.78,29.428 289.733,29.207 C289.73,29.189 289.713,29.177 289.695,29.177 L276.994,29.177 C276.994,29.177 266.659,29.176 265.277,29.175 C265.18,29.175 265.091,29.175 265.074,29.175 C262.067,29.119 259.373,28.139 257.088,26.508 C257.053,26.483 257.009,26.523 257.031,26.561 L264.777,39.98 C264.784,39.992 264.797,40 264.811,40 L287.657,40 C287.67,40 287.682,39.993 287.69,39.983 C288.594,38.731 289.255,37.338 289.658,35.836 C290.034,34.434 290.167,33 290.055,31.567 C290.04,31.373 290.022,31.18 289.998,30.987 z M288.34,1.097 C288.333,1.086 288.321,1.078 288.308,1.077 C287.969,1.049 287.629,1.036 287.289,1.036 L287.288,1.036 C285.098,1.036 283.023,1.605 281.116,2.682 C280.152,3.227 279.264,3.895 278.477,4.67 C278.382,4.763 278.289,4.857 278.198,4.953 C278.186,4.966 278.184,4.985 278.193,5 C278.636,5.769 288.818,23.424 290.326,26.052 C292.787,30.339 291.714,34.827 291.368,36.064 C291.355,36.109 291.417,36.135 291.441,36.095 L299.984,21.301 C299.992,21.289 299.992,21.273 299.984,21.261 L288.34,1.097 z M266.259,0.02 L254.276,20.776 C254.269,20.789 254.269,20.805 254.277,20.818 C254.416,21.035 255.64,22.932 256.473,23.765 C257.637,24.93 258.993,25.844 260.502,26.482 C261.311,26.825 262.058,27.08 262.913,27.246 C262.93,27.249 262.947,27.241 262.956,27.226 C263.415,26.432 274.878,6.586 274.912,6.527 C276.741,3.359 279.595,1.15 282.813,0.077 C282.856,0.063 282.846,-0 282.801,-0 L266.293,-0 C266.279,-0 266.266,0.007 266.259,0.02 z" fill="white" />
                </g>
            </svg>
          </div>
          <div>
              <p style={{ 
                fontSize: isMobile ? '1rem' : '1rem', 
                margin: 0,
                fontWeight: '500',
                fontFamily: 'Gotham, Arial, sans-serif',
                color: '#e0e0e0'
              }}>
                Die Bank an Ihrer Seite
              </p>
          </div>
        </div>
        
          <div style={{ 
            paddingTop: '1.5rem',
            padding: isMobile ? '1.5rem 1rem 2rem 1rem' : '1.5rem 0 0 0'
          }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
              gap: isMobile ? '1.2rem' : '1.5rem 2rem', 
              fontSize: isMobile ? '0.9rem' : '0.875rem',
              justifyContent: isMobile ? 'center' : 'flex-start',
              fontWeight: '500'
          }}>
            <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >AGB</a>
            <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >Impressum</a>
            <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >Rechtliche Hinweise</a>
            <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >Konzern</a>
            <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >Karriere</a>
            <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
              >Datenschutz</a>
              <a href="#" style={{ 
                color: '#e0e0e0', 
                textDecoration: 'none',
                fontFamily: 'Gotham, Arial, sans-serif',
                fontWeight: '500',
                transition: 'color 0.3s ease'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#e0e0e0';
              }}
            >Einwilligungseinstellung</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
};

export default Footer;