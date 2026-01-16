import React, { useMemo, useState } from 'react';
import {
    List,
    ListItem,
    Box,
    Typography,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse,
    IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import FormField from './FormField';
import FileExtIcon from '../../FileExtIcon';
import FileExtText from '../../FileExtText';
import { THEME_COLORS } from '../../../constants/themeColors';


const PropertiesList = ({
    properties,
    formValues,
    formErrors,
    selectedClassName,
    selectedTemplate,
    selectedVault,
    templateIsTrue,
    onInputChange,
    mfilesId,
    handleClassSelection,
    fetchItemData,
    setAddingValueListItem,
    // Props for class selection
    groupedItems,
    ungroupedItems,
    selectedClassId,
    selectedObjectId,
    onClassChange,
    setOpenAlert,
    setAlertSeverity,
    setAlertMsg
}) => {
    const [classDialogOpen, setClassDialogOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    // Create a flat list of all available classes
    const allClasses = useMemo(() => {
        const classes = [];

        // Add grouped classes
        if (groupedItems) {
            groupedItems.forEach(group => {
                group.members.forEach(member => {
                    if (member.userPermission?.attachObjectsPermission) {
                        classes.push({
                            classId: member.classId,
                            className: member.className,
                            groupName: group.classGroupName,
                            groupId: group.classGroupId
                        });
                    }
                });
            });
        }

        // Add ungrouped classes
        if (ungroupedItems) {
            ungroupedItems.forEach(member => {
                if (member.userPermission?.attachObjectsPermission) {
                    classes.push({
                        classId: member.classId,
                        className: member.className,
                        groupName: 'Ungrouped',
                        groupId: 'ungrouped'
                    });
                }
            });
        }

        return classes;
    }, [groupedItems, ungroupedItems]);

    const handleClassSelect = (classId, className) => {
        if (onClassChange) {
            onClassChange(classId, className, selectedObjectId);
        }
        setClassDialogOpen(false);
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Initialize all groups as collapsed when dialog opens
    const handleOpenDialog = () => {
        setExpandedGroups({});
        setSearchTerm('');
        setClassDialogOpen(true);
    };

    // Filter classes based on search term
    const filterMembers = (members) => {
        if (!searchTerm) return members;
        return members.filter(member => 
            member.className.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <List sx={{ p: 0, width: '100%', boxSizing: 'border-box' }}>
            {templateIsTrue && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        width: '100%',
                        gap: 2
                    }}
                >
                    <Typography
                        className="my-2"
                        variant="body2"
                        sx={{
                            color: 'black',
                            minWidth: '180px',
                            maxWidth: '180px',
                            fontSize: '13px',
                            textAlign: 'end',
                            flexShrink: 0
                        }}
                    >
                        FROM TEMPLATE:
                    </Typography>
                    <Box className="my-2" sx={{ flex: 1, fontSize: '13px', textAlign: 'start', color: '#555b6e' }}>
                        <span className='mx-2'>
                            <FileExtIcon
                                fontSize={'20px'}
                                guid={selectedVault?.guid}
                                objectId={selectedTemplate.id}
                                classId={selectedTemplate.classID}
                                version={selectedTemplate.versionId ?? null}
                            />
                        </span>
                        {selectedTemplate?.title}
                        <FileExtText
                            guid={selectedVault?.guid}
                            objectId={selectedTemplate.id}
                            classId={selectedTemplate.classID}
                            version={selectedTemplate.versionId ?? null}
                        />
                    </Box>
                </Box>
            )}

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    width: '100%',
                    gap: 2,
                    boxSizing: 'border-box'
                }}
            >
                <Typography
                    className="my-2"
                    variant="body2"
                    sx={{
                        color: 'black',
                        minWidth: { xs: '100px', sm: '140px', md: '180px' },
                        maxWidth: { xs: '100px', sm: '140px', md: '180px' },
                        fontSize: '13px',
                        textAlign: 'end',
                        flexShrink: 0
                    }}
                >
                    Class :
                </Typography>
                <Box className="my-2" sx={{ flex: 1, fontSize: '13px', textAlign: 'start', color: '#555b6e', mr: 4 }}>
                    {allClasses.length > 1 ? (
                        <Box
                            onClick={handleOpenDialog}
                            sx={{
                                cursor: 'pointer',
                                padding: '8px 12px',
                                border: '1px solid #c4c4c4',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                '&:hover': {
                                    borderColor: THEME_COLORS.primary,
                                    backgroundColor: '#f8f9fa'
                                }
                            }}
                        >
                            <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                                {selectedClassName}
                            </Typography>
                            <i className="fas fa-chevron-down" style={{ fontSize: '12px', color: '#555b6e' }}></i>
                        </Box>
                    ) : (
                        <Typography sx={{ fontSize: '13px', color: '#555b6e', padding: '8px 0' }}>
                            {selectedClassName}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Class Selection Dialog with Collapsible Groups */}
            <Dialog
                open={classDialogOpen}
                onClose={() => setClassDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle
                    sx={{
                        backgroundColor: THEME_COLORS.primary,
                        color: '#fff',
                        fontSize: '14px',
                        py: 2
                    }}
                >
                    <i className="fas fa-folder-plus mx-2"></i>
                    Select Class
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '500px' }}>
                    {/* Search Bar - Fixed */}
                    <Box sx={{ px: 2, pt: 2, pb: 2, backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid #c4c4c4',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                backgroundColor: 'white',
                                '&:focus-within': {
                                    borderColor: THEME_COLORS.primary,
                                }
                            }}
                        >
                            <i className="fas fa-search" style={{ color: '#555b6e', fontSize: '14px', marginRight: '8px' }}></i>
                            <input
                                type="text"
                                placeholder="Search classes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '13px',
                                    color: '#555b6e',
                                    backgroundColor: 'transparent'
                                }}
                            />
                            {searchTerm && (
                                <i 
                                    className="fas fa-times" 
                                    onClick={() => setSearchTerm('')}
                                    style={{ 
                                        color: '#555b6e', 
                                        fontSize: '14px', 
                                        cursor: 'pointer',
                                        marginLeft: '8px'
                                    }}
                                ></i>
                            )}
                        </Box>
                    </Box>
                    
                    {/* Scrollable List Container */}
                    <Box sx={{ flex: 1, overflowY: 'auto', px: 2 }}>
                        <List sx={{ p: 0, py: 1 }}>
                        {/* Grouped Classes */}
                        {groupedItems && groupedItems.map((group) => {
                            const filteredMembers = filterMembers(
                                group.members.filter(
                                    member => member.userPermission?.attachObjectsPermission
                                )
                            );

                            if (filteredMembers.length === 0) return null;

                            return (
                                <Box key={group.classGroupId}>
                                    <ListItem
                                        button
                                        onClick={() => toggleGroup(group.classGroupId)}
                                        sx={{
                                            backgroundColor: THEME_COLORS.surfaceLight,
                                            mb: 0.5,
                                            py: 1,
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: THEME_COLORS.primary
                                                }}
                                            >
                                                {group.classGroupName}
                                            </Typography>
                                            {expandedGroups[group.classGroupId] ? (
                                                <ExpandLess sx={{ color: THEME_COLORS.primary }} />
                                            ) : (
                                                <ExpandMore sx={{ color: THEME_COLORS.primary }} />
                                            )}
                                        </Box>
                                    </ListItem>
                                    <Collapse in={expandedGroups[group.classGroupId]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {filteredMembers.map((member) => (
                                                <ListItem
                                                    button
                                                    key={member.classId}
                                                    onClick={() => handleClassSelect(member.classId, member.className)}
                                                    sx={{
                                                        pl: 4,
                                                        py: 1,
                                                        '&:hover': {
                                                            backgroundColor: '#f0f4f8'
                                                        },
                                                        backgroundColor: member.classId === selectedClassId ? '#e3f2fd' : 'transparent'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <i
                                                            className={`fas ${selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
                                                            style={{ color: '#2a68af', fontSize: '16px' }}
                                                        />
                                                        <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                                                            {member.className}
                                                        </Typography>
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </Box>
                            );
                        })}

                        {/* Ungrouped Classes */}
                        {ungroupedItems && ungroupedItems.length > 0 && (() => {
                            const filteredUngrouped = filterMembers(
                                ungroupedItems.filter(member => member.userPermission?.attachObjectsPermission)
                            );
                            
                            if (filteredUngrouped.length === 0) return null;
                            
                            return (
                                <Box>
                                    <ListItem
                                        button
                                        onClick={() => toggleGroup('ungrouped')}
                                        sx={{
                                            backgroundColor: THEME_COLORS.surfaceLight,
                                            mb: 0.5,
                                            py: 1,
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    color: THEME_COLORS.primary
                                                }}
                                            >
                                                Ungrouped
                                            </Typography>
                                            {expandedGroups['ungrouped'] ? (
                                                <ExpandLess sx={{ color: THEME_COLORS.primary }} />
                                            ) : (
                                                <ExpandMore sx={{ color: THEME_COLORS.primary }} />
                                            )}
                                        </Box>
                                    </ListItem>
                                    <Collapse in={expandedGroups['ungrouped']} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {filteredUngrouped.map((member) => (
                                                <ListItem
                                                    button
                                                    key={member.classId}
                                                    onClick={() => handleClassSelect(member.classId, member.className)}
                                                    sx={{
                                                        pl: 4,
                                                        py: 1,
                                                        '&:hover': {
                                                            backgroundColor: '#f0f4f8'
                                                        },
                                                        backgroundColor: member.classId === selectedClassId ? '#e3f2fd' : 'transparent'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <i
                                                            className={`fas ${selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
                                                            style={{ color: '#2a68af', fontSize: '16px' }}
                                                        />
                                                        <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                                                            {member.className}
                                                        </Typography>
                                                    </Box>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Collapse>
                                </Box>
                            );
                        })()}
                    </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setClassDialogOpen(false)}
                        variant="contained"
                        color="warning"
                        sx={{ textTransform: 'none', borderRadius: '20px' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {properties.map((prop) => (
                <ListItem key={prop.propId} sx={{ p: 0, width: '100%', boxSizing: 'border-box' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            width: '100%',
                            gap: 2,
                            marginY: '2px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <Typography
                            className="my-2"
                            variant="body2"
                            sx={{
                                color: 'black',
                                minWidth: { xs: '100px', sm: '140px', md: '180px' },
                                maxWidth: { xs: '100px', sm: '140px', md: '180px' },
                                fontSize: '13px',
                                textAlign: 'end',
                                flexShrink: 0,
                                pt: '8px'
                            }}
                        >
                            {prop.title} {prop.isRequired && <span className="text-danger"> *</span>} :
                        </Typography>

                        <Box sx={{ flex: 1, fontSize: '13px', color: '#555b6e', textAlign: 'start', mr: 4 }}>
                            <FormField
                                prop={prop}
                                value={formValues[prop.propId]}
                                onChange={onInputChange}
                                error={formErrors[prop.propId]}
                                selectedVault={selectedVault}
                                mfilesId={mfilesId}
                                handleClassSelection={handleClassSelection}
                                fetchItemData={fetchItemData}
                                setAddingValueListItem={setAddingValueListItem}
                                setOpenAlert={setOpenAlert}
                                setAlertSeverity={setAlertSeverity}
                                setAlertMsg={setAlertMsg}   
                            />
                        </Box>
                    </Box>
                </ListItem>
            ))}
        </List>
    );
};

export default PropertiesList;