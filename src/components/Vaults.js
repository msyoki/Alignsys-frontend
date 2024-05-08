import React,{useContext} from 'react';
import Authcontext from './Auth/Authprovider';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import { ButtonComponent  } from '@syncfusion/ej2-react-buttons';
import {  useNavigate } from "react-router-dom";

const Vaults = () => {
  const {logoutUser}=useContext(Authcontext)
  const navigate=useNavigate()
  const  dashboard = ()=>{
    
    navigate('/dashboard')
  }
  return (
    <div className="container ">
    <div className="content ">
      <h3>Organization Vault(s)</h3>
      <p>Please select vault below!</p>
      <div className='text-center my-3'>
        <ButtonComponent  onClick={dashboard}    className='my-2' style={{textTransform: 'none',fontWeight:'lighter',width:'70%',padding:'10px'}} disabled={false}> Techedge</ButtonComponent>
    </div>
      <button   onClick={logoutUser}class="btn btn-danger btn-sm">Logout</button>
      {/* <ButtonComponent onClick={logoutUser} cssClass='e-custom-warning'  className='my-4' style={{textTransform: 'none',fontWeight:'lighter',width:'40%',padding:'10px'}} disabled={false}><i className='fas fa-logout'></i> Logout </ButtonComponent>
    */}
    </div>
  </div>
  
  );
};

export default Vaults;
