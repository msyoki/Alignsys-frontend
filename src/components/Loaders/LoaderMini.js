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
        msg
      ) : (
        <span className="loading-indicator text-muted">
          Fetching, please wait <span>.</span><span>.</span><span>.</span>
        </span>
      )}
    </Typography>
  </Box>
);

LoadingMini.propTypes = {
  msg: PropTypes.string,
};

export default LoadingMini;
