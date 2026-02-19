import React, { useCallback, useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Grid,
    Collapse,
    Box,
    Typography
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import logo from '../../../images/ZFWHITE.png';

import { FaFolderPlus } from "react-icons/fa6";
import { FaFileCirclePlus } from "react-icons/fa6";
import { THEME_COLORS } from '../../../constants/themeColors';


const ClassSelectionDialog = ({
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
    const [expandedGroups, setExpandedGroups] = useState({});

    // Initialize all groups as expanded when dialog opens or when groupedItems change
    useEffect(() => {
        if (open && (groupedItems || ungroupedItems)) {
            const initialExpanded = {};

            if (groupedItems) {
                groupedItems.forEach(group => {
                    initialExpanded[group.classGroupId] = false;
                });
            }

            if (ungroupedItems && ungroupedItems.length > 0) {
                initialExpanded['ungrouped'] = false;
            }

            setExpandedGroups(initialExpanded);
        }
    }, [open, groupedItems, ungroupedItems]);

    const filterItems = useCallback((items) => {
        return items.filter((member) =>
            member.className.toLowerCase().includes(searchQuery) &&
            member.userPermission?.attachObjectsPermission
        );
    }, [searchQuery]);

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Collapse all groups
    const collapseAll = () => {
        const collapsed = {};
        if (groupedItems) {
            groupedItems.forEach(group => {
                collapsed[group.classGroupId] = false;
            });
        }
        if (ungroupedItems && ungroupedItems.length > 0) {
            collapsed['ungrouped'] = false;
        }
        setExpandedGroups(collapsed);
    };

    // Expand all groups
    const expandAll = () => {
        const expanded = {};
        if (groupedItems) {
            groupedItems.forEach(group => {
                expanded[group.classGroupId] = true;
            });
        }
        if (ungroupedItems && ungroupedItems.length > 0) {
            expanded['ungrouped'] = true;
        }
        setExpandedGroups(expanded);
    };

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle
                className="p-2 d-flex justify-content-between align-items-center"
                style={{ backgroundColor: THEME_COLORS.primary, color: "#fff", fontSize: "14px" }}
            >
                <img src={logo} alt="Loading" width="130px" className="mx-3" />
                <span className="flex items-center mx-3">
                    {selectedObjectId === 0 ? (

                        <FaFileCirclePlus style={{ color: "#fff", fontSize: "20px" }} className="mx-1" />
                    ) : (
                        <FaFolderPlus style={{ color: "#fff", fontSize: "20px" }} className="mx-1" />

                    )}{" "}
                    Select {selectedObjectName} Class
                </span>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <p className="mt-2" style={{ fontSize: "13px" }}>
                            Please select / search from classes below
                        </p>

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: "13px", color: "#555b6e" },
                            }}
                            InputProps={{
                                sx: { fontSize: "13px", color: "#555b6e" },
                            }}
                            placeholder="Search class..."
                            value={searchQuery}
                            onChange={onSearchChange}
                            sx={{ mb: 2 }}
                        />

                        {/* Expand/Collapse All Buttons */}
                        {!isLoading && !searchQuery && (
                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={expandAll}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        color: THEME_COLORS.primary,
                                        borderColor: THEME_COLORS.primary,
                                        '&:hover': {
                                            borderColor: '#1e4a8a',
                                            backgroundColor: '#f0f4f8'
                                        }
                                    }}
                                >
                                    <ExpandMore sx={{ fontSize: '16px', mr: 0.5 }} />
                                    Expand All
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={collapseAll}
                                    sx={{
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        color: THEME_COLORS.primary,
                                        borderColor: THEME_COLORS.primary,
                                        '&:hover': {
                                            borderColor: '#1e4a8a',
                                            backgroundColor: '#f0f4f8'
                                        }
                                    }}
                                >
                                    <ExpandLess sx={{ fontSize: '16px', mr: 0.5 }} />
                                    Collapse All
                                </Button>
                            </Box>
                        )}

                        <div style={{ maxHeight: "350px", overflowY: "auto", overflowX: "hidden" }}>
                            {isLoading ? (
                                <div className="flex justify-center items-center w-full">
                                    <CircularProgress size={24} />
                                </div>
                            ) : (
                                <List className="p-0">
                                    {/* Grouped Classes */}
                                    {groupedItems.map((group) => {
                                        const filteredMembers = filterItems(group.members);

                                        if (filteredMembers.length === 0) return null;

                                        return (
                                            <Box key={group.classGroupId} sx={{ mb: 0.25 }}>
                                                <ListItem
                                                    button
                                                    onClick={() => toggleGroup(group.classGroupId)}
                                                    className="p-2"
                                                    sx={{
                                                        backgroundColor: THEME_COLORS.surfaceLight,
                                                        borderRadius: '4px',
                                                        '&:hover': {
                                                            backgroundColor: '#d9e9f7'
                                                        }
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
                                                            <ExpandLess sx={{ color: THEME_COLORS.primary, fontSize: '15px' }} />
                                                        ) : (
                                                            <ExpandMore sx={{ color: THEME_COLORS.primary, fontSize: '15px' }} />
                                                        )}
                                                    </Box>
                                                </ListItem>

                                                <Collapse in={expandedGroups[group.classGroupId]} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding className="ml-2">
                                                        {filteredMembers.map((member) => (
                                                            <ListItem
                                                                key={member.classId}
                                                                onClick={() =>
                                                                    onClassSelect(
                                                                        member.classId,
                                                                        member.className,
                                                                        selectedObjectId
                                                                    )
                                                                }
                                                                className="mx-2 transition hover:bg-gray-100 rounded-lg"
                                                                button
                                                                disablePadding
                                                                sx={{
                                                                    my: 0,
                                                                    py: 0.5,
                                                                    px: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#f0f4f8'
                                                                    }
                                                                }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                                                                    {selectedObjectId === 0 ? (
                                                                        <FaFileCirclePlus
                                                                            style={{
                                                                                color: "#2a68af",
                                                                                fontSize: "15px",
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <FaFolderPlus
                                                                            style={{
                                                                                color: "#2a68af",
                                                                                fontSize: "15px",
                                                                            }}
                                                                        />
                                                                    )}
                                                                </ListItemIcon>

                                                                <ListItemText
                                                                    sx={{
                                                                        "& .MuiTypography-root": { fontSize: "13px" },
                                                                    }}
                                                                    primary={member.className}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </Box>
                                        );
                                    })}

                                    {/* Ungrouped Classes */}
                                    {ungroupedItems.length > 0 &&
                                        filterItems(ungroupedItems).length > 0 && (
                                            <Box sx={{ mb: 0.25 }}>
                                                <ListItem
                                                    button
                                                    onClick={() => toggleGroup('ungrouped')}
                                                    className="p-2"
                                                    sx={{
                                                        backgroundColor: THEME_COLORS.surfaceLight,
                                                        borderRadius: '4px',
                                                        '&:hover': {
                                                            backgroundColor: '#d9e9f7'
                                                        }
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
                                                            <ExpandLess sx={{ color: THEME_COLORS.primary, fontSize: '15px' }} />
                                                        ) : (
                                                            <ExpandMore sx={{ color: THEME_COLORS.primary, fontSize: '15px' }} />
                                                        )}
                                                    </Box>
                                                </ListItem>

                                                <Collapse in={expandedGroups['ungrouped']} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding className="ml-2">
                                                        {filterItems(ungroupedItems).map((member) => (
                                                            <ListItem
                                                                key={member.classId}
                                                                onClick={() =>
                                                                    onClassSelect(
                                                                        member.classId,
                                                                        member.className,
                                                                        selectedObjectId
                                                                    )
                                                                }
                                                                className="mx-2 my-0 transition hover:bg-gray-100 rounded-lg"
                                                                button
                                                                disablePadding
                                                                sx={{
                                                                    my: 0,
                                                                    py: 0.5,
                                                                    px: 1,
                                                                    '&:hover': {
                                                                        backgroundColor: '#f0f4f8'
                                                                    }
                                                                }}
                                                            >
                                                                <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>

                                                                    {selectedObjectId === 0 ? (
                                                                        <FaFileCirclePlus
                                                                            style={{
                                                                                color: "#2a68af",
                                                                                fontSize: "15px",
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <FaFolderPlus
                                                                            style={{
                                                                                color: "#2a68af",
                                                                                fontSize: "15px",
                                                                            }}
                                                                        />
                                                                    )}
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    sx={{
                                                                        "& .MuiTypography-root": { fontSize: "13px" },
                                                                    }}
                                                                    primary={member.className}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </Box>
                                        )}
                                </List>
                            )}
                        </div>


                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                {/* <Button
                    sx={{ textTransform: "none" }}
                    className="mx-4 rounded-pill"
                    color="warning"
                    size="medium"
                    variant="contained"
                    onClick={onClose}
                >
                    AI Classification
                </Button> */}
                <Button
                    sx={{
                        textTransform: 'none',
                        backgroundColor: '#FFD54F',   // yellow
                        color: '#000',
                        '&:hover': {
                            backgroundColor: '#FFCA28',
                        },
                    }}
                    className="rounded-pill"
                    size="medium"
                    variant="contained"
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClassSelectionDialog;