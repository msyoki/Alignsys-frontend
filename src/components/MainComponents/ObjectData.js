import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box, List, ListItem, Typography, Button } from '@mui/material';
import DynamicFileViewer from '../DynamicFileViewer';
import SignButton from '../SignDocument';
import axios from 'axios';
import * as constants from '../Auth/configs';

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
        <Box sx={{ p: 3 }}>
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

export default function ObjectData(props) {
  const [value, setValue] = React.useState(0);

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
    item => !['Last modified by', 'Last modified', 'Created', 'Created by', 'Accessed by me'].includes(item.propName)
  );

  const getPropValue = name => {
    const foundItem = props.previewObjectProps.find(item => item.propName === name);
    return foundItem ? foundItem.value : null;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Metadata" {...a11yProps(0)} />
          <Tab label="Preview" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} sx={{ height: '100vh', overflowY: 'scroll' }}>
        {props.previewObjectProps.length < 1 &&(
               <Box
               sx={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}
             >

               <i className="fas fa-tag" style={{ fontSize: '80px', color: '#1d3557' }}></i>
               <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Metadata Card</Typography>
               <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '11px' }}>
                 Select an object to view its metadata
               </Typography>
             </Box>
        )}
        {props.previewObjectProps.length > 0 && (
          <>
            <Box sx={{ mb: 2 }}>
              {props.selectedObject.objectID === 0 && props.extension === 'pdf' && (
                <Box sx={{ mb: 1 }}>
                  <SignButton objectid={props.selectedObject.id} fileId={props.selectedFileId} vault={props.vault.guid} email={props.email} />
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={downloadFile}
                    sx={{ textTransform: 'none', ml: 1 }}
                  >
                    <small>  <i className="fas fa-download" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Download</small>
                  </Button>
                </Box>
              )}
              <Box sx={{ textAlign: 'end', fontSize: '12px' }}>
                <p className='my-0'>Created: {getPropValue('Created')} </p>
                <p className='my-0'>Last modified: {getPropValue('Last modified')} </p>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',


              }}
            >


                <Box sx={{ width: '100%', maxWidth: 600 }}>
                  <List sx={{ p: 0 }}>
                    {filteredProps.map((item, index) => (
                      <ListItem className="p-0" key={index} sx={{}}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography variant="body2" sx={{ color: '#2a68af', fontWeight: 'bold', flexBasis: '30%', fontSize: '12px', textAlign: 'end' }}>{item.propName}</Typography>
                          <Typography variant="body2" className='mx-3' sx={{ flexBasis: '70%', fontSize: '12px', extAlign: 'start' }}>: {item.value}</Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              
            </Box>
          </>
        )}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1} sx={{ height: '100vh', width: '100%' }}>
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
            sx={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}
          >
            <i className="fas fa-tv" style={{ fontSize: '80px', color: '#1d3557' }}></i>
            <Typography variant="body2" className='my-2' sx={{ textAlign: 'center' }}>Nothing to Preview</Typography>
            <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '11px' }}>
              Select a document to view its content
            </Typography>
          </Box>
        )}
      </CustomTabPanel>
    </Box>
  );
}

ObjectData.propTypes = {
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
