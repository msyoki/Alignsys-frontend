import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import DynamicFileViewer from '../Viewer/DynamicFileViewer';
import SignButton from '../SignDocument';
import axios from 'axios';
import * as constants from '../Auth/configs';
import LookupMultiSelect from '../CustomFormTags/UpdateObjectLookupMultiSelect';
import LookupSelect from '../CustomFormTags/UpdateObjectLookup';
import LinearProgress from '@mui/material/LinearProgress';
import { Tabs, Tab, Box, List, ListItem, Typography, Select, MenuItem, Button, Checkbox, FormControlLabel, FormGroup ,CircularProgress} from '@mui/material';
import Bot from '../Bot/Bot';

import CommentsComponent from '../CommentsComponent';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';
import ConfirmDeleteObject from '../Modals/ConfirmDeleteObject';
import TimedAlert from '../TimedAlert';
import { Tooltip } from '@mui/material';
import BotLLM from '../Bot/BotLLM';
import { ResizableTextarea } from '../CustomFormTags/ResizableTextArea';

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
  if (!dateString) return '';
  const [month, day, year] = dateString.split('/').map(num => num.padStart(2, '0'));
  return `${year}-${month}-${day}`;
};

function useSessionState(key, defaultValue) {
  const getInitialValue = () => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === null || stored === 'undefined') {
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch {
      return defaultValue;
    }
  };
  const [value, setValue] = useState(getInitialValue);
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
    }
  }, [key, value]);
  return [value, setValue];
}

const ObjectData = (props) => {
  const [value, setValue] = useSessionState('ss_viewTabIndex_ObjData', 0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [messages, setMessages] = useState([]);

  // Common styles - extracted to avoid repetition
  const commonInputStyle = useMemo(() => ({
    fontSize: '13px',
    color: '#333',
    margin: 0,
  }), []);

  const getInputStyle = useCallback((isAutomatic) => ({
    ...commonInputStyle,
    backgroundColor: isAutomatic ? '#f5f5f5' : '#fff',
  }), [commonInputStyle]);

  const textareaStyle = useMemo(() => ({
    minHeight: '48px',
    height: 'auto',
    resize: 'none',
    overflow: 'hidden',
    lineHeight: '1.3',
  }), []);

  const selectSxStyle = useMemo(() => ({
    fontSize: '13px',
    height: '24px',
    m: 0,
    '& .MuiSelect-select': {
      fontSize: '13px',
      color: '#333',
      padding: '3px 6px',
      minHeight: 'unset',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiInputBase-root': {
      height: '24px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '3px 6px',
      fontSize: '13px',
    },
    '& .MuiMenuItem-root': {
      fontSize: '13px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#ccc',
    },
  }), []);

  const handleWFChangeEmpty = useCallback((event) => {
    const selected = props.workflows.find((wf) => wf.workflowId === event.target.value);
    props.setNewWF(selected);
  }, [props.workflows, props.setNewWF]);

  const handleStateChangeNew = useCallback((event) => {
    const selected = props.newWF.states.find((state) => state.stateId === event.target.value);
    props.setNewWFState(selected);
  }, [props.newWF, props.setNewWFState]);

  const deleteObject = useCallback(() => {
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
      .then(() => {
        props.setPreviewObjectProps([]);
        props.setSelectedObject({});
        props.resetViews();
        setOpenAlert(true);
        setAlertSeverity("success");
        setAlertMsg("Object was deleted successsfully");
        setDeleteDialogOpen(false);
      })
      .catch(() => {
        setOpenAlert(true);
        setAlertSeverity("error");
        setAlertMsg("Failed to delete, please try again later");
        setDeleteDialogOpen(false);
      });
  }, [props]);

  const navigateToComments = useCallback(() => setValue(3), [setValue]);

  const handleStateChange = useCallback((event) => {
    const selectedTitle = event.target.value;
    const selectedState = props.selectedObkjWf.nextStates.find(state => state.title === selectedTitle);
    if (props.selectedState) {
      props.setSelectedState(selectedState);
    }
  }, [props.selectedObkjWf, props.selectedState, props.setSelectedState]);

  const handleInputChange = useCallback((id, newValues, datatype) => {
    console.log(newValues)
    props.setFormValues(prevFormValues => {
      const newFormValues = { ...(prevFormValues || {}) };
      if (datatype === 'MFDatatypeMultiSelectLookup') {
        newFormValues[id] = { value: newValues, datatype };
      } else {
        newFormValues[id] = { value: newValues, datatype };
      }
      if (newValues.length === 0) {
        delete newFormValues[id];
      }
      return Object.keys(newFormValues).length === 0 ? null : newFormValues;
    });
  }, [props.setFormValues]);

 
  const handleDownload = (blob, ext, fileName) => {
    if (!blob) return;

    try {
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${ext}`;

      // Append to document, trigger click, then remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Free up memory
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const filteredProps = useMemo(() =>
    props.previewObjectProps.filter(item =>
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
    ), [props.previewObjectProps]
  );

  const getPropValue = useCallback((name) => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);
    if (!foundItem) return null;
    const { value } = foundItem;
    if (Array.isArray(value)) {
      if (value.length === 0) return `Please Select ${name} ...`;
      if (value.length === 1) return value[0].title;
      return value.map(v => v.title).join(', ');
    }
    return value;
  }, [props.previewObjectProps]);

  const trimTitle = useCallback((title) => {
    const maxLength = 65;
    return title;
  }, []);

  const setAssignmentPayload = useCallback((item, i) => {
    const id = i.id;
    if (id !== props.mfilesId) {
      setOpenAlert(true);
      setAlertSeverity("error");
      setAlertMsg(`You can't complete assigment for ${i.title}`);
      setDeleteDialogOpen(false);
    } else {
      props.setCheckedItems(prev => ({
        ...prev,
        [id]: !prev[id],
      }));
      const payload = {
        vaultGuid: props.vault.guid,
        objectId: props.selectedObject.id,
        classId: props.selectedObject.classID,
        userID: id,
        approve: !props.checkedItems[id],
      };
      props.setApprovalPayload(payload);
    }
  }, [props]);

  const isLink = useCallback((value) => {
    if (!value || typeof value !== 'string') return false;
    try {
      new URL(value);
      return value.startsWith('http://') || value.startsWith('https://');
    } catch {
      return false;
    }
  }, []);

  // Safe value renderer
  const renderValue = useCallback((value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }, []);

  // Optimized render functions for different input types
  const renderLinkOrText = useCallback((value, isReadOnly = false) => {
    if (isLink(value)) {
      return (
        <Typography variant="body2" sx={{ fontSize: '13px' }}>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            {renderValue(value)}
          </a>
        </Typography>
      );
    }
    
    if (isReadOnly) {
      return <span>{renderValue(value)}</span>;
    }
    
    return null;
  }, [isLink, renderValue]);

  const renderTextInput = useCallback((item) => {
    const linkOrText = renderLinkOrText(item.value);
    if (linkOrText) return linkOrText;

    return (
      <input
        value={props.formValues?.[item.id]?.value || ''}
        placeholder={renderValue(item.value)}
        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
        className="form-control"
        disabled={item.isAutomatic}
        style={getInputStyle(item.isAutomatic)}
      />
    );
  }, [props.formValues, renderValue, handleInputChange, getInputStyle, renderLinkOrText]);

  const renderTextarea = useCallback((item) => (
    // <textarea
    //   ref={(el) => {
    //     if (el) {
    //       const autoResize = () => {
    //         el.style.height = 'auto';
    //         el.style.height = Math.max(48, el.scrollHeight) + 'px';
    //       };
    //       setTimeout(autoResize, 0);
    //       el.addEventListener('input', autoResize);
    //     }
    //   }}
    //   placeholder={renderValue(item.value)}
    //   value={props.formValues?.[item.id]?.value || ''}
    //   onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
    //   className="form-control"
    //   disabled={item.isAutomatic}
    //   style={{
    //     ...getInputStyle(item.isAutomatic),
    //     ...textareaStyle,
    //   }}
    // />
    <ResizableTextarea 
      item={item}
      props={props}
      handleInputChange={handleInputChange}
      renderValue={ renderValue}
      getInputStyle ={getInputStyle}
      />
  ), [props.formValues, renderValue, handleInputChange, getInputStyle, textareaStyle]);

  const renderDateTimeInput = useCallback((item, type = 'date') => (
    <input
      type={type}
      placeholder={type === 'date' ? renderValue(item.value) : undefined}
      value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
      className="form-control"
      disabled={item.isAutomatic}
      style={getInputStyle(item.isAutomatic)}
    />
  ), [props.formValues, renderValue, handleInputChange, getInputStyle]);

  const renderBooleanSelect = useCallback((item) => (
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
      sx={{
        ...selectSxStyle,
        backgroundColor: item.isAutomatic ? '#f5f5f5' : '#fff',
      }}
    >
      <MenuItem value=""><em>None</em></MenuItem>
      <MenuItem value={true}>Yes</MenuItem>
      <MenuItem value={false}>No</MenuItem>
    </Select>
  ), [props.formValues, handleInputChange, selectSxStyle]);

  const renderMultiSelectLookup = useCallback((item) => {
    const isAssignmentProperty = (props.selectedObject.objectID === 10 || props.selectedObject.objectTypeId === 10) && item.propName === 'Assigned to';
    const isCompletedByProperty = item.propName === 'Marked as complete by';

    if (isAssignmentProperty) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {Array.isArray(item.value) && item.value.map((i, index) => (
            <FormGroup key={index} sx={{ m: 0 }}>
              <FormControlLabel
                control={
                  <Tooltip title={`Mark as complete for ${i.title || ''}`} placement="left">
                    <Checkbox
                      checked={props.checkedItems[i.id] || false}
                      onChange={() => setAssignmentPayload(item, i)}
                      sx={{ p: 0.25 }}
                      size="small"
                    />
                  </Tooltip>
                }
                label={
                  <span style={{ fontSize: '13px', color: '#333' }}>
                    {renderValue(i.title?.value || i.title)}
                  </span>
                }
                labelPlacement="end"
                sx={{ alignItems: 'center', ml: 0, mr: 0 }}
              />
            </FormGroup>
          ))}
        </Box>
      );
    }

    if (isCompletedByProperty) {
      return (
        <Typography fontSize="13px" sx={{ color: '#333', lineHeight: 1.3, m: 0 }}>
          {Array.isArray(item.value) ? 
            item.value
              .map(i => renderValue(i.title?.value || i.title))
              .filter(Boolean)
              .join('; ') 
            : renderValue(item.value)
          }
        </Typography>
      );
    }

    return (
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
    );
  }, [props.selectedObject, props.checkedItems, props.formValues, props.vault, props.mfilesId, setAssignmentPayload, handleInputChange, renderValue]);

  const renderSingleLookup = useCallback((item) => (
    <LookupSelect
      propId={item.id}
      label={item.propName}
      value={props.formValues?.[item.id]?.value || []}
      onChange={(id, newValue) => handleInputChange(id, newValue, item.datatype)}
      selectedVault={props.vault}
      itemValue={item.value}
      disabled={item.isAutomatic}
      mfilesid={props.mfilesId}
    />
  ), [props.formValues, props.vault, props.mfilesId, handleInputChange]);

  // Main render function for property items
  const renderPropertyItem = useCallback((item, index) => {
    // Extract common conditions
    const hasReadPermission = item.userPermission.readPermission;
    const isVisible = !item.isHidden && hasReadPermission;
    const isReadOnly = item.isAutomatic && !item.userPermission?.editPermission && hasReadPermission;
    const isClassProperty = item.propName === 'Class';
    
    // Datatype checks
    const datatypeMap = {
      text: ['MFDatatypeText', 'MFDatatypeFloating', 'MFDatatypeInteger'].includes(item.datatype),
      multiLineText: item.datatype === 'MFDatatypeMultiLineText',
      date: item.datatype === 'MFDatatypeDate',
      time: item.datatype === 'MFDatatypeTimestamp',
      boolean: item.datatype === 'MFDatatypeBoolean',
      multiSelectLookup: item.datatype === 'MFDatatypeMultiSelectLookup',
      singleLookup: item.datatype === 'MFDatatypeLookup' && !isClassProperty,
    };

    return (
      <ListItem key={index} sx={{ py: 0.5, px: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '40% 60%',
            gap: 1,
            width: '100%',
            alignItems: 'flex-start',
          }}
        >
          {isVisible && (
            <Typography
              variant="body2"
              sx={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#333',
                textAlign: 'right',
                pr: 1,
                mt: datatypeMap.multiLineText ? 0.25 : 0,
              }}
            >
              {item.propName}
              {item.isRequired && (
                <span style={{ color: '#d32f2f', marginLeft: '2px' }}>*</span>
              )}
              :
            </Typography>
          )}

          <Box
            sx={{
              fontSize: '13px',
              color: '#333',
              width: '85%',
              '& input, & textarea, & .MuiSelect-root': {
                fontSize: '13px !important',
                width: '100%',
              },
              '& .form-control': {
                border: '1px solid #ccc',
                borderRadius: '2px',
                padding: '3px 6px',
                height: '24px',
                '&:focus': {
                  borderColor: '#0078d4',
                  outline: 'none',
                  boxShadow: 'none',
                }
              },
              '& textarea.form-control': {
                minHeight: '48px',
                height: 'auto',
                resize: 'none',
                overflow: 'hidden',
                lineHeight: '1.3',
              }
            }}
          >
            {isReadOnly ? (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '13px',
                  color: '#333',
                  wordBreak: 'break-word',
                  lineHeight: 1.3,
                  m: 0,
                }}
              >
                {renderLinkOrText(item.value, true) || renderValue(item.value)}
              </Typography>
            ) : (
              <>
                {/* Class property display */}
                {isClassProperty && (
                  <Typography variant="body2" sx={{ fontSize: '13px', color: '#333' }}>
                    {renderValue(item.value)}
                  </Typography>
                )}
          
                {/* Render different input types based on datatype */}
                {datatypeMap.text && isVisible && renderTextInput(item)}
                {datatypeMap.multiLineText && isVisible && renderTextarea(item)}
                {datatypeMap.date && isVisible && renderDateTimeInput(item, 'date')}
                {datatypeMap.time && isVisible && renderDateTimeInput(item, 'time')}
                {datatypeMap.boolean && isVisible && renderBooleanSelect(item)}
                {datatypeMap.multiSelectLookup && isVisible && renderMultiSelectLookup(item)}
                {datatypeMap.singleLookup && isVisible && renderSingleLookup(item)}
              </>
            )}
          </Box>
        </Box>
      </ListItem>
    );
  }, [renderLinkOrText, renderValue, renderTextInput, renderTextarea, renderDateTimeInput, renderBooleanSelect, renderMultiSelectLookup, renderSingleLookup]);

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
            onChange={(_, newValue) => setValue(newValue)}
            aria-label="Horizontal tabs example"
            sx={{ borderColor: 'divider' }}
            className="bg-white"
          >
            {["Metadata", "Preview", "Ask AI Assistant"].map((label, index) => (
              <Tab
                key={index}
                style={{ textTransform: "none" }}
                sx={{
                  width: "auto",
                  height: "56px",
                  minWidth: "100px",
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
                minWidth: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Comments
                </Box>
              }
              {...a11yProps(3)}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, margin: 0, color: 'black' }}>
          <CustomTabPanel value={value} index={0} style={{ backgroundColor: '#fff', padding: '0%', width: '100%' }}>
            {props.previewObjectProps.length < 1 ? (
              <Box sx={{
                width: '100%',
                marginTop: '20%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto'
              }}>
                <i className="fas fa-info-circle my-2" style={{ fontSize: '120px', color: '#2757aa' }} />
                {props.loadingobject ? (
                  <Typography variant="body2" className='loading-indicator text-dark my-2' sx={{ textAlign: 'center' }}>
                    <CircularProgress size="20px"  style={{ color: "#2757aa" , marginRight:'10px'}} />  Loading metadata<span>.</span><span>.</span><span>.</span>
                  </Typography>
                 
                ) : (
                  <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                    Metadata Card
                  </Typography>
                )}
                <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                  Please select an object to view its metadata
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{
                  backgroundColor: '#ecf4fc',
                  p: 1,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {/* Object Info Section */}
                  <Tooltip title={props.selectedObject?.title || ''}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#1d3557',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}>
                      {/* Icon Logic */}
                      {props.selectedObject &&
                        (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) &&
                        props.selectedObject.isSingleFile === true ? (
                        <>
                          <span className='mx-2'>
                            <FileExtIcon
                              fontSize="25px"
                              guid={props.vault.guid}
                              objectId={props.selectedObject.id}
                              classId={props.selectedObject.classId ?? props.selectedObject.classID}
                              sx={{ fontSize: '25px !important', mr: '10px', flexShrink: 0 }}
                            />
                          </span>
                          <Box sx={{
                            fontSize: '13px',
                            color: '#212529',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {trimTitle(props.selectedObject.title || '')}
                            <FileExtText
                              guid={props.vault.guid}
                              objectId={props.selectedObject.id}
                              classId={props.selectedObject.classId ?? props.selectedObject.classID}
                            />
                          </Box>
                        </>
                      ) : (
                        <>
                          <i
                            className={
                              (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) &&
                                props.selectedObject.isSingleFile === false
                                ? 'fas fa-book'
                                : 'fa-solid fa-folder'
                            }
                            style={{
                              color: (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) &&
                                props.selectedObject.isSingleFile === false ? '#7cb518' : '#2a68af',
                              fontSize: '25px',
                              marginRight: '10px',
                              flexShrink: 0
                            }}
                          />
                          <Box sx={{
                            fontSize: '13px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {trimTitle(props.selectedObject.title || '')}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Tooltip>

                  {/* Action Buttons Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    {props.comments.length > 0 && (
                      <Tooltip title="Comments">
                        <Box onClick={navigateToComments} sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                          <i
                            className="fas fa-comment-alt"
                            style={{ fontSize: "18px", cursor: "pointer", color: '#2757aa' }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              cursor: "pointer",
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
                    {props.selectedObject && (props.selectedObject.objectID ?? props.selectedObject.objectTypeId) === 0 &&  props.blob && (
                      <Tooltip title="Download document">
                        <i
                          className="fas fa-download"
                          onClick={() => handleDownload(props.blob, props.extension, props.selectedObject.title)}
                          style={{
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#2757aa',
                            padding: '4px'
                          }}
                        />
                      </Tooltip>
                    )}
                    {props.selectedObject?.userPermission?.deletePermission && (
                      <Tooltip title="Delete Object">
                        <i
                          className="fas fa-trash"
                          onClick={() => setDeleteDialogOpen(true)}
                          style={{
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#2757aa',
                            padding: '4px'
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                <Box className="p-1" display="flex" justifyContent="space-between" sx={{ backgroundColor: '#ecf4fc' }}>
                  <Box sx={{ textAlign: 'start', fontSize: '13px', maxWidth: '30%' }} className="mx-2">
                    <Box sx={{ fontSize: '13px', color: '#555' }}>
                      {props.selectedObject.objectTypeName || getPropValue('Class') || ''}
                    </Box>
                    <Box
                      className="input-group"
                      sx={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '8px',
                        fontSize: '13px',
                        color: '#555',
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      ID: {props.selectedObject.displayID || ''} &nbsp;&nbsp; Version: {props.selectedObject.versionId || ''}
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'end', fontSize: '13px', maxWidth: '80%', color: '#555' }} className="mx-2">
                    {["Created", "Last modified"].map((label) => (
                      <Box key={label}>
                        {label}: {getPropValue(label) || ''} {getPropValue(`${label} by`) || ''}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box className='p-2' sx={{ backgroundColor: '#fff', fontSize: '13px' }}>
                  <List
                    sx={{
                      p: 0,
                      height: '58vh',
                      overflowY: 'auto',
                      backgroundColor: '#fff',
                      '& .MuiListItem-root': {
                        minHeight: 'auto',
                      }
                    }}
                  >
                    {/* Class row */}
                    <ListItem sx={{ py: 0.5, px: 1 }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '40% 60%',
                          gap: 1,
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '13px',
                            fontWeight: 400,
                            color: '#333',
                            textAlign: 'right',
                            pr: 1,
                          }}
                        >
                          Class:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '13px',
                            color: '#333',
                            wordBreak: 'break-word',
                          }}
                        >
                          {props.selectedObject.classTypeName || getPropValue('Class') || ''}
                        </Typography>
                      </Box>
                    </ListItem>

                    {/* Dynamic properties */}
                    {filteredProps.map(renderPropertyItem)}
                  </List>
                </Box>
                <Box
                  sx={{
                    height: 'auto',
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr auto',
                    },
                    alignItems: 'center',
                    p: 1,
                    gap: 1,
                    backgroundColor: '#ecf4fc',
                  }}>
                  <Box
                    sx={{
                      fontSize: '13px',
                      '*': {
                        fontSize: '13px !important',
                      },
                    }}
                  >
                    {!props.loadingWFS ? (
                      <>
                        {(props.workflows?.length > 0 || props.selectedObkjWf) && (
                          <>
                            {props.selectedObkjWf ? (
                              <>
                                <p className="my-1">
                                  <i className="fa-solid fa-arrows-spin mx-1" style={{ color: '#2757aa' }} />
                                  <span style={{ color: 'black', fontSize: '13px' }}>Workflow</span>:{" "}
                                  <span style={{ marginLeft: '0.5rem' }}>
                                    {props.selectedObkjWf.workflowTitle || ''}
                                  </span>
                                </p>
                                <p className="my-1">
                                  <i className="fas fa-square-full text-warning mx-1" />
                                  <span style={{ color: 'black', fontSize: '13px' }}>State</span>:{" "}
                                  <span style={{ marginLeft: '2rem' }}>{props.currentState?.title || ''}</span>
                                  {Array.isArray(props.selectedObkjWf?.nextStates) && props.selectedObkjWf.nextStates.length > 0 && (
                                    <Select
                                      value={props.selectedState?.title || ''}
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
                                          {state.title || ''}
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
                                    {props.newWF ? <> <i className="fa-solid fa-arrows-spin mx-1" style={{ color: '#2757aa' }} /><span style={{ color: 'black', fontSize: '13px' }}>Workflow</span>:{" "}</> : <></>}
                                    <Select
                                      value={props.newWF?.workflowId || ''}
                                      onChange={handleWFChangeEmpty}
                                      size="small"
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected) {
                                          return <span style={{ color: 'black' }}>Assign a workflow?</span>;
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
                                      MenuProps={{
                                        PaperProps: {
                                          style: { maxHeight: 300 }
                                        },
                                        MenuListProps: {
                                          style: { paddingTop: 0 }
                                        }
                                      }}
                                    >
                                      <MenuItem
                                        disabled
                                        value=""
                                        className='shadow-sm'
                                        style={{
                                          color: '#2757aa',
                                          fontSize: '13px',
                                          position: 'sticky',
                                          top: 0,
                                          background: '#fff',
                                          zIndex: 1,
                                          opacity: 0.9
                                        }}
                                      >
                                        <span>Select workflow</span>
                                      </MenuItem>
                                      {props.workflows.map((wf) => (
                                        <MenuItem
                                          key={wf.workflowId}
                                          value={wf.workflowId}
                                          sx={{ fontSize: '13px !important' }}
                                        >
                                          {wf.workflowName || ''}
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
                                          return <span style={{ color: '#555' }}>Please select a state</span>;
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
                                          {state.stateName || ''}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </p>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                  </Box>
                  {(Object.keys(props.formValues || {}).length > 0 ||
                    props.selectedState?.title ||
                    props.newWF ||
                    (props.approvalPayload && Object.keys(props.approvalPayload).length > 0)
                  ) && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          className='rounded-pill'
                          size="medium"
                          variant="contained"
                          color="primary"
                          onClick={props.updateObjectMetadata}
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
          <CustomTabPanel value={value} index={1} style={{ backgroundColor: '#fff', padding: '0%', width: '100%' }}>
            {props.blob && !props.loadingfile? (
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
                blob={props.blob}
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
                <i className="fas fa-tv my-2" style={{ fontSize: '120px', color: '#2757aa' }} />
                {props.loadingfile ? (
                  <>
                    <Typography component="div" variant="body2" className='my-2 loading-spinner' sx={{ textAlign: 'center' }}>
                      <div className="loading-indicator text-dark">
                         <CircularProgress size="20px"  style={{ color: "#2757aa" , marginRight:'10px'}} />  Buffering file<span>.</span><span>.</span><span>.</span>
                      </div>
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                      Please wait as we load the file content
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                      Nothing to Preview
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                      Please select a document to view its content
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2} style={{ backgroundColor: '#fff', padding: '0%', width: '100%' }}>
            {props.blob && props.extension === "pdf" ? (
              <Bot blob={props.blob} objectTitle={props.selectedObject.title} messages={messages} setMessages={setMessages} file_ext={props.extension} />
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
                <i className="fa-brands fa-android my-2" style={{ fontSize: '120px', color: '#2757aa' }} />
                {props.loadingfile ? (
                  <>
                    <Typography component="div" variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                      <div className="loading-indicator text-dark">
                          <CircularProgress size="20px"  style={{ color: "#2757aa" , marginRight:'10px'}} />  Starting chat<span>.</span><span>.</span><span>.</span>
                      </div>
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                      Please wait as we load the resources
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                      No document selected
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                      Please select a PDF to interact with the chatbot
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3} style={{ backgroundColor: '#fff', padding: '0%', width: '100%' }}>
            <>
              {!props.previewObjectProps.length < 1 ? (
                <CommentsComponent
                  selectedObject={props.selectedObject}
                  guid={props.vault?.guid || ""}
                  loadingcomments={props.loadingcomments}
                  user={props.user}
                  comments={props.comments}
                  getObjectComments={props.getObjectComments}
                  mfilesID={props.mfilesId}
                  docTitle={props.selectedObject.title}
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
                  <i className="fas fa-comment-alt my-2" style={{ fontSize: '120px', color: '#2757aa' }} />
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                    {props.loadingcomments ? (
                      <div className="loading-indicator text-dark">
                         <CircularProgress size="20px"  style={{ color: "#2757aa" , marginRight:'10px'}} />  Loading comments <span>.</span><span>.</span><span>.</span>
                      </div>
                    ) : (
                      <>
                        <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                          No Comments Yet
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                          Please select an object to view comments
                        </Typography>
                      </>
                    )}
                  </div>
                </Box>
              )}
            </>
          </CustomTabPanel>
        </Box>
      </Box >
    </>
  );
};

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
  selectedFileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])?.isRequired,
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

export default ObjectData;