import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Loader from '../Loaders/LoaderMini';
import { Avatar, Button } from '@mui/material';
import { Typography } from '@mui/material';

import Box from '@mui/material/Box';
import ObjectData from './ObjectData';
import RightClickMenu from '../RightMenu';

import ViewsList from './ViewsList';
import VaultSelectForm from '../SelectVault';
import FileExtIcon from '../FileExtIcon';
import ConfirmUpdateDialog from '../Modals/ConfirmUpdateObjectDialog';
import TimedAlert from '../TimedAlert';

import OfficeApp from '../Modals/OfficeAppDialog';
import * as constants from '../Auth/configs'
import LoadingDialog from '../Loaders/LoaderDialog';
import FileExtText from '../FileExtText';
import logo from '../../images/ZFBLU.png';
import { Tabs, Tab } from '@mui/material';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';


import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LinkedObjectsTree from './LinkedObjectsTree';
import AddButtonWithMenu from '../AddButtonWithMenu';
import MultifileFiles from '../MultifileFiles';


function CustomTabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className='my-1'  sx={{  height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
          {children}
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


const DocumentList = (props) => {

  function useSessionState(key, defaultValue) {
    const getInitialValue = () => {
      try {
        const stored = sessionStorage.getItem(key);
        if (stored === null || stored === 'undefined') {
          return defaultValue;
        }
        return JSON.parse(stored);
      } catch {
        // console.warn(`Failed to parse sessionStorage item for key "${key}":`, e);
        return defaultValue;
      }
    };

    const [value, setValue] = useState(getInitialValue);

    useEffect(() => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch  {
        // console.warn(`Failed to save sessionStorage item for key "${key}":`, e);
      }
    }, [key, value]);

    return [value, setValue];
  }

  const [value, setValue] = useSessionState('ss_value', 0);

  const [loading, setLoading] = useState(false);

  let [selectedObject, setSelectedObject] = useSessionState('ss_selectedObject', {});

  let [loadingobjects, setLoadingObjects] = useState(false);
  let [selectedFileId, setSelectedFileId] = useSessionState('ss_selectedFileId', null);

  const [openAlert, setOpenAlert] = useSessionState('ss_openAlert', false);
  const [alertSeverity, setAlertSeverity] = useSessionState('ss_alertSeverity', '');
  const [alertMsg, setAlertMsg] = useSessionState('ss_alertMsg', '');
  const [loadingPreviewObject, setLoadingPreviewObject] = useState(false);
  ;

  const [previewObjectProps, setPreviewObjectProps] = useSessionState('ss_previewObjectProps', []);
  const [formValues, setFormValues] = useSessionState('ss_formValues', {});
  const [base64, setBase64] = useSessionState('ss_base64', '');
  const [extension, setExtension] = useSessionState('ss_extension', '');
  const [loadingfile, setLoadingFile] = useState(false);
  const [loadingobject, setLoadingObject] = useState(false);
  const [dialogOpen, setDialogOpen] = useSessionState('ss_dialogOpen', false);
  const [uptatingObject, setUpdatingObject] = useSessionState('ss_updatingObject', false);
  const [selectedObkjWf, setSelectedObjWf] = useSessionState('ss_selectedObjWf', {});
  const [currentState, setCurrentState] = useSessionState('ss_currentState', {});
  const [selectedState, setSelectedState] = useSessionState('ss_selectedState', {});
  const [comments, setComments] = useSessionState('ss_comments', []);
  const [loadingcomments, setLoadingComments] = useState(false);
  const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
  const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
  const [loadingClick, setLoadingClick] = useState(false);
  const [searched, setSearched] = useSessionState('ss_searched', false);
  const [previewWindowWidth, setPreviewWindowWidth] = useSessionState('ss_previewWindowWidth', 40);
  const [newWFState, setNewWFState] = useState(null)
  const [newWF, setNewWF] = useState(null)
  const [workflows, setWorkflows] = useSessionState('ss_vaultWorkflows', []);
  const [approvalPayload, setApprovalPayload] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [loadingWFS, setLoadingWFS] = useState(false);

  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const dividerRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);

  const [file, setFile] = useState(null);


  async function convertToPDF(item, overWriteOriginal) {
    // alert(file.fileID);
    // console.log('Converting to PDF:', file);


    const payload = {
      vaultGuid: props.selectedVault.guid,  // string
      objectId: item.id,                      // number
      classId: item.classID || item.classId,                       // number
      fileID: file.fileID,                        // number
      overWriteOriginal: overWriteOriginal,           // boolean
      separateFile: overWriteOriginal ? false : true,                // boolean
      userID: props.mfilesId                     // number
    };

 
    try {
      const response = await axios.post(
        `${constants.mfiles_api}/api/objectinstance/ConvertToPdf`,
        payload,
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch  {
      // console.error('Error converting to PDF:', error);
      // throw error;
    }
  }


  async function fetchObjectFile(item) {
    // const objectType = item.objectTypeId ?? item.objectID;
    const classId= item.classId || item.classID
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${classId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: '*/*'
        }
      });

      const file = response.data?.[0];
      setFile(file);
     
      // alert(`File ID is: ${file.fileID}`)
    } catch  {
      // console.error('Failed to fetch object file:', error);
      // throw error;
    }
  }

  // Handler for right-click
  const handleRightClick = (event, item) => {
 
    event.preventDefault();
    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
    if (item.objectID === 0 || item.objectTypeId === 0) {
      fetchObjectFile(item);

    }
  };

  // Handler to close menu
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuItem(null);
  };


  const [selectedItemId, setSelectedItemId] = useState(null);

  let clickTimeout = null;



  const markAssignementComplete = async () => {

    await axios.post(`${constants.mfiles_api}/api/objectinstance/ApproveAssignment`, approvalPayload, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {

        setApprovalPayload(null)
      })
      .catch(error => {
        console.error('Error:', error);
      });

  }

  const handleCloseDialog = () => setDialogOpen(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const transformFormValues = async () => {

    try {
      setUpdatingObject(true);

      const requestData = {
        objectid: selectedObject.id,
        objectypeid: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
        classid: (selectedObject.classID !== undefined ? selectedObject.classID : selectedObject.classId),
        props: Object.entries(formValues).map(([id, { value, datatype }]) => {
          let transformedValue = value;

          // Handle transformation based on datatype
          switch (datatype) {
            case 'MFDatatypeMultiSelectLookup':
              transformedValue = value.join(", ");
              break;
            case 'MFDatatypeBoolean':
              transformedValue = value ? "true" : "false";
              break;
            case 'MFDatatypeNumber':
            case 'MFDatatypeLookup':
              transformedValue = value.toString();
              break;
          }

          return {
            id: parseInt(id, 10), // Ensure ID is a number
            value: transformedValue,
            datatype,
          };
        }),
        userID: parseInt(props.mfilesId, 10),

        vaultGuid: props.selectedVault?.guid || "", // Ensure valid vaultGuid
      };

      await axios.put(
        `${constants.mfiles_api}/api/objectinstance/UpdateObjectProps`,
        requestData,
        { headers: { accept: '*/*', 'Content-Type': 'application/json' } }
      );

      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Updated successfully! Chages will be effected next time item is loaded.");
      setFormValues({});

      // console.log(selectedObject)
      setPreviewObjectProps([])
      setSelectedObject({})
      setUpdatingObject(false);

      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject(selectedObject, false);
        } else {
          previewSublistObject(selectedObject, false);
        }
      }, 5000);

    } catch {
      setUpdatingObject(false)
      // console.error('Error updating object props:', error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("something went wrong, please try again later!");
    }
  };


  const transitionState = async () => {
    try {
      setUpdatingObject(true);
      const data = {
        vaultGuid: props.selectedVault.guid,
        objectTypeId: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
        objectId: selectedObject.id,
        nextStateId: selectedState.id,
        userID: props.mfilesId
      };
      await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/SetObjectstate`, data, {
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
      });
      // setSelectedState({});
      // if (!formValues) {
      //   await reloadObjectMetadata();  // Await reloadObjectMetadata to ensure it's completed
      // }
      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject(selectedObject, false);
        } else {
          previewSublistObject(selectedObject, false);
        }
      }, 5000);
      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Updated successfully!");
      setUpdatingObject(false)
    } catch  {
      // console.error('Error transitioning state:', error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("something went wrong, please try again later!");
      setUpdatingObject(false)
    }
  };

  const addNewWorkflowAndState = async () => {
    const hasNewWorkflow = Boolean(newWFState?.stateName);

    if (!hasNewWorkflow) {
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("Select a workflow state to save.");

    }
    else {
      try {
        setUpdatingObject(true);
        const data = {
          vaultGuid: props.selectedVault.guid,
          objectTypeId: (selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId),
          objectId: selectedObject.id,
          workflowId: newWF.workflowId,
          stateId: newWFState.stateId,
          userID: props.mfilesId
        };

        await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/SetObjectWorkflowstate`, data, {
          headers: { accept: '*/*', 'Content-Type': 'application/json' },
        });

        setTimeout(() => {
          if (selectedObject.id !== 0) {
            previewObject(selectedObject, false);
          } else {
            previewSublistObject(selectedObject, false);
          }
        }, 5000);
        setAlertPopOpen(true);
        setAlertPopSeverity("success");
        setAlertPopMessage("Updated successfully!");
        setNewWF(null)
        setNewWFState(null)
      } catch  {
        setUpdatingObject(false);
        // console.error('Error transitioning state:', error);
        setAlertPopOpen(true);
        setAlertPopSeverity("error");
        setAlertPopMessage("something went wrong, please try again later!");
      }
    }
  };

  const updateObjectMetadata = async () => {
    const hasFormValues = Object.keys(formValues || {}).length > 0;
    const hasSelectedState = Boolean(selectedState?.title);
    const hasNewWorkflow = Boolean(newWF?.workflowName);


    // Process form values if any
    if (hasFormValues) {
      await transformFormValues();
    }

    // Process state transition if a state is selected
    if (hasSelectedState) {
      await transitionState();
    }

    if (hasNewWorkflow) {
      await addNewWorkflowAndState();
    }

    if (approvalPayload) {
      markAssignementComplete()
    }

    // Reload metadata
    await reloadObjectMetadata();

    // Close the dialog after all operations are done
    setDialogOpen(false);

    // Set updating object to false after the dialog is closed
    setUpdatingObject(false);


  };

  const reloadObjectMetadata = async () => {
    // await getSelectedObjWorkflow(selectedObject.objectTypeId, selectedObject.id);

    if (selectedObject.objectTypeId === 0) {
      await previewObject(selectedObject, false);  // Await previewObject to ensure it's completed
    } else {
      await previewSublistObject(selectedObject, false);  // Await previewSublistObject to ensure it's completed
    }

  };






  // Helper function to reset common state
  const resetPreviewState = () => {
    setWorkflows([]);
    setCheckedItems({});
    setNewWF(null);
    setNewWFState(null);
    setLoadingWFS(true);
    setComments([]);
    setSelectedState({});
    setFormValues({});
  };

  // Helper function to set loading states
  const setLoadingStates = (loading) => {
    setLoadingObject(loading);
    setLoadingClick(loading);
  };

  // Helper function to fetch object properties
  const fetchObjectProperties = async (item) => {
    const classId = item.classId !== undefined ? item.classId : item.classID;
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${classId}/${props.mfilesId}`;

    try {
      const response = await axios.get(url);
   
      setPreviewObjectProps(response.data);
      return { success: true };
    } catch  {
      // console.error('Error fetching object properties:', error);
      // return { success: false, error };
    }
  };

  // Helper function to handle file download for documents
  const handleDocumentDownload = async (item) => {
    const objectTypeId = item.objectTypeId ?? item.objectID;

    if (objectTypeId !== 0) {
      setBase64('');
      setExtension('');
      return { success: true };
    }

    setLoadingFile(true);

    try {
      // Fetch object files
      const filesUrl = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
      const filesResponse = await axios.get(filesUrl, { headers: { Accept: '*/*' } });

      const fileId = filesResponse.data[0].fileID;
      setSelectedFileId(fileId);
    
      // Download the file
      const downloadUrl = `${constants.mfiles_api}/api/objectinstance/DownloadFile/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}/${fileId}`;
      // console.log(downloadUrl)
      const downloadResponse = await axios.get(downloadUrl, { headers: { Accept: '*/*' } });

      setBase64(downloadResponse.data.base64);
      setExtension(downloadResponse.data.extension.replace('.', ''));
      // console.log(downloadResponse.data.base64)
      // console.log(downloadResponse.data.extension.replace('.', ''))

      return { success: true };
    } catch {
      // console.error('Error handling document download:', error);
      // return { success: false, error };
    } finally {
      setLoadingFile(false);
    }
  };

  // Helper function to show error alert
  const showErrorAlert = (message = "Not found! object may be deleted or not available at the time") => {
    setAlertPopOpen(true);
    setAlertPopSeverity("error");
    setAlertPopMessage(message);
  };

  // Main preview function that handles both cases
  const previewObjectInternal = async (item, isSublist = false) => {
    // Reset state
    resetPreviewState();
    setLoadingStates(true);
    setSelectedObject(item);

    // Reset file-related state only for regular preview
    if (!isSublist) {
      setBase64('');
      setExtension('');
    }

    // Get workflow info
    const objectTypeId = item.objectTypeId || item.objectID;
    const classId = item.classId || item.classID;
    getSelectedObjWorkflow(objectTypeId, item.id, classId);

    try {
      // Fetch object properties
      const propsResult = await fetchObjectProperties(item);

      if (!propsResult.success) {
        throw propsResult.error;
      }

      // Handle document download for sublist objects
      if (isSublist) {
        const downloadResult = await handleDocumentDownload(item);
        if (!downloadResult.success) {
          throw downloadResult.error;
        }
      }

    } catch {
      // console.error('Error in preview operation:', error);
      // if (isSublist) {
      //   showErrorAlert();
      // }
    } finally {
      setLoadingStates(false);
    }

    // Fetch comments
    getObjectComments(item);
  };

  // Public functions
  const previewObject = async (item, getLinkedItems) => {
    await previewObjectInternal(item, false);
  };

  const previewSublistObject = async (item, getLinkedItems) => {
    await previewObjectInternal(item, true);
  };

  const discardChange = () => {
    setDialogOpen(false)
    setSelectedState({})
    setFormValues({})
    setNewWF(null)
    setNewWFState(null)
    setApprovalPayload(null)

    setSelectedState({})


  }

  const downloadFile = async (fileId, item) => {
    // Reset base64 and extension before starting download
    setBase64('');
    setExtension('');
    setLoadingClick(true);
    setLoadingFile(true);

    try {
      const downloadResponse = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/DownloadFile/${props.selectedVault.guid}/${item.id}/${(item.classId ?? item.classID)}/${fileId}`,
        { headers: { Accept: '*/*' } }
      );

      setBase64(downloadResponse.data.base64);
      setExtension(downloadResponse.data.extension.replace('.', ''));
      // let ext = downloadResponse.data.extension.replace('.', '');
      // console.log(ext);
    } catch {
      // console.error('Error downloading file:', downloadError);
    } finally {
      setLoadingFile(false);
      setLoadingClick(false);
    }
  };


  const fetchVaultWorkflows = async (objectTypeId, classId) => {

    try {
      const response = await axios.get(`${constants.mfiles_api}/api/WorkflowsInstance/GetVaultsObjectClassTypeWorkflows/${props.selectedVault.guid}/${props.mfilesId}/${objectTypeId}/${classId}`, {
        headers: {
          'accept': '*/*'
        }
      });
      setLoadingWFS(false)
      setWorkflows(response.data)


    } catch  {
      setLoadingWFS(false)
      // console.error('Error fetching workflows:', error);


    }
  };

const getSelectedObjWorkflow = async (objectTypeId, objectsId, classId) => {
  const data = {
    vaultGuid: props.selectedVault.guid,
    objectTypeId: objectTypeId,
    objectId: objectsId,
    userEmail: props.user.email,
    userID: props.mfilesId
  };

  try {
    const response = await axios.post(
      `${constants.mfiles_api}/api/WorkflowsInstance/GetObjectworkflowstate`,
      data,
      {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      }
    );

    setLoadingWFS(false);
    setSelectedObjWf(response.data);

    setCurrentState({
      title: response.data.currentStateTitle,
      id: response.data.currentStateid
    });
  } catch  {
    fetchVaultWorkflows(objectTypeId, classId);
    setSelectedObjWf(null);
    setLoadingWFS(false);
    // Optionally log the error:
    // console.error('Workflow fetch error:', error);
  }
};


  const getObjectComments = async (item) => {
    setLoadingComments(true)
    // Define the API URL

    const url = `${constants.mfiles_api}/api/Comments?ObjectId=${item.id}&VaultGuid=${props.selectedVault.guid}&ObjectTypeId=${(item.objectID ?? item.objectTypeId)}`;

    // Fetch the comments using Axios
    await axios.get(url, {
      headers: {
        'accept': '*/*'
      }
    })
      .then(response => {

        setComments(response.data);  // Set the comments from the response data
        setLoadingComments(false);
      })
      .catch(err => {
        setLoadingComments(false);
      });

  }

  const getObjectComments2 = async () => {
    setLoadingComments(true);
    let objectID = selectedObject.objectID !== undefined ? selectedObject.objectID : selectedObject.objectTypeId;

    // Define the API URL
    const url = `${constants.mfiles_api}/api/Comments?ObjectId=${selectedObject.id}&VaultGuid=${props.selectedVault.guid}&ObjectTypeId=${objectID}`;

    // Fetch the comments using Axios
    await axios.get(url, {
      headers: {
        'accept': '*/*'
      }
    })
      .then(response => {

        setComments(response.data);  // Set the comments from the response data
        setLoadingComments(false);
      })
      .catch(err => {
        setLoadingComments(false);
      });

  }


  const reloadPage = () => {
    const authTokens = sessionStorage.getItem('authTokens');
    const selectedVault = sessionStorage.getItem('selectedVault');

    sessionStorage.clear();

    if (authTokens !== null) {
      sessionStorage.setItem('authTokens', authTokens);
    }

    if (selectedVault !== null) {
      sessionStorage.setItem('selectedVault', selectedVault);
    }


    window.location.reload();
  };


  const handleSearch = (e) => {
    resetPreview()
    setValue(0)
    e.preventDefault();
    setLoading(true)
    // Trigger a search for documents based on 'searchTerm'
    props.searchObject(props.searchTerm, props.selectedVault.guid).then((data) => {
      setLoading(false)
      setSearched(true)
      props.setData(data);
      // console.log(data)
 
    });

  };

  const [alertOpen, setAlertPopOpen] = useState(false);
  const [severity, setAlertPopSeverity] = useState("success");
  const [message, setAlertPopMessage] = useState("This is a success message!");



  const handleAlertClose = () => {
    setAlertPopOpen(false);
  };

  // const openApp = async (item) => {
  //   const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
  //   //   console.log(url)
  //   try {
  //     const response = await axios.get(url);
  //     const data = response.data;
  //     // const extension = data[0]?.extension?.toLowerCase();
  //     const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();

  //     if (extension === 'pdf' || extension === 'ppt' || extension === 'csv' || extension === 'xlsx' || extension === 'xls' || extension === 'docx' || extension === 'doc' || extension === 'txt') {
  //       const updatedItem = {
  //         ...item,
  //         guid: props.selectedVault.guid,
  //         extension: extension,
  //         type: item.objectTypeId ?? item.objectID
  //       };


  //       // Display extension in alert

  //       // Set the object to be edited and open the modal
  //       setObjectToEditOnOfficeApp(updatedItem);
  //       setOpenOfficeApp(true);
  //     } else {
  //       alert(`This file type ${extension} is not supported for editing.`);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching the extension:', error);

  //   }

  // }

  function openApp(item) {
    // console.log(item)
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;

      try {
        const response = await axios.get(url);
        const data = response.data;
        const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        if (['csv', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf', 'ppt'].includes(extension)) {
          setObjectToEditOnOfficeApp({
            ...item,
            guid: props.selectedVault.guid,
            extension,
            type: item.objectTypeId ?? item.objectID
          });
          setOpenOfficeApp(true);
        }
      } catch { }
    };
    fetchExtension();
  }


  const handleRowClick = (subItem) => {
    if (subItem.objectID === 0) {
      previewSublistObject(subItem, false);
    } else {
      previewObject(subItem, false);
    }
  };


  const restoreObject = async (item) => {


    let data = JSON.stringify(
      {
        "vaultGuid": `${props.selectedVault.guid}`,
        "objectId": item.id,
        "classId": item.classID,
        "userID": props.mfilesId
      }

    );
    // console.log(data)
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${constants.mfiles_api}/api/ObjectDeletion/UnDeleteObject`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    await axios.request(config)
      .then((response) => {
        props.resetViews()
        setAlertPopOpen(true);
        setAlertPopSeverity("success");
        setAlertPopMessage("Object was restored successsfully")

      })
      .catch((error) => {
        setOpenAlert(true);
        setAlertSeverity("error");
        setAlertMsg("Failed to restore, please try again later");


        // console.log(error);
      });


  }

  const toggleSidebar = () => {
    if (props.sidebarOpen) {
      props.setSidebarOpen(false)
    } else {
      props.setSidebarOpen(true)
    }


  }

  const resetPreview = () => {
    setSelectedItemId(null);
    setBase64('')
    setExtension('')
    setSelectedObject({});
    setPreviewObjectProps([]);
    setComments([])

  }

  function toolTipTitle(item) {
    return (
      <span>
        {item.title}
        {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) ? (
          <FileExtText
            guid={props.selectedVault.guid}
            objectId={item.id}
            classId={item.classId || item.classID}
          />
        ) : null}
      </span>
    );
  }

  function handleClick(item) {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    clickTimeout = setTimeout(() => {
      setSelectedItemId(`${item.id}-${item.title}`);
      if ((item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true)) {
        previewSublistObject(item, true);
      } else {
        previewObject(item, true);
      }
    }, 250); // Delay to allow doubleClick to cancel it
  }



  function handleDoubleClick(item) {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    if (item.objectTypeId === 0 || item.objectID === 0) {
      openApp(item);
    }
  }



  const handleMouseDown = useCallback((e) => {
    // Only start dragging if the left mouse button is pressed (button 0)
    if (e.button === 0 && !isMobile) {
      setIsDragging(true);
    }
  }, [isMobile]);


  const rightClickActions = [
    ...(menuItem && (menuItem.isSingleFile === true) && (menuItem.objectID === 0 || menuItem.objectTypeId === 0) ? [
      {
        label: (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <FileExtIcon
              fontSize={'24px'}
              guid={props.selectedVault.guid}
              objectId={menuItem.id}
              classId={menuItem.classId !== undefined ? menuItem.classId : menuItem.classID}
            />
            <span className='mx-2'>Open</span>
            <span className='text-muted' style={{ marginLeft: '8px', marginRight: 0, marginLeft: 'auto', fontWeight: 500 }}>
              Open in default application
            </span>
          </span>
        ),
        onClick: (itm) => {
          openApp(itm);
          handleMenuClose();
        }
      }
    ] : []),
    // ...(menuItem && menuItem.userPermission && menuItem.userPermission.deletePermission ? [
    //   {
    //     label: (
    //         <span style={{fontSize: '13px'}}>
    //         <i className="fa-solid fa-trash-can" style={{ marginRight: '6px', color: '#2757aa' }}></i>
    //         Delete
    //       </span>
    //     ),
    //     onClick: (itm) => {
    //       deleteObject(itm);
    //       handleMenuClose();
    //     }
    //   }
    // ] : []),
    ...(menuItem && menuItem.userPermission && menuItem.userPermission.editPermission &&
      file?.extension &&
      [
        'docx', 'doc', 'xlsx', 'xls', 'ppt', 'csv',
        'jpg', 'jpeg', 'png', 'gif'
      ].includes(file.extension.toLowerCase())
      ? [
        {
          label: (
            <span className='mx-3'>
              Convert to PDF overwrite Original Copy
            </span>
          ),
          onClick: (itm) => {
            convertToPDF(itm, true);
            handleMenuClose();
          }
        }
      ] : []),
    ...(menuItem && menuItem.userPermission && menuItem.userPermission.editPermission &&
      file?.extension &&
      [
        'docx', 'doc', 'xlsx', 'xls', 'ppt', 'csv',
        'jpg', 'jpeg', 'png', 'gif'
      ].includes(file.extension.toLowerCase())
      ? [
        {
          label: (
            <span className='mx-3'>
              Convert to PDF Keep Original Copy
            </span>
          ),
          onClick: (itm) => {
            convertToPDF(itm, false);
            handleMenuClose();
          }
        }
      ] : [])
  ];



  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    let animationFrameId;

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const containerWidth = containerRef.current?.getBoundingClientRect().width;
        if (!containerWidth) return;

        let newCol1Width = (e.clientX / containerWidth) * 100;

        // Clamp width to avoid layout breaking
        newCol1Width = Math.min(90, Math.max(10, newCol1Width));
        const newCol2Width = 100 - newCol1Width;

        // Apply widths
        if (col1Ref.current) col1Ref.current.style.width = `${newCol1Width}%`;
        if (col2Ref.current) col2Ref.current.style.width = `${newCol2Width}%`;

        setPreviewWindowWidth(`${newCol2Width}%`);
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isDragging, isMobile]);




 return (
  <>
    <ConfirmUpdateDialog
      open={dialogOpen}
      onClose={handleCloseDialog}
      onConfirm={updateObjectMetadata}
      uptatingObject={uptatingObject}
      message={selectedObject.title}
      discardChange={discardChange}
    />

    <TimedAlert
      open={alertOpen}
      onClose={handleAlertClose}
      severity={severity}
      message={message}
      setSeverity={setAlertPopSeverity}
      setMessage={setAlertPopMessage}
    />

    <OfficeApp
      open={openOfficeApp}
      close={() => setOpenOfficeApp(false)}
      object={objectToEditOnOffice}
      mfilesId={props.mfilesId}
    />

    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      backgroundColor: '#dedddd', 
      height: '100vh' 
    }} ref={containerRef}>
      {/* Object List */}
      <Box 
        ref={col1Ref} 
        sx={{ 
          width: isMobile ? '100%' : '40%', 
          backgroundColor: '#fff', 
          minWidth: '25%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          fontSize: '13px',
          backgroundColor: '#fff',
          color: '#1C4690',
          overflow: 'hidden'
        }}>
          {/* Logo + Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              onClick={toggleSidebar}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f0f4fa',
                  transform: 'scale(1.05)',
                },
              }}
            >
              <i className="fa-solid fa-bars" style={{ fontSize: '25px', color: '#2757aa' }} />
            </Box>
            <img
              src={logo}
              alt="Logo"
              width="150"
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
            />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Switch to a different vault" placement="left">
              <Box sx={{ cursor: 'pointer' }}>
                <VaultSelectForm activeVault={props.selectedVault} />
              </Box>
            </Tooltip>
            <Tooltip title={`${props.user.first_name} ${props.user.last_name}`}>
              <Avatar
                alt={`${props.user.first_name} ${props.user.last_name}`}
                {...props.stringAvatar(
                  props.user.first_name && props.user.last_name
                    ? `${props.user.first_name} ${props.user.last_name}`
                    : props.user.first_name || props.user.last_name || props.user.username
                )}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#2757aa',
                  fontSize: '13px',
                }}
              />
            </Tooltip>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          backgroundColor: '#ecf4fc',
          p: 1
        }}>
          <Box sx={{ display: 'flex', width: '100%', maxWidth: '900px', gap: 1 }}>
            {/* Left Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 , mx:2}}>
              <Tooltip title="Go back home">
                <i
                  onClick={reloadPage}
                  className="fas fa-home"
                  style={{
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: '#1C4690',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                  }}
                />
              </Tooltip>
              <AddButtonWithMenu vaultObjectsList={props.vaultObjectsList} fetchItemData={props.fetchItemData} />
            </Box>

            {/* Search Input */}
            <Box sx={{ flex: 1 }}>
              <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
                <input
                  type="text"
                  required
                  placeholder="Search"
                  value={props.searchTerm}
                  onChange={(e) => props.setSearchTerm(e.target.value)}
                  className="form-control form-control-md"
                  style={{
                    fontSize: '13px',
                    borderRadius: '6px',
                    width: '100%',
                    paddingRight: '40px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-search text-muted" style={{ fontSize: '15px' }} />
                </button>
              </form>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          variant="scrollable"
          value={value}
          onChange={handleChange}
          sx={{
            borderColor: 'divider',
            backgroundColor: '#ecf4fc',
            minHeight: '36px',
            '& .MuiTab-root': {
              minHeight: '36px',
              height: '36px',
              p: '4px 13px',
              backgroundColor: '#ecf4fc',
              minWidth: 'auto',
              textTransform: 'none'
            }
          }}
        >
          {['All', 'Recent', 'Assigned', 'Deleted'].map((label, index) => (
            <Tab
              key={index}
              label={label}
              onClick={() => {
                resetPreview();
                if (label === 'All') setSearched(false);
                if (label === 'Recent') props.getRecent?.();
                if (label === 'Assigned') props.getAssigned?.();
              }}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <CustomTabPanel value={value} index={0} style={{ backgroundColor: '#fff', padding: 0, width: '100%', height: '100%' }}>
            {loading ? (
              <Loader />
            ) : (
              <>
                {searched ? (
                  <>
                    {props.data?.length > 0 ? (
                      <Box>
                        {/* Header */}
                        <Box  sx={{ 
                          p: 1, 
                          fontSize: '13px', 
                          backgroundColor: '#ecf4fc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#333'
                        }}>
                          <i className="fas fa-list" style={{ fontSize: '1.5em', color: '#1C4690' }} />
                          Search Results
                        </Box>

                        {/* Column Headers */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: '4px 10px',
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          color: '#555'
                        }}>
                          <Box sx={{ ml: '10%', flex: 1 }}>Name</Box>
                          <Box sx={{ mr: '10%', width: 160, textAlign: 'right' }}>Date Modified</Box>
                        </Box>

                        {/* Items List */}
                        <Box sx={{ 
                          height: '60vh', 
                          overflowY: 'auto',
                          color: '#333'
                        }}>
                          {props.data.map((item, index) => (
                            <SimpleTreeView key={`search-view-${index}`}>
                              <TreeItem
                                key={`tree-item-${index}`}
                                itemId={`tree-item-${index}`}
                                onClick={() => handleClick(item)}
                                onDoubleClick={() => handleDoubleClick(item)}
                                sx={{
                                  fontSize: "13px",
                                  "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                  "& .MuiTypography-root": { fontSize: "13px !important" },
                                  backgroundColor: '#fff !important',
                                  "&:hover": { backgroundColor: '#fff !important' },
                                  borderRadius: 0,
                                  "& .MuiTreeItem-content": { borderRadius: 0 },
                                  "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                  "& .MuiTreeItem-content:hover": { backgroundColor: '#fff !important' },
                                  "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                }}
                                label={
                                  <Box
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      handleRightClick(e, item);
                                    }}
                                    sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
                                  >
                                    <Box sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      p: 0.5,
                                      backgroundColor: selectedItemId === `${item.id}-${item.title}` ? '#fcf3c0' : 'inherit',
                                      width: '100%',
                                      gap: 1
                                    }}>
                                      {/* Icon */}
                                      {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) ? (
                                        <FileExtIcon
                                          fontSize={'15px'}
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                          sx={{ flexShrink: 0 }}
                                        />
                                      ) : (
                                        <i 
                                          className={
                                            (item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === false)
                                              ? 'fas fa-book' 
                                              : 'fa-solid fa-folder'
                                          }
                                          style={{ 
                                            color: (item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === false) 
                                              ? '#7cb518' 
                                              : '#2a68af',
                                            fontSize: '15px',
                                            flexShrink: 0
                                          }}
                                        />
                                      )}

                                      {/* Title */}
                                      <Box sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}>
                                        <Tooltip title={toolTipTitle(item)} placement="right" arrow>
                                          <Box sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 220,
                                          }}>
                                            {item.title}
                                          </Box>
                                        </Tooltip>
                                        {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) && (
                                          <FileExtText
                                            guid={props.selectedVault.guid}
                                            objectId={item.id}
                                            classId={item.classId || item.classID}
                                          />
                                        )}
                                      </Box>

                                      {/* Date */}
                                      <Box sx={{ 
                                        fontSize: '12px', 
                                        color: '#888', 
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0 
                                      }}>
                                        {item.lastModifiedUtc ? (() => {
                                          const date = new Date(item.lastModifiedUtc);
                                          if (isNaN(date.getTime())) return '';
                                          return date.toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                          }).replace(',', '');
                                        })() : ''}
                                      </Box>
                                    </Box>
                                  </Box>
                                }
                              >
                                {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === false) && (
                                  <MultifileFiles 
                                    item={item} 
                                    downloadFile={downloadFile} 
                                    selectedItemId={selectedItemId} 
                                    setSelectedItemId={setSelectedItemId} 
                                    selectedVault={props.selectedVault} 
                                  />
                                )}
                                <LinkedObjectsTree 
                                  id={item.id} 
                                  classId={item.classId || item.classID}
                                  objectType={(item.objectTypeId || item.objectID)} 
                                  selectedVault={props.selectedVault} 
                                  mfilesId={props.mfilesId} 
                                  handleRowClick={handleRowClick} 
                                  setSelectedItemId={setSelectedItemId} 
                                  selectedItemId={selectedItemId} 
                                  downloadFile={downloadFile} 
                                />
                              </TreeItem>
                            </SimpleTreeView>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ 
                          p: 2, 
                          fontSize: '13px', 
                          backgroundColor: '#ecf4fc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#333'
                        }}>
                          <i className="fas fa-list" style={{ fontSize: '1.5em', color: '#1C4690' }} />
                          Search Results
                        </Box>
                        <Box sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 3,
                          backgroundColor: '#fff'
                        }}>
                          <i className="fa-solid fa-search" style={{ fontSize: '40px', color: '#2757aa', marginBottom: '16px' }} />
                          <Typography variant="body2" sx={{ textAlign: 'center', color: '#333', mb: 1 }}>
                            No Results Found
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px', color: '#333' }}>
                            Please try a different search parameter
                          </Typography>
                        </Box>
                      </>
                    )}
                  </>
                ) : (
                  <ViewsList
                    selectedFileId={selectedFileId}
                    viewableobjects={props.viewableobjects}
                    previewSublistObject={previewSublistObject}
                    selectedObject={selectedObject}
                    loadingobjects={loadingobjects}
                    selectedVault={props.selectedVault}
                    setPreviewObjectProps={setPreviewObjectProps}
                    setLoadingPreviewObject={setLoadingPreviewObject}
                    previewObject={previewObject}
                    setAlertPopOpen={setAlertPopOpen}
                    setAlertPopSeverity={setAlertPopSeverity}
                    setAlertPopMessage={setAlertPopMessage}
                    user={props.user}
                    mfilesId={props.mfilesId}
                    resetPreview={resetPreview}
                    setSelectedItemId={setSelectedItemId}
                    selectedItemId={selectedItemId}
                    downloadFile={downloadFile}
                  />
                )}
              </>
            )}
          </CustomTabPanel>

          {/* Other Tab Panels with similar optimization pattern */}
          {[1, 2, 3].map((tabIndex) => {
            const dataKey = tabIndex === 1 ? 'recentData' : tabIndex === 2 ? 'assignedData' : 'deletedData';
            const title = tabIndex === 1 ? 'Recent' : tabIndex === 2 ? 'Assigned' : 'Deleted By Me';
            const emptyTitle = tabIndex === 1 ? 'Recently Accessed By Me' : tabIndex === 2 ? 'Assigned' : 'Deleted By Me';
            const emptySubtitle = tabIndex === 1 ? 'Recent is Empty' : tabIndex === 2 ? 'Assigned to me is empty' : 'Deleted is empty';
            
            return (
              <CustomTabPanel 
                key={tabIndex}
                value={value} 
                index={tabIndex} 
                style={{ backgroundColor: '#fff', padding: 0, width: '100%', overflowY: 'auto' }}
              >
                {loading ? (
                  <Loader />
                ) : (
                  <>
                    {props[dataKey].length > 0 ? (
                      <Box>
                        {/* Header */}
                        <Box sx={{ 
                          p: 1, 
                          fontSize: '13px', 
                          backgroundColor: '#ecf4fc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#333'
                        }}>
                          <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }} />
                          {title} ({props[dataKey].length})
                        </Box>

                        {/* Column Headers */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: '4px 10px',
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #e0e0e0',
                          fontSize: '12px',
                          color: '#555'
                        }}>
                          <Box sx={{ ml: '10%', flex: 1 }}>Name</Box>
                          <Box sx={{ mr: '10%', width: 160, textAlign: 'right' }}>Date Modified</Box>
                        </Box>

                        {/* Items List */}
                        <Box sx={{ height: '60vh', overflowY: 'auto', color: '#333' }}>
                          {props[dataKey].map((item, index) => (
                            <SimpleTreeView key={`${dataKey}-view-${index}`}>
                              <TreeItem
                                key={`tree-item-${index}`}
                                itemId={`tree-item-${index}`}
                                onClick={() => handleClick(item)}
                                onDoubleClick={() => handleDoubleClick(item)}
                                sx={{
                                  ml: 1,
                                  fontSize: "13px",
                                  "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                  "& .MuiTypography-root": { fontSize: "13px !important" },
                                  backgroundColor: '#fff !important',
                                  "&:hover": { backgroundColor: '#fff !important' },
                                  borderRadius: 0,
                                  "& .MuiTreeItem-content": { borderRadius: 0 },
                                  "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                  "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                }}
                                label={
                                  <Box
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      handleRightClick(e, item);
                                    }}
                                    sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
                                  >
                                    <Box sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      p: 0.5,
                                      backgroundColor: selectedItemId === `${item.id}-${item.title}` ? '#fcf3c0' : 'inherit',
                                      width: '100%',
                                      gap: 1
                                    }}>
                                      {/* Icon */}
                                      {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) ? (
                                        <FileExtIcon
                                          fontSize={'15px'}
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                          sx={{ flexShrink: 0 }}
                                        />
                                      ) : (
                                        <i 
                                          className={
                                            (item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === false)
                                              ? 'fas fa-book' 
                                              : 'fa-solid fa-folder'
                                          }
                                          style={{ 
                                            color: (item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === false) 
                                              ? '#7cb518' 
                                              : '#2a68af',
                                            fontSize: '15px',
                                            flexShrink: 0
                                          }}
                                        />
                                      )}

                                      {/* Title */}
                                      <Box sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}>
                                        <Tooltip title={toolTipTitle(item)} placement="right" arrow>
                                          <Box sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: 220,
                                          }}>
                                            {item.title}
                                          </Box>
                                        </Tooltip>
                                        {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) && (
                                          <FileExtText
                                            guid={props.selectedVault.guid}
                                            objectId={item.id}
                                            classId={item.classId || item.classID}
                                          />
                                        )}
                                      </Box>

                                      {/* Special handling for deleted items */}
                                      {tabIndex === 3 && (
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="warning"
                                          onClick={() => restoreObject(item)}
                                          sx={{ textTransform: 'none' }}
                                          startIcon={<i className="fas fa-trash-restore" style={{ fontSize: '13px' }} />}
                                        >
                                          Restore
                                        </Button>
                                      )}

                                      {/* Date */}
                                      <Box sx={{ 
                                        fontSize: '12px', 
                                        color: '#888', 
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        ml: tabIndex === 3 ? 1 : 0
                                      }}>
                                        {item.lastModifiedUtc ? (() => {
                                          const date = new Date(item.lastModifiedUtc);
                                          if (isNaN(date.getTime())) return '';
                                          return date.toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                          }).replace(',', '');
                                        })() : ''}
                                      </Box>
                                    </Box>
                                  </Box>
                                }
                              >
                                {tabIndex !== 3 && (item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === false) && (
                                  <MultifileFiles 
                                    item={item} 
                                    downloadFile={downloadFile} 
                                    selectedItemId={selectedItemId} 
                                    setSelectedItemId={setSelectedItemId} 
                                    selectedVault={props.selectedVault} 
                                  />
                                )}
                                {tabIndex !== 3 && (
                                  <LinkedObjectsTree 
                                    id={item.id} 
                                     classId={item.classId || item.classID}
                                    objectType={(item.objectTypeId || item.objectID)} 
                                    selectedVault={props.selectedVault} 
                                    mfilesId={props.mfilesId} 
                                    handleRowClick={handleRowClick} 
                                    setSelectedItemId={setSelectedItemId} 
                                    selectedItemId={selectedItemId} 
                                    downloadFile={downloadFile} 
                                  />
                                )}
                              </TreeItem>
                            </SimpleTreeView>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ 
                          p: 1, 
                          fontSize: '13px', 
                          backgroundColor: '#ecf4fc',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#333'
                        }}>
                          <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }} />
                          {emptyTitle}
                        </Box>
                        <Box sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 3,
                          backgroundColor: '#fff'
                        }}>
                          <i className="fa-solid fa-ban" style={{ fontSize: '40px', color: '#2757aa', marginBottom: '16px' }} />
                          <Typography variant="body2" sx={{ textAlign: 'center', color: '#333', mb: 1 }}>
                            No Results Found
                          </Typography>
                          <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px', color: '#333' }}>
                            {emptySubtitle}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </CustomTabPanel>
            );
          })}
        </Box>
      </Box>

      {/* Resizer */}
      {!isMobile && (
        <Box
          onMouseDown={handleMouseDown}
          sx={{
            width: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ddd',
            cursor: 'ew-resize',
            transition: 'width 0.2s ease',
            height: '100vh'
          }}
        />
      )}

      {/* Object View */}
      <Box 
        ref={col2Ref} 
        sx={{ 
          width: isMobile ? '100%' : '60%', 
          backgroundColor: '#ecf4fc', 
          minWidth: '48%',
          height: '100%'
        }}
      >
        <ObjectData 
          setPreviewObjectProps={setPreviewObjectProps}
          setSelectedObject={setSelectedObject}
          resetViews={props.resetViews}
          mfilesId={props.mfilesId}
          user={props.user}
          getObjectComments={getObjectComments2}
          comments={comments}
          loadingcomments={loadingcomments}
          discardChange={discardChange}
          openDialog={() => setDialogOpen(true)}
          updateObjectMetadata={updateObjectMetadata}
          selectedState={selectedState}
          setSelectedState={setSelectedState}
          currentState={currentState}
          selectedObkjWf={selectedObkjWf}
          transformFormValues={transformFormValues}
          formValues={formValues}
          setFormValues={setFormValues}
          vault={props.selectedVault}
          email={props.user.email}
          selectedFileId={selectedFileId}
          previewObjectProps={previewObjectProps}
          loadingPreviewObject={loadingPreviewObject}
          selectedObject={selectedObject}
          extension={extension}
          base64={base64}
          loadingobjects={loadingobjects}
          loadingfile={loadingfile}
          loadingobject={loadingobject}
          windowWidth={previewWindowWidth}
          newWF={newWF}
          newWFState={newWFState}
          setNewWFState={setNewWFState}
          setNewWF={setNewWF}
          workflows={workflows}
          approvalPayload={approvalPayload}
          setApprovalPayload={setApprovalPayload}
          checkedItems={checkedItems}
          setCheckedItems={setCheckedItems}
          loadingWFS={loadingWFS}
        />
      </Box>
    </Box>

    {/* Right Click Menu */}
    {rightClickActions.length > 0 && (
      <RightClickMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        item={menuItem}
        actions={rightClickActions}
      />
    )}
  </>
);
};

export default DocumentList;

