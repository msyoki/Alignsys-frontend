import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import logo from "../../images/ZFBLU.webp";

const LoadingDialog = ({ opendialogloading }) => {
  const [fullWidth] = useState(true);
  const [maxWidth] = useState('sm');

  return (
    <div>
      <Dialog
        open={opendialogloading}
      
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <div className="text-center m-4 p-4 ">
          <img className="my-3" src={logo} alt="logo" width="200px" />
          <Box className="my-2" sx={{ width: '100%', margin: 'auto' }}>
            <CircularProgress size="40px" style={{ color: "#2757aa" }} />
          </Box>
          <p className="mt-2" style={{ fontSize: '13px' }}>
            Please wait, processing...
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default LoadingDialog;
