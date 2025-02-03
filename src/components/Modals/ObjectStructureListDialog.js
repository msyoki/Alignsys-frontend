import React, { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    TextField,
    Checkbox,
    FormControlLabel,
    Box, Typography
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileAlt,
    faFolderOpen,
    faTasks,
    faChartBar,
    faUser,
    faHandPointer,
    faCar,
    faFile,
    faFolder,
    faUserFriends,
    faPlus,
    faTag
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import LookupSelect from '../NewObjectFormLookup';
import LookupMultiSelect from '../NewObjectFormLookupMultiSelect';
import MiniLoader from './MiniLoaderDialog';
import logo from '../../images/ZFWHITE.webp'
import FileUploadComponent from '../FileUpload';
import * as constants from '../Auth/configs';





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
            if (word.toLowerCase().includes('document') ||
                word.toLowerCase().includes('invoice') ||
                word.toLowerCase().includes('Petty Cash')) {
                return faFile;
            }

            if (word.toLowerCase().includes('staff') ||
                word.toLowerCase().includes('employee')) {
                return faUser;
            }
        }
    }
    return faFolder;
};

const ObjectStructureList = ({vaultObjectModalsOpen,setVaultObjectsModal,selectedVault,vaultObjectsList,setIsDataOpen,setSelectedObjectName,setIsLoading,setGroupedItems,setUngroupedItems,closeModal,setSelectedObjectId,selectedObjectId,setSelectedClassId,selectedClassId,isDataOpen,selectedObjectName,isLoading,groupedItems,ungroupedItems,handleClassSelection,setFormProperties,formProperties,setTemplateModalOpen,templateModalOpen,setFormValues,formValues,closeDataDialog,selectedClassName,setIsFormOpen,isFormOpen,setTemplateIsTrue,templateIsTrue,templates,setTemplates}) => {

   
    const [miniLoader, setMiniLoader] = useState(false);
 
    





    const [formErrors, setFormErrors] = useState({});
    const [fileUploadError, setFileUploadError] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);


    const [selectedTemplate, setSelectedTemplate] = useState({})





    const closeFormDialog = () => {
        setIsFormOpen(false);
    };

    const fetchItemData = async (objectid, objectname) => {
        setSelectedObjectName(objectname);
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${selectedVault.guid}/${objectid}`
            );
            setSelectedObjectId(objectid);
            setGroupedItems(response.data.grouped);
            console.log(response.data.grouped)
            setUngroupedItems(response.data.unGrouped);
            setIsLoading(false);

            const totalClasses = response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) +
                response.data.unGrouped.length;

            if (totalClasses === 1) {
                if (response.data.grouped.length > 0) {
                    handleClassSelection(
                        response.data.grouped[0].members[0].classId,
                        response.data.grouped[0].members[0].className,
                        response.data.grouped[0].classGroupId
                    );
                } else {
                    handleClassSelection(
                        response.data.unGrouped[0].classId,
                        response.data.unGrouped[0].className
                    );
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

    // const handleClassSelection = async (classId, className, classGroupId = null) => {
    //     setSelectedClassName(className);

    //     try {
    //         const response = await axios.get(
    //             `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${classId}`
    //         );
    //         console.log(selectedVault.guid)
    //         console.log(`${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${classId}`)
    //         setSelectedClassId(classId);
    //         setFormProperties(response.data);
    //         console.log(response.data)
    //         setFormValues(response.data.reduce((acc, prop) => {
    //             acc[prop.propId] = '';
    //             return acc;
    //         }, {}));
    //         setIsFormOpen(true);
    //     } catch (error) {
    //         console.error("Error fetching class properties:", error);
    //     }
    //     closeDataDialog();
    // };

    // const handleClassSelection = async (classId, className, classGroupId = null) => {
    //     alert("called")
    //     setSelectedClassName(className);

    //     if (selectedObjectId === 0) {
    //         axios.get(`${constants.mfiles_api}/api/Templates/GetClassTemplate/${selectedVault.guid}/${classId}`, {
    //             headers: {
    //                 'accept': '*/*'
    //             }
    //         })
    //             .then(response => {
    //                 setTemplates(response.data);
    //                 setTemplateModalOpen(true)
    //                 // alert("show templates available")


    //             })
    //             .catch(error => {
    //                 console.error(error);
    //                 proceedNoneTemplate();
    //             });
    //     }

    //     const proceedNoneTemplate = async () => {
    //         try {
    //             const response = await axios.get(
    //                 `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${classId}`
    //             );
    //             console.log(selectedVault.guid)
    //             console.log(`${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${classId}`)
    //             setSelectedClassId(classId);
    //             setFormProperties(response.data);
    //             console.log(response.data)
    //             setFormValues(response.data.reduce((acc, prop) => {
    //                 acc[prop.propId] = '';
    //                 return acc;
    //             }, {}));
    //             setIsFormOpen(true);
    //         } catch (error) {
    //             console.error("Error fetching class properties:", error);
    //         }
    //         closeDataDialog();
    //     }

    //     const proceedTemplate = async () => {
    //         try {
    //             const response = await axios.get(
    //                 `${constants.mfiles_api}/api/Templates/GetClassTemplateProps/${selectedVault.guid}/${classId}/${selectedObjectId}`
    //             );
    //             setSelectedClassId(classId);
    //             setFormProperties(response.data);
    //             console.log(response.data)
    //             setFormValues(response.data.reduce((acc, prop) => {
    //                 acc[prop.propId] = '';
    //                 return acc;
    //             }, {}));
    //             setIsFormOpen(true);
    //         } catch (error) {
    //             console.error("Error fetching class properties:", error);
    //         }
    //         closeDataDialog();
    //     }
    // };
 
    const UseTemplate = async (item) => {
        setTemplateIsTrue(true)
        setSelectedTemplate(item)

        console.log(selectedVault.guid)
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Templates/GetClassTemplateProps/${selectedVault.guid}/${item.classID}/${item.id}`
            );
            setSelectedClassId(selectedClassId);
            setFormProperties(response.data);
            console.log(response.data);
            setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            setIsFormOpen(true);
        } catch (error) {
            console.error("Error fetching class properties:", error);
        } finally {
            closeDataDialog();
        }
    };


    const dontUseTemplates = async () => {
        setTemplateIsTrue(false)
        setSelectedTemplate({})
        console.log(selectedClassId)
        console.log(selectedClassName)
        setTemplateModalOpen(false)
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${selectedVault.guid}/${selectedObjectId}/${selectedClassId}`
            );

            setSelectedClassId(selectedClassId);
            setFormProperties(response.data);
            console.log(response.data);
            setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            setIsFormOpen(true);
        } catch (error) {
            console.error("Error fetching class properties:", error);
        } finally {
            closeDataDialog();
        }
    };


    const handleInputChange = (propId, value) => {
        setFormValues({
            ...formValues,
            [propId]: value
        });

        const property = formProperties.find(prop => prop.propId === propId);
        const newFormErrors = { ...formErrors };

        if (!value && property.isRequired && !property.isAutomatic) {
            newFormErrors[propId] = `${property.title} is required`;
        } else {
            delete newFormErrors[propId];
        }

        setFormErrors(newFormErrors);
    };

    const handleFileChange = (file) => {
        if (file) {
            setFileUploadError('');
        }
        setUploadedFile(file);
    };

    const filteredProperties = formProperties.filter(
        prop => prop.propId > 101
    );

    const handleSubmit = async () => {
      
        const newFormErrors = {};
        const propertiesPayload = filteredProperties
            .filter(prop => formValues[prop.propId] !== undefined && formValues[prop.propId] !== '' && !prop.isAutomatic)
            .map(prop => ({
                value: `${formValues[prop.propId]}`,
                propId: prop.propId,
                propertytype: prop.propertytype
            }));

        alert("called ")
        console.log(propertiesPayload)

        propertiesPayload.forEach((prop) => {
            if (prop.isRequired && !formValues[prop.propId]) {
                alert("error was set")
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (selectedObjectId === 0 && !templateIsTrue && !uploadedFile) {
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || (selectedObjectId === 0 && !uploadedFile && !templateIsTrue )) {
            console.log(newFormErrors)
            setFormErrors(newFormErrors);
        } else {
            setMiniLoader(true);
            let payload = {};

            try {

                if (!templateIsTrue) {
                    alert("called  template")
                    if (selectedObjectId === 0 && uploadedFile) {
                        const formData = new FormData();
                        formData.append('formFiles', uploadedFile);

                        const uploadResponse = await axios.post(
                            `${constants.mfiles_api}/api/objectinstance/FilesUploadAsync`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    'accept': '*/*'
                                }
                            }
                        );

                        payload = {
                            objectID: selectedObjectId,
                            classID: selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: selectedVault.guid,
                            uploadId: uploadResponse.data.uploadID
                        };
                    } else {
                        payload = {
                            objectID: selectedObjectId,
                            classID: selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: selectedVault.guid
                        };
                    }

                    await axios.post(
                        `${constants.mfiles_api}/api/objectinstance/ObjectCreation`,
                        payload,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'accept': '*/*'
                            }
                        }
                    );

                    setMiniLoader(false);
                    alert('Object was created successfully');
                    setUploadedFile(null);
                    closeFormDialog();
                } else {
                    alert("called  template")
                    payload = {
                        objectTypeID: selectedObjectId,
                        classID: selectedClassId,
                        properties: propertiesPayload,
                        vaultGuid: selectedVault.guid,
                        objectID: selectedTemplate.id
                    };
                    console.log(payload)
                    await axios.post(
                        `${constants.mfiles_api}/api/Templates/ObjectCreation`,
                        payload,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                'accept': '*/*'
                            }
                        }
                    );

                    setMiniLoader(false);
                    alert('Object was created successfully');
                    closeFormDialog();
                    setTemplateModalOpen(false)
                    setVaultObjectsModal(false)

                }

            } catch (error) {
                setMiniLoader(false);
                console.error('Error submitting form:', error);
                alert('Error submitting form. Please try again.');
            }
        }
    };

  


    return (
        <>
            <MiniLoader
                loading={miniLoader}
                loaderMsg={'Creating new object...'}
                setLoading={setMiniLoader}
            />

            <Dialog open={vaultObjectModalsOpen} onClose={closeModal} fullWidth>
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto mx-3">
                        <FontAwesomeIcon icon={faPlus} className='mx-2' /> Create
                    </span>
                </DialogTitle>


                <DialogContent>
                    <p className='my-4' style={{ fontSize: '13px' }}>
                        Please select from Item types below
                    </p>
                    <List className='p-0 list-group'>
                        {vaultObjectsList ? (
                            <>
                                {vaultObjectsList.map((item) => (
                                    <ListItem
                                        className='p-0 mx-2'
                                        button
                                        key={item.objectid}
                                        onClick={() => fetchItemData(item.objectid, item.namesingular)}
                                    >
                                        <ListItemIcon>
                                            <FontAwesomeIcon
                                                icon={findBestIconMatch(item.namesingular)}
                                                className='mx-1'
                                                style={{ color: '#2a68af' }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={item.namesingular} />
                                    </ListItem>
                                ))}
                            </>
                        ) : (
                            <></>
                        )}
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeModal}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} fullWidth>
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto mx-3">
                        <FontAwesomeIcon icon={faPlus} className='mx-2' /> Templates for <span className='mx-2' style={{ fontWeight: "bold" }}>{selectedClassName}</span>
                    </span>
                </DialogTitle>


                <DialogContent>
                    <p className='my-4' style={{ fontSize: '13px' }}>
                        Please select a template
                    </p>
                    <List className='p-0 list-group'>
                        {templates ? (
                            <>
                                {templates.map((item) => (
                                    <ListItem
                                        className='p-0 mx-2'
                                        button
                                        key={item.id}
                                        onClick={() => UseTemplate(item)}
                                    >
                                        <ListItemIcon>
                                            <FontAwesomeIcon
                                                icon={findBestIconMatch(item.title)}
                                                className='mx-1'
                                                style={{ color: '#2a68af' }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText primary={item.title} />
                                    </ListItem>
                                ))}
                            </>
                        ) : (
                            <></>
                        )}

                    </List>
                </DialogContent>

                <DialogActions>
                    <Button onClick={dontUseTemplates}>Don't use template</Button>
                    <Button onClick={() => setTemplateModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDataOpen} onClose={closeDataDialog} fullWidth>
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto">
                        Select {selectedObjectName} Class
                        <FontAwesomeIcon
                            icon={findBestIconMatch(selectedObjectName)}
                            className='mx-3'
                        />
                    </span>
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
                                    <ListItem>
                                        <ListItemText
                                            primary={group.classGroupName}
                                            className='shadow-lg p-2 mx-0'
                                        />
                                    </ListItem>
                                    <List component="div" disablePadding className='mx-4'>
                                        {group.members.map((member) => (
                                            <ListItem
                                                key={member.classId}
                                                className='mx-4 p-0'
                                                button
                                                onClick={() => handleClassSelection(
                                                    member.classId,
                                                    member.className,
                                                    group.classGroupId
                                                )}
                                            >
                                                <ListItemIcon>
                                                    <FontAwesomeIcon
                                                        icon={findBestIconMatch(member.className)}
                                                        style={{ color: '#2a68af' }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText primary={member.className} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            ))}

                            <>
                                <ListItem>
                                    <ListItemText
                                        primary={'Ungrouped'}
                                        className='shadow-lg p-2 mx-0'
                                    />
                                </ListItem>
                                <List component="div" disablePadding className='mx-4'>
                                    {ungroupedItems.map((item) => (
                                        <ListItem
                                            key={item.classId}
                                            className='mx-4 p-0'
                                            button
                                            onClick={() => handleClassSelection(
                                                item.classId,
                                                item.className
                                            )}
                                        >
                                            <ListItemIcon>
                                                <FontAwesomeIcon
                                                    icon={findBestIconMatch(item.className)}
                                                    style={{ color: '#2a68af' }}
                                                />
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
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto mx-3">
                        Create:  <small style={{ fontWeight: 'bold' }}>{selectedClassName} </small>
                    </span>
                </DialogTitle>


                <DialogContent className='form-group my-4'>

                    <Box
                        className='shadow-lg p-4 shadow-sm'
                        sx={{
                            width: '100%',
                            // height: '65vh',
                            // overflowY: 'scroll',
                            backgroundColor: '#e8f9fa'
                        }}
                    >
                        <List sx={{ p: 0 }}>
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginY: '2px' }}>
                                    <Typography
                                        className='my-2'
                                        variant="body2"
                                        sx={{
                                            color: '#1C4690',
                                            fontWeight: 'bold',
                                            flexBasis: '45%',
                                            fontSize: '12px',
                                            textAlign: 'end'
                                        }}
                                    >
                                        Class :
                                    </Typography>
                                    <Box className='my-1' sx={{ flexBasis: '70%', fontSize: '12px', textAlign: 'start', ml: 1 }}>

                                        {selectedClassName}
                                    </Box>

                                </Box>


                                {filteredProperties.map((prop) => (
                                    <ListItem key={prop.propId} sx={{ p: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginY: '2px' }}>
                                            <Typography
                                                className='my-2'
                                                variant="body2"
                                                sx={{
                                                    color: '#1C4690',
                                                    fontWeight: 'bold',
                                                    flexBasis: '45%',
                                                    fontSize: '12px',
                                                    textAlign: 'end'
                                                }}
                                            >
                                                {prop.title} {prop.isRequired ? <span className='text-danger'> *</span> : <></>} :
                                            </Typography>

                                            <Box sx={{ flexBasis: '70%', fontSize: '12px', textAlign: 'start', ml: 1 }}>
                                                {(prop.propertytype === 'MFDatatypeText' || prop.propertytype === 'MFDatatypeFloating') && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic && !prop.value ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (


                                                            <TextField
                                                                // label={prop.title}
                                                                value={prop.value ? prop.value : formValues[prop.propId]}
                                                                onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                fullWidth
                                                                required={prop.isRequired}
                                                                error={!!formErrors[prop.propId]}
                                                                helperText={formErrors[prop.propId]}
                                                                size="small"
                                                                className="my-1"
                                                                disabled={prop.value ? true : false}
                                                                InputProps={{
                                                                    style: { fontSize: '12px' }, // Adjust the font size here
                                                                }}
                                                                InputLabelProps={{
                                                                    style: { fontSize: '12px' }, // Adjust the label font size if needed
                                                                }}
                                                            />
                                                        )}
                                                    </>
                                                )}

                                                {prop.propertytype === 'MFDatatypeMultiLineText' && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (
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
                                                                InputProps={{
                                                                    style: { fontSize: '12px' }, // Adjust the font size here
                                                                }}
                                                                InputLabelProps={{
                                                                    style: { fontSize: '12px' }, // Adjust the label font size if needed
                                                                }}
                                                            />
                                                        )}
                                                    </>


                                                )}

                                                {prop.propertytype === 'MFDatatypeLookup' && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (
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
                                                    </>

                                                )}
                                                

                                                {prop.propertytype === 'MFDatatypeMultiSelectLookup' && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (
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
                                                    </>

                                                )}

                                                {prop.propertytype === 'MFDatatypeBoolean' && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (
                                                            <div>
                                                                {/* <label>{prop.title} :</label> */}
                                                                <Select
                                                                    size='small'
                                                                    value={formValues[prop.propId] ?? (
                                                                        prop.value === "Yes" ? true : (prop.value === "No" ? false : '')
                                                                    )}
                                                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                    displayEmpty
                                                                    fullWidth
                                                                >
                                                                    <MenuItem value=""><em>None</em></MenuItem>
                                                                    <MenuItem value={true}>True</MenuItem>
                                                                    <MenuItem value={false}>False</MenuItem>
                                                                </Select>
                                                                {prop.isRequired && !!formErrors[prop.propId] && (
                                                                    <div style={{ color: '#f44336', fontSize: '0.75rem', marginTop: '8px' }}>
                                                                        {formErrors[prop.propId]}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>

                                                )}


                                                {prop.propertytype === 'MFDatatypeTimestamp' && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (
                                                            <div className="cs-form">
                                                                <input
                                                                    type="time"
                                                                    className="form-control"
                                                                    value={formValues[prop.propId]} // Ensure default value is shown
                                                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                />
                                                                {formErrors[prop.propId] && <div className="text-danger">{formErrors[prop.propId]}</div>}
                                                            </div>
                                                        )}
                                                    </>
                                                )}




                                                {prop.propertytype === 'MFDatatypeDate' && !prop.isHidden && (
                                                    <>
                                                        {prop.isAutomatic ? (
                                                            <p className='p-1'> (automatic) {formErrors[prop.propId]}</p>
                                                        ) : (
                                                            <TextField
                                                                // label={prop.title}
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
                                                    </>

                                                )}
                                            </Box>
                                        </Box>
                                    </ListItem>
                                ))}


                            </>
                        </List>
                    </Box>


                    {(selectedObjectId === 0 && !templateIsTrue) && (
                        <div>
                            <FileUploadComponent
                                handleFileChange={handleFileChange}
                                uploadedFile={uploadedFile}
                            />
                            {fileUploadError && (
                                <div style={{ color: '#CC3333', fontSize: '12px' }}>
                                    {fileUploadError}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button size='small' onClick={closeFormDialog}>Cancel</Button>
                    <Button size='small' onClick={handleSubmit} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ObjectStructureList;
