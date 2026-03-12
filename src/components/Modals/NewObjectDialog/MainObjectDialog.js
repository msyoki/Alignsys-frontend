import React, { useMemo } from 'react';
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
    Box,
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';
import { FaFolderPlus } from 'react-icons/fa6';
import logo from '../../../images/ZFWHITE.png';
import { THEME_COLORS } from '../../../constants/themeColors';

const MainObjectDialog = ({
    open,
    onClose,
    vaultObjectsList,
    onSelectItem,
    searchTerm,
    onSearchChange,
}) => {
    const filteredObjects = useMemo(
        () =>
            vaultObjectsList?.filter(
                (item) =>
                    item.userPermission?.attachObjectsPermission &&
                    item.namesingular.toLowerCase().includes(searchTerm.toLowerCase())
            ) || [],
        [vaultObjectsList, searchTerm]
    );

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle
                className="p-2 d-flex justify-content-between align-items-center"
                style={{
                    backgroundColor: THEME_COLORS.primary,
                    color: '#fff',
                    fontSize: '14px',
                    flexShrink: 0,
                }}
            >
                <img className="mx-3" src={logo} alt="Logo" width="100px" />
                <span className="ml-auto mx-3" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaPlus /> Create
                </span>
            </DialogTitle>

            <DialogContent
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    pt: '12px !important',
                    px: 2,
                    pb: 1,
                    minHeight: 0,
                }}
            >
                <p style={{ fontSize: '13px', marginBottom: 8 }}>
                    Please select from Item types below
                </p>

                <TextField
                    variant="outlined"
                    placeholder="Search Object Type..."
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={onSearchChange}
                    InputLabelProps={{ shrink: true, sx: { fontSize: '13px', color: '#555b6e' } }}
                    InputProps={{ sx: { fontSize: '13px', color: '#555b6e' } }}
                    sx={{ mb: 1, flexShrink: 0 }}
                />

                {/* Scrollable list */}
                <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
                    <List className="p-0">
                        {filteredObjects.map((item) => (
                            <ListItem
                                button
                                key={item.objectid}
                                onClick={() => onSelectItem(item.objectid, item.namesingular)}
                                disablePadding
                                sx={{
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: '4px',
                                    '&:hover': { backgroundColor: '#f0f4f8' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                    <FaFolderPlus style={{ color: '#2a68af', fontSize: '18px' }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.namesingular}
                                    sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>

            <DialogActions sx={{ flexShrink: 0, px: 2, pb: 1.5 }}>
                <Button
                    sx={{
                        textTransform: 'none',
                        backgroundColor: '#FFD54F',
                        color: '#000',
                        borderRadius: '20px',
                        '&:hover': { backgroundColor: '#FFCA28' },
                    }}
                    size="small"
                    variant="contained"
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MainObjectDialog;