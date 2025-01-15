import React from "react";
import loading from "../../images/loading.svg";
import logo from "../../images/ZF.png";
import '../../styles/Loader.css'
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

const Loading = () => (
  <div className='loading d-flex justify-content-center main-loader' style={{ margin: '15%' }} >

    <img src={logo} alt="logo" width='200px' />
    <br />

    <Box sx={{ width: '45%' }}>
      <LinearProgress />

    </Box>
    <p className="mt-2" style={{ fontSize: '12.5px' }}>Please wait, loading resources ...</p>

  </div>

);

export default Loading;