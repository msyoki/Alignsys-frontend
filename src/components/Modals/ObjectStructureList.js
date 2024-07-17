import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions,Select,MenuItem, List, ListItem, ListItemIcon, ListItemText, CircularProgress, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faHandPointer, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LookupSelect from '../NewObjectFormLookup';
import LookupMultiSelect from '../NewObjectFormLookupMultiSelect';
import MiniLoader from './MiniLoader';
import logo from '../../images/ZF.png'
import FileUploadComponent from '../FileUpload';
import * as constants from '../Auth/configs'


const allIcons = {
    faFileAlt,
    faFolderOpen,
    faTasks,
    faChartBar,
    faUser,
    faCar,
    faFile,
    faFolder,
    faUserFriends,
};

const findBestIconMatch = (name) => {
    const nameWords = name.toLowerCase().split(' ');

    for (let iconName in allIcons) {
        for (let word of nameWords) {
            if (iconName.toLowerCase().includes(word)) {
                return allIcons[iconName];
            }
            if (word.toLowerCase().includes('document') || word.toLowerCase().includes('invoice') || word.toLowerCase().includes('Petty Cash')) {
                return faFile;
            }

            if (word.toLowerCase().includes('staff') || word.toLowerCase().includes('employee')) {
                return faUser;
            }
        }
    }
    return faFolder;
};

const ObjectStructureList = ({ vaultObjectModalsOpen, setVaultObjectsModal, selectedVault, vaultObjectsList }) => {
    const [isDataOpen, setIsDataOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [miniLoader, setMiniLoader] = useState(false)
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [selectedObjectName, setSelectedObjectName] = useState('');
    const [selectedClassName, setSelectedClassName] = useState('');
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [groupedItems, setGroupedItems] = useState([]);
    const [ungroupedItems, setUngroupedItems] = useState([]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formProperties, setFormProperties] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [fileUploadError, setFileUploadError] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);

    const closeModal = () => {
        setVaultObjectsModal();
    };

    const closeDataDialog = () => {
        setIsDataOpen(false);
    };

    const closeFormDialog = () => {
        setIsFormOpen(false);
    };

    const fetchItemData = async (objectid, objectname) => {
        setSelectedObjectName(objectname);
        setIsLoading(true);
        try {
            const response = await axios.get(`${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectid}`);
            setSelectedObjectId(objectid);
            setGroupedItems(response.data.grouped);
            setUngroupedItems(response.data.unGrouped);
            setIsLoading(false);

            const totalClasses = response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) + response.data.unGrouped.length;
            if (totalClasses === 1) {
                if (response.data.grouped.length > 0) {
                    handleClassSelection(response.data.grouped[0].members[0].classId, response.data.grouped[0].members[0].className, response.data.grouped[0].classGroupId);
                } else {
                    handleClassSelection(response.data.unGrouped[0].classId, response.data.unGrouped[0].className);
                }
                closeModal();
            } else {
                setIsDataOpen(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setIsLoading(false);
        }
    };

    const handleClassSelection = async (classId, className, classGroupId = null) => {
        setSelectedClassName(className);
        try {
            const response = await axios.get(`${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${classId}`);
            setSelectedClassId(classId);
            setFormProperties(response.data);
            setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            setIsFormOpen(true);
        } catch (error) {
            console.error("Error fetching class properties:", error);
        }
        closeDataDialog();
    };
    const handleInputChange = (propId, value) => {
        // Update formValues with the new value
        setFormValues({
            ...formValues,
            [propId]: value
        });

        // Find the property associated with the given propId
        const property = formProperties.find(prop => prop.propId === propId);

        // Check if the value is empty or not
        const newFormErrors = { ...formErrors };
        if (!value && property.isRequired) {
            // If the value is empty and the field is required, set the error message
            newFormErrors[propId] = `${property.title} is required`;
        } else {
            // If the value is not empty or the field is not required, clear the error message
            delete newFormErrors[propId];
        }

        // Update the formErrors state with the new error messages
        setFormErrors(newFormErrors);
    };




    const handleFileChange = (file) => {
        if (file) {
            setFileUploadError('')
        }
        setUploadedFile(file)
    };

    const handleSubmit = async () => {
        const newFormErrors = {};
        const propertiesPayload = formProperties
            .filter(prop => formValues[prop.propId] !== undefined && formValues[prop.propId] !== '') // Filter out properties with empty values
            .map(prop => ({
                value: `${formValues[prop.propId]}`,
                propId: prop.propId,
                propertytype: prop.propertytype
            }));


        formProperties.forEach((prop) => {
            if (prop.isRequired && !formValues[prop.propId]) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (selectedObjectId === 0 && !uploadedFile) {
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || (selectedObjectId === 0 && !uploadedFile)) {
            setFormErrors(newFormErrors);
        } else {

            setMiniLoader(true);
            let payload = {};
            if (selectedObjectId === 0 && uploadedFile) {
                try {
                    const formData = new FormData();
                    formData.append('formFiles', uploadedFile);

                    const response = await axios.post(
                        `${constants.mfiles_api}/api/objectinstance/FilesUploadAsync`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'accept': '*/*'
                            }
                        }
                    );
                    console.log(response.data.uploadID);
                    payload = {
                        objectID: selectedObjectId,
                        classID: selectedClassId,
                        properties: propertiesPayload,
                        vaultGuid: selectedVault.guid,
                        uploadId: response.data.uploadID
                    };
                    console.log('Upload successful:', response.data);
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            } else {
                payload = {
                    objectID: selectedObjectId,
                    classID: selectedClassId,
                    properties: propertiesPayload,
                    vaultGuid: selectedVault.guid
                };
            }

            console.log(payload);
            try {
                const response = await axios.post(`${constants.mfiles_api}/api/objectinstance/ObjectCreation`, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    }
                });
                setMiniLoader(false);
                console.log('Form submission successful:', response.data);
                alert('Object was created successfully');
                setUploadedFile(null)
                closeFormDialog();
            } catch (error) {
                setMiniLoader(false);
                console.error('Error submitting form:', error);
                alert(`${error}`);
            }
        }
    };

    return (
        <>
            <MiniLoader loading={miniLoader} loaderMsg={'Creating new object...'} setLoading={setMiniLoader} />
            <Dialog open={vaultObjectModalsOpen} onClose={closeModal} fullWidth>
                <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#2a68af', color: '#fff', fontSize: '15px' }}>
                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span>Create Item <FontAwesomeIcon icon={faPlus} className='mx-3' /></span>
                </DialogTitle>
                <DialogContent >
                    <p className='my-4' style={{ fontSize: '13px' }}>Please select from Item types below</p>
                    <List className='p-0 list-group'>
                        {vaultObjectsList ? <>
                            {vaultObjectsList.map((item) => (
                                <ListItem className='p-0 mx-2' button key={item.objectid} onClick={() => fetchItemData(item.objectid, item.namesingular)}>
                                    <ListItemIcon>
                                        <FontAwesomeIcon icon={findBestIconMatch(item.namesingular)} className='mx-1' style={{ color: '#2a68af' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={item.namesingular} />
                                </ListItem>
                            ))}
                        </> : <></>}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDataOpen} onClose={closeDataDialog} fullWidth>
                <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#2a68af', color: '#fff', fontSize: '15px' }}>

                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span>Select {selectedObjectName} Class <FontAwesomeIcon icon={findBestIconMatch(selectedObjectName)} className='mx-3' /></span>

                </DialogTitle>
                <DialogContent className=''>

                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center w-100">
                            <CircularProgress size={24} />
                        </div>
                    ) : (
                        <List className='p-0 list-group'>
                            {groupedItems.map((group) => (
                                <div key={group.classGroupId}>
                                    <ListItem >
                                        <ListItemText primary={group.classGroupName} className='shadow-lg p-2 mx-0' />
                                    </ListItem>
                                    <List component="div" disablePadding className='mx-4 '>
                                        {group.members.map((member) => (
                                            <ListItem key={member.classId} className='mx-4 p-0' button onClick={() => handleClassSelection(member.classId, member.className, group.classGroupId)}>
                                                <ListItemIcon>
                                                    <FontAwesomeIcon icon={findBestIconMatch(member.className)} style={{ color: '#2a68af' }} />
                                                </ListItemIcon>
                                                <ListItemText primary={member.className} />
                                            </ListItem>
                                        ))}
                                    </List>

                                </div>
                            ))}

                            <>
                                <ListItem >
                                    <ListItemText primary={'Ungrouped'} className='shadow-lg p-2 mx-0' />
                                </ListItem>
                                <List component="div" disablePadding className='mx-4 '>
                                    {ungroupedItems.map((item) => (


                                        <ListItem key={item.classId} className='mx-4 p-0 ' button onClick={() => handleClassSelection(item.classId, item.className)}>
                                            <ListItemIcon>
                                                <FontAwesomeIcon icon={findBestIconMatch(item.className)} style={{ color: '#2a68af' }} />
                                            </ListItemIcon>
                                            <ListItemText primary={item.className} />
                                        </ListItem>

                                    ))}
                                </List>

                            </>

                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDataDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isFormOpen} onClose={closeFormDialog} fullWidth>
                <DialogTitle className='p-2 d-flex content-align' style={{ backgroundColor: '#2a68af', color: '#fff', fontSize: '15px' }}>

                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span>Metadata - Create {selectedClassName}  <FontAwesomeIcon icon={findBestIconMatch(selectedClassName)} className='mx-3' /></span>


                </DialogTitle>
                <DialogContent className='form-group'>
                    {formProperties.map((prop) => (
                        <div key={prop.propId} className="my-3">
                            {prop.propertytype === 'MFDatatypeText' && (
                                <TextField
                                    label={prop.title}
                                    value={formValues[prop.propId]}
                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                    fullWidth
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    helperText={formErrors[prop.propId]}
                                    size='small'
                                    className='my-1'
                                />
                            )}
                            {prop.propertytype === 'MFDatatypeMultiLineText' && (
                                <TextField
                                    label={prop.title}
                                    value={formValues[prop.propId]}
                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                    fullWidth
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    helperText={formErrors[prop.propId]}
                                    multiline
                                    rows={4}
                                    size='small'
                                    className='my-1'
                                />
                            )}
                            {prop.propertytype === 'MFDatatypeLookup' && (
                                <LookupSelect
                                    propId={prop.propId}
                                    label={prop.title}
                                    onChange={handleInputChange}
                                    value={formValues[prop.propId]}
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    helperText={formErrors[prop.propId]}
                                    selectedVault={selectedVault}
                                    size='small'
                                    className='my-1'
                                />
                            )}
                            {prop.propertytype === 'MFDatatypeMultiSelectLookup' && (
                                <LookupMultiSelect

                                    propId={prop.propId}
                                    label={prop.title}
                                    onChange={handleInputChange}
                                    value={formValues[prop.propId] || []}
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    helperText={formErrors[prop.propId]}
                                    selectedVault={selectedVault}
                                    size='small'
                                    className='my-1'
                                />
                            )}

                            {prop.propertytype === 'MFDatatypeBoolean' && (
                                <div>
                                    <label>{prop.title} :</label>
                                    {/* <FormControlLabel

                                        control={<Checkbox
                                            checked={formValues[prop.propId] === true} // Set checked state for "true"
                                            onChange={(e) => handleInputChange(prop.propId, true)} // Set value to true when checked
                                        />}
                                        label="True"
                                        size='small'
                                        className='my-1 mx-2'
                                    />
                                    <FormControlLabel
                                        control={<Checkbox
                                            checked={formValues[prop.propId] === false} // Set checked state for "false"
                                            onChange={(e) => handleInputChange(prop.propId, false)} // Set value to false when checked
                                        />}
                                        label="False"
                                        size='small'
                                        className='my-1'
                                    />
                                    {prop.isRequired && !!formErrors[prop.propId] && (
                                        <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '8px' }}>{formErrors[prop.propId]}</div>
                                    )} */}
                    
                              <Select
                                size='small'
                                value={formValues[prop.propId] ?? (prop.value === "Yes" ? true : (prop.value === "No" ? false : ''))}
                                onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                displayEmpty
                                fullWidth
                              >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value={true}>True</MenuItem>
                                <MenuItem value={false}>False</MenuItem>
                              </Select>
                              {prop.isRequired && !!formErrors[prop.propId] && (
                                        <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '8px' }}>{formErrors[prop.propId]}</div>
                                    )}
                        
                                </div>
                            )}
                            {prop.propertytype === 'MFDatatypeDate' && (
                                <TextField

                                    label={prop.title}
                                    type="date"
                                    value={formValues[prop.propId]}
                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                    fullWidth
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    helperText={formErrors[prop.propId]}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    size='small'
                                    className='my-1'
                                />
                            )}

                        </div>
                    ))}
                    {selectedObjectId === 0 && (
                        <div>
                            <FileUploadComponent handleFileChange={handleFileChange} uploadedFile={uploadedFile} />
                            {fileUploadError && (
                                <div style={{ color: '#CC3333', fontSize: '12px' }}>{fileUploadError}</div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeFormDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ObjectStructureList;


