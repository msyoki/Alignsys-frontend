import React, { useState, useContext } from 'react';
import axios from 'axios';
import '../styles/Login.css';
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
import PersonIcon from '@mui/icons-material/Person';
import * as constants from '../components/Auth/configs';
import Alerts from '../components/Alert';
import image from '../images/ZFBLU.webp';
import logo2 from '../images/ZFWHITE.webp';
import TimedAlert from '../components/TimedAlert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');




  const {
    loginUser, openAlert,
    setOpenAlert, setAlertMsg, setAlertSeverity, alertMsg, alertSeverity
  } = useContext(Authcontext);




  const togglePasswordVisibility = () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.className = 'fas fa-eye ml-2';
    } else {
      passwordInput.type = 'password';
      toggleIcon.className = 'fas fa-eye-slash ml-2';
    }
  };

  return (
    <>

      <TimedAlert
        open={openAlert}
        onClose={setOpenAlert}
        severity={alertSeverity}
        message={alertMsg}
        setSeverity={setAlertSeverity}
        setMessage={setAlertMsg}
      />
      <div className="login-container">

        <div className="left-side">
          <form onSubmit={loginUser} className="text-center text-dark p-3">
            <div>
              <img src={image} alt="Sample logo" style={{ width: '200px' }} />
              {/* <p className="text-center responsive-font my-3" style={{ fontSize: '14px' }}>
        Welcome back
      </p> */}
              <h6 className="my-3 p-2 shadow-lg">SIGN IN</h6>

            </div>




            <div className="form-group my-2">
              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="email">Username*</InputLabel>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  required
                  placeholder="Username"
                  startAdornment={<InputAdornment position="start"><PersonIcon /></InputAdornment>}
                  style={{ fontSize: '14px' }}
                />
              </FormControl>
            </div>

            <div className="form-group my-2">
              <FormControl variant="standard" fullWidth>
                <InputLabel htmlFor="password">Password*</InputLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="User password"
                  startAdornment={<InputAdornment position="start"><KeyIcon /></InputAdornment>}
                  endAdornment={
                    <InputAdornment position="end">
                      <i
                        onClick={togglePasswordVisibility}
                        className="fas fa-eye-slash"
                        id="togglePassword"
                      ></i>
                    </InputAdornment>
                  }
                  style={{ fontSize: '14px' }}
                />
              </FormControl>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <p className="small">
                {/* <a
                  href={`${constants.auth_api}/api/reset_password/`}
                  style={{ textDecoration: 'none', color: 'black' }}
                > */}
                  Forgot password?
                {/* </a> */}
              </p>
            </div>

            <div className="text-center text-lg-start mt-1 row">
              <div className="col-lg-12 text-center">
                <ButtonComponent
                  type="submit"
                  cssClass="e-custom-primary"
                  className="mb-3 m-2"
                  style={{ textTransform: 'none', fontWeight: 'lighter', width: '40%', padding: '10px' }}
                  disabled={false}
                >
                  Login
                </ButtonComponent>
              </div>
            </div>

          </form>
        </div>

        <div className="right-side" style={{ backgroundColor: '#007bff', textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', height: '100vh' }}>
          <div className="text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>

            <img className="" src={logo2} alt="Loading" width="400px" />
            <p className="text-center font-weight-italic responsive-font mb-2 mt-4">
              <span>EDMS</span> Software Solution
            </p>
          </div>
         
          <div className="text-center" style={{ marginTop: 'auto' }}>
            {/* <h5 className="text-center font-weight-italic responsive-font mb-2 mt-5">
              <b>EMDS</b> Software Solution
            </h5>
            <p className="text-center font-weight-italic responsive-font mb-4">
              Streamline Document-Centric Processes with Efficiency and Security
            </p> */}

          </div>
        </div>



      </div>
    </>

  );
};

export default Login;
