import React, { useMemo, useState, useEffect } from 'react';
import {
    List,
    ListItem,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Collapse,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import FormField from './FormField';
import FileExtIcon from '../../FileExtIcon';
import FileExtText from '../../FileExtText';
import { THEME_COLORS } from '../../../constants/themeColors';
import { FaSearch, FaTimes ,FaChevronDown } from 'react-icons/fa';
import { FaFileCirclePlus, FaFolderPlus } from "react-icons/fa6";

/* ─── Shared label width across all rows ─────────────────────────────────── */
const LABEL_WIDTH = { xs: '90px', sm: '130px', md: '160px' };

/* ─── Reusable row wrapper ───────────────────────────────────────────────── */
const FormRow = ({ label, required, children }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            width: '100%',
            gap: 1.5,
            my: '3px',
            boxSizing: 'border-box',
        }}
    >
        <Typography
            variant="body2"
            sx={{
                color: 'black',
                minWidth: LABEL_WIDTH,
                maxWidth: LABEL_WIDTH,
                fontSize: '13px',
                textAlign: 'end',
                flexShrink: 0,
                pt: '9px',
                lineHeight: 1.3,
                wordBreak: 'break-word',
            }}
        >
            {label}{required && <span style={{ color: '#d32f2f' }}> *</span>} :
        </Typography>
        <Box sx={{ flex: 1, minWidth: 0, fontSize: '13px', color: '#555b6e' }}>
            {children}
        </Box>
    </Box>
);

/* ─── Group header used inside the class-change dialog ───────────────────── */
const GroupHeader = ({ label, expanded, onToggle }) => (
    <ListItem
        button
        onClick={onToggle}
        sx={{
            backgroundColor: THEME_COLORS.surfaceLight,
            mb: 0.5,
            py: 0.75,
            borderRadius: '4px',
            '&:hover': { backgroundColor: '#d9e9f7' },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: THEME_COLORS.primary }}>
                {label}
            </Typography>
            {expanded
                ? <ExpandLess sx={{ color: THEME_COLORS.primary, fontSize: '18px' }} />
                : <ExpandMore sx={{ color: THEME_COLORS.primary, fontSize: '18px' }} />}
        </Box>
    </ListItem>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
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
    groupedItems,
    ungroupedItems,
    selectedClassId,
    selectedObjectId,
    onClassChange,
    setOpenAlert,
    setAlertSeverity,
    setAlertMsg,
}) => {
    const [classDialogOpen, setClassDialogOpen] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchTerm, setSearchTerm] = useState('');

    /* flat list used only to decide whether the class selector is clickable */
    const allClasses = useMemo(() => {
        const classes = [];
        groupedItems?.forEach(group =>
            group.members.forEach(m => {
                if (m.userPermission?.attachObjectsPermission)
                    classes.push({ classId: m.classId, className: m.className });
            })
        );
        ungroupedItems?.forEach(m => {
            if (m.userPermission?.attachObjectsPermission)
                classes.push({ classId: m.classId, className: m.className });
        });
        return classes;
    }, [groupedItems, ungroupedItems]);

    const handleClassSelect = (classId, className) => {
      
        handleClassSelection(classId, className, selectedObjectId);
        // onClassChange?.(classId, className, selectedObjectId);
        setClassDialogOpen(false);
    };

    const toggleGroup = (id) =>
        setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));

    const handleOpenDialog = () => {
        setExpandedGroups({});
        setSearchTerm('');
        setClassDialogOpen(true);
    };

    const filterMembers = (members) =>
        searchTerm
            ? members.filter(m => m.className.toLowerCase().includes(searchTerm.toLowerCase()))
            : members;

    // Auto-expand groups with matching results while searching,
    // collapse all when search is cleared
    useEffect(() => {
        if (!searchTerm) {
            setExpandedGroups({});
            return;
        }

        const expanded = {};
        groupedItems?.forEach(g => {
            const hasMatch = g.members.some(
                m =>
                    m.userPermission?.attachObjectsPermission &&
                    m.className.toLowerCase().includes(searchTerm.toLowerCase())
            );
            expanded[g.classGroupId] = hasMatch;
        });
        if (ungroupedItems?.length > 0) {
            expanded['ungrouped'] = ungroupedItems.some(
                m =>
                    m.userPermission?.attachObjectsPermission &&
                    m.className.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setExpandedGroups(expanded);
    }, [searchTerm, groupedItems, ungroupedItems]);

    return (
        <List sx={{  width: '100%', boxSizing: 'border-box',padding: '20px' }}>

            {/* ── Template banner ── */}
            {templateIsTrue && (
                <FormRow label="Template">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', p: '10px' }}>
                        <FileExtIcon
                            fontSize="20px"
                            guid={selectedVault?.guid}
                            objectId={selectedTemplate.id}
                            classId={selectedTemplate.classID}
                            version={selectedTemplate.versionId ?? null}
                        />
                        <span>{selectedTemplate?.title}</span>
                        <FileExtText
                            guid={selectedVault?.guid}
                            objectId={selectedTemplate.id}
                            classId={selectedTemplate.classID}
                            version={selectedTemplate.versionId ?? null}
                        />
                    </Box>
                </FormRow>
            )}

            {/* ── Class selector row ── */}
            <FormRow label="Class">
                {allClasses.length > 1 ? (
                    <Box
                        onClick={handleOpenDialog}
                        sx={{
                            cursor: 'pointer',
                            px: 1.5,
                            py: 1,
                            border: '1px solid #c4c4c4',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: '2px',
                            '&:hover': { borderColor: THEME_COLORS.primary, backgroundColor: '#f8f9fa' },
                        }}
                    >
                        <Typography sx={{ fontSize: '13px', color: '#555b6e' }}>
                            {selectedClassName} 
                        </Typography>
                        <FaChevronDown style={{ fontSize: '12px', color: '#555b6e' }} />
                        
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: '13px', color: '#555b6e', pt: '9px' }}>
                        {selectedClassName}
                    </Typography>
                )}
            </FormRow>

            {/* ── Class-change dialog ── */}
            <Dialog
                open={classDialogOpen}
                onClose={() => setClassDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        height: { xs: '90vh', sm: '75vh' },
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        backgroundColor: THEME_COLORS.primary,
                        color: '#fff',
                        fontSize: '14px',
                        py: 1.5,
                        flexShrink: 0,
                    }}
                >
                    <FaFolderPlus style={{ marginRight: 8 }} />
                    Select Class
                </DialogTitle>

                {/* Fixed search bar */}
                <Box
                    sx={{
                        px: 2,
                        py: 1.5,
                        borderBottom: '1px solid #e0e0e0',
                        flexShrink: 0,
                        backgroundColor: 'white',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #c4c4c4',
                            borderRadius: '4px',
                            px: 1.5,
                            py: 0.75,
                            '&:focus-within': { borderColor: THEME_COLORS.primary },
                        }}
                    >
                        <FaSearch style={{ color: '#555b6e', fontSize: '13px', marginRight: 8 }} />
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
                                backgroundColor: 'transparent',
                            }}
                        />
                        {searchTerm && (
                            <FaTimes
                                onClick={() => setSearchTerm('')}
                                style={{ color: '#555b6e', fontSize: '13px', cursor: 'pointer', marginLeft: 8 }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Scrollable list */}
                <DialogContent sx={{ flex: 1, overflowY: 'auto', p: 0, px: 2, minHeight: 0 }}>
                    <List sx={{ p: 0, py: 1 }}>
                        {groupedItems?.map((group) => {
                            const filtered = filterMembers(
                                group.members.filter(m => m.userPermission?.attachObjectsPermission)
                            );
                            if (filtered.length === 0) return null;
                            return (
                                <Box key={group.classGroupId}>
                                    <GroupHeader
                                        label={group.classGroupName}
                                        expanded={!!expandedGroups[group.classGroupId]}
                                        onToggle={() => toggleGroup(group.classGroupId)}
                                    />
                                    <Collapse in={!!expandedGroups[group.classGroupId]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {filtered.map((member) => (
                                                <ListItem
                                                    button
                                                    key={member.classId}
                                                    onClick={() => handleClassSelect(member.classId, member.className)}
                                                    sx={{
                                                        pl: 4,
                                                        py: 0.75,
                                                        backgroundColor: member.classId === selectedClassId ? '#e3f2fd' : 'transparent',
                                                        '&:hover': { backgroundColor: '#f0f4f8' },
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {selectedObjectId === 0 ? (
                                                            <FaFileCirclePlus size={15} color="#2a68af" />
                                                        ) : (
                                                            <FaFolderPlus size={15} color="#2a68af" />
                                                        )}

                                                        {selectedObjectId === 0}

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

                        {(() => {
                            const filteredUngrouped = filterMembers(
                                (ungroupedItems || []).filter(m => m.userPermission?.attachObjectsPermission)
                            );
                            if (filteredUngrouped.length === 0) return null;
                            return (
                                <Box>
                                    <GroupHeader
                                        label="Ungrouped"
                                        expanded={!!expandedGroups['ungrouped']}
                                        onToggle={() => toggleGroup('ungrouped')}
                                    />
                                    <Collapse in={!!expandedGroups['ungrouped']} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {filteredUngrouped.map((member) => (
                                                <ListItem
                                                    button
                                                    key={member.classId}
                                                    onClick={() => handleClassSelect(member.classId, member.className)}
                                                    sx={{
                                                        pl: 4,
                                                        py: 0.75,
                                                        backgroundColor: member.classId === selectedClassId ? '#e3f2fd' : 'transparent',
                                                        '&:hover': { backgroundColor: '#f0f4f8' },
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {selectedObjectId === 0 ? (
                                                            <FaFileCirclePlus size={15} color="#2a68af" />
                                                        ) : (
                                                            <FaFolderPlus size={15} color="#2a68af" />
                                                        )}
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
                </DialogContent>

                <DialogActions sx={{ flexShrink: 0, borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        className='rounded-pill'
                        onClick={() => setClassDialogOpen(false)}
                        variant="contained"
                        color="warning"
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#FFD54F',
                            color: '#000',
                            '&:hover': { backgroundColor: '#FFCA28' },
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Property rows ── */}
            {properties.map((prop) => (
                <ListItem key={prop.propId} sx={{ p: 0, width: '100%', boxSizing: 'border-box' }}>
                    <FormRow label={prop.title} required={prop.isRequired}>
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
                    </FormRow>
                </ListItem>
            ))}
        </List>
    );
};

export default PropertiesList;