import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import LoadingMini from '../Loaders/LoaderMini';
import logo from '../../images/ZFBLU.png';
import { CircularProgress } from '@mui/material';
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  border: '2px solid transparent', // Initially set border to transparent
};

export default function MiniLoader(props) {
  return (
    <div>
      <Modal
        open={props.loading}
      >
        <Box className='card text-center' sx={{ ...style, border: props.loading ? '2px solid transparent' : 'none' }}>
        
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
           
          <img className="my-3" src={logo} alt="logo" width="300px" />
           <CircularProgress size={40} sx={{ color: '#2757aa', mb: 2 }} />
            <Typography variant="body2" color="textPrimary">
              {props.loaderMsg ? (
        
                <span style={{ color: '#555' }} className="loading-indicator ">
                  {props.loaderMsg} <span>.</span><span>.</span><span>.</span>
                </span>
              ) : (
                <span style={{ color: '#555' }} className="loading-indicator ">
                  Fetching, please wait <span>.</span><span>.</span><span>.</span>
                </span>
              )}
            </Typography>
          </Box>
        </Box>

        
      </Modal>
    </div>
  );
}
