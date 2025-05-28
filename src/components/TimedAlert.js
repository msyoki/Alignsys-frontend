// TimedAlert.js

import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const TimedAlert = (props) => {

  
  useEffect(() => {
    if (props.open) {
      const timer = setTimeout(props.onClose, 6000); // Close the alert after 3 seconds
      return () => clearTimeout(timer);        // Cleanup the timeout
    }else{
      props.setSeverity('');
      props.setMessage('');
    }
  }, [props.open, props.onClose]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}  // Position top-right
      open={props.open}
      onClose={props.onClose}
      autoHideDuration={6000}                                  // Auto-hide after 3 seconds
    >
      <Alert onClose={props.onClose} severity={props.severity} variant="filled">
        <span style={{fontSize:'12.5px'}}>{props.message}</span>
      </Alert>
    </Snackbar>
  );
};

export default TimedAlert;
