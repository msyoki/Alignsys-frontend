import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  InputLabel,
  InputAdornment,
  FormControl,
  Input,
  Button,
} from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import PersonIcon from '@mui/icons-material/Person';

import Authcontext from '../components/Auth/Authprovider';
import TimedAlert from '../components/TimedAlert';

import '../styles/Login.css';
import '../styles/Custombuttons.css';

import image from '../images/ZFBLU.png';
import logo2 from '../images/ZFWHITE.png';
import * as constants from '../components/Auth/configs'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const {
    loginUser,
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
          <form onSubmit={loginUser} className="text-center text-dark w-100" style={{ maxWidth: '360px' }}>
            <img src={image} alt="Logo" className="mb-3" style={{ width: '180px' }} />
            <h6 className="mb-3">SIGN IN</h6>

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
                startAdornment={
                  <InputAdornment position="start">
                    <KeyIcon />
                  </InputAdornment>
                }
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
                style={{ fontSize: '14px' }}
              />
            </FormControl>

            <div className="text-end mb-3">
              <a
                onClick={handlePasswordReset}
                style={{
                  textDecoration: 'none',
                  color: '#1C4690',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="contained"
              className="mb-3 rounded-pill"
              style={{
                fontSize: '13px',
                color: '#fff',
                backgroundColor: '#2757aa',
                width: '40%',
                padding: '10px',
                textTransform: 'none',
              }}
            >
              Login
            </Button>

            <p className="mt-3" style={{ fontSize: '13px' }}>
              Go to{' '}
              <a
                href="https://dss.alignsys.tech"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#1C4690', textDecoration: 'none' }}
              >
                DSS - Digital Signing Service
              </a>
            </p>
          </form>
        </div>

        {/* Right Side - Banner */}
        <div
          className="right-side w-100 w-md-50 d-flex flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: '#007bff',
            padding: '20px',
          }}
        >
          <img src={logo2} alt="Banner Logo" width="300px" />
          <p
            className="text-white mt-4"
            style={{fontSize: '15px' }}
          >
            <strong>EDMS</strong> Software Solution
          </p>
        </div>
      </div>

    </>
  );
};

export default Login;
