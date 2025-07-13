import React from "react";
import logo from "../../images/ZFWHITE.webp";
import '../../styles/Loader.css'
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Loading = () => (
  <div 
  className="loading d-flex justify-content-center align-items-center" 
  style={{
    width: "100vw", 
    height: "100vh", 
    position: "absolute", 
    top: 0, 
    left: 0, 
    margin: 0, 
    overflow: "hidden"
  }}
>
  <Box className="my-4 text-center">
    <img src={logo} style={{ width: "300px", height: "auto" }} />
  </Box>

  <Box className="text-center">
    <CircularProgress size="40px" style={{ color: "#fff" }} />
  </Box>
</div>


);

export default Loading;