/**
 * Dynamic Theme Injector
 * 
 * This function reads colors from theme.config.js and dynamically
 * injects them into CSS variables so that all changes are live!
 */

import { THEME_CONFIG } from '../config/theme.config';

export const injectThemeVariables = () => {
  const root = document.documentElement;

  // Inject primary colors
  root.style.setProperty('--color-primary', THEME_CONFIG.colors.primary);
  root.style.setProperty('--color-primary-dark', THEME_CONFIG.colors.primaryDark);
  root.style.setProperty('--color-secondary', THEME_CONFIG.colors.secondary);
  root.style.setProperty('--color-background', THEME_CONFIG.colors.background);
  root.style.setProperty('--color-surface-light', THEME_CONFIG.colors.surfaceLight);
  
  // Inject text colors
  root.style.setProperty('--color-text-primary', THEME_CONFIG.colors.text.primary);
  root.style.setProperty('--color-text-secondary', THEME_CONFIG.colors.text.secondary);
  root.style.setProperty('--color-text-light', THEME_CONFIG.colors.text.light);
  
  // Inject special colors
  root.style.setProperty('--color-accent', THEME_CONFIG.colors.accent);
  root.style.setProperty('--color-border', THEME_CONFIG.colors.border);
  root.style.setProperty('--color-error', THEME_CONFIG.colors.error);
  root.style.setProperty('--color-success', THEME_CONFIG.colors.success);
  root.style.setProperty('--color-warning', THEME_CONFIG.colors.warning);
};

export default injectThemeVariables;
