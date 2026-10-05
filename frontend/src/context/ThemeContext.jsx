import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const ThemeContext = createContext(null);

// Helper: is a hex color dark or light?
function isDark(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  // Perceived luminance formula
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

// Lighten a hex color by a percentage
function lighten(hex, pct) {
  const c = hex.replace('#', '');
  const r = Math.min(255, parseInt(c.substr(0, 2), 16) + Math.round(255 * pct));
  const g = Math.min(255, parseInt(c.substr(2, 2), 16) + Math.round(255 * pct));
  const b = Math.min(255, parseInt(c.substr(4, 2), 16) + Math.round(255 * pct));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Darken a hex color by a percentage
function darken(hex, pct) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.substr(0, 2), 16) - Math.round(255 * pct));
  const g = Math.max(0, parseInt(c.substr(2, 2), 16) - Math.round(255 * pct));
  const b = Math.max(0, parseInt(c.substr(4, 2), 16) - Math.round(255 * pct));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  const loadTheme = async () => {
    try {
      const { data } = await api.get('/themes/active');
      setTheme(data);
      applyTheme(data);
    } catch {
      setTheme(null);
      applyTheme(null);
    }
  };

  const applyTheme = (t) => {
    const root = document.documentElement;

    if (!t) {
      // ── RESET TO DEFAULT ──
      root.style.setProperty('--gold',        '#D4A853');
      root.style.setProperty('--gold-light',  '#F2D490');
      root.style.setProperty('--gold-dark',   '#A07830');
      root.style.setProperty('--brown',       '#3D2B1F');
      root.style.setProperty('--cream',       '#FBF7F0');
      root.style.setProperty('--cream-dark',  '#F0E8D8');
      root.style.setProperty('--text',        '#2C1810');
      root.style.setProperty('--text-muted',  '#7A6055');
      root.style.setProperty('--border',      '#E8D8C4');
      root.style.setProperty('--white',       '#FFFFFF');
      // Button text
      root.style.setProperty('--btn-primary-text', '#3D2B1F');
      root.style.setProperty('--btn-outline-text', '#A07830');
      document.body.setAttribute('data-theme', '');
      return;
    }

    const primary   = t.primary_color   || '#D4A853';
    const secondary = t.secondary_color || '#A07830';
    const accent    = t.accent_color    || '#F2D490';
    const bgColor   = t.bg_color        || '#FBF7F0';
    const textColor = t.text_color      || '#2C1810';

    // Derive lighter/darker shades automatically
    const primaryLight  = lighten(primary, 0.25);
    const primaryDark   = darken(primary, 0.15);
    const bgDark        = darken(bgColor, 0.05);
    const borderColor   = darken(bgColor, 0.12);

    // Decide button text color based on primary brightness
    const btnTextOnPrimary  = isDark(primary)  ? '#FFFFFF' : darken(primary, 0.45);
    const btnTextOnBg       = isDark(bgColor)  ? '#FFFFFF' : textColor;
    const mutedText         = isDark(bgColor)
      ? lighten(textColor, 0.35)
      : darken(bgColor, 0.35);

    root.style.setProperty('--gold',        primary);
    root.style.setProperty('--gold-light',  accent);
    root.style.setProperty('--gold-dark',   primaryDark);
    root.style.setProperty('--brown',       textColor);
    root.style.setProperty('--cream',       bgColor);
    root.style.setProperty('--cream-dark',  bgDark);
    root.style.setProperty('--text',        isDark(bgColor) ? '#FFFFFF' : textColor);
    root.style.setProperty('--text-muted',  mutedText);
    root.style.setProperty('--border',      borderColor);
    root.style.setProperty('--white',       isDark(bgColor) ? darken(bgColor, 0.08) : '#FFFFFF');

    // Button text colors
    root.style.setProperty('--btn-primary-text',  btnTextOnPrimary);
    root.style.setProperty('--btn-outline-text',  primaryDark);

    document.body.setAttribute('data-theme', t.slug || '');
  };

  useEffect(() => { loadTheme(); }, []);

  return (
    <ThemeContext.Provider value={{ theme, loadTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);