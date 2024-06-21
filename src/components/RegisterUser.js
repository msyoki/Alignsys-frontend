import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import * as constants from './Auth/configs'


const UserRegistrationDialog = (props) => {
    const [formValues, setFormValues] = useState({
        email: '',
        first_name: '',
        last_name: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e) => {
        setFormValues({
            ...formValues,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${constants.auth_api}/api/register/`, {
                ...formValues,
            }, {
                headers: {
                    'Authorization': `Bearer ${props.authTokens.access}` // Add bearer token to the header
                },
            });
            setSuccess(response.data.message);
            setFormValues({
                email: '',
                first_name: '',
                last_name: '',
                password: '',
            });
            props.fetchOrgUsers()
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <Button className='mx-2' variant="contained" color="primary" onClick={handleOpen}>
                Register New User
            </Button>
            <Dialog open={open} onClose={handleClose}>
               
                <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#1d3557', color: '#fff', fontSize: '15px' }}>

                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span>Register User <i className='fa fa-user mx-3' ></i></span>

                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            size='small'
                            label="Email"
                            name="email"
                            value={formValues.email}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            size='small'
                            label="First Name"
                            name="first_name"
                            value={formValues.first_name}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            size='small'
                            label="Last Name"
                            name="last_name"
                            value={formValues.last_name}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            size='small'
                            type="password"
                            label="Password"
                            name="password"
                            value={formValues.password}
                            onChange={handleChange}
                        />
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        {success && (
                            <Typography color="primary" variant="body2">
                                {success}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={loading}
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

export default UserRegistrationDialog;
