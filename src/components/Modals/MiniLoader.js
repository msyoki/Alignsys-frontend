import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import LoadingMini from '../Loaders/LoaderMini';

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
        
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <LoadingMini msg={props.loaderMsg} progress={props.progress}/>
           
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
