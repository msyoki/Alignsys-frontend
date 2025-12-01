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
    const fileId = await fetchFileId();
    if (!fileId) return;

    const title = `${props.object.title}.${props.object.extension}`;
    const appUrl = `Alignsysofficeapp://?Extension=${props.object.extension}&ClassId=${props.object.classId ?? props.object.classID}&fileID=${fileId}&ObjectId=${props.object.id}&VaultGuid=${props.object.guid}&UserID=${props.mfilesId}&Filename=${title}`;

    console.log("Launching plugin with URL:", appUrl);

    let pluginOpened = false;
    const handleBlur = () => {
      pluginOpened = true;
    };
    window.addEventListener("blur", handleBlur);

    // ✅ Use iframe to silently try to open the plugin
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = appUrl;
    document.body.appendChild(iframe);
    

    // Wait a few seconds
    // setTimeout(() => {
    //   window.removeEventListener("blur", handleBlur);
    //   document.body.removeChild(iframe);

    //   if (!pluginOpened) {
    //     const confirmed = window.confirm(
    //       "The Alignsys Office plugin doesn’t seem to be installed or didn’t open.\nWould you like to download it now?"
    //     );
    //     if (confirmed) handleDownloadPlugin();
    //   }
    // }, 4000);

    // Close dialog right away
    props.close();
     props.handleTabAction()
  };

  const handleDownloadPlugin = () => {
    window.open(`${constants.office_app_plugin}/api/FilesDownload`, "_blank");
  };



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
        {/* Plugin Installation Section — minimized look */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8f9fa',
            px: 2.5,
            py: 1.25,
            borderBottom: '1px solid #e9ecef',
            opacity: 0.8, // visually deemphasize
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <i
              className="fas fa-plug"
              style={{ fontSize: '14px', color: '#2757aa', marginTop: '1px' }}
            />
            <Typography
              variant="body2"
              sx={{
                fontSize: '12.5px',
                color: '#495057',
                lineHeight: 1.4,
              }}
            >
              Need the plugin?&nbsp;
              <Box component="span" sx={{ color: '#2757aa', fontWeight: 500 }}>
                Download Alignsys Plug-In App
              </Box>
            </Typography>
          </Box>

          <Button
            onClick={handleDownloadPlugin}
            variant="text"
            size="small"
            sx={{
              fontSize: '12px',
              textTransform: 'none',
              color: '#2757aa',
              '&:hover': { backgroundColor: '#e8f0fe' },
              px: 1,
              minWidth: 'auto',
            }}
          >
            <i className="fas fa-download" style={{ fontSize: '12px', marginRight: '6px' }} />
            Download
          </Button>
        </Box>

        {/* Main Content Section — visually dominant */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#f1f5ff',
                borderRadius: '50%',
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                mt: 0.5,
              }}
            >
              <i className="fa-solid fa-circle-info" style={{ fontSize: '20px', color: '#2757aa' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{ fontSize: '13px', lineHeight: 1.6, color: '#212529' }}
              >
                The document{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 500,
                    color: '#1C4690',
                    backgroundColor: '#e3f2fd',
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '13px',
                  }}
                >
                  "{props.object.title}.{props.object.extension}"
                </Box>{' '}
                is currently in read-only mode.
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: '13px', mt: 1.5, color: '#6c757d' }}
              >
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
          size='small'
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
          size='small'
          sx={{
            textTransform: 'none',
            fontSize: '14px',
            px: 3,
            py: 1,
            backgroundColor: '#7cb518',
            '&:hover': {
              backgroundColor: '#7cb518'
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
