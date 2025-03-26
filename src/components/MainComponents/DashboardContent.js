import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Loader from '../Loaders/LoaderMini';
import { Avatar, Button } from '@mui/material';
import { LinearProgress, Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import ObjectPropValue from '../ObjectPropValue';
import { faTable } from '@fortawesome/free-solid-svg-icons';

import GetIcon from '../GetIcon'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  // Accordion,
  // AccordionItem,
  // AccordionButton,
  // AccordionPanel,
  // AccordionIcon,
  // Box
} from '@chakra-ui/react'
import FileUpdateModal from '../UpdateFile';

import { Spinner } from '@chakra-ui/react'
import TransitionAlerts from '../Alert';
import ObjectData from './ObjectData';
import NetworkIcon from '../NetworkStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewsList from './ViewsList';
import VaultSelectForm from '../SelectVault';
import FileExtIcon from '../FileExtIcon';
import ConfirmUpdateDialog from '../Modals/ConfirmUpdateObjectDialog';
import TimedAlert from '../TimedAlert';
import { UTurnLeft } from '@mui/icons-material';
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
  const [value, setValue] = useState(0);

  const [loading, setLoading] = useState(false)
  let [requisitionProps, setRequisitionProps] = useState({})
  let [docProps, setDocProps] = useState({})
  let [selectedObject, setSelectedObject] = useState({})
  let [selectedFile, setSelectedFile] = useState({});
  let [loadingobjects, setLoadingObjects] = useState(false)
  let [selectedFileId, setSelectedFileId] = useState(null)
  let [preparingforsigning, setPreparingForSigning] = useState(false)

  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [loadingPreviewObject, setLoadingPreviewObject] = useState(false)
  const [pageNumber, setPageNumber] = useState(1);
  const [linkedObjects, setLinkedObjects] = useState([])
  const [tabIndex, setTabIndex] = useState(0);
  const [isModalOpenUpdateFile, setIsModalOpenUpdateFile] = useState(false);
  const [previewObjectProps, setPreviewObjectProps] = useState([])
  const [formValues, setFormValues] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [base64, setBase64] = useState('')
  const [extension, setExtension] = useState('')
  const [loadingfile, setLoadingFile] = useState(false)
  const [loadingobject, setLoadingObject] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uptatingObject, setUpdatingObject] = useState(false)
  const [selectedObkjWf, setSelectedObjWf] = useState({})
  const [currentState, setCurrentState] = useState({})
  const [selectedState, setSelectedState] = useState({});
  const [comments, setComments] = useState([]);
  const [loadingcomments, setLoadingComments] = useState(false);
  const [openOfficeApp, setOpenOfficeApp] = useState(false)
  const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useState({})
  const [loadingClick, setLoadingClick] = useState(false);
  const [searched, setSearched] = useState(false)



  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);


  const relatedObjects = linkedObjects.filter(item => (item.objectID || item.objectTypeId) !== 0);
  const relatedDocuments = linkedObjects.filter(item => (item.objectID || item.objectTypeId) === 0);

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



      // console.log(requestData);


      await axios.put(
        `${constants.mfiles_api}/api/objectinstance/UpdateObjectProps`,
        requestData,
        { headers: { accept: '*/*', 'Content-Type': 'application/json' } }
      );

      // if (!selectedState) {
      //   await reloadObjectMetadata();  // Await reloadObjectMetadata to ensure it's completed
      // }


      setAlertPopOpen(true);
      setAlertPopSeverity("success");
      setAlertPopMessage("Updated successfully! Chages will be effected next time item is loaded.");
      setFormValues({});

      // console.log(selectedObject)
      setPreviewObjectProps([])
      setSelectedObject({})

      setTimeout(() => {
        if (selectedObject.id !== 0) {
          previewObject();
        } else {
          previewSublistObject();
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

      setSelectedState({});
      if (!formValues) {
        await reloadObjectMetadata();  // Await reloadObjectMetadata to ensure it's completed
      }
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

  const updateObjectMetadata = async () => {
    const hasFormValues = Object.keys(formValues || {}).length > 0;
    const hasSelectedState = Boolean(selectedState?.title);

    // Process form values if any
    if (hasFormValues) {
      await transformFormValues();
    }

    // Process state transition if a state is selected
    if (hasSelectedState) {
      await transitionState();
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
      console.log(response.data)

      setLoadingObjects(false)
    }
    catch (error) {
      console.error('Error fetching requisition data:', error);
      setLoadingObjects(false)
      setLinkedObjects([])


    }
  }



  const previewObject = async (item, getLinkedItems) => {

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

    console.log(item)
    getSelectedObjWorkflow((item.objectTypeId || item.objectID), item.id)

    try {
      const propsResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}/${props.mfilesId}`);
      // console.log(propsResponse.data)
      setPreviewObjectProps(propsResponse.data);
      setLoadingObject(false)
      setLoadingClick(false)
    } catch (error) {
      setLoadingClick(false)
      setAlertPopOpen(true);
      setAlertPopSeverity("error");
      setAlertPopMessage("something went wrong, please try again later!");
      console.error('Error fetching view objects:', error);
      setLoadingObject(false)
    }
    setBase64('');
    setExtension('');
    // }
    getObjectComments(item);
  };

  const previewSublistObject = async (item, getLinkedItems) => {



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
      // console.log(propsResponse.data)
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
          console.log(ext)
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
    // console.log(currentState)
    setSelectedState(currentState)

  }



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
          stateTitle: response.data.currentStateTitle,
          stateId: response.data.currentStateid
        })

      })
      .catch(error => {
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

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      let newCol1Width = (e.clientX / containerWidth) * 100;
      if (newCol1Width < 10) newCol1Width = 10;
      if (newCol1Width > 90) newCol1Width = 90;
      col1Ref.current.style.width = `${newCol1Width}%`;
      col2Ref.current.style.width = `${100 - newCol1Width}%`;
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMobile]);

  const handleMouseDown = () => {
    if (!isMobile) setIsDragging(true);
  };


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


      <div id="container" ref={containerRef} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', backgroundColor: '#dedddd' }}>
        {/* Object List */}
        <div id="col1" ref={col1Ref} style={{ width: isMobile ? '100%' : '40%', backgroundColor: '#fff', minWidth: '35%', minHeight: '100vh' }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px',

              fontSize: '12px !important',
              backgroundColor: '#fff',
              color: '#1C4690',

            }}

          >
            <Box style={{ display: 'flex', alignItems: 'center' }} className="mx-2 ">
              <img style={{

                cursor: 'pointer',
                color: '#fff',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                transform: 'translateZ(0)',
                transition: 'transform 0.2s'
              }} onClick={reloadPage} src={logo} width='150px' />





            </Box>


            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                color="text.white"
                fontSize="11.5px"
              >


                <Tooltip title='Switch to a different vault'>
                  <VaultSelectForm activeVault={props.selectedVault} />
                </Tooltip>
                {/* <NetworkIcon /> */}
                <Box style={{

                  cursor: 'pointer',
                  color: '#1C4690',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                  transform: 'translateZ(0)',
                  transition: 'transform 0.2s'
                }}
                  className='mx-3'
                >

                  <Tooltip title={`${props.user.first_name} ${props.user.last_name}`}>

                    <Avatar
                      alt={
                        props.user.first_name && props.user.last_name
                          ? `${props.user.first_name} ${props.user.last_name}`
                          : props.user.first_name
                            ? props.user.first_name
                            : props.user.last_name
                              ? props.user.last_name
                              : props.user.username
                      }
                      {...props.stringAvatar(
                        props.user.first_name && props.user.last_name
                          ? `${props.user.first_name} ${props.user.last_name}`
                          : props.user.first_name
                            ? props.user.first_name
                            : props.user.last_name
                              ? props.user.last_name
                              : props.user.username
                      )}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: '#2757aa',
                        fontSize: '12px'

                      }}
                      className='p-3'

                    />
                  </Tooltip>

                </Box>

              </Box>
            </Box>
          </Box>


          <div
            className="p-2 d-flex justify-content-center shadow-sm"
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
                className="form-control form-control-md mx-1 rounded"
                type="text"
                required
                placeholder="Search ..."
                value={props.searchTerm}
                onChange={(e) => props.setSearchTerm(e.target.value)}
                style={{ borderRadius: '0px' }}
              />

              {/* Search Button */}
              <button
                type="submit"
                className="btn btn-md shadow rounded d-flex align-items-center"
                style={{
                  fontSize: '13px',
                  color: '#fff',
                  backgroundColor: '#2757aa',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <i className="fas fa-search" style={{ fontSize: '15px' }}></i>
                <span className="mx-2">Search</span>
              </button>

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
            sx={{ borderColor: 'divider', backgroundColor: '#fff' }}
            className='shadow-lg'

          >
            <Tab
              style={{ textTransform: 'none' }}
              sx={{
                fontSize: '12px',
                width: 'auto',
                minWidth: 'auto',
                height: 'auto',
                backgroundColor: '#fff'

              }}
              onClick={() => setSearched(false)}
              label="All"
              {...a11yProps(0)}
            />
            <Tab
              style={{ textTransform: 'none' }}
              sx={{
                height: 'auto',
                minWidth: 'auto',      // Adjust the width to fit the label text
                fontSize: '12px',
                backgroundColor: '#fff'
              }}
              label={`Recent`}
              // label={`Recent (${props.recentData ? props.recentData.length : <></>})`}
              {...a11yProps(1)}
              onClick={props.getRecent}
            />
            <Tab
              style={{ textTransform: 'none' }}
              sx={{
                fontSize: '13px',
                minWidth: 'auto',
                backgroundColor: '#fff'      // Adjust the width to fit the label text
              }}
              label={`Assigned `}
              // label={`Assigned (${props.assignedData ? props.assignedData.length : <></>})`}
              {...a11yProps(2)}
              onClick={props.getAssigned}
            />
            <Tab
              style={{ textTransform: 'none' }}
              sx={{
                fontSize: '12px',
                height: 'auto',
                minWidth: 'auto',
                backgroundColor: '#fff'      // Adjust the width to fit the label text
              }}
              label={`Deleted `}
              // label={`Deleted (${props.deletedData ? props.deletedData.length : <></>})`}
              {...a11yProps(3)}
            />
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
                        <h6 className='p-2 text-dark' style={{ fontSize: '11px', backgroundColor: '#ecf4fc' }}>
                          <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>
                          <span onClick={() => props.setData([])} style={{ cursor: 'pointer', width: '0.05px' }}>Back to views</span>
                          <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span>
                          Search Results
                        </h6>

                        <div className='p-2 text-dark' style={{ marginLeft: '20px', height: '65vh', overflowY: 'auto' }}>
                          {props.data.map((item, index) => (
                            // <Accordion
                            //   expanded={selectedIndex === index}
                            //   onChange={handleAccordionChange(index)}
                            //   sx={{
                            //     border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                            //     '&:not(:last-child)': {
                            //       borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                            //     },
                            //     '&::before': { display: 'none' },
                            //   }}
                            // >
                            //   {item.objectID === 0 ? (
                            //     <AccordionSummary
                            //       onClick={() => previewSublistObject(item, true)}

                            //       expandIcon={<ExpandMoreIcon />}
                            //       aria-controls={`panel${index}a-content`}
                            //       id={`panel${index}a-header`}
                            //       sx={{
                            //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                            //         padding: 0, // Removes all padding
                            //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                            //       }}
                            //       className="shadow-sm"
                            //     >
                            //       <Typography
                            //         variant="body1"
                            //         style={{
                            //           fontSize: '11px',
                            //           margin: 0, // Removes any extra margin
                            //         }}
                            //       >

                            //         <span className='mx-2'> <FileExtIcon
                            //           guid={props.selectedVault.guid}
                            //           objectId={item.id}
                            //           classId={item.classID}
                            //         /></span>

                            //         {trimTitle2(item.title)}
                            //         <FileExtText
                            //           guid={props.selectedVault.guid}
                            //           objectId={item.id}
                            //           classId={item.classID}
                            //         />
                            //       </Typography>
                            //     </AccordionSummary>

                            //   ) : (
                            //     <AccordionSummary
                            //       onClick={() => previewObject(item, true)}
                            //       expandIcon={<ExpandMoreIcon />}
                            //       aria-controls={`panel${index}a-content`}
                            //       id={`panel${index}a-header`}
                            //       sx={{
                            //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                            //         padding: 0, // Removes all padding
                            //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                            //       }}
                            //       className="shadow-sm"
                            //     >
                            //       <Typography variant="body1" style={{ fontSize: '11px' }}>
                            //         <i className="fas fa-layer-group mx-3" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                            //         {trimTitle2(item.title)}
                            //       </Typography>
                            //     </AccordionSummary>
                            //   )}
                            //   {linkedObjects && (
                            //     <AccordionDetails style={{ backgroundColor: '#2a68af' }} className="">
                            //       {props.loadingobjects ? (
                            //         <div className="text-center">
                            //           <CircularProgress style={{ width: '20px', height: '20px' }} />
                            //           <p className="text-dark" style={{ fontSize: '11px' }}>Searching relationships...</p>
                            //         </div>
                            //       ) : (
                            //         <>
                            //           {linkedObjects.length > 0 ? (
                            //             <>
                            //               {/* Render Other Objects */}
                            //               {otherObjects.map((item, index) => (
                            //                 <div key={index}>
                            //                   <Typography
                            //                     variant="body2"
                            //                     style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                            //                     className="p-1"
                            //                   >
                            //                     <span>{item.objectTitle} <small>( {item.items.length} )</small></span>
                            //                   </Typography>

                            //                   <table
                            //                     id="createdByMe"
                            //                     className="table table-hover"
                            //                     style={{ fontSize: '11px', backgroundColor: '#ffff' }}
                            //                   >
                            //                     <tbody>
                            //                       {item.items.map((subItem, subIndex) => (
                            //                         <tr
                            //                           key={subIndex}
                            //                           onClick={() => handleRowClick(subItem)}
                            //                           onDoubleClick={() => openApp(subItem)}
                            //                           style={{ cursor: 'pointer' }}
                            //                         >
                            //                           <td>
                            //                             {subItem.objectID === 0 ? (
                            //                               <>
                            //                                 <FileExtIcon
                            //                                   guid={props.selectedVault.guid}
                            //                                   objectId={subItem.id}
                            //                                   classId={subItem.classID}
                            //                                 />
                            //                                 {subItem.title}
                            //                                 <FileExtText
                            //                                   guid={props.selectedVault.guid}
                            //                                   objectId={subItem.id}
                            //                                   classId={subItem.classID}
                            //                                 />
                            //                               </>
                            //                             ) : (
                            //                               <>
                            //                                 <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                            //                                 {subItem.title}
                            //                               </>
                            //                             )}
                            //                           </td>
                            //                         </tr>
                            //                       ))}
                            //                     </tbody>
                            //                   </table>
                            //                 </div>
                            //               ))}

                            //               {/* Render Documents Together */}
                            //               {documents.length > 0 && (
                            //                 <>
                            //                   <Typography
                            //                     variant="body2"
                            //                     style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                            //                     className="p-1"
                            //                   >
                            //                     <span>Document{documents.length > 0 ? <>s</> : <></>}</span> <small>( {documents.length} )</small>
                            //                   </Typography>

                            //                   <table
                            //                     id="createdByMe"
                            //                     className="table table-hover"
                            //                     style={{ fontSize: '11px', backgroundColor: '#ffff', margin: '0%' }}
                            //                   >
                            //                     <tbody>
                            //                       {documents.flatMap(item => item.items).map((subItem, index) => (
                            //                         <tr
                            //                           key={index}
                            //                           onClick={() => handleRowClick(subItem)}
                            //                           onDoubleClick={() => openApp(subItem)}
                            //                           style={{ cursor: 'pointer' }}
                            //                         >
                            //                           <td>
                            //                             {subItem.objectID === 0 ? (
                            //                               <>
                            //                                 <FileExtIcon
                            //                                   guid={props.selectedVault.guid}
                            //                                   objectId={subItem.id}
                            //                                   classId={subItem.classID}
                            //                                 />
                            //                                 {subItem.title}
                            //                                 <FileExtText
                            //                                   guid={props.selectedVault.guid}
                            //                                   objectId={subItem.id}
                            //                                   classId={subItem.classID}
                            //                                 />
                            //                               </>
                            //                             ) : (
                            //                               <>
                            //                                 <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                            //                                 {subItem.title}
                            //                               </>
                            //                             )}
                            //                           </td>
                            //                         </tr>
                            //                       ))}
                            //                     </tbody>
                            //                   </table>
                            //                 </>
                            //               )}
                            //             </>
                            //           ) : (
                            //             <p className="my-1 mx-1 text-center text-white" style={{ fontSize: '11px' }}>
                            //               No Relationships Found
                            //             </p>
                            //           )}
                            //         </>
                            //       )}
                            //     </AccordionDetails>
                            //   )}
                            // </Accordion>
                            <SimpleTreeView>
                              <TreeItem
                                key={`tree-item-${index}`} // Unique key
                                itemId={`tree-item-${index}`} // Unique itemId
                                onClick={() =>
                                  item.objectTypeId || item.objectID === 0
                                    ? previewSublistObject(item, true)
                                    : previewObject(item, true)
                                }

                                sx={{
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
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                        />
                                      </>
                                    ) : (
                                      <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                    )}
                                    <span style={{ marginLeft: '8px' }}>{item.title}</span>
                                    {item.objectTypeId || item.objectID === 0 ? (
                                      <>
                                        <FileExtText
                                          guid={props.selectedVault.guid}
                                          objectId={item.id}
                                          classId={item.classId || item.classID}
                                        />
                                      </>
                                    ) : null}

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
                            sx={{ textAlign: 'center', fontSize: '12px' }}
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
                    <h6 className='p-2 text-dark' style={{ fontSize: '11px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Recently Modified By Me ({props.recentData.length})
                    </h6>

                    <div className=' text-dark' style={{ marginLeft: '20px', height: '65vh', overflowY: 'auto' }}>
                      {props.recentData.map((item, index) => (
                        // <Accordion
                        //   expanded={selectedIndex === index}
                        //   onChange={handleAccordionChange(index)}
                        //   sx={{
                        //     border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                        //     '&:not(:last-child)': {
                        //       borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                        //     },
                        //     '&::before': { display: 'none' },
                        //   }}
                        // >
                        //   {item.objectID === 0 ? (
                        //     <AccordionSummary
                        //       onClick={() => previewSublistObject(item, true)}

                        //       expandIcon={<ExpandMoreIcon />}
                        //       aria-controls={`panel${index}a-content`}
                        //       id={`panel${index}a-header`}
                        //       sx={{
                        //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                        //         padding: 0, // Removes all padding
                        //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                        //       }}
                        //       className="shadow-sm"
                        //     >
                        //       <Typography
                        //         variant="body1"
                        //         style={{
                        //           fontSize: '11px',
                        //           margin: 0, // Removes any extra margin
                        //         }}
                        //       >

                        //         <span className='mx-2'> <FileExtIcon
                        //           guid={props.selectedVault.guid}
                        //           objectId={item.id}
                        //           classId={item.classID}
                        //         /></span>

                        //         {trimTitle2(item.title)}
                        //         <FileExtText
                        //           guid={props.selectedVault.guid}
                        //           objectId={item.id}
                        //           classId={item.classID}
                        //         />
                        //       </Typography>
                        //     </AccordionSummary>

                        //   ) : (
                        //     <AccordionSummary
                        //       onClick={() => previewObject(item, true)}
                        //       expandIcon={<ExpandMoreIcon />}
                        //       aria-controls={`panel${index}a-content`}
                        //       id={`panel${index}a-header`}
                        //       sx={{
                        //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                        //         padding: 0, // Removes all padding
                        //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                        //       }}
                        //       className="shadow-sm"
                        //     >
                        //       <Typography variant="body1" style={{ fontSize: '11px' }}>
                        //         <i className="fas fa-layer-group mx-3" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                        //         {trimTitle2(item.title)}
                        //       </Typography>
                        //     </AccordionSummary>
                        //   )}
                        //   {linkedObjects && (
                        //     <AccordionDetails style={{ backgroundColor: '#2a68af' }} className="">
                        //       {props.loadingobjects ? (
                        //         <div className="text-center">
                        //           <CircularProgress style={{ width: '20px', height: '20px' }} />
                        //           <p className="text-dark" style={{ fontSize: '11px' }}>Searching relationships...</p>
                        //         </div>
                        //       ) : (
                        //         <>
                        //           {linkedObjects.length > 0 ? (
                        //             <>
                        //               {/* Render Other Objects */}
                        //               {otherObjects.map((item, index) => (
                        //                 <div key={index}>
                        //                   <Typography
                        //                     variant="body2"
                        //                     style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                        //                     className="p-1"
                        //                   >
                        //                     <span>{item.objectTitle} <small>( {item.items.length} )</small></span>
                        //                   </Typography>

                        //                   <table
                        //                     id="createdByMe"
                        //                     className="table table-hover"
                        //                     style={{ fontSize: '11px', backgroundColor: '#ffff' }}
                        //                   >
                        //                     <tbody>
                        //                       {item.items.map((subItem, subIndex) => (
                        //                         <tr
                        //                           key={subIndex}
                        //                           onClick={() => handleRowClick(subItem)}
                        //                           onDoubleClick={() => openApp(subItem)}
                        //                           style={{ cursor: 'pointer' }}
                        //                         >
                        //                           <td>
                        //                             {subItem.objectID === 0 ? (
                        //                               <>
                        //                                 <FileExtIcon
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                                 {subItem.title}
                        //                                 <FileExtText
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                               </>
                        //                             ) : (
                        //                               <>
                        //                                 <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                        //                                 {subItem.title}
                        //                               </>
                        //                             )}
                        //                           </td>
                        //                         </tr>
                        //                       ))}
                        //                     </tbody>
                        //                   </table>
                        //                 </div>
                        //               ))}

                        //               {/* Render Documents Together */}
                        //               {documents.length > 0 && (
                        //                 <>
                        //                   <Typography
                        //                     variant="body2"
                        //                     style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                        //                     className="p-1"
                        //                   >
                        //                     <span>Document{documents.length > 0 ? <>s</> : <></>}</span> <small>( {documents.length} )</small>
                        //                   </Typography>

                        //                   <table
                        //                     id="createdByMe"
                        //                     className="table table-hover"
                        //                     style={{ fontSize: '11px', backgroundColor: '#ffff', margin: '0%' }}
                        //                   >
                        //                     <tbody>
                        //                       {documents.flatMap(item => item.items).map((subItem, index) => (
                        //                         <tr
                        //                           key={index}
                        //                           onClick={() => handleRowClick(subItem)}
                        //                           onDoubleClick={() => openApp(subItem)}
                        //                           style={{ cursor: 'pointer' }}
                        //                         >
                        //                           <td>
                        //                             {subItem.objectID === 0 ? (
                        //                               <>
                        //                                 <FileExtIcon
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                                 {subItem.title}
                        //                                 <FileExtText
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                               </>
                        //                             ) : (
                        //                               <>
                        //                                 <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                        //                                 {subItem.title}
                        //                               </>
                        //                             )}
                        //                           </td>
                        //                         </tr>
                        //                       ))}
                        //                     </tbody>
                        //                   </table>
                        //                 </>
                        //               )}
                        //             </>
                        //           ) : (
                        //             <p className="my-1 mx-1 text-center text-white" style={{ fontSize: '11px' }}>
                        //               No Relationships Found
                        //             </p>
                        //           )}
                        //         </>
                        //       )}
                        //     </AccordionDetails>
                        //   )}
                        // </Accordion>
                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() =>
                              item.objectTypeId === 0 || item.objectID === 0
                                ? previewSublistObject(item, true)
                                : previewObject(item, true)
                            }

                            sx={{
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
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : (
                                  <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                )}
                                <span style={{ marginLeft: '8px' }}>{item.title}</span>
                                {item.objectTypeId === 0 || item.objectID === 0 ? (
                                  <>
                                    <FileExtText
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : null}

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
                    <h6 className='p-2 text-dark' style={{ fontSize: '11px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Assigned ({props.assignedData.length})
                    </h6>

                    <div className='text-dark' style={{ marginLeft: '20px', height: '65vh', overflowY: 'auto' }}>
                      {props.assignedData.map((item, index) => (
                        // <Accordion
                        //   expanded={selectedIndex === index}
                        //   onChange={handleAccordionChange(index)}
                        //   sx={{
                        //     border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                        //     '&:not(:last-child)': {
                        //       borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                        //     },
                        //     '&::before': { display: 'none' },
                        //   }}
                        // >
                        //   {item.objectID === 0 ? (
                        //     <AccordionSummary
                        //       onClick={() => previewSublistObject(item, true)}

                        //       expandIcon={<ExpandMoreIcon />}
                        //       aria-controls={`panel${index}a-content`}
                        //       id={`panel${index}a-header`}
                        //       sx={{
                        //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                        //         padding: 0, // Removes all padding
                        //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                        //       }}
                        //       className="shadow-sm"
                        //     >
                        //       <Typography
                        //         variant="body1"
                        //         style={{
                        //           fontSize: '11px',
                        //           margin: 0, // Removes any extra margin
                        //         }}
                        //       >

                        //         <span className='mx-2'> <FileExtIcon
                        //           guid={props.selectedVault.guid}
                        //           objectId={item.id}
                        //           classId={item.classID}
                        //         /></span>

                        //         {trimTitle2(item.title)}
                        //         <FileExtText
                        //           guid={props.selectedVault.guid}
                        //           objectId={item.id}
                        //           classId={item.classID}
                        //         />
                        //       </Typography>
                        //     </AccordionSummary>

                        //   ) : (
                        //     <AccordionSummary
                        //       onClick={() => previewObject(item, true)}
                        //       expandIcon={<ExpandMoreIcon />}
                        //       aria-controls={`panel${index}a-content`}
                        //       id={`panel${index}a-header`}
                        //       sx={{
                        //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                        //         padding: 0, // Removes all padding
                        //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                        //       }}
                        //       className="shadow-sm"
                        //     >
                        //       <Typography variant="body1" style={{ fontSize: '11px' }}>
                        //         <i className="fas fa-layer-group mx-3" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                        //         {trimTitle2(item.title)}
                        //       </Typography>
                        //     </AccordionSummary>
                        //   )}
                        //   {linkedObjects && (
                        //     <AccordionDetails style={{ backgroundColor: '#2a68af' }} className="">
                        //       {props.loadingobjects ? (
                        //         <div className="text-center">
                        //           <CircularProgress style={{ width: '20px', height: '20px' }} />
                        //           <p className="text-dark" style={{ fontSize: '11px' }}>Searching relationships...</p>
                        //         </div>
                        //       ) : (
                        //         <>
                        //           {linkedObjects.length > 0 ? (
                        //             <>
                        //               {/* Render Other Objects */}
                        //               {otherObjects.map((item, index) => (
                        //                 <div key={index}>
                        //                   <Typography
                        //                     variant="body2"
                        //                     style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                        //                     className="p-1"
                        //                   >
                        //                     <span>{item.objectTitle} <small>( {item.items.length} )</small></span>
                        //                   </Typography>

                        //                   <table
                        //                     id="createdByMe"
                        //                     className="table table-hover"
                        //                     style={{ fontSize: '11px', backgroundColor: '#ffff' }}
                        //                   >
                        //                     <tbody>
                        //                       {item.items.map((subItem, subIndex) => (
                        //                         <tr
                        //                           key={subIndex}
                        //                           onClick={() => handleRowClick(subItem)}
                        //                           onDoubleClick={() => openApp(subItem)}
                        //                           style={{ cursor: 'pointer' }}
                        //                         >
                        //                           <td>
                        //                             {subItem.objectID === 0 ? (
                        //                               <>
                        //                                 <FileExtIcon
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                                 {subItem.title}
                        //                                 <FileExtText
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                               </>
                        //                             ) : (
                        //                               <>
                        //                                 <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                        //                                 {subItem.title}
                        //                               </>
                        //                             )}
                        //                           </td>
                        //                         </tr>
                        //                       ))}
                        //                     </tbody>
                        //                   </table>
                        //                 </div>
                        //               ))}

                        //               {/* Render Documents Together */}
                        //               {documents.length > 0 && (
                        //                 <>
                        //                   <Typography
                        //                     variant="body2"
                        //                     style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                        //                     className="p-1"
                        //                   >
                        //                     <span>Document{documents.length > 0 ? <>s</> : <></>}</span> <small>( {documents.length} )</small>
                        //                   </Typography>

                        //                   <table
                        //                     id="createdByMe"
                        //                     className="table table-hover"
                        //                     style={{ fontSize: '11px', backgroundColor: '#ffff', margin: '0%' }}
                        //                   >
                        //                     <tbody>
                        //                       {documents.flatMap(item => item.items).map((subItem, index) => (
                        //                         <tr
                        //                           key={index}
                        //                           onClick={() => handleRowClick(subItem)}
                        //                           onDoubleClick={() => openApp(subItem)}
                        //                           style={{ cursor: 'pointer' }}
                        //                         >
                        //                           <td>
                        //                             {subItem.objectID === 0 ? (
                        //                               <>
                        //                                 <FileExtIcon
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                                 {subItem.title}
                        //                                 <FileExtText
                        //                                   guid={props.selectedVault.guid}
                        //                                   objectId={subItem.id}
                        //                                   classId={subItem.classID}
                        //                                 />
                        //                               </>
                        //                             ) : (
                        //                               <>
                        //                                 <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                        //                                 {subItem.title}
                        //                               </>
                        //                             )}
                        //                           </td>
                        //                         </tr>
                        //                       ))}
                        //                     </tbody>
                        //                   </table>
                        //                 </>
                        //               )}
                        //             </>
                        //           ) : (
                        //             <p className="my-1 mx-1 text-center text-white" style={{ fontSize: '11px' }}>
                        //               No Relationships Found
                        //             </p>
                        //           )}
                        //         </>
                        //       )}
                        //     </AccordionDetails>
                        //   )}
                        // </Accordion>
                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() =>
                              item.objectTypeId === 0 || item.objectID === 0
                                ? previewSublistObject(item, true)
                                : previewObject(item, true)
                            }

                            sx={{
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
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : (
                                  <i className="fa-solid fa-folder " style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                )}
                                <span style={{ marginLeft: '8px' }}>{item.title}</span>
                                {item.objectTypeId === 0 || item.objectID === 0 ? (
                                  <>
                                    <FileExtText
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  </>
                                ) : null}

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
                    <h6 className='p-2 text-dark' style={{ fontSize: '11px', backgroundColor: '#ecf4fc' }}>
                      <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1C4690' }}></i>

                      Deleted By Me ({props.deletedData.length})
                    </h6>

                    <div className='text-dark' style={{ marginLeft: '20px', height: '65vh', overflowY: 'auto' }}>
                      {props.deletedData.map((item, index) => (
                        // <Accordion
                        //   expanded={selectedIndex === index}
                        //   onChange={handleAccordionChange(index)}
                        //   sx={{
                        //     border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                        //     '&:not(:last-child)': {
                        //       borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                        //     },
                        //     '&::before': { display: 'none' },
                        //   }}
                        // >
                        //   {item.objectID === 0 ? (
                        //     <AccordionSummary
                        //       onClick={() => previewSublistObject(item, true)}

                        //       expandIcon={<ExpandMoreIcon />}
                        //       aria-controls={`panel${index}a-content`}
                        //       id={`panel${index}a-header`}
                        //       sx={{
                        //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                        //         padding: 0, // Removes all padding
                        //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                        //       }}
                        //       className="shadow-sm"
                        //     >
                        //       <Typography
                        //         variant="body1"
                        //         style={{
                        //           fontSize: '11px',
                        //           margin: 0, // Removes any extra margin
                        //         }}
                        //       >

                        //         <span className='mx-2'> <FileExtIcon
                        //           guid={props.selectedVault.guid}
                        //           objectId={item.id}
                        //           classId={item.classID}
                        //         /></span>

                        //         {trimTitle2(item.title)}
                        //         <FileExtText
                        //           guid={props.selectedVault.guid}
                        //           objectId={item.id}
                        //           classId={item.classID}
                        //         />
                        //       </Typography>
                        //     </AccordionSummary>

                        //   ) : (
                        //     <AccordionSummary
                        //       onClick={() => previewObject(item, true)}
                        //       expandIcon={<ExpandMoreIcon />}
                        //       aria-controls={`panel${index}a-content`}
                        //       id={`panel${index}a-header`}
                        //       sx={{
                        //         bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                        //         padding: 0, // Removes all padding
                        //         minHeight: 'unset', // Ensures the height is not restricted by default styles
                        //       }}
                        //       className="shadow-sm"
                        //     >
                        //       <Typography variant="body1" style={{ fontSize: '11px' }}>
                        //         <i className="fas fa-layer-group mx-3" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                        //         {trimTitle2(item.title)}
                        //       </Typography>
                        //     </AccordionSummary>
                        //   )}

                        // </Accordion>
                        <SimpleTreeView>
                          <TreeItem
                            key={`tree-item-${index}`} // Unique key
                            itemId={`tree-item-${index}`} // Unique itemId
                            onClick={() =>
                              item.objectTypeId || item.objectID === 0
                                ? previewSublistObject(item, true)
                                : previewObject(item, true)
                            }

                            sx={{
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
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId || item.classID}
                                    />
                                  ) : (
                                    <i className="fa-solid fa-folder" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                  )}
                                  <span style={{ marginLeft: '8px' }}>{item.title}</span>
                                  {item.objectTypeId || item.objectID === 0 && (
                                    <FileExtText
                                      guid={props.selectedVault.guid}
                                      objectId={item.id}
                                      classId={item.classId}
                                    />
                                  )}
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
          <div id="divider" ref={dividerRef} onMouseDown={handleMouseDown} style={{ width: '5px', cursor: 'ew-resize', backgroundColor: '#ccc' }}></div>
        )}


        {/* Object View List */}
        <div id="col2" ref={col2Ref} style={{ width: isMobile ? '100%' : '60%', backgroundColor: '#dedddd', minWidth: '35%', minHeight: '100vh' }}>
          <ObjectData setPreviewObjectProps={setPreviewObjectProps} setSelectedObject={setSelectedObject} resetViews={props.resetViews} mfilesId={props.mfilesId} user={props.user} getObjectComments={getObjectComments2} comments={comments} loadingcomments={loadingcomments} discardChange={discardChange} openDialog={() => setDialogOpen(true)} updateObjectMetadata={updateObjectMetadata} selectedState={selectedState} setSelectedState={setSelectedState} currentState={currentState} selectedObkjWf={selectedObkjWf} transformFormValues={transformFormValues} formValues={formValues} setFormValues={setFormValues} vault={props.selectedVault} email={props.user.email} selectedFileId={selectedFileId} previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject} selectedObject={selectedObject} extension={extension} base64={base64} loadingobjects={loadingobjects} loadingfile={loadingfile} loadingobject={loadingobject} />
        </div>
      </div>

    </>
  );
};

export default DocumentList;

