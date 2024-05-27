import React, { useState,useContext } from "react";
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
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { baseurldata } from "../Requests/api";
import axios from 'axios'
import Loader from "./LoaderMini";
import Authcontext from '../Context/AuthContext';
import Select from 'react-select';


function RequisitionFormModal(props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user ,departments} = useContext(Authcontext);
    // const [departments, setDepartments] = useState(() => JSON.parse(localStorage.getItem('departments')) || null);
    

    const register=async(e)=>{
        e.preventDefault();
        setLoading(true)
        let data = JSON.stringify({
          "subject": e.target.subject.value,
          "narrative": e.target.narrative.value,
          "payrolNumber":user.staffNumber,
          "department":e.target.department.value
        });
        console.log(data)

        let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${baseurldata}/api/Requisition/CreateRequisition`,
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
        };

        await axios.request(config)
        .then((response) => {
        setLoading(false)
        props.getRequisitionCreatedByMe()
        // console.log(JSON.stringify(response.data));
        props.setOpenAlert(true);
        props.setAlertMsg('Requisition created successfully!');
        props.setAlertSeverity('success');
        setTimeout(() => props.setOpenAlert(false), 3000);
       
        setIsOpen(false)
        })
        .catch((error) => {
        setLoading(false)
        alert(`${error}`)
        // console.log(error);
        });
    }
 



  return (
    <Box>
    <li className='my-1' onClick={() => setIsOpen(true)}>
      <a href="#">
        <i class="fas fa-plus mx-2" style={{fontSize:'15px'}}></i>Create Requisition
      </a>
    </li>
    <Modal isOpen={isOpen} isCentered size="md">
   
      <ModalOverlay />
     
      <ModalContent>
      <ModalHeader className='text-center' style={{color:"#ffff",backgroundColor:"#2364aa",fontSize:"14px"}}><i class="fas fa-folder mx-2" style={{fontSize:'15px'}}></i>Create Requisition</ModalHeader>
     
        {/* <p className="text-center my-3 " style={{fontSize:'15px'}}><i class="fas fa-folder mx-2" style={{fontSize:'15px'}}></i><b>Create Requisition</b></p> */}
        {loading ?
          <Loader/> :
          <form onSubmit={register}  style={{ fontSize: '12.5px' ,fontWeight:'bold'}}  className="my-2" >
            <ModalBody>
              <Stack spacing={4}>
                <div className="row my-1">
                  <div className="col-4 d-flex justify-content-end">
                    <label htmlFor="subject">Subject / Title : </label>  
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                    <input
                      type="text"
                      name="subject"
                      className="form-control form-control-md"
                      size="sm"
                      required
                    />
                  </div>
                </div>
                {departments &&
                  <div className="row my-1">
                    <div className="col-4 d-flex justify-content-end">
                      <label htmlFor="subject">Dept / Project : </label>
                    </div>
                    <div className="col-7 d-flex justify-content-start">
                      <Select
                        isSearchable
                        required
                        placeholder="Select Department"
                        name='department'
                        className='form-control form-control-sm my-2'
                        options={departments.map((dept) => ({
                          value: dept.deptID,
                          label: dept.deptName,
                        }))}
                      />
                    </div>
                  </div>
                }
                <div className="row my-1">
                  <div className="col-4 d-flex justify-content-end">
                    <label htmlFor="narrative">Narrative : </label>
                  </div>
                  <div className="col-7 d-flex justify-content-start">
                    <textarea
                      type="text"
                      name="narrative"
                      className="form-control form-control-md"
                      size="sm"
                      required
                    />
                  </div>
                </div>
              </Stack>
            </ModalBody>
            <ModalFooter className="d-flex justify-content-center">
              <Button size="sm" type="submit" className='mx-2' style={{backgroundColor:'#2a68af',fontSize:'13px',color:'#fff'}}> <i class="fas fa-plus-circle mx-2"></i>Create</Button>
              <Button size="sm" className="mx-2" style={{backgroundColor:'#ffba08',fontSize:'13px'}}  onClick={() => setIsOpen(false)}><i class="fas fa-times mx-2"></i>Cancel</Button>
            </ModalFooter>
          </form>
        }
      </ModalContent>
    </Modal>
  </Box>
  
  );
}

export default RequisitionFormModal;
