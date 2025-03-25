import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../../Dss/dss-frontend-linux-cutomviewer/src/components/axiosConfig';  // Import the Axios instance
import { TextField, Button, Container, Typography, Box, CircularProgress, InputLabel } from '@mui/material';
import Logo from '../../images/ZFBLU.webp';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import "../../styles/App.css";

const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [linksent, setLinkSent] = useState(false);
  const navigate = useNavigate();

  const handleTryAgain = () => {
    setMessage('');
    setEmail('');
    setLinkSent(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/password_reset/', { email });
      setMessage(response.data.message);
      setLinkSent(true);
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
      setLinkSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" className="text-center ">
          <Typography sx={{ marginTop: '10%',backgroundColor:'#1C4690' }}  variant="p" component="p" gutterBottom className="p-2 text-white ">
          Password Reset
        </Typography>
      <Box className="shadow-lg p-4 bg-white">
        <img src={Logo} alt="Techedge Logo" style={{ width: '260px' }} />
    

        {!linksent ? (
          <form onSubmit={handleSubmit}>
            <Box m={2}>
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
                style={{ width: '300px' }}
                required
              />
            </Box>
            <ButtonComponent
              type="submit"
              cssClass="e-custom-success"
              style={{ textTransform: 'none', fontWeight: 'lighter', width: "30%", padding: '10px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={12} className="text-white" /> : 'Send Reset Link'}
            </ButtonComponent>
          </form>
        ) : (
          <Box mt={2}>
            <Typography variant="body1" color="textSecondary">
              <small style={{ fontSize: '13px' }}>{message}</small>
            </Typography>
            <Typography variant="body1" color="textDark" className="my-2">
              OR
            </Typography>
            <Box mt={2}>
              <ButtonComponent
                cssClass="e-custom-warning"
                className="mb-2"
                style={{ textTransform: 'none', fontWeight: 'lighter', width: "30%", padding: '10px' }}
                onClick={handleTryAgain}
              >
                Try Again
              </ButtonComponent>
            </Box>
          </Box>
        )}

        <Box mt={2}>
          <ButtonComponent
            type="button"
            cssClass="e-custom-primary"
            className="mb-3 m-2"
            style={{ textTransform: 'none', fontWeight: 'lighter', width: "30%", padding: '10px' }}
            onClick={handleRedirect}
          >
            {linksent ? 'Go to Login' : 'Cancel'}
          </ButtonComponent>
        </Box>
      </Box>
    </Container>
  );
};

export default PasswordResetRequest;
