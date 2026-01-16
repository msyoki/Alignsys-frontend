import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import DynamicFileViewer from '../Viewer/DynamicFileViewer';
import axios from 'axios';
import * as constants from '../Auth/configs';
import LookupMultiSelect from '../CustomFormTags/UpdateObjectLookupMultiSelect';
import LookupSelect from '../CustomFormTags/UpdateObjectLookup';
import { Dialog, DialogContent, DialogTitle, DialogActions, Tabs, Tab, Box, List, ListItem, Typography, Select, MenuItem, Button, Checkbox, FormControlLabel, FormGroup, CircularProgress, Badge, IconButton, Collapse } from '@mui/material';
import Bot from '../Bot/Bot';

import CommentsComponent from '../CommentsComponent';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';
import ConfirmDeleteObject from '../Modals/ConfirmDeleteObject';
import TimedAlert from '../TimedAlert';
import { Tooltip } from '@mui/material';
import { ResizableTextarea } from '../CustomFormTags/ResizableTextArea';
import AnimatedAndroidIcon from '../Modals/AnimatedBot';
import CheckOutStatusBadgeIcon from '../CheckoutStatusBadge';
import AutomaticPermissionsButton from '../AutomaticPermissionsButton';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { FaFolderPlus } from "react-icons/fa6";
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { FaBook } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { THEME_COLORS } from '../../constants/themeColors';


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
        <Box sx={{ height: '100%', overflowY: 'auto', backgroundColor: THEME_COLORS.surfaceLight }}>
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
  const [selectedClass, setSelectedClass] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const [classLoading, setClassLoading] = useState(false);

  const [expanded, setExpanded] = useState(true);

  const toggleExpand = () => setExpanded((prev) => !prev);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});


  // Common styles - extracted to avoid repetition
  const commonInputStyle = useMemo(() => ({
    fontSize: '12.8px',
    color: '#333',
    marginTop: 0.75,
    marginBottom: 0.75,
  }), []);

  const getInputStyle = useCallback((isAutomatic) => ({
    ...commonInputStyle,
    height: '36px',
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
    fontSize: '12.8px',
    height: '36px',
    m: 0,
    '& .MuiSelect-select': {
      fontSize: '12.8px',
      color: '#333',
      padding: '3px 6px',
      minHeight: 'unset',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiInputBase-root': {
      height: '36px',
    },
    '& .MuiOutlinedInput-input': {
      padding: '3px 6px',
      fontSize: '12.8px',
    },
    '& .MuiMenuItem-root': {
      fontSize: '12.8px',
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
    const selectedState = props.selectedObjWf.nextStates.find(state => state.title === selectedTitle);
    if (props.selectedState) {
      props.setSelectedState(selectedState);
    }
  }, [props.selectedObjWf, props.selectedState, props.setSelectedState]);

  const transformPropertiesForClassUpdate = (propsList) => {
    console.log(propsList);
    return propsList
      // 1️⃣ Only include editable properties
      .filter(item => item.userPermission?.editPermission === true)

      // 2️⃣ Transform values based on datatype
      .map(item => {
        let transformedValue = item.value;

        switch (item.datatype) {

          // Multi-select lookup → "2, 4, 5"
          case "MFDatatypeMultiSelectLookup":
            transformedValue = Array.isArray(item.value) && item.value.length > 0
              ? item.value.map(v => v.id).join(", ")
              : null;
            break;

          // Single lookup → "7"
          case "MFDatatypeLookup":
            transformedValue = item.value?.id
              ? String(item.value.id)
              : null;
            break;

          // Boolean → "true" | "false"
          case "MFDatatypeBoolean":
            transformedValue = item.value ? "true" : "false";
            break;

          // Numbers → "123"
          case "MFDatatypeNumber":
            transformedValue = item.value != null
              ? String(item.value)
              : null;
            break;

          default:
            // No transformation needed (text, multiline, date, etc.)
            break;
        }

        return {
          propId: item.id,
          value: transformedValue,
          propertytype: item.datatype,
        };
      });
  };





  const handleInputChange = useCallback((id, newValues, datatype, value) => {

    if (id === 100) {

      props.setClassUpdatePayload({
        objectID: props.selectedObject.id,
        objectTypeID: 0,
        oldClassID: value?.[0]?.id ? parseInt(value[0].id) : null,
        newClassID: newValues ? parseInt(newValues) : null,
        properties: transformPropertiesForClassUpdate(filteredPropsNoClass),
        vaultGuid: props.vault?.guid,
        userID: props.mfilesId
      });

      props.setChangedClass(true);
      console.log(props.selectedObject.id)
      console.log(newValues)
      console.log(parseInt(value[0].id))
      console.log(datatype)
      console.log({
        objectID: props.selectedObject.id,
        objectTypeID: 0,
        oldClassID: value?.[0]?.id ? parseInt(value[0].id) : null,
        newClassID: newValues ? parseInt(newValues) : null,
        properties: transformPropertiesForClassUpdate(filteredPropsNoClass),
        vaultGuid: props.vault?.guid,
        userID: props.mfilesId
      });

    }

    else {
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
    }
  }, [props.selectedObject, props.setFormValues]);


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

  const filteredPropsNoClass = useMemo(() =>
    props.previewObjectProps.filter(item =>
      ![
        'Last modified by',
        'Last modified',
        'Created',
        'Created by',
        'Accessed by me',
        'Class',
        // 'State',
        // 'Workflow',
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
        <Typography variant="body2" sx={{ fontSize: '12.8px' }}>
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
        onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype, item.value)}
        className="form-control"
        disabled={item.isAutomatic}
        style={getInputStyle(item.isAutomatic)}
      />
    );
  }, [props.formValues, renderValue, handleInputChange, getInputStyle, renderLinkOrText]);

  const renderTextarea = useCallback((item) => (
    <div style={{ marginTop: '6px', marginBottom: '6px' }}>
      <ResizableTextarea
        item={item}
        props={props}
        handleInputChange={handleInputChange}
        renderValue={renderValue}
        getInputStyle={getInputStyle}
      />
    </div>
  ), [props.formValues, renderValue, handleInputChange, getInputStyle, textareaStyle]);

  const renderDateTimeInput = useCallback((item, type = 'date') => (
    <input
      type={type}
      placeholder={type === 'date' ? renderValue(item.value) : undefined}
      value={props.formValues?.[item.id]?.value || formatDateForInput(item.value) || ''}
      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype, item.value)}
      className="form-control"
      disabled={item.isAutomatic}
      style={{ ...getInputStyle(item.isAutomatic), height: '36px' }}
    />
  ), [props.formValues, renderValue, handleInputChange, getInputStyle]);

  const renderBooleanSelect = useCallback((item) => (
    <Select
      size="small"
      value={
        props.formValues?.[item.id]?.value ??
        (item.value === 'Yes' ? true : item.value === 'No' ? false : '')
      }
      onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype, item.value)}
      displayEmpty
      fullWidth
      disabled={item.isAutomatic}
      sx={{
        ...selectSxStyle,
        marginTop: 0.5,
        marginBottom: 0.5,
        backgroundColor: item.isAutomatic ? '#f5f5f5' : '#fff',
      }}
    >
      <MenuItem value="" style={{ fontSize: '12.8px' }}>None</MenuItem>
      <MenuItem value={true} style={{ fontSize: '12.8px' }}>Yes</MenuItem>
      <MenuItem value={false} style={{ fontSize: '12.8px' }}>No</MenuItem>
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
                  <span style={{ fontSize: '12.8px', color: '#333' }}>
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
        <Typography fontSize="12.8px" sx={{ color: '#333', lineHeight: 1.3, m: 0 }}>
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
        onChange={(id, newValues) => handleInputChange(id, newValues, item.datatype, item.value)}
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
      onChange={(id, newValue) => handleInputChange(id, newValue, item.datatype, item.value)}
      selectedVault={props.vault}
      itemValue={item.value}
      disabled={item.isAutomatic}
      mfilesid={props.mfilesId}
    />
  ), [props.formValues, props.vault, props.mfilesId, handleInputChange]);

  // Fetch available classes for the object type
  const fetchAvailableClasses = useCallback(async () => {
    if (classOptions.length > 0) return; // Don't refetch

    try {
      setClassLoading(true);
      const objectTypeId = props.selectedObject.objectTypeId || props.selectedObject.objectID || 0;
      const response = await axios.get(
        `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.vault.guid}/${objectTypeId}/${props.mfilesId}`
      );

      // Flatten grouped and ungrouped classes
      const allClasses = [];
      if (response.data?.grouped) {
        response.data.grouped.forEach(group => {
          if (group.members) {
            allClasses.push(...group.members);
          }
        });
      }
      if (response.data?.unGrouped) {
        allClasses.push(...response.data.unGrouped);
      }

      setClassOptions(allClasses);
    } catch (error) {
      console.error('Error fetching class options:', error);
    } finally {
      setClassLoading(false);
    }
  }, [classOptions.length, props.selectedObject, props.vault, props.mfilesId]);

  // Class selector renderer
  const renderClassSelector = useCallback((item) => {
    return (
      <Select
        value={item.value?.[0]?.id || ''}
        onChange={(e) => handleInputChange(100, e.target.value, item.datatype, item.value)}
        onOpen={fetchAvailableClasses}
        fullWidth
        size="small"
        disabled={classLoading}
        sx={{
          fontSize: '12.8px',
          height: '36px',
          backgroundColor: '#fff',
          '& .MuiSelect-select': {
            fontSize: '12.8px',
            padding: '6px',
            minHeight: 'unset',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ccc',
          },
        }}
      >
        <MenuItem value="" disabled>
          <span style={{ fontSize: '12.8px' }}>
            {classLoading ? 'Loading classes...' : 'Select a class...'}
          </span>
        </MenuItem>

        {/* Current class */}
        {item.value?.[0] && (
          <MenuItem value={item.value[0].id} style={{ fontSize: '12.8px', fontWeight: 'bold' }}>
            ✓ {item.value[0].title} (Current)
          </MenuItem>
        )}

        {/* Divider if we have both current and other classes */}
        {item.value?.[0] && classOptions.length > 0 && (
          <Box component="div" sx={{ borderTop: '1px solid #ddd', my: 0.5 }} />
        )}

        {/* Available classes */}
        {classOptions.map((classItem) => (
          <MenuItem
            key={classItem.classId}
            value={classItem.classId}
            style={{ fontSize: '12.8px' }}
          >
            {classItem.className}
          </MenuItem>
        ))}

        {/* No classes message */}
        {classOptions.length === 0 && !classLoading && (
          <MenuItem disabled style={{ fontSize: '12.8px' }}>
            No other classes available
          </MenuItem>
        )}
      </Select>
    );
  }, [classLoading, classOptions, handleInputChange, fetchAvailableClasses]);

  // Main render function for property items
  const renderPropertyItem = useCallback(
    (item, index) => {
      const hasReadPermission = item.userPermission.readPermission;
      const isVisible = !item.isHidden && hasReadPermission;
      const isReadOnly = item.isAutomatic && !item.userPermission?.editPermission && hasReadPermission;
      const isClassProperty = item.propName === 'Class';

      const datatypeMap = {
        text: ['MFDatatypeText', 'MFDatatypeFloating', 'MFDatatypeInteger'].includes(item.datatype),
        multiLineText: item.datatype === 'MFDatatypeMultiLineText',
        date: item.datatype === 'MFDatatypeDate',
        time: item.datatype === 'MFDatatypeTimestamp',
        boolean: item.datatype === 'MFDatatypeBoolean',
        multiSelectLookup: item.datatype === 'MFDatatypeMultiSelectLookup',
        singleLookup: item.datatype === 'MFDatatypeLookup' && !isClassProperty,
        singleLookup: item.datatype === 'MFDatatypeLookup',
      };

      if (!isVisible) return null;

      return (
        <ListItem key={index} sx={{ py: 0.5, px: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '35% 50%', // original ratio
              gap: 1,
              width: '100%',
              alignItems: datatypeMap.multiLineText ? 'flex-start' : 'center',
            }}
          >
            {/* Label */}
            <Typography
              variant="body2"
              sx={{
                fontSize: '12.8px',
                fontWeight: 400,
                color: '#333',
                textAlign: 'right',
                pr: 1,
                mt: datatypeMap.multiLineText ? 0.25 : 0,
              }}
            >
              {item.propName}
              {item.isRequired && <span style={{ color: '#d32f2f', marginLeft: 2 }}>*</span>}:
            </Typography>

            {/* Value / Input */}
            <Box
              sx={{
                fontSize: '12.8px',
                color: '#333',
                width: '100%',
                '& input, & textarea, & .MuiSelect-root': {
                  fontSize: '12.8px !important',
                  width: '100%',
                  boxSizing: 'border-box',
                  lineHeight: 1.3,
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  padding: '6px',
                  height: '36px',
                  '&:focus': {
                    borderColor: '#0078d4',
                    outline: 'none',
                    boxShadow: 'none',
                  },
                },
                '& textarea': {
                  minHeight: '48px',
                  height: 'auto',
                  resize: 'none',
                  overflow: 'hidden',
                },
              }}
            >
              {isReadOnly ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '12.8px',
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
                  {isClassProperty && renderClassSelector(item)}

                  {datatypeMap.text && renderTextInput(item)}
                  {datatypeMap.multiLineText && renderTextarea(item)}
                  {datatypeMap.date && renderDateTimeInput(item, 'date')}
                  {datatypeMap.time && renderDateTimeInput(item, 'time')}
                  {datatypeMap.boolean && renderBooleanSelect(item)}
                  {datatypeMap.multiSelectLookup && renderMultiSelectLookup(item)}
                  {datatypeMap.singleLookup && renderSingleLookup(item)}
                </>
              )}
            </Box>
          </Box>
        </ListItem>
      );
    },
    [
      renderLinkOrText,
      renderValue,
      renderTextInput,
      renderTextarea,
      renderDateTimeInput,
      renderBooleanSelect,
      renderMultiSelectLookup,
      renderSingleLookup,
      renderClassSelector,
    ]
  );

  const allClasses = useMemo(() => {
    const classes = [];

    // Add grouped classes
    if (props.groupedItems) {
      props.groupedItems.forEach(group => {
        group.members.forEach(member => {
          if (member.userPermission?.attachObjectsPermission) {
            classes.push({
              classId: member.classId,
              className: member.className,
              groupName: group.classGroupName,
              groupId: group.classGroupId
            });
          }
        });
      });
    }

    // Add ungrouped classes
    if (props.ungroupedItems) {
      props.ungroupedItems.forEach(member => {
        if (member.userPermission?.attachObjectsPermission) {
          classes.push({
            classId: member.classId,
            className: member.className,
            groupName: 'Ungrouped',
            groupId: 'ungrouped'
          });
        }
      });
    }

    return classes;
  }, [props.groupedItems, props.ungroupedItems]);

  const handleOpenDialog = () => {
    const initialExpanded = {};
    if (props.groupedItems) {
      props.groupedItems.forEach(group => {
        initialExpanded[group.classGroupId] = true;
      });
    }
    if (props.ungroupedItems && props.ungroupedItems.length > 0) {
      initialExpanded['ungrouped'] = true;
    }
    setExpandedGroups(initialExpanded);
    setClassDialogOpen(true);
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
      {/* Class Selection Dialog with Collapsible Groups */}
      <Dialog
        open={classDialogOpen}
        onClose={() => setClassDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: THEME_COLORS.primary,
            color: '#fff',
            fontSize: '14px',
            py: 2
          }}
        >
          <FaFolderPlus className="mx-2" />
          Select Class
        </DialogTitle>
        <DialogContent sx={{ pt: 2, px: 2 }}>
          <List sx={{ p: 0 }}>
            {/* Grouped Classes */}
            {props.groupedItems && props.groupedItems.map((group) => {
              const filteredMembers = group.members.filter(
                member => member.userPermission?.attachObjectsPermission
              );

              if (filteredMembers.length === 0) return null;

              return (
                <Box key={group.classGroupId}>
                  <ListItem
                    button
                    // onClick={() => toggleGroup(group.classGroupId)}
                    sx={{
                      backgroundColor: THEME_COLORS.surfaceLight,
                      mb: 0.5,
                      py: 1,
                      borderRadius: '4px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: THEME_COLORS.primary
                        }}
                      >
                        {group.classGroupName}
                      </Typography>
                      {expandedGroups[group.classGroupId] ? (
                        <ExpandLess sx={{ color: THEME_COLORS.primary }} />
                      ) : (
                        <ExpandMore sx={{ color: THEME_COLORS.primary }} />
                      )}
                    </Box>
                  </ListItem>
                  <Collapse in={expandedGroups[group.classGroupId]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {filteredMembers.map((member) => (
                        <ListItem
                          button
                          key={member.classId}
                          onClick={() => props.handleClassSelect(member.classId, member.className)}
                          sx={{
                            pl: 4,
                            py: 1,
                            '&:hover': {
                              backgroundColor: '#f0f4f8'
                            },
                            backgroundColor: member.classId === props.selectedClassId ? '#e3f2fd' : 'transparent'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                            {props.selectedObjectId === 0 ? <FaFileCirclePlus style={{ color: '#2a68af', fontSize: '16px' }} /> : <FaFolderPlus style={{ color: '#2a68af', fontSize: '16px' }} />}

                            <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                              {member.className}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </Box>
              );
            })}

            {/* Ungrouped Classes */}
            {props.ungroupedItems && props.ungroupedItems.length > 0 &&
              props.ungroupedItems.filter(member => member.userPermission?.attachObjectsPermission).length > 0 && (
                <Box>
                  <ListItem
                    button
                    // onClick={() => toggleGroup('ungrouped')}
                    sx={{
                      backgroundColor: '#ecf4fc',
                      mb: 0.5,
                      py: 1,
                      borderRadius: '4px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: THEME_COLORS.primary
                        }}
                      >
                        Ungrouped
                      </Typography>
                      {expandedGroups['ungrouped'] ? (
                        <ExpandLess sx={{ color: THEME_COLORS.primary }} />
                      ) : (
                        <ExpandMore sx={{ color: THEME_COLORS.primary }} />
                      )}
                    </Box>
                  </ListItem>
                  <Collapse in={expandedGroups['ungrouped']} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {props.ungroupedItems
                        .filter(member => member.userPermission?.attachObjectsPermission)
                        .map((member) => (
                          <ListItem
                            button
                            key={member.classId}
                            // onClick={() => handleClassSelect(member.classId, member.className)}
                            sx={{
                              pl: 4,
                              py: 1,
                              '&:hover': {
                                backgroundColor: '#f0f4f8'
                              },
                              backgroundColor: member.classId === props.selectedClassId ? '#e3f2fd' : 'transparent'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {props.selectedObjectId === 0 ? <FaFileCirclePlus style={{ color: '#2a68af', fontSize: '16px' }} /> : <FaFolderPlus style={{ color: '#2a68af', fontSize: '16px' }} />}

                              <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                                {member.className}
                              </Typography>
                            </Box>
                          </ListItem>
                        ))}
                    </List>
                  </Collapse>
                </Box>
              )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setClassDialogOpen(false)}
            variant="contained"
            color="warning"
            sx={{ textTransform: 'none', borderRadius: '20px' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>


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
                {...props.a11yProps(index)}
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
              {...props.a11yProps(3)}
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, margin: 0, color: '#333' }}>
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
                <FaInfoCircle className="fas fa-info-circle my-2" style={{ fontSize: '120px', color: THEME_COLORS.primary }} />
                {props.loadingobject ? (
                  <Typography variant="body2" className='loading-indicator text-dark my-2' sx={{ textAlign: 'center' }}>
                    <CircularProgress size="20px" style={{ color: THEME_COLORS.primary, marginRight: '10px' }} />  Loading metadata<span>.</span><span>.</span><span>.</span>
                  </Typography>

                ) : (
                  <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                    Metadata Card
                  </Typography>
                )}
                <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
                  Please select an object to view its metadata
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{
                  backgroundColor: '#ecf4fc',

                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: 2
                }}
                  onClick={toggleExpand}
                >
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
                          <span className='mx-2 my-1 p-1'>
                            <>
                              {props.selectedObject.isCheckedOut ? (

                                <CheckOutStatusBadgeIcon
                                  color={Number(props.selectedObject?.checkoutuserid) === Number(props.mfilesId) ? "#3fa34d" : "#ef233c"}
                                  icon={Number(props.selectedObject?.checkoutuserid) === Number(props.mfilesId) ? "fa-check-circle" : "fa-solid fa-circle-minus"}
                                  offsetX="-7px"
                                  offsetY="-3px"
                                >
                                  <FileExtIcon
                                    fontSize="25px"
                                    guid={props.vault.guid}
                                    objectId={props.selectedObject.id}
                                    classId={props.selectedObject.classId ?? props.selectedObject.classID}
                                    sx={{ fontSize: '25px !important', mr: '10px', flexShrink: 0 }}
                                  />
                                </CheckOutStatusBadgeIcon>
                              ) : (
                                <FileExtIcon
                                  fontSize="25px"
                                  guid={props.vault.guid}
                                  objectId={props.selectedObject.id}
                                  classId={props.selectedObject.classId ?? props.selectedObject.classID}
                                  sx={{ fontSize: '25px !important', mr: '10px', flexShrink: 0 }}
                                />)}
                            </>

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
                          <Box
                            className="mx-2 my-1 p-1"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              maxWidth: '100%',
                              overflow: 'hidden',
                            }}
                          >
                            {(
                              (props.selectedObject.objectTypeId === 0 ||
                                props.selectedObject.objectID === 0) &&
                              props.selectedObject.isSingleFile === false
                            ) ? (
                              <FaBook
                                style={{
                                  color: '#7cb518',
                                  fontSize: '25px',
                                  marginRight: '10px',
                                  flexShrink: 0,
                                }}
                              />
                            ) : (
                              <FaFolder
                                style={{
                                  color: '#2a68af',
                                  fontSize: '25px',
                                  marginRight: '10px',
                                  flexShrink: 0,
                                }}
                              />
                            )}

                            <Box
                              sx={{
                                fontSize: '13px',
                                color: '#212529',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {trimTitle(props.selectedObject.title || '')}
                            </Box>
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
                            style={{ fontSize: "18px", cursor: "pointer", color: THEME_COLORS.primary }}
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
                              fontSize: "12.8px",
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
                    {props.selectedObject && (props.selectedObject.objectID ?? props.selectedObject.objectTypeId) === 0 && props.blob && (
                      <Tooltip title="Download document">
                        <i
                          className="fas fa-download"
                          onClick={() => handleDownload(props.blob, props.extension, props.selectedObject.title)}
                          style={{
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: THEME_COLORS.primary,
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
                            color: THEME_COLORS.primary,
                            padding: '4px'
                          }}
                        />
                      </Tooltip>
                    )}
                    <Tooltip title={expanded ? 'Hide details' : 'Show details'}>
                      <IconButton size="small" color="primary">
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </IconButton>
                    </Tooltip>

                  </Box>
                </Box>

                <Box sx={{ backgroundColor: '#f6fafe', overflow: 'hidden' }}>
                  {/* Header */}


                  {/* Expandable Content */}
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box
                      className="p-1"
                      display="flex"
                      justifyContent="space-between"
                      sx={{ backgroundColor: '#f6fafe', borderTop: '1px solid #d1e3f7' }}
                    >
                      {/* Left Section */}
                      <Box sx={{ textAlign: 'start', fontSize: '12.8px', maxWidth: '30%' }} className="mx-2">
                        <Box sx={{ fontSize: '12px', color: '#555b6e' }}>
                          {props.selectedObject.objectTypeName || getPropValue('Class') || ''}
                        </Box>
                        <Box
                          className="input-group"
                          sx={{
                            display: 'flex',
                            flexWrap: 'nowrap',
                            gap: '8px',
                            fontSize: '12.8px',
                            color: '#555b6e',
                            width: '100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          ID: {props.selectedObject.displayID || ''} &nbsp;&nbsp; Version:{' '}
                          {props.selectedObject.versionId || ''}
                        </Box>
                      </Box>

                      {/* Right Section */}
                      <Box sx={{ textAlign: 'end', fontSize: '12.8px', maxWidth: '80%', color: '#555b6e' }} className="mx-2">
                        {['Created', 'Last modified'].map((label) => (
                          <Box key={label}>
                            {label}: {getPropValue(label) || ''} {getPropValue(`${label} by`) || ''}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </Box>

                <Box className='p-2' sx={{ backgroundColor: '#fff', fontSize: '12.8px' }}>
                  <List
                    sx={{
                      p: 0,
                      height: expanded ? '50vh' : '58vh',
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
                          gridTemplateColumns: '35% 50%', // original ratio
                          gap: 1,
                          width: '100%',
                          alignItems: 'center',
                        }}
                      >
                        {/* Label */}
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '12.8px',
                            fontWeight: 400,
                            color: '#333',
                            textAlign: 'right',
                            pr: 1,
                            mt: 0,
                          }}
                        >
                          Class:
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '12.8px',
                            color: '#333',
                            wordBreak: 'break-word',
                            marginY: 1
                          }}
                        >
                          {props.selectedObject.classTypeName || getPropValue('Class') || ''}

                        </Typography>
                        {/* <Box className="my-2" sx={{ flex: 1, fontSize: '13px', textAlign: 'start', color: '#555b6e', mr: 4 }}>
                          {allClasses.length > 1 ? (
                            <Box
                              onClick={handleOpenDialog}
                              sx={{
                                cursor: 'pointer',
                                padding: '8px 12px',
                                border: '1px solid #c4c4c4',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                '&:hover': {
                                  borderColor: THEME_COLORS.primary,
                                  backgroundColor: '#f8f9fa'
                                }
                              }}
                            >
                              <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                                {props.selectedObject.classTypeName}
                              </Typography>
                              <i className="fas fa-chevron-down" style={{ fontSize: '12px', color: '#555b6e' }}></i>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: '13px', color: '#555b6e', padding: '8px 0' }}>
                              {props.selectedObject.classTypeName}
                            </Typography>
                          )}
                        </Box> */}
                      </Box>
                    </ListItem>

                    {/* Dynamic properties */}
                    {filteredProps.map(renderPropertyItem)}
                  </List>
                </Box>



                {/* # footer */}
                <Box
                  sx={{
                    height: 'auto',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                    alignItems: 'center',
                    p: 1,
                    gap: 1,
                    marginTop: 1,
                    backgroundColor: '#ecf4fc',
                  }}
                >
                  {/* Left Section — Workflow Info */}
                  <Box
                    sx={{
                      fontSize: '12.8px',
                      '*': { fontSize: '12.8px !important' },
                    }}
                  >
                    {!props.loadingWFS && (
                      <>
                        {(props.workflows?.length > 0 || props.selectedObjWf) && (
                          <>
                            {props.selectedObjWf ? (
                              <>
                                {/* Existing Workflow */}
                                <p className="my-1">
                                  <i
                                    className="fa-solid fa-arrows-spin mx-2"
                                    style={{ color: THEME_COLORS.primary }}
                                  />
                                  <span>{props.selectedObjWf.workflowTitle || ''}</span>
                                </p>

                                <p className="my-1">
                                  <i className="fas fa-square-full text-warning mx-2" />

                                  {Array.isArray(props.selectedObjWf?.nextStates) &&
                                    props.selectedObjWf.nextStates.length > 0 ? (
                                    <Select
                                      value={
                                        props.selectedState?.title ||
                                        props.currentState?.title ||
                                        ''
                                      }
                                      onChange={handleStateChange}
                                      size="small"
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected)
                                          return <span style={{ color: '#aaa' }}>transition</span>;

                                        const wf =
                                          props.selectedObjWf?.nextStates?.find(
                                            (w) => w.title === selected
                                          ) ||
                                          (selected === props.currentState?.title
                                            ? props.currentState
                                            : null);

                                        const currentTitle = props.currentState?.title || '';
                                        const nextTitle = wf?.title || wf?.workflowName || '';

                                        // If same state, just show one
                                        if (currentTitle === nextTitle) {
                                          return <>{currentTitle}</>;
                                        }

                                        // Otherwise show transition
                                        return (
                                          <>
                                            {currentTitle}{' '}
                                            <i className="mx-1 fas fa-long-arrow-alt-right text-primary" />{' '}
                                            {nextTitle}
                                          </>
                                        );
                                      }}

                                      sx={{
                                        fontSize: '12.8px !important',
                                        height: '24px',
                                        ml: '0.5rem',
                                        '.MuiSelect-select': { fontSize: '12.8px !important' },
                                      }}
                                    >
                                      <MenuItem
                                        disabled
                                        value={props.currentState?.title || ''}
                                        sx={{ fontSize: '12.8px !important' }}
                                      >
                                        {props.currentState?.title || 'Current'}
                                      </MenuItem>

                                      {props.selectedObjWf?.nextStates?.map((state) => (
                                        <MenuItem
                                          key={state.id}
                                          value={state.title}
                                          sx={{ fontSize: '12.8px !important' }}
                                        >
                                          <i className="mx-1 fas fa-long-arrow-alt-right text-primary" />
                                          {state.title || ''}
                                        </MenuItem>
                                      ))}
                                    </Select>

                                  ) : (
                                    <span style={{ color: '#333', marginLeft: '0.5rem' }}>
                                      {props.currentState?.title || ''}
                                    </span>
                                  )}
                                </p>
                              </>
                            ) : (
                              <>
                                {/* Assign New Workflow */}
                                {props.workflows?.length > 0 && (
                                  <p className="my-1">
                                    {props.newWF && (
                                      <i
                                        className="fa-solid fa-arrows-spin mx-2"
                                        style={{ color: THEME_COLORS.primary }}
                                      />
                                    )}
                                    <Select
                                      value={props.newWF?.workflowId || ''}
                                      onChange={handleWFChangeEmpty}
                                      size="small"
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected)
                                          return (
                                            <span style={{ color: '#333' }}>
                                              <i className="fa-solid fa-arrows-spin mx-2" />
                                              Assign a workflow?
                                            </span>
                                          );
                                        const wf = props.workflows.find(
                                          (w) => w.workflowId === selected
                                        );
                                        return wf?.workflowName || '';
                                      }}
                                      sx={{
                                        fontSize: '12.8px !important',
                                        height: '24px',
                                      }}
                                      MenuProps={{
                                        PaperProps: { style: { maxHeight: 300 } },
                                        MenuListProps: { style: { paddingTop: 0 } },
                                      }}
                                    >
                                      <MenuItem
                                        disabled
                                        value=""
                                        className="shadow-sm"
                                        style={{
                                          color: THEME_COLORS.primary,
                                          fontSize: '12.8px',
                                          position: 'sticky',
                                          top: 0,
                                          background: '#fff',
                                          zIndex: 1,
                                          opacity: 0.9,
                                        }}
                                      >
                                        <span>Select workflow</span>
                                      </MenuItem>

                                      {props.workflows.map((wf) => (
                                        <MenuItem
                                          key={wf.workflowId}
                                          value={wf.workflowId}
                                          sx={{ fontSize: '12.8px !important' }}
                                        >
                                          {wf.workflowName || ''}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </p>
                                )}

                                {/* Select Workflow State */}
                                {props.newWF && (
                                  <p className="my-1">
                                    <i className="fas fa-square-full text-warning mx-2" />
                                    <Select
                                      value={props.newWFState?.stateId || ''}
                                      onChange={handleStateChangeNew}
                                      displayEmpty
                                      renderValue={(selected) => {
                                        if (!selected)
                                          return (
                                            <span style={{ color: '#555b6e' }}>
                                              Please select a state
                                            </span>
                                          );
                                        const state = props.newWF.states.find(
                                          (s) => s.stateId === selected
                                        );
                                        return state?.stateName || '';
                                      }}
                                      size="small"
                                      sx={{
                                        fontSize: '12.8px !important',
                                        height: '24px',
                                      }}
                                    >
                                      <MenuItem
                                        disabled
                                        value=""
                                        className="shadow-sm"
                                        style={{
                                          color: THEME_COLORS.primary,
                                          fontSize: '12.8px',
                                          position: 'sticky',
                                          top: 0,
                                          background: '#fff',
                                          zIndex: 1,
                                          opacity: 0.9,
                                        }}
                                      >
                                        Select state
                                      </MenuItem>

                                      {props.newWF.states.map((state) => (
                                        <MenuItem
                                          key={state.stateId}
                                          value={state.stateId}
                                          sx={{ fontSize: '12.8px !important' }}
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
                    )}
                  </Box>

                  {/* Right Section — Action Buttons */}
                  {(Object.keys(props.formValues || {}).length > 0 ||
                    props.selectedState?.title ||
                    // props.newWF || props.changedClass ||
                    props.newWF ||
                    (props.approvalPayload && Object.keys(props.approvalPayload).length > 0)) && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          className="rounded-pill"
                          size="large"
                          variant="contained"
                          color="primary"
                          onClick={props.updateObjectMetadata}
                          disabled={props.isUpdatingMetadata}
                          sx={{ textTransform: 'none' }}
                        >
                          {props.isUpdatingMetadata ? (
                            <>
                              <CircularProgress size={12.8} color="inherit" sx={{ mr: 0.5 }} />
                              <small>Saving...</small>
                            </>
                          ) : (
                            <small>Save</small>
                          )}
                        </Button>

                        <Button
                          className="rounded-pill"
                          size="large"
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            props.discardChange();
                            props.setCheckedItems({});
                            props.setClassUpdatePayload({});
                            props.setChangedClass(false);
                          }}
                          disabled={props.isUpdatingMetadata}
                          sx={{ textTransform: 'none' }}
                        >
                          <small>Discard</small>
                        </Button>
                      </Box>
                    )}
                </Box>

                <AutomaticPermissionsButton permissions={props.selectedObject} />



              </Box>
            )}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1} style={{ backgroundColor: '#fff', padding: '0%', width: '100%' }}>
            {props.blob && !props.loadingfile ? (
              <DynamicFileViewer
                blob={props.blob}
                blobReport={props.blobReport}
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
                <i className="fas fa-tv my-2" style={{ fontSize: '120px', color: THEME_COLORS.primary }} />
                {props.loadingfile ? (
                  <>
                    <Typography component="div" variant="body2" className='my-2 loading-spinner' sx={{ textAlign: 'center' }}>
                      <div className="loading-indicator-text text-dark">
                        <CircularProgress size="20px" style={{ color: THEME_COLORS.primary, marginRight: '10px' }} />  Buffering file<span>.</span><span>.</span><span>.</span>
                      </div>
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
                      Please wait as we load the file content
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                      Nothing to Preview
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
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
                {/* <i className="fa-brands fa-android my-2" style={{ fontSize: '120px', color: THEME_COLORS.primary }} /> */}
                <AnimatedAndroidIcon />
                {props.loadingfile ? (
                  <>
                    <Typography component="div" variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                      <div className="loading-indicator text-dark">
                        <CircularProgress size="20px" style={{ color: THEME_COLORS.primary, marginRight: '10px' }} />  Starting chat<span>.</span><span>.</span><span>.</span>
                      </div>
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
                      Please wait as we load the resources
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                      No document

                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
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
                  <i className="fas fa-comment-alt my-2" style={{ fontSize: '120px', color: THEME_COLORS.primary }} />
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                    {props.loadingcomments ? (
                      <div className="loading-indicator text-dark">
                        <CircularProgress size="20px" style={{ color: THEME_COLORS.primary, marginRight: '10px' }} />  Loading comments <span>.</span><span>.</span><span>.</span>
                      </div>
                    ) : (
                      <>
                        <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>
                          No Comments Yet
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12.8px' }}>
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