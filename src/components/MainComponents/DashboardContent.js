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
        <Box sx={{ height: '100%', overflowY: 'auto', backgroundColor: '#fff' }}>
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

    console.log(item)
    const payload = {
      vaultGuid: props.selectedVault.guid,  // string
      objectId: item.id,                      // number
      classId: item.classID || item.classId,                       // number
      fileID: file.fileID,                        // number
      overWriteOriginal: overWriteOriginal,           // boolean
      separateFile: overWriteOriginal ? false : true,                // boolean
      userID: props.mfilesId                     // number
    };

    console.log(payload)
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
    } catch (error) {
      console.error('Error converting to PDF:', error);
      // throw error;
    }
  }


  async function fetchObjectFile(item) {
    // const objectType = item.objectTypeId ?? item.objectID;
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/0`;

    try {
      const response = await axios.get(url, {
        headers: {
          Accept: '*/*'
        }
      });

      const file = response.data?.[0];
      setFile(file);
      console.log('Fetched file:', file);
      // alert(`File ID is: ${file.fileID}`)
    } catch (error) {
      console.error('Failed to fetch object file:', error);
      // throw error;
    }
  }

  // Handler for right-click
  const handleRightClick = (event, item) => {
    console.log(item)
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

    } catch (error) {
      setUpdatingObject(false)
      console.error('Error updating object props:', error);
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
    } catch (error) {
      console.error('Error transitioning state:', error);
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
      } catch (error) {
        setUpdatingObject(false);
        console.error('Error transitioning state:', error);
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



  const previewObject = async (item, getLinkedItems) => {
    setWorkflows([])
    setCheckedItems({})
    setNewWF(null)
    setNewWFState(null)
    setComments([])
    setLoadingWFS(true)
    setBase64('');
    setExtension('');

    setSelectedState({})
    setLoadingObject(true)
    setLoadingClick(true)

    setFormValues({})

    setSelectedObject(item)


    getSelectedObjWorkflow((item.objectTypeId || item.objectID), item.id, (item.classId || item.classID))



    try {
      const propsResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}/${props.mfilesId}`);
      console.log(propsResponse.data)
      setPreviewObjectProps(propsResponse.data);
      setLoadingObject(false)
      setLoadingClick(false)
    } catch (error) {
      setLoadingClick(false)
      setLoadingObject(false)


    }

    // }
    getObjectComments(item);
  };

  const previewSublistObject = async (item, getLinkedItems) => {
    setWorkflows([])
    setCheckedItems({})
    setNewWF(null)
    setNewWFState(null)
    setLoadingWFS(true)

    setComments([]);


    setSelectedState({});
    setLoadingObject(true);
    setLoadingClick(true)
    setFormValues({});
    setSelectedObject(item);
    // console.log(item)

    // Fetch the object workflow asynchronously
    getSelectedObjWorkflow((item.objectTypeId || item.objectID), item.id, (item.classId || item.classID))


    try {
      // Fetch view object properties
      const propsResponse = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}/${props.mfilesId}`
      );
      console.log(propsResponse.data)

      setPreviewObjectProps(propsResponse.data);
      setLoadingObject(false)
      setLoadingClick(false)
    } catch (error) {
      setLoadingObject(false);
      setLoadingClick(false)
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("something went wrong, please try again later!");

    } finally {
      setLoadingObject(false);
      setLoadingClick(false)
    }

    // console.log(item.objectID)
    // console.log(item.objectTypeId)

    // Handle document fetching if item is a document
    if (item.objectTypeId === 0 || item.objectID === 0) {


      setLoadingFile(true);

      let url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${(item.objectTypeId ?? item.objectID)}`;

      // console.log(url)
      try {
        // Fetch object files
        const filesResponse = await axios.get(
          url,
          { headers: { Accept: '*/*' } }
        );

        const fileId = filesResponse.data[0].fileID;

        setSelectedFileId(fileId);

        // Download the file using the fileId
        try {
          const downloadResponse = await axios.get(
            `${constants.mfiles_api}/api/objectinstance/DownloadFile/${props.selectedVault.guid}/${item.id}/${(item.objectTypeId ?? item.objectID)}/${fileId}`,
            { headers: { Accept: '*/*' } }
          );

          setLoadingClick(false)
          setBase64(downloadResponse.data.base64);
          setExtension(downloadResponse.data.extension.replace('.', ''));
          let ext = downloadResponse.data.extension.replace('.', '')
          // console.log(ext)
        } catch (downloadError) {
          console.error('Error downloading file:', downloadError);
        } finally {
          setLoadingFile(false);
          setLoadingClick(false)
        }
      } catch (filesError) {
        setLoadingClick(false)
        setAlertPopOpen(true);
        setAlertPopSeverity("error");
        setAlertPopMessage("something went wrong, please try again later!");
        console.error('Error fetching object files:', filesError);
        setLoadingFile(false);
        setLoadingClick(false)
      }
    } else {
      setBase64('');
      setExtension('');
    }

    // Fetch object comments
    getObjectComments(item);
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

  const fetchVaultWorkflows = async (objectTypeId, classId) => {

    try {
      const response = await axios.get(`${constants.mfiles_api}/api/WorkflowsInstance/GetVaultsObjectClassTypeWorkflows/${props.selectedVault.guid}/${props.mfilesId}/${objectTypeId}/${classId}`, {
        headers: {
          'accept': '*/*'
        }
      });
      setLoadingWFS(false)
      setWorkflows(response.data)


    } catch (error) {
      setLoadingWFS(false)
      console.error('Error fetching workflows:', error);


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


    await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/GetObjectworkflowstate`, data, {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        setLoadingWFS(false)
        setSelectedObjWf(response.data)


        setCurrentState({
          title: response.data.currentStateTitle,
          id: response.data.currentStateid
        })
        console.log(response.data)



      })
      .catch(error => {
        fetchVaultWorkflows(objectTypeId, classId)
        console.error('Error:', error);
        setSelectedObjWf(null)


      });
  }

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
      console.log(data)
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
        {item.objectTypeId || item.objectID === 0 ? (
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
      setSelectedItemId(item.id);
      if (item.objectTypeId === 0 || item.objectID === 0) {
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
    ...(menuItem && (menuItem.objectID === 0 || menuItem.objectTypeId === 0) ? [
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
      />

      <LoadingDialog opendialogloading={loadingClick} />


      <div id="container" ref={containerRef} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', backgroundColor: '#dedddd', height: 'auto' }}>
        {/* Object List */}
        <div id="col1" ref={col1Ref} style={{ width: isMobile ? '100%' : '40%', backgroundColor: '#fff', minWidth: '25%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              fontSize: '13px',
              backgroundColor: '#fff',
              color: '#1C4690',
              overflowX: 'hidden'
            }}
          >
            {/* Logo + Menu Icon */}
            <Box display="flex" alignItems="center">
              {/* Sidebar Toggle Icon */}
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

              {/* Logo */}
              <img
                src={logo}
                alt="Logo"
                width="150"
                className="mx-3"
                style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
              />
            </Box>

            {/* Right Section: Vault + Avatar */}
            <Box display="flex" alignItems="center">
              {/* Vault Selector */}
              <Tooltip title="Switch to a different vault" placement="left">
                <Box className="mx-2" sx={{ cursor: 'pointer' }}>
                  <VaultSelectForm activeVault={props.selectedVault} />
                </Box>
              </Tooltip>

              {/* User Avatar */}
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
                    ml: 2,
                  }}
                />
              </Tooltip>
            </Box>
          </Box>

          <div
            className="d-flex justify-content-center shadow-sm p-2"
            style={{ backgroundColor: '#ecf4fc' }}
          >
            <div className="d-flex w-100" style={{ maxWidth: '900px' }}>
              {/* Left side: Vault Selector - 50% width */}
              <div className="d-flex align-items-center " style={{ flex: '1 1 20%' }}>

                <Tooltip title="Go back home">
                  <i
                    onClick={reloadPage}
                    className="fas fa-home mx-3"
                    style={{
                      fontSize: '30px',
                      cursor: 'pointer',
                      color: '#1C4690',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                    }}
                  ></i>
                </Tooltip>

                {/* <Tooltip title="Create/Add new object or document">
                  <i
                    onClick={props.getVaultObjects}
                    className="fas fa-plus mx-2"
                    style={{
                      fontSize: '25px',
                      cursor: 'pointer',
                      color: '#1C4690',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                    }}
                  ></i>
                </Tooltip> */}
                <AddButtonWithMenu vaultObjectsList={props.vaultObjectsList} fetchItemData={props.fetchItemData} />

              </div>

              {/* Right side: Action Icons - 50% width, right aligned */}
              <div
                className="d-flex align-items-center "
                style={{ flex: '1 1 80%' }}
              >
                {/* Search Input */}
                <form onSubmit={handleSearch} className="position-relative flex-grow-1 me-3">
                  <input
                    type="text"
                    required
                    placeholder="Search"
                    value={props.searchTerm}
                    onChange={(e) => props.setSearchTerm(e.target.value)}
                    className="form-control form-control-md ps-3 pe-5 mx-2"
                    style={{
                      fontSize: '13px',
                      borderRadius: '6px',

                      width: '100%',
                    }}
                  />
                  <button
                    type="submit"
                    className="btn position-absolute end-0 top-0 mt-1 me-2 p-0 border-0 bg-transparent"
                    style={{ height: '30px', width: '30px' }}
                  >
                    <i className="fas fa-search text-muted" style={{ fontSize: '15px' }}></i>
                  </button>
                </form>

              </div>
            </div>
          </div>





          <Tabs
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Horizontal tabs example"
            className="p-1"
            sx={{
              borderColor: 'divider',
              // backgroundColor: '#fff',
              backgroundColor: '#ecf4fc',
              minHeight: '36px',  // Reduced overall tab bar height
            }}
          >
            {['All', 'Recent', 'Assigned', 'Deleted'].map((label, index) => (
              <Tab
                key={index}
                style={{ textTransform: 'none' }}
                label={label}
                onClick={() => {
                  resetPreview();
                  if (label === 'All') setSearched(false);
                  if (label === 'Recent') props.getRecent?.();
                  if (label === 'Assigned') props.getAssigned?.();

                }}
                {...a11yProps(index)}
                sx={{
                  minHeight: '36px',
                  height: '36px',
                  padding: '4px 13px',

                  backgroundColor: '#ecf4fc',
                  minWidth: 'auto',
                }}
              />
            ))}
          </Tabs>

          <CustomTabPanel
            value={value}
            index={0}
            style={{
              backgroundColor: '#fff',
              padding: '0%',
              width: '100%',

            }}
          >

            {loading ? (
              <Loader />

            ) : (
              <>
                {searched ?
                  <>
                    {props.data?.length > 0 ? (
                      <div>
                        <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                          {/* <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          <span onClick={() => props.setData([])} style={{ cursor: 'pointer', width: '0.05px' }}>Back to views</span> */}
                          {/* <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span> */}
                          <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          Search Results
                        </h6>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 10px 4px 10px',
                            backgroundColor: '#fff',
                            borderBottom: '1px solid #e0e0e0',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#555'
                          }}
                        >
                          <span style={{ marginLeft: '10%', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Name
                          </span>
                          <span style={{ marginRight: '10%', width: 160, textAlign: 'right', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                            Date Modified
                          </span>
                        </div>


                        <div className='p-2 text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                          {props.data.map((item, index) => (

                            <SimpleTreeView>
                              <TreeItem
                                key={`tree-item-${index}`} // Unique key
                                itemId={`tree-item-${index}`} // Unique itemId
                                onClick={() => handleClick(item)}
                                // onDoubleClick={() => handleDoubleClick(item)}


                                sx={{

                                  fontSize: "13px", // Apply directly to TreeItem
                                  "& .MuiTreeItem-label": { fontSize: "13px !important" }, // Force label font size
                                  "& .MuiTypography-root": { fontSize: "13px !important" }, // Ensure all text respects this

                                  backgroundColor: '#fff !important',
                                  "&:hover": {
                                    backgroundColor: '#fff !important', // Maintain white background on hover
                                  },

                                  borderRadius: "0px !important", // Remove border radius
                                  "& .MuiTreeItem-content": {
                                    borderRadius: "0px !important", // Remove border radius from content area
                                  },
                                  "& .MuiTreeItem-content.Mui-selected": {
                                    backgroundColor: '#fff !important', // Keep white even when selected and hovered
                                  },
                                  "& .MuiTreeItem-content:hover": {
                                    backgroundColor: '#fff !important', // Keep white even when selected and hovered
                                  },


                                  "& .MuiTreeItem-content.Mui-selected:hover": {
                                    backgroundColor: '#fff !important', // Keep white even when selected and hovered
                                  },
                                }}
                                label={
                                  <div
                                    onContextMenu={(e) => {
                                      e.preventDefault();
                                      handleRightClick(e, item);

                                    }}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                                  >
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      sx={{ padding: '3px', backgroundColor: selectedItemId === item.id ? '#fcf3c0' : 'inherit', width: '100%' }}
                                    >
                                      {item.objectTypeId || item.objectID === 0 ? (
                                        <FileExtIcon
                                          fontSize={'15px'}
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                        />
                                      ) : (
                                        <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                      )}
                                      <span
                                        style={{
                                          marginLeft: '8px',
                                          flex: 1,
                                          minWidth: 0,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          paddingRight: '16px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Tooltip title={toolTipTitle(item)} placement="right" arrow>
                                          <span
                                            style={{
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap',
                                              maxWidth: 220,
                                              display: 'inline-block',
                                              verticalAlign: 'middle'
                                            }}
                                          >
                                            {item.title}
                                          </span>
                                        </Tooltip>
                                        {item.objectTypeId || item.objectID === 0 ? (
                                          <FileExtText
                                            guid={props.selectedVault.guid}
                                            objectId={item.id}
                                            classId={item.classId || item.classID}
                                          />
                                        ) : null}
                                      </span>
                                      <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                                        {item.lastModifiedUtc
                                          ? (() => {
                                            const date = new Date(item.lastModifiedUtc);
                                            if (isNaN(date.getTime())) return '';
                                            return date
                                              .toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                              })
                                              .replace(',', '');
                                          })()
                                          : ''}
                                      </span>
                                    </Box>
                                  </div>
                                }
                              >

                                <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId || item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} setSelectedItemId={setSelectedItemId} selectedItemId={selectedItemId} />
                              </TreeItem>
                            </SimpleTreeView>

                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                          {/* <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          <span onClick={() => props.setData([])} style={{ cursor: 'pointer', width: '0.05px' }}>Back to views</span> */}
                          {/* <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span> */}
                          <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          Search Results
                        </h6>
                        <Box
                          sx={{
                            width: '100%',

                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            padding: '20px',
                            backgroundColor: '#fff'
                          }}
                        >
                          <i
                            className="fa-solid fa-search my-3"
                            style={{ fontSize: '40px', color: '#2757aa' }}
                          />


                          <Typography
                            variant="body2"
                            className='my-2 text-dark'
                            sx={{ textAlign: 'center' }}
                          >
                            No Results Found
                          </Typography>
                          <Typography
                            variant="body2"
                            className='text-dark'
                            sx={{ textAlign: 'center', fontSize: '13px' }}
                          >
                            Please try a different search paramenter
                          </Typography>

                        </Box>

                      </>
                    )}
                  </>
                  :
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



                  />

                }
              </>
            )}



          </CustomTabPanel>

          <CustomTabPanel
            value={value}
            index={1}
            style={{
              backgroundColor: '#fff',
              // height: '100%',
              padding: '0%',
              width: '100%',
              overflowY: 'auto'
            }}
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                {props.recentData.length > 0 ? (
                  <div >
                    <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Recently Modified By Me ({props.recentData.length})
                    </h6>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 10px 4px 10px',
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #e0e0e0',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#555'
                      }}
                    >
                      <span style={{ marginLeft: '10%', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Name
                      </span>
                      <span style={{ marginRight: '10%', width: 160, textAlign: 'right', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        Date Modified
                      </span>
                    </div>


                    <div className=' text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                      {props.recentData.map((item, index) => (

                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() => handleClick(item)}
                            // onDoubleClick={() => handleDoubleClick(item)}

                            className='my-1'


                            sx={{
                              marginLeft: '10px',
                              fontSize: "13px", // Apply directly to TreeItem
                              "& .MuiTreeItem-label": { fontSize: "13px !important" }, // Force label font size
                              "& .MuiTypography-root": { fontSize: "13px !important" }, // Ensure all text respects this

                              backgroundColor: '#fff !important',
                              "&:hover": {
                                backgroundColor: '#fff !important', // Maintain white background on hover
                              },

                              borderRadius: "0px !important", // Remove border radius
                              "& .MuiTreeItem-content": {
                                borderRadius: "0px !important", // Remove border radius from content area
                              },
                              "& .MuiTreeItem-content.Mui-selected": {
                                backgroundColor: '#fff !important', // Keep white even when selected and hovered
                              },

                              "& .MuiTreeItem-content.Mui-selected:hover": {
                                backgroundColor: '#fff !important', // Keep white even when selected and hovered
                              },
                            }}
                            label={
                              <div
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  handleRightClick(e, item);

                                }}
                                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  sx={{ padding: '3px', backgroundColor: selectedItemId === item.id ? '#fcf3c0' : 'inherit', width: '100%' }}
                                >
                                  {item.objectTypeId || item.objectID === 0 ? (
                                    <FileExtIcon
                                      fontSize={'15px'}
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  ) : (
                                    <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                  )}
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      flex: 1,
                                      minWidth: 0,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      paddingRight: '16px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Tooltip title={toolTipTitle(item)} placement="right" arrow>
                                      <span
                                        style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: 220,
                                          display: 'inline-block',
                                          verticalAlign: 'middle'
                                        }}
                                      >
                                        {item.title}
                                      </span>
                                    </Tooltip>
                                    {item.objectTypeId || item.objectID === 0 ? (
                                      <FileExtText
                                        guid={props.selectedVault.guid}
                                        objectId={item.id}
                                        classId={item.classId || item.classID}
                                      />
                                    ) : null}
                                  </span>
                                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                                    {item.lastModifiedUtc
                                      ? (() => {
                                        const date = new Date(item.lastModifiedUtc);
                                        if (isNaN(date.getTime())) return '';
                                        return date
                                          .toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                          })
                                          .replace(',', '');
                                      })()
                                      : ''}
                                  </span>
                                </Box>
                              </div>
                            }
                          >

                            <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId || item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} setSelectedItemId={setSelectedItemId} selectedItemId={selectedItemId} />
                          </TreeItem>
                        </SimpleTreeView>

                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Recently Modified By Me
                    </h6>


                    <Box
                      sx={{
                        width: '100%',

                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        padding: '20px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <i
                        className="fa-solid fa-ban my-3"
                        style={{ fontSize: '40px', color: '#2757aa' }}
                      />


                      <Typography
                        variant="body2"
                        className='my-2 text-dark'
                        sx={{ textAlign: 'center' }}
                      >
                        No Results Found
                      </Typography>
                      <Typography
                        variant="body2"
                        className='text-dark'
                        sx={{ textAlign: 'center', fontSize: '13px' }}
                      >
                        Recent is Empty
                      </Typography>

                    </Box>
                  </>
                )}
              </>
            )}



          </CustomTabPanel>

          <CustomTabPanel
            value={value}
            index={2}
            style={{
              backgroundColor: '#fff',
              // height: '100%',
              padding: '0%',
              width: '100%',
              overflowY: 'auto'
            }}
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                {props.assignedData.length > 0 ? (
                  <div >
                    <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Assigned ({props.assignedData.length})
                    </h6>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 10px 4px 10px',
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #e0e0e0',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#555'
                      }}
                    >
                      <span style={{ marginLeft: '10%', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Name
                      </span>
                      <span style={{ marginRight: '10%', width: 160, textAlign: 'right', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        Date Modified
                      </span>
                    </div>


                    <div className='text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                      {props.assignedData.map((item, index) => (

                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() => handleClick(item)}
                            // onDoubleClick={() => handleDoubleClick(item)}

                            className='my-1'


                            sx={{
                              marginLeft: '10px',
                              fontSize: "13px", // Apply directly to TreeItem
                              "& .MuiTreeItem-label": { fontSize: "13px !important" }, // Force label font size
                              "& .MuiTypography-root": { fontSize: "13px !important" }, // Ensure all text respects this

                              backgroundColor: '#fff !important',
                              "&:hover": {
                                backgroundColor: '#fff !important', // Maintain white background on hover
                              },

                              borderRadius: "0px !important", // Remove border radius
                              "& .MuiTreeItem-content": {
                                borderRadius: "0px !important", // Remove border radius from content area
                              },
                              "& .MuiTreeItem-content.Mui-selected": {
                                backgroundColor: '#fff !important', // Keep white even when selected and hovered
                              },

                              "& .MuiTreeItem-content.Mui-selected:hover": {
                                backgroundColor: '#fff !important', // Keep white even when selected and hovered
                              },
                            }}
                            label={
                              <div
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  handleRightClick(e, item);

                                }}
                                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  sx={{ padding: '3px', backgroundColor: selectedItemId === item.id ? '#fcf3c0' : 'inherit', width: '100%' }}
                                >
                                  {item.objectTypeId || item.objectID === 0 ? (
                                    <FileExtIcon
                                      fontSize={'15px'}
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  ) : (
                                    <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                  )}
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      flex: 1,
                                      minWidth: 0,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      paddingRight: '16px',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <Tooltip title={toolTipTitle(item)} placement="right" arrow>
                                      <span
                                        style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: 220,
                                          display: 'inline-block',
                                          verticalAlign: 'middle'
                                        }}
                                      >
                                        {item.title}
                                      </span>
                                    </Tooltip>
                                    {item.objectTypeId || item.objectID === 0 ? (
                                      <FileExtText
                                        guid={props.selectedVault.guid}
                                        objectId={item.id}
                                        classId={item.classId || item.classID}
                                      />
                                    ) : null}
                                  </span>
                                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                                    {item.lastModifiedUtc
                                      ? (() => {
                                        const date = new Date(item.lastModifiedUtc);
                                        if (isNaN(date.getTime())) return '';
                                        return date
                                          .toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                          })
                                          .replace(',', '');
                                      })()
                                      : ''}
                                  </span>
                                </Box>
                              </div>
                            }
                          >

                            <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId || item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} setSelectedItemId={setSelectedItemId} selectedItemId={selectedItemId} />
                          </TreeItem>
                        </SimpleTreeView>

                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Assigned
                    </h6>

                    <Box
                      sx={{
                        width: '100%',

                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        padding: '20px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <i
                        className="fa-solid fa-ban my-3"
                        style={{ fontSize: '40px', color: '#2757aa' }}
                      />


                      <Typography
                        variant="body2"
                        className='my-2 text-dark'
                        sx={{ textAlign: 'center' }}
                      >
                        No Results Found
                      </Typography>
                      <Typography
                        variant="body2"
                        className='text-dark'
                        sx={{ textAlign: 'center', fontSize: '13px' }}
                      >
                        Assigned to me is empty
                      </Typography>

                    </Box>

                  </>
                )}
              </>
            )}

          </CustomTabPanel >

          <CustomTabPanel
            value={value}
            index={3}
            style={{
              backgroundColor: '#fff',
              // height: '100%',
              padding: '0%',
              width: '100%',
              overflowY: 'auto'
            }}
          >
            {loading ? (
              <Loader />
            ) : (
              <>
                {props.deletedData.length > 0 ? (
                  <div >
                    <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Deleted By Me ({props.deletedData.length})
                    </h6>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 10px 4px 10px',
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #e0e0e0',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#555'
                      }}
                    >
                      <span style={{ marginLeft: '10%', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Name
                      </span>
                      <span style={{ marginRight: '10%', width: 160, textAlign: 'right', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        Date Modified
                      </span>
                    </div>


                    <div className='text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                      {props.deletedData.map((item, index) => (

                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() => handleClick(item)}
                            // onDoubleClick={() => handleDoubleClick(item)}

                            className='my-1'


                            sx={{
                              marginLeft: '10px',
                              fontSize: "13px", // Apply directly to TreeItem
                              "& .MuiTreeItem-label": { fontSize: "13px !important" }, // Force label font size
                              "& .MuiTypography-root": { fontSize: "13px !important" }, // Ensure all text respects this

                              backgroundColor: '#fff !important',
                              "&:hover": {
                                backgroundColor: '#fff !important', // Maintain white background on hover
                              },

                              borderRadius: "0px !important", // Remove border radius
                              "& .MuiTreeItem-content": {
                                borderRadius: "0px !important", // Remove border radius from content area
                              },
                              "& .MuiTreeItem-content.Mui-selected": {
                                backgroundColor: '#fff !important', // Keep white even when selected and hovered
                              },

                              "& .MuiTreeItem-content.Mui-selected:hover": {
                                backgroundColor: '#fff !important', // Keep white even when selected and hovered
                              },
                            }}
                            label={
                              <div
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  handleRightClick(e, item);

                                }}
                                style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                              >
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  sx={{ padding: '3px', backgroundColor: selectedItemId === item.id ? '#fcf3c0' : 'inherit', width: '100%' }}
                                >
                                  {item.objectTypeId || item.objectID === 0 ? (
                                    <FileExtIcon
                                      fontSize={'15px'}
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  ) : (
                                    <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                  )}
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      flex: 1,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      paddingRight: '16px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      minWidth: 0
                                    }}
                                  >
                                    <Tooltip title={toolTipTitle(item)} placement="right" arrow>
                                      <span
                                        style={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          maxWidth: 220,
                                          display: 'inline-block',
                                          verticalAlign: 'middle'
                                        }}
                                      >
                                        {item.title}
                                      </span>
                                    </Tooltip>
                                    {item.objectTypeId || item.objectID === 0 ? (
                                      <FileExtText
                                        guid={props.selectedVault.guid}
                                        objectId={item.id}
                                        classId={item.classId || item.classID}
                                      />
                                    ) : null}
                                  </span>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="warning"
                                    onClick={() => restoreObject(item)}
                                    sx={{ textTransform: 'none', marginLeft: 1 }}
                                  >
                                    <i
                                      className="fas fa-trash-restore"
                                      style={{
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        marginRight: '4px'
                                      }}
                                    />
                                    <small>Restore</small>
                                  </Button>
                                  <span style={{ marginLeft: '12px', fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>
                                    {item.lastModifiedUtc
                                      ? (() => {
                                        const date = new Date(item.lastModifiedUtc);
                                        if (isNaN(date.getTime())) return '';
                                        return date
                                          .toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                          })
                                          .replace(',', '');
                                      })()
                                      : ''}
                                  </span>
                                </Box>
                              </div>

                            }
                          >


                          </TreeItem>
                        </SimpleTreeView>

                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <h6 className='p-2 text-dark my-1' style={{ fontSize: '13px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Deleted By Me
                    </h6>
                    <Box
                      sx={{
                        width: '100%',

                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        padding: '20px',
                        backgroundColor: '#fff'
                      }}
                    >
                      <i
                        className="fa-solid fa-ban my-3"
                        style={{ fontSize: '40px', color: '#2757aa' }}
                      />


                      <Typography
                        variant="body2"
                        className='my-2 text-dark'
                        sx={{ textAlign: 'center' }}
                      >
                        No Results Found
                      </Typography>
                      <Typography
                        variant="body2"
                        className='text-dark'
                        sx={{ textAlign: 'center', fontSize: '13px' }}
                      >
                        Deleted is empty
                      </Typography>

                    </Box>

                  </>
                )}
              </>
            )}

          </CustomTabPanel>





        </div >

        {!isMobile && (
          // <div id="divider" ref={dividerRef} onMouseDown={handleMouseDown} style={{ width: '5px', cursor: 'ew-resize', backgroundColor: '#dedddd', height: '100vh' }}></div>
          <div
            style={{
              width: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ddd',
              cursor: 'ew-resize',
              transition: 'width 0.2s ease',
              height: '100vh'
            }}
            // onMouseEnter={(e) => (e.currentTarget.style.width = '10px')}
            // onMouseLeave={(e) => (e.currentTarget.style.width = '5px')}
            onMouseDown={handleMouseDown}
          >
            {/* <button
            onMouseDown={handleMouseDown}
            style={{
              width: '4px',
              height: '50px',
              background: '#2757aa',
              border: 'none',
              cursor: 'ew-resize',
              borderRadius: '4px',
              boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            title="Drag to resize"
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1e4b96')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2757aa')}
          >
            <i
              className="fa-solid fa-bars"
              style={{ fontSize: '10px', color: '#fff' }}
            ></i>
          </button> */}
          </div>


        )}


        {/* Object View List */}
        <div id="col2" ref={col2Ref} style={{ width: isMobile ? '100%' : '60%', backgroundColor: '#ecf4fc', minWidth: '48%', height: 'auto' }}>
          <ObjectData setPreviewObjectProps={setPreviewObjectProps} setSelectedObject={setSelectedObject} resetViews={props.resetViews} mfilesId={props.mfilesId} user={props.user} getObjectComments={getObjectComments2} comments={comments} loadingcomments={loadingcomments} discardChange={discardChange} openDialog={() => setDialogOpen(true)} updateObjectMetadata={updateObjectMetadata} selectedState={selectedState} setSelectedState={setSelectedState} currentState={currentState} selectedObkjWf={selectedObkjWf} transformFormValues={transformFormValues} formValues={formValues} setFormValues={setFormValues} vault={props.selectedVault} email={props.user.email} selectedFileId={selectedFileId} previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject} selectedObject={selectedObject} extension={extension} base64={base64} loadingobjects={loadingobjects} loadingfile={loadingfile} loadingobject={loadingobject} windowWidth={previewWindowWidth} newWF={newWF} newWFState={newWFState} setNewWFState={setNewWFState} setNewWF={setNewWF} workflows={workflows} approvalPayload={approvalPayload} setApprovalPayload={setApprovalPayload} checkedItems={checkedItems} setCheckedItems={setCheckedItems} loadingWFS={loadingWFS} />
        </div>
      </div >

      {/* RightClickMenu rendered at the root level */}
      {
        rightClickActions.length > 0 && (
          <RightClickMenu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            item={menuItem}
            actions={rightClickActions}
          />
        )
      }

    </>
  );
};

export default DocumentList;

