import React, { useEffect, useState } from 'react';
import { SignalWifi1BarIcon } from '@mui/icons-material/SignalWifi1Bar';
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
      return (
        <>

          <span style={{ fontSize: '10px' }}>
            <i class="fas fa-circle " style={{ color: 'red' }}></i>
            <i class="fas fa-circle " style={{ color: 'red' }}></i>
            <i class="fas fa-circle " style={{ color: 'red' }}></i>
            <i class="fas fa-circle " style={{ color: 'red' }}></i>
            <i class="fas fa-signal-alt-1"></i>

          </span>
        </>
      )
    }

    if (downlink >= 10) {
      return (
        <>

          <span style={{ fontSize: '10px' }}>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
          </span>
        </>

      );
    }
    if (downlink >= 5) {
      return (

        <>

          <span style={{ fontSize: '10px' }}>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'white' }}></i>

          </span>
        </>
      );
    }
    if (downlink >= 1) {
      return (

        <>

          <span style={{ fontSize: '10px' }}>
            <i class="fas fa-circle " style={{ color: 'green' }}></i>
            <i class="fas fa-circle " style={{ color: 'white' }}></i>
            <i class="fas fa-circle " style={{ color: 'white' }}></i>
            <i class="fas fa-circle " style={{ color: 'white' }}></i>

          </span>
        </>
      );
    }
    return (

      <>
        <span style={{ fontSize: '10px' }}>
          <i class="fas fa-circle " style={{ color: 'white' }}></i>
          <i class="fas fa-circle " style={{ color: 'white' }}></i>
          <i class="fas fa-circle " style={{ color: 'white' }}></i>
          <i class="fas fa-circle " style={{ color: 'white' }}></i>
          <i class="fas fa-signal-alt-1"></i>

        </span>
      </>
    );
  };

  return (
    <div className="network-status">
      {getSignalIcon()}
    </div>
  );
};

export default NetworkIcon;
