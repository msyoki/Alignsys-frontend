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
    ListItemText
} from '@mui/material';

import { FaPlus } from "react-icons/fa";
import { FaFolderPlus } from "react-icons/fa6";

import logo from '../../../images/ZFWHITE.png';import { THEME_COLORS } from '../../../constants/themeColors';


const MainObjectDialog = ({
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
        <Dialog open={open} fullWidth>
            <DialogTitle
                className='p-2 d-flex justify-content-between align-items-center'
                style={{ backgroundColor: THEME_COLORS.primary, color: '#fff', fontSize: '14px' }}
            >
                <img className="mx-3" src={logo} alt="Loading" width="130px" />
                <span className="ml-auto mx-3">
                    <FaPlus className='mx-2' /> Create
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
                        sx: { fontSize: '13px', color: '#555b6e' }
                    }}
                    InputProps={{
                        sx: { fontSize: '13px', color: '#555b6e' }
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
                                    <FaFolderPlus className="mx-2" style={{ color: "#2a68af", fontSize: "20px" }} />
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
                <Button 
                    sx={{ textTransform: 'none' }} 
                    className='mx-4 rounded-pill' 
                    color="warning" 
                    size='small' 
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