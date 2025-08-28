import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import LookupSelect from '../CustomFormTags/NewObjectFormLookup';
import LookupMultiSelect from '../CustomFormTags/NewObjectFormLookupMultiSelect';
import MiniLoader from './MiniLoaderDialog';
import logo from '../../images/ZFWHITE.png';
import FileUploadComponent from '../FileUpload';
import * as constants from '../Auth/configs';
import TimedAlert from '../TimedAlert';
import LoadingDialog from '../Loaders/LoaderDialog';
import PDFViewerPreview from '../Viewer/Pdf2';
import DynamicFileViewer from '../Viewer/DynamicFileViewer2';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';

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

// Main Object Selection Dialog
const MainObjectDialog = React.memo(({
    open,
    onClose,
    vaultObjectsList,
    onSelectItem,
    searchTerm,
    onSearchChange
}) => {
    const filteredObjects = useMemo(() =>
        vaultObjectsList?.filter(item =>
            item.userPermission?.attachObjectsPermission &&
            item.namesingular.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [],
        [vaultObjectsList, searchTerm]
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
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

                <TextField
                    variant="outlined"
                    placeholder="Search Object Type..."
                    size="small"
                    InputLabelProps={{
                        shrink: true,
                        sx: { fontSize: '13px', color: '#555' }
                    }}
                    InputProps={{
                        sx: { fontSize: '13px', color: '#555' }
                    }}
                    fullWidth
                    value={searchTerm}
                    onChange={onSearchChange}
                    style={{ marginBottom: '10px' }}
                />

                <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                    <List className='p-0 list-group'>
                        {filteredObjects.map((item) => (
                            <ListItem
                                className="p-0 mx-2"
                                button
                                key={item.objectid}
                                onClick={() => onSelectItem(item.objectid, item.namesingular)}
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
                    </List>
                </div>
            </DialogContent>

            <DialogActions>
                <Button sx={{ textTransform: 'none' }} className='mx-4 rounded-pill' color="warning" size='small' variant="contained" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
});

// Class Selection Dialog
const ClassSelectionDialog = React.memo(({
    open,
    onClose,
    selectedObjectName,
    selectedObjectId,
    isLoading,
    groupedItems,
    ungroupedItems,
    onClassSelect,
    searchQuery,
    onSearchChange
}) => {
    const filterItems = useCallback((items) => {
        return items.filter((member) =>
            member.className.toLowerCase().includes(searchQuery) &&
            member.userPermission?.attachObjectsPermission
        );
    }, [searchQuery]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle
                className="p-2 d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#2757aa", color: "#fff", fontSize: "14px" }}
            >
                <img src={logo} alt="Loading" width="130px" className="mx-3" />
                <span className="flex items-center mx-3">
                    {selectedObjectId === 0 ?
                        <i style={{ color: "#fff", fontSize: "20px" }} className="fa-solid fa-file-circle-plus mx-1"></i> :
                        <i style={{ color: "#fff", fontSize: "20px" }} className="fas fa-folder-plus mx-1"></i>
                    } Select {selectedObjectName} Class
                </span>
            </DialogTitle>

            <DialogContent>
                <p className='mt-2' style={{ fontSize: '13px' }}>
                    Please select / search from classes below
                </p>

                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputLabelProps={{
                        shrink: true,
                        sx: { fontSize: '13px', color: '#555' }
                    }}
                    InputProps={{
                        sx: { fontSize: '13px', color: '#555' }
                    }}
                    placeholder="Search class..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    style={{ marginBottom: "10px", margin: '0%' }}
                />

                <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {isLoading ? (
                        <div className="flex justify-center items-center w-full">
                            <CircularProgress size={24} />
                        </div>
                    ) : (
                        <List className='p-0 list-group'>
                            {groupedItems.map((group) => {
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
                                                        onClick={() => onClassSelect(member.classId, member.className, selectedObjectId)}
                                                        className="p-0 mx-2 transition hover:bg-gray-100 rounded-lg"
                                                        button
                                                        disablePadding
                                                    >
                                                        <ListItemIcon sx={{ minWidth: "auto", marginRight: "8px" }}>
                                                            <i className={`fas ${selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
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

                            {ungroupedItems.length > 0 && filterItems(ungroupedItems).length > 0 && (
                                <>
                                    <ListItem className='p-0 my-3' style={{ backgroundColor: '#ecf4fc' }}>
                                        <ListItemText style={{ '& .MuiTypography-root': { fontSize: '13px' }, color: '#555' }} primary="Ungrouped" className="p-1 mx-2" />
                                    </ListItem>
                                    <List component="div" disablePadding className="ml-4">
                                        {filterItems(ungroupedItems).map((member) => (
                                            <ListItem
                                                key={member.classId}
                                                onClick={() => onClassSelect(member.classId, member.className, selectedObjectId)}
                                                className="p-0 mx-2 transition hover:bg-gray-100 rounded-lg"
                                                button
                                                disablePadding
                                            >
                                                <ListItemIcon sx={{ minWidth: "auto", marginRight: "8px" }}>
                                                    <i className={`fas ${selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
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

            <DialogActions>
                <Button sx={{ textTransform: 'none' }} className='mx-4 rounded-pill' color="warning" size='small' variant="contained" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
});

// Template Selection Dialog
const TemplateSelectionDialog = React.memo(({
    open,
    onClose,
    selectedClassName,
    selectedObjectId,
    templates,
    onUseTemplate,
    onDontUseTemplates
}) => (
    <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle
            className="p-2 d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#2757aa", color: "#fff", fontSize: "14px" }}
        >
            <img src={logo} alt="Loading" width="130px" className="mx-3" />
            <span className="flex items-center mx-3 cursor-pointer">
                <i class="fa-solid fa-copy"></i>
                <span className=" mx-1">{selectedClassName} Templates</span>
            </span>
        </DialogTitle>

        <DialogContent>
            <p className="my-4" style={{ fontSize: "13px" }}>
                Please select a template
            </p>

            <List className="p-0">
                {templates && templates.length > 0 ? (
                    templates.map((item) => (
                        <ListItem
                            button
                            key={item.id}
                            onClick={() => onUseTemplate(item)}
                            className="p-2 mx-2 rounded-md transition hover:scale-105"
                        >
                            <ListItemIcon sx={{ minWidth: "auto", marginRight: "4px" }}>
                                {selectedObjectId === 0 ?
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

        <DialogActions>
            <Button sx={{ textTransform: 'none' }} className='mx-2 rounded-pill' color="warning" size='small' variant="contained" onClick={onClose}>
                Close
            </Button>
            <Button sx={{ textTransform: 'none', fontSize: '12px' }} className='mx-4 rounded-pill' color="primary" size='small' variant="contained" onClick={onDontUseTemplates}>
                <i className="fa-solid fa-upload mx-2"></i> Upload File Without Template / Switch Template
            </Button>
        </DialogActions>
    </Dialog>
));

// Form Field Component
const FormField = React.memo(({
    prop,
    value,
    onChange,
    error,
    selectedVault,
    mfilesId
}) => {
    if (prop.isAutomatic || !prop.userPermission.editPermission) {
        return (
            <Typography
                className='my-2'
                variant="body2"
                sx={{ fontSize: '13px' }}
            >
                ( Automatic )
            </Typography>
        );
    }

    const handleChange = (newValue) => onChange(prop.propId, newValue);

    switch (prop.propertytype) {
        case 'MFDatatypeText':
        case 'MFDatatypeFloating':
        case 'MFDatatypeInteger':
            if (prop.isHidden) return null;
            return (
                <TextField
                    value={prop.value || value}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    size="small"
                    className="my-1 bg-white"
                    disabled={!!prop.value}
                    InputProps={{ style: { fontSize: '13px' } }}
                    InputLabelProps={{ style: { fontSize: '13px' } }}
                />
            );

        case 'MFDatatypeMultiLineText':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <TextField
                    label={prop.title}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    multiline
                    rows={4}
                    size="small"
                    className="my-1 bg-white"
                    InputProps={{ style: { fontSize: '13px' } }}
                    InputLabelProps={{ style: { fontSize: '13px' } }}
                />
            );

        case 'MFDatatypeLookup':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <LookupSelect
                    userId={parseInt(mfilesId, 10)}
                    propId={prop.propId}
                    label={prop.title}
                    onChange={onChange}
                    value={value}
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    selectedVault={selectedVault}
                    size="small"
                    className="my-1"
                />
            );

        case 'MFDatatypeMultiSelectLookup':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <LookupMultiSelect
                    userId={parseInt(mfilesId, 10)}
                    propId={prop.propId}
                    label={prop.title}
                    onChange={onChange}
                    value={value || []}
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    selectedVault={selectedVault}
                    size="small"
                    className="my-1"
                />
            );

        case 'MFDatatypeBoolean':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <Select
                    size="small"
                    value={value ?? (prop.value === "Yes" ? true : prop.value === "No" ? false : '')}
                    onChange={(e) => handleChange(e.target.value)}
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
                </Select>
            );

        case 'MFDatatypeTimestamp':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <input
                    style={{ color: '#555', fontSize: '13px' }}
                    type="datetime-local"
                    className="form-control bg-white"
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                />
            );

        case 'MFDatatypeDate':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <TextField
                    type="date"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    InputLabelProps={{
                        shrink: true,
                        sx: { fontSize: '13px', color: '#555' }
                    }}
                    InputProps={{
                        sx: { fontSize: '13px', color: '#555' }
                    }}
                    size="small"
                    className="my-1 bg-white"
                />
            );

        default:
            return null;
    }
});

// Properties List Component
const PropertiesList = React.memo(({
    properties,
    formValues,
    formErrors,
    selectedClassName,
    selectedTemplate,
    selectedVault,
    templateIsTrue,
    onInputChange,
    mfilesId
}) => (
    <List sx={{ p: 0 }}>
        {templateIsTrue && (
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
                        textAlign: 'end',
                    }}
                >
                    FROM TEMPLATE:
                </Typography>
                <Box className="my-2" sx={{ flexBasis: '65%', fontSize: '13px', textAlign: 'start', ml: 1, fontSize: '13px', color: '#555' }}>
                    <span className='mx-2'>
                        <FileExtIcon
                            fontSize={'20px'}
                            guid={selectedVault?.guid}
                            objectId={selectedTemplate.id}
                            classId={selectedTemplate.classID}
                            version={selectedTemplate.versionId?? null}
                            
                        />
                    </span>
                    {selectedTemplate?.title}
                    <FileExtText
                        guid={selectedVault?.guid}
                        objectId={selectedTemplate.id}
                        classId={selectedTemplate.classID}
                        version={selectedTemplate.versionId?? null}
                            
                    />
                </Box>
            </Box>
        )}

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
                {selectedClassName}
            </Box>
        </Box>

        {properties.map((prop) => (
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
                        <FormField
                            prop={prop}
                            value={formValues[prop.propId]}
                            onChange={onInputChange}
                            error={formErrors[prop.propId]}
                            selectedVault={selectedVault}
                            mfilesId={mfilesId}
                        />
                    </Box>
                </Box>
            </ListItem>
        ))}
    </List>
));

// Template Actions Component
const TemplateActions = React.memo(({
    templateIsTrue,
    templates,
    selectedVault,
    onUseTemplate,
    onDontUseTemplates
}) => {
    if (templateIsTrue) {
        return (
            <a
                href="#"
                style={{
                    color: '#2757aa',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                }}
                onClick={(e) => {
                    e.preventDefault();
                    onDontUseTemplates();
                }}
                onMouseEnter={(e) => e.target.style.color = '#4a7bc8'}
                onMouseLeave={(e) => e.target.style.color = '#2757aa'}
            >
                <i className="fa-solid fa-upload mx-2"></i>
                Upload File Without Template / Change Template
            </a>
        );
    }

    return (
        <List
            className="p-0"
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center'
            }}
        >
            {templates && templates.length > 0 ? (
                templates.map((item) => (
                    <ListItem
                        button
                        key={item.id}
                        onClick={() => onUseTemplate(item)}
                        className="rounded-md transition hover:scale-105"
                        sx={{
                            width: 'auto',
                            minWidth: 'fit-content',
                            p: 1,
                            m: 0,
                            border: '1px solid #dee2e6',
                            '&:hover': {
                                backgroundColor: '#f8f9fa'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: "auto", marginRight: "6px" }}>
                            <span className='mx-2'>
                                <FileExtIcon
                                    fontSize={'20px'}
                                    guid={selectedVault?.guid}
                                    objectId={item.id}
                                    classId={item.classID}
                                    version={item.versionId?? null}
                            
                                />
                            </span>
                        </ListItemIcon>
                        <ListItemText
                            sx={{ '& .MuiTypography-root': { fontSize: '12px', whiteSpace: 'nowrap' } }}
                            primary={
                                <>
                                    {item.title}
                                    <FileExtText
                                        guid={selectedVault?.guid}
                                        objectId={item.id}
                                        classId={item.classID}
                                        version={item.versionId?? null}
                                    />
                                </>
                            }
                        />
                    </ListItem>
                ))
            ) : (
                <p className="text-center my-2" style={{ color: "#2757aa" }}>
                    No templates available
                </p>
            )}
        </List>
    );
});

// Main Component
const NewObjectDialog = (props) => {
    const [miniLoader, setMiniLoader] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [fileUploadError, setFileUploadError] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [base64Content, setBase64Content] = useState('');
    const [fileExt, setFileExt] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState("");

    // Memoized filtered properties
    const filteredProperties = useMemo(() =>
        props.formProperties.filter(
            prop => prop.propId >= 1000 || [0, 37, 38, 39, 41, 42, 43, 44].includes(prop.propId)
        ),
        [props.formProperties]
    );

    const closeFormDialog = useCallback(() => {
        props.setIsFormOpen(false);
    }, [props.setIsFormOpen]);

    const fetchItemData = useCallback(async (objectid, objectname) => {
        setSearchTerm("");
        props.setSelectedObjectName(objectname);
        props.setIsLoading(true);
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/MfilesObjects/GetObjectClasses/${props.selectedVault.guid}/${objectid}/${props.mfilesId}`
            );

            props.setSelectedObjectId(objectid);
            props.setGroupedItems(response.data.grouped);
            props.setUngroupedItems(response.data.unGrouped);
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
            } else {
                props.setIsDataOpen(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            props.setIsLoading(false);
        }
    }, [props]);

    const handleInputChange = useCallback((propId, value) => {
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
    }, [props.formValues, props.setFormValues, filteredProperties, formErrors]);

    const blobToBase64WithExtension = useCallback((blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                let extension = '';

                if (blob.name && typeof blob.name === 'string') {
                    const parts = blob.name.split('.');
                    if (parts.length > 1) {
                        extension = parts.pop().toLowerCase();
                    }
                } else {
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
                        extension = '';
                    }
                }

                resolve({ base64: base64Data, extension });
            };

            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }, []);

    const handleFileChange = useCallback(async (file) => {
        if (file) {
            setFileUploadError('');
        }
        setUploadedFile(file);
        const { base64, extension } = await blobToBase64WithExtension(file);
        setBase64Content(base64);
        setFileExt(extension);
    }, [blobToBase64WithExtension]);

    const handleSubmit = useCallback(async () => {
        const newFormErrors = {};
        const propertiesPayload = filteredProperties
            .filter(prop => props.formValues[prop.propId] !== undefined && props.formValues[prop.propId] !== '' && !prop.isAutomatic)
            .map(prop => ({
                value: `${props.formValues[prop.propId]}`,
                propId: prop.propId,
                propertytype: prop.propertytype
            }));

        propertiesPayload.forEach((prop) => {
            if (prop.isRequired && !props.formValues[prop.propId]) {
                newFormErrors[prop.propId] = `${prop.title} is required`;
            }
        });

        if (props.selectedObjectId === 0 && !props.templateIsTrue && !uploadedFile) {
            setFileUploadError('File upload is required.');
        }

        if (Object.keys(newFormErrors).length > 0 || (props.selectedObjectId === 0 && !uploadedFile && !props.templateIsTrue)) {
            setFormErrors(newFormErrors);
        } else {
            setMiniLoader(true);
            let payload = {
                objectTypeID: props.selectedObjectId,
                classID: props.selectedClassId,
                properties: propertiesPayload,
                vaultGuid: props.selectedVault.guid,
                objectID: props.selectedTemplate.id,
                userID: parseInt(props.mfilesId, 10)
            };

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    accept: '*/*',
                };

                if (!props.templateIsTrue) {
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
                        payload = {
                            objectID: props.selectedObjectId,
                            classID: props.selectedClassId,
                            properties: propertiesPayload,
                            vaultGuid: props.selectedVault.guid,
                            userID: parseInt(props.mfilesId, 10),
                        };
                    }

                    await axios.post(
                        `${constants.mfiles_api}/api/objectinstance/ObjectCreation`,
                        payload,
                        { headers }
                    );

                    setMiniLoader(false);
                    setOpenAlert(true);
                    setAlertSeverity("success");
                    setAlertMsg("Created successfully");
                    setUploadedFile(null);
                    closeFormDialog();
                    props.closeModal();
                    setTimeout(() => {
                        props.getRecent?.();
                        props.getAssigned?.();
                    }, 10000); // 5000ms = 5 seconds

                } else {
                    payload = {
                        objectTypeID: props.selectedObjectId,
                        classID: props.selectedClassId,
                        properties: propertiesPayload,
                        vaultGuid: props.selectedVault.guid,
                        objectID: props.selectedTemplate.id,
                        userID: parseInt(props.mfilesId, 10),
                    };

                    await axios.post(
                        `${constants.mfiles_api}/api/Templates/ObjectCreation`,
                        payload,
                        { headers }
                    );


                    setMiniLoader(false);
                    setOpenAlert(true);
                    setAlertSeverity("success");
                    setAlertMsg("Created successfully");
                    closeFormDialog();
                    props.closeModal();
                    props.setTemplateModalOpen(false);
                    props.setVaultObjectsModal(false);
                    props.setTemplateIsTrue(false);

                    setTimeout(() => {
                        props.getRecent?.();
                        props.getAssigned?.();
                    }, 10000); // 5000ms = 5 seconds
                }
            } catch (error) {
                setMiniLoader(false);
                console.error('Error submitting form:', error);
                setOpenAlert(true);
                setAlertSeverity("error");
                setAlertMsg("Error submitting form. Please try again.");
            }
        }

    }, [filteredProperties, props, uploadedFile, closeFormDialog]);

    const handleSearchTermChange = useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value.toLowerCase());
    }, []);

    const handleClassSelection = useCallback((classId, className, objectId) => {
        props.handleClassSelection(classId, className, objectId);
        setSearchQuery('');
    }, [props.handleClassSelection]);

    useEffect(() => {
        // Component effect logic here if needed
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
            {props.loadingDialog ? (
                <LoadingDialog opendialogloading={props.loadingDialog} />
            ) : (
                <>
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
                        loaderMsg={'Creating new object'}
                        setLoading={setMiniLoader}
                    />

                    <MainObjectDialog
                        open={props.vaultObjectModalsOpen}
                        onClose={props.closeModal}
                        vaultObjectsList={props.vaultObjectsList}
                        onSelectItem={fetchItemData}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchTermChange}
                    />

                    <ClassSelectionDialog
                        open={props.isDataOpen}
                        onClose={props.closeDataDialog}
                        selectedObjectName={props.selectedObjectName}
                        selectedObjectId={props.selectedObjectId}
                        isLoading={props.isLoading}
                        groupedItems={props.groupedItems}
                        ungroupedItems={props.ungroupedItems}
                        onClassSelect={handleClassSelection}
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                    />

                    <TemplateSelectionDialog
                        open={props.templateModalOpen}
                        onClose={() => props.setTemplateModalOpen(false)}
                        selectedClassName={props.selectedClassName}
                        selectedObjectId={props.selectedObjectId}
                        templates={props.templates}
                        onUseTemplate={props.UseTemplate}
                        onDontUseTemplates={props.dontUseTemplates}
                    />

                    <Dialog open={props.isFormOpen} onClose={closeFormDialog} maxWidth='xl'>
                        <DialogTitle
                            className='p-2 d-flex justify-content-between align-items-center'
                            style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
                        >
                            <img className="mx-3" src={logo} alt="Loading" width="180px" />
                            <span className="ml-auto mx-3">
                                {props.selectedObjectId === 0 ? (
                                    <i
                                        style={{ color: "#fff", fontSize: "20px" }}
                                        className="fa-solid fa-file-circle-plus"
                                    />
                                ) : (
                                    <i
                                        style={{ color: "#fff", fontSize: "20px" }}
                                        className="fas fa-folder-plus"
                                    />
                                )}
                                <small className='mx-2'>Create {props.selectedClassName}</small>
                            </span>
                        </DialogTitle>

                        <DialogContent
                            className="form-group my-3"
                            sx={{ overflow: 'auto' }}
                        >
                            {(props.selectedObjectId === 0 && !props.templateIsTrue) ? (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={7} order={{ xs: 1, md: 2 }} sx={{ width: '250px' }}>
                                        <PropertiesList
                                            properties={filteredProperties}
                                            formValues={props.formValues}
                                            formErrors={formErrors}
                                            selectedClassName={props.selectedClassName}
                                            selectedTemplate={props.selectedTemplate}
                                            selectedVault={props.selectedVault}
                                            templateIsTrue={props.templateIsTrue}
                                            onInputChange={handleInputChange}
                                            mfilesId={props.mfilesId}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={5} order={{ xs: 2, md: 2 }} sx={{ width: '700px' }}>
                                        <div className='container'>
                                            <FileUploadComponent
                                                handleFileChange={handleFileChange}
                                                uploadedFile={uploadedFile}
                                            />
                                            {fileUploadError && (
                                                <div style={{ color: '#CC3333', fontSize: '13px' }}>
                                                    {fileUploadError}
                                                </div>
                                            )}
                                        </div>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={12} sx={{ width: '650px' }}>
                                        <PropertiesList
                                            properties={filteredProperties}
                                            formValues={props.formValues}
                                            formErrors={formErrors}
                                            selectedClassName={props.selectedClassName}
                                            selectedTemplate={props.selectedTemplate}
                                            selectedVault={props.selectedVault}
                                            templateIsTrue={props.templateIsTrue}
                                            onInputChange={handleInputChange}
                                            mfilesId={props.mfilesId}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </DialogContent>


                        <DialogActions
                            style={{
                                backgroundColor: '#ecf4fc',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                padding: '16px',
                                gap: '16px'
                            }}
                        >
                            {/* Left Side - Template Section */}
                            <Box sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                minHeight: '40px'
                            }}>
                                {props.templateIsTrue ? (
                                    // When using template - show switch option
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#666',
                                            fontSize: '13px',
                                            // fontStyle: 'italic'
                                        }}
                                    >
                                        {/* Using template: <strong>{props.selectedTemplate?.title}</strong>
                                        <br /> */}
                                        <a
                                            href="#"
                                            style={{
                                                color: '#2757aa',
                                                textDecoration: 'none',
                                                fontSize: '14.5px'
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                props.dontUseTemplates();
                                            }}
                                        >
                                            <i className="fa-solid fa-upload mx-1"></i>
                                            Switch to File Upload Or Switch Template
                                        </a>
                                    </Typography>
                                ) : (
                                    // When not using template - show available templates
                                    <>
                                        {props.templates && props.templates.length > 0 && (
                                            <>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#2757aa',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        mb: 0.5,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    <i className="fa-solid fa-copy mx-1" style={{ fontSize: '11px' }}></i>
                                                    Quick Templates
                                                </Typography>
                                                <Box sx={{
                                                    maxWidth: '100%',
                                                    overflow: 'hidden'
                                                }}>
                                                    <TemplateActions
                                                        templateIsTrue={props.templateIsTrue}
                                                        templates={props.templates}
                                                        selectedVault={props.selectedVault}
                                                        onUseTemplate={props.UseTemplate}
                                                        onDontUseTemplates={props.dontUseTemplates}
                                                    />
                                                </Box>
                                            </>
                                        )}
                                    </>
                                )}
                            </Box>

                            {/* Right Side - Action Buttons */}
                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                flexShrink: 0
                            }}>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    className='rounded-pill'
                                    color="warning"
                                    size='small'
                                    variant="contained"
                                    onClick={() => {
                                        closeFormDialog();
                                        props.setTemplateIsTrue(false);
                                        setUploadedFile(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    sx={{ textTransform: 'none' }}
                                    className='rounded-pill'
                                    color="primary"
                                    size='medium'
                                    variant="contained"
                                    onClick={handleSubmit}
                                >
                                    Create
                                </Button>
                            </Box>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
};

export default NewObjectDialog;