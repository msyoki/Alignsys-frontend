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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        // console.log(response.data);
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
        // console.log(response.data);
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
        // console.log("objects were found")
        // console.log(response.data)
        setViewableObjects(response.data);
      })
      .catch((error) => {
        // console.log("no viewable objects")
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
  const fetchItemData = async (objectId, objectName) => {
    setSelectedObjectName(objectName);
    setIsLoading(true);

    try {
      // Fetch data from the API
      const response = await axios.get(
        `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectId}`
      );
      const { grouped, unGrouped } = response.data;

      // Update state with fetched data
      setSelectedObjectId(objectId);
      setGroupedItems(grouped);
      setUngroupedItems(unGrouped);

      // console.log('Grouped Items:', grouped);

      // Calculate the total number of classes
      const totalClasses =
        grouped.reduce((acc, group) => acc + group.members.length, 0) +
        unGrouped.length;

      // Handle cases where there is only one class
      if (totalClasses === 1) {
        const singleClass = grouped.length > 0
          ? grouped[0].members[0]
          : unGrouped[0];

        handleClassSelection(
          singleClass.classId,
          singleClass.className,
          grouped.length > 0 ? grouped[0].classGroupId : null
        );
        closeModal();
      } else {
        // Open the data modal if multiple classes are available
        setIsDataOpen(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      // Ensure loading state is reset regardless of success or error
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
        // console.log('Templates response:', response.data);
        setTemplates(response.data);
        setTemplateModalOpen(true); // Opens the template modal
      } catch (error) {
        console.error('Error fetching templates:', error);
        await proceedNoneTemplate(); // Proceed with no templates if the request fails
      }
    };

    const proceedNoneTemplate = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${classId}`
        );
        // console.log('Class properties response:', response.data);

        setFormProperties(() => response.data); // Functional update to avoid stale values
        setFormValues(() =>
          response.data.reduce((acc, prop) => {
            acc[prop.propId] = ''; // Initialize form values
            return acc;
          }, {})
        );
        setIsFormOpen(true); // Open the form modal
      } catch (error) {
        console.error('Error fetching class properties:', error);
      } finally {
        closeDataDialog(); // Close the dialog regardless of success or failure
      }
    };

    // Check the selectedObjectId and decide which function to call
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

    const nameParts = name.split(' '); // Split the name into parts
    const firstInitial = nameParts[0] ? nameParts[0][0] : ''; // Get the first letter of the first part
    const secondInitial = nameParts[1] ? nameParts[1][0] : ''; // Get the first letter of the second part (if it exists)

    return {
      sx: {
        bgcolor: stringToColor(name), // Assuming stringToColor is defined elsewhere
      },
      children: `${firstInitial}${secondInitial}`, // Combine the initials
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
                    alt={
                      user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.first_name
                          ? user.first_name
                          : user.last_name
                            ? user.last_name
                            : user.username
                    }
                    {...stringAvatar(
                      user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.first_name
                          ? user.first_name
                          : user.last_name
                            ? user.last_name
                            : user.username
                    )}
                    sx={{
                      width: 50,
                      height: 50,
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
                 
                  {user.is_admin === "True" && (
                    <li onClick={adminPage} className="menu-item">
                      <i className="fas fa-tools" style={{ fontSize: '20px' }}></i>
                      <span style={{ fontSize: '13px' }}>Settings</span>
                    </li>
                  )}
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

