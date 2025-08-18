import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Typography
} from '@mui/material';
import * as constants from './Auth/configs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AttachExistingVault(props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        vaultName: '',
        vaultId: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const navigate = useNavigate();


    const handleDialogOpen = () => {
        setDialogOpen(true);
        setSubmitError('');
        setSubmitSuccess('');
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setFormData({
            // vaultName: '',
            vaultId: '',
        });
        setSubmitError('');
        setSubmitSuccess('');
    };

    const handleFormChange = (field) => (event) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handleAttachVault = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            const response = await axios.post(
                `${constants.auth_api}/api/attach-existing-vault/`,
                {
                    // vault_name: formData.vaultName,
                    vault_guid: formData.vaultId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${props.authTokens.access}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setSubmitSuccess('Vault attached successfully!');

            setTimeout(() => {
                if (window.location.pathname === '/admin') {
                    window.location.reload(); // Refresh the page
                    handleDialogClose();      // And close the dialog
                } else {
                    navigate('/admin');
                }
            }, 1500);

        } catch (error) {
            const errorMessage =
                error.response?.data?.error || // ✅ match your backend
                error.response?.data?.detail ||
                error.response?.data?.message ||
                'Failed to attach vault. Invalid Vault ID.';
            setSubmitError(errorMessage);


            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    const isFormValid = formData.vaultId;

    return (
        <div>
            {props.user?.is_superuser && (
                <Button
                    variant="outlined"
                    size='small'
                    onClick={handleDialogOpen}
                    sx={{
                        mt: 2,
                        color: '#2757aa',
                        borderColor: '#2757aa',
                        fontSize: '12px',
                        '&:hover': {
                            backgroundColor: '#2757aa',
                            color: 'white',
                        },
                    }}
                >
                    <i className="fa-solid fa-plus me-2"></i>
                    Attach Existing Repo
                </Button>
            )}

            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                {/* <DialogTitle sx={{ fontSize: '18px', fontWeight: 'bold', color: '#2757aa' }}>
                    Attach Existing Vault
                </DialogTitle> */}
                <DialogTitle sx={{
                    backgroundColor: '#2757aa',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <i className="fa-solid fa-database" style={{ fontSize: '18px' }}></i>
                    Attach Existing Repository
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {submitError && (
                        <Alert severity="error" sx={{ mb: 2, fontSize: '14px' }}>
                            {submitError}
                        </Alert>
                    )}
                    {submitSuccess && (
                        <Alert severity="success" sx={{ mb: 2, fontSize: '14px' }}>
                            {submitSuccess}
                        </Alert>
                    )}

                    {/* <TextField
                        autoFocus
                        margin="dense"
                        label="Vault Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.vaultName}
                        onChange={handleFormChange('vaultName')}
                        sx={{ mb: 2 }}
                        InputProps={{ style: { fontSize: '14px' } }}
                        InputLabelProps={{ style: { fontSize: '14px' } }}
                    /> */}

                    <TextField
                        margin="dense"
                        label="Vault GUID"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.vaultId}
                        onChange={handleFormChange('vaultId')}
                        sx={{ mb: 2 }}
                        InputProps={{ style: { fontSize: '14px' } }}
                        InputLabelProps={{ style: { fontSize: '14px' } }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '12px' }}>
                        If a repository already exists in your M-Files server, right-click on it, open 'Properties', and copy the Vault ID to paste it here.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleDialogClose} sx={{ fontSize: '14px' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAttachVault}
                        variant="contained"
                        disabled={!isFormValid || isSubmitting}
                        sx={{
                            backgroundColor: '#2757aa',
                            fontSize: '14px',
                            '&:hover': {
                                backgroundColor: '#153a7a',
                            },
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                                Attaching...
                            </>
                        ) : (
                            'Attach Repository'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AttachExistingVault;
