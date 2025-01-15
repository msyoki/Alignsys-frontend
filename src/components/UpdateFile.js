// FileUploadModal.js

import { useState } from 'react';
import { Modal, ModalOverlay,  ModalFooter, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import axios from 'axios';
import Loader from './Loaders/LoaderMini';
import * as constants from './Auth/configs'



const baseurldata=constants.mfiles_api


const FileUploadModal = ({ isOpen, onClose ,selectedFile,refreshUpdate,setOpenAlert,setAlertSeverity,setAlertMsg}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setLoading(true)
    try {
      const formData = new FormData();
      formData.append('formFile', file);
    //   formData.append('ObjectID', objectId);
    //   formData.append('InternalID', internalId);
    //   formData.append('ClassID', classId);

      await axios.put(`${baseurldata}/api/RequisitionDocs/PutDoc?ObjectID=0&InternalID=${selectedFile.internalID}&ClassID=${selectedFile.classID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false)
      onClose()
      setOpenAlert(true);
      setAlertMsg('File updated sucecssfully!');
      setAlertSeverity('success');
      setTimeout(() => setOpenAlert(false), 3000);
      refreshUpdate()


      // Handle success or any other logic after successful upload
      console.log('File uploaded successfully');
      onClose();
    } catch (error) {
      // Handle error
      setLoading(false)
      if (error.response && error.response.status === 401) {
       
        setOpenAlert(true);
        setAlertMsg('401: Not authorized to update this file!');
        setAlertSeverity('error');
        setTimeout(() => setOpenAlert(false), 3000);
      } else {
        setOpenAlert(true);
        setAlertMsg('Error uploading file: ' + error.message);
        setAlertSeverity('error');
        setTimeout(() => setOpenAlert(false), 3000);
      }
      // console.error('Error uploading file', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
     
        <ModalHeader className='text-center' style={{color:"#ffff",backgroundColor:"#2364aa",fontSize:"14px"}}><i className="fas fa-paperclip mx-2" style={{fontSize:'15px'}}></i>Update File </ModalHeader>
        <ModalBody>
          {loading?
          
          <Loader />:
          <>
           <FormControl style={{fontSize:'13px'}}> 
              <div className='my-2  row'>
                  <div className="col-4 d-flex justify-content-end">
                    <label isRequired={true} className="my-1">M-Files Internal ID : </label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                  {selectedFile.internalID}
                  </div>
                  <div className="col-1 "> </div>
                </div>
                <div className='my-2  row'>
                  <div className="col-4 d-flex justify-content-end">
                    <label isRequired={true} className="my-1">M-Files Class ID :</label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                  {selectedFile.classID}
                  </div>
                  <div className="col-1 "> </div>
                </div>
              <div className='my-2  row'>
                  <div className="col-4 d-flex justify-content-end">
                    <label isRequired={true} className="my-1">Title :</label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                    {selectedFile.title}
                  </div>
                  <div className="col-1 "> </div>
              </div>

              <div>
                <div className='my-2  row'>
                  <div className="col-4 d-flex justify-content-end">
                    <label isRequired={true} className="my-1">Attachment :</label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                    <input required type="file" accept=".pdf" name="file" onChange={handleFileChange} className="form-control form control-sm" />
                  </div>
                  <div className="col-1 "> </div>
                </div>

              </div>
              <ModalFooter className="d-flex justify-content-center my-3">
              <Button onClick={handleUpload} size="sm"   style={{backgroundColor:'#2a68af',fontSize:'13px',color:'#fff'}} className='mx-2' > <i className="fas fa-exchange-alt mx-2"></i> 
                Upload 
              </Button>
           
              <Button size="sm"  onClick={() => onClose()}  style={{backgroundColor:'#ffba08',fontSize:'13px'}} className='mx-2' > <i class="fas fa-file-upload mx-2"></i> Cancel</Button>
              </ModalFooter>
            </FormControl>
          </>
          }
         
         
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FileUploadModal;
