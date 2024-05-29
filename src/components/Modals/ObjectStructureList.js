import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, CircularProgress, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faHandPointer, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LookupSelect from '../NewObjectFormLookup';
import LookupMultiSelect from '../NewObjectFormLookupMultiSelect';
import MiniLoader from './MiniLoader';
import logo from '../../images/ZF.png'


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

const ObjectStructureList = ({ vaultObjectModalsOpen, setVaultObjectsModal, selectedVault }) => {
    const [isDataOpen, setIsDataOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [miniLoader, setMiniLoader] = useState(false)
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [selectedObjectName, setSelectedObjectName] = useState('');
    const [selectedClassName, setSelectedClassName] = useState('');
    const [vaultObjectsList, setVaultObjectList] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [groupedItems, setGroupedItems] = useState([]);
    const [ungroupedItems, setUngroupedItems] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formProperties, setFormProperties] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const closeModal = () => {
        setVaultObjectsModal();
    };

    const closeDataDialog = () => {
        setIsDataOpen(false);
    };

    const closeFormDialog = () => {
        setIsFormOpen(false);
    };

    const getVaultObjects = () => {
        let config = {
            method: 'get',
            url: `http://192.236.194.251:240/api/MfilesObjects/GetVaultsObjects/${selectedVault}`,
            headers: {}
        };

        axios.request(config)
            .then((response) => {
                setVaultObjectList(response.data);
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const fetchItemData = async (objectid, objectname) => {
        setSelectedObjectName(objectname);
        setIsLoading(true);
        try {
            const response = await axios.get(`http://192.236.194.251:240/api/MfilesObjects/${selectedVault}/${objectid}`);
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
            const response = await axios.get(`http://192.236.194.251:240/api/MfilesObjects/ClassProps/${selectedVault}/${classId}`);
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
        setFormValues({
            ...formValues,
            [propId]: value
        });
        setFormErrors({
            ...formErrors,
            [propId]: ''
        });
    };

    const handleFileChange = (file) => {
        setUploadedFile(file)
    };

    const handleSubmit = async () => {

        const newFormErrors = {};
        const propertiesPayload = formProperties.map(prop => ({
            value: `${formValues[prop.propId]}`,
            propId: prop.propId,
            propertytype: prop.propertytype
        }));

        formProperties.forEach((prop) => {
            if (prop.isRequired && !formValues[prop.propId]) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (Object.keys(newFormErrors).length > 0) {

            setFormErrors(newFormErrors);
        } else {
            setMiniLoader(true);
            let payload = {};
            if (selectedObjectId === 0 && uploadedFile) {
                try {
                    const formData = new FormData();
                    formData.append('formFiles', uploadedFile);

                    const response = await axios.post(
                        'http://192.236.194.251:240/api/objectinstance/FilesUploadAsync',
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
                        vaultGuid: selectedVault,
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
                    vaultGuid: selectedVault
                };
            }

            console.log(payload);
            try {
                const response = await axios.post('http://192.236.194.251:240/api/objectinstance/ObjectCreation', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    }
                });
                setMiniLoader(false);
                console.log('Form submission successful:', response.data);
                alert('Object was created successfully');
                closeFormDialog();
            } catch (error) {
                setMiniLoader(false);
                console.error('Error submitting form:', error);
                alert(`${error}`);
            }
        }
    };

    useEffect(() => {
        getVaultObjects();
    }, []); // Empty dependency array means this effect runs only once

    return (
        <div>
            <MiniLoader loading={miniLoader} loaderMsg={'Creating new object...'} setLoading={setMiniLoader} />
            <Dialog open={vaultObjectModalsOpen} onClose={closeModal} fullWidth>
                <DialogTitle className='p-2' style={{ backgroundColor: '#293241', color: '#fff', fontSize: '15px' }}>
                    <img src={logo} alt="logo" style={{ width: '5%' }} className='mx-2' />
                    Create Item <FontAwesomeIcon icon={faPlus} className='mx-3' />
                </DialogTitle>
                <DialogContent >
                    <p className='my-4' style={{ fontSize: '13px' }}>Please select from Item types below</p>
                    <List className='p-0'>
                        {vaultObjectsList.map((item) => (
                            <ListItem className='p-0 mx-2' button key={item.objectid} onClick={() => fetchItemData(item.objectid, item.namesingular)}>
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={findBestIconMatch(item.namesingular)} className='mx-1' style={{ color: '#2a68af' }} />
                                </ListItemIcon>
                                <ListItemText primary={item.namesingular} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDataOpen} onClose={closeDataDialog} fullWidth>
                <DialogTitle className='p-2' style={{ backgroundColor: '#293241', color: '#fff', fontSize: '15px' }}>
                    <img src={logo} alt="logo" style={{ width: '5%' }} className='mx-2' />


                    Select {selectedObjectName} Class <FontAwesomeIcon icon={findBestIconMatch(selectedObjectName)} className='mx-3' />
                </DialogTitle>
                <DialogContent>

                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center w-100">
                            <CircularProgress size={24} />
                        </div>
                    ) : (
                        <List className='p-0'>
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
                                    <ListItemText primary={'Others'} className='shadow-lg p-2 mx-0' />
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
                <DialogTitle className='p-2' style={{ backgroundColor: '#293241', color: '#fff', fontSize: '15px' }}>
                    <img src={logo} alt="logo" style={{ width: '5%' }} className='mx-2' />

                    Metadata - Create {selectedClassName}  <FontAwesomeIcon icon={findBestIconMatch(selectedClassName)} className='mx-3' />

                </DialogTitle>
                <DialogContent >
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
                            {prop.propertytype === 'MFDatatypeBoolean' && (
                                <FormControlLabel
                                    control={<Checkbox checked={formValues[prop.propId]}
                                        onChange={(e) => handleInputChange(prop.propId, e.target.checked)} />}
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    label={prop.title}
                                    size='small'
                                    className='my-1'
                                />

                            )}
                        </div>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeFormDialog}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ObjectStructureList;
