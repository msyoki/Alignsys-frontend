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
import ObjectStructureList from '../components/Modals/ObjectStructureListDialog';
import * as constants from '../components/Auth/configs'
import logo from '../images/ZF.png';
import { Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import pic from '../images/R.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faFileAlt,
  faFolderOpen,
  faTasks,
  faChartBar,
  faUser,
  faHandPointer,
  faCar,
  faFile,
  faFolder,
  faUserFriends,
  faPlus,
  faTag
} from '@fortawesome/free-solid-svg-icons';
const allIcons = {
  faFileAlt,
  faFolderOpen,
  faTasks,
  faChartBar,
  faUser,
  faCar,
  faFile,
  faFolder,
  faUserFriends,
};


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

  // 1. Context & Navigation
  const { user, authTokens, departments, logoutUser } = useContext(Authcontext);
  const navigate = useNavigate();

  // 2. State Declarations
  const [openObjectModal, setOpenObjectModal] = useState(false);
  const [viewableobjects, setViewableObjects] = useState([]);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allrequisitions, setRequisitions] = useState([]);
  const [selectedVault, setSelectedVault] = useState(null);
  const [vaultObjectsList, setVaultObjectsList] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [templateIsTrue, setTemplateIsTrue] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [selectedObjectName, setSelectedObjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [groupedItems, setGroupedItems] = useState([]);
  const [ungroupedItems, setUngroupedItems] = useState([]);
  const [isDataOpen, setIsDataOpen] = useState(false);
  const [formProperties, setFormProperties] = useState([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [value, setValue] = useState(0);
  const [isSublistVisible, setIsSublistVisible] = useState(false);
  let [docClasses, setDocClasses] = useState([]); // Document classes

  const [hoveredItem, setHoveredItem] = useState(null);

  // 3. Helper Functions / API Calls

  // Search for objects in a vault
  const searchObject = async (search, vault) => {
    try {
      const formattedString = viewableobjects.join(',\n    ');
      const response = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/Search/${vault}/${search}/${formattedString}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching requisition data:', error);
      return [];
    }
  };

  // Get objects for a selected vault
  const getVaultObjects = () => {
    const config = {
      method: 'get',
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}`,
      headers: {},
    };
    axios
      .request(config)
      .then((response) => {
        setVaultObjectsList(response.data);
        console.log(response.data);
        setOpenObjectModal(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getVaultObjects2 = () => {
    const config = {
      method: 'get',
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}`,
      headers: {},
    };
    axios
      .request(config)
      .then((response) => {
        setVaultObjectsList(response.data);
        console.log(response.data);
        toggleSublist();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getViewableObjects = () => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${constants.auth_api}/api/viewable-objects/`,
      headers: {
        'Authorization': `Bearer ${authTokens.access}`,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setViewableObjects(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Get network connection status
  function getNetworkStatus() {
    if (navigator.connection) {
      const connection = navigator.connection;
      return {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
      };
    } else {
      return {
        downlink: 10,
        effectiveType: '4g',
        rtt: 50,
      };
    }
  }

  // 4. Utility Functions

  const findBestIconMatch = (name) => {
    const nameWords = name.toLowerCase().split(' ');
    for (let iconName in allIcons) {
      for (let word of nameWords) {
        if (iconName.toLowerCase().includes(word)) {
          return allIcons[iconName];
        }
        if (
          word.toLowerCase().includes('document') ||
          word.toLowerCase().includes('invoice') ||
          word.toLowerCase().includes('Petty Cash')
        ) {
          return faFile;
        }
        if (
          word.toLowerCase().includes('staff') ||
          word.toLowerCase().includes('employee')
        ) {
          return faUser;
        }
      }
    }
    return faFolder;
  };

  // 5. Event Handlers & Toggles

  const adminPage = () => {
    navigate('/admin');
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const reloadPage = () => {
    window.location.reload();
  };

  const toggleSublist = () => {
    setIsSublistVisible(!isSublistVisible);
  };

  const closeModal = () => {
    setOpenObjectModal(false);
  };

  const closeDataDialog = () => {
    setIsDataOpen(false);
  };

  // 6. More Complex Data Fetching & Handling

  const fetchItemData = async (objectid, objectname) => {
    setSelectedObjectName(objectname);
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectid}`
      );
      setSelectedObjectId(objectid);
      setGroupedItems(response.data.grouped);
      console.log(response.data.grouped);
      setUngroupedItems(response.data.unGrouped);
      setIsLoading(false);

      const totalClasses =
        response.data.grouped.reduce(
          (acc, group) => acc + group.members.length,
          0
        ) + response.data.unGrouped.length;

      if (totalClasses === 1) {
        if (response.data.grouped.length > 0) {
          handleClassSelection(
            response.data.grouped[0].members[0].classId,
            response.data.grouped[0].members[0].className,
            response.data.grouped[0].classGroupId
          );
        } else {
          handleClassSelection(
            response.data.unGrouped[0].classId,
            response.data.unGrouped[0].className
          );
        }
        closeModal();
      } else {
        setIsDataOpen(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  const handleClassSelection = async (classId, className, classGroupId = null) => {
    setSelectedClassName(className);
    setSelectedClassId(classId);

    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/Templates/GetClassTemplate/${selectedVault.guid}/${classId}`,
          { headers: { accept: '*/*' } }
        );
        console.log(response.data);
        setTemplates(response.data);
        setTemplateModalOpen(true);
      } catch (error) {
        console.error('Error fetching templates:', error);
        proceedNoneTemplate();
      }
    };

    const proceedNoneTemplate = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${selectedClassId}`
        );
        console.log(selectedVault.guid);
        console.log(`${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${selectedClassId}`);
        setSelectedClassId(classId);
        setFormProperties(response.data);
        console.log(response.data);
        setFormValues(
          response.data.reduce((acc, prop) => {
            acc[prop.propId] = '';
            return acc;
          }, {})
        );
        setIsFormOpen(true);
      } catch (error) {
        console.error('Error fetching class properties:', error);
      } finally {
        closeDataDialog();
      }
    };

    if (selectedObjectId === 0) {
      await fetchTemplates();
    } else {
      await proceedNoneTemplate();
    }
  };

  // 7. Derived/Computed Values
  const data2 = [];
  const allrequisitionsnew = allrequisitions.sort(
    (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
  );

  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
  }

  // 8. useEffect Hooks
  useEffect(() => {
    getViewableObjects();
    getNetworkStatus();
    let vault = localStorage.getItem('selectedVault');
    setSelectedVault(JSON.parse(vault));
  }, []);

  return (
    <>
      <ObjectStructureList
        vaultObjectModalsOpen={openObjectModal}
        setVaultObjectsModal={() => setOpenObjectModal(false)}
        selectedVault={selectedVault}
        vaultObjectsList={vaultObjectsList}
        setIsDataOpen={setIsDataOpen}
        setSelectedObjectName={setSelectedObjectName}
        setIsLoading={setIsLoading}
        setGroupedItems={setGroupedItems}
        setUngroupedItems={setUngroupedItems}
        closeModal={closeModal}
        setSelectedObjectId={setSelectedObjectId}
        selectedObjectId={selectedObjectId}
        setSelectedClassId={setSelectedClassId}
        selectedClassId={selectedObjectId}
        isDataOpen={isDataOpen}
        selectedObjectName={selectedObjectName}
        isLoading={isLoading}
        groupedItems={groupedItems}
        ungroupedItems={ungroupedItems}
        handleClassSelection={handleClassSelection}
        setFormProperties={setFormProperties}
        formProperties={formProperties}
        setTemplateModalOpen={setTemplateModalOpen}
        templateModalOpen={templateModalOpen}
        setFormValues={setFormValues}
        formValues={formValues}

        closeDataDialog={closeDataDialog}
        selectedClassName={selectedClassName}
        setIsFormOpen={setIsFormOpen}
        isFormOpen={isFormOpen}
        setTemplateIsTrue={setTemplateIsTrue}
        templateIsTrue={templateIsTrue}
        templates={templates}
        setTemplates={setTemplates}



      />

      {/* <div className="dashboard">
        <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
            <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
              <span onClick={toggleSidebar} aria-label={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'} className="p-2 mx-2" style={{ display: 'flex', alignItems: 'center' }}>
                <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`} style={{ fontSize: '25px', color: '#fff' }}></i>
                {sidebarOpen && <span className='mx-2 list-text' style={{ fontSize: '14px', color: '#fff' }}>Minimize</span>}
              </span>
            </Tooltip>
          </Box>



          <ul className="text-center">
            {sidebarOpen ? (
              <>
                <li onClick={getVaultObjects} className='mt-5' >
                  <i className="fas fa-plus-circle mx-3" style={{fontSize:'20px'}}></i>
                  <span className="list-text" style={{fontSize:'13px'}}>Create</span>
                </li>
                <li onClick={adminPage}>
                  <i className="fas fa-tools mx-3" style={{fontSize:'20px'}}></i>
                  <span className="list-text" style={{fontSize:'13px'}}>Settings</span>
                </li>
               
                <li onClick={logoutUser} className='my-5'>
                  <i className="fas fa-sign-out-alt mx-3" style={{fontSize:'20px'}}></i>
                  <span className="list-text" style={{fontSize:'13px'}}>Logout</span>
                </li>
              </>
            ) : (
              <>
                <li onClick={getVaultObjects} className="closed mt-5"><i className="fas fa-plus-circle mx-3" style={{fontSize:'20px'}}></i></li>
                <li onClick={adminPage} className="closed"><i className="fas fa-tools mx-3" style={{fontSize:'20px'}}></i></li>
              
                <li  onClick={logoutUser} className="closed mt-5"><i className="fas fa-sign-out-alt mx-3" style={{fontSize:'20px'}}></i></li>
              </>
            )}
          </ul>
        </nav>




        <main className="content">
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
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
        </main>
      </div> */}
      <div className="dashboard">
        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          {/* Sidebar content */}
          <div className="sidebar-content" style={{ marginTop: '0%' }}>
            {sidebarOpen && (
              <>
                <div className='shadow-lg' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
                  <span className='p-2 mx-3'>{user.organization}</span>
                </div>
                <div className='my-2' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Avatar
                    alt={`${user.first_name} ${user.last_name}`}
                    {...stringAvatar(`${user.first_name} ${user.last_name}`)} // Pass the name correctly here
                    sx={{ 
                      width: 50, 
                      height: 50 ,   
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                      transform: 'translateZ(0)',
                      transition: 'transform 0.2s'
                    }}
                  />

                </div>
                <div className='shadow-lg' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
                  <span className='p-2 mx-3'>{user.first_name} {user.last_name}</span>
                </div>
              
                <ul className="menu-items" >
                  <li onClick={getVaultObjects2} className="menu-item" >
                    <i className="fas fa-plus-circle"></i>
                    <span style={{ fontSize: '13px' }}>Create</span>
                  </li>

                  {/* Show sublist if visible */}
                  {isSublistVisible && vaultObjectsList !== null && (
                    <ul
                      className="sublist bg-white p-3 m-0"

                      style={{
                        color: '#1C4690',
                        maxHeight: isSublistVisible ? '250px' : '0',
                        overflowY: 'auto',
                        width: '100%',
                        backgroundColor: 'red',
                        opacity: isSublistVisible ? '1' : '0',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                        transition:
                          'max-height 0.3s ease, opacity 0.3s ease, background-color 0.3s ease', // Smooth transition including background color
                      }}
                    >
                      {vaultObjectsList.map((item) => (
                        <li
                          key={item.objectid}
                          onMouseEnter={() => setHoveredItem(item.objectid)}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            padding: '15px',
                            textAlign: 'start',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s, color 0.3s', // Smooth transitions for hover effects
                            display: 'flex',
                            alignItems: 'center', // Center align the content
                            justifyContent: 'flex-start', // Align items to the start when sidebar is open
                            backgroundColor: hoveredItem === item.objectid ? '#dcdcdc' : '#fff', // Only the hovered item changes color
                          }}
                          className="p-0 my-2 sublist-item"
                          onClick={() => fetchItemData(item.objectid, item.namesingular)}
                        >
                          <FontAwesomeIcon
                            icon={findBestIconMatch(item.namesingular)}
                            style={{ fontSize: '18px' }}
                            className="text-secondary"
                          />
                          <span className="mx-2 text-dark" style={{ fontSize: '12px' }}>
                            {item.namesingular}
                          </span>
                        </li>

                      ))}

                    </ul>
                  )}

                  <li onClick={adminPage} className="menu-item">
                    <i className="fas fa-tools" style={{ fontSize: '20px' }}></i>
                    <span style={{ fontSize: '13px' }}>Settings</span>
                  </li>
                  <li onClick={logoutUser} className="menu-item" style={{ marginTop: isSublistVisible ? "0px" : "180px" }}
                  >
                    <i className="fas fa-sign-out-alt" style={{ fontSize: '20px' }} ></i>
                    <span style={{ fontSize: '13px' }}>Logout</span>
                  </li>
                </ul>
              </>
            )}
          </div>

        </nav >


        {/* Content Section */}
        < main className={`content ${sidebarOpen ? 'shifted' : 'full-width'}`
        }>
          <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
            <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
              <i style={{ fontSize: '18px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'}`} ></i>
            </div>
          </Tooltip>
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
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
        </main >
      </div >




    </>


  );
}

export default Dashboard;

