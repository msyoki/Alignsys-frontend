/**
 * Theme Settings Panel
 * 
 * Optional admin component to allow dynamic theme changes without code modifications
 * Can be added to AdminDashboard
 */

import React, { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import THEME_CONFIG from '../../config/theme.config';
import '../../../styles/themeSettings.css';

const ThemeSettings = () => {
  const { theme, updateTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('primary');

  const handleColorChange = (colorKey, newValue) => {
    const updatedTheme = JSON.parse(JSON.stringify(theme));
    updatedTheme.colors[colorKey] = newValue;
    updateTheme(updatedTheme);
    
    // Update CSS variables
    document.documentElement.style.setProperty(`--color-${colorKey}`, newValue);
  };

  const handleResetTheme = () => {
    updateTheme(THEME_CONFIG);
    Object.entries(THEME_CONFIG.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    });
  };

  return (
    <div className="theme-settings-panel">
      <h3>Theme Settings</h3>
      
      {/* Dark Mode Toggle */}
      <div className="theme-setting-item">
        <label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          Dark Mode
        </label>
      </div>

      {/* Color Settings */}
      <div className="theme-setting-item">
        <h4>Brand Colors</h4>
        {['primary', 'primaryDark', 'secondary', 'accent'].map((colorKey) => (
          <div key={colorKey} className="color-picker-item">
            <label>{colorKey}:</label>
            <input
              type="color"
              value={theme.colors[colorKey]}
              onChange={(e) => handleColorChange(colorKey, e.target.value)}
            />
            <span className="color-value">{theme.colors[colorKey]}</span>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button 
        className="reset-theme-btn"
        onClick={handleResetTheme}
      >
        Reset to Default
      </button>

      {/* Export Configuration */}
      <div className="theme-setting-item">
        <button 
          onClick={() => {
            const dataStr = JSON.stringify(theme, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = 'theme-config.json';
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
          }}
        >
          Export Theme Configuration
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
