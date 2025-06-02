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
    Box, Typography,
    Grid
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
import TimedAlert from '../TimedAlert';
import LoadingDialog from '../Loaders/LoaderDialog';
import PDFViewerPreview from '../Pdf2';
import DynamicFileViewer from '../DynamicFileViewer2';





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

    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');

    const [base64Content, setBase64Content] = useState('')
    const [fileExt, setFileExt] = useState('')

    const closeFormDialog = () => {
        props.setIsFormOpen(false);
    };

    const fetchItemData = async (objectid, objectname) => {
        setSearchTerm("")
        props.setSelectedObjectName(objectname);
        props.setIsLoading(true);
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.selectedVault.guid}/${objectid}/${props.mfilesId}`
            );

            props.setSelectedObjectId(objectid);
            props.setGroupedItems(response.data.grouped);
            console.log(response.data)
            props.setUngroupedItems(response.data.unGrouped);
            // console.log(response.data.unGrouped)
            props.setIsLoading(false);

            const totalClasses = response.data.grouped.reduce((acc, group) => acc + group.members.length, 0) +
                response.data.unGrouped.length;

            if (totalClasses === 1) {
                if (response.data.grouped.length > 0) {
                    props.handleClassSelection(
                        response.data.grouped[0].members[0].classId,
                        response.data.grouped[0].members[0].className,
                        objectid,

                    );
                } else {
                    props.handleClassSelection(
                        response.data.unGrouped[0].classId,
                        response.data.unGrouped[0].className,
                        objectid,

                    );
                }
                // props.closeModal();
            } else {
                props.setIsDataOpen(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            props.setIsLoading(false);
        }
    };


    const UseTemplate = async (item) => {
        props.setLoadingDialog(true)

        props.setFormProperties([])
        props.setTemplateIsTrue(true)
        setSelectedTemplate(item)

        // console.log(props.selectedVault.guid)
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Templates/GetClassTemplateProps/${props.selectedVault.guid}/${item.classID}/${item.id}/${props.mfilesId}`
            );
            // setSelectedClassId(selectedClassId);
            props.setFormProperties(response.data);
            console.log(response.data);
            props.setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            props.setIsFormOpen(true);
            props.setLoadingDialog(false)

        } catch (error) {
            props.setLoadingDialog(false)
            console.error("Error fetching class properties:", error);
        } finally {
            props.setLoadingDialog(false)
            props.closeDataDialog();
        }
    };


    const dontUseTemplates = async () => {
        props.setLoadingDialog(true)
        props.setFormProperties([])
        props.setTemplateIsTrue(false)
        setSelectedTemplate({})
        // console.log(props.selectedClassId)
        // console.log(props.selectedClassName)
        props.setTemplateModalOpen(false)
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/ClassProps/${props.selectedVault.guid}/${props.selectedObjectId}/${props.selectedClassId}/${props.mfilesId}`
            );

            // setSelectedClassId(selectedClassId);
            props.setFormProperties(response.data);
            console.log(response.data);
            props.setFormValues(response.data.reduce((acc, prop) => {
                acc[prop.propId] = '';
                return acc;
            }, {}));
            props.setIsFormOpen(true);
            props.setLoadingDialog(false)
        } catch (error) {
            props.setLoadingDialog(false)
            console.error("Error fetching class properties:", error);
        } finally {
            props.setLoadingDialog(false)
            props.closeDataDialog();
        }
    };


    const handleInputChange = (propId, value) => {
        props.setFormValues({
            ...props.formValues,
            [propId]: value
        });

        const property = filteredProperties.find(prop => prop.propId === propId);
        const newFormErrors = { ...formErrors };

        if (!value && property.isRequired && !property.isAutomatic) {
            newFormErrors[propId] = `${property.title} is required`;
        } else {
            delete newFormErrors[propId];
        }

        setFormErrors(newFormErrors);
    };

function blobToBase64WithExtension(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1]; // base64 content
            let extension = '';

            // If the blob has a name (like a File object), extract extension from it
            if (blob.name && typeof blob.name === 'string') {
                const parts = blob.name.split('.');
                if (parts.length > 1) {
                    extension = parts.pop().toLowerCase();
                }
            } else {
                // Fallback to MIME type if no name is available
                const mimeType = blob.type;
                if (mimeType === 'application/pdf') {
                    extension = 'pdf';
                } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    extension = 'docx';
                } else if (mimeType === 'image/png') {
                    extension = 'png';
                } else if (mimeType === 'image/jpeg') {
                    extension = 'jpg';
                } else {
                    extension = ''; // unknown or unsupported
                }
            }

            resolve({ base64: base64Data, extension });
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}



    const handleFileChange = async (file) => {
        if (file) {
            setFileUploadError('');
        }
        setUploadedFile(file);
        const { base64, extension } = await blobToBase64WithExtension(file);
        setBase64Content(base64);
     
        setFileExt(extension)
    };

    // const filteredProperties = props.formProperties.filter(
    //     prop => prop.propId > 101 || prop.propId === 0 || prop.propId === 26  || prop.isRequired === true // except Name or title & Keywords

    // );

    const filteredProperties = props.formProperties.filter(
        prop => prop.propId >= 1000 || [0, 37, 38, 39, 41, 42, 43, 44].includes(prop.propId)
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


        console.log(propertiesPayload)

        propertiesPayload.forEach((prop) => {
            if (prop.isRequired && !props.formValues[prop.propId]) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (props.selectedObjectId === 0 && !props.templateIsTrue && !uploadedFile) {
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || (props.selectedObjectId === 0 && !uploadedFile && !props.templateIsTrue)) {
            // console.log(newFormErrors)
            setFormErrors(newFormErrors);
        } else {
            setMiniLoader(true);
            let payload = {
                objectTypeID: props.selectedObjectId,
                classID: props.selectedClassId,
                properties: propertiesPayload,
                vaultGuid: props.selectedVault.guid,
                objectID: selectedTemplate.id,
                userID: parseInt(props.mfilesId, 10)
            };

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    accept: '*/*',
                };

                let istemplate = props.templateIsTrue ? "True" : "False"

                if (!props.templateIsTrue) {
                    // Handle file upload if selectedObjectId is 0 and a file is uploaded
                    if (props.selectedObjectId === 0 && uploadedFile) {
                        const formData = new FormData();
                        formData.append('formFiles', uploadedFile);

                        const uploadResponse = await axios.post(
                            `${constants.mfiles_api}/api/objectinstance/FilesUploadAsync`,
                            formData,
                            {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                    accept: '*/*',
                                },
                            }
                        );

                        payload = {
                            objectID: props.selectedObjectId,
                            classID: props.selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: props.selectedVault.guid,
                            uploadId: uploadResponse.data.uploadID,
                            userID: parseInt(props.mfilesId, 10),
                        };
                    } else {
                        // Payload for non-file upload case
                        payload = {
                            objectID: props.selectedObjectId,
                            classID: props.selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: props.selectedVault.guid,
                            userID: parseInt(props.mfilesId, 10),
                        };
                    }

                    console.log(payload);

                    await axios.post(
                        `${constants.mfiles_api}/api/objectinstance/ObjectCreation`,
                        payload,
                        { headers }
                    );

                    // Success state management
                    setMiniLoader(false);
                    setOpenAlert(true);
                    setAlertSeverity("success");
                    setAlertMsg("Created successfully");
                    setUploadedFile(null);
                    closeFormDialog();
                    props.closeModal();
                } else {
                    // Payload for template creation
                    payload = {
                        objectTypeID: props.selectedObjectId,
                        classID: props.selectedClassId,
                        properties: propertiesPayload,
                        vaultGuid: props.selectedVault.guid,
                        objectID: selectedTemplate.id,
                        userID: parseInt(props.mfilesId, 10),
                    };

                    console.log(payload);

                    await axios.post(
                        `${constants.mfiles_api}/api/Templates/ObjectCreation`,
                        payload,
                        { headers }
                    );

                    // Success state management
                    setMiniLoader(false);
                    setOpenAlert(true);
                    setAlertSeverity("success");
                    setAlertMsg("Created successfully");
                    closeFormDialog();
                    props.closeModal();
                    props.setTemplateModalOpen(false);
                    props.setVaultObjectsModal(false);
                    props.setTemplateIsTrue(false)
                }
            } catch (error) {
                // Error handling
                setMiniLoader(false);
                console.error('Error submitting form:', error);
                setOpenAlert(true);
                setAlertSeverity("error");
                setAlertMsg("Error submitting form. Please try again.");
            }

        }
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };


    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const filterItems = (items) => {
        return items.filter((member) =>
            member.className.toLowerCase().includes(searchQuery) &&
            member.userPermission?.attachObjectsPermission
        );
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
            {props.loadingDialog ? <LoadingDialog opendialogloading={props.loadingDialog} /> : <>
                <TimedAlert
                    open={alertOpen}
                    onClose={setOpenAlert}
                    severity={alertSeverity}
                    message={alertMsg}
                    setSeverity={setAlertSeverity}
                    setMessage={setAlertMsg}
                />
                <MiniLoader
                    loading={miniLoader}
                    loaderMsg={'Creating new object...'}
                    setLoading={setMiniLoader}
                />

                <Dialog open={props.vaultObjectModalsOpen} onClose={props.closeModal} fullWidth>
                    <DialogTitle
                        className='p-2 d-flex justify-content-between align-items-center'
                        style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '14px' }}
                    >

                        <img className="mx-3" src={logo} alt="Loading" width="130px" />
                        <span className="ml-auto mx-3">
                            <FontAwesomeIcon icon={faPlus} className='mx-2' /> Create
                        </span>
                    </DialogTitle>


                    <DialogContent>
                        <p className='my-2' style={{ fontSize: '13px' }}>
                            Please select from Item types below
                        </p>

                        {/* Search Input */}
                        <TextField
                            variant="outlined"
                            placeholder="Search Object Type..."
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: '13px', color: '#555' } // label styling
                            }}
                            InputProps={{
                                sx: { fontSize: '13px', color: '#555' } // input text styling
                            }}
                            fullWidth
                            value={searchTerm}
                            onChange={handleSearchTermChange}
                            style={{ marginBottom: '10px' }}
                        />
                        <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                            <List className='p-0 list-group'>
                                {props.vaultObjectsList ? (
                                    <>
                                        {props.vaultObjectsList
                                            .filter((item) =>
                                                item.userPermission?.attachObjectsPermission &&
                                                item.namesingular.toLowerCase().includes(searchTerm.toLowerCase()) // Filter based on search term
                                            )
                                            .map((item) => (
                                                <ListItem
                                                    className="p-0 mx-2"
                                                    button
                                                    key={item.objectid}
                                                    onClick={() => fetchItemData(item.objectid, item.namesingular)}
                                                    disablePadding
                                                >
                                                    <ListItemIcon sx={{ minWidth: "auto", marginRight: "4px" }}>
                                                        <i className="fas fa-folder-plus mx-2" style={{ color: "#2a68af", fontSize: "20px" }}></i>
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.namesingular}
                                                        sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}
                                                    />
                                                </ListItem>
                                            ))}
                                    </>
                                ) : null}
                            </List>
                        </div>

                    </DialogContent>

                    <DialogActions>
                        <Button className='mx-4' color="warning" size='small' variant="contained" onClick={props.closeModal}>
                            Close
                        </Button>
                    </DialogActions>

                </Dialog>








                <Dialog open={props.isDataOpen} onClose={props.closeDataDialog} fullWidth>
                    {/* Dialog Title */}
                    <DialogTitle
                        className="p-2 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#2757aa", color: "#fff", fontSize: "14px" }}
                    >
                        <img src={logo} alt="Loading" width="130px" className="mx-3" />
                        <span className="flex items-center mx-3">
                            {props.selectedObjectId === 0 ?
                                <i style={{ color: "#fff", fontSize: "20px" }} className="fa-solid fa-file-circle-plus mx-1"></i> :
                                <i style={{ color: "#fff", fontSize: "20px" }} className="fas fa-folder-plus mx-1"></i>
                            } Select {props.selectedObjectName} Class

                        </span>
                    </DialogTitle>

                    {/* Dialog Content */}
                    <DialogContent>
                        <p className='mt-2' style={{ fontSize: '13px' }}>
                            Please select / search from classes below
                        </p>

                        {/* Search Input */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: '13px', color: '#555' } // label styling
                            }}
                            InputProps={{
                                sx: { fontSize: '13px', color: '#555' } // input text styling
                            }}
                            placeholder="Search class..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{ marginBottom: "10px", margin: '0%' }}
                        />

                        <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                            {props.isLoading ? (
                                <div className="flex justify-center items-center w-full">
                                    <CircularProgress size={24} />
                                </div>
                            ) : (
                                <List className='p-0 list-group' >
                                    {props.groupedItems.map((group) => {
                                        const filteredMembers = filterItems(group.members);
                                        return (
                                            filteredMembers.length > 0 && (
                                                <div key={group.classGroupId}>
                                                    <ListItem className='p-0 my-3' style={{ backgroundColor: '#ecf4fc' }}>
                                                        <ListItemText
                                                            primary={group.classGroupName}
                                                            className="p-1 mx-2"
                                                            style={{ '& .MuiTypography-root': { fontSize: '13px' }, color: '#555' }}

                                                        />
                                                    </ListItem>
                                                    <List component="div" disablePadding className="ml-4">
                                                        {filteredMembers.map((member) => (
                                                            <ListItem
                                                                key={member.classId}
                                                                onClick={() => { props.handleClassSelection(member.classId, member.className, props.selectedObjectId); setSearchQuery('') }}
                                                                className="p-0 mx-2 transition hover:bg-gray-100 rounded-lg"
                                                                button
                                                                disablePadding
                                                            >
                                                                <ListItemIcon sx={{ minWidth: "auto", marginRight: "8px" }}>
                                                                    <i className={`fas ${props.selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
                                                                        style={{ color: "#2a68af", fontSize: "20px" }}>
                                                                    </i>
                                                                </ListItemIcon>
                                                                <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '13px' } }} primary={member.className} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </div>
                                            )
                                        );
                                    })}

                                    {props.ungroupedItems.length > 0 && filterItems(props.ungroupedItems).length > 0 && (
                                        <>
                                            <ListItem className='p-0 my-3' style={{ backgroundColor: '#ecf4fc' }}>
                                                <ListItemText style={{ '& .MuiTypography-root': { fontSize: '13px' }, color: '#555' }} primary="Ungrouped" className="p-1 mx-2" />
                                            </ListItem>
                                            <List component="div" disablePadding className="ml-4">
                                                {filterItems(props.ungroupedItems).map((member) => (
                                                    <ListItem
                                                        key={member.classId}
                                                        onClick={() => props.handleClassSelection(member.classId, member.className, props.selectedObjectId)}
                                                        className="p-0 mx-2 transition hover:bg-gray-100 rounded-lg"
                                                        button
                                                        disablePadding
                                                    >
                                                        <ListItemIcon sx={{ minWidth: "auto", marginRight: "8px" }}>
                                                            <i className={`fas ${props.selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
                                                                style={{ color: "#2a68af", fontSize: "20px" }}>
                                                            </i>
                                                        </ListItemIcon>
                                                        <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '13px' } }} primary={member.className} />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </>
                                    )}
                                </List>
                            )}
                        </div>
                    </DialogContent>


                    {/* Dialog Actions */}
                    <DialogActions>
                        <Button className='mx-4' color="warning" size='small' variant="contained" onClick={props.closeDataDialog}>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={props.templateModalOpen} onClose={() => props.setTemplateModalOpen(false)} fullWidth>
                    {/* Dialog Title */}
                    <DialogTitle
                        className="p-2 d-flex justify-content-between align-items-center"
                        style={{ backgroundColor: "#2757aa", color: "#fff", fontSize: "14px" }}
                    >
                        <img src={logo} alt="Loading" width="130px" className="mx-3" />
                        <span className="flex items-center mx-3 cursor-pointer">

                            <i class="fa-solid fa-copy"></i> <span className=" mx-1">{props.selectedClassName} Templates</span>
                        </span>
                    </DialogTitle>

                    {/* Dialog Content */}
                    <DialogContent>
                        <p className="my-4" style={{ fontSize: "13px" }}>
                            Please select a template
                        </p>

                        <List className="p-0">
                            {props.templates && props.templates.length > 0 ? (
                                props.templates.map((item) => (
                                    <ListItem
                                        button
                                        key={item.id}
                                        onClick={() => UseTemplate(item)}
                                        className="p-2 mx-2 rounded-md transition hover:scale-105"
                                    >
                                        <ListItemIcon sx={{ minWidth: "auto", marginRight: "4px" }}>
                                            {props.selectedObjectId === 0 ?
                                                <i style={{ color: "#2a68af", fontSize: "20px" }} className="fa-solid fa-file-circle-plus mx-1"></i> :
                                                <i style={{ color: "#2a68af", fontSize: "20px" }} className="fas fa-folder-plus mx-1"></i>
                                            }
                                        </ListItemIcon>
                                        <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '13px' } }} primary={item.title} />
                                    </ListItem>
                                ))
                            ) : (
                                <p className="text-center my-2" style={{ color: "#2757aa" }}>
                                    No templates available
                                </p>
                            )}
                        </List>
                    </DialogContent>

                    {/* Dialog Actions */}
                    <DialogActions>



                        <Button className='mx-2' color="warning" size='small' variant="contained" onClick={() => { props.setTemplateModalOpen(false); props.setTemplateIsTrue(false) }} >
                            Close
                        </Button>
                        <Button className='mx-4' color="primary" size='small' variant="contained" onClick={dontUseTemplates} >
                            <i className="fa-solid fa-upload mx-2"></i> Skip Template & Upload File
                        </Button>
                    </DialogActions>
                </Dialog>



                <Dialog open={props.isFormOpen} onClose={closeFormDialog} fullScreen>
                    <DialogTitle
                        className='p-2 d-flex justify-content-between align-items-center'
                        style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                    >

                        <img className="mx-3" src={logo} alt="Loading" width="180px" />
                        <span className="ml-auto mx-3">
                            {props.selectedObjectId === 0 ?
                                <i style={{ color: "#fff", fontSize: "20px" }} className="fa-solid fa-file-circle-plus"></i> :
                                <i style={{ color: "#fff", fontSize: "20px" }} className="fas fa-folder-plus"></i>
                            }<small className='mx-2' >Create {props.selectedClassName} </small>
                        </span>
                    </DialogTitle>


                    <DialogContent
                        className="form-group my-4"
                        sx={{ overflow: 'auto' }}
                    >
                        {(props.selectedObjectId === 0 && !props.templateIsTrue) ?
                            <Grid container spacing={3}>
                                {/* List Section */}
                                <Grid item xs={12} md={5} order={{ xs: 1, md: 2 }} >

                                    <List sx={{ p: 0 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                marginY: '2px'
                                            }}
                                        >
                                            <Typography
                                                className="my-2"
                                                variant="body2"
                                                sx={{
                                                    color: 'black',

                                                    flexBasis: '35%',
                                                    fontSize: '13px',
                                                    textAlign: 'end'
                                                }}
                                            >
                                                Class :
                                            </Typography>
                                            <Box className="my-2" sx={{ flexBasis: '65%', fontSize: '13px', textAlign: 'start', ml: 1, fontSize: '13px', color: '#555' }}>
                                                {props.selectedClassName}
                                            </Box>
                                        </Box>

                                        {filteredProperties.map((prop) => (
                                            <ListItem key={prop.propId} sx={{ p: 0 }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        width: '100%',
                                                        marginY: '2px'
                                                    }}
                                                >
                                                    <Typography
                                                        className="my-2"
                                                        variant="body2"
                                                        sx={{
                                                            color: 'black',

                                                            flexBasis: '35%',
                                                            fontSize: '13px',
                                                            textAlign: 'end'
                                                        }}
                                                    >
                                                        {prop.title} {prop.isRequired && <span className="text-danger"> *</span>} :
                                                    </Typography>

                                                    <Box sx={{ width: '65%', fontSize: '13px', color: '#555', textAlign: 'start', ml: 1 }}>
                                                        <>
                                                            {prop.isAutomatic || !prop.userPermission.editPermission ?
                                                                <>
                                                                    <Typography
                                                                        className='my-2'
                                                                        variant="body2"
                                                                        sx={{
                                                                            fontSize: '13px'
                                                                        }}

                                                                    >
                                                                        ( Automatic )
                                                                    </Typography>
                                                                </> :
                                                                <Box sx={{ fontSize: '13px' }}>
                                                                    {['MFDatatypeText', 'MFDatatypeFloating', 'MFDatatypeInteger'].includes(prop.propertytype) && !prop.isHidden && (

                                                                        <TextField
                                                                            value={prop.value || props.formValues[prop.propId]}
                                                                            onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                            fullWidth
                                                                            required={prop.isRequired}
                                                                            error={!!formErrors[prop.propId]}
                                                                            helperText={formErrors[prop.propId]}
                                                                            size="small"
                                                                            className="my-1 bg-white"
                                                                            disabled={!!prop.value}
                                                                            InputProps={{ style: { fontSize: '13px' } }}
                                                                            InputLabelProps={{ style: { fontSize: '13px' } }}
                                                                        />

                                                                    )}

                                                                    {prop.propertytype === 'MFDatatypeMultiLineText' && !prop.isHidden && (
                                                                        <>
                                                                            {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
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
                                                                                    size="small"
                                                                                    className="my-1 bg-white"
                                                                                    InputProps={{ style: { fontSize: '13px' } }}
                                                                                    InputLabelProps={{ style: { fontSize: '13px' } }}
                                                                                /></>}
                                                                        </>

                                                                    )}

                                                                    {prop.propertytype === 'MFDatatypeLookup' && !prop.isHidden && (
                                                                        <>
                                                                            {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                <LookupSelect
                                                                                    userId={parseInt(props.mfilesId, 10)}
                                                                                    propId={prop.propId}
                                                                                    label={prop.title}
                                                                                    onChange={handleInputChange}
                                                                                    value={props.formValues[prop.propId]}
                                                                                    required={prop.isRequired}
                                                                                    error={!!formErrors[prop.propId]}
                                                                                    helperText={formErrors[prop.propId]}
                                                                                    selectedVault={props.selectedVault}
                                                                                    size="small"
                                                                                    className="my-1"
                                                                                /></>}
                                                                        </>

                                                                    )}

                                                                    {prop.propertytype === 'MFDatatypeMultiSelectLookup' && !prop.isHidden && (
                                                                        <>
                                                                            {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                <LookupMultiSelect
                                                                                    userId={parseInt(props.mfilesId, 10)}
                                                                                    propId={prop.propId}
                                                                                    label={prop.title}
                                                                                    onChange={handleInputChange}
                                                                                    value={props.formValues[prop.propId] || []}
                                                                                    required={prop.isRequired}
                                                                                    error={!!formErrors[prop.propId]}
                                                                                    helperText={formErrors[prop.propId]}
                                                                                    selectedVault={props.selectedVault}
                                                                                    size="small"
                                                                                    className="my-1"
                                                                                /></>}

                                                                        </>

                                                                    )}

                                                                    {prop.propertytype === 'MFDatatypeBoolean' && !prop.isHidden && (
                                                                        <>
                                                                            {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                <Select
                                                                                    size="small"
                                                                                    value={props.formValues[prop.propId] ?? (prop.value === "Yes" ? true : prop.value === "No" ? false : '')}
                                                                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                                    displayEmpty
                                                                                    fullWidth
                                                                                    className='bg-white'
                                                                                    sx={{
                                                                                        backgroundColor: 'white',
                                                                                        marginY: '8px',
                                                                                        fontSize: '13px',
                                                                                        '& .MuiSelect-select': {
                                                                                            fontSize: '13px',
                                                                                            color: '#555',
                                                                                            paddingTop: '6px',
                                                                                            paddingBottom: '6px',
                                                                                            paddingLeft: '10px',
                                                                                            paddingRight: '10px',
                                                                                            minHeight: 'unset',
                                                                                        },
                                                                                        '& .MuiInputBase-root': {
                                                                                            minHeight: '32px',
                                                                                        },
                                                                                        '& .MuiOutlinedInput-input': {
                                                                                            padding: '6px 10px',
                                                                                            fontSize: '13px',
                                                                                        },
                                                                                        '& .MuiMenuItem-root': {
                                                                                            fontSize: '13px',
                                                                                            color: '#555',
                                                                                        },
                                                                                    }}
                                                                                >
                                                                                    <MenuItem sx={{ fontSize: '13px', color: '#555' }} value=""><em>None</em></MenuItem>
                                                                                    <MenuItem sx={{ fontSize: '13px', color: '#555' }} value={true}>True</MenuItem>
                                                                                    <MenuItem sx={{ fontSize: '13px', color: '#555' }} value={false}>False</MenuItem>
                                                                                </Select></>}
                                                                        </>

                                                                    )}

                                                                    {prop.propertytype === 'MFDatatypeTimestamp' && !prop.isHidden && (
                                                                        <>
                                                                            {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                <input
                                                                                    style={{ color: '#555', fontSize: '13px' }}
                                                                                    type="datetime-local"
                                                                                    className="form-control bg-white"
                                                                                    value={props.formValues[prop.propId] || ''}
                                                                                    onChange={(e) => handleInputChange(prop.propId, e.target.value, prop.propertytype)}
                                                                                /></>}
                                                                        </>

                                                                    )}

                                                                    {prop.propertytype === 'MFDatatypeDate' && !prop.isHidden && (
                                                                        <>
                                                                            {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                <TextField
                                                                                    type="date"
                                                                                    value={props.formValues[prop.propId]}
                                                                                    onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                                    fullWidth
                                                                                    required={prop.isRequired}
                                                                                    error={!!formErrors[prop.propId]}
                                                                                    helperText={formErrors[prop.propId]}
                                                                                    InputLabelProps={{
                                                                                        shrink: true,
                                                                                        sx: { fontSize: '13px', color: '#555' } // label styling
                                                                                    }}
                                                                                    InputProps={{
                                                                                        sx: { fontSize: '13px', color: '#555' } // input text styling
                                                                                    }}
                                                                                    size="small"
                                                                                    className="my-1 bg-white"
                                                                                />
                                                                            </>}
                                                                        </>

                                                                    )}
                                                                </Box>
                                                            }
                                                        </>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        ))}
                                    </List>

                                </Grid>

                                {/* File Upload Section */}
                                <Grid item xs={12} md={7} order={{ xs: 2, md: 2 }} >
                                    <div className='container'>
                                        {(props.selectedObjectId === 0 && !props.templateIsTrue) && (
                                            <>
                                                {uploadedFile ?
                                                    <>
                                                        <DynamicFileViewer base64Content={base64Content} fileExtension={fileExt} setUploadedFile={setUploadedFile} />


                                                    </>
                                                    : <>     <FileUploadComponent
                                                        handleFileChange={handleFileChange}
                                                        uploadedFile={uploadedFile}
                                                    />
                                                        {fileUploadError && (
                                                            <div style={{ color: '#CC3333', fontSize: '13px' }}>
                                                                {fileUploadError}
                                                            </div>
                                                        )}</>
                                                }


                                            </>
                                        )}
                                    </div>
                                </Grid>
                            </Grid>
                            : <>
                                <Grid
                                    container
                                    spacing={2}
                                    justifyContent="center"
                                    alignItems="center"

                                >
                                    <Grid item xs={12} md={6}>
                                        <List sx={{ p: 0 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    width: '100%',
                                                    marginY: '2px'
                                                }}
                                            >
                                                <Typography
                                                    className="my-2"
                                                    variant="body2"
                                                    sx={{
                                                        color: 'black',

                                                        flexBasis: '35%',
                                                        fontSize: '13px',
                                                        textAlign: 'end'
                                                    }}
                                                >
                                                    Class :
                                                </Typography>
                                                <Box className="my-2" sx={{ flexBasis: '65%', fontSize: '13px', textAlign: 'start', ml: 1, fontSize: '13px', color: '#555' }}>
                                                    {props.selectedClassName}
                                                </Box>
                                            </Box>

                                            {filteredProperties.map((prop) => (
                                                <ListItem key={prop.propId} sx={{ p: 0 }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            marginY: '2px'
                                                        }}
                                                    >
                                                        <Typography
                                                            className="my-2"
                                                            variant="body2"
                                                            sx={{
                                                                color: 'black',

                                                                flexBasis: '35%',
                                                                fontSize: '13px',
                                                                textAlign: 'end'
                                                            }}
                                                        >
                                                            {prop.title} {prop.isRequired && <span className="text-danger"> *</span>} :
                                                        </Typography>

                                                        <Box sx={{ width: '65%', fontSize: '13px', color: '#555', textAlign: 'start', ml: 1 }}>
                                                            <>
                                                                {prop.isAutomatic || !prop.userPermission.editPermission ?
                                                                    <>
                                                                        <Typography
                                                                            className='my-2'
                                                                            variant="body2"
                                                                            sx={{
                                                                                fontSize: '13px'
                                                                            }}

                                                                        >
                                                                            ( Automatic )
                                                                        </Typography>
                                                                    </> :
                                                                    <Box sx={{ fontSize: '13px' }}>
                                                                        {['MFDatatypeText', 'MFDatatypeFloating', 'MFDatatypeInteger'].includes(prop.propertytype) && !prop.isHidden && (

                                                                            <TextField
                                                                                value={prop.value || props.formValues[prop.propId]}
                                                                                onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                                fullWidth
                                                                                required={prop.isRequired}
                                                                                error={!!formErrors[prop.propId]}
                                                                                helperText={formErrors[prop.propId]}
                                                                                size="small"
                                                                                className="my-1 bg-white"
                                                                                disabled={!!prop.value}
                                                                                InputProps={{ style: { fontSize: '13px' } }}
                                                                                InputLabelProps={{ style: { fontSize: '13px' } }}
                                                                            />

                                                                        )}

                                                                        {prop.propertytype === 'MFDatatypeMultiLineText' && !prop.isHidden && (
                                                                            <>
                                                                                {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
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
                                                                                        size="small"
                                                                                        className="my-1 bg-white"
                                                                                        InputProps={{ style: { fontSize: '13px' } }}
                                                                                        InputLabelProps={{ style: { fontSize: '13px' } }}
                                                                                    /></>}
                                                                            </>

                                                                        )}

                                                                        {prop.propertytype === 'MFDatatypeLookup' && !prop.isHidden && (
                                                                            <>
                                                                                {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                    <LookupSelect
                                                                                        userId={parseInt(props.mfilesId, 10)}
                                                                                        propId={prop.propId}
                                                                                        label={prop.title}
                                                                                        onChange={handleInputChange}
                                                                                        value={props.formValues[prop.propId]}
                                                                                        required={prop.isRequired}
                                                                                        error={!!formErrors[prop.propId]}
                                                                                        helperText={formErrors[prop.propId]}
                                                                                        selectedVault={props.selectedVault}
                                                                                        size="small"
                                                                                        className="my-1"
                                                                                    /></>}
                                                                            </>

                                                                        )}

                                                                        {prop.propertytype === 'MFDatatypeMultiSelectLookup' && !prop.isHidden && (
                                                                            <>
                                                                                {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                    <LookupMultiSelect
                                                                                        userId={parseInt(props.mfilesId, 10)}
                                                                                        propId={prop.propId}
                                                                                        label={prop.title}
                                                                                        onChange={handleInputChange}
                                                                                        value={props.formValues[prop.propId] || []}
                                                                                        required={prop.isRequired}
                                                                                        error={!!formErrors[prop.propId]}
                                                                                        helperText={formErrors[prop.propId]}
                                                                                        selectedVault={props.selectedVault}
                                                                                        size="small"
                                                                                        className="my-1"
                                                                                    /></>}

                                                                            </>

                                                                        )}

                                                                        {prop.propertytype === 'MFDatatypeBoolean' && !prop.isHidden && (
                                                                            <>
                                                                                {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                    <Select
                                                                                        size="small"
                                                                                        value={props.formValues[prop.propId] ?? (prop.value === "Yes" ? true : prop.value === "No" ? false : '')}
                                                                                        onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                                        displayEmpty
                                                                                        fullWidth
                                                                                        className='bg-white'
                                                                                        sx={{
                                                                                            backgroundColor: 'white',
                                                                                            marginY: '8px',
                                                                                            fontSize: '13px',
                                                                                            '& .MuiSelect-select': {
                                                                                                fontSize: '13px',
                                                                                                color: '#555',
                                                                                                paddingTop: '6px',
                                                                                                paddingBottom: '6px',
                                                                                                paddingLeft: '10px',
                                                                                                paddingRight: '10px',
                                                                                                minHeight: 'unset',
                                                                                            },
                                                                                            '& .MuiInputBase-root': {
                                                                                                minHeight: '32px',
                                                                                            },
                                                                                            '& .MuiOutlinedInput-input': {
                                                                                                padding: '6px 10px',
                                                                                                fontSize: '13px',
                                                                                            },
                                                                                            '& .MuiMenuItem-root': {
                                                                                                fontSize: '13px',
                                                                                                color: '#555',
                                                                                            },
                                                                                        }}
                                                                                    >
                                                                                        <MenuItem sx={{ fontSize: '13px', color: '#555' }} value=""><em>None</em></MenuItem>
                                                                                        <MenuItem sx={{ fontSize: '13px', color: '#555' }} value={true}>True</MenuItem>
                                                                                        <MenuItem sx={{ fontSize: '13px', color: '#555' }} value={false}>False</MenuItem>
                                                                                    </Select></>}
                                                                            </>

                                                                        )}

                                                                        {prop.propertytype === 'MFDatatypeTimestamp' && !prop.isHidden && (
                                                                            <>
                                                                                {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                    <input
                                                                                        style={{ color: '#555', fontSize: '13px' }}
                                                                                        type="datetime-local"
                                                                                        className="form-control bg-white"
                                                                                        value={props.formValues[prop.propId] || ''}
                                                                                        onChange={(e) => handleInputChange(prop.propId, e.target.value, prop.propertytype)}
                                                                                    /></>}
                                                                            </>

                                                                        )}

                                                                        {prop.propertytype === 'MFDatatypeDate' && !prop.isHidden && (
                                                                            <>
                                                                                {prop.value ? <> <p className="p-1 my-1"> {prop.value} </p></> : <>
                                                                                    <TextField
                                                                                        type="date"
                                                                                        value={props.formValues[prop.propId]}
                                                                                        onChange={(e) => handleInputChange(prop.propId, e.target.value)}
                                                                                        fullWidth
                                                                                        required={prop.isRequired}
                                                                                        error={!!formErrors[prop.propId]}
                                                                                        helperText={formErrors[prop.propId]}
                                                                                        InputLabelProps={{
                                                                                            shrink: true,
                                                                                            sx: { fontSize: '13px', color: '#555' } // label styling
                                                                                        }}
                                                                                        InputProps={{
                                                                                            sx: { fontSize: '13px', color: '#555' } // input text styling
                                                                                        }}
                                                                                        size="small"
                                                                                        className="my-1 bg-white"
                                                                                    />
                                                                                </>}
                                                                            </>

                                                                        )}
                                                                    </Box>
                                                                }
                                                            </>
                                                        </Box>
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Grid>


                                </Grid>
                            </>
                        }
                    </DialogContent>







                    <DialogActions style={{ backgroundColor: '#ecf4fc' }}>

                        <Button className='mx-2' color="warning" size='small' variant="contained" onClick={() => { closeFormDialog(); props.setTemplateIsTrue(false); setUploadedFile(null) }}>Cancel</Button>
                        <Button className='mx-4' color="primary" size='medium' variant="contained" onClick={handleSubmit} >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>

            </>}
        </>





    );
};

export default ObjectStructureList;
