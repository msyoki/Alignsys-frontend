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
    <Box sx={{ display: 'flex' }} >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh',backgroundColor: '#e5e5e5' }} className='shadow-lg'>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderColor: 'divider', marginTop: '100%' }}
          className='bg-white'
        >
          <Tab label="Metadata" {...a11yProps(0)} />
          <Tab label="Preview" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <Box sx={{ flexGrow: 1 }} >
        <CustomTabPanel value={value} index={0} style={{ backgroundColor: '#e5e5e5', height: '100vh' }}>
          {props.previewObjectProps.length < 1 && (
            <Box sx={{ width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
              <i className="fas fa-tag" style={{ fontSize: '120px', color: '#1d3557' }}></i>
              {props.loadingobject ? <>
                <Box sx={{ width: '50%' }} className="my-2">
                  <LinearProgress />
                </Box>
                <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Loading metadata...</Typography>
              </> : <> <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Metadata Card</Typography></>}

              <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '11px' }}>
                Select an object to view its metadata
              </Typography>
            </Box>
          )}
          {props.previewObjectProps.length > 0 && (
            <Box>
              <Box sx={{ mt: 2 }} className="my-1" display="flex" justifyContent="space-between">
                <Box sx={{ width: '60%', mb: 1, display: 'flex', alignItems: 'center' }}>
                  {Object.keys(props.formValues || {}).length > 0 && (
                    <Box>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => console.log(props.transformFormValues())}
                        sx={{ textTransform: 'none', mr: 1 }}
                      >
                        <i className="fas fa-save" style={{ fontSize: '11px', cursor: 'pointer', marginRight: '4px' }}></i>
                        <small>Save</small>
                      </Button>
                    </Box>
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

                <Box sx={{ textAlign: 'end', fontSize: '12px', width: '40%' }}>
                  <p className='my-0'>Created: {getPropValue('Created')}</p>
                  <p className='my-0'>Last modified: {getPropValue('Last modified')}</p>
                </Box>
              </Box>
           
              <Box sx={{ width: '100%', height: '80vh', overflowY: 'scroll' }} className='shadow-lg bg-white '>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }} className="my-3">
                  <Typography variant="body2" sx={{ color: '#1d3557', fontWeight: 'bold', flexBasis: '30%', fontSize: '14px', textAlign: 'end' }}>
                    Class:
                  </Typography>
                  <Box sx={{ flexBasis: '70%', fontSize: '14px', textAlign: 'start', ml: 1 }}>
                    {getPropValue('Class')}
                  </Box>
                </Box>

                <List sx={{ p: 0 }}>
                  {filteredProps.map((item, index) => (
                    <ListItem key={index} sx={{ p: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>

                        <Typography variant="body2" sx={{ color: '#1d3557', fontWeight: 'bold', flexBasis: '30%', fontSize: '12px', textAlign: 'end' }}>
                          {item.propName}:
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

                          {item.datatype === 'MFDatatypeMultiLineText' && (
                            <textarea
                              placeholder={item.value}
                              value={props.formValues?.[item.id]?.value || ''}
                              onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                              rows={2}
                              className='form-control form-control-sm my-1'
                            />
                          )}

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
                            <div>
                              <Select
                                size='small'
                                value={props.formValues?.[item.id]?.value ?? (item.value === "Yes" ? true : (item.value === "No" ? false : ''))}
                                onChange={(e) => handleInputChange(item.id, e.target.value, item.datatype)}
                                displayEmpty
                                fullWidth
                              >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value={true}>True</MenuItem>
                                <MenuItem value={false}>False</MenuItem>
                              </Select>
                            </div>
                          )}

                          {item.datatype === 'MFDatatypeMultiSelectLookup' && (
                            <LookupMultiSelect
                              propId={item.id}
                              onChange={(id, newValues) => handleInputChange(id, newValues, item.datatype)}
                              value={props.formValues?.[item.id]?.value || []}  // Ensure `value` is an array for multi-select
                              selectedVault={props.vault}
                              label={item.propName}
                              className='my-1'
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
                              className='my-1'
                              itemValue={item.value}
                            />
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1} style={{ backgroundColor: '#e5e5e5', height: '100vh' }}>
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
              <i className="fas fa-tv" style={{ fontSize: '120px', color: '#1d3557' }}></i>

              {props.loadingfile ? <>
                <Box sx={{ width: '50%' }} className="my-2">
                  <LinearProgress />
                </Box>
                <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Loading file...</Typography>
              </> : <> <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Nothing to Preview</Typography></>}
              <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '11px' }}>
                Select a document to view its content
              </Typography>
            </Box>
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
