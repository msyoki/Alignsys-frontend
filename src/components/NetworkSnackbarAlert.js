import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar, Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';

// Test actual connectivity with a lightweight request
async function testConnectivity() {
  try {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout

    const response = await fetch('https://httpbin.org/status/204', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    });


    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error('Network request failed');
    }

    return {
      isOnline: true,
      responseTime,
      isSlowConnection: responseTime > 8000 // Increased threshold
    };
  } catch (error) {
    // Try one more endpoint before declaring offline
    try {
      const response2 = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      return {
        isOnline: response2.ok,
        responseTime: 5000,
        isSlowConnection: false
      };
    } catch (error2) {
      return {
        isOnline: false,
        responseTime: Infinity,
        isSlowConnection: true
      };
    }
  }
}

// Get network information from Network Information API
function getNetworkInfo() {
  const connection = navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (connection) {
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 0
    };
  }

  return {
    effectiveType: '4g',
    downlink: 10,
    rtt: 0
  };
}

async function measureDownloadSpeed() {
  // First check if navigator says we're offline
  if (!navigator.onLine) {
    return 0;
  }

  // Test actual connectivity
  const connectivityTest = await testConnectivity();
  const networkInfo = getNetworkInfo();

  // If connectivity test fails, we're truly offline
  if (!connectivityTest.isOnline) {
    return 0;
  }

  // Check multiple criteria for extremely slow connection
  const slowCriteria = [
    networkInfo.effectiveType === 'slow-2g',
    networkInfo.downlink < 0.3, // More conservative threshold
    networkInfo.rtt > 3000, // Increased threshold
    connectivityTest.responseTime > 8000 // Increased threshold
  ];

  // If any slow criteria is met, return appropriate speed
  if (slowCriteria.some(criteria => criteria)) {
    return Math.max(networkInfo.downlink, 0.2); // Ensure minimum value
  }

  // For better connections, return network API downlink or do speed test
  if (networkInfo.downlink && networkInfo.downlink > 0) {
    return networkInfo.downlink;
  }

  // Fallback to original speed test if Network API not available
  const testFileUrl = 'https://via.placeholder.com/1000x1000.png';
  const startTime = Date.now();
  try {
    const response = await fetch(testFileUrl, { cache: 'no-store' });
    const blob = await response.blob();
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const fileSizeInBits = blob.size * 8;
    const speedMbps = (fileSizeInBits / durationInSeconds) / (1024 * 1024);
    return Math.max(speedMbps, 0.1); // Ensure minimum value
  } catch (error) {
    return 0;
  }
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

  const updateNetworkStatus = useCallback(async () => {
    const online = navigator.onLine;
    let downlink = 10; // Default to good connection

    // Only test speed if navigator says we're online
    if (online) {
      try {
        downlink = await measureDownloadSpeed();
      } catch (error) {
        console.warn('Network speed test failed:', error);
        downlink = 1; // Assume moderate connection on error
      }
    } else {
      downlink = 0;
    }

    // More conservative offline detection
    if (!online && downlink === 0) {
      setSnackbar({
        open: true,
        message: 'You are offline. Please check your connection.',
        networkStatus: { online: false, downlink: 0 }
      });
    } else if (online && downlink > 0 && downlink < 0.3) {
      // Only show very low bandwidth warning for extremely slow connections
      console.log('Network status check:', { online, downlink });
      setSnackbar({
        open: true,
        message: 'Your network bandwidth is very low.',
        networkStatus: { online, downlink }
      });
    } else if (online && downlink > 0 && downlink < 1) {
      setSnackbar({
        open: true,
        message: 'Your network connection is weak.',
        networkStatus: { online, downlink }
      });
    } else {
      // Connection is good or adequate
      setSnackbar(prev => (prev.open ? { ...prev, open: false } : prev));
    }
  }, []);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    // Initial check with delay
    setTimeout(updateNetworkStatus, 1000);

    // Check every 45 seconds
    intervalId = setInterval(updateNetworkStatus, 45000);

    // Handle online/offline events with stabilization delay
    const handleOnline = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateNetworkStatus, 2000); // Longer delay for online events
    };

    const handleOffline = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateNetworkStatus, 500);
    };

    // Handle connection changes from Network Information API
    const handleConnectionChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateNetworkStatus, 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus]);

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