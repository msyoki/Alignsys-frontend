import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import MiniLoader from './Modals/MiniLoader';
import DynamicFileViewer from './DynamicFileViewer';
import DynamicFileViewer2 from './DynamicFileViewer2';
import LoadingMini from './Loaders/LoaderMini';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;



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

export default function ObjectView(props) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const filteredProps = props.previewObjectProps.filter(
    item => item.propName !== 'Last modified by' &&
      item.propName !== 'Last modified' &&
      item.propName !== 'Created' &&
      item.propName !== 'Created by' &&
      item.propName !== 'Accessed by me'
  );

  return (
    <Box sx={{ width: '100%' }} >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Metadata" {...a11yProps(0)} />
          <Tab label="Preview" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel className='shadow-lg' value={value} index={0} style={{ height: '80vh', overflowY: 'scroll' }}>
        {/* <div className='container' >
          {props.loadingPreviewObject ? (
            <MiniLoader loading={props.loadingPreviewObject} loaderMsg={'Loading...'} />
          ) : (
            <>
            {filteredProps ?
              filteredProps && (
                <List>
                  {filteredProps.map((item, index) => (
                    <ListItem className='p-0' key={index} style={{ fontSize: '12px' }}>
                      <div className="row w-100">
                        <span className="col-4 d-flex justify-content-end">
                          <label><b>{item.propName}</b></label>
                        </span>
                        <span className="col-8 d-flex justify-content-start">
                          <p>: {item.value}</p>
                        </span>
                      </div>
                    </ListItem>
                  ))}
                </List>
              )
           :
           <div className="d-flex justify-content-center align-items-center text-dark" style={{ width: "50%", height: "50%", position: "relative", top: "25%", left: "25%" }}>
             <div>
               <p className="text-center">
                 <i className="fas fa-tv mt-4" style={{ fontSize: "100px" ,color:'#1d3557'}}></i>
               </p>
               <p className="text-center">Nothing to Preview</p>
               <p className="text-center" style={{fontSize:'11px'}}>Select a document to view its content</p>

             </div>
           </div>
         }
         </>
            

          
          )}
        </div> */}
        <div className='container'>
      {props.loadingPreviewObject ? (
        <MiniLoader loading={props.loadingPreviewObject} loaderMsg={'Loading...'} />
      ) : (
        <>
          {filteredProps && filteredProps.length > 0 ? (
            <List>
              {filteredProps.map((item, index) => (
                <ListItem className='p-0' key={index} style={{ fontSize: '12px' }}>
                  <div className="row w-100">
                    <span className="col-4 d-flex justify-content-end">
                      <label><b>{item.propName}</b></label>
                    </span>
                    <span className="col-8 d-flex justify-content-start">
                      <p>: {item.value}</p>
                    </span>
                  </div>
                </ListItem>
              ))}
            </List>
          ) : (
            <div className="d-flex justify-content-center align-items-center text-dark" style={{ width: "50%", height: "50%", position: "relative", top: "25%", left: "25%" }}>
              <div>
                <p className="text-center">
                  <i className="fas fa-tag mt-4" style={{ fontSize: "80px", color: '#1d3557' }}></i>
                </p>
                <p className="text-center">Metadata Card</p>
                <p className="text-center" style={{ fontSize: '11px' }}>Select an object to view its metadata</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  
      </CustomTabPanel>
      <CustomTabPanel className='shadow-lg' value={value} index={1} style={{ height: '80vh', overflow: 'scroll' }}>
        {/* <DynamicFileViewer extension={props.extension} base64={props.base64}/> */}

        {props.loadingfiles ?
          <LoadingMini /> :
          <>
            {props.base64 ?
              <DynamicFileViewer2 base64Content={props.base64} fileExtension={props.extension} />
              :
              <div className="d-flex justify-content-center align-items-center text-dark" style={{ width: "50%", height: "50%", position: "relative", top: "25%", left: "25%" }}>
                <div>
                  <p className="text-center">
                    <i className="fas fa-tv mt-4" style={{ fontSize: "80px" ,color:'#1d3557'}}></i>
                  </p>
                  <p className="text-center">Nothing to Preview</p>
                  <p className="text-center" style={{fontSize:'11px'}}>Select a document to view its content</p>

                </div>
              </div>
            }
          </>

        }

      </CustomTabPanel>
    </Box>
  );
}

