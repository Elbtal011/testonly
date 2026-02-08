import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark mode

  useEffect(() => {
    // Function to update theme based on system preference
    const updateThemeFromSystem = () => {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = systemPrefersDark ? 'dark' : 'light';
      setThemeState(newTheme);
      console.log(`DKB Theme: System preference detected - ${newTheme}`);
    };

    // Set initial theme based on system preference
    updateThemeFromSystem();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      updateThemeFromSystem();
    };

    // Add event listener for system theme changes
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup event listener
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    console.log(`DKB Theme: Applied theme to document - ${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

