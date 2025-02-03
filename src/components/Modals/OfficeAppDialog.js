import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import * as constants from '../Auth/configs';
import axios from 'axios';

function OfficeApp(props) {
  const fetchFileId = async () => {
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.object.guid}/${props.object.id}/${props.object.type}`;

    try {
      const response = await axios.get(url, { headers: { Accept: '*/*' } });
     

      if (response.data.length > 0) {
        return response.data[0].fileID; // Return the first fileID found
      } else {
        console.error('No files found.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching file ID:', error);
      return null; // Return null in case of error
    }
  };

  const handleProceed = async () => {
    const now = Date.now(); // Use Date.now() for cleaner code
    const fileId = await fetchFileId(); // Fetch file ID
  
    if (fileId) {

      const appUrl = `ZenFilesOfficeApp://?Extension=${props.object.extension}&ClassId=${props.object.classId ?? props.object.classID}&fileID=${fileId}&ObjectId=${props.object.id}&VaultGuid=${props.object.guid}`;
   
  
      // Create an iframe to run the app URL in the background
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none'; // Hide the iframe
      document.body.appendChild(iframe);
  
      // Attempt to open the app URL using the iframe
      iframe.src = appUrl;

  
      // Close the modal after proceeding
      props.close();
    }
  };

  const handleDownloadPlugin=()=>{
    window.open("https://officeapp.techedge.dev/api/FilesDownload", "_blank");
  }
  
  const handleCancel = () => {
    // Close the modal without proceeding
    props.close();
  };

  useEffect(() => {

  }, [props.object]);

  return (
    <Dialog open={props.open} onClose={handleCancel}>

      <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#1C4690', color: '#fff', fontSize: '15px' }}>
        <span className='mx-3'><i className="fas fa-edit" style={{ fontSize: '20px', marginRight: '10px' }}></i> Check Out & Edit Document</span>
      </DialogTitle>
      <DialogContent className='p-3'>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '50px', marginRight: '10px', color: 'orange' }}></i>
          <DialogContentText>
          <Typography variant="body1" className='p-2' style={{fontSize:'13px'}}>Incase you haven't installed the plugin app, please click to download and  install  <Button  onClick={handleDownloadPlugin} color="warning">
            Download ZenFiles Plug-In
        </Button> </Typography>
            <Typography variant="body1" className='p-2' style={{fontSize:'13px'}}>
              The object <span style={{color:'#2a68af'}}>"{props.object.title}.{props.object.extension}"</span> is currently in read-only mode. Do you want to check it out so that you can edit it locally?
            </Typography>
      
          </DialogContentText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="error">
          Cancel
        </Button>
        <Button onClick={handleProceed} color="primary">
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OfficeApp;
