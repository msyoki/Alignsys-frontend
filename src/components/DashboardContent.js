import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewFileFormModal from './UploadNewFile';
import FileInputModal from './showFileInput';
import Loader from './Loaders/LoaderMini';
import { Table, Thead, Tbody, Tr, Th, Td, IconButton, Button } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, ViewIcon } from '@chakra-ui/icons';
import logo from "../images/ZF.png";
import MFilesDocumentPreviewer from './Previewer';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import CircularProgress from '@mui/material/CircularProgress';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  // Accordion,
  // AccordionItem,
  // AccordionButton,
  // AccordionPanel,
  // AccordionIcon,
  // Box
} from '@chakra-ui/react'
import FileUpdateModal from './UpdateFile';

import { Spinner } from '@chakra-ui/react'
import TransitionAlerts from './Alert';
import ObjectView from './ObjectView';
import NetworkIcon from './NetworkStatus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewsList from './ViewsList';
import VaultSelectForm from './SelectVault';

const baseurl = "http://41.89.92.225:5006"
const baseurldata = "http://41.92.225.149:240"
const baseurldss = "http://41.92.225.149"


const DocumentList = (props) => {

  const [loading, setLoading] = useState(false)
  let [requisitionProps, setRequisitionProps] = useState({})
  let [docProps, setDocProps] = useState({})
  let [selectedObject, setSelectedObject] = useState({})
  let [selectedFile, setSelectedFile] = useState({});
  let [loadingfiles, setLoadingFiles] = useState(false)
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

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [base64, setBase64] = useState('')
  const [extension, setExtension] = useState('')


  const handleAccordionChange = (index) => (event, isExpanded) => {
    setSelectedIndex(isExpanded ? index : null);
  };

  let [fileUrl, setFileUrl] = useState('')


  const switchToTab = (index) => {
    setTabIndex(index);
  };


  const getLinkedObjects = async (id, classid, objectType) => {
    setLoadingFiles(true)
    try {
      let url = `http://192.236.194.251:240/api/objectinstance/LinkedObjects/${props.selectedVault.guid}/${objectType}/${id}`
      const response = await axios.get(url);
      console.log(response.data)
      setLinkedObjects(response.data)
      setLoadingFiles(false)
    }
    catch (error) {
      setLoadingFiles(false)
      setLinkedObjects([])
      console.error('Error fetching requisition data:', error);

    }


  }

  const previewObject = async (objectId, classId, objectType) => {
    getLinkedObjects(objectId, classId, objectType)
    try {
      // setLoadingPreviewObject(true)
      const response = await axios.get(`http://192.236.194.251:240/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${objectId}/${classId} `);
      setPreviewObjectProps(response.data)
      console.log(response.data)
      // setLoadingPreviewObject(false)

    } catch (error) {
      console.error('Error fetching view objects:', error);
    }
    if (objectType === 0) {
      try {
        const response = await axios.get(
          `http://192.236.194.251:240/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${objectId}/${objectType}`,
          {
            headers: {
              Accept: '*/*'
            }
          }
        );
        console.log(response.data);
        alert(`${response.data[0].fileID}`)
        // Handle response data
      } catch (error) {
        console.error('Error:', error);
        // Handle error
      }
    }
  };

  const previewSublistObject = async (objectId, classId, objectType) => {
    try {
      const propsResponse = await axios.get(`http://192.236.194.251:240/api/objectinstance/GetObjectViewProps/${props.selectedVault.guid}/${objectId}/${classId}`);
      setPreviewObjectProps(propsResponse.data);
      console.log(propsResponse.data);
    } catch (error) {
      console.error('Error fetching view objects:', error);
      return;
    }

    if (objectType === 0) {
      try {
        const filesResponse = await axios.get(`http://192.236.194.251:240/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${objectId}/${objectType}`, {
          headers: {
            Accept: '*/*'
          }
        });
        console.log(filesResponse.data);
        const fileId = filesResponse.data[0].fileID;

        try {
          const downloadResponse = await axios.get(`http://192.236.194.251:240/api/objectinstance/DownloadFile/${props.selectedVault.guid}/${objectId}/${objectType}/${fileId}`, {
            headers: {
              Accept: '*/*'
            }
          });
          setBase64(downloadResponse.data.base64);
          setExtension(downloadResponse.data.extension.replace('.', ''));

        } catch (error) {
          console.error('Error downloading file:', error);
        }
      } catch (error) {
        console.error('Error fetching object files:', error);
      }
    }
    else {
      setBase64('');
      setExtension('');
    }
  };


  const getProps = async (objId, internalId, classId, title) => {
    setSelectedObject({})
    switchToTab(0)
    setDocProps({})
    setFileUrl('')
    setRequisitionProps({})
    // console.log({ "objID": objId, "internalID": internalId, "classID": classId, "title": title })
    setSelectedObject({ "objID": objId, "internalID": internalId, "classID": classId, "title": title })
    try {
      let url = '';
      if (objId === 0) {
        setSelectedFileId(internalId)
        url = `${baseurldata}/api/RequisitionDocs?ObjectID=${objId}&InternalID=${internalId}&ClassID=${classId}`
      } else {
        getLinkedObjects(objId)
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

      {/* <FileUpdateModal isOpen={isModalOpenUpdateFile} onClose={() => setIsModalOpenUpdateFile(false)} selectedFile={selectedObject} refreshUpdate={refreshUpdate} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} /> */}
      <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '2px',
              backgroundColor: '#1d3557',
              color: '#ffffff',
            }}
          >
            {/* Vault information */}
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              {/* <img src={logo} alt="logo" style={{ width: '8%', marginRight: '10px' }} /> */}
              <h3 className="text-center p-2 mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h3>
              <i className="fas fa-hdd mx-2" style={{ fontSize: '25px' }}></i>
              <VaultSelectForm activeVault={props.selectedVault} />
              <div
                onClick={props.getVaultObjects}
                className="create-button mx-4"
                style={{
                  color: '#fff',
                  width: '40px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#1d3557',
                  borderColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  marginRight: '10px',
                }}
              >
                <i className="fas fa-plus" style={{ fontSize: '25px' }}></i>
              </div>

              {/* Home Button */}
              <div
                className="home-button mx-2"
                style={{
                  color: '#fff',
                  width: '40px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#1d3557',
                  borderColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={reloadPage}
              >
                <i className="fas fa-home" style={{ fontSize: '25px' }}></i>
              </div>
            </Box>

            {/* Buttons */}
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              {/* Create Button */}
           
              <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            color="text.white"
            fontSize="12.5px"
         
          >

            <Box mr={3}>{props.user.first_name} {props.user.last_name}</Box>
            <Box mr={3} >
              <NetworkIcon />
            </Box>
          </Box>
            </Box>
          </Box>
      <div className="row"  >
        <div className="col-md-5 col-sm-12 shadow-lg  " style={{ height: '100vh' }}>
        

          <form onSubmit={handleSearch} >


            <div className="input-group d-flex p-3" >
              <input

                className="form-control form-control-sm"
                type="text"
                required
                placeholder="Search "
                value={props.searchTerm}
                onChange={(e) => props.setSearchTerm(e.target.value)}
              />
              <Button
                variant="contained"
                color="warning"
                size="medium"
                style={{ backgroundColor: '#f4b942', fontSize: '13px', borderColor: '#ffba08' }} type="submit">
                <i className="fas fa-search mx-2"></i> Quick Search
              </Button>

            </div>

            <TransitionAlerts setOpen={setOpenAlert} open={openAlert} alertSeverity={alertSeverity} alertmsg={alertMsg} />


          </form>
          {/* <p className="text-center my-2">Requisition # {props.data.requisitionNumber}</p> */}
          <div className="table-responsive-sm shadow-lg  bg-white"  >
            {loading ? <Loader /> :
              <>
                {/* Search Results */}
                {props.data.length > 0 ?
                  <>
    
                    <h6  className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e5e5e5' }}> <i className="fas fa-list mx-2 " style={{ fontSize: '1.5em',color:'#2a68af' }}></i> Search Results </h6>

                    <div  style={{ height: '65vh', overflowY: 'scroll' }}>
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
                          {item.objectID === 0 ? <></> :
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}
                              aria-controls={`panel${index}a-content`}
                              id={`panel${index}a-header`}
                              sx={{
                                bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                              }} onClick={() => previewObject(item.id, item.classID, item.objectID)}>
                              <Typography variant="body1" style={{ fontSize: '12px' }}><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#2a68af' }}></i> {item.title} </Typography>
                            </AccordionSummary>
                          }
                          {linkedObjects ?
                            <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className='p-2 shadow-sm'>
                              {/* <NewFileFormModal internalId={`${selectedObject.internalID}`} selectedObjTitle={selectedObject.title} searchTerm={props.searchTerm} handleSearch={props.handleSearch2} docClasses={props.docClasses} allrequisitions={props.allrequisitions} user={props.user} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} /> */}
                              {linkedObjects.requisitionID === item.internalID ? <>
                                {loadingfiles ?
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
                                    {linkedObjects.length > 0 ? <Typography variant="body2" style={{ fontSize: '11px', color: "#2a68af" }} className='mx-1'>Documents </Typography> : <></>}
                                    <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                      <tbody>
                                        {linkedObjects.map((item, index) => (
                                          <tr key={index} onClick={() => previewSublistObject(item.id, item.classID, item.objectID)}>
                                            <td>{item.objectID === 0 ? <i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '14px' }} ></i> : <i className="fas fa-folder text-danger mx-1" style={{ fontSize: '14px' }} ></i>} {item.title}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {!linkedObjects.length > 0 ? <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No attached Documents</p> : <></>}
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
                    {/* Created By Me */}
                    {props.data2.length > 0 ?
                      <>
                        <h6 className=' p-2' style={{ fontSize: '12px', backgroundColor: '#2a68af', color: '#fff' }}><i className="far fa-clock mx-2"></i> Created By Me</h6>
                        
                    <h6  className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e5e5e5' }}> <i className="fas fa-list mx-2 " style={{ fontSize: '1.5em',color:'#2a68af' }}></i> Search Results </h6>

                        <div  style={{ height: '65vh', overflowY: 'scroll' }}>
                          {props.data2.filter((item => item.classID === 37 || item.classID === 40 || item.classID === 41 || item.classID === 42 || item.classID === 43 || item.classID === 44 || item.classID === 45 || item.classID === 46 || item.classID === 47 || item.classID === 48 || item.classID === 49 || item.classID === 50 || item.classID === 51)).map((item, index) =>
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
                              {item.objectID === 0 ? <></> :
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}
                                  aria-controls={`panel${index}a-content`}
                                  id={`panel${index}a-header`}
                                  sx={{
                                    bgcolor: selectedIndex === index ? 'rgba(63, 81, 181, 0.1)' : 'inherit',
                                  }} onClick={() => previewSublistObject(item.id, item.classID, item.objectID)}>
                                  <Typography variant="body1" style={{ fontSize: '12px' }}><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#2a68af' }}></i> {item.title} </Typography>
                                </AccordionSummary>
                              }
                              {linkedObjects ?
                                <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className='p-2 shadow-sm'>
                                  {/* <NewFileFormModal internalId={`${selectedObject.internalID}`} selectedObjTitle={selectedObject.title} searchTerm={props.searchTerm} handleSearch={props.handleSearch2} docClasses={props.docClasses} allrequisitions={props.allrequisitions} user={props.user} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} /> */}
                                  {linkedObjects.requisitionID === item.internalID ? <>
                                    {loadingfiles ?
                                      <div className='text-center'>
                                        <Spinner
                                          thickness='4px'
                                          speed='0.65s'
                                          emptyColor='gray.200'
                                          color='blue.500'
                                          size='xl'
                                          style={{ width: '40px', height: '40px' }}
                                        />
                                        <p className='text-dark my-2' style={{ fontSize: '11px' }}>Searching attachments...</p>
                                      </div>
                                      :
                                      <>
                                        {/* {linkedObjects.documents.length > 0 ? <Typography variant="body2" style={{ fontSize: '11px', color: "#2a68af" }} className='mx-1'>Documents </Typography> : <></>}
                                        <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                          <tbody>
                                            {linkedObjects.documents.map((item, index) => (
                                              <tr key={index} onClick={() => getProps(0, item.documentid, item.classID, item.title)}>
                                                <td><i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '14px' }} ></i> {item.title}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                        {!linkedObjects.documents.length > 0 ? <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No attached Documents</p> : <></>} */}
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
                        <div >


                          <ViewsList previewSublistObject={previewSublistObject} selectedObject={selectedObject} linkedObjects={linkedObjects} loadingfiles={loadingfiles} selectedVault={props.selectedVault} setPreviewObjectProps={setPreviewObjectProps} setLoadingPreviewObject={setLoadingPreviewObject} previewObject={previewObject} />
                        </div>
                      </>
                    }
                  </>
                }
              </>
            }
          </div>

        </div>
        <div className="col-md-7 col-sm-12 shadow-lg  bg-white" style={{ height: '100vh' }}>
        

          <ObjectView previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject} extension={extension} base64={base64} />
        </div>
      </div>

    </>
  );
};

export default DocumentList;

