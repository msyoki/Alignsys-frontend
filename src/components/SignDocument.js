// PostDataButton.js
import React, { useState } from 'react';
import axios from 'axios';
import * as constants from './Auth/configs';
import { Button, CircularProgress } from '@mui/material';

const SignButton = (props) => {
  const [loading, setLoading] = useState(false);

  const postData = async () => {
    setLoading(true);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/DSSPostObjectFile`;

      const data = {
        objectid: props.objectid,
        classId: props.classid,
        fileid: props.fileId,
        vaultGuid: props.vault,
        signerEmail: props.email,
        userID: props.mfilesId,
      };
      console.log(data);

      const headers = {
        accept: '*/*',
        'Content-Type': 'application/json',
      };

      const response = await axios.post(url, data, { headers });
      console.log('Response:', response.data);

      // Extract the filelink from the response and open it in a new tab
      const fileLink = response.data.filelink;
      if (fileLink) {
        window.open(fileLink, '_blank');
      } else {
        console.error('Error: filelink not found in response');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="small"
      variant="contained"
      color="primary"
      onClick={postData}
      style={{ textTransform: 'none' }}
      disabled={loading} // disable button when loading
    >
      {loading && (
        <CircularProgress
          size={14}
          color="inherit"
          style={{ marginRight: 8 }}
        />
      )}
      <small>
        <i
          className="fas fa-signature"
          style={{ fontSize: '11px', marginRight: '4px' }}
        ></i>
        Sign now
      </small>
    </Button>
  );
};

export default SignButton;
