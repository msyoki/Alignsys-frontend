// PostDataButton.js
import React from 'react';
import axios from 'axios';
import * as constants from './Auth/configs'
import { Button } from '@mui/material';

const SignButton = (props) => {
    const postData = async () => {
        try {
            const url = `${constants.mfiles_api}/api/objectinstance/DSSPostObjectFile`;

            const data = {
                "objectid": props.objectid,
                "fileid": props.fileId,
                "vaultGuid": props.vault,
                "signerEmail": props.email
            };
            console.log(data)

            const headers = {
                'accept': '*/*',
                'Content-Type': 'application/json'
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
        }
    };


    return (

        <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={postData}
            style={{ textTransform: 'none' }}
           
        >
            <small>  <i className="fas fa-signature" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Sign now</small>
        </Button>
    );
};

export default SignButton;
