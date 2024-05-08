import  React, {useState} from 'react';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import CircularProgress from '@mui/material/CircularProgress';


import { ButtonComponent  } from '@syncfusion/ej2-react-buttons';
import LoadingMini from './LoaderMini';
import Loading from './Loader';
import loadingimg from "../../images/loading.svg";
import logo from "../../images/ZF.png";

const LoadingDialog=(props) =>{
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('sm');
  return (
    <div >
      <Dialog
        open={props.opendialogloading}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
        // className='App-header5'
        // style={{backgroundColor:'#2364aa'}}
      
       
      >
       {/* <Loading/> */}
      <div className='text-center p-3'>
      <img src={logo} alt="logo" width='250px'  />
        <br/>
        <img className="spinner" src={loadingimg} alt="Loading" width='100px ' />
        <p className="mt-2" style={{fontSize:'12.5px'}}>Please wait, processing ...</p>

      </div>
        {/* <DialogContent >
          <DialogContentText >
            <div className="container height-100 d-flex justify-content-center align-items-center"> 
              <LoadingMini/>
           
            </div>
          </DialogContentText>
        </DialogContent> */}
    
      </Dialog>
    </div>
  );
}


export default  LoadingDialog

