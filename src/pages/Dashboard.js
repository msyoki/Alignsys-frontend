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
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import axios from 'axios'
import DashboardContent from '../components/MainComponents/DashboardContent';
import ObjectStructureList from '../components/Modals/ObjectStructureListDialog';
import * as constants from '../components/Auth/configs'
import logo from '../images/TechEdgeLogo.png';
import { Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import pic from '../images/R.png'
import { useLocation } from 'react-router-dom';

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
import TimedAlert from '../components/TimedAlert';
import VaultSelectForm from '../components/SelectVault';
import NetworkIcon from '../components/NetworkStatus';
import MiniLoader from '../components/Modals/MiniLoaderDialog';
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
  const location = useLocation();
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
  const [recentData, setRecentData] = useState([]);
  const [assignedData, setAssignedData] = useState([]);

  const [deletedData, setDeletedData] = useState([]);

  const [alertOpen, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [mfilesId, setMfilesId] = useState(null);
  const [loadingDialog, setLoadingDialog] = useState(false)

  const [hoveredItem, setHoveredItem] = useState(null);

  // 3. Helper Functions / API Calls

  // Search for objects in a vault
  const searchObject = async (search, vault) => {

    try {
      const formattedString = viewableobjects.join(',\n    ');
      const response = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/Search/${vault}/${search}/${mfilesId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching requisition data:', error);
      return [];
    }
  };

  const getRecent = async () => {

    try {

      const response = await axios.get(
        `${constants.mfiles_api}/api/Views/GetRecent/${selectedVault.guid}/${mfilesId}`
      );
      console.log(response.data)
      setRecentData(response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching requisition data:', error);
      return [];
    }
  }

  const getDeleted = async () => {

    try {

      const response = await axios.get(
        `${constants.mfiles_api}/api/ObjectDeletion/GetDeletedObject/${selectedVault.guid}/${mfilesId}`
      );
      console.log(`Deleted: `)
      console.log(`${constants.mfiles_api}/api/ObjectDeletion/GetDeletedObject/${selectedVault.guid}/${mfilesId}`)
      console.log(response.data)
      setDeletedData(response.data)
      return response.data;
    } catch (error) {
      console.log(`${constants.mfiles_api}/api/ObjectDeletion/GetDeletedObject/${selectedVault.guid}/${mfilesId}`)
      console.error('Error fetching requisition data:', error);
      return [];
    }
  }

  const getAssigned = async () => {


    try {

      const response = await axios.get(
        `${constants.mfiles_api}/api/Views/GetAssigned/${selectedVault.guid}/${mfilesId}`
      );
      console.log(response.data)
      setAssignedData(response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching requisition data:', error);
      return [];
    }
  }



  // Get objects for a selected vault
  const getVaultObjects = () => {
    const config = {
      method: 'get',
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}/${mfilesId}`,
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
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}/${mfilesId}`,
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




  const getVaultId = async (guid) => {

    let data = JSON.stringify({
      "user_id": user.id,
      "guid": guid
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${constants.auth_api}/api/vaultid/`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(response.data);
        console.log(response.data.mfilesID)
        setMfilesId(response.data.mfilesID)
      })
      .catch((error) => {
        console.log(error);
      });

  }


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
        `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectId}/${mfilesId}`
      );
      const { grouped, unGrouped } = response.data;

      // Update state with fetched data
      setSelectedObjectId(objectId);
      setGroupedItems(grouped);
      console.log(grouped)
      setUngroupedItems(unGrouped);
      console.log(unGrouped)

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
          objectId,

        );
        // closeModal();
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

  const handleClassSelection = async (classId, className, objectId) => {
    setLoadingDialog(true)
    setSelectedClassName(className);
    setSelectedClassId(classId);
    setSelectedObjectId(objectId)

    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/Templates/GetClassTemplate/${selectedVault.guid}/${classId}`,
          { headers: { accept: '*/*' } }
        );
        // console.log('Templates response:', response.data);

        setTemplates(response.data);
        setTemplateModalOpen(true); // Opens the template modal
        setLoadingDialog(false)
      } catch (error) {
        console.error('Error fetching templates:', error);
        await proceedNoneTemplate(); // Proceed with no templates if the request fails
      }
    };

    const proceedNoneTemplate = async () => {
      setLoadingDialog(true)
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${objectId}/${classId}/${mfilesId}`
        );
        console.log('Class properties response:', response.data);

        setFormProperties(() => response.data); // Functional update to avoid stale values
        setFormValues(() =>
          response.data.reduce((acc, prop) => {
            acc[prop.propId] = ''; // Initialize form values
            return acc;
          }, {})
        );

        setIsFormOpen(true); // Open the form modal
        setLoadingDialog(false)

      } catch (error) {
        setLoadingDialog(false)
        console.error('Error fetching class properties:', error);
      } finally {
        setLoadingDialog(false)
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
      children: `${firstInitial}${secondInitial}`, // Combine the initials
    };
  }


  // 8. useEffect Hooks
  useEffect(() => {
    // Initial setup: get viewable objects, network status, and selected vault
    getViewableObjects();
    getNetworkStatus();

    const vault = localStorage.getItem('selectedVault');
    if (vault) {
      setSelectedVault(JSON.parse(vault));
      getVaultId(JSON.parse(vault).guid)

    }

    if (location.state?.openalert) {
      setOpenAlert(true);
      setAlertMsg(location.state.alertMsg);
      setAlertSeverity(location.state.alertSeverity);
    }
  }, []); // Runs only once on mount

  // Call getRecent and getAssigned whenever selectedVault changes
  useEffect(() => {
    if (selectedVault) {
      getVaultId(selectedVault.guid)
    }
  }, [selectedVault]); // Runs whenever selectedVault updates


  useEffect(() => {
    if (selectedVault) {
      getVaultObjects2();
      getRecent();
      getAssigned();
      getDeleted();
    }
  }, [selectedVault, mfilesId]); // Runs whenever selectedVault updates


  const resetViews = () => {
    getRecent();
    getAssigned();
    getDeleted();
  }

  return (
    <>
      <TimedAlert
        open={alertOpen}
        onClose={setOpenAlert}
        severity={alertSeverity}
        message={alertMsg}
        setSeverity={setAlertSeverity}
        setMessage={setAlertMsg}
      />

      <ObjectStructureList
        loadingDialog={loadingDialog}
        setLoadingDialog={setLoadingDialog}
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
        selectedClassId={selectedClassId}
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
        user={user}
        mfilesId={mfilesId}




      />

      <div className="dashboard">
        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? "open" : "closed"} `}>
          <div className="sidebar-content">
            {sidebarOpen && (
              <>
                {/* Logo Section */}
                <div
                  className="d-flex flex-column justify-content-center align-items-center  bg-white shadow-lg"
                  style={{
                    height: "60px", // Fixed height (adjust as needed)
                    minHeight: "61px", // Prevent shrinking
                    maxHeight: "61px", // Prevent expansion
                    overflow: "hidden", // Prevent content from affecting height
                  }}
                >
                  <img
                    src={logo}
                    alt="Organization logo"
                    className="logo"
                    style={{
                      width: "auto",
                      maxWidth: "80%",
                      maxHeight: "48px",
                      objectFit: "contain",
                    }}
                  />
                </div>


                {/* Menu Items */}
                <ul className="menu-items">
                  <li
                    onClick={getVaultObjects2}
                    className="menu-item main-li shadow-lg"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 15px",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i className="fas fa-plus-circle" style={{ fontSize: "18px" }}></i>
                      <span style={{ fontSize: "14px" }}>Create</span>
                    </div>
                    <i
                      className={`fas ${isSublistVisible ? "fa-angle-up" : "fa-angle-down"}`}
                      style={{ transition: "transform 0.3s ease-in-out" }}
                    ></i>
                  </li>

                  {/* Sublist with Smooth Animation */}
                  <List
                    dense
                    disablePadding
                    className="shadow-lg"
                    sx={{
                      color: "#fff",
                      maxHeight: isSublistVisible ? "280px" : "0",
                      overflowY: "auto",
                      width: "100%",
                      opacity: isSublistVisible ? "1" : "0",
                      transition: "max-height 0.4s ease, opacity 0.3s ease",
                      padding: isSublistVisible ? "10px 20px" : "0",
                      backgroundColor: "#2757aa",

                      // Move scrollbar to the left
                      direction: "rtl",

                      // Keep content aligned normally
                      "& *": {
                        direction: "ltr",
                      },

                      // Modern Scrollbar Styling (ChatGPT-like)
                      "&::-webkit-scrollbar": {
                        width: "3px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "rgba(255, 255, 255, 0.15)",
                        borderRadius: "10px",
                        boxShadow: "inset 0 0 5px rgba(255, 255, 255, 0.2)", // Subtle glow effect
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "rgba(255, 255, 255, 0.6)",
                        borderRadius: "10px",
                        minHeight: "25px",
                        transition: "background 0.3s",
                        border: "2px solid rgba(255, 255, 255, 0.2)", // Outline effect
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        background: "#ffffff",
                        boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
                      },

                      // Scrollbar Arrows (like ChatGPT)
                      "&::-webkit-scrollbar-button:single-button": {
                        display: "block",
                        height: "10px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-button:single-button:hover": {
                        background: "rgba(255, 255, 255, 0.4)",
                      },

                      // Up arrow
                      "&::-webkit-scrollbar-button:single-button:vertical:decrement": {
                        backgroundImage:
                          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"><path d=\"M7 14l5-5 5 5H7z\"/></svg>')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      },

                      // Down arrow
                      "&::-webkit-scrollbar-button:single-button:vertical:increment": {
                        backgroundImage:
                          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"><path d=\"M7 10l5 5 5-5H7z\"/></svg>')",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      },
                    }}
                  >


                    {isSublistVisible &&
                      vaultObjectsList !== null &&
                      vaultObjectsList
                        .filter((item) => item.userPermission?.attachObjectsPermission)
                        .map((item) => (
                          <ListItem
                            key={item.objectid}
                            onMouseEnter={() => setHoveredItem(item.objectid)}
                            onMouseLeave={() => setHoveredItem(null)}
                            onClick={() => fetchItemData(item.objectid, item.namesingular)}
                            sx={{
                              textAlign: "start",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              backgroundColor: hoveredItem === item.objectid ? "#e0fbfc" : "#2757aa",
                              color: hoveredItem === item.objectid ? "#555" : "#fff",
                              py: 0,
                              px: 1, // Reduced padding
                              margin: "2px 0", // Smaller margin
                              height: "22px", // Reduced height for a compact look
                              boxShadow: hoveredItem === item.objectid ? "0px 2px 5px rgba(0, 0, 0, 0.1)" : "none",
                            }}
                            className="shadow-lg"
                          >
                            <ListItemText
                              primary={item.namesingular}
                              primaryTypographyProps={{ fontSize: "10px" }} // Smaller text size
                              sx={{ margin: 0, padding: 0, fontWeight: "bolder" }}
                            />
                          </ListItem>

                        ))}
                  </List>
                </ul>

                {/* Bottom Buttons */}
                <div>
                  <ul className="bottom-buttons">
                    {user.is_admin === "True" && (
                      <li onClick={adminPage} className="menu-item main-li shadow-lg">
                        <i className="fas fa-user-shield" style={{ fontSize: "18px" }}></i>
                        <span style={{ fontSize: "14px" }}>Admin</span>
                      </li>
                    )}
                    <li onClick={logoutUser} className="menu-item main-li shadow-lg">
                      <i className="fas fa-sign-out-alt" style={{ fontSize: "18px" }}></i>
                      <span style={{ fontSize: "14px" }}>Logout</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </nav>



        {/* Content Section */}
        < main className={`content ${sidebarOpen ? 'shifted' : 'full-width'}`
        }>
          <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
            <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
              <i style={{ fontSize: '16px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'} mx-2`} ></i>
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
            recentData={recentData}
            setRecentData={setRecentData}
            getRecent={getRecent}
            mfilesId={mfilesId}

            assignedData={assignedData}
            setAssignedData={setAssignedData}
            getAssigned={getAssigned}
            deletedData={deletedData}
            resetViews={resetViews}
            stringAvatar={stringAvatar}
          />
        </main >
      </div >




    </>


  );
}

export default Dashboard;
