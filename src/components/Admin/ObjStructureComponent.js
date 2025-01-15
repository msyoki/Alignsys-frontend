import React, { useState } from 'react';
import axios from 'axios';
import { Grid, FormControl, Input, Select, MenuItem, Button } from '@mui/material';
import { Box } from '@mui/system';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';


const PROP_DATA_TYPES = [
    { value: 'MFDatatypeText', label: 'Text' },
    { value: 'MFDatatypeMultiLineText', label: 'Text (multi-line)' },
    // { value: 'MFDatatypeLookup', label: 'Choose from list' },
    // { value: 'MFDatatypeMultiSelectLookup', label: 'Choose from list (multi-select)' },
    { value: 'MFDatatypeBoolean', label: 'Boolean (yes/no)' },
    { value: 'MFDatatypeInteger', label: 'Number (integer)' },
    // { value: 'MFDatatypeDate', label: 'Date' },
    // { value: 'MFDatatypeTime', label: 'Time' },
    // { value: 'MFDatatypeTimestamp', label: 'Timestamp' },
    // { value: 'MFDatatypeFloating', label: 'Number (Real)' },
];

const PROP_REQUIRED = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
];

const ObjComponent = ({ selectedObjectStructure, setSelectedObjectStructure, authTokens }) => {
    // const [objectName, setObjectName] = useState(selectedObjectStructure?.object_name || '');

    const handlePropertyChange = (index, field, value) => {
        const newProperties = [...selectedObjectStructure.properties];
        newProperties[index][field] = value;
        setSelectedObjectStructure({ ...selectedObjectStructure, properties: newProperties });
        updateObject(selectedObjectStructure);
    };

    const addProperty = () => {
        const newProperty = {
            property_pk: null,
            property_id: Math.random(), // Generate a unique ID for new property
            property_title: '',
            property_datatype: '',
            property_required: false,
        };
        const newProperties = [...selectedObjectStructure.properties, newProperty];
        setSelectedObjectStructure({ ...selectedObjectStructure, properties: newProperties });
        updateObject(selectedObjectStructure);
    };

    const removeProperty = (index) => {
        const newProperties = selectedObjectStructure.properties.filter((_, i) => i !== index);
        setSelectedObjectStructure({ ...selectedObjectStructure, properties: newProperties });
        updateObject(selectedObjectStructure);
    };

    const handleObjectNameChange = (e) => {
        // setObjectName(e.target.value);
        setSelectedObjectStructure({ ...selectedObjectStructure, object_name: e.target.value });
        updateObject({ ...selectedObjectStructure, object_name: e.target.value });
    };

    const updateObject = async (updatedObject) => {
        try {
            await axios.put(`http://localhost:8000/api/update/object/${updatedObject.object_id}/`, updatedObject, {
                headers: {
                    Authorization: `Bearer ${authTokens.access}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Error updating object:', error);
        }
    };

    const deleteObject = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/delete/object/${selectedObjectStructure.object_id}/`, {
                headers: {
                    Authorization: `Bearer ${authTokens.access}`,
                },
            });
            // Handle successful deletion, e.g., clear the form or show a success message
        } catch (error) {
            console.error('Error deleting object:', error);
        }
    };

    return (
        <Box className='shadow-lg p-3' style={{height:'80%' ,overflowY:'scroll' }}>
            {selectedObjectStructure ?
                <>
                    <div className='card-body my-4'>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl variant='standard' fullWidth>
                                    <Input
                                        id={selectedObjectStructure.object_id}
                                        placeholder={selectedObjectStructure.object_name}
                                        className='mx-2'
                                        value={selectedObjectStructure.object_name}
                                        onChange={handleObjectNameChange}
                                        type='text'
                                        required
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <ButtonComponent
                                    size='sm'
                                    onClick={addProperty}
                                    className='mx-1'
                                    style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                    disabled={false}
                                >
                                    <i className="fas fa-tag mx-1"></i> Add Property
                                </ButtonComponent>
                                <ButtonComponent
                                    onClick={() => updateObject(selectedObjectStructure)}
                                    className='mx-1'
                                    style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                    disabled={false}
                                >
                                    <i className='fas fa-plus-circle mx-1'></i> Update Object
                                </ButtonComponent>
                                <ButtonComponent
                                    onClick={deleteObject}
                                    className='mx-1'
                                    style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                    disabled={false}
                                >
                                    <i className='fas fa-trash mx-1'></i> Delete Object
                                </ButtonComponent>
                            </Grid>
                        </Grid>
                    </div>
                    <div className='container-fluid'>
                        {selectedObjectStructure.properties ?
                            <>
                                {selectedObjectStructure.properties.map((property, index) => (
                                    <Grid container spacing={2} alignItems="center" key={index} style={{ fontSize: '9px', marginBottom: '10px' }}>
                                        <Grid item xs={12} sm={4}>
                                            <FormControl variant="standard" fullWidth>
                                                <Input
                                                    style={{ fontSize: '12px' }}
                                                    className='mx-2'
                                                    id={property.property_id}
                                                    placeholder={property.property_title}
                                                    value={property.property_title}
                                                    onChange={(e) => handlePropertyChange(index, 'property_title', e.target.value)}
                                                    type='text'
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <FormControl variant='standard' fullWidth>
                                                <Select
                                                    style={{ fontSize: '12px' }}
                                                    className='mx-2'
                                                    id={`dataType-select-${index}`}
                                                    displayEmpty
                                                    value={property.property_datatype}
                                                    onChange={(e) => handlePropertyChange(index, 'property_datatype', e.target.value)}
                                                    required
                                                >
                                                    <MenuItem value="" disabled>Select Data Type</MenuItem>
                                                    {PROP_DATA_TYPES.map((item, idx) => (
                                                        <MenuItem key={idx} value={item.value}>{item.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <FormControl variant='standard' fullWidth>
                                                <Select
                                                    style={{ fontSize: '12px' }}
                                                    className='mx-2'
                                                    id={`required-select-${index}`}
                                                    displayEmpty
                                                    value={property.property_required}
                                                    onChange={(e) => handlePropertyChange(index, 'property_required', e.target.value)}
                                                    required
                                                >
                                                    <MenuItem value="" disabled>Is required?</MenuItem>
                                                    {PROP_REQUIRED.map((item, idx) => (
                                                        <MenuItem key={idx} value={item.value}>{item.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <ButtonComponent
                                                onClick={() => removeProperty(index)}
                                                className='mx-2'
                                                style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '9px' }}
                                                disabled={false}
                                            >
                                                <i className='fas fa-trash mx-1'></i> Remove Property
                                            </ButtonComponent>
                                        </Grid>
                                    </Grid>
                                ))}
                            </> : <></>}

                    </div>
                </>
                : <></>}
        </Box>
    );
};

export default ObjComponent;
