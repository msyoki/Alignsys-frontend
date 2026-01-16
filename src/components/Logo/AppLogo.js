/**
 * Logo Component
 * 
 * Reusable logo component that automatically uses the correct logo from theme config
 * Usage: <AppLogo pageContext="loginPage" size="hero" />
 */

import React from 'react';
import THEME_CONFIG from '../../config/theme.config';

const AppLogo = ({
  pageContext = 'dashboardPage',
  size = 'small',
  alt = 'Logo',
  className = '',
  style = {},
  onClick = null,
}) => {
  const logoSrc = THEME_CONFIG.logoDefaults[pageContext] || THEME_CONFIG.logos.bluPNG;
  const logoSize = THEME_CONFIG.logoSizes[size] || size;

  const defaultStyles = {
    width: logoSize,
    height: 'auto',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={className}
      style={defaultStyles}
      onClick={onClick}
    />
  );
};

export default AppLogo;
