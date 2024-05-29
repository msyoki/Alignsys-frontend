import React, { useContext, useEffect, useState } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import '../styles/Navbar.css'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Link } from "react-router-dom";
import Navbar from '../components/Navbar';
import ImageAvatars from '../components/Avatar';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccordionUsage from '../components/Accordion';
import logo from "../images/ZF.png";
import axios from 'axios'
import DocumentList from '../components/DocumentList';
import ObjectStructureList from '../components/Modals/ObjectStructureList';


const baseurl = "http://41.89.92.225:5006"
const baseurldata = "http://41.92.225.149:240"
const baseurldss = "http://41.92.225.149"


const getRequisition = async (search, staff) => {
  try {
    const response = await axios.get(`${baseurldata}/api/Requisition/Search?searchphase=${search}&PayrolNumber=${staff}`);
    console.log(response.data)
    return response.data
  }
  catch (error) {
    console.error('Error fetching requisition data:', error);
    return [];

  }
}

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

  const { user, selectedVault, departments } = useContext(Authcontext);
  let [openObjectModal, setOpenObjectModal]= useState(false);
  const vaultGuid=`${JSON.parse(selectedVault).guid}`
  // const [data, setData] = useState([
  //   {
  //     objectID: 1,
  //     internalID: 1001,
  //     classID: 37,
  //     title: "Sample Document 1"
  //   },
  //   {
  //     objectID: 2,
  //     internalID: 1002,
  //     classID: 40,
  //     title: "Sample Document 2"
  //   },
  //   // Add more search results data here as needed
  // ]);
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [allrequisitions, setRequisitions] = useState([])
  // const [document, setSelectedDoc] = useState({})
  // const [isOpen, setIsOpen] = useState(false)
  // const [loading, setLoading] = useState(false)



  // const data2 = [
  //   {
  //     objectID: 11,
  //     internalID: 2001,
  //     classID: 37,
  //     title: "Sample Document 11"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"

  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   },
  //   {
  //     objectID: 12,
  //     internalID: 2002,
  //     classID: 40,
  //     title: "Sample Document 12"
  //   }
  //   // Add more created by me data here as needed
  // ];
  const data2=[

  ]


  const allrequisitionsnew = allrequisitions.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  // documentUrl, isOpen, onClose



  let [docClasses, setDocClasses] = useState([])

  const getDocClasses = async () => {
    try {
      const response = await axios.get(`http://192.236.194.251:240/api/MfilesObjects/%7BE19BECA0-7542-451B-81E5-4CADB636FCD5%7D/129`)
      setDocClasses(response.data)

    } catch (error) {
      console.error('Error fetching requisition data:', error);
    }

  }



  const getRequisitionCreatedByMe = async () => {
    try {
      const response = await axios.get(`${baseurldata}/api/Requisition/Requisition/Get/${user.staffNumber}`)
      setRequisitions(response.data)

    } catch (error) {
      console.error('Error fetching requisition data:', error);
    }
  }

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










  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // State for collapsible menu
  const { logoutUser } = useContext(Authcontext);

  const [value, setValue] = React.useState(0);
  const navigate = useNavigate()

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
    getNetworkStatus()

  })

  return (
    <>
      <ObjectStructureList vaultObjectModalsOpen={openObjectModal} setVaultObjectsModal={()=>setOpenObjectModal(false)} selectedVault={vaultGuid}/>
      <div className="dashboard bg-dark">

        <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

          <ul className='text-center' style={{ listStyleType: 'none', padding: 0, fontSize: '13px' }}>

            {sidebarOpen ?
              <>


                <li  onClick={()=>{setOpenObjectModal(true)}} className='mt-5' style={{ display: 'flex', alignItems: 'center' }}>
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
                  <i className="fas fas fa-user-shield  mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '> Admin</span>
                </li>


                <li className='mt-5' onClick={logoutUser} style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-power-off mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '>Logout</span>
                </li>
                <li className='mt-5' onClick={toggleSidebar} style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-arrow-left  mx-2" style={{ fontSize: '20px' }}></i>
                  <span className='list-text '>Hide</span>
                </li>

              </>
              : <>
                <>
 
                  <li onClick={()=>{setOpenObjectModal(true)}} className='mt-5' ><i className="fas fa-plus-circle" style={{ fontSize: '20px' }}></i> </li>
                  <li><i className="fas fa-question-circle" style={{ fontSize: '20px' }}></i></li>
                  {/* <li ><i className="fas fas fa-tools" style={{ fontSize: '20px' }}></i></li> */}
                  <li onClick={adminPage}><i className="fas fas fa-user-shield" style={{ fontSize: '20px' }}></i></li>
                  <li className='mt-5' onClick={logoutUser}><i className="fas fa-power-off" style={{ fontSize: '20px' }}></i></li>
                  <li className='mt-5' onClick={toggleSidebar}><i className="fas fa-arrow-right" style={{ fontSize: '20px' }}></i></li>
                </>
              </>}

          </ul>
          {/* <div className="toggle-button" onClick={toggleSidebar}>
    {sidebarOpen ? 'Hide' : 'Show'}
  </div> */}
        </div>
        <div className="content" style={{ height:'100vh',overflowY:'scroll'}}>
          <DocumentList
            searchTerm={searchTerm}
            data={data}
            data2={data2}
   
            selectedVault={selectedVault}
            setData={setData}
            getRequisition={getRequisition}
            setSearchTerm={setSearchTerm}
            user={user}
            departments={departments}
      
            docClasses={docClasses}
            allrequisitions={allrequisitions}
            logoutUser={logoutUser}
            setOpenObjectModal={setOpenObjectModal}
    
          />
        </div>
      </div>
    </>


  );
}

export default Dashboard;

