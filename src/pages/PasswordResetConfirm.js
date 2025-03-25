import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../../Dss/dss-frontend-linux-cutomviewer/src/components/axiosConfig';  // Import the Axios instance
import { TextField, Container, Typography, Box, CircularProgress, InputLabel } from '@mui/material';
import Logo from '../../images/ZFBLU.webp';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import "../../styles/App.css";

const PasswordResetConfirm = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetSuccessful, setResetSuccessful] = useState(false);

    const validatePasswords = () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords()) return;
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/password_reset_confirm/', {
                uidb64: uid,
                token,
                new_password: newPassword,
            });
            setMessage(response.data.message);
            setResetSuccessful(true);
        } catch (error) {
            setMessage(error.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleRedirect = () => {
        navigate('/login');
    };

    return (
        <Container maxWidth="sm" className="text-center ">
            <Typography sx={{ marginTop: '10%', backgroundColor: '#1C4690' }} variant="p" component="p" gutterBottom className="p-2 text-white ">
                Reset Your Password
            </Typography>
            <Box className="shadow-lg p-4 bg-white ">
                <img src={Logo} alt="Techedge Logo" style={{ width: '260px' }} />


                {!resetSuccessful ? (
                    <form onSubmit={handleSubmit}>
                        <InputLabel htmlFor="password"><small>Please enter your new password and confirm below</small></InputLabel>
                        <TextField
                            label="New Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            size="small"
                            autoComplete="new-password"
                            style={{ width: '300px' }}
                        />
                        <TextField
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            size="small"
                            autoComplete="new-password"
                            style={{ width: '300px' }}
                        />
                        {error && (
                            <Typography color="error" variant="body2">
                                {error}
                            </Typography>
                        )}
                        <Box mt={2}>
                            <ButtonComponent
                                type="submit"
                                cssClass="e-custom-success"
                                className="mb-3 m-2"
                                style={{ textTransform: 'none', fontWeight: 'lighter', width: "30%", padding: '10px' }}
                            >
                                {loading ? <CircularProgress size={12} className="text-white" /> : 'Reset Password'}
                            </ButtonComponent>
                        </Box>
                    </form>
                ) : (
                    <Typography m={2} variant="body1" color="textSecondary">
                        <small>{message}</small>
                    </Typography>
                )}

                <Box >
                    <ButtonComponent
                        cssClass={resetSuccessful ? 'e-custom-success' : 'e-custom-primary'}
                        style={{ textTransform: 'none', fontWeight: 'lighter', width: "30%", padding: '10px' }}
                        onClick={handleRedirect}
                    >
                        {resetSuccessful ? 'Go to Login' : 'Cancel'}
                    </ButtonComponent>
                </Box>
            </Box>
        </Container>
    );
};

export default PasswordResetConfirm;
