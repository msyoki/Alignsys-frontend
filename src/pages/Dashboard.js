import React, { useContext, useEffect, useState } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import '../styles/Navbar.css'

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import axios from 'axios'
import DashboardContent from '../components/MainComponents/DashboardContent';
import ObjectStructureList from '../components/Modals/ObjectStructureList';
import * as constants from '../components/Auth/configs'




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

  const { user,authTokens, departments } = useContext(Authcontext);
  let [openObjectModal, setOpenObjectModal] = useState(false);
  const [viewableobjects,setViewableObjects]=useState([]);

  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [allrequisitions, setRequisitions] = useState([])
  const [selectedVault, setSelectedVault] = useState(null)
  const [vaultObjectsList, setVaultObjectsList] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for collapsible menu
  const { logoutUser } = useContext(Authcontext);

  const [value, setValue] = React.useState(0);
  const navigate = useNavigate()

  const searchObject = async (search, vault) => {
    try {
      const array = viewableobjects;
      const formattedString = array.join(',\n    ');
     
      const response = await axios.get(`${constants.mfiles_api}/api/objectinstance/Search/${vault}/${search}/${formattedString}`);
    
      return response.data
    }
    catch (error) {
      console.error('Error fetching requisition data:', error);
      return [];
  
    }
  }


  const getVaultObjects = () => {
   
    let config = {
      method: 'get',
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}`,
      headers: {}
    };

    axios.request(config)
      .then((response) => {
        setVaultObjectsList(response.data);
        setOpenObjectModal(true)
    
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const data2 = [

  ]


  const allrequisitionsnew = allrequisitions.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  // documentUrl, isOpen, onClose



  let [docClasses, setDocClasses] = useState([])


  function getNetworkStatus() {
    if (navigator.connection) {
      const connection = navigator.connection;
      return {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
      };
    } else {
      // Fallback method: For example, assuming good connection if API is not available
      return {
        downlink: 10,
        effectiveType: '4g',
        rtt: 50,
      };
    }
  }



  const getViewableObjects = ()=>{
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${constants.auth_api}/api/viewable-objects/`,
      headers: { 
        'Authorization': `Bearer ${authTokens.access}`
      }
    };
    
    axios.request(config)
    .then((response) => {
      setViewableObjects(response.data)
     
    })
    .catch((error) => {
      console.log(error);
    });
    

  }


  const adminPage = () => {
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
  useEffect(() => {
    getViewableObjects()
    getNetworkStatus()
    let vault = localStorage.getItem('selectedVault')
    setSelectedVault(JSON.parse(vault));

  }, []);

  return (
    <>

      <ObjectStructureList vaultObjectModalsOpen={openObjectModal} setVaultObjectsModal={() => setOpenObjectModal(false)} selectedVault={selectedVault} vaultObjectsList={vaultObjectsList} />
      <div className="dashboard bg-dark">

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

          <ul className='text-center' style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }}>

            {sidebarOpen ?
              <>


                <li onClick={getVaultObjects} className='mt-5' style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-plus-circle  mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text  '>Create</span>
                </li>



                <li style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-question-circle  mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '>Manual</span>
                </li>
                {/* <li style={{ display: 'flex', alignItems: 'center' }} >
                  <i className="fas fas fa-tools  mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '> Settings</span>
                </li> */}
                <li style={{ display: 'flex', alignItems: 'center' }} onClick={adminPage} >
                  <i className="fas fas fa-user-shield mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '> Admin</span>
                </li>


                <li className='mt-5' onClick={logoutUser} style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-power-off mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '>Logout</span>
                </li>
                <li className='mt-5' onClick={toggleSidebar} style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-chevron-left  mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '>Hide</span>
                </li>

              </>
              : <>
                <>

                  <li onClick={getVaultObjects} className='mt-5' ><i className="fas fa-plus-circle" style={{ fontSize: '20px' }}></i> </li>
                  <li><i className="fas fa-question-circle" style={{ fontSize: '20px' }}></i></li>
                  {/* <li ><i className="fas fas fa-tools" style={{ fontSize: '20px' }}></i></li> */}
                  <li onClick={adminPage}><i className="fas fas fa-user-shield" style={{ fontSize: '20px' }}></i></li>
                  <li className='mt-5' onClick={logoutUser}><i className="fas fa-power-off" style={{ fontSize: '20px' }}></i></li>
                  <li className='mt-5' onClick={toggleSidebar}><i className="fas fa-chevron-right" style={{ fontSize: '20px' }}></i></li>
                </>
              </>}

          </ul>
          {/* <div className="toggle-button" onClick={toggleSidebar}>
    {sidebarOpen ? 'Hide' : 'Show'}
  </div> */}
        </div>
        <div className="content" style={{ height:'100vh',overflowY: 'scroll' }}>
          <DashboardContent
            searchTerm={searchTerm}
            data={data}
            data2={data2}

            getVaultObjects={getVaultObjects}
            setData={setData}
            searchObject={searchObject}
            setSearchTerm={setSearchTerm}
            user={user}
            departments={departments}

            docClasses={docClasses}
            allrequisitions={allrequisitions}
            logoutUser={logoutUser}
            selectedVault={selectedVault}
            viewableobjects={viewableobjects}
         


          />
        </div>
      </div>
    </>


  );
}

export default Dashboard;

