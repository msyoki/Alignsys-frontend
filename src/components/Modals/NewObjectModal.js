import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';


import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Link } from "react-router-dom";
import Navbar from '../Navbar';
import ImageAvatars from '../Avatar';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import AccordionUsage from '../Accordion';
import logo from "../../images/ZF.png";
import axios from 'axios'
import { Grid, MenuItem, Select, Input, FormControl, InputAdornment, InputLabel } from '@mui/material';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

function ChildModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Button onClick={handleOpen}>Open Child Modal</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
            >
                <Box sx={{ ...style, width: 200 }}>
                    <h2 id="child-modal-title">Text in a child modal</h2>
                    <p id="child-modal-description">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    </p>
                    <Button onClick={handleClose}>Close Child Modal</Button>
                </Box>
            </Modal>
        </React.Fragment>
    );
}

export default function NestedModal() {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [objectName, setObjectName] = useState('');
    const [properties, setProperties] = useState([]);

    const PROP_DATA_TYPES = [
        { value: 'MFDatatypeText', label: 'Text' },
        { value: 'MFDatatypeMultiLineText', label: 'Text (multi-line)' },
        { value: 'MFDatatypeLookup', label: 'choose from list' },
        { value: 'MFDatatypeMultiSelectLookup', label: 'choose from list (multi-select) ' },
        { value: 'MFDatatypeBoolean', label: 'Boolean (yes/no)' },
        { value: 'MFDatatypeInteger', label: 'Number (integer)' },
        { value: 'MFDatatypeDate', label: 'Date' },
        { value: 'MFDatatypeTime', label: 'Time' },
        { value: 'MFDatatypeTimestamp', label: 'Timestamp' },
        { value: 'MFDatatypeFloating', label: 'Floating' },


    ];


    const handleSubmit = async () => {
        try {
            const payload = {
                objectName: objectName,
                properties: properties.map(property => ({
                    title: property.title,
                    data_type: property.dataType
                }))
            };
            console.log(payload)

            // const response = await axios.post('http://localhost:8000/api/create_object_with_properties/', payload, {
            //     headers: {
            //         'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            //         'Content-Type': 'application/json'
            //     }
            // });

            // if (response.status === 201) {
            //     console.log('Object and properties created successfully');
            //     // Handle success scenario
            // } else {
            //     console.error('Failed to create object and properties');
            //     // Handle error scenario
            // }
        } catch (error) {
            console.error('Error:', error.message);
            // Handle error scenario
        }
    };

    const handlePropertyChange = (index, key, value) => {
        const updatedProperties = [...properties];
        updatedProperties[index][key] = value;
        setProperties(updatedProperties);
    };

    const addProperty = () => {
        setProperties([...properties, { title: '', dataType: '' }]);
    };

    const removeProperty = (index) => {
        const updatedProperties = [...properties];
        updatedProperties.splice(index, 1);
        setProperties(updatedProperties);
    };

    return (
        <div>
         
            <li onClick={handleOpen} style={{ display: 'flex', alignItems: 'center' }}>
                <i className="fas fa-layer-group mx-2" style={{ fontSize: '20px' }}></i>
                <span className='list-text  '>New Object Type</span>
            </li>
            <Modal
                iscentered
                open={open}
                onClose={handleClose}
                aria-labelledby="parent-modal-title"
                aria-describedby="parent-modal-description"
              
            >
                <Box className='shadow-lg' sx={{ ...style, width: 650, top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
              
                    maxWidth: '600px', // Adjust the maximum width as needed
                    padding: '20px',
                    
                    outline: 'none', }}>
                    <h4 id="parent-modal-title " className='p-3'>New Object Type</h4>
                    <p id="parent-modal-description">

                        <Grid item xs={12}>
                            <FormControl variant='standard' >
                                <InputLabel htmlFor="objectName">Object Name</InputLabel>
                                <Input
                                    style={{ fontSize: '14px' }}
                                    id="objectName"
                                    value={objectName}
                                    onChange={(e) => setObjectName(e.target.value)}
                                    type='text'
                                    required
                                />
                            </FormControl>
                            <ButtonComponent size='sm' onClick={addProperty} className='mx-2' style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '12px' }} disabled={false}><i className="fas fa-tag mx-1"></i> Add Property</ButtonComponent>
                            <ButtonComponent onClick={handleSubmit} className='mx-2' style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '12px' }} disabled={false}><i className='fas fa-plus-circle mx-1'></i> Create Object</ButtonComponent>

                        </Grid>
                        <Grid container spacing={2} >


                            {properties.map((property, index) => (
                                <Grid item xs={12} key={index} container alignItems="center" style={{ fontSize: '11px' }}>
                                    <Grid item xs={4} >
                                        <FormControl variant="standard" className='mx-2'>
                                            <InputLabel id={`dataType-label-${index}`}>Property Title*</InputLabel>
                                            <Input
                                                style={{ fontSize: '14px' }}
                                                id={`dataType-input-${index}`}
                                                value={property.title}
                                                onChange={(e) => handlePropertyChange(index, 'title', e.target.value)}
                                                type='text'

                                                required
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <FormControl variant='standard' fullWidth>
                                            <InputLabel id={`dataType-label-${index}`}>Select Data Type</InputLabel>
                                            <Select
                                                style={{ fontSize: '14px' }}
                                                labelId={`dataType-label-${index}`}
                                                value={property.dataType}
                                                onChange={(e) => handlePropertyChange(index, 'dataType', e.target.value)}
                                                required
                                            >
                                                <MenuItem value="">Select Data Type</MenuItem>
                                                {PROP_DATA_TYPES.map((item, index) => (
                                                    <MenuItem key={index} value={item.value}>{item.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <ButtonComponent onClick={() => removeProperty(index)} className='mx-2' style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }} disabled={false}><i className='fas fa-trash mx-1'></i> Remove Property</ButtonComponent>
                                    </Grid>
                                </Grid>
                            ))}

                        </Grid>


                    </p>
                    <ChildModal />
                </Box>
            </Modal>
        </div>
    );
}
