import React, { useEffect, useState } from 'react';

function getNetworkStatus() {
  if (navigator.connection) {
    const connection = navigator.connection;
    return {
      downlink: connection.downlink,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      online: navigator.onLine,
    };
  } else {
    // Fallback method: Assuming a good connection if API is not available
    return {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
      online: navigator.onLine,
    };
  }
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
      return <i className="fas fa-signal" style={{ color: 'red', opacity: 1 }}></i>;
    }

    if (downlink >= 10) {
      return <i className="fas fa-signal" style={{ color: 'green', opacity: 1 }}></i>;
    }
    if (downlink >= 5) {
      return <i className="fas fa-signal" style={{ color: 'green', opacity: 0.75 }}></i>;
    }
    if (downlink >= 1) {
      return <i className="fas fa-signal" style={{ color: 'green', opacity: 0.5 }}></i>;
    }
    return <i className="fas fa-signal" style={{ color: 'red', opacity: 1 }}></i>;
  };

  return (
    <div className="network-status">
      {getSignalIcon()}
    </div>
  );
};

export default NetworkIcon;
