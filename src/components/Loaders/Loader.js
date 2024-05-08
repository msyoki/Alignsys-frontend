import React from "react";
import loading from "../../images/loading.svg";
import logo from "../../images/ZF.png";
import '../../styles/Loader.css'

const Loading = () => (
  <div className='loading d-flex justify-content-center main-loader' style={{margin:'10%'}} >
 
    <img src={logo} alt="logo" width='50px'  />
    <br/>
    <img className="spinner" src={loading} alt="Loading" width='100px ' />
    <p className="mt-2" style={{fontSize:'12.5px'}}>Please wait, loading resources ...</p>
   
  </div>
  
);

export default Loading;