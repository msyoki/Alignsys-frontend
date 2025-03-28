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
        <Box sx={{ height: '100vh', overflowY: 'auto', backgroundColor: '#fff' }}>
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


  const filteredProps = props.previewObjectProps.filter(
    item => !['Last modified by', 'Last modified', 'Created', 'Created by', 'Accessed by me', 'Class', 'State', 'Workflow'].includes(item.propName)
  );


  const getPropValue = name => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);
    return foundItem ? foundItem.value : null;
  };

  const trimTitle = (title) => {
    const maxLength = 65; // Set your desired max length
    // if (title.length > maxLength) {
    //   return title.substring(0, maxLength) + '...';

    // }
    return title;
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
                <Box className="p-1" display="flex" flexDirection="column" sx={{ backgroundColor: '#ecf4fc', padding: '8px' }}>
                  <Box
                    className="input-group"
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between', // Pushes title and icons apart
                      fontSize: '12px !important',
                      padding: '2px 4px',
                    }}
                  >

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
                            <span style={{ fontSize: '15px', marginLeft: '8px' }}>
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
                            <span style={{ fontSize: '15px' }}>{trimTitle(props.selectedObject.title)}</span>
                          </>
                        )}
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>



                <Box className="p-1" display="flex" justifyContent="space-between" sx={{ backgroundColor: '#ecf4fc' }}>
                  {/* Left Section */}
                  <Box
                    sx={{ textAlign: 'start', fontSize: '13px', width: '60%' }}
                    className=""
                  >

                    <p className="my-0" >
                      {props.selectedObject.objectTypeName || getPropValue('Class')}
                    </p>
                    <p className="my-0" >
                      ID: {props.selectedObject.id}   Version : {props.selectedObject.versionId}
                    </p>

                  </Box>

                  {/* Right Section */}
                  <Box
                    sx={{ textAlign: 'end', fontSize: '10px', width: '40%' }}
                    className=""
                  >
                    {["Created", "Last modified"].map((label, index) => (
                      <p className="my-0" key={label}>
                        {label}: {getPropValue(label)} {getPropValue(`${label} by`)}
                      </p>
                    ))}
                  </Box>
                </Box>
                <Box className="p-1 my-1" display="flex" flexDirection="column" sx={{ backgroundColor: '#ecf4fc', padding: '8px' }}>
                  <Box
                    className="input-group"
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between', // Pushes title and icons apart
                      fontSize: '12px !important',
                      padding: '6px 10px',
                    }}
                  >
                    {/* Left Section: File Icon & Title */}
                    <Box className="text-center" sx={{ color: '#1d3557', display: 'flex', alignItems: 'center' }} />

                    {/* Right Section: Buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', ml: 'auto' }}>
                      {/* Sign Button */}
                      {props.selectedObject.objectID === 0 && props.extension === 'pdf' && (
                        <SignButton
                          objectid={props.selectedObject.id}
                          fileId={props.selectedFileId}
                          vault={props.vault.guid}
                          email={props.email}
                          mfilesId={props.mfilesId}
                        />
                      )}

                      {/* Comment Button */}
                      {props.comments.length > 0 && (
                        <Tooltip title="Comments">
                          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <i
                              className="fas fa-comment-alt"
                              style={{ fontSize: '18px', cursor: 'pointer' }}
                              onClick={navigateToComments}
                            />
                            <Box
                              sx={{
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
                                textAlign: 'center',
                              }}
                            >
                              {props.comments.length}
                            </Box>
                          </Box>
                        </Tooltip>
                      )}

                      {/* Download Button */}
                      {props.selectedObject && (props.selectedObject.objectID ?? props.selectedObject.objectTypeId) === 0 && (
                        <Tooltip title="Download document">
                          <i
                            className="fas fa-download"
                            onClick={() => downloadBase64File(props.base64, props.extension, props.selectedObject.title)}
                            style={{ fontSize: '18px', cursor: 'pointer' }}
                          />
                        </Tooltip>
                      )}

                      {/* Delete Button */}
                      {props.selectedObject?.userPermission?.deletePermission && (
                        <Tooltip title="Delete Object">
                          <i
                            className="fas fa-trash"
                            onClick={() => setDeleteDialogOpen(true)}
                            style={{ fontSize: '18px', cursor: 'pointer' }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>




                <Box
                  className='shadow-lg'
                  sx={{

                    backgroundColor: '#fff',
                    fontSize: '12px',

                  }}
                >


                  <List sx={{
                    p: 3,
                    height: '50vh',
                    overflowY: 'auto'

                  }}>
                    <>
                      <ListItem sx={{ p: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography
                            className='my-2'
                            variant="body2"
                            sx={{
                              color: '#555',

                              flexBasis: '35%',
                              fontSize: '13px',
                              textAlign: 'end'
                            }}
                          >
                            Class:
                          </Typography>
                          <Box sx={{ flexBasis: '65%', fontSize: 'inherit', textAlign: 'start', ml: 1, mt: 1 }}>
                            {/* <span>{getPropValue('Class')}</span> */}
                            <span>  {props.selectedObject.classTypeName || getPropValue('Class')}</span>

                          </Box>
                        </Box>
                      </ListItem>
                      {/* <Box sx={{ fontSize: '12px' }}> 
                        {filteredProps.map((item, index) => (
                          <ListItem key={index} sx={{ p: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <Typography
                                className='my-2 '
                                variant="body2"
                                sx={{
                                  color: '#555',

                                  flexBasis: '35%',
                                  fontSize: '13px',
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
                      </Box> */}
                      <Box sx={{ fontSize: '12px' }}>
                        {filteredProps.map((item, index) => (
                          <ListItem key={index} sx={{ p: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>

                              {/* Label Section */}
                              <Typography
                                className="my-2"
                                variant="body2"
                                sx={{
                                  color: '#555',
                                  flexBasis: '35%',
                                  fontSize: '13px',
                                  textAlign: 'end',
                                }}
                              >
                                {item.propName} {item.isRequired && <span className="text-danger"> *</span>} :
                              </Typography>

                              {/* Value/Input Section */}
                              <Box sx={{ flexBasis: '65%', fontSize: 'inherit', textAlign: 'start', ml: 1 }}>
                                {item.isAutomatic || !item.userPermission?.editPermission ? (
                                  <Typography className="my-2" variant="body2" sx={{ fontSize: '11px' }}>
                                    {item.value}
                                  </Typography>
                                ) : (
                                  <>
                                    {item.propName === 'Class' && item.value}

                                    {/* Text Input */}
                                    {(item.datatype === 'MFDatatypeText' ||
                                      item.datatype === 'MFDatatypeFloating' ||
                                      item.datatype === 'MFDatatypeInteger') &&
                                      !item.isHidden && (
                                        <input
                                          value={props.formValues?.[item.id]?.value || ''}
                                          placeholder={item.value}
                                          onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                          className="form-control form-control-sm my-1"
                                          disabled={item.isAutomatic}
                                          style={{ fontSize: 'inherit' }}
                                        />
                                      )}

                                    {/* Multi-Line Textarea */}
                                    {item.datatype === 'MFDatatypeMultiLineText' && !item.isHidden && (
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

                                    {/* Date Picker */}
                                    {item.datatype === 'MFDatatypeDate' && !item.isHidden && (
                                      <input
                                        placeholder={item.value}
                                        type="date"
                                        value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                                        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                        className="form-control form-control-sm my-1"
                                        disabled={item.isAutomatic}
                                        style={{ fontSize: 'inherit' }}
                                      />
                                    )}

                                    {/* Timestamp Picker */}
                                    {item.datatype === 'MFDatatypeTimestamp' && !item.isHidden && (
                                      <input
                                        type="time"
                                        className="form-control"
                                        value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
                                        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                        disabled={item.isAutomatic}
                                        style={{ fontSize: 'inherit' }}
                                      />
                                    )}

                                    {/* Boolean Select Dropdown */}
                                    {item.datatype === 'MFDatatypeBoolean' && !item.isHidden && (
                                      <Select
                                        size="small"
                                        value={props.formValues?.[item.id]?.value ?? (item.value === "Yes" ? true : item.value === "No" ? false : '')}
                                        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                        displayEmpty
                                        fullWidth
                                        disabled={item.isAutomatic}
                                        sx={{
                                          fontSize: 'inherit',
                                          padding: '4px',
                                          backgroundColor: 'white',
                                          marginY: '8px',
                                        }}
                                        className="form-control form-control-sm"
                                      >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        <MenuItem value={true}>Yes</MenuItem>
                                        <MenuItem value={false}>No</MenuItem>
                                      </Select>
                                    )}

                                    {/* Multi-Select Lookup */}
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

                                    {/* Single Lookup Select */}
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
                                  </>
                                )}
                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </Box>




                     
                    </>



                  </List>


                </Box>
                <Box
                  className='input-group  p-2 bg-white'
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




                </Box>

                <Box className="bg-white  my-1 " >
                  {/* Left Section - Ensuring Vertical Alignment */}
                  <Box
                    sx={{

                      fontSize: '11px',

                    }}
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
                              sx={{
                                fontSize: '12px',
                                height: '20px',
                                marginLeft: '0.5rem',
                              }}
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
