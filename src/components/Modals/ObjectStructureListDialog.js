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

const ObjectStructureList = (props) => {


    const [miniLoader, setMiniLoader] = useState(false);







    const [formErrors, setFormErrors] = useState({});
    const [fileUploadError, setFileUploadError] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);


    const [selectedTemplate, setSelectedTemplate] = useState({})





    const closeFormDialog = () => {
        props.setIsFormOpen(false);
    };

    const fetchItemData = async (objectid, objectname) => {
        props.setSelectedObjectName(objectname);
        props.setIsLoading(true);
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.selectedVault.guid}/${objectid}`
            );
          
            props.setSelectedObjectId(objectid);
            props.setGroupedItems(response.data.grouped);
            // console.log(response.data.grouped)
            props.setUngroupedItems(response.data.unGrouped);
            props.setIsLoading(false);

            const totalClasses = response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) +
                response.data.unGrouped.length;

            if (totalClasses === 1) {
                if (response.data.grouped.length > 0) {
                    props.handleClassSelection(
                        response.data.grouped[0].members[0].classId,
                        response.data.grouped[0].members[0].className,
                        response.data.grouped[0].classGroupId
                    );
                } else {
                    props.handleClassSelection(
                        response.data.unGrouped[0].classId,
                        response.data.unGrouped[0].className
                    );
                }
                props.closeModal();
            } else {
                props.setIsDataOpen(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            props.setIsLoading(false);
        }
    };

  
    const UseTemplate = async (item) => {
        props.setFormProperties([])
        props.setTemplateIsTrue(true)
        setSelectedTemplate(item)

        // console.log(props.selectedVault.guid)
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Templates/GetClassTemplateProps/${props.selectedVault.guid}/${item.classID}/${item.id}`
            );
            // setSelectedClassId(selectedClassId);
            props.setFormProperties(response.data);
            // console.log(response.data);
            props.setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            props.setIsFormOpen(true);
        } catch (error) {
            console.error("Error fetching class properties:", error);
        } finally {
            props.closeDataDialog();
        }
    };


    const dontUseTemplates = async () => {
        props.setFormProperties([])
        props.setTemplateIsTrue(false)
        props.setSelectedTemplate({})
        // console.log(props.selectedClassId)
        // console.log(props.selectedClassName)
        props.setTemplateModalOpen(false)
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${props.selectedObjectId}/${props.selectedClassId}`
            );

            // setSelectedClassId(selectedClassId);
            props.setFormProperties(response.data);
            // console.log(response.data);
            props.setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            props.setIsFormOpen(true);
        } catch (error) {
            console.error("Error fetching class properties:", error);
        } finally {
            props.closeDataDialog();
        }
    };


    const handleInputChange = (propId, value) => {
        props.setFormValues({
            ...props.formValues,
            [propId]: value
        });

        const property = props.formProperties.find(prop => prop.propId === propId);
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

    const filteredProperties = props.formProperties.filter(
        prop => prop.propId > 101 || prop.propId === 0 || prop.propId === 26  // except Name or title & Keywords

    );


    const handleSubmit = async () => {

        const newFormErrors = {};
        const propertiesPayload = filteredProperties
            .filter(prop => props.formValues[prop.propId] !== undefined && props.formValues[prop.propId] !== '' && !prop.isAutomatic)
            .map(prop => ({
                value: `${props.formValues[prop.propId]}`,
                propId: prop.propId,
                propertytype: prop.propertytype
            }));


        // console.log(propertiesPayload)

        propertiesPayload.forEach((prop) => {
            if (prop.isRequired && !props.formValues[prop.propId]) {
                alert("error was set")
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (props.selectedObjectId === 0 && !props.templateIsTrue && !uploadedFile) {
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || (props.selectedObjectId === 0 && !uploadedFile && !props.templateIsTrue)) {
            console.log(newFormErrors)
            setFormErrors(newFormErrors);
        } else {
            setMiniLoader(true);
            let payload = {};

            try {

                if (!props.templateIsTrue) {
                    alert("not a template")

                    if (props.selectedObjectId === 0 && uploadedFile) {
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
                            objectID: props.selectedObjectId,
                            classID: props.selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: props.selectedVault.guid,
                            uploadId: uploadResponse.data.uploadID
                        };

                    } else {
                        payload = {
                            objectID: props.selectedObjectId,
                            classID: props.selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: props.selectedVault.guid
                        };

                    }
                    // console.log(payload)
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
                    alert("is a template")
                    payload = {
                        objectTypeID: props.selectedObjectId,
                        classID: props.selectedClassId,
                        properties: propertiesPayload,
                        vaultGuid: props.selectedVault.guid,
                        objectID: selectedTemplate.id
                    };
                    // console.log(payload)
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
                    props.setTemplateModalOpen(false)
                    props.setVaultObjectsModal(false)

                }

            } catch (error) {
                setMiniLoader(false);
                console.error('Error submitting form:', error);
                alert('Error submitting form. Please try again.');
            }
        }
    };

    useEffect(() => {

    }, [
        props.vaultObjectModalsOpen,
        props.selectedVault,
        props.vaultObjectsList,
        props.isDataOpen,
        props.selectedObjectName,
        props.isLoading,
        props.groupedItems,
        props.ungroupedItems,
        props.formProperties,
        props.templateModalOpen,
        props.formValues,
        props.selectedClassName,
        props.isFormOpen,
        props.templateIsTrue,
        props.templates,
    ]);




    return (
        <>
            <MiniLoader
                loading={miniLoader}
                loaderMsg={'Creating new object...'}
                setLoading={setMiniLoader}
            />

            <Dialog open={props.vaultObjectModalsOpen} onClose={props.closeModal} fullWidth>
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
                        {props.vaultObjectsList ? (
                            <>
                                {props.vaultObjectsList.map((item) => (
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
                    <Button onClick={props.closeModal}>Close</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={props.templateModalOpen} onClose={() => props.setTemplateModalOpen(false)} fullWidth>
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto mx-3">
                        <FontAwesomeIcon icon={faPlus} className='mx-2' /> Templates for <span className='mx-2' style={{ fontWeight: "bold" }}>{props.selectedClassName}</span>
                    </span>
                </DialogTitle>


                <DialogContent>
                    <p className='my-4' style={{ fontSize: '13px' }}>
                        Please select a template
                    </p>
                    <List className='p-0 list-group'>
                        {props.templates ? (
                            <>
                                {props.templates.map((item) => (
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
                    <Button onClick={() => props.setTemplateModalOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={props.isDataOpen} onClose={props.closeDataDialog} fullWidth>
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto">
                        Select {props.selectedObjectName} Class
                        <FontAwesomeIcon
                            icon={findBestIconMatch(props.selectedObjectName)}
                            className='mx-3'
                        />
                    </span>
                </DialogTitle>


                <DialogContent className=''>
                    {props.isLoading ? (
                        <div className="d-flex justify-content-center align-items-center w-100">
                            <CircularProgress size={24} />
                        </div>
                    ) : (
                        <List className='p-0 list-group'>
                            {props.groupedItems.map((group) => (
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
                                                onClick={() => props.handleClassSelection(
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
                                    {props.ungroupedItems.map((item) => (
                                        <ListItem
                                            key={item.classId}
                                            className='mx-4 p-0'
                                            button
                                            onClick={() => props.handleClassSelection(
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
                    <Button onClick={props.closeDataDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={props.isFormOpen} onClose={closeFormDialog} fullWidth>
                <DialogTitle
                    className='p-2 d-flex justify-content-between align-items-center'
                    style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                >

                    <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto mx-3">
                        Create:  <small style={{ fontWeight: 'bold' }}>{props.selectedClassName} </small>
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

                                        {props.selectedClassName}
                                    </Box>

                                </Box>


                                { filteredProperties.map((prop) => (
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
                                                                value={prop.value ? prop.value : props.formValues[prop.propId]}
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
                                                                value={props.formValues[prop.propId]}
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
                                                                value={props.formValues[prop.propId]}
                                                                required={prop.isRequired}
                                                                error={!!formErrors[prop.propId]}
                                                                helperText={formErrors[prop.propId]}
                                                                selectedVault={props.selectedVault}
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
                                                                value={props.formValues[prop.propId] || []}
                                                                required={prop.isRequired}
                                                                error={!!formErrors[prop.propId]}
                                                                helperText={formErrors[prop.propId]}
                                                                selectedVault={props.selectedVault}
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
                                                                    value={props.formValues[prop.propId] ?? (
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
                                                                    value={props.formValues[prop.propId]} // Ensure default value is shown
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
                                                                value={props.formValues[prop.propId]}
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


                    {(props.selectedObjectId === 0 && !props.templateIsTrue) && (
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
