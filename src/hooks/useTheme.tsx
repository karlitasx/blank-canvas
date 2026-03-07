import { useEffect, useState } from "react";

type Theme = 'dark' | 'light' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('vidaflow_preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        return prefs.theme || 'dark';
      }
    } catch {
      // fallback
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (resolvedTheme: 'dark' | 'light') => {
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Update localStorage preferences
    try {
      const saved = localStorage.getItem('vidaflow_preferences');
      const prefs = saved ? JSON.parse(saved) : {};
      prefs.theme = newTheme;
      localStorage.setItem('vidaflow_preferences', JSON.stringify(prefs));
    } catch {
      // ignore
    }
  };

  return { theme, setTheme: updateTheme };
};
