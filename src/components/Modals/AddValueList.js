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
import { FaSquarePlus } from "react-icons/fa6";

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
    setAlertMsg,
}) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    /* Safe wrappers — all three props are optional (noop-defaulted upstream)
       but AddValueList itself must never call them without checking, because
       it can be rendered inside a nested ValueListObjectDialog that was opened
       without these props.                                                    */
    const safeSetAdding = (val) => {
        if (typeof setAddingValueListItem === 'function') setAddingValueListItem(val);
    };
    const safeAlert = (severity, msg) => {
        if (typeof setOpenAlert === 'function') setOpenAlert(true);
        if (typeof setAlertSeverity === 'function') setAlertSeverity(severity);
        if (typeof setAlertMsg === 'function') setAlertMsg(msg);
    };

    const handleClickOpen = (e) => {
        e.stopPropagation();

        if (item?.objectTypeVL) {
            // Delegate to parent to open the full ValueListObjectDialog
            if (typeof fetchItemData === 'function') {
                fetchItemData(item.typeID, item.title);
            } else {
                console.warn('fetchItemData is not a function');
            }
            // Signal parent that we're adding (will be reset by parent when its dialog closes)
            safeSetAdding(true);
            return;
        }

        // Simple name-entry dialog
        safeSetAdding(true);
        setOpen(true);
    };

    const handleClose = (e) => {
        if (e) e.stopPropagation();
        setOpen(false);
        setName('');
        // Reset the flag so the parent form isn't stuck in "adding" state
        safeSetAdding(false);
    };

    const handleSubmit = async (e) => {
        e.stopPropagation();

        if (!name.trim()) return;

        setLoading(true);
        try {
            const payload = { vaultGuid, userID, valuelistID, name };

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

            if (onSuccess) onSuccess(response.data);

            safeAlert('success', 'Value list item created successfully');
            handleClose(); // also resets name and safeSetAdding(false)
        } catch (error) {
            console.error('Error adding valuelist item:', error);
            safeAlert('error', 'Failed to add item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <FaSquarePlus
                onClick={handleClickOpen}
                title="Add item"
                style={{
                    marginLeft: '8px',
                    cursor: 'pointer',
                    fontSize: '2.2rem',
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
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />

            <Dialog
                open={open}
                onClose={handleClose}
                style={{ zIndex: 1500 }}
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle sx={{ fontSize: '15px' }}>
                    {`Add new ${item?.title || 'value list item'}`}
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
                            if (e.key === 'Enter' && !loading) handleSubmit(e);
                        }}
                        error={name.trim() === '' && name.length > 0}
                        helperText={name.trim() === '' && name.length > 0 ? 'Name cannot be empty' : ''}
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading || !name.trim()}
                        sx={{ textTransform: 'none' }}
                    >
                        {loading ? 'Adding…' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AddValuelistItem;