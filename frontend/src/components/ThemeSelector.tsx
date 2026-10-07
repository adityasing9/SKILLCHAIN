import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Sparkles, Moon, Sun } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes, isDark, toggleDarkMode, setDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = availableThemes.find((t) => t.id === currentTheme) || availableThemes[0];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Quick 1-Click Dark / Light Mode Switch */}
      <button
        type="button"
        onClick={toggleDarkMode}
        className="flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-xs cursor-pointer"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-fadeIn" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600 animate-fadeIn" />
        )}
      </button>

      {/* Palette Selector Dropdown */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs cursor-pointer"
          aria-label="Change color palette"
          title="Change color palette & theme"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs ring-2 ring-white"
            style={{ backgroundColor: activeThemeObj.primaryHex }}
          />
          <span className="hidden sm:inline">{activeThemeObj.name}</span>
          <Palette className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-fadeIn">
            
            {/* Header with Appearance Mode Segmented Controller */}
            <div className="px-3.5 pt-2 pb-3 border-b border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Appearance
                </span>
                <span className="text-[10px] font-mono text-theme-primary font-semibold bg-theme-light px-1.5 py-0.5 rounded">
                  {isDark ? 'Dark Theme' : 'Light Theme'}
                </span>
              </div>

              {/* Light / Dark Mode Toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDarkMode(false)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !isDark
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode(true)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Dark
                </button>
              </div>
            </div>

            {/* Color Palette List */}
            <div className="px-3.5 pt-2.5 pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Color Palettes
              </span>
            </div>

            <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
              {availableThemes.map((theme) => {
                const isSelected = theme.id === currentTheme;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-xs"
                        style={{ backgroundColor: theme.primaryHex }}
                      />
                      <div>
                        <div className="font-semibold leading-tight">{theme.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal line-clamp-1">
                          {theme.tagline}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check
                        className="w-4 h-4 shrink-0 text-theme-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-2 border-t border-slate-100 text-[10px] text-slate-400 bg-slate-50/50 rounded-b-xl flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              Preferences saved to browser storage.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
