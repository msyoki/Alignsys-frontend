import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import DownloadCSV from './DownloadCSV';
import * as constants from '../Auth/configs'


const BulkUserRegistrationDialog = (props) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setError('');
        setSuccess('');
        setFile(null);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await axios.post(`${constants.auth_api}/api/bulk-register/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${props.authTokens.access}` // Add bearer token to the header
                },
            });
            console.log('Response status code:', response.status);
            console.log('Response message:', response.data.message);
            setSuccess(response.data.message);
            
            // If there are error messages in the response, add them to the success state
            if (response.data.error_message) {
                setSuccess(prev => prev + '\n' + response.data.error_message);
            }
            props.fetchOrgUsers()
            
        } catch (error) {
            console.error('Error status code:', error.response?.status);
            console.error('Error message:', error.response?.data?.error || 'Bulk registration failed.');
            setError(error.response?.data?.error || 'Bulk registration failed.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <>
            <Button className='mx-2' variant="contained" color="primary" onClick={handleOpen}>
                Bulk User Registration
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#1d3557', color: '#fff', fontSize: '15px' }}>
                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span>Bulk Register Users<i className='fa fa-users mx-3'></i></span>
                </DialogTitle>
                <DialogContent className='p-4'>
                    <p>Download the CSV file, review and list the users, then re-upload to register multiple users at once. <DownloadCSV /></p>
                    <Box component="form" onSubmit={handleSubmit}>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'block', margin: '16px 0' }}
                        />
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        {success && (
                            <Typography color="primary" variant="body2" style={{ whiteSpace: 'pre-line' }}>
                                {success}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={loading || !file}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BulkUserRegistrationDialog;
