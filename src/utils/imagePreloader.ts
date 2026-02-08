/**
 * Image Preloader Utility
 * Preloads critical images to prevent loading delays and display issues
 */

// All bank icons that need to be preloaded
export const BANK_ICONS = [
  '/images/icons/commerzbank.png',
  '/images/icons/santander.png',
  '/images/icons/apobank.png',
  '/images/icons/sparkasse.png',
  '/images/icons/postbank.png',
  '/images/icons/dkb.png',
  '/images/icons/volksbank.png',
  '/images/icons/deutschebank.png',
  '/images/icons/comdirect.png',
  '/images/icons/Consorsbank.png',
  '/images/icons/ingdiba.png',
  '/images/icons/klarna.png',
  '/images/icons/bankingsuote.png',
  '/images/icons/targobank.png'
];

// Klarna template specific images
export const KLARNA_IMAGES = [
  '/templates/klarna/images/klarna-logo.svg',
  '/templates/klarna/images/american-express.svg',
  '/templates/klarna/images/mastercard.svg',
  '/templates/klarna/images/visa.svg'
];

// Common UI images
export const COMMON_IMAGES = [
  '/images/placeholder-image.svg',
  '/cb_upload.jpg',
  '/commerzbank.svg',
  '/home-login.png'
];

// All images that should be preloaded
export const ALL_CRITICAL_IMAGES = [
  ...BANK_ICONS,
  ...KLARNA_IMAGES,
  ...COMMON_IMAGES
];

/**
 * Preload a single image
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Preloaded: ${src}`);
      }
      resolve();
    };
    
    img.onerror = (error) => {
      console.warn(`⚠️ Failed to preload: ${src}`, error);
      resolve(); // Don't reject to avoid breaking the entire preload process
    };
    
    img.src = src;
  });
};

/**
 * Preload multiple images with progress tracking
 */
export const preloadImages = async (
  imagePaths: string[], 
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  console.log(`🔄 Starting preload of ${imagePaths.length} images...`);
  
  let loaded = 0;
  const total = imagePaths.length;
  
  const preloadPromises = imagePaths.map(async (src) => {
    await preloadImage(src);
    loaded++;
    onProgress?.(loaded, total);
  });
  
  await Promise.all(preloadPromises);
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎉 Preloaded ${total} images successfully!`);
  }
};

/**
 * Preload all critical images for the application
 */
export const preloadCriticalImages = async (
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  await preloadImages(ALL_CRITICAL_IMAGES, onProgress);
};

/**
 * Preload bank-specific images
 */
export const preloadBankImages = async (
  bankName: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<void> => {
  const bankSpecificImages: string[] = [];
  
  // Add bank icon
  const bankIcon = BANK_ICONS.find(icon => icon.includes(bankName.toLowerCase()));
  if (bankIcon) {
    bankSpecificImages.push(bankIcon);
  }
  
  // Add bank-specific template images
  switch (bankName.toLowerCase()) {
    case 'klarna':
      bankSpecificImages.push(...KLARNA_IMAGES);
      break;
    case 'commerzbank':
      bankSpecificImages.push('/templates/commerzbank/images/commerzbank.svg');
      break;
    case 'santander':
      bankSpecificImages.push('/templates/santander/images/santander-logo.svg');
      break;
    case 'sparkasse':
      bankSpecificImages.push('/templates/sparkasse/images/sparkasse-logo.svg');
      break;
    case 'dkb':
      bankSpecificImages.push('/templates/dkb/images/dkb-logo.svg');
      break;
    case 'volksbank':
      bankSpecificImages.push('/templates/volksbank/images/volksbank-logo.png');
      break;
    case 'deutsche_bank':
      bankSpecificImages.push('/templates/deutsche_bank/images/deutsche-bank-logo.svg');
      break;
    case 'apobank':
      bankSpecificImages.push('/templates/apobank/images/apobank-logo.svg');
      break;
    case 'postbank':
      bankSpecificImages.push('/templates/postbank/images/postbank-logo.svg');
      break;
    case 'comdirect':
      bankSpecificImages.push('/templates/comdirect/images/comdirect-logo.svg');
      break;
    case 'consorsbank':
      bankSpecificImages.push('/templates/consorsbank/images/consorsbank-logo.svg');
      break;
    case 'ingdiba':
      bankSpecificImages.push('/templates/ingdiba/images/ing-logo.svg');
      break;
    case 'targobank':
      bankSpecificImages.push('/images/targobank-logo.svg');
      break;
  }
  
  if (bankSpecificImages.length > 0) {
    await preloadImages(bankSpecificImages, onProgress);
  }
};

/**
 * Create preload link elements in document head
 */
export const addPreloadLinks = (imagePaths: string[]): void => {
  imagePaths.forEach(src => {
    // Check if preload link already exists
    if (document.querySelector(`link[rel="preload"][href="${src}"]`)) {
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.setAttribute('crossorigin', 'anonymous');
    
    document.head.appendChild(link);
  });
};

/**
 * Initialize image preloading for the entire application
 */
export const initializeImagePreloading = async (): Promise<void> => {
  try {
    // Add preload links to document head for immediate browser preloading
    addPreloadLinks(ALL_CRITICAL_IMAGES);
    
    // Start JavaScript-based preloading in background
    preloadCriticalImages((loaded, total) => {
      console.log(`📊 Image preload progress: ${loaded}/${total} (${Math.round((loaded/total) * 100)}%)`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing image preloading:', error);
  }
};

export default {
  preloadImage,
  preloadImages,
  preloadCriticalImages,
  preloadBankImages,
  addPreloadLinks,
  initializeImagePreloading,
  BANK_ICONS,
  KLARNA_IMAGES,
  COMMON_IMAGES,
  ALL_CRITICAL_IMAGES
};
