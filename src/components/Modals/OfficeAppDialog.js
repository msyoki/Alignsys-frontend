import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Box
} from '@mui/material';
import * as constants from '../Auth/configs';
import axios from 'axios';


function OfficeApp(props) {
  const fetchFileId = async () => {
    const classID = props.object.classId ?? props.object.classID;
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.object.guid}/${props.object.id}/${classID}`;
    // console.log('Fetching file ID from URL:', url); // Debug log
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

      const appUrl = `Alignsysofficeapp://?Extension=${props.object.extension}&ClassId=${props.object.classId ?? props.object.classID}&fileID=${fileId}&ObjectId=${props.object.id}&VaultGuid=${props.object.guid}&UserID=${props.mfilesId}`;
   
      // console.log('Attempting to open app URL:', appUrl); // Debug log
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
    window.open(`${constants.office_app_plugin}/api/FilesDownload`, "_blank");
  }
  
  const handleCancel = () => {
    // Close the modal without proceeding
    props.close();
  };

  useEffect(() => {

  }, [props.object]);

  return (
   <Dialog 
  open={props.open} 
  onClose={handleCancel}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 2,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    }
  }}
>
  <DialogTitle 
    sx={{ 
      backgroundColor: '#1C4690', 
      color: 'white',
      py: 1,
      px: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5
    }}
  >
    <i className="fas fa-edit" style={{ fontSize: '15px' }} />
    <Typography variant="h6" component="h2" sx={{ fontSize: '15px', fontWeight: 500 }}>
      Check Out & Edit Document
    </Typography>
  </DialogTitle>

  <DialogContent sx={{ p: 0 }}>
    {/* Plugin Installation Section */}
    <Box sx={{ 
      backgroundColor: '#ecf4fc', 
      p: 3, 
      borderBottom: '1px solid #e9ecef' 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <i className="fas fa-download" style={{ 
          fontSize: '30px', 
          color: '#1C4690',
          marginTop: '2px'
        }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ 
            fontSize: '13px', 
            lineHeight: 1.5,
            mb: 2,
            color: '#495057'
          }}>
            If you haven't installed the plugin app, please download and install it first:
          </Typography>
          <Button 
            onClick={handleDownloadPlugin}
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              fontSize: '13px',
              borderColor: '#2757aa',
              color: '#2757aa',
              '&:hover': {
                backgroundColor: '#2757aa',
                color: 'white'
              }
            }}
          >
            <i className="fas fa-download" style={{ marginRight: '8px', fontSize: '12px' }} />
            Download Alignsys Plug-In
          </Button>
        </Box>
      </Box>
    </Box>

    {/* Main Content Section */}
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{
          backgroundColor: '#fff',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: 0.5
        }}>
          <i className="fas fa-exclamation-triangle" style={{ 
            fontSize: '30px',
            color:'#2757aa' 
           
          }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ 
            fontSize: '13px', 
            lineHeight: 1.6,
            color: '#212529'
          }}>
            The document{' '}
            <Box component="span" sx={{ 
              fontWeight: 500, 
              color: '#1C4690',
              backgroundColor: '#e3f2fd',
              px: 1,
              py: 0.25,
              borderRadius: 0.5,
              fontSize: '13px'
            }}>
              "{props.object.title}.{props.object.extension}"
            </Box>
            {' '}is currently in read-only mode.
          </Typography>
          <Typography variant="body2" sx={{ 
            fontSize: '13px', 
            mt: 1.5,
            color: '#6c757d'
          }}>
            Would you like to check it out so you can edit it locally?
          </Typography>
        </Box>
      </Box>
    </Box>
  </DialogContent>

  <DialogActions sx={{ 
    p: 3, 
    pt: 2,
    gap: 1.5,
    backgroundColor: '#fafafa',
    borderTop: '1px solid #e9ecef'
  }}>
    <Button 
      onClick={handleCancel}
      variant="outlined"
      sx={{
        textTransform: 'none',
        fontSize: '14px',
        px: 3,
        py: 1,
        borderColor: '#6c757d',
        color: '#6c757d',
        '&:hover': {
          borderColor: '#5a6268',
          backgroundColor: '#f8f9fa'
        }
      }}
    >
      Cancel
    </Button>
    <Button 
      onClick={handleProceed}
      variant="contained"
      sx={{
        textTransform: 'none',
        fontSize: '14px',
        px: 3,
        py: 1,
        backgroundColor: '#2757aa',
        '&:hover': {
          backgroundColor: '#164080'
        }
      }}
    >
      <i className="fas fa-check-circle" style={{ marginRight: '8px', fontSize: '14px' }} />
      Check Out Document
    </Button>
  </DialogActions>
</Dialog>
  );
}

export default OfficeApp;
