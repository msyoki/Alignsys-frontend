import React, { useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Custombuttons.css';
import '../styles/Navbar.css';
import PropTypes from 'prop-types';
import { Box, Tooltip, Avatar, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';
import DashboardContent from '../components/MainComponents/DashboardContent';
import NewObjectDialog from '../components/Modals/NewObjectDialog/NewObjectDialog';
import * as constants from '../components/Auth/configs';
import logo from '../images/ZFWHITE.png';
import TimedAlert from '../components/TimedAlert';
import MiniLoader from '../components/Modals/MiniLoaderDialog';

import { FaPlusCircle } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

import { FaFolderPlus } from "react-icons/fa6";
import { FaFileCirclePlus } from "react-icons/fa6";

import {
  faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile,
  faFolder, faUserFriends, faPlus, faTag
} from '@fortawesome/free-solid-svg-icons';
import TaskMessenger from '../components/features/ai/TaskMessenger';

const allIcons = {
  faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends,
};

// Optimized session storage hook with debouncing
function useSessionState(key, defaultValue) {
  const getInitialValue = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === null || stored === 'undefined') return defaultValue;
      return JSON.parse(stored);
    } catch (e) {
      console.warn(`Failed to parse sessionStorage item for key "${key}":`, e);
      return defaultValue;
    }
  }, [key, defaultValue]);

  const [value, setValue] = useState(getInitialValue);
  const timeoutRef = useRef();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`Failed to save sessionStorage item for key "${key}":`, e);
      }
    }, 100); // 100ms debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [key, value]);

  return [value, setValue];
}

// Sidebar Menu Component - optimized with better memoization
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
        className="d-flex flex-column justify-content-center align-items-center shadow-lg"
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
            maxHeight: "33px",
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
            borderRadius: "8px",
            padding: '6px 10px',
            minHeight: '40px'
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <FaPlusCircle style={{ fontSize: "20px", flexShrink: 0, marginRight: '10px', marginLeft: '10px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden' }}>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                Create
              </span>
              <span
                style={{
                  fontSize: '9px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  marginTop: '5px',
                }}
              >
                New Objects / documents
              </span>
            </div>
          </div>

          <i
            className={`fas ${isSublistVisible ? "fa-angle-up" : "fa-angle-down"}`}
            style={{ transition: "transform 0.3s ease-in-out", fontSize: "18px", flexShrink: 0 }}
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


      </ul>

      {/* Bottom Buttons */}
      <div>
        <ul className="bottom-buttons">
          {user.is_admin === "True" && (
            // <li onClick={adminPage} className="menu-item main-li shadow-lg">
            //   <i className="fas fa-user-shield" style={{ fontSize: "18px" }}></i>
            //   <span style={{ fontSize: "14px" }}>Admin</span>
            // </li>
            <li
              onClick={adminPage}
              className="menu-item main-li shadow-lg"
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 10px', minHeight: '40px' }}
            >
              <MdOutlineAdminPanelSettings style={{ fontSize: '20px', flexShrink: 0, marginRight: '10px', marginLeft: '10px' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', gap: "4px" }}>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '1.2'
                }}>
                  Administration
                </span>
                <span style={{
                  fontSize: '9px',
                  color: 'rgba(255, 255, 255, 0.65)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: '1.2'
                }}>
                  Manage settings
                </span>
              </div>
            </li>
          )}
          <li onClick={logoutUser} className="menu-item main-li shadow-lg">
            <FaSignOutAlt style={{ fontSize: "20px", flexShrink: 0, marginRight: '10px', marginLeft: '10px' }} />
            <span style={{ fontSize: "14px" }}>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

SidebarMenu.displayName = 'SidebarMenu';

// SubList Component - optimized
const SubList = React.memo(({ isVisible, items, hoveredItem, setHoveredItem, fetchItemData }) => (
  <List
    dense
    disablePadding
    sx={{
      maxHeight: isVisible ? "350px" : "0",
      overflowY: "auto",
      width: "100%",
      opacity: isVisible ? "1" : "0",
      transition: "max-height 0.4s ease, opacity 0.3s ease",
      padding: isVisible ? "10px 20px" : "0",
      backgroundColor: "#fff",

      "&::-webkit-scrollbar": { width: "3px" },
      "&::-webkit-scrollbar-thumb": {
        background: "#2757aa",
        borderRadius: "10px",
      },
    }}
  >
    {isVisible && items.map((item) => (
      <Tooltip title={item.namesingular} placement="right" arrow>
        <ListItem
          key={item.objectid}
          onMouseEnter={() => setHoveredItem(item.objectid)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => fetchItemData(item.objectid, item.namesingular)}
          sx={{
            cursor: "pointer",
            backgroundColor: hoveredItem === item.objectid ? "#ecf4fc" : "#fff",
            color: "#333",
            py: 0,
            px: 0,
            margin: "2px 0",
            height: "22px",

            display: "flex",
            alignItems: "center",
            gap: 0.3,
            width: "100%",

            borderRadius: "4px",
            transition: "all 0.15s ease",

            "&:hover": {
              backgroundColor: "#e9f2fc",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              transform: "translateY(-1px)",
            },

            "&:active": {
              transform: "scale(0.98)",
              boxShadow: "0 0 0 rgba(0,0,0,0)",
            },
          }}

        >
          {/* ICON */}
   
          {item.objectid === 0 ? (
            <FaFileCirclePlus style={{ color: "#2757aa", fontSize: "13px", flexShrink: 0, marginLeft: '16px' }} />
          ) : (
            <FaFolderPlus style={{ color: "#2757aa", fontSize: "13px", flexShrink: 0, marginLeft: '16px' }} />
          )}


          {/* TEXT */}
          <ListItemText
            primary={item.namesingular}
            primaryTypographyProps={{ fontSize: "12px" }}
            sx={{
              marginX: 0.5,
              padding: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
        </ListItem>
      </Tooltip>

    ))}
  </List>

));

SubList.displayName = 'SubList';

// API Functions Hook - optimized with caching
const useApiCalls = (selectedVault, mfilesId, setIsLoadingRecent, setIsLoadingAssigned, setIsLoadingDeleted) => {
  const cacheRef = useRef(new Map());

  // Clear cache when vault changes
  useEffect(() => {
    cacheRef.current.clear();
  }, [selectedVault?.guid, mfilesId]);

  const searchObject = useCallback(async (search, vault) => {
    const cacheKey = `search_${vault}_${search}`;
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/Search/${vault}/${search}/${mfilesId}`
      );
      cacheRef.current.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      return null;
    }
  }, [mfilesId]);


  const getRecent = useCallback(async (setRecentData) => {
    setIsLoadingRecent(true);
    try {
      const { data } = await axios.get(
        `${constants.mfiles_api}/api/Views/GetRecent/${selectedVault.guid}/${mfilesId}`
      );

      // Sort by most recent date first (descending order)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.lastModifiedUtc);
        const dateB = new Date(b.lastModifiedUtc);
        return dateB - dateA;
      });

      setRecentData(sortedData);
      setIsLoadingRecent(false);
      // console.log(sortedData)
    } catch (error) {
      console.error("Failed to fetch recent data", error);
      setRecentData([]);
      setIsLoadingRecent(false);
    }
  }, [selectedVault?.guid, mfilesId]);


  const getDeleted = useCallback(async (setDeletedData) => {
    setIsLoadingDeleted(true);
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/ObjectDeletion/GetDeletedObject/${selectedVault.guid}/${mfilesId}`
      );
      setDeletedData(response.data);
      setIsLoadingDeleted(false);
    } catch (error) {
      console.error("Failed to fetch deleted data", error);
      setDeletedData([]);
      setIsLoadingDeleted(false);
    }
  }, [selectedVault?.guid, mfilesId]);


  const getAssigned = useCallback(async (setAssignedData) => {
    setIsLoadingAssigned(true);
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/Views/GetAssigned/${selectedVault.guid}/${mfilesId}`
      );

      // Sort by most recent date first
      const sortedData = response.data.sort((a, b) => {
        const dateA = new Date(a.lastModifiedUtc);
        const dateB = new Date(b.lastModifiedUtc);
        return dateB - dateA;
      });

      setAssignedData(sortedData);
      setIsLoadingAssigned(false);
      console.log(sortedData)
    } catch (error) {
      console.error('Error fetching assigned data:', error);
      setAssignedData([]);
      setIsLoadingAssigned(false);
    }
  }, [selectedVault?.guid, mfilesId]);


  const getVaultObjects = useCallback((setVaultObjectsList, setOpenObjectModal) => {
    axios.get(
      `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}/${mfilesId}`
    )
      .then((response) => {
        setVaultObjectsList(response.data);
        setOpenObjectModal(true);
      })
      .catch((error) => {
        console.error("Failed to fetch vault objects", error);
      });
  }, [selectedVault?.guid, mfilesId]);


  const getVaultObjects2 = useCallback((setVaultObjectsList) => {
    axios.get(
      `${constants.mfiles_api}/api/MfilesObjects/GetVaultsObjects/${selectedVault.guid}/${mfilesId}`
    )
      .then((response) => {
        setVaultObjectsList(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch vault objects (2)", error);
      });
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

  // --- State (keeping original structure) ---
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
  const [isFormOpenVL, setIsFormOpenVL] = useSessionState('ss_isFormOpen', false);
  const [templateIsTrue, setTemplateIsTrue] = useSessionState('ss_templateIsTrue', false);
  const [templates, setTemplates] = useSessionState('ss_templates', []);
  const [selectedTemplate, setSelectedTemplate] = useState({});

  const [selectedClassName, setSelectedClassName] = useSessionState('ss_selectedClassName', '');
  const [selectedObjectId, setSelectedObjectId] = useSessionState('ss_selectedObjectId', null);
  const [selectedObjectName, setSelectedObjectName] = useSessionState('ss_selectedObjectName', '');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(false);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [selectedClassId, setSelectedClassId] = useSessionState('ss_selectedClassId', null);
  const [groupedItems, setGroupedItems] = useSessionState('ss_groupedItems', []);
  const [ungroupedItems, setUngroupedItems] = useSessionState('ss_ungroupedItems', []);
  const [isDataOpen, setIsDataOpen] = useSessionState('ss_isDataOpen', false);
  const [formProperties, setFormProperties] = useSessionState('ss_formProperties', []);
  const [formVLProperties, setVLFormProperties] = useSessionState('ss_VLformProperties', []);
  const [formValues, setFormValues] = useSessionState('ss_formValues', {});
  const [VLformValues, setVLFormValues] = useSessionState('ss_VLformValues', {});
  const [templateModalOpen, setTemplateModalOpen] = useSessionState('ss_templateModalOpen', false);

  const [value, setValue] = useSessionState('ss_value', 0);
  const [isSublistVisible, setIsSublistVisible] = useSessionState('ss_isSublistVisible', false);
  const [docClasses, setDocClasses] = useSessionState('ss_docClasses', []);
  const [recentData, setRecentData] = useSessionState('ss_recentData', []);
  const [assignedData, setAssignedData] = useSessionState('ss_assignedData', []);
  const [deletedData, setDeletedData] = useSessionState('ss_deletedData', []);
  const [alertOpen, setOpenAlert] = useSessionState('ss_alertOpen', false);
  const [alertSeverity, setAlertSeverity] = useSessionState('ss_alertSeverity', '');
  const [alertMsg, setAlertMsg] = useSessionState('ss_alertMsg', '');
  // const [mfilesId, setMfilesId] = useSessionState('ss_mfilesId', null);
  const [loadingDialog, setLoadingDialog] = useState(false);
  const [hoveredItem, setHoveredItem] = useSessionState('ss_hoveredItem', null);

  // --- Preview Logic ---
  const [selectedObject, setSelectedObject] = useSessionState('ss_selectedObject', {});
  const [previewObjectProps, setPreviewObjectProps] = useSessionState('ss_previewObjectProps', []);
  const [base64, setBase64] = useSessionState('ss_base64', '');
  const [extension, setExtension] = useSessionState('ss_extension', '');
  const [droppedFile, setDroppedFile] = useSessionState('ss_droppedFile', null);


  // API calls hook
  const {
    searchObject,
    getRecent,
    getDeleted,
    getAssigned,
    getVaultObjects,
    getVaultObjects2
  } = useApiCalls(selectedVault, selectedVault?.vaultId, setIsLoadingRecent, setIsLoadingAssigned, setIsLoadingDeleted);

  // --- Helper Functions (memoized for performance) ---
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
  }, [authTokens.access, setViewableObjects]);

  // const getVaultId = useCallback(async (guid) => {
  //   try {
  //     const response = await axios.post(
  //       `${constants.auth_api}/api/vaultid/`,
  //       { user_id: user.id, guid },
  //       { headers: { 'Content-Type': 'application/json' } }
  //     );
  //     setMfilesId(response.data.mfilesID);

  //   } catch (error) {

  //     setMfilesId(17)

  //     console.error("Vault ID fetch failed:", error);

  //   }
  // }, [user.id, setMfilesId]);


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

  // Preview functions (memoized)
  const previewObject = useCallback(async (item, isMain = true) => {
    setSelectedObject(item);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectProps/${selectedVault.guid}/${item.id}/${item.classId ?? item.classID}/${selectedVault.vaultId}`;
      const { data } = await axios.get(url);
      setPreviewObjectProps(data);
    } catch (error) {
      setPreviewObjectProps([]);
    }
  }, [selectedVault?.guid, selectedVault?.vaultId, setSelectedObject, setPreviewObjectProps]);

  const previewSublistObject = useCallback(async (item, isMain = true) => {
    setSelectedObject(item);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectProps/${selectedVault.guid}/${item.id}/${item.classId ?? item.classID}/${selectedVault.vaultId}`;
      const { data } = await axios.get(url);
      setPreviewObjectProps(data);
    } catch (error) {
      setPreviewObjectProps([]);
    }
  }, [selectedVault?.guid, selectedVault?.vaultId, setSelectedObject, setPreviewObjectProps]);

  // --- Event Handlers (memoized) ---
  const adminPage = useCallback(() => navigate('/admin'), [navigate]);
  const handleChange = useCallback((event, newValue) => setValue(newValue), [setValue]);
  const toggleSidebar = useCallback(() => setSidebarOpen(!sidebarOpen), [sidebarOpen, setSidebarOpen]);
  const toggleMenu = useCallback(() => setMenuOpen(!menuOpen), [menuOpen, setMenuOpen]);
  const reloadPage = useCallback(() => window.location.reload(), []);
  const toggleSublist = useCallback(() => setIsSublistVisible(!isSublistVisible), [isSublistVisible, setIsSublistVisible]);
  const closeModal = useCallback(() => setOpenObjectModal(false), [setOpenObjectModal]);
  const closeDataDialog = useCallback(() => setIsDataOpen(false), [setIsDataOpen]);

  // --- Data Fetching & Handling (keeping original logic) ---
  const fetchItemData = useCallback(async (objectId, objectName) => {
    setIsLoading(true);
    setSelectedObjectName(objectName);
    try {
      const url = `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectId}/${selectedVault.vaultId}`;
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
  }, [selectedVault?.guid, selectedVault?.vaultId, setSelectedObjectName, setSelectedObjectId, setGroupedItems, setUngroupedItems, setIsDataOpen]);

  const handleClassSelection = useCallback(async (classId, className, objectId) => {
    // Combine initial state updates into one
    setLoadingDialog(true);
    setSelectedClassName(className);
    setSelectedClassId(classId);
    setSelectedObjectId(objectId);
    setTemplates([]);
    setFormProperties([]);
    setFormValues({});
    setIsFormOpen(false);

    // Helper: proceed with class properties if no template
    const proceedNoneTemplate = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${objectId}/${classId}/${selectedVault.vaultId}`
        );

        setFormProperties(response.data);
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
        setLoadingDialog(false);
        closeDataDialog();
      }
    };

    // Helper: fetch templates
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/Templates/GetClassTemplate/${selectedVault.guid}/${classId}`,
          { headers: { accept: '*/*' } }
        );

        if (response.data?.length > 0) {
          setTemplates(response.data);
          setIsFormOpen(true);
        } else {
          // If no templates, fallback
          await proceedNoneTemplate();
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        await proceedNoneTemplate();
      } finally {
        setLoadingDialog(false);
      }
    };

    // Start by fetching templates

    await proceedNoneTemplate();
    await fetchTemplates();

  }, [selectedVault?.guid, selectedVault?.vaultId, closeDataDialog]);


  const handleClassSelectionVL = useCallback(async (classId, className, objectId) => {
    // Combine initial state updates into one
    setLoadingDialog(true);
    setVLFormProperties([]);
    setVLFormValues({});

    // Helper: proceed with class properties if no template
    const proceedNoneTemplate = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${objectId}/${classId}/${selectedVault.vaultId}`
        );
        console.log('VL Class Props Response:', response.data);

        setVLFormProperties(response.data);
        setVLFormValues(
          response.data.reduce((acc, prop) => {
            acc[prop.propId] = '';
            return acc;
          }, {})
        );
      } catch (error) {
        console.error('Error fetching class properties:', error);
      } finally {
        setLoadingDialog(false);
        closeDataDialog();
      }
    };


    // Start by fetching templates

    await proceedNoneTemplate();


  }, [selectedVault?.guid, selectedVault?.vaultId]);



  const UseTemplate = useCallback(async (item) => {
    setLoadingDialog(true);
    setFormProperties([]);
    setTemplateIsTrue(true);
    setSelectedTemplate(item);

    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/Templates/GetClassTemplateProps/${selectedVault.guid}/${item.classID}/${item.id}/${selectedVault.vaultId}`
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
  }, [selectedVault?.guid, selectedVault?.vaultId, setLoadingDialog, setFormProperties, setTemplateIsTrue, setSelectedTemplate, setFormValues, setIsFormOpen, closeDataDialog]);

  const dontUseTemplates = useCallback(async () => {
    setLoadingDialog(true);
    setFormProperties([]);
    setTemplateIsTrue(false);
    setSelectedTemplate({});
    setTemplateModalOpen(false);
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${selectedClassId}/${selectedVault.vaultId}`
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
  }, [selectedVault?.guid, selectedObjectId, selectedClassId, selectedVault?.vaultId, setLoadingDialog, setFormProperties, setTemplateIsTrue, setSelectedTemplate, setTemplateModalOpen, setFormValues, setIsFormOpen, closeDataDialog]);


  const VLObjectProps = useCallback(async (classId, className, objectId) => {
    setLoadingDialog(true);
    setVLFormProperties([]);

    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${objectId}/${classId}/${selectedVault.vaultId}`
      );

      setVLFormProperties(response.data);

      // Initialize empty values for each property
      setVLFormValues(
        response.data.reduce((acc, prop) => {
          acc[prop.propId] = "";
          return acc;
        }, {})
      );

    } catch (error) {
      console.error("Error fetching class properties:", error);
    } finally {
      setLoadingDialog(false);
    }
  }, [
    selectedVault?.guid,
    selectedObjectId,
    selectedClassId,
    selectedVault?.vaultId,
    setLoadingDialog,
    setVLFormProperties,
    setVLFormValues
  ]);


  // --- Derived/Computed Values (memoized) ---
  const data2 = useMemo(() => [], []);
  const allrequisitionsnew = useMemo(() =>
    allrequisitions.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)),
    [allrequisitions]
  );

  const stringAvatar = useCallback((name) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const secondInitial = nameParts[1] ? nameParts[1][0] : '';
    return { children: `${firstInitial}${secondInitial}` };
  }, []);

  const resetViews = useCallback(() => {
    getRecent();
    getAssigned();
    getDeleted();
  }, []);

  // --- useEffect Hooks (keeping original logic) ---
  useEffect(() => {

    getNetworkStatus();

    const vaultString = sessionStorage.getItem('selectedVault');

    if (!vaultString) return;

    const vaultObj = JSON.parse(vaultString);
    setSelectedVault(vaultObj);








    if (location.state?.openalert) {
      setOpenAlert(true);
      setAlertMsg(location.state.alertMsg);
      setAlertSeverity(location.state.alertSeverity);
      navigate(location.pathname, { replace: true });
    }
  }, [sessionStorage.getItem('selectedVault'), getViewableObjects, getNetworkStatus, setSelectedVault, location.state, setOpenAlert, setAlertMsg, setAlertSeverity, navigate]);


  useEffect(() => {
    if (selectedVault) {
      getVaultObjects2(setVaultObjectsList);
      // getRecent(setRecentData);
      // getAssigned(setAssignedData);
      // getDeleted(setDeletedData);
    }
  }, [selectedVault, selectedVault?.vaultId, getVaultObjects2, getRecent, getAssigned, getDeleted, setVaultObjectsList, setRecentData, setAssignedData, setDeletedData]);

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
      {/* <TaskMessenger/> */}

      <NewObjectDialog
        setSelectedClassName={setSelectedClassName}
        uploadedFile={droppedFile}
        setUploadedFile={setDroppedFile}
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
        VLformValues={VLformValues}
        closeDataDialog={closeDataDialog}
        selectedClassName={selectedClassName}
        setIsFormOpen={setIsFormOpen}
        isFormOpen={isFormOpen}
        setIsFormOpenVL={setIsFormOpenVL}
        isFormOpenVL={isFormOpenVL}
        setTemplateIsTrue={setTemplateIsTrue}
        templateIsTrue={templateIsTrue}
        templates={templates}
        setTemplates={setTemplates}
        user={user}
        mfilesId={selectedVault?.vaultId}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        UseTemplate={UseTemplate}
        dontUseTemplates={dontUseTemplates}
        VLObjectProps={VLObjectProps}
        handleClassSelectionVL={handleClassSelectionVL}
        formVLProperties={formVLProperties}
        getRecent={() => getRecent(setRecentData)}
        getAssigned={() => getAssigned(setAssignedData)}

      />

      <div className="dashboard">
        {/* Sidebar */}
        <nav className={`sidebar ${sidebarOpen ? "open" : "closed"} shadow-lg`} style={{ borderRight: "3px solid #ddd" }}>
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
        <main className={`content ${sidebarOpen ? 'shifted' : 'full-width'} `}>
          {/* <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
            <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
              <i style={{ fontSize: '16px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'} mx-3`} ></i>
            </div>
            
          </Tooltip> */}
          <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
            <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
              <i style={{ fontSize: '16px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'} mx-2`} ></i>
            </div>
          </Tooltip>
          <DashboardContent
            droppedFile={droppedFile}
            setDroppedFile={setDroppedFile}
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
            // viewableobjects={viewableobjects}
            toggleSidebar={toggleSidebar}
            sidebarOpen={sidebarOpen}
            recentData={recentData}
            setRecentData={setRecentData}
            mfilesId={selectedVault?.vaultId}
            assignedData={assignedData}
            setAssignedData={setAssignedData}
            getRecent={() => getRecent(setRecentData)}
            getAssigned={() => getAssigned(setAssignedData)}
            getDeleted={() => getDeleted(setDeletedData)}
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
            isLoadingRecent={isLoadingRecent}
            isLoadingAssigned={isLoadingAssigned}
            isLoadingDeleted={isLoadingDeleted}
            groupedItems={groupedItems}
            ungroupedItems={ungroupedItems}
          />
        </main>
      </div>
    </>
  );
}

export default Dashboard;