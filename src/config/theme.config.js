/**
 * Theme Configuration
 * 
 * This file centralizes all theme settings and branding.
 * Modify these values to change colors, logos, and branding throughout the app.
 */

// Import logo images
import logoBluPNG from '../images/ZFBLU.png';
import zamara from '../images/zamaraLogo.png'
import waica from '../images/waica.png'
import java from '../images/java2.png'
import logoWhitePNG from '../images/ZFWHITE.png';
import logoMiniPNG from '../images/m.png';
import logoWebp from '../images/ZFBLU.webp';

export const THEME_CONFIG = {
    // Primary brand colors
    colors: {
        //Alignsys colors
        primary: '#2757aa',           // Primary brand color
        primaryDark: '#1a3a7a',       // Darker shade of primary
        surfaceLight: '#ecf4fc',      // Light surface/accent background color

        //zamara colors
        // primary: '#282b4c',        // Strong brand red
        // primaryDark: '#171936',    // Deep dark red
        // surfaceLight: '#ececf5',    // Light surface/accent background color


        //Java colors
        // primary: '#cf152d',        // Strong brand red
        // primaryDark: '#39060C',    // Deep dark red
        // surfaceLight: '#FCF0F2',    // Light surface/accent background color

        secondary: '#ffffff',         // Secondary color
        background: '#f5f5f5',        // Background color
        
        
        text: {
            primary: '#333333',         // Primary text color
            secondary: '#666666',       // Secondary text color
            light: '#ffffff',           // Light text color
        },
        accent: '#2757aa',            // Accent color
        border: '#e0e0e0',            // Border color
        error: '#d32f2f',             // Error color
        success: '#388e3c',           // Success color
        warning: '#f57c00',           // Warning color
    },

    // Logo configuration
    logos: {
        brandLogo:  logoBluPNG, //java, //zamara, //logoBluPNG,
        SystemLogo: logoWhitePNG

    },

    // Logo defaults for different pages
    logoDefaults: {
        loginPage: logoWhitePNG,      // Logo for login page
        dashboardPage: logoBluPNG,    // Logo for dashboard
        registerPage: logoWhitePNG,   // Logo for register page
        passwordResetPage: logoWebp,  // Logo for password reset
    },

    // Font settings
    fonts: {
        family: "'Segoe UI', sans-serif",
        sizes: {
            xs: '12px',
            sm: '13px',
            base: '14px',
            lg: '16px',
            xl: '18px',
            '2xl': '20px',
        },
    },

    // Logo sizes for different contexts
    logoSizes: {
        navbar: '40px',
        hero: '200px',
        small: '100px',
        large: '300px',
    },

    // App name/branding
    appName: 'EDMS',
    companyName: 'Alignsys',

    // Component-specific theme settings
    components: {
        button: {
            primary: '#2757aa',
            hover: '#1a3a7a',
            text: '#ffffff',
        },
        card: {
            background: '#ffffff',
            shadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '#e0e0e0',
        },
        navbar: {
            background: '#ffffff',
            text: '#333333',
            hover: '#f0f0f0',
        },
    },
};

// Material-UI theme override (if you're using Material-UI)
export const MUI_THEME_OVERRIDES = {
    palette: {
        primary: {
            main: THEME_CONFIG.colors.primary,
            dark: THEME_CONFIG.colors.primaryDark,
        },
        secondary: {
            main: THEME_CONFIG.colors.secondary,
        },
        background: {
            default: THEME_CONFIG.colors.background,
        },
        text: {
            primary: THEME_CONFIG.colors.text.primary,
            secondary: THEME_CONFIG.colors.text.secondary,
        },
    },
    typography: {
        fontFamily: THEME_CONFIG.fonts.family,
    },
};

export default THEME_CONFIG;
