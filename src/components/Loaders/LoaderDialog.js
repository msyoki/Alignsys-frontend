import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import logo from "../../images/ZF.png";

const LoadingDialog = ({ opendialogloading }) => {
  const [fullWidth] = useState(true);
  const [maxWidth] = useState('sm');

  return (
    <div>
      <Dialog
        open={opendialogloading}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <div className="text-center p-3">
          <img className="my-3" src={logo} alt="logo" width="100px" />
          <Box className="my-3" sx={{ width: '60%', margin: 'auto' }}>
            <LinearProgress />
          </Box>
          <p className="mt-2" style={{ fontSize: '12.5px' }}>
            Please wait, processing...
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default LoadingDialog;
