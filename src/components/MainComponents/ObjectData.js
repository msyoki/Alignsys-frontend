import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DynamicFileViewer from '../DynamicFileViewer';
import SignButton from '../SignDocument';
import axios from 'axios';
import * as constants from '../Auth/configs';
import LookupMultiSelect from '../UpdateObjectLookupMultiSelect';
import LookupSelect from '../UpdateObjectLookup';
import LinearProgress from '@mui/material/LinearProgress';
import { Tabs, Tab, Box, List, ListItem, Typography, Select, MenuItem, Button } from '@mui/material';
import Bot from '../Bot';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CommentsCompoenent from '../ObjectComments'
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';
import ConfirmDeleteObject from '../Modals/ConfirmDeleteObject';
import TimedAlert from '../TimedAlert';
import { Tooltip } from '@mui/material';


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
        <Box sx={{ height: '100%', overflowY: 'auto' }}>
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMsg, setAlertMsg] = useState('');



  const deleteObject = () => {

    let data = JSON.stringify({
      "vaultGuid": props.vault.guid,
      "objectId": props.selectedObject.id,
      "classId": props.selectedObject.classID,
      "userID": props.mfilesId
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${constants.mfiles_api}/api/ObjectDeletion/DeleteObject`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        props.setPreviewObjectProps([])
        props.setSelectedObject({})
        props.resetViews()
        setOpenAlert(true);
        setAlertSeverity("success");
        setAlertMsg("Object was deleted successsfully");
        setDeleteDialogOpen(false)

      })
      .catch((error) => {
        setOpenAlert(true);
        setAlertSeverity("error");
        setAlertMsg("Failed to delete, please try again later");
        setDeleteDialogOpen(false)

        console.log(error);
      });


  }

  const navigateToComments = () => {
    setValue(3);
  };

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
    item => !['Last modified by', 'Last modified', 'Created', 'Created by', 'Accessed by me', 'Class', 'State', 'Workflow'].includes(item.propName)
  );


  const getPropValue = name => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);
    return foundItem ? foundItem.value : null;
  };





  return (
    <>
      <ConfirmDeleteObject open={deleteDialogOpen} Delete={deleteObject} Close={() => setDeleteDialogOpen(false)} objectTitle={props.selectedObject.title} />
      <TimedAlert
        open={openAlert}
        onClose={() => setOpenAlert(false)}
        severity={alertSeverity}
        message={alertMsg}
        setSeverity={setAlertSeverity}
        setMessage={setAlertMsg}
      />

      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'row' }} className='bg-white'>
          <Tabs
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Horizontal tabs example"
            sx={{ borderColor: 'divider' }}
            className='bg-white'
          >
            <Tab
              style={{ textTransform: 'none' }}
              sx={{

                width: 'auto',
                height: '61px',
                minWidth: 'auto',      // Adjust the width to fit the label text
              }}
              label="Metadata"
              {...a11yProps(0)}
            />
            <Tab
              style={{ textTransform: 'none' }}
              sx={{

                width: 'auto',
                height: '61px',
                minWidth: 'auto',      // Adjust the width to fit the label text
              }}
              label="Preview"
              {...a11yProps(1)}
            />
            <Tab
              style={{ textTransform: 'none' }}
              sx={{

                width: 'auto',
                height: '61px',
                minWidth: 'auto',      // Adjust the width to fit the label text
              }}
              label="AI Chatbot"
              {...a11yProps(2)}
            />
            <Tab
              style={{ textTransform: 'none' }}
              sx={{

                width: 'auto',
                height: '61px',
                minWidth: 'auto',      // Adjust the width to fit the label text
              }}
              label="Comments"
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, margin: 0, color: '#555' }} >
          <CustomTabPanel
            value={value}
            index={0}
            style={{
              backgroundColor: '#dedddd',

              padding: '0%',
              width: '100%',

            }}
          >
            {props.previewObjectProps.length < 1 && (
              <Box sx={{
                width: '100%',
                marginTop: '20%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto'
              }}>
                <i
                  className="fas fa-info-circle my-2"
                  style={{ fontSize: '120px', color: '#2757aa' }}
                />
                {props.loadingobject ? (
                  <>
                    <Box sx={{ width: '50%' }} className="my-2">
                      <LinearProgress />
                    </Box>
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Loading metadata...
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Metadata Card
                    </Typography>
                  </>
                )}

                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', fontSize: '12px' }}
                >
                  Please select an object to view its metadata
                </Typography>
              </Box>
            )}

            {props.previewObjectProps.length > 0 && (
              <Box>

                <Box
                  className="  shadow-lg p-2"
                  display="flex"
                  flexDirection="column"
                  sx={{ height: '53px', backgroundColor: '#edf2f4' }}
                >
                  <Box
                    className="input-group"
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 'important 12px'

                    }}
                  >
                    <span className='text-center ' style={{ color: '#1d3557' }}>
                      {props.selectedObject && (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) ? (
                        <>
                          <FileExtIcon
                            guid={props.vault.guid}
                            objectId={props.selectedObject.id}
                            classId={props.selectedObject.classId !== undefined ? props.selectedObject.classId : props.selectedObject.classID}
                          />
                          <span style={{ fontSize: '12px' }}>{props.selectedObject.title}.
                            <FileExtText
                              guid={props.vault.guid}
                              objectId={props.selectedObject.id}
                              classId={props.selectedObject.classId !== undefined ? props.selectedObject.classId : props.selectedObject.classID}
                            />
                          </span>

                        </>
                      ) : (
                        <>
                          <i className="fas fa-layer-group mx-2" style={{ fontSize: '15px', color: '#2757aa' }}></i>
                          <span style={{ fontSize: '12px' }}>{props.selectedObject.title}</span>

                        </>
                      )}
                    </span>
                    {props.comments.length > 0 && (
                      <Tooltip title='Comments'>
                        <div
                          style={{
                            position: 'relative',
                            display: 'inline-block'
                          }}
                          className='mx-3'
                        >
                          <span
                            className="fas fa-comment-alt mx-1 go-to-comments"
                            style={{
                              // color: '#2757aa',
                              fontSize: '20px',
                              cursor: 'pointer'
                            }}
                            onClick={navigateToComments}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              backgroundColor: '#e63946',
                              color: '#fff',
                              borderRadius: '50%',
                              padding: '2px 6px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              lineHeight: '1',
                              minWidth: '16px',
                              textAlign: 'center'
                            }}
                          >
                            {props.comments.length}
                          </span>
                        </div>
                      </Tooltip>
                    )}
                  </Box>


                </Box>



                <Box
                  className='shadow-lg shadow-sm p-2'
                  sx={{
                    width: '100%',
                    backgroundColor: '#e0fbfc',
                    fontSize: '12px',
                    height: '65vh',
                    overflowY: 'auto'
                  }}
                >


                  <List sx={{ p: 0 }}>
                    <>
                      <ListItem sx={{ p: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography
                            className='my-2'
                            variant="body2"
                            sx={{
                              color: '#1C4690',

                              flexBasis: '35%',
                              fontSize: '12px',
                              textAlign: 'end'
                            }}
                          >
                            Class:
                          </Typography>
                          <Box sx={{ flexBasis: '65%', fontSize: 'inherit', textAlign: 'start', ml: 1, mt: 1 }}>
                            <span>{getPropValue('Class')}</span>
                          </Box>
                        </Box>
                      </ListItem>
                      <Box sx={{ fontSize: '12px' }}> {/* Global font size */}
                        {filteredProps.map((item, index) => (
                          <ListItem key={index} sx={{ p: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <Typography
                                className='my-2'
                                variant="body2"
                                sx={{
                                  color: '#1C4690',

                                  flexBasis: '35%',
                                  fontSize: '12px',
                                  textAlign: 'end'
                                }}
                              >
                                {item.propName} {item.isRequired && <span className="text-danger"> *</span>} :
                              </Typography>
                              <Box sx={{ flexBasis: '65%', fontSize: 'inherit', textAlign: 'start', ml: 1 }}>
                                <>
                                  {item.isAutomatic || !item.userPermission.editPermission ?
                                    <>
                                      <Typography
                                        className='my-2'
                                        variant="body2"
                                        sx={{
                                          fontSize: '11px'
                                        }}

                                      >
                                        {item.value}
                                      </Typography>
                                    </> :
                                    <>
                                      {item.propName === 'Class' && <>{item.value}</>}

                                      {(item.datatype === 'MFDatatypeText' || item.datatype === 'MFDatatypeFloating' || item.datatype === 'MFDatatypeInteger') && !item.isHidden && (
                                        <input
                                          value={props.formValues?.[item.id]?.value || ''}
                                          placeholder={item.value}
                                          onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                          className='form-control form-control-sm my-1'
                                          disabled={item.isAutomatic}
                                          style={{ fontSize: 'inherit' }}
                                        />
                                      )}

                                      {item.datatype === "MFDatatypeMultiLineText" && !item.isHidden && (
                                        <textarea
                                          placeholder={item.value}
                                          value={props.formValues?.[item.id]?.value || ''}
                                          onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                          rows={2}
                                          className="form-control form-control-sm my-1"
                                          disabled={item.isAutomatic}
                                          style={{ fontSize: 'inherit' }}
                                        />
                                      )}

                                      {item.datatype === 'MFDatatypeDate' && !item.isHidden && (
                                        <input
                                          placeholder={item.value}
                                          type="date"
                                          value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                                          onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                          className='form-control form-control-sm my-1'
                                          disabled={item.isAutomatic}
                                          style={{ fontSize: 'inherit' }}
                                        />
                                      )}

                                      {item.datatype === 'MFDatatypeTimestamp' && !item.isHidden && (
                                        <div className="cs-form">
                                          <input
                                            type="time"
                                            className="form-control"
                                            value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                                            onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                            disabled={item.isAutomatic}
                                            style={{ fontSize: 'inherit' }}
                                          />
                                        </div>
                                      )}

                                      {item.datatype === 'MFDatatypeBoolean' && !item.isHidden && (
                                        <Select
                                          size='small'
                                          value={props.formValues?.[item.id]?.value ?? (item.value === "Yes" ? true : (item.value === "No" ? false : ''))}
                                          onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                          displayEmpty
                                          fullWidth
                                          disabled={item.isAutomatic}
                                          sx={{
                                            fontSize: 'inherit',
                                            padding: '4px',
                                            backgroundColor: 'white',
                                            marginY: '8px'
                                          }}
                                          className='form-control form-control-sm'
                                        >
                                          <MenuItem value=""><em>None</em></MenuItem>
                                          <MenuItem value={true}>Yes</MenuItem>
                                          <MenuItem value={false}>No</MenuItem>
                                        </Select>
                                      )}

                                      {item.datatype === 'MFDatatypeMultiSelectLookup' && !item.isHidden && (
                                        <LookupMultiSelect
                                          propId={item.id}
                                          onChange={(id, newValues) => handleInputChange(id, newValues, item.datatype)}
                                          value={props.formValues?.[item.id]?.value || []}
                                          selectedVault={props.vault}
                                          label={item.propName}
                                          itemValue={item.value}
                                          disabled={item.isAutomatic}
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
                                          disabled={item.isAutomatic}
                                        />
                                      )}
                                    </>}
                                </>


                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </Box>


                      {props.selectedObject.objectID === 0 && props.extension === 'pdf' && (
                        <ListItem sx={{ p: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography
                              className='my-3'
                              variant="body2"
                              sx={{
                                color: '#1C4690',

                                flexBasis: '35%',
                                fontSize: '12px',
                                textAlign: 'end'
                              }}
                            >
                              Sign:
                            </Typography>
                            <Box sx={{ flexBasis: '65%', fontSize: 'inherit', textAlign: 'start', ml: 1, mt: 2 }}>
                              <SignButton
                                objectid={props.selectedObject.id}
                                fileId={props.selectedFileId}
                                vault={props.vault.guid}
                                email={props.email}
                              />

                            </Box>
                          </Box>
                        </ListItem>
                      )}
                    </>

                  </List>


                </Box>


                <Box className="bg-white shadow-sm my-1 p-2" display="flex" justifyContent="space-between">
                  {/* Left Section */}
                  <Box
                    sx={{ textAlign: 'start', fontSize: '11px', width: '60%' }}
                    className="p-2"
                  >
                    {props.selectedObkjWf ? (
                      <>
                        <p className="my-1">
                          <i className="fas fa-circle-notch bold text-danger mx-2" />
                          <span>
                            <small style={{ color: '#2757aa', fontWeight: 'bold' }}>Workflow</small>:{" "}
                            {props.selectedObkjWf.workflowTitle}
                          </span>
                        </p>
                        <p className="my-1">
                          <i className="fas fa-square-full bold text-warning mx-2" />
                          <span>
                            <small style={{ color: '#2757aa', fontWeight: 'bold' }}>State</small>:{" "}
                            {props.currentState.stateTitle}
                          </span>
                          {props.selectedObkjWf.nextStates && (
                            <Select
                              value={props.selectedState.title}
                              onChange={handleStateChange}
                              size="small"
                              sx={{ fontSize: '12px', height: '20px', marginLeft: '0.5rem' }}
                            >
                              {props.selectedObkjWf.nextStates.map((state) => (
                                <MenuItem key={state.id} value={state.title}>
                                  <i className="mx-1 fas fa-long-arrow-alt-right text-primary" />
                                  {state.title}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="my-0">
                          <span className="mx-2">---</span>
                        </p>
                        <p className="my-0">
                          <span className="mx-2">---</span>
                        </p>
                      </>
                    )}
                  </Box>

                  {/* Right Section */}
                  <Box
                    sx={{ textAlign: 'end', fontSize: '10px', width: '40%' }}
                    className="p-2"
                  >
                    {["Created", "Last modified"].map((label, index) => (
                      <p className="my-0" key={label}>
                        {label}: {getPropValue(label)} {getPropValue(`${label} by`)}
                      </p>
                    ))}
                  </Box>
                </Box>
                <Box
                  className='input-group  bg-white p-2'
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    fontSize: '10px',

                  }}
                >
                  {(Object.keys(props.formValues || {}).length > 0 || props.selectedState.title) && (
                    <>
                      <Box>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => props.updateObjectMetadata()}
                          sx={{ textTransform: 'none', mr: 1 }}
                        >

                          <i
                            className="fas fa-save"
                            style={{
                              fontSize: '11px',
                              cursor: 'pointer',
                              marginRight: '4px'
                            }}
                          />
                          <small>Save</small>
                        </Button>


                      </Box>

                      <Box>
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          onClick={() => props.discardChange()}
                          sx={{ textTransform: 'none', mr: 1 }}
                        >
                          <i
                            className="fas fa-window-close"
                            style={{
                              fontSize: '11px',
                              cursor: 'pointer',
                              marginRight: '4px'
                            }}
                          />
                          <small>Discard</small>
                        </Button>
                      </Box>
                    </>
                  )}

                  {props.selectedObject.objectID === 0 && props.extension === 'pdf' && (
                    <Box className='mx-1'>
                      {/* <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={downloadFile}
                          sx={{ textTransform: 'none', ml: 1 }}
                        > */}

                      <Tooltip title='Download document'>
                        <i
                          className="fas fa-download "
                          onClick={downloadFile}
                          style={{
                            fontSize: '20px',
                            cursor: 'pointer',
                            marginRight: '4px',
                            // color: '#2757aa',


                          }}
                        />

                        <small>Download</small>
                      </Tooltip>
                      {/* </Button> */}



                    </Box>
                  )}

                  {props.selectedObject.userPermission.deletePermission ?
                    <Box className='mx-2'>
                      <Tooltip title='Delect Object'>
                        <i
                          onClick={() => setDeleteDialogOpen(true)}
                          className="fas fa-trash "
                          style={{
                            fontSize: '20px',
                            cursor: 'pointer',
                            marginRight: '4px',
                            // color: '#2757aa',

                          }}
                        />
                        <small>Delete</small>
                      </Tooltip>
                    </Box>
                    : <></>}


                </Box>

              </Box>
            )}
          </CustomTabPanel>

          <CustomTabPanel
            value={value}
            index={1}
            style={{
              backgroundColor: '#dedddd',

              padding: '0%',

              width: '100%'
            }}
          >
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
                sx={{
                  width: '100%',
                  marginTop: '20%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto'
                }}
              >
                <i
                  className="fas fa-tv my-2"
                  style={{ fontSize: '120px', color: '#2757aa' }}
                />

                {props.loadingfile ? (
                  <>
                    <Box sx={{ width: '50%' }} className="my-2">
                      <LinearProgress />
                    </Box>
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Loading file...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontSize: '12px' }}
                    >
                      Please wait as we load the document
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Nothing to Preview
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontSize: '12px' }}
                    >
                      Please select a document to view its content
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </CustomTabPanel>

          <CustomTabPanel
            value={value}
            index={2}
            style={{
              backgroundColor: '#dedddd',

              padding: '0%',
              width: '100%'
            }}
          >
            {props.base64 && props.extension === 'pdf' ? (
              <Bot base64={props.base64} objectTitle={props.selectedObject.title} />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  marginTop: '20%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto'
                }}
              >
                <i
                  className="fas fa-robot my-2"
                  style={{ fontSize: '120px', color: '#2757aa' }}
                />

                {props.loadingfile ? (
                  <>
                    <Box sx={{ width: '50%' }} className="my-2">
                      <LinearProgress />
                    </Box>
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Starting chat...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontSize: '12px' }}
                    >
                      Please wait as we load the resources
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      No PDF Selected
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontSize: '12px' }}
                    >
                      Please select a PDF to interact with the chatbot
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </CustomTabPanel>

          <CustomTabPanel
            value={value}
            index={3}
            style={{
              backgroundColor: '#dedddd',

              padding: '0%',
              width: '100%'
            }}
          >
            <CommentsCompoenent
              selectedObject={props.selectedObject}
              guid={props.vault ? props.vault.guid : ""}
              loadingcomments={props.loadingcomments}
              user={props.user}
              comments={props.comments}
              getObjectComments={props.getObjectComments}
            />
          </CustomTabPanel>
        </Box>
      </Box>
    </>
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
