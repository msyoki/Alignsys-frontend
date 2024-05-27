import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, CircularProgress, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LookupSelect from '../NewObjectFormLookup';
import MiniLoader from './MiniLoader';
import { FileUpload } from '@mui/icons-material';

const itemList = [
    { objectid: 0, singularName: "Document", pluralName: "Documents" },
    { objectid: 9, singularName: "Document Collection", pluralName: "Document Collections" },
    { objectid: 10, singularName: "Assignment", pluralName: "Assignments" },
    { objectid: 15, singularName: "Report", pluralName: "Reports" },
    { objectid: 129, singularName: "Staff", pluralName: "Staffs" },
    { objectid: 130, singularName: "Car", pluralName: "Cars" }
];

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
            if (word.toLowerCase().includes('document')) {
                return faFile;
            }
            if (word.toLowerCase().includes('staff') || word.toLowerCase().includes('employee')) {
                return faUser;
            }
        }
    }
    return faFolder;
};

const ObjectStructureList = ({ vaultObjectModalsOpen, setVaultObjectsModal }) => {
    const [isDataOpen, setIsDataOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [miniLoader, setMiniLoader] = useState(false)
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [groupedItems, setGroupedItems] = useState([]);
    const [ungroupedItems, setUngroupedItems] = useState([]);
    const [uploadedFile,setUploadedFile]=useState(null)
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

    const fetchItemData = async (objectid) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://192.236.194.251:240/api/MfilesObjects/%7BE19BECA0-7542-451B-81E5-4CADB636FCD5%7D/${objectid}`);
            setSelectedObjectId(objectid);
            setGroupedItems(response.data.grouped);
            setUngroupedItems(response.data.unGrouped);
            setIsLoading(false);

            const totalClasses = response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) + response.data.unGrouped.length;
            if (totalClasses === 1) {
                if (response.data.grouped.length > 0) {
                    handleClassSelection(response.data.grouped[0].members[0].classId, response.data.grouped[0].classGroupId);
                } else {
                    handleClassSelection(response.data.unGrouped[0].classId);
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

    const handleClassSelection = async (classId, classGroupId = null) => {
        try {
            const response = await axios.get(`http://192.236.194.251:240/api/MfilesObjects/ClassProps/%7BE19BECA0-7542-451B-81E5-4CADB636FCD5%7D/${classId}`);
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
        setMiniLoader(true)
        const newFormErrors = {};
        const propertiesPayload = formProperties.map(prop => ({
            value: formValues[prop.propId],
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
            let payload={}
            if(FileUpload){
                try {
                    const formData = new FormData();
                    formData.append('formFiles', uploadedFile); // Assuming uploadedFile contains the selected file
                
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
                    console.log(response.data.uploadID)
                    payload = {
                        objectID: selectedObjectId,
                        classID: selectedClassId, // Assuming all properties belong to the same class
                        properties: propertiesPayload,
                        vaultGuid: '{E19BECA0-7542-451B-81E5-4CADB636FCD5}',
                        uploadId: response.data.uploadID
                    };
                    // Handle successful response here
                    console.log('Upload successful:', response.data);
                } catch (error) {
                    // Handle error here
                    console.error('Error uploading file:', error);
                }
                

            }else{
                payload = {
                    objectID: selectedObjectId,
                    classID: selectedClassId, // Assuming all properties belong to the same class
                    properties: propertiesPayload,
                    vaultGuid: '{E19BECA0-7542-451B-81E5-4CADB636FCD5}'
                };
            }
           
            console.log(payload)
            try {
                const response = await axios.post('http://192.236.194.251:240/api/objectinstance/ObjectCreation', payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    }
                });
                setMiniLoader(false)
                console.log('Form submission successful:', response.data);
                alert('Object was created successfully')
                closeFormDialog();
            } catch (error) {
                setMiniLoader(false)
                console.error('Error submitting form:', error);
                alert(`${error}`)
            }
        }
    };


    return (

        <div>
            <MiniLoader loading={miniLoader} loaderMsg={'Creating new object...'} setLoading={setMiniLoader} />
            <Dialog open={vaultObjectModalsOpen} onClose={closeModal}>
                <DialogTitle>
                    <FontAwesomeIcon icon={faPlus} className='mx-3' />
                    Create New Item
                </DialogTitle>
                <DialogContent>
                    <p>Please select from object options below</p>
                    <List>
                        {itemList.map((item) => (
                            <ListItem button key={item.objectid} onClick={() => fetchItemData(item.objectid)}>
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={findBestIconMatch(item.singularName)} className='mx-1' style={{ color: '#2a68af' }} />
                                </ListItemIcon>
                                <ListItemText primary={item.singularName} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDataOpen} onClose={closeDataDialog} fullWidth>
                <DialogTitle>
                    <FontAwesomeIcon icon={faTag} className='mx-3' />
                    Select a Class
                </DialogTitle>
                <DialogContent style={{ fontSize: '12px' }}>
                    <p>Please select from the class options below</p>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {groupedItems.map((group) => (
                                <div key={group.classGroupId}>
                                    <h6>
                                        <FontAwesomeIcon icon={findBestIconMatch(group.classGroupName)} className='mx-1' style={{ color: '#2a68af' }} />
                                        {group.classGroupName}
                                    </h6>
                                    <List>
                                        {group.members.map((member) => (
                                            <ListItem button key={member.classId} onClick={() => handleClassSelection(member.classId, group.classGroupId)}>
                                                <ListItemText primary={member.className} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            ))}
                            <h6>
                                <FontAwesomeIcon icon={findBestIconMatch('Others')} className='mx-1' style={{ color: '#2a68af' }} />
                                Others
                            </h6>
                            <List>
                                {ungroupedItems.map((item) => (
                                    <ListItem button key={item.classId} onClick={() => handleClassSelection(item.classId)}>
                                        <ListItemText primary={item.className} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDataDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isFormOpen} onClose={closeFormDialog} fullWidth>
                <DialogTitle>Enter Class Properties</DialogTitle>
                <DialogContent>
                    {formProperties.map((prop) => (
                        <React.Fragment key={prop.propId}>
                            {prop.propertytype === 'MFDatatypeText' && (
                                <TextField
                                    label={prop.title}
                                    value={formValues[prop.propId]}
                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                    required={prop.isRequired}
                                    error={!!formErrors[prop.propId]}
                                    helperText={formErrors[prop.propId]}
                                    fullWidth
                                    margin="normal"
                                    size='small'
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
                                />
                            )}
                            {selectedObjectId === 0 && (
                                <div>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                        required={true}
                                        style={{ margin: '16px 0', display: 'block' }}
                                    />
                            
                                </div>
                            )}

                        </React.Fragment>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeFormDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ObjectStructureList;

