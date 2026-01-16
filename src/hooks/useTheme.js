/**
 * Custom Hooks for Theme and Logo
 * 
 * These hooks simplify accessing theme and logo data throughout the app
 */

import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import THEME_CONFIG from '../config/theme.config';

/**
 * Hook to get current theme
 * Usage: const { colors, logos } = useTheme();
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: THEME_CONFIG, isDarkMode: false };
  }
  return context;
};

/**
 * Hook to get logo by context
 * Usage: const logoPath = useLogo('loginPage');
 */
export const useLogo = (pageContext = 'dashboardPage') => {
  return THEME_CONFIG.logoDefaults[pageContext] || THEME_CONFIG.logos.bluPNG;
};

/**
 * Hook to get theme colors
 * Usage: const { primary, secondary } = useThemeColors();
 */
export const useThemeColors = () => {
  const context = useContext(ThemeContext);
  const config = context?.theme || THEME_CONFIG;
  return config.colors;
};

/**
 * Hook to get all logos
 * Usage: const logos = useLogos();
 */
export const useLogos = () => {
  const context = useContext(ThemeContext);
  const config = context?.theme || THEME_CONFIG;
  return config.logos;
};

/**
 * Hook to get component-specific theme
 * Usage: const buttonTheme = useComponentTheme('button');
 */
export const useComponentTheme = (component) => {
  const context = useContext(ThemeContext);
  const config = context?.theme || THEME_CONFIG;
  return config.components[component] || {};
};

export default useTheme;
