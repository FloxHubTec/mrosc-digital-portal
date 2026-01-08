import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  organizationName: string;
  organizationSubtitle: string;
  logoUrl: string;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeSettings = {
  primaryColor: '#115e59', // teal-800 equivalent
  secondaryColor: '#0d9488', // teal-600
  organizationName: 'Prefeitura Municipal de Unaí',
  organizationSubtitle: 'Estado de Minas Gerais',
  logoUrl: '',
};

const STORAGE_KEY = 'mrosc-theme-settings';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to convert hex to HSL
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

// Apply theme to CSS variables
const applyThemeToCSS = (theme: ThemeSettings) => {
  const root = document.documentElement;
  
  // Convert primary color to HSL
  const primaryHSL = hexToHSL(theme.primaryColor);
  const secondaryHSL = hexToHSL(theme.secondaryColor);
  
  // Set primary color variations
  root.style.setProperty('--primary', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
  root.style.setProperty('--ring', `${primaryHSL.h} ${primaryHSL.s}% ${primaryHSL.l}%`);
  
  // Sidebar colors based on primary
  root.style.setProperty('--sidebar-background', `${primaryHSL.h} 32% 18%`);
  root.style.setProperty('--sidebar-primary', `${secondaryHSL.h} 60% 48%`);
  root.style.setProperty('--sidebar-accent', `${primaryHSL.h} 28% 24%`);
  root.style.setProperty('--sidebar-border', `${primaryHSL.h} 22% 26%`);
  root.style.setProperty('--sidebar-ring', `${secondaryHSL.h} 60% 48%`);
  
  // Secondary and accent variations
  root.style.setProperty('--secondary', `${primaryHSL.h} 41% 92%`);
  root.style.setProperty('--secondary-foreground', `${primaryHSL.h} 58% 22%`);
  root.style.setProperty('--accent', `${primaryHSL.h} 55% 95%`);
  root.style.setProperty('--accent-foreground', `${primaryHSL.h} 58% 22%`);
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeSettings>(() => {
    // Load from localStorage on initial render
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultTheme, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Error loading theme from localStorage:', e);
    }
    return defaultTheme;
  });

  // Apply theme to CSS on mount and when theme changes
  useEffect(() => {
    applyThemeToCSS(theme);
  }, [theme]);

  // Save to localStorage when theme changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch (e) {
      console.error('Error saving theme to localStorage:', e);
    }
  }, [theme]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { defaultTheme };
