import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const ConfirmUpdateDialog = (props) => {
    return (
        <Dialog open={props.open} aria-labelledby="confirm-dialog-title">
            <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#2a68af', color: '#fff', fontSize: '15px' }}>
                <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                <span className='mx-3'> Apply Changes  <i className='fas fa-pen-nib mx-2'  style={{fontSize:'15px'}}></i></span>
            </DialogTitle>
            <DialogContent style={{ width: '400px' }}>
                {props.uptatingObject ?
                    <>
                        <Typography variant="body1" className='p-3'>Updating object ...</Typography>

                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />

                        </Box>
                    </>
                    :
                    <Typography variant="body1" className='p-3'>{props.message}</Typography>
                }


            </DialogContent>
            {props.uptatingObject ?
                <>
                 <DialogActions className='p-3'>
                     
                    </DialogActions>
                </>
                :
                <>
                    <DialogActions>
                        <Button onClick={
                            props.discardChange
                        }>
                            Discard
                        </Button>
                        <Button
                            onClick={
                                props.onConfirm
                            }
                            color="primary"
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </>
            }

        </Dialog>
    );
};


export default ConfirmUpdateDialog;


