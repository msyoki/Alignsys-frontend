import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import logo from '../../images/ZFWHITE.png';

const VaultFormDialog = ({ open, onClose }) => {
    const [Organization, setOrganization] = useState('');
    const [vaultName, setVaultName] = useState('');
    const [guid, setGuid] = useState('');

    const OrganizationOptions = [
        { id: 'c1', name: 'Organization Alpha' },
        { id: 'c2', name: 'Organization Beta' },
        { id: 'c3', name: 'Organization Gamma' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = { Organization, vaultName, guid };
        console.log('Submitted:', formData);
        onClose(); // Close after submit, or handle differently
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle
                className="p-2 d-flex justify-content-between align-items-center"
                style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
            >
                <img className="mx-3" src={logo} alt="Loading" width="130px" />
                <span className="ml-auto mx-3" style={{ fontSize: '13px' }}>
                    Select Users or user groups <i className="fas fa-users mx-1" style={{ fontSize: '13px', cursor: 'pointer' }}></i>
                </span>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <FormControl fullWidth size="small" margin="normal" required>
                        <InputLabel id="Organization-label">Select Organization</InputLabel>
                        <Select
                            labelId="Organization-label"
                            value={Organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            label="Select Organization"
                        >
                            {OrganizationOptions.map((option) => (
                                <MenuItem key={option.id} value={option.name}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Vault Name"
                        value={vaultName}
                        onChange={(e) => setVaultName(e.target.value)}
                        fullWidth
                        size="small"
                        margin="normal"
                        required
                    />
                    <TextField
                        label="GUID"
                        value={guid}
                        onChange={(e) => setGuid(e.target.value)}
                        size="small"
                        fullWidth
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default VaultFormDialog;
