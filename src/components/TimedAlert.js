// TimedAlert.js

import React, { useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';

const TimedAlert = ({ open, onClose, severity = "info", message = "", setSeverity, setMessage }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 5000); // Close the alert after 3 seconds
      return () => clearTimeout(timer);        // Cleanup the timeout
    }else{
        setSeverity('');
        setMessage('');
    }
  }, [open, onClose]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}  // Position top-right
      open={open}
      onClose={onClose}
      autoHideDuration={6000}                                  // Auto-hide after 3 seconds
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default TimedAlert;
