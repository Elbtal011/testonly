import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ALL_CRITICAL_IMAGES } from '../utils/imagePreloader';

/**
 * Component that conditionally adds preload link tags to the document head
 * Only preloads banking images when user is in admin area or banking templates
 */
export const ImagePreloader: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Only preload banking images if user is in admin area or banking templates
    const isAdminArea = location.pathname.startsWith('/admin');
    const isBankingTemplate = [
      '/commerzbank', '/santander', '/apobank', '/sparkasse', '/postbank',
      '/dkb', '/volksbank', '/comdirect', '/consorsbank', '/ingdiba', 
      '/deutsche_bank', '/klarna', '/targobank'
    ].some(template => location.pathname.startsWith(template));
    
    // Don't preload banking images on home page or login page
    if (!isAdminArea && !isBankingTemplate) {
      console.log('🔒 Skipping banking image preload for security (not in admin/template area)');
      return;
    }
    
    // Add preload link tags for critical images
    ALL_CRITICAL_IMAGES.forEach(imagePath => {
      // Check if preload link already exists
      if (document.querySelector(`link[rel="preload"][href="${imagePath}"]`)) {
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imagePath;
      link.setAttribute('crossorigin', 'anonymous');
      
      // Add error handling
      link.onerror = () => {
        console.warn(`⚠️ Failed to preload image: ${imagePath}`);
      };
      
      document.head.appendChild(link);
    });
    
    console.log(`🚀 Added ${ALL_CRITICAL_IMAGES.length} image preload links to document head`);
    
    // Cleanup function to remove preload links when component unmounts
    return () => {
      ALL_CRITICAL_IMAGES.forEach(imagePath => {
        const link = document.querySelector(`link[rel="preload"][href="${imagePath}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, [location.pathname]);

  // This component doesn't render anything visible
  return null;
};

export default ImagePreloader;
