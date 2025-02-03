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
import logo from '../../images/ZFBLU.webp'

const ConfirmUpdateDialog = (props) => {
    return (
        <Dialog open={props.open} aria-labelledby="confirm-dialog-title">
            <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#1C4690', color: '#fff', fontSize: '15px' }}>
            <span className='mx-3' style={{fontSize:'12px'}}> Unsaved Changes</span>
            <img className=" bg-white p-2 mx-3"  src={logo} alt="Loading" width="130px" />
               
            </DialogTitle>
            <DialogContent style={{ width: '400px' }}>
                {props.uptatingObject ?
                    <>
                        <Typography variant="body1" className='p-3' style={{fontSize:'12px'}}>Updating object ...</Typography>

                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />

                        </Box>
                    </>
                    :
                    <Typography variant="body1" className='p-2'> <i className='fas fa-exclamation-triangle mx-2 text-warning'  style={{fontSize:'40px'}}></i><span style={{fontSize:'11.5px'}}>You have unsaved changes to:   <br/><span style={{color:'#2a68af'}}>{props.message}</span></span></Typography>
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
                      
                        <Button
                            onClick={
                                props.onConfirm
                            }
                            color="primary"
                        >
                            Save
                        </Button>
                        <Button onClick={
                            props.discardChange
                        }>
                            Discard
                        </Button>
                    </DialogActions>
                </>
            }

        </Dialog>
    );
};


export default ConfirmUpdateDialog;


