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
import logo from '../../images/ZFWHITE.webp'
import { THEME_COLORS } from '../../constants/themeColors';
import { FaTriangleExclamation } from "react-icons/fa6";


function ConfirmDeleteObject(props) {
    return (
        <Dialog open={props.open} aria-labelledby="confirm-dialog-title">

            {/* <DialogTitle
                className='p-2 d-flex justify-content-between align-items-center'
                style={{ backgroundColor: THEME_COLORS.primary, color: '#fff', fontSize: '15px' }}
            >

                <img className="mx-3" src={logo} alt="Loading" width="130px" />
        
            </DialogTitle> */}
            {/* Content */}
            <DialogContent sx={{ p: 2, textAlign: 'center', width: '400px' }} >
        
                <FaTriangleExclamation className="mx-2 my-2" style={{ color: THEME_COLORS.primary, fontSize: 60 }} />
               
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Are you sure you want to delete?
                </Typography>
                <Typography  variant="body1" sx={{  mt: 1 , color: THEME_COLORS.primary, fontSize:'12px'}}>
                    {props.objectTitle}
                </Typography>
            </DialogContent>



            {/* Actions */}

            <DialogActions className='p-3'>

            <Button className='mx-3' onClick={props.Close} size='small' variant="outlined" color="inherit">
                    Cancel
                </Button>
                <Button onClick={props.Delete} size='small' variant="contained" color="error">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}



export default ConfirmDeleteObject;


