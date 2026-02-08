// Klarna Design System Theme Configuration

export const KlarnaTheme = {
  // Brand Colors
  colors: {
    primary: '#ffb3c7',
    primaryHover: '#ff9bb8',
    primaryLight: '#ffe4ea',
    black: '#0a0a0a',
    white: '#ffffff',
    
    // Grays
    gray: {
      50: '#f9f9f9',
      100: '#f7f7f7',
      200: '#e5e5e5',
      300: '#d1d1d1',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717'
    },
    
    // Semantic Colors
    text: '#2a2a2a',
    textLight: '#6b7280',
    border: '#e5e5e5',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b'
  },
  
  // Typography
  typography: {
    fontFamily: "'Klarna Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6
    }
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    base: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 40px rgba(0, 0, 0, 0.1)'
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  },
  
  // Transitions
  transitions: {
    fast: '0.15s ease',
    base: '0.2s ease',
    slow: '0.3s ease'
  },
  
  // Z-Index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060
  }
};

// CSS Custom Properties Generator
export const generateCSSVariables = (): string => {
  const cssVars: string[] = [];
  
  // Colors
  cssVars.push(`--klarna-primary: ${KlarnaTheme.colors.primary}`);
  cssVars.push(`--klarna-primary-hover: ${KlarnaTheme.colors.primaryHover}`);
  cssVars.push(`--klarna-primary-light: ${KlarnaTheme.colors.primaryLight}`);
  cssVars.push(`--klarna-black: ${KlarnaTheme.colors.black}`);
  cssVars.push(`--klarna-white: ${KlarnaTheme.colors.white}`);
  cssVars.push(`--klarna-text: ${KlarnaTheme.colors.text}`);
  cssVars.push(`--klarna-text-light: ${KlarnaTheme.colors.textLight}`);
  cssVars.push(`--klarna-border: ${KlarnaTheme.colors.border}`);
  cssVars.push(`--klarna-error: ${KlarnaTheme.colors.error}`);
  cssVars.push(`--klarna-success: ${KlarnaTheme.colors.success}`);
  cssVars.push(`--klarna-warning: ${KlarnaTheme.colors.warning}`);
  
  // Gray Scale
  Object.entries(KlarnaTheme.colors.gray).forEach(([key, value]) => {
    cssVars.push(`--klarna-gray-${key}: ${value}`);
  });
  
  // Typography
  cssVars.push(`--klarna-font-family: ${KlarnaTheme.typography.fontFamily}`);
  Object.entries(KlarnaTheme.typography.fontSize).forEach(([key, value]) => {
    cssVars.push(`--klarna-font-size-${key}: ${value}`);
  });
  
  // Spacing
  Object.entries(KlarnaTheme.spacing).forEach(([key, value]) => {
    cssVars.push(`--klarna-space-${key}: ${value}`);
  });
  
  // Border Radius
  Object.entries(KlarnaTheme.borderRadius).forEach(([key, value]) => {
    cssVars.push(`--klarna-radius-${key === 'base' ? '' : key}: ${value}`);
  });
  
  // Shadows
  Object.entries(KlarnaTheme.shadows).forEach(([key, value]) => {
    cssVars.push(`--klarna-shadow-${key === 'base' ? '' : key}: ${value}`);
  });
  
  return cssVars.join(';\n  ');
};

// Utility Functions
export const getColor = (colorPath: string): string => {
  const paths = colorPath.split('.');
  let current: any = KlarnaTheme.colors;
  
  for (const path of paths) {
    current = current[path];
    if (current === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return KlarnaTheme.colors.black;
    }
  }
  
  return current;
};

export const getSpacing = (size: keyof typeof KlarnaTheme.spacing): string => {
  return KlarnaTheme.spacing[size] || KlarnaTheme.spacing.md;
};

export const getFontSize = (size: keyof typeof KlarnaTheme.typography.fontSize): string => {
  return KlarnaTheme.typography.fontSize[size] || KlarnaTheme.typography.fontSize.base;
};

export const getBorderRadius = (size: keyof typeof KlarnaTheme.borderRadius): string => {
  return KlarnaTheme.borderRadius[size] || KlarnaTheme.borderRadius.base;
};

export const getShadow = (size: keyof typeof KlarnaTheme.shadows): string => {
  return KlarnaTheme.shadows[size] || KlarnaTheme.shadows.base;
};

// Component Style Generators
export const buttonStyles = {
  primary: {
    backgroundColor: KlarnaTheme.colors.primary,
    color: KlarnaTheme.colors.black,
    border: 'none',
    borderRadius: KlarnaTheme.borderRadius.base,
    padding: `${KlarnaTheme.spacing.md} ${KlarnaTheme.spacing.xl}`,
    fontSize: KlarnaTheme.typography.fontSize.base,
    fontWeight: KlarnaTheme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: KlarnaTheme.transitions.base,
    ':hover': {
      backgroundColor: KlarnaTheme.colors.primaryHover,
      transform: 'translateY(-1px)',
      boxShadow: KlarnaTheme.shadows.base
    }
  },
  
  secondary: {
    backgroundColor: KlarnaTheme.colors.white,
    color: KlarnaTheme.colors.text,
    border: `1px solid ${KlarnaTheme.colors.border}`,
    borderRadius: KlarnaTheme.borderRadius.base,
    padding: `${KlarnaTheme.spacing.md} ${KlarnaTheme.spacing.xl}`,
    fontSize: KlarnaTheme.typography.fontSize.base,
    fontWeight: KlarnaTheme.typography.fontWeight.semibold,
    cursor: 'pointer',
    transition: KlarnaTheme.transitions.base,
    ':hover': {
      backgroundColor: KlarnaTheme.colors.gray[50],
      borderColor: KlarnaTheme.colors.gray[300]
    }
  }
};

export const inputStyles = {
  base: {
    width: '100%',
    padding: KlarnaTheme.spacing.md,
    border: `1px solid ${KlarnaTheme.colors.border}`,
    borderRadius: KlarnaTheme.borderRadius.base,
    fontSize: KlarnaTheme.typography.fontSize.base,
    fontFamily: KlarnaTheme.typography.fontFamily,
    backgroundColor: KlarnaTheme.colors.white,
    transition: KlarnaTheme.transitions.base,
    ':focus': {
      outline: 'none',
      borderColor: KlarnaTheme.colors.primary,
      boxShadow: `0 0 0 3px rgba(255, 179, 199, 0.1)`
    }
  },
  
  error: {
    borderColor: KlarnaTheme.colors.error,
    ':focus': {
      boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.1)`
    }
  }
};

export default KlarnaTheme;
