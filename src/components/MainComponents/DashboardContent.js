import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import Loader from '../Loaders/LoaderMini';
import { Avatar, Button } from '@mui/material';
import { Typography } from '@mui/material';

import Box from '@mui/material/Box';

import FileUpdateModal from '../UpdateFile';

import { Spinner } from '@chakra-ui/react'
import TransitionAlerts from '../Alert';
import ObjectData from './ObjectData';
import NetworkIcon from '../NetworkStatus';


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



const baseurldata = constants.mfiles_api

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
  // const [value, setValue] = useState(0);

  // const [loading, setLoading] = useState(false)
  // let [requisitionProps, setRequisitionProps] = useState({})
  // let [docProps, setDocProps] = useState({})
  // let [selectedObject, setSelectedObject] = useState({})
  // let [selectedFile, setSelectedFile] = useState({});
  // let [loadingobjects, setLoadingObjects] = useState(false)
  // let [selectedFileId, setSelectedFileId] = useState(null)

  // const [openAlert, setOpenAlert] = useState(false);
  // const [alertSeverity, setAlertSeverity] = useState('');
  // const [alertMsg, setAlertMsg] = useState('');
  // const [loadingPreviewObject, setLoadingPreviewObject] = useState(false)
  // const [pageNumber, setPageNumber] = useState(1);
  // const [linkedObjects, setLinkedObjects] = useState([])
  // const [tabIndex, setTabIndex] = useState(0);

  // const [previewObjectProps, setPreviewObjectProps] = useState([])
  // const [formValues, setFormValues] = useState({});
  // const [selectedIndex, setSelectedIndex] = useState(null);
  // const [base64, setBase64] = useState('')
  // const [extension, setExtension] = useState('')
  // const [loadingfile, setLoadingFile] = useState(false)
  // const [loadingobject, setLoadingObject] = useState(false)
  // const [dialogOpen, setDialogOpen] = useState(false);
  // const [uptatingObject, setUpdatingObject] = useState(false)
  // const [selectedObkjWf, setSelectedObjWf] = useState({})
  // const [currentState, setCurrentState] = useState({})
  // const [selectedState, setSelectedState] = useState({});
  // const [comments, setComments] = useState([]);
  // const [loadingcomments, setLoadingComments] = useState(false);
  // const [openOfficeApp, setOpenOfficeApp] = useState(false)
  // const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useState({})
  // const [loadingClick, setLoadingClick] = useState(false);
  // const [searched, setSearched] = useState(false)


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

  const [loading, setLoading] = useSessionState('ss_loading', false);
  let [requisitionProps, setRequisitionProps] = useSessionState('ss_requisitionProps', {});
  let [docProps, setDocProps] = useSessionState('ss_docProps', {});
  let [selectedObject, setSelectedObject] = useSessionState('ss_selectedObject', {});
  let [selectedFile, setSelectedFile] = useSessionState('ss_selectedFile', {});
  let [loadingobjects, setLoadingObjects] = useSessionState('ss_loadingObjects', false);
  let [selectedFileId, setSelectedFileId] = useSessionState('ss_selectedFileId', null);

  const [openAlert, setOpenAlert] = useSessionState('ss_openAlert', false);
  const [alertSeverity, setAlertSeverity] = useSessionState('ss_alertSeverity', '');
  const [alertMsg, setAlertMsg] = useSessionState('ss_alertMsg', '');
  const [loadingPreviewObject, setLoadingPreviewObject] = useSessionState('ss_loadingPreviewObject', false);
  const [pageNumber, setPageNumber] = useSessionState('ss_pageNumber', 1);
  const [linkedObjects, setLinkedObjects] = useSessionState('ss_linkedObjects', []);
  const [tabIndex, setTabIndex] = useSessionState('ss_tabIndex', 0);

  const [previewObjectProps, setPreviewObjectProps] = useSessionState('ss_previewObjectProps', []);
  const [formValues, setFormValues] = useSessionState('ss_formValues', {});
  const [selectedIndex, setSelectedIndex] = useSessionState('ss_selectedIndex', null);
  const [base64, setBase64] = useSessionState('ss_base64', '');
  const [extension, setExtension] = useSessionState('ss_extension', '');
  const [loadingfile, setLoadingFile] = useSessionState('ss_loadingFile', false);
  const [loadingobject, setLoadingObject] = useSessionState('ss_loadingObject', false);
  const [dialogOpen, setDialogOpen] = useSessionState('ss_dialogOpen', false);
  const [uptatingObject, setUpdatingObject] = useSessionState('ss_updatingObject', false);
  const [selectedObkjWf, setSelectedObjWf] = useSessionState('ss_selectedObjWf', {});
  const [currentState, setCurrentState] = useSessionState('ss_currentState', {});
  const [selectedState, setSelectedState] = useSessionState('ss_selectedState', {});
  const [comments, setComments] = useSessionState('ss_comments', []);
  const [loadingcomments, setLoadingComments] = useSessionState('ss_loadingComments', false);
  const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
  const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
  const [loadingClick, setLoadingClick] = useSessionState('ss_loadingClick', false);
  const [searched, setSearched] = useSessionState('ss_searched', false);
  const [previewWindowWidth, setPreviewWindowWidth] = useSessionState('ss_previewWindowWidth', 40);
  const [newWFState, setNewWFState] = useState(null)
  const [newWF, setNewWF] = useState(null)
  const [workflows, setWorkflows] = useSessionState('ss_vaultWorkflows', []);
  const [approvalPayload, setApprovalPayload] = useState(null);


  const markAssignementComplete = async () => {

    await axios.post(`${constants.mfiles_api}/api/objectinstance/ApproveAssignment`, approvalPayload, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('Success:', response.data);
        setApprovalPayload(null)
      })
      .catch(error => {
        console.error('Error:', error);
      });
    // console.log(props.vault)
    // console.log(props.selectedObject)
    // console.log(item)
    // console.log(i)
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



      console.log(requestData);


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

      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject(selectedObject, false);
        } else {
          previewSublistObject(selectedObject, false);
        }
      }, 5000);

    } catch (error) {
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
    } catch (error) {
      console.error('Error transitioning state:', error);
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("something went wrong, please try again later!");
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

    if(approvalPayload){
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
    await getSelectedObjWorkflow(selectedObject.objectTypeId, selectedObject.id);

    if (selectedObject.objectTypeId === 0) {
      await previewObject(selectedObject, false);  // Await previewObject to ensure it's completed
    } else {
      await previewSublistObject(selectedObject, false);  // Await previewSublistObject to ensure it's completed
    }

  };



  const handleAccordionChange = (index) => (event, isExpanded) => {
    setSelectedIndex(isExpanded ? index : null);
  };

  let [fileUrl, setFileUrl] = useState('')


  const switchToTab = (index) => {
    setTabIndex(index);
  };




  const getLinkedObjects = async (id, objectType) => {
    setLinkedObjects([])
    setLoadingObjects(true)

    try {
      let url = `${constants.mfiles_api}/api/objectinstance/LinkedObjects/${props.selectedVault.guid}/${objectType}/${id}/${props.mfilesId}`

      const response = await axios.get(url);

      setLinkedObjects(response.data)
      // console.log(response.data)

      setLoadingObjects(false)
    }
    catch (error) {
      console.error('Error fetching requisition data:', error);
      setLoadingObjects(false)
      setLinkedObjects([])


    }
  }



  const previewObject = async (item, getLinkedItems) => {

    setNewWF(null)
    setNewWFState(null)
    setComments([])

    // if (Object.keys(formValues || {}).length > 0 || selectedState.title) {
    //   handleOpenDialog();
    //   return;
    // }
    // else {
    setSelectedState({})
    setLoadingObject(true)
    setLoadingClick(true)
    // console.log(formValues)
    setFormValues({})
    // if (getLinkedItems) {
    //   getLinkedObjects(item.id, (item.objectTypeId !== undefined ? item.objectTypeId : item.objectID))
    // }

    setSelectedObject(item)


    getSelectedObjWorkflow((item.objectTypeId || item.objectID), item.id)



    try {
      const propsResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}/${props.mfilesId}`);
      console.log(propsResponse.data)
      setPreviewObjectProps(propsResponse.data);
      setLoadingObject(false)
      setLoadingClick(false)
    } catch (error) {
      setLoadingClick(false)
      // setAlertPopOpen(true);
      // setAlertPopSeverity("error");
      // setAlertPopMessage("something went wrong, please try again later!");
      console.error('Error fetching view objects:', error);
      setLoadingObject(false)
    }
    setBase64('');
    setExtension('');
    // }
    getObjectComments(item);
  };

  const previewSublistObject = async (item, getLinkedItems) => {

    setNewWF(null)
    setNewWFState(null)

    // Reset the comments and log the selected item
    setComments([]);

    // Handle dialog open if form values or state exist
    // if (Object.keys(formValues || {}).length > 0 || selectedState.title) {
    //   handleOpenDialog();
    //   return;
    // }

    // if (getLinkedItems) {
    //   getLinkedObjects(item.id, (item.objectTypeId !== undefined ? item.objectTypeId : item.objectID))
    // }

    // Set loading states and clear selected state/form
    setSelectedState({});
    setLoadingObject(true);
    setLoadingClick(true)
    setFormValues({});
    setSelectedObject(item);
    // console.log(item)

    // Fetch the object workflow asynchronously
    getSelectedObjWorkflow((item.objectTypeId || item.objectID, item.id));

    try {
      // Fetch view object properties
      const propsResponse = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}/${props.mfilesId}`
      );
      console.log(propsResponse.data)
      setPreviewObjectProps(propsResponse.data);
    } catch (error) {
      setLoadingClick(false)
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("something went wrong, please try again later!");
      console.error('Error fetching view objects:', error);
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



  const fetchVaultWorkflows = async () => {
    try {
      const response = await axios.get(`${constants.mfiles_api}/api/WorkflowsInstance/GetVaultsWorkflows/${props.selectedVault.guid}/${props.mfilesId}`, {
        headers: {
          'accept': '*/*'
        }
      });

      setWorkflows(response.data)
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };



  // Get current worflow state 
  const getSelectedObjWorkflow = async (dataType, objectsId) => {
    const data = {
      vaultGuid: props.selectedVault.guid,
      objectTypeId: dataType,
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

        setSelectedObjWf(response.data)
        console.log(response.data)
      
        setCurrentState({
          title: response.data.currentStateTitle,
          id: response.data.currentStateid
        })


      })
      .catch(error => {
        fetchVaultWorkflows()
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
    setLoadingComments(true)
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






  function refreshUpdate() {
    getPropsFile(0, selectedFile.internalID, selectedFile.classID, selectedFile.title)
    switchToTab(1)
  }

  const reloadPage = () => {
    window.location.reload();
  };

  // const signDocument = async () => {
  //   setPreparingForSigning(true)
  //   try {
  //     const response = await axios.get(`${baseurldss}/api/SelfSign/${selectedFileId}/${props.user.staffNumber}`);
  //     const { filelink } = response.data;
  //     window.open(filelink, '_blank'); // Open link in new tab
  //     setPreparingForSigning(false)
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     setPreparingForSigning(false)
  //     alert('Please try later, the document is currently checked out !!!')
  //     // Handle error
  //   }


  // };
  let openObjectModal = () => {
    props.setOpenObjectModal(true)
  }
  const getPropsFile = async (objId, internalId, classId, title) => {
    switchToTab(0)
    setDocProps({})
    setFileUrl('')
    setRequisitionProps({})

    setSelectedFile({ "objID": objId, "internalID": internalId, "classID": classId, "title": title })

    setSelectedFileId(internalId)
    try {
      let url = '';
      if (objId === 0) {
        url = `${baseurldata}/api/RequisitionDocs?ObjectID=${objId}&InternalID=${internalId}&ClassID=${classId}`
      } else {

        getLinkedObjects(internalId)
        url = `${baseurldata}/api/Requisition/getRequisitionProps?ObjectID=${objId}&InternalID=${internalId}&ClassID=${classId}`
      }

      const response = await axios.get(url);
      // console.log(response.data)
      if (objId === 0) {
        setDocProps(response.data)
        setFileUrl(response.data.files[0].base64)
        setRequisitionProps({})
      }
      else {
        setRequisitionProps(response.data)
        setDocProps({})
        setFileUrl('')
      }

    }
    catch (error) {
      console.error('Error fetching requisition data:', error);

    }



  }


  const handleSearch = (e) => {
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

  function openApp(item) {
    const fetchExtension = async () => {

      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
      //   console.log(url)
      try {
        const response = await axios.get(url);
        const data = response.data;
        // const extension = data[0]?.extension?.toLowerCase();
        const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();

        if (extension === 'csv' || extension === 'xlsx' || extension === 'docx' || extension === 'txt') {
          const updatedItem = {
            ...item,
            guid: props.selectedVault.guid,
            extension: extension,
            type: item.objectTypeId ?? item.objectID
          };


          // Display extension in alert

          // Set the object to be edited and open the modal
          setObjectToEditOnOfficeApp(updatedItem);
          setOpenOfficeApp(true);
        } else {
          //   alert(`This file type ${extension} is not supported for editing.`);
        }
      } catch (error) {
        console.error('Error fetching the extension:', error);

      }
    };

    fetchExtension();
  }

  const col1Ref = useRef(null);
  const col2Ref = useRef(null);
  const dividerRef = useRef(null);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useEffect(() => {
  //   if (isMobile) return;

  //   const handleMouseMove = (e) => {
  //     if (!isDragging) return;
  //     const containerWidth = containerRef.current.getBoundingClientRect().width;
  //     let newCol1Width = (e.clientX / containerWidth) * 100;
  //     if (newCol1Width < 10) newCol1Width = 10;
  //     if (newCol1Width > 90) newCol1Width = 90;
  //     col1Ref.current.style.width = `${newCol1Width}%`;
  //     col2Ref.current.style.width = `${100 - newCol1Width}%`;
  //     setPreviewWindowWidth(col2Ref.current.style.width)

  //   };

  //   const handleMouseUp = () => setIsDragging(false);

  //   document.addEventListener('mousemove', handleMouseMove);
  //   document.addEventListener('mouseup', handleMouseUp);
  //   return () => {
  //     document.removeEventListener('mousemove', handleMouseMove);
  //     document.removeEventListener('mouseup', handleMouseUp);
  //   };
  // }, [isDragging, isMobile]);

  // const handleMouseDown = () => {
  //   if (!isMobile) setIsDragging(true);
  // };

  const handleMouseDown = useCallback((e) => {
    // Only start dragging if the left mouse button is pressed (button 0)
    if (e.button === 0 && !isMobile) {
      setIsDragging(true);
    }
  }, [isMobile]);

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


  const trimTitle2 = (title) => {
    const maxLength = 50; // Updated to match the desired max length
    if (title) {
      if (title.length > maxLength) {
        // return title.substring(0, maxLength) + '...';
        return title
      }
    }
    return title;
  };

  const handleRowClick = (subItem) => {
    if (subItem.objectID === 0) {
      previewSublistObject(subItem, false);
    } else {
      previewObject(subItem, false);
    }
  };


  const documents = linkedObjects.filter(item => item.objecttypeID === 0);
  const otherObjects = linkedObjects.filter(item => item.objecttypeID !== 0);


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


      <div id="container" ref={containerRef} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', backgroundColor: '#dedddd' ,height:'auto' }}>
        {/* Object List */}
        <div id="col1" ref={col1Ref} style={{ width: isMobile ? '100%' : '40%', backgroundColor: '#fff', minWidth: '25%' }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              fontSize: '12px',
              backgroundColor: '#fff',
              color: '#1C4690',
            }}
            className='p-2'
          >
            {/* Logo Section */}
            <Box display="flex" alignItems="center" className="mx-1 pe-2">

              <Box
                onClick={toggleSidebar}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#f0f4fa',
                    borderRadius: '6px',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <i
                  className="fa-solid fa-bars"
                  style={{ fontSize: '25px', color: '#2757aa' }}
                ></i>
              </Box>
              <img
                src={logo}
                alt="Logo"
                width="150px"
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                className='mx-3'
              />
            </Box>

            {/* Right Section */}
            <Box display="flex" alignItems="center">
              <Tooltip title="Switch to a different vault">
                <VaultSelectForm activeVault={props.selectedVault} />
              </Tooltip>

              <Box
                className="mx-2"
                style={{
                  cursor: 'pointer',
                  color: '#1C4690',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.2s',
                }}
              >
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
                      fontSize: '12px',
                    }}
                  />
                </Tooltip>
              </Box>
            </Box>
          </Box>



          <div
            className=" d-flex justify-content-center shadow-sm p-1"
            style={{ backgroundColor: '#ecf4fc' }}
          >
            <form
              onSubmit={handleSearch}
              className="input-group"
              style={{ maxWidth: '600px', width: '100%' }}
            >
              {/* Icon Section */}
              <div
                className="p-1 d-flex align-items-center"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Tooltip title="Go back home">
                  <i
                    onClick={reloadPage}
                    className="fas fa-home mx-2"
                    style={{
                      fontSize: '25px',
                      cursor: 'pointer',
                      color: '#1C4690',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                      transition: 'transform 0.2s',
                    }}
                  ></i>
                </Tooltip>

                <Tooltip title="Create/Add new object or document">
                  <i
                    onClick={props.getVaultObjects}
                    className="fas fa-plus mx-3"
                    style={{
                      fontSize: '25px',
                      cursor: 'pointer',
                      color: '#1C4690',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                      transition: 'transform 0.2s',
                    }}
                  ></i>
                </Tooltip>
              </div>

              {/* Search Input */}
              <input
                className="form-control form-control-md mx-1  rounded"
                type="text"
                required
                placeholder="Search"
                value={props.searchTerm}
                onChange={(e) => props.setSearchTerm(e.target.value)}
                style={{ borderRadius: '0px', fontSize:'13px' }}
              />

              {/* Search Button */}
              {/* <button
                type="submit"
                className="btn btn-md shadow rounded d-flex align-items-center"
                style={{
                  fontSize: '12.5px',
                  color: '#fff',
                  backgroundColor: '#2757aa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className="fas fa-search" style={{ fontSize: '15px' }}></i>
                <span className="mx-2">Search</span>
              </button> */}

              <Button
                type="submit"
                className="m-2 rounded-pill" // Retaining the same classes as in the original code
                style={{
                  fontSize: '12.5px',
                  color: '#fff',
                  backgroundColor: '#2757aa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  textTransform: 'none',
                }}
                disabled={false}
                variant="contained"
              >
                <i className="fas fa-search" style={{ fontSize: '15px' }}></i>
                <span className="mx-2">Search</span>
              </Button>

              {/* Alerts */}
              <TransitionAlerts
                setOpen={setOpenAlert}
                open={openAlert}
                alertSeverity={alertSeverity}
                alertmsg={alertMsg}
              />
            </form>
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
                  if (label === 'All') setSearched(false);
                  if (label === 'Recent') props.getRecent?.();
                  if (label === 'Assigned') props.getAssigned?.();
                }}
                {...a11yProps(index)}
                sx={{
                  minHeight: '36px',
                  height: '36px',
                  padding: '4px 12px',
                  fontSize: '13px',
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
                    {props.data.length > 0 ? (
                      <div>
                        <h6 className='p-2 text-dark my-2' style={{ fontSize: '12.5px', backgroundColor: '#ecf4fc' }}>
                          {/* <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          <span onClick={() => props.setData([])} style={{ cursor: 'pointer', width: '0.05px' }}>Back to views</span> */}
                          {/* <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span> */}
                           <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          Search Results
                        </h6>

                        <div className='p-2 text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                          {props.data.map((item, index) => (

                            <SimpleTreeView>
                              <TreeItem
                                key={`tree-item-${index}`} // Unique key
                                itemId={`tree-item-${index}`} // Unique itemId
                                onClick={() =>
                                  item.objectTypeId || item.objectID === 0
                                    ? previewSublistObject(item, true)
                                    : previewObject(item, true)
                                }
                                className='my-1'


                                sx={{
                                  marginLeft: '10px',
                                  fontSize: "12.5px", // Apply directly to TreeItem
                                  "& .MuiTreeItem-label": { fontSize: "12.5px !important" }, // Force label font size
                                  "& .MuiTypography-root": { fontSize: "12.5px !important" }, // Ensure all text respects this

                                  backgroundColor: "#fff",
                                  "&:hover": {
                                    backgroundColor: "#fff !important", // Maintain white background on hover
                                  },

                                  borderRadius: "0px !important", // Remove border radius
                                  "& .MuiTreeItem-content": {
                                    borderRadius: "0px !important", // Remove border radius from content area
                                  },
                                }}
                                label={
                                  <Box display="flex" alignItems="center">
                                    {item.objectTypeId || item.objectID === 0 ? (
                                      <>
                                        <FileExtIcon
                                          fontSize={'15px'}
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                        />
                                      </>
                                    ) : (
                                      <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                    )}
                                    <span style={{ marginLeft: '8px' }}>{item.title}{item.objectTypeId || item.objectID === 0 ? (
                                      <>
                                        <FileExtText
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                        />
                                      </>
                                    ) : null}</span>


                                  </Box>
                                }
                              >

                                <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId || item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} />
                              </TreeItem>
                            </SimpleTreeView>

                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Box
                          sx={{
                            width: '100%',
                            marginTop: '5%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto'
                          }}
                        >
                          <i
                            className="fas fa-search my-2"
                            style={{ fontSize: '120px', color: '#2757aa' }}
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
                            sx={{ textAlign: 'center', fontSize: '12.5px' }}
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
                    linkedObjects={linkedObjects}
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
                    <h6 className='p-2 text-dark my-2' style={{ fontSize: '12.5px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Recently Modified By Me ({props.recentData.length})
                    </h6>

                    <div className=' text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                      {props.recentData.map((item, index) => (

                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() =>
                              item.objectTypeId === 0 || item.objectID === 0
                                ? previewSublistObject(item, true)
                                : previewObject(item, true)
                            }
                            className='my-1'


                            sx={{
                              marginLeft: '10px',
                              fontSize: "12.5px", // Apply directly to TreeItem
                              "& .MuiTreeItem-label": { fontSize: "12.5px !important" }, // Force label font size
                              "& .MuiTypography-root": { fontSize: "12.5px !important" }, // Ensure all text respects this

                              backgroundColor: "#fff",
                              "&:hover": {
                                backgroundColor: "#fff !important", // Maintain white background on hover
                              },

                              borderRadius: "0px !important", // Remove border radius
                              "& .MuiTreeItem-content": {
                                borderRadius: "0px !important", // Remove border radius from content area
                              },
                            }}
                            label={
                              <Box display="flex" alignItems="center">
                                {item.objectTypeId === 0 || item.objectID === 0 ? (
                                  <>
                                    <FileExtIcon
                                      fontSize={'15px'}
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : (
                                  <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                )}
                                <span style={{ marginLeft: '8px' }}>{item.title}{item.objectTypeId === 0 || item.objectID === 0 ? (
                                  <>
                                    <FileExtText
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : null}</span>


                              </Box>
                            }
                          >

                            <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId || item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} />
                          </TreeItem>
                        </SimpleTreeView>

                      ))}
                    </div>
                  </div>
                ) : (
                  <>


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
                    <h6 className='p-2 text-dark m-2' style={{ fontSize: '12.5px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Assigned ({props.assignedData.length})
                    </h6>

                    <div className='text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                      {props.assignedData.map((item, index) => (

                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() =>
                              item.objectTypeId === 0 || item.objectID === 0
                                ? previewSublistObject(item, true)
                                : previewObject(item, true)
                            }
                            className='my-1'


                            sx={{
                              marginLeft: '10px',
                              fontSize: "12.5px", // Apply directly to TreeItem
                              "& .MuiTreeItem-label": { fontSize: "12.5px !important" }, // Force label font size
                              "& .MuiTypography-root": { fontSize: "12.5px !important" }, // Ensure all text respects this

                              backgroundColor: "#fff",
                              "&:hover": {
                                backgroundColor: "#fff !important", // Maintain white background on hover
                              },

                              borderRadius: "0px !important", // Remove border radius
                              "& .MuiTreeItem-content": {
                                borderRadius: "0px !important", // Remove border radius from content area
                              },
                            }}
                            label={
                              <Box display="flex" alignItems="center">
                                {item.objectTypeId || item.objectID === 0 ? (
                                  <>
                                    <FileExtIcon
                                      fontSize={'15px'}
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : (
                                  <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                )}
                                <span style={{ marginLeft: '8px' }}>{item.title}{item.objectTypeId === 0 || item.objectID === 0 ? (
                                  <>
                                    <FileExtText
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : null}</span>


                              </Box>
                            }
                          >

                            <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId || item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} />
                          </TreeItem>
                        </SimpleTreeView>

                      ))}
                    </div>
                  </div>
                ) : (
                  <>


                  </>
                )}
              </>
            )}

          </CustomTabPanel>

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
                    <h6 className='p-2 text-dark my-2' style={{ fontSize: '12.5px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Deleted By Me ({props.deletedData.length})
                    </h6>

                    <div className='text-dark' style={{ marginLeft: '20px', height: '60vh', overflowY: 'auto' }}>
                      {props.deletedData.map((item, index) => (

                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() =>
                              item.objectTypeId || item.objectID === 0
                                ? previewSublistObject(item, true)
                                : previewObject(item, true)
                            }
                            className='my-1'


                            sx={{
                              marginLeft: '10px',
                              fontSize: "12.5px", // Apply directly to TreeItem
                              "& .MuiTreeItem-label": { fontSize: "12.5px !important" }, // Force label font size
                              "& .MuiTypography-root": { fontSize: "12.5px !important" }, // Ensure all text respects this

                              backgroundColor: "#fff",
                              "&:hover": {
                                backgroundColor: "#fff !important", // Maintain white background on hover
                              },

                              borderRadius: "0px !important", // Remove border radius
                              "& .MuiTreeItem-content": {
                                borderRadius: "0px !important", // Remove border radius from content area
                              },
                            }}
                            label={
                              <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box display="flex" alignItems="center">
                                  {item.objectTypeId || item.objectID === 0 ? (
                                    <FileExtIcon
                                      fontSize={'15px'}
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  ) : (
                                    <i className="fa-solid fa-folder" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                  )}
                                  <span style={{ marginLeft: '8px' }}>{item.title}{item.objectTypeId || item.objectID === 0 && (
                                    <FileExtText
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId}
                                    />
                                  )}</span>

                                </Box>

                                {/* Button at the right */}
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  onClick={() => restoreObject(item)}
                                  sx={{ textTransform: 'none' }}
                                >
                                  <i
                                    className="fas fa-trash-restore"
                                    style={{
                                      fontSize: '11px',
                                      cursor: 'pointer',
                                      marginRight: '4px'
                                    }}
                                  />
                                  <small>Restore</small>
                                </Button>
                              </Box>

                            }
                          >


                          </TreeItem>
                        </SimpleTreeView>

                      ))}
                    </div>
                  </div>
                ) : (
                  <>


                  </>
                )}
              </>
            )}

          </CustomTabPanel>





        </div>

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
        <div id="col2" ref={col2Ref} style={{ width: isMobile ? '100%' : '60%', backgroundColor: '#fff', minWidth: '48%', height:'auto' }}>
          <ObjectData setPreviewObjectProps={setPreviewObjectProps} setSelectedObject={setSelectedObject} resetViews={props.resetViews} mfilesId={props.mfilesId} user={props.user} getObjectComments={getObjectComments2} comments={comments} loadingcomments={loadingcomments} discardChange={discardChange} openDialog={() => setDialogOpen(true)} updateObjectMetadata={updateObjectMetadata} selectedState={selectedState} setSelectedState={setSelectedState} currentState={currentState} selectedObkjWf={selectedObkjWf} transformFormValues={transformFormValues} formValues={formValues} setFormValues={setFormValues} vault={props.selectedVault} email={props.user.email} selectedFileId={selectedFileId} previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject} selectedObject={selectedObject} extension={extension} base64={base64} loadingobjects={loadingobjects} loadingfile={loadingfile} loadingobject={loadingobject} windowWidth={previewWindowWidth} newWF={newWF} newWFState={newWFState} setNewWFState={setNewWFState} setNewWF={setNewWF} workflows={workflows} approvalPayload={approvalPayload} setApprovalPayload={setApprovalPayload} />
        </div>
      </div>

    </>
  );
};

export default DocumentList;

