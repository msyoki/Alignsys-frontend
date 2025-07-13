import React, { useEffect, useState } from 'react';
import { Snackbar, Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';

function getNetworkStatus() {
  if (navigator.connection) {
    const { downlink, effectiveType, rtt } = navigator.connection;
    return {
      downlink,
      effectiveType,
      rtt,
      online: navigator.onLine,
    };
  }
  return {
    downlink: 10,
    effectiveType: '4g',
    rtt: 50,
    online: navigator.onLine,
  };
}

const getNetworkIcon = (online, downlink) => {
  const iconProps = {
    sx: { 
      color: '#fff',
      fontSize: '18px',
      mr: 1
    }
  };

  if (!online) {
    return <SignalWifiOffIcon {...iconProps} />;
  } else if (downlink < 1) {
    return <SignalWifi1BarIcon {...iconProps} />;
  } else if (downlink < 2) {
    return <SignalWifi2BarIcon {...iconProps} />;
  } else {
    return <SignalWifi4BarIcon {...iconProps} />;
  }
};

const NetworkSnackbarAlert = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    networkStatus: { online: true, downlink: 10 }
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const { downlink, online } = getNetworkStatus();

      if (!online) {
        setSnackbar({
          open: true,
          message: 'You are offline. Please check your connection.',
          networkStatus: { online, downlink }
        });
      } else if (downlink < 1) {
        setSnackbar({
          open: true,
          message: 'Your network bandwidth is very low.',
          networkStatus: { online, downlink }
        });
      } else if (downlink < 2) {
        setSnackbar({
          open: true,
          message: 'Your network connection is weak.',
          networkStatus: { online, downlink }
        });
      } else {
        // Only close the Snackbar if it was open
        setSnackbar((prev) => (prev.open ? { ...prev, open: false } : prev));
      }
    };

    // Initial check
    updateNetworkStatus();

    // Network change listeners
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    } else {
      const intervalId = setInterval(updateNetworkStatus, 5000);
      return () => clearInterval(intervalId);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      open={snackbar.open}
      message={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {getNetworkIcon(snackbar.networkStatus.online, snackbar.networkStatus.downlink)}
          {snackbar.message}
        </Box>
      }
      onClose={() => setSnackbar({ ...snackbar, open: false })}
      key="zoom-style-network-snackbar"
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ ml: 1 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
      sx={{
        zIndex: 1400,
        '& .MuiSnackbarContent-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: '#fff',
          fontWeight: 500,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        },
      }}
    />
  );
};

export default NetworkSnackbarAlert;