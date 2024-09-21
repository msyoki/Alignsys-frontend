import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box, List, ListItem, Typography, Select, MenuItem, Button } from '@mui/material';
import DynamicFileViewer from '../DynamicFileViewer';
import SignButton from '../SignDocument';
import axios from 'axios';
import * as constants from '../Auth/configs';
import LookupMultiSelect from '../UpdateObjectLookupMultiSelect';
import LookupSelect from '../UpdateObjectLookup';
import LinearProgress from '@mui/material/LinearProgress';
import Bot from '../Bot';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CommentsCompoenent from '../ObjectComments'



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
        <Box sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
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

const formatDateForInput = (dateString) => {
  const [month, day, year] = dateString.split('/').map(num => num.padStart(2, '0'));
  return `${year}-${month}-${day}`;
};



export default function ObjectData(props) {
  const [value, setValue] = useState(0);



  // Handle state change
  const handleStateChange = (event) => {
    const selectedTitle = event.target.value;
    const selectedState = props.selectedObkjWf.nextStates.find(state => state.title === selectedTitle);

    if (props.selectedState) {
      props.setSelectedState(selectedState);

    }

  };


  // const [formValues, setFormValues] = useState({});

  const handleInputChange = (id, newValues, datatype) => {
    props.setFormValues(prevFormValues => {
      // Ensure prevFormValues is always an object
      const newFormValues = { ...(prevFormValues || {}) };

      if (datatype === 'MFDatatypeMultiSelectLookup') {
        // For multi-select, newValues is an array of selected IDs
        newFormValues[id] = { value: newValues, datatype };
      } else {
        // For single-select or text-based inputs, newValues is a single value
        newFormValues[id] = { value: newValues, datatype };
      }

      if (newValues.length === 0) {
        delete newFormValues[id];
      }

      console.log("Updated formValues:", newFormValues);

      // Return null if newFormValues is empty, otherwise return the updated object
      return Object.keys(newFormValues).length === 0 ? null : newFormValues;
    });
  };






  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const downloadFile = async () => {
    try {
      const response = await axios.get(`${constants.mfiles_api}/api/objectinstance/DownloadActualFile/${props.vault.guid}/${props.selectedObject.id}/${props.selectedObject.classID}/${props.selectedFileId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      let fileName = `${props.selectedObject.title}`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch[1]) fileName = fileNameMatch[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert('Failed to download the file. Please try again.');
    }
  };

  const filteredProps = props.previewObjectProps.filter(
    item => !['Last modified by', 'Last modified', 'Created', 'Created by', 'Accessed by me', 'Class'].includes(item.propName)
  );

  const getPropValue = name => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);
    return foundItem ? foundItem.value : null;
  };

  return (
    <Box  >
      <Box sx={{ display: 'flex', flexDirection: 'column' }} className='bg-white'>
        <Tabs
          // orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderColor: 'divider' }}
          className='bg-white'
        >
          <Tab style={{ textTransform: 'none' }} label="Metadata" {...a11yProps(0)} />
          <Tab style={{ textTransform: 'none' }} label="Preview" {...a11yProps(1)} />
          <Tab style={{ textTransform: 'none' }} label="AI Chatbot" {...a11yProps(2)} />
          <Tab style={{ textTransform: 'none' }} label="Comments" {...a11yProps(3)} />

        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1, margin: 0 }} >
        <CustomTabPanel value={value} index={0} style={{ backgroundColor: '#e5e5e5', height: '90vh', padding: '0%', width: '100%' }}>
          {props.previewObjectProps.length < 1 && (
            <Box sx={{ width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
              <i className="fas fa-info-circle my-2" style={{ fontSize: '120px', color: '#1d3557' }}></i>
              {props.loadingobject ? <>
                <Box sx={{ width: '50%' }} className="my-2">
                  <LinearProgress />
                </Box>
                <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Loading metadata...</Typography>
              </> : <> <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Metadata Card</Typography></>}

              <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                Select an object to view its metadata
              </Typography>
            </Box>
          )}
          {props.previewObjectProps.length > 0 && (

            <Box>
              <Box className=" bg-white p-1  my-1 shadow-lg" >
                <Box className="my-1 bg-white" display="flex" justifyContent="space-between">


                  <Box className="input-group" sx={{ width: '40%', mb: 1, display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <span className='text-center mx-3 '><span style={{ color: '#1d3557' }} className='mx-1 fas fa-tag'></span><span style={{ color: '#1d3557' }}> Class:  </span>  {getPropValue('Class')}</span>



                  </Box>

                  <Box className='input-group' sx={{ textAlign: 'end', fontSize: '12px', width: '60%', fontSize: '10px' }}>
                    {(Object.keys(props.formValues || {}).length > 0 || props.selectedState.title) && (
                      <>
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => props.openDialog()}
                            sx={{ textTransform: 'none', mr: 1 }}
                          >
                            <i className="fas fa-save" style={{ fontSize: '11px', cursor: 'pointer', marginRight: '4px' }}></i>
                            <small> Save </small>
                          </Button>
                        </Box>
                        <Box>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => props.discardChange()}
                            sx={{ textTransform: 'none', mr: 1 }}
                          >
                            <i className="fas fa-trash" style={{ fontSize: '11px', cursor: 'pointer', marginRight: '4px' }}></i>
                            <small> Discard </small>
                          </Button>
                        </Box>
                      </>

                    )}

                    {props.selectedObject.objectID === 0 && props.extension === 'pdf' && (
                      <Box >
                        <SignButton objectid={props.selectedObject.id} fileId={props.selectedFileId} vault={props.vault.guid} email={props.email} />
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={downloadFile}
                          sx={{ textTransform: 'none', ml: 1 }}
                        >
                          <i className="fas fa-download" style={{ fontSize: '11px', cursor: 'pointer', marginRight: '4px' }}></i>
                          <small>Download</small>
                        </Button>

                      </Box>
                    )}

                  </Box>
                </Box>
              </Box>
              <Box className='shadow-lg p-4 shadow-sm' sx={{ width: '100%', height: '60vh', overflowY: 'scroll', backgroundColor: '#e8f9fa' }}>

                <List sx={{ p: 0 }}>
                  {filteredProps.map((item, index) => (
                    <ListItem key={index} sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography className='my-2' variant="body2" sx={{ color: '#1d3557', fontWeight: 'bold', flexBasis: '30%', fontSize: '12px', textAlign: 'end' }}>

                          {item.propName === "Comment" ? <>Latest Comment</> : <> {item.propName}</>}

                          :
                        </Typography>

                        <Box sx={{ flexBasis: '70%', fontSize: '12px', textAlign: 'start', ml: 1 }}>

                          {item.propName === 'Class' && <>{item.value}</>}
                          {item.datatype === 'MFDatatypeText' && (
                            <input
                              value={props.formValues?.[item.id]?.value || ''}
                              placeholder={item.value}
                              onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                              className='form-control form-control-sm my-1'
                            />
                          )}
                          {item.propName === "Assignment description" || item.propName === "Comment" ?
                            <>
                              <textarea
                                placeholder={item.value}
                                value={props.formValues?.[item.id]?.value || ''}
                                onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                rows={2}
                                disabled
                                className='form-control form-control-sm my-1'
                              />
                            </> :
                            <>
                              {item.propName === "Comment" ?
                                <>
                                </> :
                                <>
                                  {item.datatype === 'MFDatatypeMultiLineText' && (
                                    <textarea
                                      placeholder={item.value}
                                      value={props.formValues?.[item.id]?.value || ''}
                                      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                      rows={2}
                                      className='form-control form-control-sm my-1'
                                    />
                                  )}

                                </>
                              }

                            </>
                          }
                          {item.datatype === 'MFDatatypeDate' && (
                            <input
                              placeholder={item.value}
                              type="date"
                              value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                              onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                              className='form-control form-control-sm my-1'
                            />
                          )}
                          {item.datatype === 'MFDatatypeBoolean' && (

                            <Select
                              size='small'
                              value={props.formValues?.[item.id]?.value ?? (item.value === "Yes" ? true : (item.value === "No" ? false : ''))}
                              onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                              displayEmpty
                              fullWidth
                              className='form-control form-control-sm bg-white my-1'
                            >
                              <MenuItem value=""><em>None</em></MenuItem>
                              <MenuItem value={true}>No</MenuItem>
                              <MenuItem value={false}>Yes</MenuItem>
                            </Select>

                          )}
                          {item.datatype === 'MFDatatypeMultiSelectLookup' && (
                            <LookupMultiSelect
                              propId={item.id}
                              onChange={(id, newValues) => handleInputChange(id, newValues, item.datatype)}
                              value={props.formValues?.[item.id]?.value || []}  // Ensure `value` is an array for multi-select
                              selectedVault={props.vault}
                              label={item.propName}

                              itemValue={item.value}  // Assuming item.value is a string of ;-separated values

                            />
                          )}
                          {item.datatype === 'MFDatatypeLookup' && item.propName !== 'Class' && (
                            <LookupSelect
                              propId={item.id}
                              label={item.propName}
                              onChange={(id, newValue) => handleInputChange(id, newValue, item.datatype)}
                              value={props.formValues?.[item.id]?.value || ''}
                              selectedVault={props.vault}

                              itemValue={item.value}
                            />
                          )}

                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} className="my-3">
                  <Typography variant="body2" sx={{ color: '#1d3557', fontWeight: 'bold', flexBasis: '30%', fontSize: '12px', textAlign: 'end' }}>
                    Assignment Description:
                  </Typography>
                  <Box sx={{ flexBasis: '70%', fontSize: '14px', textAlign: 'start', ml: 1 }}>
                    {props.selectedObkjWf && <>{props.selectedObkjWf.assignmentdesc}</>}
                  </Box>
                </Box> */}

              </Box>
              <Box className="bg-white p-2 shadow-sm my-1" display="flex" justifyContent="space-between">


                <Box sx={{ textAlign: 'start', fontSize: '12px', width: '80%' }} >
                  {props.selectedObkjWf ?
                    <>
                      <p className='my-1'>
                        <i className="fas fa-circle-notch bold text-danger mx-2"></i>

                        <span ><small style={{ color: '#1d3557', fontWeight: 'bold' }}>Workflow</small> :  {props.selectedObkjWf.workflowTitle}</span>
                      </p>
                      <p className='my-1'>
                        <i className="fas fa-square-full bold text-warning mx-2"></i>

                        <span ><small style={{ color: '#1d3557', fontWeight: 'bold' }}>State</small> :  {props.currentState.stateTitle}</span>
                        {props.selectedObkjWf.nextStates ? <>
                          {/* {props.selectedObkjWf.nextStates.length > 0 ?
                            <i className="mx-1 fas fa-long-arrow-alt-right text-primary text-bold"></i>
                            : <></>
                          } */}

                          <Select
                            value={props.selectedState.title}
                            onChange={handleStateChange}
                            size="small"
                            sx={{ fontSize: '12px', height: '20px' }}
                            className='mx-1 '
                          >
                            {/* Include the current state as an option */}

                            {props.selectedObkjWf.nextStates.map((state) => (
                              <MenuItem key={state.id} value={state.title}>
                                <i className="mx-1 fas fa-long-arrow-alt-right text-primary"></i>  {state.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </> : <></>}
                      </p>
                    </>
                    : <>
                      <p className='my-0'>
                        {/* <i className="fas fa-network-wired bold text-danger mx-2"></i>
                        <span style={{color:'#1d3557',fontWeight:'bold'}}> Workflow : </span> */}
                        <span className='mx-2'> --- </span>
                      </p>
                      <p className='my-0'>
                        {/* <i className="fas fa-square-full bold text-warning mx-2"></i>
                        <span style={{color:'#1d3557',fontWeight:'bold'}}> State : </span> */}
                        <span className='mx-2'> --- </span>
                      </p>

                    </>
                  }
                </Box>
                <Box sx={{ textAlign: 'end', fontSize: '12px', width: '30%', fontSize: '10px' }}>
                  <p className='my-0'>Created: {getPropValue('Created')}</p>
                  <p className='my-0'>Last modified: {getPropValue('Last modified')}</p>


                </Box>

              </Box>
            </Box>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1} style={{ backgroundColor: '#e5e5e5', height: '90vh', padding: '0%', width: '100%' }}>
          {props.base64 ? (
            <DynamicFileViewer
              base64Content={props.base64}
              fileExtension={props.extension}
              objectid={props.selectedObject.id}
              fileId={props.selectedFileId}
              vault={props.vault.guid}
              email={props.email}
            />
          ) : (
            <Box
              sx={{ width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}

            >
              <i className="fas fa-tv my-2" style={{ fontSize: '120px', color: '#1d3557' }}></i>

              {props.loadingfile ? <>
                <Box sx={{ width: '50%' }} className="my-2">
                  <LinearProgress />
                </Box>
                <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Loading file...</Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                  Please wait as we load the document
                </Typography>

              </> : <> <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Nothing to Preview</Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                  Select a document to view its content
                </Typography>
              </>}

            </Box>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2} style={{ backgroundColor: '#e5e5e5', height: '90vh', padding: '0%', width: '100%' }} >
          {props.base64 && props.extension === 'pdf' ? (
            <Bot base64={props.base64} objectTitle={props.selectedObject.title} />
          ) : (
            <>

              <Box
                sx={{ width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}
              >
                <i className="fas fa-robot my-2" style={{ fontSize: '120px', color: '#1d3557' }}></i>

                {props.loadingfile ? <>
                  <Box sx={{ width: '50%' }} className="my-2">
                    <LinearProgress />
                  </Box>
                  <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Starting chat...</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                    Please wait as we load the resources
                  </Typography>
                </> : <> <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>No PDF Selected</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                    Please select a PDF to interact with the chatbot
                  </Typography>
                </>}

              </Box>
            </>
          )}

        </CustomTabPanel>
        <CustomTabPanel value={value} index={3} style={{ backgroundColor: '#e5e5e5', height: '90vh', padding: '0%', width: '100%' }} >
          {props.comments.length > 0 ? (
            <CommentsCompoenent user={props.user} comments={props.comments} getObjectComments={props.getObjectComments} />
          ) : (
            <>

              <Box
                sx={{ width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}
              >
                <i className="fas fa-comments my-2" style={{ fontSize: '120px', color: '#1d3557' }}></i>

                {props.loadingcomments ? <>
                  <Box sx={{ width: '50%' }} className="my-2">
                    <LinearProgress />
                  </Box>
                  <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Searching comments...</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                    Please wait as we load the comments
                  </Typography>
                </> : <> <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>No Comments</Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                    Please select an object to preview comments
                  </Typography>
                </>}

              </Box>
            </>
          )}

        </CustomTabPanel>
      </Box>


    </Box>
  );
}

ObjectData.propTypes = {
  formValues: PropTypes.object.isRequired,
  previewObjectProps: PropTypes.arrayOf(
    PropTypes.shape({
      propName: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired,
    })
  ).isRequired,
  base64: PropTypes.string,
  extension: PropTypes.string,
  selectedFileId: PropTypes.string.isRequired,
  selectedObject: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    objectID: PropTypes.number.isRequired,
    classID: PropTypes.number.isRequired,
  }).isRequired,
  vault: PropTypes.shape({
    guid: PropTypes.string.isRequired,
  }).isRequired,
  email: PropTypes.string.isRequired,
};
