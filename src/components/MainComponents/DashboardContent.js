import React, { useState } from 'react';
import axios from 'axios';
import Loader from '../Loaders/LoaderMini';
import { Button } from '@chakra-ui/react';

import { Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import ObjectPropValue from '../ObjectPropValue';
import * as constants from '../Auth/configs'


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
import FileExt from '../FileExt';
import ConfirmUpdateDialog from '../Modals/ConfirmUpdateObject';


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


  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);


  const relatedObjects = linkedObjects.filter(item => item.objectID !== 0);
  const relatedDocuments = linkedObjects.filter(item => item.objectID === 0);




  // const transformFormValues = () => {
  //   console.log( {
  //     objectid: selectedObject.id,
  //     props: Object.entries(formValues).map(([id, { value, datatype }]) => ({
  //       id: parseInt(id, 10),  // Convert string ID to number
  //       value,
  //       datatype
  //     })),
  //     vaultGuid: props.selectedVault?props.selectedVault.guid:"" // Ensure you replace "string" with the actual vaultGuid
  //   })
  // };


  const transformFormValues = async() => {
    setUpdatingObject(true);
    const requestData = {
      objectid: selectedObject.id,
      objectypeid: selectedObject.objectID,
      classid: selectedObject.classID,
      props: Object.entries(formValues).map(([id, { value, datatype }]) => {
        // Transform value based on its datatype
        let transformedValue;

        switch (datatype) {
          case 'MFDatatypeMultiSelectLookup':
            transformedValue = value.join(", "); // Convert array to a comma-separated string
            break;
          case 'MFDatatypeBoolean':
            transformedValue = value ? "true" : "false"; // Convert boolean to string "true" or "false"
            break;
          case 'MFDatatypeMultiLineText':
            transformedValue = value; // Keep the string as is
            break;
          case 'MFDatatypeLookup':
          case 'MFDatatypeNumber':
            transformedValue = value.toString(); // Convert number to string
            break;
          default:
            transformedValue = value; // Default case, just in case there's an unexpected datatype
            break;
        }

        return {
          id: parseInt(id, 10), // Convert string ID to number
          value: transformedValue,
          datatype,
        };
      }),
      vaultGuid: props.selectedVault ? props.selectedVault.guid : "", // Ensure vaultGuid is correct
    };

    const headers = {
      accept: '*/*',
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.put(
        `${constants.mfiles_api}/api/objectinstance/UpdateObjectProps`,
        requestData,
        { headers }
      );

      // If successful, update the UI and reload object metadata if no state is selected
      if (selectedState === undefined) {
        reloadObjectMetadata();
      }

      // Reset the form and close the dialog
      setFormValues({});
      setDialogOpen(false);
    } catch (error) {
      // Handle any errors
      setDialogOpen(false);
      console.error('Error:', error);
    }
  };


  const transitionState = async () => {
    setUpdatingObject(true)
    const data = {
      vaultGuid: `${props.selectedVault.guid}`,    // Replace with actual value
      objectTypeId: selectedObject.objectID,        // Replace with actual value
      objectId: selectedObject.id,            // Replace with actual value
      nextStateId: selectedState.id,         // Replace with actual value
    };

    await axios.post(`${constants.mfiles_api}/api/WorkflowsInstance/SetObjectstate`, data, {
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        setSelectedState({})
        if (formValues === undefined) {
          reloadObjectMetadata()
        }

        setDialogOpen(false)
      })
      .catch(error => {
        setDialogOpen(false)
        console.error('Error:', error);
      });

  }

  const updateObjectMetadata = () => {
    if (Object.keys(formValues || {}).length > 0) {
      transformFormValues()
    }
    if (selectedState.title) {
      transitionState()
    }
    
    setUpdatingObject(false)
    reloadObjectMetadata()
  }




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
      setLoadingObjects(false)
      setLinkedObjects([])
      console.error('Error fetching requisition data:', error);

    }
  }

  const reloadObjectMetadata = () => {
    if (selectedObject.objectID === 0) {

      previewObject(selectedObject)
    }
    else {

      previewSublistObject(selectedObject)
    }
  }


  const previewObject = async (item) => {
    if (Object.keys(formValues || {}).length > 0 || selectedState.title) {
      handleOpenDialog();
    }
    else {
      setSelectedState({})
      setLoadingObject(true)
      // console.log(formValues)
      setFormValues({})
      getLinkedObjects(item.id, item.classID, item.objectID)
      setSelectedObject(item)
      getSelectedObjWorkflow(item.objectID, item.id)

      try {
        const propsResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${item.classID}`);
        setPreviewObjectProps(propsResponse.data);
        setLoadingObject(false)
      } catch (error) {
        console.error('Error fetching view objects:', error);
        setLoadingObject(false)
      }
      setBase64('');
      setExtension('');
    }

  };

  const discardChange = () => {
    setSelectedState({})
    setFormValues({})
  }

  const previewSublistObject = async (item) => {
    if (Object.keys(formValues || {}).length > 0 || selectedState.title) {
      handleOpenDialog();
    } else {
      setSelectedState({})
      setLoadingObject(true)
      setFormValues({})
      setSelectedObject(item)
      getSelectedObjWorkflow(item.objectID, item.id)

      try {
        const propsResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${item.id}/${item.classID}`);
        setPreviewObjectProps(propsResponse.data);
        setLoadingObject(false)
      } catch (error) {
        console.error('Error fetching view objects:', error);
        setLoadingObject(false)
      }

      if (item.objectID === 0) {
        setLoadingFile(true)
        try {

          const filesResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.objectID}`, {
            headers: {
              Accept: '*/*'
            }
          });
          const fileId = filesResponse.data[0].fileID;

          setSelectedFileId(fileId)


          try {
            const downloadResponse = await axios.get(`${constants.mfiles_api}/api/objectinstance/DownloadFile/${props.selectedVault.guid}/${item.id}/${item.objectID}/${fileId}`, {
              headers: {
                Accept: '*/*'
              }
            });

            setBase64(downloadResponse.data.base64);
            setLoadingFile(false)
            setExtension(downloadResponse.data.extension.replace('.', ''));


          } catch (error) {
            setLoadingFile(false)
            console.error('Error downloading file:', error);

          }
        } catch (error) {
          setLoadingFile(false)
          console.error('Error fetching object files:', error);

        }
      }
      else {
        setBase64('');
        setExtension('');
      }

    }

  };


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


  return (
    <>
      <ConfirmUpdateDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={updateObjectMetadata}
        uptatingObject={uptatingObject}
        message="Would you like to save the changes you made?"
        discardChange={discardChange}
      />
      {/* <FileUpdateModal isOpen={isModalOpenUpdateFile} onClose={() => setIsModalOpenUpdateFile(false)} selectedFile={selectedObject} refreshUpdate={refreshUpdate} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} /> */}

      <div className="row bg"  >

        {/* Object List  */}
        <div className="col-md-5 col-sm-12 p-0" style={{ height: '100vh', overflow: 'clip' }}>
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px',
              fontSize: '12px !important',
              backgroundColor: '#1d3557',
              color: '#ffffff',
            }}
          >

            <Box style={{ display: 'flex', alignItems: 'center' }} className='mx-1'>

              <h4 className="text-center p-2 mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h4>
              <i className="fas fa-hdd mx-2" style={{ fontSize: '20px' }}></i>
              <VaultSelectForm activeVault={props.selectedVault} />
            </Box>


            <Box style={{ display: 'flex', alignItems: 'left' }}>

              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                color="text.white"
                fontSize="12.5px"

              >

                <Box mr={1}>{props.user.first_name} {props.user.last_name}</Box>
                <Box mr={3} >
                  <NetworkIcon />
                </Box>
              </Box>
            </Box>
          </Box>

          <div className='p-2'>


            <form onSubmit={handleSearch} className='mx-2'>


              <div className="input-group d-flex mx-3 my-2" >
                <i onClick={reloadPage} className="fas fa-home text-white " style={{ fontSize: '28px' }}></i>

                <i onClick={props.getVaultObjects} className="fas fa-plus text-white mx-3" style={{ fontSize: '28px' }}></i>

                <input

                  className="form-control form-control-sm "
                  type="text"
                  required
                  placeholder="Search term ... "
                  value={props.searchTerm}
                  onChange={(e) => props.setSearchTerm(e.target.value)}
                />
                <button
                  variant="contained"
                  color="primary"
                  size="medium"
                  style={{ backgroundColor: '#fff', fontSize: '13px', borderColor: '#fff', color: '#1d3557' }}
                  type="submit"
                  className='shadow-lg mx-1'
                >
                  <i className="fas fa-search mx-1" style={{ fontSize: '15px' }}></i>   <span className='mx-1'>Search</span>

                </button>

              </div>

              <TransitionAlerts setOpen={setOpenAlert} open={openAlert} alertSeverity={alertSeverity} alertmsg={alertMsg} />


            </form>
            {/* <p className="text-center my-2">Requisition # {props.data.requisitionNumber}</p> */}
            <div className="table-responsive-sm   bg-white p-3"  >
              {loading ? <Loader /> :
                <>
                  {/* Search Results */}
                  {props.data.length > 0 ?
                    <>

                      <h6 className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e5e5e5' }}> <i className="fas fa-list mx-2 " style={{ fontSize: '1.5em', color: '#1d3557' }}></i> Search Results </h6>

                      <div style={{ height: '60vh', overflowY: 'scroll' }} className='shadow-lg p-4'>
                        {props.data.map((item, index) =>
                          <Accordion key={index}
                            expanded={selectedIndex === index}
                            onChange={handleAccordionChange(index)}
                            sx={{
                              border: selectedIndex === index ? '2px solid #2a68af' : '1px solid rgba(0, 0, 0, .125)',
                              '&:not(:last-child)': {
                                borderBottom: selectedIndex === index ? '2px solid #2a68af' : '1px solid rgba(0, 0, 0, .125)',
                              },
                              '&::before': {
                                display: 'none',
                              },
                            }} >
                            {item.objectID === 0 ? <>
                              <AccordionSummary onClick={() => previewSublistObject(item)} expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${index}a-content`}
                                id={`panel${index}a-header`}
                                sx={{
                                  bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                                }}
                                className='shadow-sm'
                              >
                                {/* <Typography variant="body1" style={{ fontSize: '12px' }}><FileExt guid={props.selectedVault.guid} objectId={item.id} classId={item.classID} /> <ObjectPropValue vault={props.selectedVault.guid} objectId={item.id} classId={item.classID} propName={'Class'} /> {item.title} </Typography> */}
                                <Typography variant="body1" style={{ fontSize: '12px' }}><FileExt guid={props.selectedVault.guid} objectId={item.id} classId={item.classID} />  {item.title} </Typography>
                              </AccordionSummary>


                            </> :
                              <AccordionSummary onClick={() => previewObject(item)} expandIcon={<ExpandMoreIcon />}
                                aria-controls={`panel${index}a-content`}
                                id={`panel${index}a-header`}
                                sx={{
                                  bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                                }}
                                className='shadow-sm'
                              >
                                <Typography variant="body1" style={{ fontSize: '12px' }}><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i> {item.title} </Typography>
                                {/* <Typography variant="body1" style={{ fontSize: '12px' }}><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i><ObjectPropValue vault={props.selectedVault.guid} objectId={item.id} classId={item.classID} propName={'Class'} /> {item.title} </Typography> */}
                              </AccordionSummary>
                            }
                            {linkedObjects ?
                              <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className='p-2 shadow-sm mx-3'>
                                {/* <NewFileFormModal internalId={`${selectedObject.internalID}`} selectedObjTitle={selectedObject.title} searchTerm={props.searchTerm} handleSearch={props.handleSearch2} docClasses={props.docClasses} allrequisitions={props.allrequisitions} user={props.user} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} /> */}
                                {linkedObjects.requisitionID === item.internalID ? <>
                                  {loadingobjects ?
                                    <div className='text-center'>
                                      {/* <Spinner
                          thickness='4px'
                          speed='0.65s'
                          emptyColor='white.200'
                          color='blue.500'
                          size='xl'
                          style={{ width: '40px', height: '40px' }}
                        /> */}

                                      <CircularProgress style={{ width: '40px', height: '40px' }} />

                                      <p className='text-dark ' style={{ fontSize: '11px' }}>Searching attachments...</p>
                                    </div>
                                    :
                                    <>
                                      {linkedObjects.length > 0 ?
                                        <>
                                          {relatedObjects.length > 0 ? <>
                                            <Typography variant="body2" style={{ fontSize: '11px', color: "#fff", backgroundColor: '#1d3557' }} className=' p-1'>Related Objects ({relatedObjects.length}) </Typography>
                                            <table id='createdByMe' className="table " style={{ fontSize: '11px', backgroundColor: '#ffff' }} >

                                              <tbody>

                                                {linkedObjects.map((item, index) => (
                                                  <>
                                                    {item.objectID != 0 ?
                                                      <>


                                                        <tr key={index} onClick={() => previewObject(item)} style={{ cursor: 'pointer' }}>
                                                          <td ><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#0077b6' }} ></i> {item.title}</td>

                                                        </tr>

                                                      </> :
                                                      <>

                                                      </>}

                                                  </>
                                                ))}
                                              </tbody>
                                            </table>
                                          </> : <></>}
                                          {relatedDocuments.length > 0 ? <>
                                            <Typography variant="body2" style={{ fontSize: '11px', color: "#fff", backgroundColor: '#1d3557' }} className=' p-1'>Attached Documents ({relatedDocuments.length}) </Typography>
                                            <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }} >
                                              <tbody>

                                                {linkedObjects.map((item, index) => (
                                                  <>
                                                    {item.objectID === 0 ?
                                                      <>

                                                        <tr key={index} onClick={() => previewSublistObject(item)} style={{ cursor: 'pointer' }}>
                                                          <td><FileExt guid={props.selectedVault.guid} objectId={item.id} classId={item.classID} /> {item.title}</td>
                                                        </tr>
                                                      </> :
                                                      <>

                                                      </>}

                                                  </>
                                                ))}
                                              </tbody>
                                            </table>
                                          </> : <></>}
                                        </>
                                        :
                                        <>
                                          <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No Relationships Found</p>
                                        </>
                                      }
                                    </>
                                  }
                                </> : <></>}
                              </AccordionDetails>
                              :
                              <>
                              </>
                            }
                          </Accordion>
                        )}
                      </div>
                    </>
                    :
                    <>
                      {/* Views */}
                      <ViewsList viewableobjects={props.viewableobjects} previewSublistObject={previewSublistObject} selectedObject={selectedObject} linkedObjects={linkedObjects} loadingobjects={loadingobjects} selectedVault={props.selectedVault} setPreviewObjectProps={setPreviewObjectProps} setLoadingPreviewObject={setLoadingPreviewObject} previewObject={previewObject} />
                    </>
                  }
                </>
              }
            </div>

          </div>
        </div>

        {/* Object View List */}
        <div className="col-md-7 col-sm-12 p-0 shadow-sm" style={{ height: '100vh', overflow: 'clip', backgroundColor: "#e5e5e5" }}>
          <ObjectData openDialog={() => setDialogOpen(true)} updateObjectMetadata={updateObjectMetadata} selectedState={selectedState} setSelectedState={setSelectedState} currentState={currentState} selectedObkjWf={selectedObkjWf} transformFormValues={transformFormValues} formValues={formValues} setFormValues={setFormValues} vault={props.selectedVault} email={props.user.email} selectedFileId={selectedFileId} previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject} selectedObject={selectedObject} extension={extension} base64={base64} loadingobjects={loadingobjects} loadingfile={loadingfile} loadingobject={loadingobject} />
        </div>
      </div>

    </>
  );
};

export default DocumentList;

