import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from '@chakra-ui/react';
import axios from 'axios';
import Loader from './Loaders/LoaderMini';

const FileInputModal = (props) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);


  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdate = () => {
    // onUpdate(selectedFile);
    setSelectedFile(null);
    props.onClose(); // Close the modal after updating
  };

  const updateFile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('formFile', selectedFile); // Append the actual file, not its value
 
    let url=''
    if(props.document.docClass === 'Procurement Documents'){
      url= `http://192.236.154.69:320/api/ProcurementDocs/${props.document.objectID}/${props.document.fileID}`
    }else{
      url= `http://192.236.154.69:320/api/SupplierDocs/${props.document.objectID}/${props.document.fileID}`
    }
    console.log(props.document.objectID)
    console.log(props.document.fileID)
    try {
      const response = await axios.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Set the correct content type
      },
    });
      
      props.handleSearch()
      props.onClose(false)
      console.log(JSON.stringify(response.data));
      // You can perform further actions here upon successful upload

      setLoading(false); // Reset loading state
      alert('File updated successfully')
   
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with a status code
        console.error('Response data:', JSON.stringify(error.response.data));
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received. Request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an error
        console.error('Error:', error.message);
      }
      setLoading(false); // Reset loading state
    }
  }


  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <form  onSubmit={updateFile}>
            <ModalHeader>Update Document</ModalHeader>
            <ModalBody className='text-center'>
                <small>
                    <p><b>Requisition</b> #{props.reqId}</p>
                    <p><b>File Class:</b> {props.document.docClass}</p>
                    <p><b>Document:</b> {props.document.documentType}.{props.document.documentExtension}</p>
                    <p><b>Object ID</b> # {props.document.objectID}</p>
                    <p><b>File Id</b> #{props.document.fileID}</p>
                    
                </small>
            {loading?<Loader/>:
            <>
                <Input
                    size='sm'
                    type="file"
                    onChange={handleFileSelect}
                    className="form-control form-control-sm"
                />
                <div className='my-4'>
                    <button type='submit' size='sm' className='btn btn-primary btn-sm mx-2' >
                        Update
                    </button>
                    <Button size='sm' colorScheme="red"  className='mx-2' onClick={props.onClose}>
                        Cancel
                    </Button>
                </div>
                
            </>
            }
          
            </ModalBody>
     
        </form>
      </ModalContent>
    </Modal>
  );
};

export default FileInputModal;
