import React, { useEffect, useState } from 'react';

function getNetworkStatus() {
  if (navigator.connection) {
    const connection = navigator.connection;
    return {
      downlink: connection.downlink,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
    };
  } else {
    // Fallback method: For example, assuming good connection if API is not available
    return {
      downlink: 10,
      effectiveType: '4g',
      rtt: 50,
    };
  }
}

const NetworkIcon = () => {
  const [networkStatus, setNetworkStatus] = useState(getNetworkStatus());

  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(getNetworkStatus());
    };

    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
      return () => {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      };
    } else {
      const intervalId = setInterval(updateNetworkStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, []);

  const getSignalIcon = () => {
    const { downlink } = networkStatus;

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
