import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select as MuiSelect,
  MenuItem,
  Typography,
  Modal as MuiModal,
  Backdrop,
  Fade,
} from "@mui/material";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, CircularProgress, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faHandPointer, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Select from 'react-select';
import Loader from "./Loaders/LoaderMini";
import logo from '../images/ZF.png'
import FileUploadComponent from "./FileUpload";

const baseurl = "http://41.89.92.225:5006";
const baseurldata = "http://41.92.225.149:240";
const baseurldss = "http://41.92.225.149";

function NewFileFormModal(props) {
  let [isOpen, setIsOpen] = useState(false);
  let [loading, setLoading] = useState(false);
  let [selectedClass, setSelecctedClass] = useState(null);
  let [file, setFile] = useState(null); // Initialize with null
  let [selectedClassProps, setSelectedClassProps] = useState([]);
  const [classformData, setFormData] = useState([]);
  let [defaultreq, setDefaultReq] = useState({});
  const [fileUploadError, setFileUploadError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const classprop = selectedClassProps.find(item => item.propName === name);

    if (classprop) {
      const hasMatchingClassProp = classformData.some(obj => obj.id === classprop.id);

      if (hasMatchingClassProp) {
        setFormData(prevFormData => prevFormData.map(item => {
          if (item.id === classprop.id) {
            return { ...item, propValue: value };
          }
          return item;
        }));
      } else {
        setFormData(prevFormData => [
          ...prevFormData,
          { id: classprop.id, propValue: value }
        ]);
      }
    }
  };

  const handleInputChange2 = (name, value) => {
    const classprop = selectedClassProps.find(item => item.propName === name);

    if (classprop) {
      const hasMatchingClassProp = classformData.some(obj => obj.id === classprop.id);

      if (hasMatchingClassProp) {
        setFormData(prevFormData => prevFormData.map(item => {
          if (item.id === classprop.id) {
            return { ...item, propValue: value };
          }
          return item;
        }));
      } else {
        setFormData(prevFormData => [
          ...prevFormData,
          { id: classprop.id, propValue: `${value}` }
        ]);
      }
    }
  };

  function handleChange(file) {
    if(file){
      setFileUploadError('')
    }
    setFile(file)
  }

  let getClassPorps = async (selectedOption) => {
    setFormData([]);
    setSelectedClassProps([]);
    setSelecctedClass(selectedOption.value);

    try {
      let response = await axios.get(`${baseurldata}/api/Requisition/${selectedOption.value}`);
      setSelectedClassProps(response.data);
      handleInputChange2("Purchase Requisition", "31");

      setDefaultReq({
        value: props.internalId,
        label: props.selectedObjTitle,
      });

      setFormData(prevFormData => [
        ...prevFormData,
        { id: 1193, propValue: props.internalId }
      ]);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleSearch2 = () => {
    setLoading(true);
    props.getRequisition(props.searchTerm).then((data) => {
      setLoading(false);
      props.setData(data);
    });
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('formFile', file);

    try {
      const response = await axios.post(`${baseurldata}/api/RequisitionDocs/PostDoc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      let postData = JSON.stringify({
        "classID": selectedClass,
        "filepath": response.data.filepath,
        "properties": classformData,
        "payrolNumber": props.user.staffNumber
      });

      try {
        const response = await axios.post(`${baseurldata}/api/RequisitionDocs`, postData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        setIsOpen(false);
        setLoading(false);
        props.setOpenAlert(true);
        props.setAlertMsg('File uploaded successfully!');
        props.setAlertSeverity('success');
        setTimeout(() => props.setOpenAlert(false), 3000);
        setFormData([]);
      } catch (error) {
        setLoading(false);
        handleErrorResponse(error);
      }
    } catch (error) {
      setLoading(false);
      handleErrorResponse(error);
    }
  };

  const handleErrorResponse = (error) => {
    if (error.response) {
      props.setOpenAlert(true);
      props.setAlertMsg('Response data: ' + JSON.stringify(error.response.data));
      props.setAlertSeverity('error');
    } else if (error.request) {
      props.setOpenAlert(true);
      props.setAlertMsg('No response received. Request: ' + error.request);
      props.setAlertSeverity('error');
    } else {
      props.setOpenAlert(true);
      props.setAlertMsg('Error: ' + error.message);
      props.setAlertSeverity('error');
    }
    setTimeout(() => props.setOpenAlert(false), 3000);
    setFormData([]);
  };

  return (
    <Box>
      <li className='d-flex justify-content-end' style={{ listStyle: 'none', fontSize: '10px', cursor: 'pointer' }} onClick={() => {
        setIsOpen(true);
        setSelectedClassProps([]);
      }}>
        <p><i className="fas fa-paperclip mx-2"></i>Attach New Document</p>
      </li>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
        <DialogTitle className='p-2' style={{ backgroundColor: '#293241', color: '#fff', fontSize: '15px' }}>
          <img src={logo} alt="logo" style={{ width: '5%' }} className='mx-2' />

          <i className="fas fa-paperclip mx-2"></i>Upload New File

        </DialogTitle>
        <DialogContent >
          {loading ? <Loader /> : (
            <form onSubmit={uploadFile} style={{ fontSize: '11px', fontWeight: 'bold' }}>
              <FormControl fullWidth margin="normal">
                <FormLabel>Document Type</FormLabel>
                <Select
                  isSearchable
                  required
                  name="class"
                  id="class"
                  placeholder="Select Doctype"
                  onChange={(selectedOption) => getClassPorps(selectedOption)}
                  options={props.docClasses.map((item) => ({
                    value: item.id,
                    label: item.className,
                  }))}
                />
              </FormControl>

              {selectedClassProps && selectedClassProps.map((classprop, index) => (
                <FormControl fullWidth margin="normal" key={index}>
                  <FormLabel>{classprop.propName}</FormLabel>
                  {classprop.dataType === 'MFDatatypeText' && (
                    <TextField
                      type="text"
                      name={classprop.propName}
                      value={classformData[classprop.propName]}
                      onChange={handleInputChange}
                      required={classprop.isRequired}
                      fullWidth
                    />
                  )}
                  {classprop.dataType === 'MFDatatypeMultiLineText' && (
                    <TextField
                      type="text"
                      name={classprop.propName}
                      value={classformData[classprop.propName]}
                      onChange={handleInputChange}
                      required={classprop.isRequired}
                      multiline
                      rows={4}
                      fullWidth
                    />
                  )}
                  {classprop.dataType === 'MFDatatypeDate' && (
                    <TextField
                      type="date"
                      name={classprop.propName}
                      value={classformData[classprop.propName]}
                      onChange={handleInputChange}
                      required={classprop.isRequired}
                      fullWidth
                    />
                  )}
                  {(classprop.dataType === 'MFDatatypeLookup' || classprop.dataType === 'MFDatatypeMultiSelectLookup') && (
                    <Select
                      isSearchable
                      required={classprop.isRequired}
                      name={classprop.propName}
                      onChange={(selectedOption) => handleInputChange2(classprop.propName, selectedOption.value)}
                      placeholder={`Select ${classprop.propName}`}
                      options={classprop.valueList.map((item) => ({
                        value: item.id,
                        label: item.title,
                      }))}
                      defaultValue={classprop.id === 1193 ? defaultreq : ''}
                    />
                  )}
                </FormControl>
              ))}

              {/* <FormControl fullWidth margin="normal">
                  <FormLabel>File</FormLabel>
                  <Input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </FormControl> */}
              <div>
                <FileUploadComponent handleFileChange={handleChange} uploadedFile={file} />
                {fileUploadError && (
                  <div style={{ color: '#CC3333', fontSize: '12px' }}>{fileUploadError}</div>
                )}
              </div>


            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default NewFileFormModal;
