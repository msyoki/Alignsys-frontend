import React, { useState, useContext } from 'react';
import axios from 'axios';
import '../styles/Login.css'; // Import CSS file for styling
import logo from '../images/m.png';
import Authcontext from '../components/Auth/Authprovider';
import '../styles/Custombuttons.css';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Link } from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import KeyIcon from '@mui/icons-material/Key';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import EmailIcon from '@mui/icons-material/Email';
import Alerts from '../components/Alert';
import image from '../images/logo2.png';
import MiniLoader from '../components/Modals/MiniLoaderDialog';
import * as constants from '../components/Auth/configs';
import logo2 from '../images/ZF2.png';

const Register = () => {
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [miniLoader, setMiniLoader] = useState(false);

  let { alertmsg, alertseverity, openalert, setOpenAlert } = useContext(Authcontext);

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
      admin_password: adminPassword
    };
    axios.post(`${constants.auth_api}/api/organization/signup/`, userData)
      .then(response => {
        setMiniLoader(false);
        alert('Registration was received!');
      })
      .catch(error => {
        setMiniLoader(false);
        alert('Account with similar credentials already exists!');
      });
  };

  return (
    <div className="login-container">
      <MiniLoader loading={miniLoader} loaderMsg={'Processing Registration...'} setLoading={setMiniLoader} />
      <div className="left-side">
        <form onSubmit={handleRegister} className="text-center text-dark p-3">
          <div>
            <img src={image} alt="Sample image" style={{ width: '100px' }} />
            <p className="text-center responsive-font my-3" style={{ fontSize: '14px' }}>
              Enter your details to create your account
            </p>
            <h6 className="my-2 p-2 shadow-lg">REGISTER</h6>
            <Alerts alertseverity={alertseverity} alertmsg={alertmsg} openalert={openalert} setOpenAlert={setOpenAlert} />
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
          <div className="text-center text-lg-start mt-1 row">
            <div className='col-lg-12 text-center'>
              <ButtonComponent
                type="submit"
                cssClass='e-custom-primary'
                className='mb-3 m-2'
                style={{ textTransform: 'none', fontWeight: 'lighter', width: '40%', padding: '10px' }}
                disabled={false}
              >
                Register
              </ButtonComponent>
            </div>
          </div>
          <div className="text-center">
            <small className="small mb-0">Already have an account?<br />
              <Link to={'/login'} style={{ textDecoration: 'none', color: '#2364aa' }}>Login here</Link>
            </small>
          </div>
        </form>
      </div>
      <div className="right-side">
        <div className='text-center'>
          <img className="my-3" src={logo2} alt="Loading" width="200px" />
          <p className="text-center responsive-font"><span style={{ color: "#e0fbfc" }}>The Smart way to work.</span></p>
          <img src={logo} width='350px' alt="Login Image" />
          <h5 className="text-center font-weight-italic responsive-font mb-2">
            <b>EMDS</b> Software Solution
          </h5>
          <p className="text-center font-weight-italic responsive-font mb-4">
            Manage Document-Centric Processes More Productively and Securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
