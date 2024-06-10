import React, { useState,useContext } from 'react';
import axios from 'axios';
import '../styles/Login.css'; // Import CSS file for styling
import logo from '../images/m.png'
import Authcontext from '../components/Auth/Authprovider';
import '../styles/Custombuttons.css'
import { ButtonComponent  } from '@syncfusion/ej2-react-buttons';
import { Link ,useLocation} from "react-router-dom";
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import KeyIcon from '@mui/icons-material/Key';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import * as constants from '../components/Constants'
import Alerts from '../components/Alert';
import image from '../images/logo2.png'

import Logo from '../images/m.png'

const Login = () => {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  let {loginUser,alertmsg,alertseverity,openalert,setOpenAlert,setAlertMsg,setAlertSeverity}= useContext(Authcontext)

  let togglep=()=>{
    let input_type=document.getElementById('password').type;
    if(input_type === 'password'){
      document.getElementById('password').type='text'
      document.getElementById('togglePassword').className='fas fa-eye ml-2'
    }
    else{
      document.getElementById('password').type='password'
      document.getElementById('togglePassword').className='fas fa-eye-slash ml-2'
    }
  }

  return (
    <div className="login-container d-flex justify-content-center align-items-center">
    <div className="left-side bg-white d-flex justify-content-center align-items-center" style={{ height: '100vh', width: '50%' }}>
      <form onSubmit={loginUser} className="text-center text-dark p-3">
        <div>
       {/* <p className="text-center responsive-font"><span >The Smart way to work. </span></p> */}
          <img src={image} alt="Sample image" style={{ width: '160px' }} />
          
          <h6 className="my-3 p-2 shadow-lg">SIGN IN</h6>
          <p className="text-center responsive-font my-2" style={{fontSize:'13px'}}><span  className='mx-1'>Welcome to</span> <b  style={{ color: "#e76f51" }}>ZEN</b>Files</p>
     
        </div>
        <Alerts alertseverity={alertseverity} alertmsg={alertmsg} openalert={openalert} setOpenAlert={setOpenAlert} />
        <div className="form-group my-2">
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="email">Email*</InputLabel>
            <Input
              style={{ fontSize: '14px' }}
              id="email"
              startAdornment={<InputAdornment position="start"><PersonIcon /></InputAdornment>}
              name="email"
              placeholder="User email address"
              type='email'
              required
            />
          </FormControl>
        </div>
        <div className="form-group my-2">
          <FormControl variant="standard" fullWidth>
            <InputLabel htmlFor="password">Password*</InputLabel>
            <Input
              style={{ fontSize: '14px' }}
              id="password"
              type='password'
              placeholder="User password"
              name="password"
              required
              startAdornment={<InputAdornment position="start"><KeyIcon /></InputAdornment>}
              endAdornment={<InputAdornment position="end"><i onClick={togglep} className="fas fa-eye-slash" id="togglePassword"></i></InputAdornment>}
            />
          </FormControl>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <p className='small'><a href={`${constants.apiurl}/api/reset_password/`} style={{ textDecoration: 'none', color: 'black' }}>Forgot password?</a></p>
        </div>
   
        <div className="text-center text-lg-start mt-1 row">
            <div className='col-lg-12 text-center'>
              <ButtonComponent type="submit" cssClass='e-custom-primary' className='mb-3 m-2' style={{ textTransform: 'none', fontWeight: 'lighter', width: '40%', padding: '10px' }} disabled={false}> Login</ButtonComponent>
            </div>
          </div>
        <small className="small mb-0">Don't have an account?<br />Register your <Link to={'/register'} style={{ textDecoration: 'none', color: '#2364aa' }}>Organization account</Link> </small>
      </form>
    </div>
    <div className="right-side " style={{ height: '100vh', width: '50%' }}>
      <div className='text-center'>
        <h3 className="text-center mt-2"><b style={{ color: "#ee6c4d" }}>ZEN</b>Files</h3>
        <p className="text-center responsive-font"><span style={{ color: "#e0fbfc" }}>The Smart way to work. </span></p>
        <img src={logo} width='350px' alt="Login Image" />
        <h5 className="text-center font-weight-italic responsive-font mb-2"><b>EMDS </b> Software Solution  </h5>
        <p className="text-center font-weight-italic responsive-font mb-4">Manage Document-Centric Processes More Productively and Securely </p>
      </div>
    </div>
  </div>
  
  );
  
};

export default Login;
