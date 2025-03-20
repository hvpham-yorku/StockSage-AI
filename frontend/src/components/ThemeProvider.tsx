'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme?: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with server-side default
  const [isDark, setIsDark] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', !isDark);
    }
  };
  
  // Handle client-side initialization safely
  useEffect(() => {
    // Mark as mounted to avoid hydration mismatch
    setIsMounted(true);
    
    // Check for dark mode preference
    const prefersDark = 
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set theme based on preference or default to dark
    setIsDark(true);
    document.documentElement.classList.add('dark');
    
    // Add attribute to handle hydration mismatch
    document.documentElement.setAttribute('suppressHydrationWarning', 'true');
    
    // Remove any browser extension attributes that cause hydration errors
    document.documentElement.removeAttribute('data-darkreader-proxy-injected');
    document.documentElement.removeAttribute('data-darkreader-scheme');
    document.documentElement.removeAttribute('data-darkreader-mode');
  }, []);
  
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 