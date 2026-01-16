/**
 * Material-UI Theme Configuration
 * 
 * Creates a Material-UI theme that syncs with our THEME_CONFIG
 */

import { createTheme } from '@mui/material/styles';
import { THEME_CONFIG } from './theme.config';

export const createAppTheme = () => {
  const primaryColor = THEME_CONFIG.colors.primary;
  
  return createTheme({
    palette: {
      primary: {
        main: primaryColor,
        dark: THEME_CONFIG.colors.primaryDark,
        light: THEME_CONFIG.colors.secondary,
      },
      secondary: {
        main: THEME_CONFIG.colors.secondary,
      },
      background: {
        default: THEME_CONFIG.colors.background,
        paper: '#ffffff',
      },
      text: {
        primary: THEME_CONFIG.colors.text.primary,
        secondary: THEME_CONFIG.colors.text.secondary,
      },
      error: {
        main: THEME_CONFIG.colors.error,
      },
      warning: {
        main: THEME_CONFIG.colors.warning,
      },
      success: {
        main: THEME_CONFIG.colors.success,
      },
    },
    typography: {
      fontFamily: THEME_CONFIG.fonts.family,
    },
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            color: '#999 !important',
            textTransform: 'none',
            '&.Mui-selected': {
              color: `${primaryColor} !important`,
              fontWeight: '600 !important',
            },
            '&.MuiTab-textColorPrimary': {
              color: '#999 !important',
              '&.Mui-selected': {
                color: `${primaryColor} !important`,
              },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            '& .MuiTabs-indicator': {
              backgroundColor: `${primaryColor} !important`,
              height: '3px !important',
            },
            '& .MuiTab-root': {
              color: '#999 !important',
              '&.Mui-selected': {
                color: `${primaryColor} !important`,
              },
            },
          },
          indicator: {
            backgroundColor: `${primaryColor} !important`,
            height: '3px !important',
          },
          flexContainer: {
            '& .MuiTab-root': {
              color: '#999 !important',
              '&.Mui-selected': {
                color: `${primaryColor} !important`,
              },
            },
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&.MuiTab-root.Mui-selected': {
              color: `${primaryColor} !important`,
            },
          },
        },
      },
    },
  });
};

export default createAppTheme;
