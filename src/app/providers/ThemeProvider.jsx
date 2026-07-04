import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from 'react';

/**
 * Vibe/theme class mappings — extracted from App.jsx getVibeClasses().
 * Returns Tailwind class strings for all UI elements based on vibe + dark mode.
 */
function getVibeClasses(vibe, isDark) {
  const v = {
    minimal: {
      light: {
        bg: 'bg-[#E2DFD2]',
        surface: 'bg-white border border-gray-200 shadow-sm',
        text: 'text-gray-900',
        textSec: 'text-gray-500',
        input: 'bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        btn: 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold',
        btnSec: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
        accent: 'text-indigo-600 font-bold',
        accentBg: 'bg-indigo-600',
        progress: 'bg-indigo-600',
        card: 'bg-white border border-gray-200 shadow-sm',
        selectedCard: 'border-indigo-500 bg-indigo-50 shadow-indigo-100',
        chip: 'bg-indigo-100 text-indigo-700',
        tabActive: 'bg-indigo-600 text-white',
        tabInactive: 'text-gray-600 hover:bg-gray-100',
      },
      dark: {
        bg: 'bg-gray-950',
        surface: 'bg-gray-900 border border-gray-800 shadow-sm',
        text: 'text-gray-100',
        textSec: 'text-gray-400',
        input: 'bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        btn: 'bg-indigo-500 hover:bg-indigo-600 text-white font-semibold',
        btnSec: 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700',
        accent: 'text-indigo-400',
        accentBg: 'bg-indigo-500',
        progress: 'bg-indigo-500',
        card: 'bg-gray-900 border border-gray-800',
        selectedCard: 'border-indigo-400 bg-indigo-950/50',
        chip: 'bg-indigo-900/50 text-indigo-300',
        tabActive: 'bg-indigo-500 text-white',
        tabInactive: 'text-gray-400 hover:bg-gray-800',
      },
    },
    bold: {
      light: {
        bg:'bg-slate-50', surface:'bg-white border border-purple-200 shadow-sm shadow-purple-100/50', text:'text-slate-900',
        textSec:'text-slate-500', input:'bg-white border border-purple-200 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
        btn:'bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white shadow-lg shadow-purple-200',
        btnSec:'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
        accent:'text-purple-600', accentBg:'bg-gradient-to-r from-purple-600 to-cyan-500', progress:'bg-gradient-to-r from-purple-600 to-cyan-500',
        card:'bg-white border border-purple-100 shadow-sm shadow-purple-50', selectedCard:'border-purple-500 bg-purple-50 shadow-purple-200/50',
        chip:'bg-purple-100 text-purple-700', tabActive:'bg-gradient-to-r from-purple-600 to-cyan-500 text-white', tabInactive:'text-slate-600 hover:bg-purple-50',
      },
      dark: {
        bg:'bg-slate-950', surface:'bg-slate-900 border border-purple-800/40', text:'text-slate-100',
        textSec:'text-slate-400', input:'bg-slate-800 border border-purple-700/40 text-slate-100 focus:ring-2 focus:ring-purple-400 focus:border-purple-400',
        btn:'bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white shadow-lg shadow-purple-900/50',
        btnSec:'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-purple-800/40',
        accent:'text-purple-400', accentBg:'bg-gradient-to-r from-purple-500 to-cyan-400', progress:'bg-gradient-to-r from-purple-500 to-cyan-400',
        card:'bg-slate-900 border border-purple-900/40', selectedCard:'border-purple-400 bg-purple-950/30',
        chip:'bg-purple-900/40 text-purple-300', tabActive:'bg-gradient-to-r from-purple-500 to-cyan-400 text-white', tabInactive:'text-slate-400 hover:bg-slate-800',
      },
    },
    github: {
      light: {
        bg:'bg-white', surface:'bg-[#f6f8fa] border border-[#d0d7de]', text:'text-[#1f2328]',
        textSec:'text-[#656d76]', input:'bg-white border border-[#d0d7de] text-[#1f2328] focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da]',
        btn:'bg-[#2ea44f] hover:bg-[#2c974b] text-white border border-[#1b7f37]',
        btnSec:'bg-[#f6f8fa] hover:bg-[#e7ecf0] text-[#24292f] border border-[#d0d7de]',
        accent:'text-[#0969da]', accentBg:'bg-[#2ea44f]', progress:'bg-[#2ea44f]',
        card:'bg-white border border-[#d0d7de]', selectedCard:'border-[#2ea44f] bg-[#dafbe1]',
        chip:'bg-[#ddf4ff] text-[#0969da]', tabActive:'bg-[#2ea44f] text-white', tabInactive:'text-[#656d76] hover:bg-[#f6f8fa]',
      },
      dark: {
        bg:'bg-[#0d1117]', surface:'bg-[#161b22] border border-[#30363d]', text:'text-[#e6edf3]',
        textSec:'text-[#8b949e]', input:'bg-[#0d1117] border border-[#30363d] text-[#e6edf3] focus:ring-2 focus:ring-[#58a6ff] focus:border-[#58a6ff]',
        btn:'bg-[#238636] hover:bg-[#2ea44f] text-white border border-[#2ea44f]',
        btnSec:'bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d]',
        accent:'text-[#58a6ff]', accentBg:'bg-[#238636]', progress:'bg-[#238636]',
        card:'bg-[#161b22] border border-[#30363d]', selectedCard:'border-[#238636] bg-[#122117]',
        chip:'bg-[#1f2d3d] text-[#58a6ff]', tabActive:'bg-[#238636] text-white', tabInactive:'text-[#8b949e] hover:bg-[#21262d]',
      },
    },
  };
  return v[vibe]?.[isDark ? 'dark' : 'light'] || v.minimal.light;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [vibe, setVibe] = useState(() => {
    return localStorage.getItem('vibe') || 'github';
  });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'lg';
  });

  const [builderStyle, setBuilderStyle] = useState(() => {
    return localStorage.getItem('builderStyle') || 'classic'; // 'classic' or 'conversation'
  });

  // Calculate if dark mode is active
  const isDark = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  // Synchronize the 'dark' class on <html> tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Listen to system preference changes when 'system' is selected
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Sync to localStorage
  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  const updateVibe = useCallback((newVibe) => {
    setVibe(newVibe);
    localStorage.setItem('vibe', newVibe);
  }, []);

  const updateFontSize = useCallback((newSize) => {
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
  }, []);

  const updateBuilderStyle = useCallback((newStyle) => {
    setBuilderStyle(newStyle);
    localStorage.setItem('builderStyle', newStyle);
  }, []);

  const toggleTheme = useCallback(() => {
    updateTheme(isDark ? 'light' : 'dark');
  }, [isDark, updateTheme]);

  const vc = useMemo(() => getVibeClasses(vibe, isDark), [vibe, isDark]);
  const fontClass = fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base';

  const value = useMemo(
    () => ({
      vibe,
      setVibe: updateVibe,
      theme,
      setTheme: updateTheme,
      toggleTheme,
      isDark,
      vc,
      fontSize,
      setFontSize: updateFontSize,
      fontClass,
      builderStyle,
      setBuilderStyle: updateBuilderStyle,
    }),
    [vibe, updateVibe, theme, updateTheme, toggleTheme, isDark, vc, fontSize, updateFontSize, fontClass, builderStyle, updateBuilderStyle]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeProvider;
