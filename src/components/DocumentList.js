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
  const [reqFiles, setReqFiles] = useState({})
  const [tabIndex, setTabIndex] = useState(0);
  const [isModalOpenUpdateFile, setIsModalOpenUpdateFile] = useState(false);
  const[previewObjectProps,setPreviewObjectProps] = useState([])


  let [fileUrl, setFileUrl] = useState('')
  const reloadViewer = () => {
    // Update the page number to re-render the viewer
    setPageNumber(1); // Reset to the first page or use another page number as needed
  };

  const switchToTab = (index) => {
    setTabIndex(index);
  };




  useEffect(() => {
    // Fetch documents from your API and set the initial state
  }, []);



  const getReqFiles = async (id) => {
    setLoadingFiles(true)
    try {
      let url = `${baseurldata}/api/RequisitionDocs/getalldocuments/${id}`
      const response = await axios.get(url);
      setReqFiles(response.data)
      setLoadingFiles(false)
    }
    catch (error) {
      setLoadingFiles(false)
      console.error('Error fetching requisition data:', error);

    }


  }


  // const getPreviewObject = async (id) => {
  //   setLoadingFiles(true)
  //   try {
  //     let url = `${baseurldata}/api/RequisitionDocs/getalldocuments/${id}`
  //     const response = await axios.get(url);
  //     setReqFiles(response.data)
  //     setLoadingFiles(false)
  //   }
  //   catch (error) {
  //     setLoadingFiles(false)
  //     console.error('Error fetching requisition data:', error);

  //   }


  // }

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
        getReqFiles(internalId)
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
        getReqFiles(internalId)
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
    props.getRequisition(props.searchTerm, '125550').then((data) => {
      setLoading(false)
      props.setData(data);
    });

  };


  return (
    <>

      <FileUpdateModal isOpen={isModalOpenUpdateFile} onClose={() => setIsModalOpenUpdateFile(false)} selectedFile={selectedObject} refreshUpdate={refreshUpdate} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} />

      <div className="row shadow-lg"  >
        <div className="col-md-6 col-sm-12 shadow-lg  bg-white" >
          <form onSubmit={handleSearch} >

            <Box
              className="shadow-lg"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between', // Adjusted to space-between
                padding: '8px',
                backgroundColor: '#293241',
                textColor: '#fffff',
                width: '100%',
                // borderRadius: '8px'
              }}
            >
              {/* Box with vault information */}
              <Box sx={{ display: 'flex', alignItems: 'center', color: '#ffff' }}>
                <img src={logo} alt="logo" style={{ width: '8%'}}  className='mx-2'/>
             
                <Typography variant="body1">{JSON.parse(props.selectedVault).name}</Typography>
                <i className="fas fa-hdd mx-3" style={{ fontSize: '15px' }}></i>
              </Box>

              {/* Box with buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                {/* Create Button */}
                <div onClick={openObjectModal} className="create-button mx-2 " style={{ color: '#fff', width: '40px', height: '38px', borderRadius: '50%', backgroundColor: '#293241', borderColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.3s ease', marginRight: '0' }} >
                  <div className="button-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <i className="fas fa-plus" style={{ fontSize: '25px' }}></i>
                  </div>
                </div>

                {/* Home Button */}
                <div className="home-button mx-2" style={{ color: '#fff', width: '40px', height: '38px', borderRadius: '50%', backgroundColor: '#293241', borderColor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.3s ease' }} >
                  <div className="button-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <i className="fas fa-home" style={{ fontSize: '25px' }} onClick={reloadPage}></i>
                  </div>

                </div>

              </Box>
            </Box>
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
          <div className="table-responsive-sm shadow-lg  bg-white" style={{ height: '80vh' ,overflowY:'scroll'}} >
            {loading ? <Loader /> :
              <>
                {/* Search Results */}
                {props.data.length > 0 ?
                  <>
                    <h6 className='p-2' style={{ fontSize: '12px', backgroundColor: '#2a68af', color: '#fff' }}><i className="fas fa-search mx-2"></i> Search Results</h6>
                    <div >
                      {props.data.filter((item => item.classID === 37 || item.classID === 40 || item.classID === 41 || item.classID === 42 || item.classID === 43 || item.classID === 44 || item.classID === 45 || item.classID === 46 || item.classID === 47 || item.classID === 48 || item.classID === 49 || item.classID === 50 || item.classID === 51)).map((item, index) =>
                        <Accordion key={index} sx={{ mb: 0.5 }}>
                          {item.objectID === 0 ? <></> :
                            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                              <Typography variant="body1" style={{ fontSize: '11px' }}><i className="fas fa-folder mx-1" style={{ fontSize: '14px', color: '#2a68af' }}></i> {item.title}</Typography>
                            </AccordionSummary>
                          }
                          {reqFiles ?
                            <AccordionDetails style={{ backgroundColor: '#cce6f4' }} className='p-2 shadow-sm'>
                              <NewFileFormModal internalId={`${selectedObject.internalID}`} selectedObjTitle={selectedObject.title} searchTerm={props.searchTerm} handleSearch={props.handleSearch2} docClasses={props.docClasses} allrequisitions={props.allrequisitions} user={props.user} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} />
                              {reqFiles.requisitionID === item.internalID ? <>
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
                                    {reqFiles.documents.length > 0 ? <Typography variant="body2" style={{ fontSize: '11px', color: "#2a68af" }} className='mx-1'>Documents </Typography> : <></>}
                                    <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                      <tbody>
                                        {reqFiles.documents.map((item, index) => (
                                          <tr key={index} onClick={() => getProps(0, item.documentid, item.classID, item.title)}>
                                            <td><i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '14px' }} ></i> {item.title}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    {!reqFiles.documents.length > 0 ? <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No attached Documents</p> : <></>}
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
                        <div >
                          {props.data2.filter((item => item.classID === 37 || item.classID === 40 || item.classID === 41 || item.classID === 42 || item.classID === 43 || item.classID === 44 || item.classID === 45 || item.classID === 46 || item.classID === 47 || item.classID === 48 || item.classID === 49 || item.classID === 50 || item.classID === 51)).map((item, index) =>
                            <Accordion key={index} sx={{ mb: 0.5 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                                <Typography variant="body1" style={{ fontSize: '11px' }}>{item.objectID === 0 ? <i className="fas fa-file-pdf mx-1 " style={{ fontSize: '14px', color: '#2a68af' }}></i> : <i className="fas fa-folder mx-1" style={{ fontSize: '14px', color: '#2a68af' }}></i>} {item.title}</Typography>
                              </AccordionSummary>
                              {reqFiles.requisitionID === item.internalID ? <>
                                {reqFiles ?
                                  <AccordionDetails style={{ backgroundColor: '#cce6f4' }} className='p-2 shadow-sm'>
                                    <NewFileFormModal internalId={`${selectedObject.internalID}`} selectedObjTitle={selectedObject.title} searchTerm={props.searchTerm} handleSearch={props.handleSearch2} docClasses={props.docClasses} allrequisitions={props.allrequisitions} user={props.user} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} />
                                    {reqFiles.requisitionID === item.internalID ? <>
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
                                          {reqFiles.documents.length > 0 ? <Typography variant="body2" style={{ fontSize: '11px', color: "#2a68af" }} className='mx-1'>Documents </Typography> : <></>}
                                          <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                            <tbody>
                                              {reqFiles.documents.map((item, index) => (
                                                <tr key={index} onClick={() => getProps(0, item.documentid, item.classID, item.title)}>
                                                  <td><i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '14px' }} ></i> {item.title}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                          {!reqFiles.documents.length > 0 ? <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No attached Documents</p> : <></>}
                                        </>
                                      }
                                    </> : <></>}
                                  </AccordionDetails>
                                  : <></>}
                              </> :
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

                        
                           <ViewsList selectedVault={JSON.parse(props.selectedVault).guid} setPreviewObjectProps={setPreviewObjectProps} setLoadingPreviewObject={setLoadingPreviewObject}/>
                        </div>
                      </>
                    }
                  </>
                }
              </>
            }
          </div>

        </div>
        <div className="col-md-6 col-sm-12 shadow-lg  bg-white" >
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            color="text.primary"
            fontSize="12.5px"
            marginTop='20px'
          >

            <Box mr={2}>{props.user.first_name} {props.user.last_name}</Box>
            <Box mr={2} >
              <NetworkIcon />
            </Box>
          </Box>

          <ObjectView previewObjectProps={previewObjectProps} loadingPreviewObject={loadingPreviewObject}/>
        </div>
      </div>

    </>
  );
};

export default DocumentList;

