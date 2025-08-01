import React, { useState, useContext } from 'react';
import axios from 'axios';
import '../styles/Login.css'; // Import CSS file for styling
import logo from '../images/m.png';
import Authcontext from '../components/Auth/Authprovider';
import '../styles/Custombuttons.css';

import { Link, useNavigate } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import KeyIcon from '@mui/icons-material/Key';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import EmailIcon from '@mui/icons-material/Email';
import Box from '@mui/material/Box';
import image from '../images/ZFBLU.png';
import MiniLoader from '../components/Modals/MiniLoaderDialog';
import * as constants from '../components/Auth/configs';
import logo2 from '../images/ZFWHITE.png';
import { Button } from '@mui/material';
import TimedAlert from '../components/TimedAlert';
import { CircularProgress } from '@mui/material';

const Register = () => {
  const [companyName, setCompanyName] = useState('');
  const [vaultName, setVaultName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [miniLoader, setMiniLoader] = useState(false);
  const [alertMsg, setAlertMsg] = useState('')
  const [openAlert, setOpenAlert] = useState(false)
  const [alertSeverity, setAlertSeverity] = useState('')

  const navigate = useNavigate();

  // Function to reset form fields
  const resetForm = () => {
    setCompanyName('');
    setAdminEmail('');
    setAdminPassword('');
  };

  const togglePasswordVisibility = () => {
    let passwordField = document.getElementById('password');
    passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    document.getElementById('togglePassword').className = passwordField.type === 'password' ? 'fas fa-eye-slash ml-2' : 'fas fa-eye ml-2';
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setMiniLoader(true);
    const userData = {
      company_name: companyName,
      admin_email: adminEmail,
      vault_name: vaultName
    };

    axios.post(`${constants.auth_api}/api/organization/signup/`, userData)
      .then(response => {
        setMiniLoader(false);

        // Reset the form
        resetForm();

        // Show success message

        setOpenAlert(true)
        setAlertSeverity('success')
        setAlertMsg("Registration was successful! Redirecting to login page...")

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      })
      .catch(error => {
        setMiniLoader(false);
        setOpenAlert(true)
        setAlertSeverity('error')
        setAlertMsg("Account with similar credentials already exists!")

      });
  };

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
      <div className="login-container">

        <div className="left-side">
          <form onSubmit={handleRegister} className="text-center text-dark p-3">
            <Box className="d-block d-md-none text-center mb-3">
              <img src={image} alt="Logo" style={{ width: '300px' }} />
            </Box>


            <div className="d-flex justify-content-center align-items-center mb-3">
              <h5 className="mb-0">
                REGISTER
              </h5>
              <span className="d-block d-md-none ms-2" style={{ fontSize: '14px' }}>
                to <strong>EDMS</strong> Software Solution
              </span>
            </div>


            <div className="form-group my-2">
              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="company-name">Organization Name*</InputLabel>
                <Input
                  style={{ fontSize: '14px' }}
                  id="company-name"
                  name="companyName"
                  placeholder="Organization Name"
                  type='text'
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  startAdornment={<InputAdornment position="start"><CorporateFareIcon /></InputAdornment>}
                  required
                />
              </FormControl>
            </div>
            <div className="form-group my-2">
              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="vault-name">First Repository Name*</InputLabel>
                <Input
                  style={{ fontSize: '14px' }}
                  id="company-name"
                  name="vaultName"
                  placeholder="e.g. Test, Main, HR"
                  type="text"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value.slice(0, 10))} // enforce limit
                  startAdornment={
                    <InputAdornment position="start">
                      <i className="fa-solid fa-database"></i>
                    </InputAdornment>
                  }
                  required
                />

              </FormControl>
            </div>

            <div className="form-group my-3">
              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="admin-email">Admin Email*</InputLabel>
                <Input
                  style={{ fontSize: '14px' }}
                  id="admin-email"
                  name="adminEmail"
                  placeholder="Admin Email"
                  type='email'
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  startAdornment={<InputAdornment position="start"><EmailIcon /></InputAdornment>}
                  required
                />
              </FormControl>
            </div>

            {/* Uncomment if password field is needed
          <div className="form-group my-3">
            <FormControl variant="standard" fullWidth>
              <InputLabel htmlFor="password">Password*</InputLabel>
              <Input
                style={{ fontSize: '14px' }}
                id="password"
                type='password'
                placeholder="Admin Password"
                name="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                startAdornment={<InputAdornment position="start"><KeyIcon /></InputAdornment>}
                endAdornment={<InputAdornment position="end">
                  <i onClick={togglePasswordVisibility} className="fas fa-eye-slash" id="togglePassword"></i>
                </InputAdornment>}
              />
            </FormControl>
          </div>
          */}

            <div className="text-center text-lg-start mt-4 row">
              <div className='col-lg-12 text-center'>
                <Button
                  type="submit"
                  variant="contained"
                  className="mb-3 rounded-pill"
                  disabled={miniLoader}
                  startIcon={miniLoader ? <CircularProgress size={14} color="inherit" /> : null}
                  sx={{
                    fontSize: '13px',
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    minWidth: '40%',
                    backgroundColor: miniLoader ? '#ccc' : '#2757aa',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: miniLoader ? '#ccc' : '#1e4794',
                    },
                  }}
                >
                  {miniLoader ? 'Submitting registration' : 'REGISTER'}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="mt-3" style={{ fontSize: '13px' }}>Already have an account?
                <Link className='mx-2' to={'/login'} style={{ textDecoration: 'none', color: '#2757aa' }}>Login Here</Link>
              </p>
            </div>
          </form>
        </div >

        <div
          className="d-none d-md-flex right-side w-100 w-md-50 flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: '#007bff',
            padding: '20px',
          }}
        >
          <img src={logo2} alt="Banner Logo" width="300px" />
          <p className="text-white mt-4" style={{ fontSize: '15px' }}>
            <strong>EDMS</strong> Software Solution
          </p>
        </div>
      </div >
    </>
  );
};

export default Register;