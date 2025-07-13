import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Custombuttons.css';
import '../styles/Navbar.css';
import PropTypes from 'prop-types';
import { Box, Tooltip, Avatar, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import DashboardContent from '../components/MainComponents/DashboardContent';
import NewObjectDialog from '../components/Modals/NewObjectDialog';
import * as constants from '../components/Auth/configs';
import logo from '../images/TechEdgeLogo.png';
import TimedAlert from '../components/TimedAlert';
import MiniLoader from '../components/Modals/MiniLoaderDialog';

import {
  faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile,
  faFolder, faUserFriends, faPlus, faTag
} from '@fortawesome/free-solid-svg-icons';

const allIcons = {
  faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends,
};

// Custom hook for session storage
function useSessionState(key, defaultValue) {
  const getInitialValue = () => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === null || stored === 'undefined') return defaultValue;
      return JSON.parse(stored);
    } catch (e) {
      console.warn(`Failed to parse sessionStorage item for key "${key}":`, e);
      return defaultValue;
    }
  };
  const [value, setValue] = useState(getInitialValue);
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Failed to save sessionStorage item for key "${key}":`, e);
    }
  }, [key, value]);
  return [value, setValue];
}

// Sidebar Menu Component
const SidebarMenu = React.memo(({
  sidebarOpen,
  isSublistVisible,
  toggleSublist,
  vaultObjectsList,
  hoveredItem,
  setHoveredItem,
  fetchItemData,
  user,
  adminPage,
  logoutUser
}) => {
  const filteredVaultObjects = useMemo(() =>
    vaultObjectsList?.filter(item => item.userPermission?.attachObjectsPermission) || [],
    [vaultObjectsList]
  );

  if (!sidebarOpen) return null;

  return (
    <div className="sidebar-content">
      {/* Logo Section */}
      <div
        className="d-flex flex-column justify-content-center align-items-center bg-white shadow-lg"
        style={{
          height: "58px",
          minHeight: "56px",
          maxHeight: "56px",
          overflow: "hidden",
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
          onClick={toggleSublist}
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

        {/* Sublist */}
        <SubList
          isVisible={isSublistVisible}
          items={filteredVaultObjects}
          hoveredItem={hoveredItem}
          setHoveredItem={setHoveredItem}
          fetchItemData={fetchItemData}
        />

        {user.is_admin === "True" && (
          <li onClick={adminPage} className="menu-item main-li shadow-lg">
            <i className="fas fa-user-shield" style={{ fontSize: "18px" }}></i>
            <span style={{ fontSize: "14px" }}>Administration</span>
          </li>
        )}
      </ul>

      {/* Bottom Buttons */}
      <div>
        <ul className="bottom-buttons">
          <li onClick={logoutUser} className="menu-item main-li shadow-lg">
            <i className="fas fa-sign-out-alt" style={{ fontSize: "18px" }}></i>
            <span style={{ fontSize: "14px" }}>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

// SubList Component
const SubList = React.memo(({ isVisible, items, hoveredItem, setHoveredItem, fetchItemData }) => (
  <List
    dense
    disablePadding
    sx={{
      color: "#fff",
      maxHeight: isVisible ? "350px" : "0",
      overflowY: "auto",
      width: "100%",
      opacity: isVisible ? "1" : "0",
      transition: "max-height 0.4s ease, opacity 0.3s ease",
      padding: isVisible ? "10px 20px" : "0",
      backgroundColor: "#ecf4fc",
      borderRight: "1px solid #2757aa",
      direction: "rtl",
      "& *": { direction: "ltr" },
      "&::-webkit-scrollbar": { width: "3px" },
      "&::-webkit-scrollbar-track": {
        background: "rgba(255, 255, 255, 0.15)",
        borderRadius: "10px",
        boxShadow: "inset 0 0 5px rgba(255, 255, 255, 0.2)",
      },
      "&::-webkit-scrollbar-thumb": {
        background: "rgba(255, 255, 255, 0.6)",
        borderRadius: "10px",
        minHeight: "25px",
        transition: "background 0.3s",
        border: "2px solid rgba(255, 255, 255, 0.2)",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#ffffff",
        boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
      },
      "&::-webkit-scrollbar-button:single-button": {
        display: "block",
        height: "10px",
        background: "rgba(255, 255, 255, 0.2)",
        borderRadius: "4px",
      },
      "&::-webkit-scrollbar-button:single-button:hover": {
        background: "rgba(255, 255, 255, 0.4)",
      },
      "&::-webkit-scrollbar-button:single-button:vertical:decrement": {
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"><path d=\"M7 14l5-5 5 5H7z\"/></svg>')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      },
      "&::-webkit-scrollbar-button:single-button:vertical:increment": {
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"white\"><path d=\"M7 10l5 5 5-5H7z\"/></svg>')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      },
    }}
  >
    {isVisible && items.map((item) => (
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
          backgroundColor: hoveredItem === item.objectid ? "#fff" : "ecf4fc",
          color: hoveredItem === item.objectid ? "black" : "black",
          py: 0,
          px: 1,
          margin: "2px 0",
          height: "20px",
        }}
      >
        <ListItemText
          className='text-dark'
          primary={item.namesingular}
          primaryTypographyProps={{ fontSize: "12px" }}
          sx={{ margin: 0, padding: 0, fontWeight: "bolder" }}
        />
      </ListItem>
    ))}
  </List>
));

// API Functions Hook
const useApiCalls = (selectedVault, mfilesId) => {
  const searchObject = useCallback(async (search, vault) => {
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/Search/${vault}/${search}/${mfilesId}`
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }, [mfilesId]);

  const getRecent = useCallback(async (setRecentData) => {
    try {
      const { data } = await axios.get(
        `${constants.mfiles_api}/api/Views/GetRecent/${selectedVault.guid}/${mfilesId}`
      );
      setRecentData(data);
    } catch {
      setRecentData([]);
    }
  }, [selectedVault?.guid, mfilesId]);

  const getDeleted = useCallback(async (setDeletedData) => {
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/ObjectDeletion/GetDeletedObject/${selectedVault.guid}/${mfilesId}`
      );
      setDeletedData(response.data);
    } catch (error) {
      setDeletedData([]);
    }
  }, [selectedVault?.guid, mfilesId]);

  const getAssigned = useCallback(async (setAssignedData) => {
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/Views/GetAssigned/${selectedVault.guid}/${mfilesId}`
      );
      setAssignedData(response.data);
    } catch (error) {
      setAssignedData([]);
    }
  }, [selectedVault?.guid, mfilesId]);

  const getVaultObjects = useCallback((setVaultObjectsList, setOpenObjectModal) => {
    const config = {
      method: 'get',
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}/${mfilesId}`,
      headers: {},
    };
    axios
      .request(config)
      .then((response) => {
        setVaultObjectsList(response.data);
        setOpenObjectModal(true);
      })
      .catch(() => { });
  }, [selectedVault?.guid, mfilesId]);

  const getVaultObjects2 = useCallback((setVaultObjectsList) => {
    const config = {
      method: 'get',
      url: `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}/${mfilesId}`,
      headers: {},
    };
    axios
      .request(config)
      .then((response) => {
        setVaultObjectsList(response.data);
      })
      .catch(() => { });
  }, [selectedVault?.guid, mfilesId]);

  return {
    searchObject,
    getRecent,
    getDeleted,
    getAssigned,
    getVaultObjects,
    getVaultObjects2
  };
};

function Dashboard() {
  const location = useLocation();
  const { user, authTokens, departments, logoutUser } = useContext(Authcontext);
  const navigate = useNavigate();

  // --- State ---
  const [openObjectModal, setOpenObjectModal] = useSessionState('ss_openObjectModal', false);
  const [viewableobjects, setViewableObjects] = useSessionState('ss_viewableObjects', []);
  const [data, setData] = useSessionState('ss_data', []);
  const [searchTerm, setSearchTerm] = useSessionState('ss_searchTerm', '');
  const [searched, setSearched] = useSessionState('ss_searched', false);
  const [allrequisitions, setRequisitions] = useSessionState('ss_allRequisitions', []);
  const [selectedVault, setSelectedVault] = useSessionState('ss_selectedVault', null);
  const [vaultObjectsList, setVaultObjectsList] = useSessionState('ss_vaultObjectsList', null);
  const [sidebarOpen, setSidebarOpen] = useSessionState('ss_sidebarOpen', false);
  const [menuOpen, setMenuOpen] = useSessionState('ss_menuOpen', false);
  const [isFormOpen, setIsFormOpen] = useSessionState('ss_isFormOpen', false);
  const [templateIsTrue, setTemplateIsTrue] = useSessionState('ss_templateIsTrue', false);
  const [templates, setTemplates] = useSessionState('ss_templates', []);
  const [selectedTemplate, setSelectedTemplate] = useState({});

  const [selectedClassName, setSelectedClassName] = useSessionState('ss_selectedClassName', '');
  const [selectedObjectId, setSelectedObjectId] = useSessionState('ss_selectedObjectId', null);
  const [selectedObjectName, setSelectedObjectName] = useSessionState('ss_selectedObjectName', '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useSessionState('ss_selectedClassId', null);
  const [groupedItems, setGroupedItems] = useSessionState('ss_groupedItems', []);
  const [ungroupedItems, setUngroupedItems] = useSessionState('ss_ungroupedItems', []);
  const [isDataOpen, setIsDataOpen] = useSessionState('ss_isDataOpen', false);
  const [formProperties, setFormProperties] = useSessionState('ss_formProperties', []);
  const [templateModalOpen, setTemplateModalOpen] = useSessionState('ss_templateModalOpen', false);
  const [formValues, setFormValues] = useSessionState('ss_formValues', {});
  const [value, setValue] = useSessionState('ss_value', 0);
  const [isSublistVisible, setIsSublistVisible] = useSessionState('ss_isSublistVisible', false);
  const [docClasses, setDocClasses] = useSessionState('ss_docClasses', []);
  const [recentData, setRecentData] = useSessionState('ss_recentData', []);
  const [assignedData, setAssignedData] = useSessionState('ss_assignedData', []);
  const [deletedData, setDeletedData] = useSessionState('ss_deletedData', []);
  const [alertOpen, setOpenAlert] = useSessionState('ss_alertOpen', false);
  const [alertSeverity, setAlertSeverity] = useSessionState('ss_alertSeverity', '');
  const [alertMsg, setAlertMsg] = useSessionState('ss_alertMsg', '');
  const [mfilesId, setMfilesId] = useSessionState('ss_mfilesId', null);
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [hoveredItem, setHoveredItem] = useSessionState('ss_hoveredItem', null);

  // API calls hook
  const {
    searchObject,
    getRecent,
    getDeleted,
    getAssigned,
    getVaultObjects,
    getVaultObjects2
  } = useApiCalls(selectedVault, mfilesId);

  // --- Helper Functions ---
  const getViewableObjects = useCallback(() => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${constants.auth_api}/api/viewable-objects/`,
      headers: { 'Authorization': `Bearer ${authTokens.access}` },
    };
    axios
      .request(config)
      .then((response) => setViewableObjects(response.data))
      .catch(() => { });
  }, [authTokens.access]);

  const getVaultId = useCallback(async (guid) => {
    let data = JSON.stringify({ "user_id": user.id, "guid": guid });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${constants.auth_api}/api/vaultid/`,
      headers: { 'Content-Type': 'application/json' },
      data: data
    };
    axios.request(config)
      .then((response) => setMfilesId(response.data.mfilesID))
      .catch(() => { });
  }, [user.id]);

  const getNetworkStatus = useCallback(() => {
    if (navigator.connection) {
      const connection = navigator.connection;
      return {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
      };
    } else {
      return { downlink: 10, effectiveType: '4g', rtt: 50 };
    }
  }, []);

  const findBestIconMatch = useCallback((name) => {
    const nameWords = name.toLowerCase().split(' ');
    for (let iconName in allIcons) {
      for (let word of nameWords) {
        if (iconName.toLowerCase().includes(word)) return allIcons[iconName];
        if (
          word.toLowerCase().includes('document') ||
          word.toLowerCase().includes('invoice') ||
          word.toLowerCase().includes('Petty Cash')
        ) return faFile;
        if (
          word.toLowerCase().includes('staff') ||
          word.toLowerCase().includes('employee')
        ) return faUser;
      }
    }
    return faFolder;
  }, []);

  // --- Preview Logic ---
  const [selectedObject, setSelectedObject] = useSessionState('ss_selectedObject', {});
  const [previewObjectProps, setPreviewObjectProps] = useSessionState('ss_previewObjectProps', []);
  const [base64, setBase64] = useSessionState('ss_base64', '');
  const [extension, setExtension] = useSessionState('ss_extension', '');

  // Preview functions
  const previewObject = useCallback(async (item, isMain = true) => {
    setSelectedObject(item);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectProps/${selectedVault.guid}/${item.id}/${item.classId ?? item.classID}/${mfilesId}`;
      const { data } = await axios.get(url);
      setPreviewObjectProps(data);
    } catch (error) {
      setPreviewObjectProps([]);
    }
  }, [selectedVault?.guid, mfilesId]);

  const previewSublistObject = useCallback(async (item, isMain = true) => {
    setSelectedObject(item);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectProps/${selectedVault.guid}/${item.id}/${item.classId ?? item.classID}/${mfilesId}`;
      const { data } = await axios.get(url);
      setPreviewObjectProps(data);
    } catch (error) {
      setPreviewObjectProps([]);
    }
  }, [selectedVault?.guid, mfilesId]);

  // --- Event Handlers ---
  const adminPage = useCallback(() => navigate('/admin'), [navigate]);
  const handleChange = useCallback((event, newValue) => setValue(newValue), [setValue]);
  const toggleSidebar = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen, setSidebarOpen]);
  const toggleMenu = useCallback(() => setMenuOpen(!menuOpen), [menuOpen, setMenuOpen]);
  const reloadPage = useCallback(() => window.location.reload(), []);
  const toggleSublist = useCallback(() => setIsSublistVisible(!isSublistVisible), [isSublistVisible, setIsSublistVisible]);
  const closeModal = useCallback(() => setOpenObjectModal(false), [setOpenObjectModal]);
  const closeDataDialog = useCallback(() => setIsDataOpen(false), [setIsDataOpen]);

  // --- Data Fetching & Handling ---
  const fetchItemData = useCallback(async (objectId, objectName) => {
    setIsLoading(true);
    setSelectedObjectName(objectName);
    try {
      const url = `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectId}/${mfilesId}`;
      const { data } = await axios.get(url);
      const { grouped, unGrouped } = data;
      setSelectedObjectId(objectId);
      setGroupedItems(grouped);
      setUngroupedItems(unGrouped);
      const totalClasses =
        grouped.reduce((acc, group) => acc + group.members.length, 0) +
        unGrouped.length;
      if (totalClasses === 1) {
        const singleClass = grouped.length
          ? grouped[0].members[0]
          : unGrouped[0];
        handleClassSelection(
          singleClass.classId,
          singleClass.className,
          objectId
        );
      } else {
        setIsDataOpen(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVault?.guid, mfilesId]);

  const handleClassSelection = useCallback(async (classId, className, objectId) => {
    setLoadingDialog(true);
    setSelectedClassName(className);
    setSelectedClassId(classId);
    setSelectedObjectId(objectId);
    setTemplates([]);

    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/Templates/GetClassTemplate/${selectedVault.guid}/${classId}`,
          { headers: { accept: '*/*' } }
        );
        setTemplates(response.data);
        dontUseTemplates();
        console.log('Templates fetched:', response.data);
        setLoadingDialog(false);
      } catch (error) {
        console.error('Error fetching templates:', error);
        await proceedNoneTemplate();
      }
    };

    const proceedNoneTemplate = async () => {
      setLoadingDialog(true);
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${objectId}/${classId}/${mfilesId}`
        );
        setFormProperties(() => response.data);
        setFormValues(() =>
          response.data.reduce((acc, prop) => {
            acc[prop.propId] = '';
            return acc;
          }, {})
        );
        setIsFormOpen(true);
        setLoadingDialog(false);
      } catch (error) {
        setLoadingDialog(false);
        console.error('Error fetching class properties:', error);
      } finally {
        setLoadingDialog(false);
        closeDataDialog();
      }
    };

    if (objectId === 0) {
      await fetchTemplates();
    } else {

      await proceedNoneTemplate();
    }
  }, [selectedVault?.guid, mfilesId]);

  const UseTemplate = useCallback(async (item) => {
    setLoadingDialog(true);
    setFormProperties([]);
    setTemplateIsTrue(true);
    setSelectedTemplate(item);

    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/Templates/GetClassTemplateProps/${selectedVault.guid}/${item.classID}/${item.id}/${mfilesId}`
      );
      setFormProperties(response.data);
      setFormValues(response.data.reduce((acc, prop) => {
        acc[prop.propId] = '';
        return acc;
      }, {}));
      setIsFormOpen(true);
      setLoadingDialog(false);
    } catch (error) {
      setLoadingDialog(false);
    } finally {
      setLoadingDialog(false);
      closeDataDialog();
    }
  }, [selectedVault?.guid, mfilesId]);

  const dontUseTemplates = useCallback(async () => {
    setLoadingDialog(true);
    setFormProperties([]);
    setTemplateIsTrue(false);
    setSelectedTemplate({});
    setTemplateModalOpen(false);
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${selectedClassId}/${mfilesId}`
      );
      setFormProperties(response.data);
      setFormValues(response.data.reduce((acc, prop) => {
        acc[prop.propId] = '';
        return acc;
      }, {}));
      setIsFormOpen(true);
      setLoadingDialog(false);
    } catch (error) {
      setLoadingDialog(false);
      console.error("Error fetching class properties:", error);
    } finally {
      setLoadingDialog(false);
      closeDataDialog();
    }
  }, [selectedVault?.guid, selectedObjectId, selectedClassId, mfilesId]);

  // --- Derived/Computed Values ---
  const data2 = useMemo(() => [], []);
  const allrequisitionsnew = useMemo(() =>
    allrequisitions.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)),
    [allrequisitions]
  );

  const stringToColor = useCallback((string) => {
    let hash = 0, i;
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }, []);

  const stringAvatar = useCallback((name) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const secondInitial = nameParts[1] ? nameParts[1][0] : '';
    return { children: `${firstInitial}${secondInitial}` };
  }, []);

  const resetViews = useCallback(() => {
    getRecent(setRecentData);
    getAssigned(setAssignedData);
    getDeleted(setDeletedData);
  }, [getRecent, getAssigned, getDeleted]);

  // --- useEffect Hooks ---
  useEffect(() => {
    getViewableObjects();
    getNetworkStatus();

    const vault = sessionStorage.getItem('selectedVault');
    if (vault) {
      setSelectedVault(JSON.parse(vault));
      getVaultId(JSON.parse(vault).guid);
    }

    if (location.state?.openalert) {
      setOpenAlert(true);
      setAlertMsg(location.state.alertMsg);
      setAlertSeverity(location.state.alertSeverity);
      navigate(location.pathname, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (selectedVault) getVaultId(selectedVault.guid);
  }, [selectedVault, getVaultId]);

  useEffect(() => {
    if (selectedVault) {
      getVaultObjects2(setVaultObjectsList);
      getRecent(setRecentData);
      getAssigned(setAssignedData);
      getDeleted(setDeletedData);
    }
  }, [selectedVault, mfilesId, getVaultObjects2, getRecent, getAssigned, getDeleted]);

  // --- Render ---
  return (
    <>
      <TimedAlert
        open={alertOpen}
        onClose={() => setOpenAlert(false)}
        severity={alertSeverity}
        message={alertMsg}
        setSeverity={setAlertSeverity}
        setMessage={setAlertMsg}
      />

      <NewObjectDialog
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
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        UseTemplate={UseTemplate}
        dontUseTemplates={dontUseTemplates}
      />

      <div className="dashboard">
        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? "open" : "closed"} shadow-lg`}>
          <SidebarMenu
            sidebarOpen={sidebarOpen}
            isSublistVisible={isSublistVisible}
            toggleSublist={toggleSublist}
            vaultObjectsList={vaultObjectsList}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            fetchItemData={fetchItemData}
            user={user}
            adminPage={adminPage}
            logoutUser={logoutUser}
          />
        </nav>

        {/* Content Section */}
        <main className={`content ${sidebarOpen ? 'shifted' : 'full-width'}`}>
          <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
            <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
              <i style={{ fontSize: '16px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'} mx-2`} ></i>
            </div>
          </Tooltip>
          <DashboardContent
            searchTerm={searchTerm}
            data={data}
            data2={data2}
            getVaultObjects={() => getVaultObjects(setVaultObjectsList, setOpenObjectModal)}
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
            getRecent={() => getRecent(setRecentData)}
            mfilesId={mfilesId}
            assignedData={assignedData}
            setAssignedData={setAssignedData}
            getAssigned={() => getAssigned(setAssignedData)}
            deletedData={deletedData}
            resetViews={resetViews}
            stringAvatar={stringAvatar}
            setSidebarOpen={setSidebarOpen}
            setTemplateIsTrue={setTemplateIsTrue}
            vaultObjectsList={vaultObjectsList}
            fetchItemData={fetchItemData}
            previewObject={previewObject}
            previewSublistObject={previewSublistObject}
            selectedObject={selectedObject}
            setSelectedObject={setSelectedObject}
            previewObjectProps={previewObjectProps}
            setPreviewObjectProps={setPreviewObjectProps}
            base64={base64}
            setBase64={setBase64}
            extension={extension}
            setExtension={setExtension}
          />
        </main>
      </div>
    </>
  );
}

export default Dashboard;