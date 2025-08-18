import React from "react";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const LoadingMini = ({ msg }) => (
  <Box
    sx={{
      minHeight: '150px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      p: 2
    }}
  >
    {/* <CircularProgress size={40} sx={{ color: '#2757aa', mb: 2 }} /> */}

    <Typography variant="body2" color="textPrimary">
      {msg ? (

        <span style={{ color: '#555' }} className="loading-indicator ">
          {msg} <span>.</span><span>.</span><span>.</span>
        </span>
      ) : (
        <span style={{ color: '#555' }} className="loading-indicator ">
          <CircularProgress size="20px"  style={{ color: "#2757aa" , marginRight:'10px'}} />  Fetching, please wait <span>.</span><span>.</span><span>.</span>
        </span>
      )}
    </Typography>
  </Box>
);

LoadingMini.propTypes = {
  msg: PropTypes.string,
};

export default LoadingMini;
