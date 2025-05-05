import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Typography, Box, CircularProgress, InputLabel } from '@mui/material';
import Logo from '../images/ZFBLU.webp';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import * as constants from '../components/Auth/configs'
import TimedAlert from '../components/TimedAlert';
import { Button } from '@mui/material';
const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [linksent, setLinkSent] = useState(false);
    const navigate = useNavigate();

    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');

    const handleTryAgain = () => {
        setMessage('');
        setEmail('');
        setLinkSent(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${constants.auth_api}/api/password_reset/`,
                { email },
                { headers: { 'Content-Type': 'application/json' } }
            );
            setMessage(response.data.message);
            setLinkSent(true);
            setOpenAlert(true);
            setAlertSeverity('success');
            setAlertMsg('Password reset mail sent successfully!'); // Ensure it's a string
        } catch (error) {
            setOpenAlert(true);
            setAlertSeverity('error');
           
            // Extract meaningful error message
            const errorMsg = error.response?.data?.error || error.message || 'An error occurred';

            setAlertMsg(errorMsg); // Ensure it's a string
            console.error('Error sending password reset request:', error);
            setMessage(errorMsg);
            setLinkSent(false);
        } finally {
            setLoading(false);
        }
    };


    const handleRedirect = () => {
        navigate('/login');
    };

    return (

        <>
            <TimedAlert
                open={alertOpen}
                onClose={setOpenAlert}
                severity={alertSeverity}
                message={alertMsg}
                setSeverity={setAlertSeverity}
                setMessage={setAlertMsg}
            />
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#2757aa', // Full page background color
                    padding: 2,
                }}
            >
                <Box
                    className="shadow-lg p-4 bg-white text-center"
                    sx={{
                        borderRadius: 2,
                        textAlign: 'center',
                        backgroundColor: 'white',
                        padding: 4,
                        boxShadow: 3,
                        maxWidth: 400,
                        width: '90%',
                    }}
                >

                    <img src={Logo} alt="Techedge Logo" style={{ width: '200px', margin: '0 auto', display: 'block' }} />



                    {!linksent ? (
                        <form onSubmit={handleSubmit}>
                            <Box mb={2}>
                                <p style={{ backgroundColor: '#fff', color: '#555', margin: '10px ' }} >
                                    Password Reset
                                </p>
                                <InputLabel htmlFor="email">
                                    <small>NB: Please enter your registered email address below</small>
                                </InputLabel>
                                <TextField
                                    size="small"
                                    label="Email address"
                                    type="email"
                                    fullWidth
                                    margin="normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Box>
                            {/* <ButtonComponent
                                type="submit"
                                className='p-2'
                                cssClass="e-custom-success"

                                style={{ textTransform: 'none', fontWeight: 'lighter', width: '40%', padding: '10px' }}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={12} className="text-white " /> : 'Send Reset Link'}
                            </ButtonComponent> */}

                            <Button
                                // color="success"
                                 type="submit"
                                className="mb-3 m-2 rounded-pill " // Retaining the same classes as in the original code
                                style={{
                                    fontSize: '12.5px',
                                    color: '#fff',
                                    backgroundColor:'#2CB34A',
                                    cursor: 'pointer',
                                    width: 'auto',
                                    padding: '10px',
                                    textTransform: 'none',
                                }}
                                disabled={loading? true : false}
                                variant="contained"
                            >
                               <span className='mx-3'> {loading ? <>Sending email ... <CircularProgress size={12} className="text-white mx-2" /> </>: 'Send Reset Link'}</span>
                            </Button>
                        </form>
                    ) : (
                        <Box mt={2}>
                            <Typography variant="body1" color="textSecondary">
                                <small style={{ fontSize: '13px' }}>{message}</small>
                            </Typography>
                            <Typography variant="body1" color="textDark" className="my-2">
                                OR
                            </Typography>
                            {/* <ButtonComponent
                                cssClass="e-custom-warning"
                                className="mb-2 p-2"

                                style={{ textTransform: 'none', fontWeight: 'lighter', width: '40%', padding: '10px' }}
                                onClick={handleTryAgain}
                            >
                                Try Again
                            </ButtonComponent> */}

                            <Button
                                // color="success"
                                onClick={handleTryAgain}
                                className="mb-3 m-2 rounded-pill " // Retaining the same classes as in the original code
                                style={{
                                    fontSize: '12.5px',
                                    color:linksent ? '#30343f' : '#fff',
                                    backgroundColor: linksent ? '#ffda75' : '#2757aa',
                                    cursor: 'pointer',
                                    width: '40%',
                                    padding: '10px',
                                    textTransform: 'none',
                                }}
                                disabled={false}
                                variant="contained"
                            >
                                Try Again
                            </Button>
                        </Box>
                    )}

                    <Box mt={2}>
                        {/* <ButtonComponent
                            type="button"
                            cssClass="e-custom-primary"
                            className="mb-3 m-2 p-2"

                            style={{ textTransform: 'none', fontWeight: 'lighter', width: '40%', padding: '10px' }}
                            onClick={handleRedirect}
                        >
                            {linksent ? 'Go to Login' : 'Cancel Reset'}
                        </ButtonComponent> */}

                        <Button
                           
                            onClick={handleRedirect}
                            className="mb-3 m-2 rounded-pill " // Retaining the same classes as in the original code
                            style={{
                                fontSize: '12.5px',
                                color:linksent ? '#fff' : '#30343f',
                                backgroundColor: linksent ? '#2757aa' : '#ffda75',
                                cursor: 'pointer',
                                width: '40%',
                                padding: '10px',
                                textTransform: 'none',
                            }}
                            disabled={false}
                            variant="contained"
                        >
                            {linksent ? 'Go to Login' : 'Cancel Reset'}
                        </Button>


                    </Box>
                </Box>
            </Box>
        </>

    );
};

export default PasswordResetRequest;
