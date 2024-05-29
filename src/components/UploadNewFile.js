import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import axios from 'axios';
import Loader from "./Loaders/LoaderMini";
import Select from 'react-select';


const baseurl="http://41.89.92.225:5006" 
const baseurldata="http://41.92.225.149:240"
const baseurldss="http://41.92.225.149"

function NewFileFormModal(props) {
  let [isOpen, setIsOpen] = useState(false);
  let [loading, setLoading] = useState(false);
  let [selectedClass, setSelecctedClass] = useState(null);
  let [file, setFile] = useState(null); // Initialize with null
  let [selectedClassProps, setSelectedClassProps] = useState([])
  const [classformData, setFormData] = useState([]);
  let [defaultreq, setDefaultReq] = useState({})



  // Update the formData object when an input value changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Find the classprop with the same name
    const classprop = selectedClassProps.find(item => item.propName === name);

    if (classprop) {
      const hasMatchingClassProp = classformData.some(obj => obj.id === classprop.id);

      if (hasMatchingClassProp) {
        // If a matching classprop is found, update the formData with its id
        setFormData(prevFormData => prevFormData.map(item => {
          if (item.id === classprop.id) {
            return { ...item, propValue: value };
          }
          return item;
        }));
      } else {
        // If a matching classprop is not found, add a new object to formData
        setFormData(prevFormData => [
          ...prevFormData,
          { id: classprop.id, propValue: value }
        ]);
      }
    }
  };
  // Update the formData object when an input value changes
  const handleInputChange2 = (name, value) => {
    // Find the classprop with the same name

    const classprop = selectedClassProps.find(item => item.propName === name);

    if (classprop) {
      const hasMatchingClassProp = classformData.some(obj => obj.id === classprop.id);

      if (hasMatchingClassProp) {
        // If a matching classprop is found, update the formData with its id
        setFormData(prevFormData => prevFormData.map(item => {
          if (item.id === classprop.id) {
            return { ...item, propValue: value };
          }
          return item;
        }));
      } else {
        // If a matching classprop is not found, add a new object to formData
        setFormData(prevFormData => [
          ...prevFormData,
          { id: classprop.id, propValue: `${value}` }
        ]);
      }
    }
  };







  function handleChange(e) {
    setFile(e.target.files[0])
  }

  let getClassPorps = async (selectedOption) => {
   

    setFormData([])
    setSelectedClassProps([])
    // console.log(selectedOption.value)
    setSelecctedClass(selectedOption.value)
    try {

      let response = await axios.get(`${baseurldata}/api/Requisition/${selectedOption.value}`)
      setSelectedClassProps(response.data)
      handleInputChange2("Purchase Requisition", "31"); 
     
      setDefaultReq({
        value: props.internalId,
        label: props.selectedObjTitle,
      })
      setFormData(prevFormData => [
        ...prevFormData,
        { id: 1193, propValue: props.internalId }
      ]);
    


    }
    catch (error) {
      console.error('Error:', error.message);
    }


  }

  const handleSearch2 = () => {
    setLoading(true)
    // Trigger a search for documents based on 'searchTerm'
    props.getRequisition(props.searchTerm).then((data) => {
      setLoading(false)
      props.setData(data);
    });
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('formFile', file); // Append the actual file, not its value
    
    

    try {
      const response = await axios.post(`${baseurldata}/api/RequisitionDocs/PostDoc`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the correct content type
        },
      });

      // setIsOpen(false)
      // console.log(JSON.stringify(response.data));
      let postData = JSON.stringify({
        "classID": selectedClass,
        "filepath": response.data.filepath,
        "properties": classformData,
        "payrolNumber": props.user.staffNumber
      })
      console.log(JSON.stringify(postData));
      try {
        const response = await axios.post(`${baseurldata}/api/RequisitionDocs`, postData, {
          headers: {
            'Content-Type': 'application/json', // Set the correct content type
          },
        });
       
        setIsOpen(false)
        // console.log(JSON.stringify(response.data));
        setLoading(false); // Reset loading state
        props.setOpenAlert(true);
        props.setAlertMsg('File uploaded successfully!');
        props.setAlertSeverity('success');
        setTimeout(() => props.setOpenAlert(false), 3000);
        setFormData([])

      } catch (error) {
        setLoading(false); // Reset loading state
        if (error.response) {
          // The request was made, and the server responded with a status code
          alert('Response data: ' + JSON.stringify(error.response.data));
        } else if (error.request) {
          // The request was made but no response was received
          alert('No response received. Request: ' + error.request);
        } else {
          // Something happened in setting up the request that triggered an error
          alert('Error: ' + error.message);
        }


      }
    } catch (error) {
      setLoading(false); // Reset loading state
      if (error.response) {
        // The request was made, and the server responded with a status code
        props.setOpenAlert(true);
        props.setAlertMsg('Response data: ' + JSON.stringify(error.response.data));
        props.setAlertSeverity('error');
        setTimeout(() => props.setOpenAlert(false), 3000);
        setFormData([])
      } else if (error.request) {
        // The request was made but no response was received
      
        props.setOpenAlert(true);
        props.setAlertMsg('No response received. Request: ' + error.request);
        props.setAlertSeverity('error');
        setTimeout(() => props.setOpenAlert(false), 3000);
        setFormData([])
      } else {
        // Something happened in setting up the request that triggered an error
       
        props.setOpenAlert(true);
        props.setAlertMsg('Error: ' + error.message);
        props.setAlertSeverity('error');
        setTimeout(() => props.setOpenAlert(false), 3000);
        setFormData([])
      }


    }
  }

  return (
    <Box>
      <li className='d-flex justify-content-end' style={{listStyle:'none'}} onClick={() => {
        setIsOpen(true); 
        setSelectedClassProps([])
      
      }}><a href="#attach_document"><i className="fas fa-paperclip mx-2" style={{ fontSize: '15px' }}></i>Attach New Document</a></li>
   
      {/* <button className='my-2 btn btn-primary btn-sm' style={{ fontSize: '12.5px' }} onClick={() => setIsOpen(true)} ><i className="fas fa-paperclip mx-2" ></i>Attach Document</button> */}
      <Modal isOpen={isOpen} isCentered size="lg">
        <ModalOverlay />


        <ModalContent >
          <ModalHeader className='text-center' style={{ color: "#ffff", backgroundColor: "#2364aa", fontSize: "15px" }}><i className="fas fa-paperclip mx-2" style={{ fontSize: '15px' }}></i>Upload New File</ModalHeader>

          {/* <ModalHeader></ModalHeader> */}




          {loading ? <Loader /> : (
            <form onSubmit={uploadFile} style={{ fontSize: '11px' ,fontWeight:'bold'}} className="p-4 ">
              <div>
                <div className='my-1  row'>
                  <div className="col-4 d-flex justify-content-end">
                    <label className="my-1">Document Type : </label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                    {/* <Select name="class" placeholder=" Select Doctype" id="class" onChange={getClassPorps} className='form-control form-control-sm' value={selectedClass}>
                {props.docClasses.map((item, index) =>
                  <option key={index} value={item.id}>{item.className}</option>
                )}
            </Select> */}
                    <Select
                      isSearchable
                      required
                      name="class"
                      id="class"
                      placeholder={`Select Doctype`}
                      onChange={(selectedOption) => getClassPorps(selectedOption)}
                      className='form-control form-control-sm'
                      options={props.docClasses.map((item) => ({
                        value: item.id,
                        label: item.className,
                      }))}
                    />
                  </div>
                  <div className="col-1 "> </div>
                </div>
              </div>


              {selectedClassProps &&
                selectedClassProps.map((classprop, index) => {
                  return (
                    <div key={index}>
                      {classprop.dataType === 'MFDatatypeText' ?
                        <div className="row my-1">
                          <div className="col-4 d-flex justify-content-end">
                            <label isRequired={classprop.isRequired} htmlFor={classprop.propName}>{classprop.propName} : </label>
                          </div>
                          <div className="col-7 d-flex justify-content-start">
                            <input
                              type="text"
                              name={classprop.propName}
                              className="form-control form-control-sm"
                              value={classformData[classprop.propName]}
                              onChange={handleInputChange}
                              required={classprop.isRequired}

                            />
                          </div>
                          <div className="col-1 "> </div>
                        </div>
                        : <></>}
                      {classprop.dataType === 'MFDatatypeMultiLineText' ?
                        <div className="row my-1">
                          <div className="col-4 d-flex justify-content-end">
                            <label isRequired={classprop.isRequired} htmlFor={classprop.propName}>{classprop.propName} : </label>
                          </div>
                          <div className="col-7 d-flex justify-content-start">
                            <textarea
                              type="text"
                              name={classprop.propName}
                              className="form-control form-control-sm"
                              value={classformData[classprop.propName]}
                              onChange={handleInputChange}
                              required={classprop.isRequired}
                            />
                          </div>
                          <div className="col-1 "> </div>
                        </div>
                        : <></>}
                      {classprop.dataType === 'MFDatatypeDate' ?
                        <div className="row my-1">
                          <div className="col-4 d-flex justify-content-end">
                            <label isRequired={classprop.isRequired} htmlFor={classprop.propName}>{classprop.propName} : </label>
                          </div>
                          <div className="col-7 d-flex justify-content-start">
                            <input
                              type="date"
                              name={classprop.propName}
                              className="form-control form-control-sm"
                              value={classformData[classprop.propName]}
                              onChange={handleInputChange}
                              required={classprop.isRequired}
                            />
                          </div>
                          <div className="col-1 "> </div>
                        </div>
                        : <></>}
                      {classprop.dataType === 'MFDatatypeLookup' || classprop.dataType === 'MFDatatypeMultiSelectLookup' ?
                        <div className="row my-1">
                          <div className="col-4 d-flex justify-content-end">
                            <label isRequired={classprop.isRequired} htmlFor={classprop.propName}>
                              {classprop.propName} : 
                            </label>
                          </div>
                          <div className="col-7 d-flex justify-content-start">
                            {classprop.id === 1193 ?
                              <Select
                                isSearchable
                                required={classprop.isRequired}
                                name={classprop.propName}
                                onChange={(selectedOption) => handleInputChange2(classprop.propName, selectedOption.value)}
                                placeholder={`Select ${classprop.propName}`}
                                className='form-control form-control-sm my-2  '
                                options={classprop.valueList.map((item) => ({
                                  value: item.id,
                                  label: item.title,
                                }))}
                                defaultValue={defaultreq}

                              />
                              :
                              <Select
                                isSearchable
                                required={classprop.isRequired}
                                name={classprop.propName}
                                onChange={(selectedOption) => handleInputChange2(classprop.propName, selectedOption.value)}
                                placeholder={`Select ${classprop.propName}`}
                                className='form-control form-control-sm my-2  '
                                options={classprop.valueList.map((item) => ({
                                  value: item.id,
                                  label: item.title,
                                }))}


                              />
                            }     
                            {/* <select  name={classprop.propName} placeholder={`Select ${classprop.propName}`} onChange={handleInputChange} className='form-control form-control-sm my-2  ' >
                        {classprop.valueList.map((item, index) =>
                          <option key={index} value={item.id}>{item.title}</option>
                        )}
                      </select> */}
                          </div>
                          <div className="col-1 "> </div>
                        </div>
                        : <></>}
                      {classprop.dataType === 'MFDatatypeFloating' ?
                        <div className="row my-1">
                          <div className="col-4 d-flex justify-content-end">
                            <label isRequired={classprop.isRequired} htmlFor={classprop.propName}>{classprop.propName} : </label>
                          </div>
                          <div className="col-7 d-flex justify-content-start">
                            <input
                              type="number"
                              name={classprop.propName}
                              className="form-control form-control-sm "
                              value={classformData[classprop.propName]}
                              onChange={handleInputChange}
                              required={classprop.isRequired}
                            />
                          </div>
                          <div className="col-1 "> </div>
                        </div>
                        : <></>}


                    </div>
                  );
                })
              }
              <div>
                <div className='my-2  row'>
                  <div className="col-4 d-flex justify-content-end">
                    <label isRequired={true} className="my-1">Attachment : </label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                    <input required type="file" accept=".pdf" name="file" onChange={handleChange} className="form-control form control-sm" />
                  </div>
                  <div className="col-1 "> </div>
                </div>

              </div>



              <ModalFooter className="d-flex justify-content-center">
                <Button size="sm" type="submit"     style={{backgroundColor:'#2a68af',fontSize:'13px',color:'#fff'}} className='mx-2' > <i className="fas fa-file-upload mx-2"></i> Upload File</Button>
                <Button size="sm" colorScheme='yellow' className="mx-2" onClick={() => setIsOpen(false)} style={{backgroundColor:'#ffba08',fontSize:'13px'}}><i className="fas fa-times mx-2"></i>  Cancel</Button>
              </ModalFooter>
            </form>
         
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default NewFileFormModal;
