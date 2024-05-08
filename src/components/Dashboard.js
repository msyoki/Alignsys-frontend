import React, { useContext, useEffect, useState } from 'react';
import Authcontext from './Auth/Authprovider';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import '../styles/Navbar.css'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Link } from "react-router-dom";
import Navbar from './Navbar';
import ImageAvatars from './Avatar';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccordionUsage from './Accordion';
import logo from "../images/ZF.png";



function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;


  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for collapsible menu
  const { logoutUser } = useContext(Authcontext);

  const [value, setValue] = React.useState(0);
  const navigate=useNavigate()

  const adminPage=()=>{
    navigate('/admin')
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  useEffect(()=>{
    
  })

  return (
    <div className="dashboard">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <img className=' mb-4' src={logo} alt="logo" width='100%' /> 
        <ul className='text-center' style={{listStyleType: 'none', padding: 0,fontSize:'13px' }}> 
      
          {sidebarOpen ?
            <>
       
        
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-plus-circle  mx-2" style={{ fontSize: '20px' }}></i>
                <span className='list-text  '>Create</span>
              </li>
              <li onClick={toggleSidebar} style={{  display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-arrow-left  mx-2" style={{ fontSize: '20px' }}></i>
                <span className='list-text '>Hide</span>
              </li>
          
     
            
              <li className='mt-5' style={{ display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-question-circle  mx-2" style={{ fontSize: '20px' }}></i>
                <span className='list-text '>Manual</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }} onClick={adminPage} >
                <i className="fas fas fa-tools  mx-2" style={{ fontSize: '20px' }}></i>
                <span className='list-text '>Vault Settings</span>
              </li>
           
              <li  onClick={logoutUser} style={{ display: 'flex', alignItems: 'center'}}>
                <i className="fas fa-power-off mx-2" style={{ fontSize: '25px' }}></i>
                <span className='list-text '>Logout</span>
              </li>
            </>
            : <>
              <>
            
                <li ><i class="fas fa-plus-circle" style={{ fontSize: '20px' }}></i> </li>
              
                 <li  onClick={toggleSidebar}><i class="fas fa-arrow-right" style={{ fontSize: '20px' }}></i></li>
           
       
                <li className='mt-5'><i class="fas fa-question-circle" style={{ fontSize: '20px' }}></i></li>
                <li onClick={adminPage}><i class="fas fas fa-tools"  style={{ fontSize: '20px' }}></i></li>
               
                <li  onClick={logoutUser}><i class="fas fa-power-off" style={{ fontSize: '20px' }}></i></li>
             
              </>
            </>}

        </ul>
        {/* <div className="toggle-button" onClick={toggleSidebar}>
          {sidebarOpen ? 'Hide' : 'Show'}
        </div> */}
      </div>
      <div className="content">
        {/* Navbar with collapsible menu */}
        {/* <nav className="navbar">
          <div className="navbar-header">
            <div className="navbar-toggle" onClick={toggleMenu}>
              <span className="bar">=</span>
              <span className="bar">=</span>
              <span className="bar">=</span>
            </div>
          </div>
          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li>Home</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </div>
        </nav> */}
      
      <div className=' d-flex justify-content-end'>
          <p className='mx-3' style={{fontSize:'12.5px'}}><i class="fas fa-user text-dark mx-2"></i>Musyoki Mutua </p>
       
          <p className='mx-3'> <i class="fas fa-power-off" onClick={logoutUser} style={{ fontSize: '25px' }}></i></p>

        </div>

        <div className="columns">
          <div className="column shadow-lg" style={{ height: '85vh' }}>
          {/* <div className='container d-flex justify-content-end '>
       
          <p ><i class="fas fa-layer-group text-dark mx-2" style={{ fontSize: '20px' }}></i> Techedge </p>
      
          <p><i class="fas fa-plus-circle mx-2" style={{ fontSize: '30px' }}></i></p>
      
      

        </div> */}
        <p style={{ fontSize: '12.5px' }}><i class="fas fa-layer-group text-dark mx-2" ></i> Techedge Vault </p>
            <form  >
              {/* <h6 className=' mx-4 my-3'>Procurement File Management Portal</h6>

            <small className='my-2 mx-4'>Create, Search Requisition & Attached Docs </small> */}

              <div className="input-group d-flex " >
                <input

                  className="form-control form-control-sm"
                  type="text"
                  required
                  placeholder="Enter Search term"
                // value={props.searchTerm}
                // onChange={(e) => props.setSearchTerm(e.target.value)}
                />
                <button className="btn  btn-sm text-dark " style={{ backgroundColor: '#f6ae2d' }} type="submit">
                  <i className="fas fa-search"></i> Search
                </button>
                <button className="btn  btn-sm btn-primary mx-2"  >
                  <i class="fas fa-plus-circle" style={{ fontSize: '20px' }}></i> Create
                </button>
              </div>
            </form>
            <p className='mx-2 my-3'>Search Results: </p>
            <AccordionUsage />
          </div>
          <div className="column shadow-lg">
   

            <div className='text-dark'>
              <Box sx={{ width: '100%' ,fontSize:'12px'}}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Metadata" {...a11yProps(0)} >Metadata</Tab>
                    <Tab label="Preview"  {...a11yProps(1)} >Metadata</Tab>

                  </Tabs>
                </Box>

                <CustomTabPanel value={value} index={0}>
                  Metadata
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <iframe
                    src="http://localhost:8000/api/preview/"
                    width="100%"
                    height="600"
                    frameborder="0"
                    scrolling="no"
                  ></iframe>
                </CustomTabPanel>

              </Box>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

