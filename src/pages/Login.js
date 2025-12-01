import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  InputLabel,
  InputAdornment,
  FormControl,
  Input,
  Button,
  Box
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';

import Authcontext from '../components/Auth/Authprovider';
import TimedAlert from '../components/TimedAlert';

import '../styles/Login.css';
import '../styles/Custombuttons.css';

import image from '../images/ZFBLU.png';
import logo2 from '../images/ZFWHITE.png';
import * as constants from '../components/Auth/configs';
import { CircularProgress } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const {
    loginUser,
    miniLoader,
    openAlert,
    setOpenAlert,
    setAlertMsg,
    setAlertSeverity,
    alertMsg,
    alertSeverity,
  } = useContext(Authcontext);

  const togglePasswordVisibility = () => {
    const input = document.getElementById('password');
    const icon = document.getElementById('togglePassword');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.className = isHidden ? 'fas fa-eye ml-2' : 'fas fa-eye-slash ml-2';
  };

  const handlePasswordReset = () => navigate('/password-reset');

  return (
    <>
      <TimedAlert
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        severity={alertSeverity}
        message={alertMsg}
        setSeverity={setAlertSeverity}
        setMessage={setAlertMsg}
      />

      <div className="login-container d-flex flex-column flex-md-row" style={{ minHeight: '100vh' }}>
        {/* Left Side - Form */}
        <div className="left-side d-flex align-items-center justify-content-center w-100 w-md-50 bg-white p-4">
          <form onSubmit={loginUser} className="text-center text-dark w-100" style={{ maxWidth: '320px' }}>

            {/* Logo for small screens */}
            {/* <Box className="d-block d-md-none text-center mb-3">
              <img src={image} alt="Logo" style={{ width: '260px' }} />
            </Box> */}

            {/* Title */}
            <div className="d-flex justify-content-center align-items-center my-4" style={{ color: '#2757aa' }}>
              <h5 className="mb-0 text-dark">
                LOGIN
              </h5>
              <span className="d-block d-md-none ms-2" style={{ fontSize: '14px' }}>
                to  EDMS
              </span>
            </div>



            {/* Email Field */}
            <FormControl variant="standard" fullWidth className="mb-3">
              <InputLabel htmlFor="email">
                {constants.auth_type_email === "true" ? "Email" : "Username"}*
              </InputLabel>
              <Input
                id="email"
                name="email"
                type={constants.auth_type_email === "true" ? "email" : "text"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={constants.auth_type_email === "true" ? "Email" : "Username"}
                startAdornment={
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                }
                style={{ fontSize: '14px' }}
              />
            </FormControl>

            {/* Password Field */}
            <FormControl variant="standard" fullWidth className="mb-2">
              <InputLabel htmlFor="password">Password*</InputLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="User password"
                style={{ fontSize: '13px' }}
                startAdornment={<InputAdornment position="start"><KeyIcon /></InputAdornment>}
                endAdornment={
                  <InputAdornment position="end">
                    <i
                      id="togglePassword"
                      className="fas fa-eye-slash"
                      onClick={togglePasswordVisibility}
                      style={{ cursor: 'pointer' }}
                    />
                  </InputAdornment>
                }
              />
            </FormControl>

            {/* Forgot password */}
            <div className="d-flex justify-content-end mb-3">
              <Link to="/password-reset" style={{ fontSize: '13px', color: '#2757aa', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <div className="text-center mt-3 row">
              <div className="col-lg-3 col-md-3" />
              <div className="col-lg-6 col-md-6">
                <Button
                  type="submit"
                  variant="contained"
                  className="mb-3 rounded-pill"
                  disabled={miniLoader}
                  startIcon={miniLoader ? <CircularProgress size={14} color="inherit" /> : null}

                  style={{
                    fontSize: '13px',
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    width: '100%',
                    backgroundColor: miniLoader ? '#ccc' : '#2757aa',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: miniLoader ? '#ccc' : '#1e4794',
                    },
                  }}
                >

                  {miniLoader ? 'Logging in ...' : 'LOGIN'}
                </Button>
              </div>
              <div className="col-lg-3 col-md-3" />
            </div>

            {/* Footer Links */}
            <p className="mt-4" style={{ fontSize: '13px', color: '#555' }}>
              Go to{' '}
              {process.env.REACT_APP_ONSITE !== 'true' && (
                <>
                  <Link to="/register" style={{ color: '#2757aa', textDecoration: 'none' }}>Register an Organization</Link>
                  <span className="mx-1"> | </span>
                </>
              )}
              <a href="https://dss.alignsys.tech" target="_blank" rel="noopener noreferrer" style={{ color: '#2757aa', textDecoration: 'none' }}>
                DSS – Digital Signing Service
              </a>
            </p>

          </form>
        </div>



        {/* Right Side - Banner */}
        <div
          className="d-none d-md-flex right-side w-100 w-md-50 flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: '#2757aa',
            padding: '40px 20px',
            textAlign: 'center',
          }}
        >
          <img
            src={logo2}
            alt="Banner Logo"
            style={{
              width: '280px',
              maxWidth: '80%',
              filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.25))',
            }}
          />

          <p
            className="text-white mt-4"
            style={{
              fontSize: '18px',
              fontWeight: 500,
              opacity: 0.9,
              letterSpacing: '0.5px',
            }}
          >
            <strong style={{ fontSize: '20px' }}>EDMS</strong> Software Solution
          </p>

          <div
            style={{
              width: '60px',
              height: '4px',
              backgroundColor: 'white',
              opacity: 0.5,
              borderRadius: '2px',
              marginTop: '10px',
            }}
          ></div>

          <p
            className="text-white mt-4"
            style={{
              fontSize: '14px',
              maxWidth: '340px',
              lineHeight: '1.6',
              opacity: 0.85,
            }}
          >
            Manage documents efficiently, securely, and with seamless workflow automation.
          </p>
        </div>


      </div>

    </>
  );
};

export default Login;
