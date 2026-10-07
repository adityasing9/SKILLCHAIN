import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'emerald' | 'indigo' | 'sapphire' | 'teal' | 'amber' | 'slate';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryHex: string;
  lightHex: string;
  previewBg: string;
  previewDot: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'emerald',
    name: 'Emerald Trust',
    tagline: 'Credify & FinTech security standard',
    primaryHex: '#059669',
    lightHex: '#ecfdf5',
    previewBg: 'bg-emerald-50',
    previewDot: 'bg-emerald-600',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    tagline: 'Linear / Stripe modern engineering',
    primaryHex: '#4f46e5',
    lightHex: '#eef2ff',
    previewBg: 'bg-indigo-50',
    previewDot: 'bg-indigo-600',
  },
  {
    id: 'sapphire',
    name: 'Imperial Sapphire',
    tagline: 'Prestige university & Ivy League navy',
    primaryHex: '#2563eb',
    lightHex: '#eff6ff',
    previewBg: 'bg-blue-50',
    previewDot: 'bg-blue-600',
  },
  {
    id: 'teal',
    name: 'Nordic Teal',
    tagline: 'Crisp medical & technology credentialing',
    primaryHex: '#0d9488',
    lightHex: '#f0fdfa',
    previewBg: 'bg-teal-50',
    previewDot: 'bg-teal-600',
  },
  {
    id: 'amber',
    name: 'Warm Bronze',
    tagline: 'Raycast / Notion editorial warm palette',
    primaryHex: '#d97706',
    lightHex: '#fffbeb',
    previewBg: 'bg-amber-50',
    previewDot: 'bg-amber-600',
  },
  {
    id: 'slate',
    name: 'Minimalist Slate',
    tagline: 'Apple / Vercel pure typography monochrome',
    primaryHex: '#0f172a',
    lightHex: '#f1f5f9',
    previewBg: 'bg-slate-100',
    previewDot: 'bg-slate-900',
  },
];

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  availableThemes: ThemeConfig[];
  isDark: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('skillchain_theme');
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved as ThemeId;
    }
    return 'emerald';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('skillchain_color_mode');
    if (savedMode) {
      return savedMode === 'dark';
    }
    // Default to light theme for a crisp modern Credify SaaS look
    return false;
  });

  const setTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
    localStorage.setItem('skillchain_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  const setDarkMode = (dark: boolean) => {
    setIsDark(dark);
    localStorage.setItem('skillchain_color_mode', dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.setAttribute('data-mode', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-mode', 'light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDark);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (isDark) {
      document.documentElement.setAttribute('data-mode', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-mode', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme, isDark]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        availableThemes: THEMES,
        isDark,
        toggleDarkMode,
        setDarkMode,
      }}
    >
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
