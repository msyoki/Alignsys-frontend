import React, { useEffect, useState } from 'react';
import SignalWifi1BarIcon from '@mui/icons-material/SignalWifi1Bar';
import SignalWifi2BarIcon from '@mui/icons-material/SignalWifi2Bar';
import SignalWifi3BarIcon from '@mui/icons-material/SignalWifi3Bar';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff';
import { Tooltip } from '@mui/material';

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
  // Fallback values
  return {
    downlink: 10,
    effectiveType: '4g',
    rtt: 50,
    online: navigator.onLine,
  };
}

const NetworkIcon = () => {
  const [networkStatus, setNetworkStatus] = useState(getNetworkStatus());

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(getNetworkStatus());
    };

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

  const getSignalIcon = () => {
    const { downlink, online, effectiveType } = networkStatus;

    let tooltipText = '';
    let Icon = null;
    let color = '';

    if (!online) {
      tooltipText = 'No connection';
      Icon = SignalWifiOffIcon;
      // color = 'red';
    } else if (downlink >= 10) {
      tooltipText = `Strong connection (${downlink} Mbps, ${effectiveType})`;
      Icon = SignalWifi4BarIcon;
      // color = 'green';
    } else if (downlink >= 5) {
      tooltipText = `Moderate connection (${downlink} Mbps, ${effectiveType})`;
      Icon = SignalWifi3BarIcon;
      // color = 'orange';
    } else if (downlink >= 1) {
      tooltipText = `Weak connection (${downlink} Mbps, ${effectiveType})`;
      Icon = SignalWifi2BarIcon;
      // color = 'yellow';
    } else {
      tooltipText = `Very weak connection (${downlink} Mbps, ${effectiveType})`;
      Icon = SignalWifi1BarIcon;
      // color = 'red';
    }

    return (
      <Tooltip title={tooltipText}>
        <Icon style={{ color, fontSize: '25px' }} />
      </Tooltip>
    );
  };

  return <div className="network-status">{getSignalIcon()}</div>;
};

export default NetworkIcon;
