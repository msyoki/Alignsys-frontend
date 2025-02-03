import React from "react";
import loading from "../../images/loading.svg";
import logo from "../../images/ZFBLU.webp";
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';




const LoadingMini = (props) => (
    <div className='App'>
        <div className='text-center p-3'>
          <div className="spinner ">
         
         
            <img className="my-3" src={logo} alt="Loading" width='100px' />
            <p className="text-dseark" style={{fontSize:'13px'}}> The Smart way to work.</p>
          
            <Box  className='d-flex justify-content-center main-loader'>
              <LinearProgress sx={{ width: '60%' }}/>
            
            </Box>
            <p className="my-2 text-dark" style={{fontSize:'12px'}}>{props.msg?<>{props.msg}</>:<>Please wait, processing request ...</>}</p>
           
          </div>
        </div>
    </div>
  
);

export default LoadingMini;