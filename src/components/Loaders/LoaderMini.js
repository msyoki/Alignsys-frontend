import React from "react";
import loading from "../../images/loading.svg";
import logo from "../../images/ZFBLU.webp";
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';




const LoadingMini = (props) => (
    <div className='App'>
        <div className='text-center p-3'>
          <div className="spinner ">
         
         
            <img className="my-4" src={logo} alt="Loading" width='150px' />
         
            <Box  className='d-flex justify-content-center main-loader '>
             
              <CircularProgress size="40px" style={{ color: "#2757aa" }} />
            
            </Box>
            <p className="my-2 text-dark" style={{fontSize:'13px'}}>{props.msg?<>{props.msg}</>:<>Please wait, processing request ...</>}</p>
           
          </div>
        </div>
    </div>
  
);

export default LoadingMini;