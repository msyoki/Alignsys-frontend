import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, CircularProgress, TextField } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LookupSelect from '../NewObjectFormLookup';
import MiniLoader from './MiniLoader';
import { FileUpload } from '@mui/icons-material';


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
            if (word.toLowerCase().includes('document') || word.toLowerCase().includes('invoice')) {
                return faFile;
            }
      
            if (word.toLowerCase().includes('staff') || word.toLowerCase().includes('employee')) {
                return faUser;
            }
        }
    }
    return faFolder;
};

const ObjectStructureList = ({ vaultObjectModalsOpen, setVaultObjectsModal ,selectedVault}) => {
    const [isDataOpen, setIsDataOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [miniLoader, setMiniLoader] = useState(false)
    const [selectedObjectId, setSelectedObjectId] = useState(null);
    const [selectedObjectName,setSelectedObjectName]=useState('')
    const [selectedClassName,setSelectedClassName]=useState('')
    const [vaultObjectsList,setVaultObjectList]=useState([])
    
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

    const getVaultObjects=()=>{
        let config = {
            method: 'get',
            url: `http://192.236.194.251:240/api/MfilesObjects/GetVaultsObjects/${selectedVault}`,
            headers : {
            
            }
        };
    
        axios.request(config)
            .then((response) => {
            setVaultObjectList(response.data)
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
    }

    const fetchItemData = async (objectid,objectname) => {
        setSelectedObjectName(objectname)
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
                    handleClassSelection(response.data.grouped[0].members[0].classId,response.data.grouped[0].members[0].className, response.data.grouped[0].classGroupId);
                } else {
                    handleClassSelection(response.data.unGrouped[0].classId,response.data.unGrouped[0].className);
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

    const handleClassSelection = async (classId,className,classGroupId = null) => {
        setSelectedClassName(className)
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
            if(selectedObjectId === 0 && uploadedFile){
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
                        vaultGuid: selectedVault,
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
                    vaultGuid: selectedVault
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

    useEffect(() => {
        getVaultObjects();
    }, []); // Empty dependency array means this effect runs only once
    

    return (

        <div>
            <MiniLoader loading={miniLoader} loaderMsg={'Creating new object...'} setLoading={setMiniLoader} />
            <Dialog open={vaultObjectModalsOpen} onClose={closeModal} fullWidth>
                <DialogTitle className='p-2' style={{backgroundColor: '#293241',color:'#fff',fontSize:'15px'}}>
                    <FontAwesomeIcon icon={faPlus} className='mx-3' />
                    Create Item
                </DialogTitle>
                <DialogContent >
                    <p className='my-4' style={{ fontSize: '13px' }}>Please select from object options below</p>
                    <List>
                        
                        {vaultObjectsList.map((item) => (
                            <ListItem  className='p-0 mx-2' button key={item.objectid} onClick={() => fetchItemData(item.objectid,item.namesingular)}>
                                <ListItemIcon>
                                    <FontAwesomeIcon icon={findBestIconMatch(item.namesingular)} className='mx-1' style={{ color: '#2a68af' }} />
                                </ListItemIcon>
                                <ListItemText primary={item.namesingular} />
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

            <Dialog open={isDataOpen} onClose={closeDataDialog} fullWidth >
                <DialogTitle className='p-2' style={{backgroundColor: '#293241',color:'#fff' ,fontSize:'15px'}}>
                    <FontAwesomeIcon icon={findBestIconMatch(selectedObjectName)} className='mx-3' />
                    {selectedObjectName}
                </DialogTitle>
                <DialogContent >
                    <p className='my-4' style={{ fontSize: '13px' }}>Please select from the class options below</p>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {groupedItems.map((group) => (
                                <div key={group.classGroupId}>
                                    <h6 className='p-2 my-1' style={{  backgroundColor: '#2a68af',color:'#fff' ,fontSize:'14px' }}>
                                        <FontAwesomeIcon icon={findBestIconMatch(group.classGroupName)} className='mx-1'/>
                                        <span className='mx-2'>{group.classGroupName}</span>
                                    </h6>
                                    <List className='p-0 mx-2' >
                                        {group.members.map((member) => (
                                            <ListItem  className=' p-0 mx-3'  button key={member.classId} onClick={() => handleClassSelection(member.classId,member.className, group.classGroupId)}>
                                                <ListItemText primary={member.className} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            ))}
                            <h6 className='p-2' style={{  backgroundColor: '#2a68af',color:'#fff'  ,fontSize:'14px'}}>
                                <FontAwesomeIcon icon={findBestIconMatch('Others')} className='mx-1' />
                                
                                <span className='mx-2'>Others</span>
                            </h6>
                            <List className='p-0 my-1' >
                                {ungroupedItems.map((item) => (
                                    <ListItem   className=' p-0 mx-2' button key={item.classId} onClick={() => handleClassSelection(item.classId,item.className)}>
                                        <ListItemText  primary={item.className} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDataDialog} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isFormOpen} onClose={closeFormDialog} fullWidth>
                <DialogTitle className='p-2' style={{backgroundColor: '#293241',color:'#fff',fontSize:'15px'}}>
                    <FontAwesomeIcon icon={findBestIconMatch(selectedClassName)} className='mx-3' />
                        New {selectedClassName}
                    </DialogTitle>
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

