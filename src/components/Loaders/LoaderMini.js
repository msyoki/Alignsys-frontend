import React from "react";
import loading from "../../images/loading.svg";
import logo from "../../images/ZF.png";
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';




const LoadingMini = (props) => (
    <div className='App'>
        <div className='text-center p-3'>
          <div className="spinner">
         
         
            <img className="my-3" src={logo} alt="Loading" width='60px' />
            <p className="text-dseark" style={{fontSize:'13px'}}> The Smart way to work.</p>
          
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            
            </Box>
            <p className="my-2 text-dark" style={{fontSize:'12px'}}>{props.msg?<>{props.msg}</>:<>Please wait, processing request ...</>}</p>
           
          </div>
        </div>
    </div>
  
);

export default LoadingMini;