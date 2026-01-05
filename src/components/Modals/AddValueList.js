import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import axios from 'axios';
import * as constants from '../Auth/configs';

const AddValuelistItem = ({
    vaultGuid,
    userID,
    valuelistID,
    onSuccess,
    item,
    handleClassSelection,
    fetchItemData,
    setAddingValueListItem,
    setOpenAlert,
    setAlertSeverity,
    setAlertMsg
}) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClickOpen = (e) => {

        e.stopPropagation();

        if (item?.objectTypeVL) {
            console.log('Auto-fetching because objectTypeVL is true:', item);
            if (typeof fetchItemData === 'function') {
                fetchItemData(item.typeID, item.title);
                console.log(item)
            } else {
                console.warn('fetchItemData is not a function');
            }
            return;
        }

        setOpen(true);
    };

    const handleClose = (e) => {
        if (e) e.stopPropagation();
        setOpen(false);
    };

    const handleSubmit = async (e) => {
        e.stopPropagation();

        if (!name.trim()) return alert('Please enter a name');

        setLoading(true);
        try {
            const payload = { vaultGuid, userID, valuelistID, name };
            console.log('Submitting payload:', payload);

            const response = await axios.post(
                `${constants.mfiles_api}/api/ValuelistInstance/AddValuelistItem`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: '*/*',
                    },
                }
            );

            console.log('Item added:', response.data);

            // Call onSuccess but don't close parent dialog
            if (onSuccess) {
                onSuccess(response.data);
            }

            // Refresh valuelist data if available
            // if (typeof fetchItemData === 'function') {
            //     fetchItemData(valuelistID, item.title);
            // }
            setOpenAlert(true);
            setAlertSeverity("success");
            setAlertMsg("Value list object created successfully");

            handleClose();
            setName('');
        } catch (error) {
            console.error('Error adding valuelist item:', error);
            alert('Failed to add item. See console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <i
                className="fa-solid fa-square-plus"
                onClick={(e) => { handleClickOpen(e); setAddingValueListItem(true) }}
                title="Add item"
                style={{
                    marginLeft: '8px',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    color: '#007bff',
                    padding: '6px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                    e.currentTarget.style.color = '#0056b3';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#007bff';
                }}
                onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.92)';
                }}
                onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            ></i>


            {/* Separate dialog with disablePortal to prevent z-index issues */}
            <Dialog
                open={open}
                onClose={handleClose}
                disablePortal={false}
                style={{ zIndex: 1500 }} // Higher z-index than parent dialog
                onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling
            >
                <DialogTitle sx={{ fontSize: '15px' }}>
                    {`Add new ${item?.title || 'valuelist'}`}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Enter Value"
                        size="medium"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !loading) {
                                handleSubmit(e);
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? 'Adding...' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddValuelistItem;