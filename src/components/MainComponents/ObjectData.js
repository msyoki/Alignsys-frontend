import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DynamicFileViewer from '../DynamicFileViewer';
import SignButton from '../SignDocument';
import axios from 'axios';
import * as constants from '../Auth/configs';
import LookupMultiSelect from '../UpdateObjectLookupMultiSelect';
import LookupSelect from '../UpdateObjectLookup';
import LinearProgress from '@mui/material/LinearProgress';
import { Tabs, Tab, Box, List, ListItem, Typography, Select, MenuItem, Button, Checkbox, FormControlLabel, FormGroup, FormControl } from '@mui/material';
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
import UpdateCheckboxUserList from '../UpdateCheckboxUserList';
import CircularProgress from '@mui/material/CircularProgress';

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
        <Box sx={{ height: '100%', overflowY: 'auto', backgroundColor: '#ecf4fc' }}>
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


  const [value, setValue] = useSessionState('ss_viewTabIndex_ObjData', 0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMsg, setAlertMsg] = useState('');



  const [nextState, setNextStates] = useState([])


  const handleWFChangeEmpty = (event) => {
    const selected = props.workflows.find((wf) => wf.workflowId === event.target.value);
    props.setNewWF(selected);

  };

  const handleStateChangeNew = (event) => {
    const selected = props.newWF.states.find((state) => state.stateId === event.target.value);
    props.setNewWFState(selected);

  };


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

        // console.log(error);
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

  const downloadBase64File = (base64, ext, fileName) => {
    try {
      // Convert Base64 to raw binary data
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Determine the MIME type from the extension
      const mimeTypes = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        txt: "text/plain",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        csv: "text/csv"
      };

      const mimeType = mimeTypes[ext.toLowerCase()] || "application/octet-stream"; // Default if unknown

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: mimeType });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.${ext}`);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
      alert("Failed to download the file. Please try again.");
    }
  };


  const filteredProps = props.previewObjectProps.filter(item =>
    ![
      'Last modified by',
      'Last modified',
      'Created',
      'Created by',
      'Accessed by me',
      'Class',
      'State',
      'Workflow',
      'Marked as rejected by'
    ].includes(item.propName) &&
    !(item.propName === 'Marked as complete by' && (!item.value || item.value.length === 0)) &&
    !(item.propName === 'Assigned to' && (!item.value || item.value.length === 0))
  );




  // const getPropValue = name => {
  //   console.log(props.previewObjectProps)
  //   const foundItem = props.previewObjectProps.find(item => item.propName === name);
  //   console.log(foundItem.value)
  //   return foundItem ? foundItem.value : null;
  // };
  const getPropValue = (name) => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);

    if (!foundItem) return null;

    const { value, datatype } = foundItem;

    // Handle Lookup or MultiSelectLookup fields (array of objects)
    if (Array.isArray(value)) {
      if (value.length === 0) return `Please Select ${name} ...`;
      if (value.length === 1) return value[0].title;
      return value.map(v => v.title).join(', '); // for multiselects
    }

    // For other datatypes (string, number, boolean, etc.)
    return value;
  };

  const getClassId = (name) => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);

    if (!foundItem) return null;

    const { value, datatype } = foundItem;

    return value.map(v => v.id).join(', '); // for multiselects

  };



  const trimTitle = (title) => {
    const maxLength = 65; // Set your desired max length
    // if (title.length > maxLength) {
    //   return title.substring(0, maxLength) + '...';

    // }
    return title;
  };



  const setAssignmentPayload = (item, i) => {
    const id = i.id;

    if (id !== props.mfilesId) {
      setOpenAlert(true);
      setAlertSeverity("error");
      setAlertMsg(`You can't complete assigment for ${i.title}`);
      setDeleteDialogOpen(false)
    } else {
      // Toggle checked state
      props.setCheckedItems(prev => ({
        ...prev,
        [id]: !prev[id],
      }));



      // Optionally update approval payload if needed
      const payload = {
        vaultGuid: props.vault.guid,
        objectId: props.selectedObject.id,
        classId: props.selectedObject.classID,
        userID: id,
        approve: !props.checkedItems[id], // the new value
      };

      props.setApprovalPayload(payload);
    }


  };




  const isLink = (value) => {
    try {
      new URL(value);
      return value.startsWith('http://') || value.startsWith('https://');
    } catch (err) {
      return false;
    }
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
            className="bg-white"
          >
            {["Metadata", "Preview", "AI Chatbot"].map((label, index) => (
              <Tab
                key={index}
                style={{ textTransform: "none" }}
                sx={{
                  width: "auto",
                  height: "56px",
                  minWidth: "100px", // Ensures all tabs have a minimum width
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                label={label}
                {...a11yProps(index)}
              />
            ))}

            <Tab
              style={{ textTransform: "none" }}
              sx={{
                width: "auto",
                height: "56px",
                minWidth: "100px", // Matches other tabs
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Comments
                  {props.comments.length > 0 && (
                    <Tooltip title="Comments">
                      <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <i
                          className="fas fa-comment-alt"
                          style={{ fontSize: "18px", cursor: "pointer" }}
                          onClick={navigateToComments}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            backgroundColor: "#e63946",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "2px 6px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            lineHeight: "1",
                            minWidth: "16px",
                            textAlign: "center",
                          }}
                        >
                          {props.comments.length}
                        </Box>
                      </Box>
                    </Tooltip>
                  )}
                </Box>
              }
              {...a11yProps(3)}
            />
          </Tabs>

        </Box>

        <Box sx={{ flexGrow: 1, margin: 0, color: 'black' }} >
          <CustomTabPanel
            value={value}
            index={0}
            style={{
              backgroundColor: '#fff',

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
                    {/* <Box sx={{ width: '50%' }} className="my-2">
                      <LinearProgress />
                    </Box> */}
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
                  sx={{ textAlign: 'center', fontSize: '13px' }}
                >
                  Please select an object to view its metadata
                </Typography>
              </Box>
            )}

            {props.previewObjectProps.length > 0 && (
              <Box>
                <Box display="flex" flexDirection="column" sx={{ backgroundColor: '#ecf4fc', padding: '4px' }}>

                  {/* Flex container for Left and Right sections */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">

                    {/* Left Section (Icon + Title) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '80%' }} className="mx-2">
                      <Tooltip title={props.selectedObject?.title}>
                        <Box display="flex" alignItems="center" sx={{ color: '#1d3557', padding: '4px' }}>
                          {props.selectedObject &&
                            (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) ? (
                            <>
                              <FileExtIcon
                                fontSize="25px"
                                guid={props.vault.guid}
                                objectId={props.selectedObject.id}
                                classId={props.selectedObject.classId ?? props.selectedObject.classID}
                                sx={{ fontSize: '25px !important', marginRight: '10px' }}
                              />
                              <span style={{ fontSize: '13px', marginLeft: '8px' }}>
                                {trimTitle(props.selectedObject.title)}
                                <FileExtText
                                  guid={props.vault.guid}
                                  objectId={props.selectedObject.id}
                                  classId={props.selectedObject.classId ?? props.selectedObject.classID}
                                />
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-folder" style={{ fontSize: '25px', color: '#2757aa', marginRight: '10px' }}></i>
                              <span style={{ fontSize: '13px' }}>{trimTitle(props.selectedObject.title)}</span>
                            </>
                          )}
                        </Box>
                      </Tooltip>
                    </Box>

                    {/* Right Section (Actions) */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '20%' }} >
                      {props.selectedObject && (props.selectedObject.objectID ?? props.selectedObject.objectTypeId) === 0 && (
                        <Tooltip title="Download document">
                          <i
                            className="fas fa-download mx-3"
                            onClick={() => downloadBase64File(props.base64, props.extension, props.selectedObject.title)}
                            style={{ fontSize: '20px', cursor: 'pointer', color: "#2757aa" }}
                          />
                        </Tooltip>
                      )}

                      {props.selectedObject?.userPermission?.deletePermission && (
                        <Tooltip title="Delete Object">
                          <i
                            className="fas fa-trash mx-3"
                            onClick={() => setDeleteDialogOpen(true)}
                            style={{ fontSize: '20px', cursor: 'pointer', color: "#2757aa" }}
                          />
                        </Tooltip>
                      )}
                    </Box>

                  </Box>
                </Box>


                <Box className="p-2" display="flex" justifyContent="space-between" sx={{ backgroundColor: '#ecf4fc' }}>
                  {/* Left Section */}
                  <Box sx={{ textAlign: 'start', fontSize: '13px', maxWidth: '30%' }} className="mx-2">
                    <Box sx={{ fontSize: '12px', color: '#555' }}>
                      {props.selectedObject.objectTypeName || getPropValue('Class')}
                    </Box>

                    <Box
                      className="input-group"
                      sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#555',
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      ID: {props.selectedObject.id} &nbsp;&nbsp; Version: {props.selectedObject.versionId}
                    </Box>
                  </Box>

                  {/* Right Section */}
                  <Box sx={{ textAlign: 'end', fontSize: '12px', maxWidth: '80%', color: '#555' }} className="mx-2">
                    {["Created", "Last modified"].map((label) => (
                      <Box key={label}>
                        {label}: {getPropValue(label)} {getPropValue(`${label} by`)}
                      </Box>
                    ))}
                  </Box>
                </Box>






                <Box

                  sx={{
                    backgroundColor: '#fff',
                    fontSize: '13px',


                  }}



                >


                  <List

                    sx={{
                      p: 1,
                      height: '55vh',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center', // Center the inner content
                    }}
                  // className='shadow-lg'
                  >
                    {/* Class Field */}
                    <ListItem sx={{ p: 0, width: '100%', marginTop: '3%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{

                            flexBasis: '35%',
                            fontSize: '13px',
                            textAlign: 'end',
                          }}
                          className='text-dark'

                        >
                          Class:
                        </Typography>
                        <Box
                          sx={{
                            flexBasis: '65%',
                            fontSize: '13px',
                            textAlign: 'start',
                            ml: 1,


                          }}
                          className='text-dark'
                        >
                          <span>
                            {props.selectedObject.classTypeName || getPropValue('Class')}

                          </span>
                        </Box>
                      </Box>
                    </ListItem>

                    {/* Properties */}
                    <Box sx={{ fontSize: '13px', width: '100%' }}>
                      {filteredProps.map((item, index) => (
                        <ListItem key={index} sx={{ p: 0 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              alignItems: 'center',
                            }}
                          >
                            {/* Label */}
                            <Typography
                              variant="body2"
                              sx={{

                                flexBasis: '35%',
                                fontSize: '13px',
                                textAlign: 'end',
                              }}
                              className='text-dark'

                            >
                              {item.propName}
                              {item.isRequired && (
                                <span className="text-danger"> *</span>
                              )}
                              :
                            </Typography>

                            {/* Value / Input */}
                            <Box
                              sx={{
                                flexBasis: '65%',
                                fontSize: '13px',
                                textAlign: 'start',
                                ml: 1,
                                color: 'black'

                              }}

                            >
                              {item.isAutomatic || !item.userPermission?.editPermission ? (
                                <Typography variant="body2" sx={{ fontSize: '13px', my: 1 }}>
                                  <>
                                    {isLink(item.value) ? (
                                      <a href={item.value} target="_blank" rel="noopener noreferrer">
                                        {item.value}
                                      </a>
                                    ) : (
                                      <>{item.value}</>
                                    )}</>
                                </Typography>


                              ) : (
                                <>
                                  {item.propName === 'Class' && (
                                    <span style={{ fontSize: '13px' }}>
                                      {item.value}
                                    </span>
                                  )}

                                  {/* Text Input */}
                                  {['MFDatatypeText', 'MFDatatypeFloating', 'MFDatatypeInteger'].includes(item.datatype) &&
                                    !item.isHidden && (
                                      <>
                                        {isLink(item.value) ? (
                                          <Typography variant="body2" sx={{ fontSize: '13px', my: 1 }}>
                                            <a href={item.value} target="_blank" rel="noopener noreferrer">
                                              {item.value}
                                            </a>
                                          </Typography>
                                        ) : (
                                          <input
                                            value={props.formValues?.[item.id]?.value || ''}
                                            placeholder={item.value}
                                            onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                            className="form-control form-control-sm form-control-black my-1"
                                            disabled={item.isAutomatic}
                                            style={{ fontSize: '13px', color: 'black' }}
                                          />
                                        )}
                                      </>


                                    )}

                                  {/* Textarea */}
                                  {item.datatype === 'MFDatatypeMultiLineText' && !item.isHidden && (
                                    <textarea
                                      placeholder={item.value}
                                      value={props.formValues?.[item.id]?.value || ''}
                                      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                      rows={10}
                                      className="form-control form-control-sm form-control-black my-1"
                                      disabled={item.isAutomatic}
                                      style={{ fontSize: '13px', color: 'black' }}
                                    />
                                  )}

                                  {/* Date Picker */}
                                  {item.datatype === 'MFDatatypeDate' && !item.isHidden && (
                                    <input
                                      type="date"
                                      placeholder={item.value}
                                      value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                                      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                      className="form-control form-control-sm form-control-black my-1"
                                      disabled={item.isAutomatic}
                                      style={{ fontSize: '13px' }}
                                    />
                                  )}

                                  {/* Timestamp */}
                                  {item.datatype === 'MFDatatypeTimestamp' && !item.isHidden && (
                                    <input
                                      type="time"
                                      className="form-control form-control-sm my-1"
                                      value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                                      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                      disabled={item.isAutomatic}
                                      style={{ fontSize: '13px' }}
                                    />
                                  )}

                                  {/* Boolean Dropdown */}
                                  {item.datatype === 'MFDatatypeBoolean' && !item.isHidden && (
                                    <Select
                                      size="small"
                                      value={
                                        props.formValues?.[item.id]?.value ??
                                        (item.value === 'Yes' ? true : item.value === 'No' ? false : '')
                                      }
                                      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                      displayEmpty
                                      fullWidth
                                      disabled={item.isAutomatic}
                                      className="form-control form-control-sm"
                                      sx={{
                                        backgroundColor: 'white',
                                        my: 1,
                                        fontSize: '13px',
                                        '& .MuiSelect-select': {
                                          fontSize: '13px',
                                          color: 'black',
                                          padding: '6px 10px',
                                          minHeight: 'unset',
                                        },
                                        '& .MuiInputBase-root': {
                                          minHeight: '32px',
                                        },
                                        '& .MuiOutlinedInput-input': {
                                          padding: '6px 10px',
                                          fontSize: '13px',
                                        },
                                        '& .MuiMenuItem-root': {
                                          fontSize: '13px',
                                          color: 'black',
                                        },
                                      }}
                                    >
                                      <MenuItem value=""><em>None</em></MenuItem>
                                      <MenuItem value={true}>Yes</MenuItem>
                                      <MenuItem value={false}>No</MenuItem>
                                    </Select>
                                  )}

                                  {/* Multi Select Lookup */}
                                  {item.datatype === 'MFDatatypeMultiSelectLookup' && !item.isHidden && (
                                    <>

                                      {(
                                        (props.selectedObject.objectID === 10 && item.propName === 'Assigned to') ||
                                        (props.selectedObject.objectTypeId === 10 && item.propName === 'Assigned to')
                                      ) ? (
                                        <>
                                          {item.value?.map((i, index) => (
                                            <FormGroup key={index}>
                                              <FormControlLabel
                                                control={
                                                  <Tooltip title={`Mark as complete for ${i.title}`} placement="left">
                                                    <Checkbox
                                                      checked={props.checkedItems[i.id] || false}
                                                      onChange={() => setAssignmentPayload(item, i)}
                                                      sx={{ p: 0.5 }}
                                                    />
                                                  </Tooltip>
                                                }
                                                label={
                                                  <span style={{ fontSize: '13px' }}>
                                                    {i.title?.value || i.title}
                                                  </span>
                                                }
                                                labelPlacement="end"
                                                sx={{ alignItems: 'center', ml: 0.5 }}
                                              />
                                            </FormGroup>
                                          ))}


                                        </>
                                      ) : item.propName === 'Marked as complete by' ? (
                                        <Typography fontSize="13px" className='my-2'>
                                          {(item.value || [])
                                            .map(i => i.title?.value || i.title)
                                            .filter(Boolean)
                                            .join('; ')}
                                        </Typography>
                                      ) : (
                                        <>
                                          <LookupMultiSelect
                                            propId={item.id}
                                            label={item.propName}
                                            value={props.formValues?.[item.id]?.value || []}
                                            onChange={(id, newValues) => handleInputChange(id, newValues, item.datatype)}
                                            selectedVault={props.vault}
                                            itemValue={item.value}
                                            disabled={item.isAutomatic}
                                            mfilesid={props.mfilesId}
                                          />

                                        </>
                                      )}
                                    </>
                                  )}




                                  {/* Single Lookup */}
                                  {item.datatype === 'MFDatatypeLookup' && item.propName !== 'Class' && (
                                    <LookupSelect
                                      propId={item.id}
                                      label={item.propName}
                                      value={props.formValues?.[item.id]?.value || ''}
                                      onChange={(id, newValue) => handleInputChange(id, newValue, item.datatype)}
                                      selectedVault={props.vault}
                                      itemValue={item.value}
                                      disabled={item.isAutomatic}
                                      mfilesid={props.mfilesId}
                                    />
                                  )}
                                </>
                              )}
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </Box>
                  </List>



                </Box>

                <Box className="my-2"
                  sx={{
                    height: 'auto',
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',       // Stack columns on extra-small screens
                      sm: '1fr auto',  // Side by side from small screens upwards
                    },
                    alignItems: 'center',
                    p: 2,
                    gap: 2,
                    backgroundColor: '#ecf4fc',
                  }}>
                  {/* LEFT COLUMN: Workflows and State */}
                  <Box
                    sx={{
                      fontSize: '13px',
                      '*': {
                        fontSize: '13px !important',
                      },
                    }}
                  >
                    {!props.loadingWFS ?
                      <>
                        {(props.workflows?.length > 0 || props.selectedObkjWf) && (
                          <>
                            {props.selectedObkjWf ? (
                              <>
                                <p className="my-1">
                                  <i className="fa-solid fa-arrows-spin mx-1" style={{ color: '#2757aa' }} />

                                  <span style={{ color: 'black', fontSize: '13px' }}>Workflow</span>:{" "}
                                  <span style={{ marginLeft: '0.5rem' }}>
                                    {props.selectedObkjWf.workflowTitle}
                                  </span>
                                </p>
                                <p className="my-1">
                                  <i className="fas fa-square-full text-warning mx-1" />
                                  <span style={{ color: 'black', fontSize: '13px' }}>State</span>:{" "}
                                  <span style={{ marginLeft: '2rem' }}>{props.currentState.title}</span>

                                  {Array.isArray(props.selectedObkjWf?.nextStates) && props.selectedObkjWf.nextStates.length > 0 && (
                                    <Select
                                      value={props.selectedState.title}
                                      onChange={handleStateChange}
                                      size="small"
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected) {
                                          return <span style={{ color: '#aaa' }}>transition</span>;
                                        }
                                        const wf = props.selectedObkjWf.nextStates.find(w => w.workflowId === selected);
                                        return wf?.workflowName || '';
                                      }}
                                      sx={{
                                        fontSize: '13px !important',
                                        height: '24px',
                                        marginLeft: '0.5rem',
                                        '.MuiSelect-select': {
                                          fontSize: '13px !important',
                                        },
                                      }}
                                    >
                                      <MenuItem disabled value="">
                                        <em>transition to ...</em>
                                      </MenuItem>
                                      {props.selectedObkjWf.nextStates.map((state) => (
                                        <MenuItem
                                          key={state.id}
                                          value={state.title}
                                          sx={{ fontSize: '13px !important' }}
                                        >
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

                                {props.workflows?.length > 0 && (
                                  <p className="my-1">
                                    <i className="fa-solid fa-arrows-spin mx-1" style={{ color: '#2757aa' }} />
                                    <span style={{ color: 'black', fontSize: '13px' }}>Workflow</span>:{" "}
                                    <Select
                                      value={props.newWF?.workflowId || ''}
                                      onChange={handleWFChangeEmpty}
                                      size="small"
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected) {
                                          return <span style={{ color: '#aaa' }}>Select workflow</span>;
                                        }
                                        const wf = props.workflows.find(w => w.workflowId === selected);
                                        return wf?.workflowName || '';
                                      }}
                                      sx={{
                                        fontSize: '13px !important',
                                        height: '24px',
                                        marginLeft: '0.5rem',
                                        '.MuiSelect-select': {
                                          fontSize: '13px !important',
                                        },
                                      }}
                                    >
                                      <MenuItem disabled value="">
                                        <em>Select workflow</em>
                                      </MenuItem>
                                      {props.workflows.map((wf) => (
                                        <MenuItem
                                          key={wf.workflowId}
                                          value={wf.workflowId}
                                          sx={{ fontSize: '13px !important' }}
                                        >
                                          {wf.workflowName}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </p>
                                )}
                                {props.newWF && (
                                  <p className="my-1">
                                    <i className="fas fa-square-full text-warning mx-1" />
                                    <span style={{ color: 'black', fontSize: '13px' }}>State</span>:{" "}
                                    <Select
                                      value={props.newWFState?.stateId || ''}
                                      onChange={handleStateChangeNew}
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected) {
                                          return <span style={{ color: '#aaa' }}>Select state</span>;
                                        }
                                        const state = props.newWF.states.find(s => s.stateId === selected);
                                        return state?.stateName || '';
                                      }}
                                      size="small"
                                      sx={{
                                        fontSize: '13px !important',
                                        height: '24px',
                                        marginLeft: '2rem',
                                        '.MuiSelect-select': {
                                          fontSize: '13px !important',
                                        },
                                      }}
                                    >
                                      <MenuItem disabled value="">
                                        <em>Select state</em>
                                      </MenuItem>
                                      {props.newWF.states.map((state) => (
                                        <MenuItem
                                          key={state.stateId}
                                          value={state.stateId}
                                          sx={{ fontSize: '13px !important' }}
                                        >
                                          <i className="mx-1 fas fa-long-arrow-alt-right text-primary" />
                                          {state.stateName}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </p>
                                )}


                              </>
                            )}
                          </>
                        )}
                      </> : <>
                        <p className="my-1">
                          <i className="fa-solid fa-arrows-spin mx-1" style={{ color: '#2757aa' }} />

                          <span style={{ color: 'black', fontSize: '13px' }}>Workflow</span>:{" "}
                          <span className='text-muted' style={{ marginLeft: '0.5rem' }}>
                            <CircularProgress size="10px" style={{ color: "#2757aa" }} />
                          </span>
                        </p>
                      </>}
                  </Box>

                  {/* RIGHT COLUMN: Buttons */}
                  {(
                    Object.keys(props.formValues || {}).length > 0 ||
                    props.selectedState?.title ||
                    props.newWF ||
                    (props.approvalPayload && Object.keys(props.approvalPayload).length > 0)
                  ) && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          className=' rounded-pill'
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={() => props.updateObjectMetadata()}
                          sx={{ textTransform: 'none' }}
                        >
                          <i className="fas fa-save " style={{ fontSize: '13px', marginRight: '4px' }} />
                          <small>Save</small>
                        </Button>
                        <Button
                          className=' rounded-pill'
                          size="medium"
                          variant="contained"
                          color="warning"
                          onClick={() => { props.discardChange(); props.setCheckedItems({}) }}
                          sx={{ textTransform: 'none' }}
                        >
                          <i className="fas fa-window-close" style={{ fontSize: '13px', marginRight: '4px' }} />
                          <small>Discard</small>
                        </Button>
                      </Box>
                    )}
                </Box>





              </Box>
            )}
          </CustomTabPanel>

          <CustomTabPanel
            value={value}
            index={1}
            style={{
              backgroundColor: '#fff',

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
                fileName={props.selectedObject.title}
                selectedObject={props.selectedObject}
                windowWidth={props.windowWidth}
                mfilesId={props.mfilesId}

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
                    {/* <Box sx={{ width: '50%' }} className="my-2">
                      <LinearProgress />
                    </Box> */}
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Loading file...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontSize: '13px' }}
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
                      sx={{ textAlign: 'center', fontSize: '13px' }}
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
              backgroundColor: '#fff',

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
                  className="fa-brands fa-android my-2"
                  style={{ fontSize: '120px', color: '#2757aa' }}
                />

                {props.loadingfile ? (
                  <>
                    {/* <Box sx={{ width: '50%' }} className="my-2">
                      <LinearProgress />
                    </Box> */}
                    <Typography
                      variant="body2"
                      className='my-2'
                      sx={{ textAlign: 'center' }}
                    >
                      Starting chat...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'center', fontSize: '13px' }}
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
                      sx={{ textAlign: 'center', fontSize: '13px' }}
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
              backgroundColor: '#fff',

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
              mfilesID={props.mfilesId}
              docTitle={props.selectedObject.title}

            />



          </CustomTabPanel>
        </Box >
      </Box >
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
