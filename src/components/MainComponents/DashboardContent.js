import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../Loaders/LoaderMini';
import { Button } from '@chakra-ui/react';

import { LinearProgress, Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import ObjectPropValue from '../ObjectPropValue';
import * as constants from '../Auth/configs'
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
import FileExt from '../FileExtIcon';
import ConfirmUpdateDialog from '../Modals/ConfirmUpdateObjectDialog';
import TimedAlert from '../TimedAlert';
import { UTurnLeft } from '@mui/icons-material';
import OfficeApp from '../Modals/OfficeAppDialog';


const baseurl = "http://41.89.92.225:5006"
const baseurldata = "http://41.92.225.149:240"
const baseurldss = "http://41.92.225.149"


const DocumentList = (props) => {

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



  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);


  const relatedObjects = linkedObjects.filter(item => (item.objectID !== undefined ? item.objectID : item.objectTypeId) !== 0);
  const relatedDocuments = linkedObjects.filter(item => (item.objectID !== undefined ? item.objectID : item.objectTypeId) === 0);

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
        vaultGuid: props.selectedVault?.guid || "", // Ensure valid vaultGuid
      };

      await axios.put(
        `${constants.mfiles_api}/api/objectinstance/UpdateObjectProps`,
        requestData,
        { headers: { accept: '*/*', 'Content-Type': 'application/json' } }
      );

      if (!selectedState) {
        await reloadObjectMetadata();  // Await reloadObjectMetadata to ensure it's completed
      }

      setFormValues({});
    } catch (error) {
      console.error('Error updating object props:', error);
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
      };

      await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/SetObjectstate`, data, {
        headers: { accept: '*/*', 'Content-Type': 'application/json' },
      });

      setSelectedState({});
      if (!formValues) {
        await reloadObjectMetadata();  // Await reloadObjectMetadata to ensure it's completed
      }

    } catch (error) {
      console.error('Error transitioning state:', error);
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

    setAlertPopOpen(true);
    setAlertPopSeverity("success");
    setAlertPopMessage("Updated successfully!");


  };

  const reloadObjectMetadata = async () => {
    await getSelectedObjWorkflow(selectedObject.objectTypeId, selectedObject.id);

    if (selectedObject.objectTypeId === 0) {
      await previewObject(selectedObject);  // Await previewObject to ensure it's completed
    } else {
      await previewSublistObject(selectedObject);  // Await previewSublistObject to ensure it's completed
    }

  };



  const handleAccordionChange = (index) => (event, isExpanded) => {
    setSelectedIndex(isExpanded ? index : null);
  };

  let [fileUrl, setFileUrl] = useState('')


  const switchToTab = (index) => {
    setTabIndex(index);
  };


  const getLinkedObjects = async (id, classid, objectType) => {
    setLoadingObjects(true)

    try {
      let url = `${constants.mfiles_api}/api/objectinstance/LinkedObjects/${props.selectedVault.guid}/${objectType}/${id}`
      const response = await axios.get(url);

      setLinkedObjects(response.data)

      setLoadingObjects(false)
    }
    catch (error) {
      console.error('Error fetching requisition data:', error);
      setLoadingObjects(false)
      setLinkedObjects([])


    }
  }



  const previewObject = async (item) => {

    setComments([])

    if (Object.keys(formValues || {}).length > 0 || selectedState.title) {
      handleOpenDialog();
    }
    else {
      setSelectedState({})
      setLoadingObject(true)
      // console.log(formValues)
      setFormValues({})
      getLinkedObjects(item.id, (item.classId !== undefined ? item.classId : item.classID), (item.objectTypeId !== undefined ? item.objectTypeId : item.objectID))
      setSelectedObject(item)
      getSelectedObjWorkflow((item.objectTypeId !== undefined ? item.objectTypeId : item.objectID), item.id)

      try {
        const propsResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}`);

        setPreviewObjectProps(propsResponse.data);
        setLoadingObject(false)
      } catch (error) {
        console.error('Error fetching view objects:', error);
        setLoadingObject(false)
      }
      setBase64('');
      setExtension('');
    }
    getObjectComments(item);
  };

  const previewSublistObject = async (item) => {



    // Reset the comments and log the selected item
    setComments([]);

    // Handle dialog open if form values or state exist
    if (Object.keys(formValues || {}).length > 0 || selectedState.title) {
      handleOpenDialog();
      return;
    }

    // Set loading states and clear selected state/form
    setSelectedState({});
    setLoadingObject(true);
    setFormValues({});
    setSelectedObject(item);

    // Fetch the object workflow asynchronously
    getSelectedObjWorkflow((item.objectTypeId !== undefined ? item.objectTypeId : item.objectID, item.id));

    try {
      // Fetch view object properties
      const propsResponse = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${(item.classId !== undefined ? item.classId : item.classID)}`
      );
      setPreviewObjectProps(propsResponse.data);
    } catch (error) {
      console.error('Error fetching view objects:', error);
    } finally {
      setLoadingObject(false);
    }

    // Handle document fetching if item is a document
    if ((item.objectTypeId !== undefined ? item.objectTypeId : item.objectID) === 0) {

      setLoadingFile(true);
      let url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${(item.objectTypeId !== undefined ? item.objectTypeId : item.objectID)}`;

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
            `${constants.mfiles_api}/api/objectinstance/DownloadFile/${props.selectedVault.guid}/${item.id}/${(item.objectTypeId !== undefined ? item.objectTypeId : item.objectID)}/${fileId}`,
            { headers: { Accept: '*/*' } }
          );


          setBase64(downloadResponse.data.base64);
          setExtension(downloadResponse.data.extension.replace('.', ''));
        } catch (downloadError) {
          console.error('Error downloading file:', downloadError);
        } finally {
          setLoadingFile(false);
        }
      } catch (filesError) {
        console.error('Error fetching object files:', filesError);
        setLoadingFile(false);
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
  }




  const getSelectedObjWorkflow = async (dataType, objectsId) => {
    const data = {
      vaultGuid: props.selectedVault.guid,
      objectTypeId: dataType,
      objectId: objectsId
    };


    await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/GetObjectworkflowstates`, data, {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => {

        setSelectedObjWf(response.data)

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
    let objectID = item.objectID !== undefined ? item.objectID : item.objectTypeId;

    const url = `${constants.mfiles_api}/api/Comments?ObjectId=${item.id}&VaultGuid=${props.selectedVault.guid}&ObjectTypeId=${objectID}`;

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

  const signDocument = async () => {
    setPreparingForSigning(true)
    try {
      const response = await axios.get(`${baseurldss}/api/SelfSign/${selectedFileId}/${props.user.staffNumber}`);
      const { filelink } = response.data;
      window.open(filelink, '_blank'); // Open link in new tab
      setPreparingForSigning(false)
    } catch (error) {
      console.error('Error fetching data:', error);
      setPreparingForSigning(false)
      alert('Please try later, the document is currently checked out !!!')
      // Handle error
    }


  };
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
    e.preventDefault();
    setLoading(true)
    // Trigger a search for documents based on 'searchTerm'
    props.searchObject(props.searchTerm, props.selectedVault.guid).then((data) => {
      setLoading(false)
      props.setData(data);
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
      const url = `http://192.236.194.251:240/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
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
        alert('Failed to retrieve file extension.');
      }
    };

    fetchExtension();
  }



  return (
    <>
      <ConfirmUpdateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={updateObjectMetadata}
        uptatingObject={uptatingObject}
        message="Confirm to save staged changes!"
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

      <div className="row bg">
        {/* Object List */}
        <div className="col-md-5 col-sm-12 bg-white p-0" style={{ height: '100vh', overflow: 'clip' }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '5px',
              fontSize: '12px !important',
              backgroundColor: '#1d3557',
              color: '#ffffff',
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center' }} className="mx-1 p-1">
              <i className="fas fa-hdd mx-4" style={{ fontSize: '25px' }}></i>
              <VaultSelectForm activeVault={props.selectedVault} />
            </Box>

            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                color="text.white"
                fontSize="12.5px"
              >
                <Box mr={1}>
                  {props.user.first_name} {props.user.last_name}
                </Box>
                <Box mr={3}>
                  <NetworkIcon />
                </Box>
              </Box>
            </Box>
          </Box>

          <div>
            <div className="shadow-lg p-2 d-flex justify-content-center" style={{ backgroundColor: '#457b9d' }}>
              <form onSubmit={handleSearch} className="input-group" style={{ maxWidth: '600px', width: '100%' }}>
                <div className='mx-3'>
                  <i
                    onClick={reloadPage}
                    className="fas fa-home mx-2"
                    style={{ fontSize: '25px', cursor: 'pointer', color: '#fff' }}
                  ></i>

                  <i
                    onClick={props.getVaultObjects}
                    className="fas fa-plus mx-2"
                    style={{ fontSize: '25px', cursor: 'pointer', color: '#fff' }}
                  ></i>
                </div>

                <input
                  className="form-control form-control-sm"
                  type="text"
                  required
                  placeholder="Search term ..."
                  value={props.searchTerm}
                  onChange={(e) => props.setSearchTerm(e.target.value)}
                />

                <button
                  variant="contained"
                  color="primary"
                  size="medium"
                  style={{ backgroundColor: '#fff', fontSize: '13px', borderColor: '#fff', color: '#1d3557' }}
                  type="submit"
                  className="shadow-lg mx-1 p-1"
                >
                  <i className="fas fa-search" style={{ fontSize: '15px' }}></i>
                  <span className="mx-1">Search</span>
                </button>

                <TransitionAlerts
                  setOpen={setOpenAlert}
                  open={openAlert}
                  alertSeverity={alertSeverity}
                  alertmsg={alertMsg}
                />
              </form>
            </div>

            <div className="table-responsive-sm bg-white">
              {loading ? (
                <Loader />
              ) : (
                <>
                  {props.data.length > 0 ? (
                    <>
                      <h6 className='p-3 text-dark' style={{ fontSize: '12px', backgroundColor: '#e8f9fa' }}>
                        <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1d3557' }}></i>
                        Search Results
                      </h6>

                      <div style={{ height: '65vh', overflowY: 'scroll' }} className='shadow-lg p-3'>
                        {props.data.map((item, index) => (
                          <Accordion
                            key={index}
                            expanded={selectedIndex === index}
                            onChange={handleAccordionChange(index)}
                            sx={{
                              border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                              '&:not(:last-child)': {
                                borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                              },
                              '&::before': { display: 'none' },
                            }}
                          >
                            {(item.objectID !== undefined ? item.objectID : item.objectTypeId) === 0 ? (
                              <AccordionSummary
                                onClick={() => previewSublistObject(item)}
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${index}a-content`}
                                id={`panel${index}a-header`}
                                sx={{ bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit' }}
                                className="shadow-sm"
                              >
                                <Typography variant="body1" style={{ fontSize: '12px' }}>
                                  <FileExt 
                                    guid={props.selectedVault.guid} 
                                    objectId={item.id} 
                                    classId={item.classId !== undefined ? item.classId : item.classID} 
                                  />
                                  {item.title}
                                </Typography>
                              </AccordionSummary>
                            ) : (
                              <AccordionSummary
                                onClick={() => previewObject(item)}
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${index}a-content`}
                                id={`panel${index}a-header`}
                                className="shadow-sm"
                              >
                                <Typography variant="body1" style={{ fontSize: '12px' }}>
                                  <i className="fas fa-layer-group mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i>
                                  {item.title}
                                </Typography>
                              </AccordionSummary>
                            )}
                            {linkedObjects ? (
                              <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className="p-2 shadow-sm mx-3">
                                {linkedObjects.requisitionID === item.internalID ? (
                                  props.loadingobjects ? (
                                    <div className="text-center">
                                      <CircularProgress style={{ width: '20px', height: '20px' }} />
                                      <p className="text-dark" style={{ fontSize: '11px' }}>Searching relationships...</p>
                                    </div>
                                  ) : (
                                    <>
                                      {linkedObjects.length > 0 ? (
                                        <>
                                          {relatedObjects.length > 0 && (
                                            <>
                                              <Typography variant="body2" style={{ fontSize: '11px', color: '#fff', backgroundColor: '#1d3557' }} className="p-1">
                                                Related Objects ({relatedObjects.length})
                                              </Typography>
                                              <table id="
                                              
                                              dByMe" className="table" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                                <tbody>
                                                  {relatedObjects.map((relatedItem, relatedIndex) => (
                                                    <tr key={relatedIndex} onClick={() => previewObject(relatedItem)} style={{ cursor: 'pointer' }}>
                                                      <td>
                                                        <i className="fas fa-layer-group mx-1" style={{ fontSize: '15px', color: '#1d3557' }}></i>
                                                        {relatedItem.title}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </>
                                          )}
                                          {relatedDocuments.length > 0 && (
                                            <>
                                              <Typography variant="body2" style={{ fontSize: '11px', color: '#fff', backgroundColor: '#1d3557' }} className="p-1">
                                                Attached Documents ({relatedDocuments.length})
                                              </Typography>
                                              <table id="createdByMe" className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                                <tbody>
                                                  {relatedDocuments.map((docItem, docIndex) => (
                                                    <tr
                                                      key={docIndex}
                                                      onClick={() => previewSublistObject(docItem)}
                                                      onDoubleClick={() => openApp(docItem)}
                                                      style={{ cursor: 'pointer' }}
                                                    >
                                                      <td>
                                                        <FileExt guid={props.selectedVault.guid} objectId={docItem.id} classId={docItem.classID} />
                                                        {docItem.title}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </>
                                          )}
                                        </>
                                      ) : (
                                        <p className="my-1 mx-1 text-center" style={{ fontSize: '11px' }}>
                                          No Relationships Found
                                        </p>
                                      )}
                                    </>
                                  )
                                ) : null}
                              </AccordionDetails>
                            ) : null}
                          </Accordion>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {props.viewableobjects.length > 0 ? (
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
                        />
                      ) : (
                        <Box sx={{ width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
                          <FontAwesomeIcon icon={faTable} className="my-2" style={{ color: '#1d3557', fontSize: '120px' }} />
                          <Typography variant="body2" className="my-2" sx={{ textAlign: 'center' }}>Loading Views...</Typography>
                          <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>No Views</Typography>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </div>


          </div>
        </div>

        {/* Object View List */}
        <div className="col-md-7 col-sm-12 p-0 shadow-sm" style={{ height: '100vh', overflow: 'clip', backgroundColor: "#e5e5e5" }}>
          <ObjectData user={props.user} getObjectComments={getObjectComments2} comments={comments} loadingcomments={loadingcomments} discardChange={discardChange} openDialog={() => setDialogOpen(true)} updateObjectMetadata={updateObjectMetadata} selectedState={selectedState} setSelectedState={setSelectedState} currentState={currentState} selectedObkjWf={selectedObkjWf} transformFormValues={transformFormValues} formValues={formValues} setFormValues={setFormValues} vault={props.selectedVault} email={props.user.email} selectedFileId={selectedFileId} previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject} selectedObject={selectedObject} extension={extension} base64={base64} loadingobjects={loadingobjects} loadingfile={loadingfile} loadingobject={loadingobject} />
        </div>
      </div>

    </>
  );
};

export default DocumentList;

