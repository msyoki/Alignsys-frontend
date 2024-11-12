import React, { useEffect, useState } from 'react';
import { SignalWifi1BarIcon } from '@mui/icons-material/SignalWifi1Bar';

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
    const { downlink, online } = networkStatus;

    if (!online) {
      return (
        <span style={{ fontSize: '9px' }}>
          {Array(4).fill(<i className="fas fa-circle" style={{ color: 'red' }} />)}
          <i className="fas fa-signal-alt-1" />
        </span>
      );
    }

    let circles = 0;
    if (downlink >= 10) {
      circles = 4;
    } else if (downlink >= 5) {
      circles = 3;
    } else if (downlink >= 1) {
      circles = 2;
    } else {
      circles = 0;
    }

    return (
      <span style={{ fontSize: '9px' }}>
        {Array(4).fill(0).map((_, index) => (
          <i
            key={index}
            className="fas fa-circle"
            style={{ color: index < circles ? 'green' : 'white' }}
          />
        ))}
        <i className="fas fa-signal-alt-1" />
      </span>
    );
  };

  return <div className="network-status">{getSignalIcon()}</div>;
};

export default NetworkIcon;
