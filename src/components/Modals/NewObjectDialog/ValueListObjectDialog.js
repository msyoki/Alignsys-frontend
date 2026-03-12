import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Grid,
    Box,
    Typography,
} from '@mui/material';
import logo from '../../../images/ZFWHITE.png';
import PropertiesList from './PropertiesList';
import TemplateActions from './TemplateActions';
import { THEME_COLORS } from '../../../constants/themeColors';
import {  FaUpload, FaCopy } from 'react-icons/fa';
import { VscNewFolder } from "react-icons/vsc";
import { CgFolderAdd } from "react-icons/cg";

const ValueListObjectDialog = ({
    open,
    onClose,
    selectedObjectId,
    selectedClassName,
    filteredProperties,
    formValues,
    formErrors,
    selectedTemplate,
    selectedVault,
    templateIsTrue,
    templates,
    onInputChange,
    onSubmit,
    onFileChange,
    uploadedFile,
    miniLoader,
    mfilesId,
    handleClassSelection,
    fetchItemData,
    setAddingValueListItem,
    onUseTemplate,
    onDontUseTemplates,
}) => (
    <Dialog
        open={open}
        maxWidth="sm"
        fullWidth
        PaperProps={{
            sx: {
                maxHeight: '90vh',
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
                fontSize: '15px',
                flexShrink: 0,
            }}
        >
            <img className="mx-3" src={logo} alt="Logo" width="100px" />
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="ml-auto mx-3">
                {selectedObjectId === 0 ? (
                    <CgFolderAdd
                        style={{ color: '#fff', fontSize: '18px' }}
                    />
                ) : (
                    <VscNewFolder
                        style={{ color: '#fff', fontSize: '18px' }}
                    />
                )}
                <small>Create {selectedClassName}</small>
            </span>
        </DialogTitle>

        {/* Scrollable form area */}
        <DialogContent
            sx={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 0,
                px: { xs: 2, md: 3 },
                pt: '16px !important',
                pb: 1,
            }}
        >
            <PropertiesList
                properties={filteredProperties}
                formValues={formValues}
                formErrors={formErrors}
                selectedClassName={selectedClassName}
                selectedTemplate={selectedTemplate}
                selectedVault={selectedVault}
                templateIsTrue={templateIsTrue}
                onInputChange={onInputChange}
                mfilesId={mfilesId}
                handleClassSelection={handleClassSelection}
                fetchItemData={fetchItemData}
                setAddingValueListItem={setAddingValueListItem}
            />
        </DialogContent>

        <DialogActions
            sx={{
                flexShrink: 0,
                backgroundColor: THEME_COLORS.surfaceLight,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexWrap: 'wrap',
                gap: 1.5,
                p: 2,
                borderTop: '1px solid #e0e0e0',
            }}
        >
            {/* Left: template controls */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {!miniLoader && (
                    templateIsTrue ? (
                        <Typography variant="body2" sx={{ fontSize: '13px' }}>
                            <Box
                                component="a"
                                href="#"
                                onClick={(e) => { e.preventDefault(); onDontUseTemplates(); }}
                                sx={{
                                    color: THEME_COLORS.primary,
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.75,
                                    '&:hover': { color: '#4a7bc8' },
                                }}
                            >
                                <FaUpload style={{ fontSize: '14px', marginRight: '4px' }} />
                                Switch to File Upload Or Switch Template
                            </Box>
                        </Typography>
                    ) : (
                        templates?.length > 0 && (
                            <>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: THEME_COLORS.primary,
                                        fontWeight: 600,
                                        fontSize: '11px',
                                        mb: 0.5,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                    }}
                                >
                                    <FaCopy style={{ fontSize: '11px' }} />
                                    Quick Templates
                                </Typography>
                                <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                                    <TemplateActions
                                        templateIsTrue={templateIsTrue}
                                        templates={templates}
                                        selectedVault={selectedVault}
                                        onUseTemplate={onUseTemplate}
                                        onDontUseTemplates={onDontUseTemplates}
                                    />
                                </Box>
                            </>
                        )
                    )
                )}
            </Box>

            {/* Right: action buttons */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                <Button
                    sx={{
                        textTransform: 'none',
                        backgroundColor: '#FFD54F',
                        color: '#000',
                        borderRadius: '20px',
                        '&:hover': { backgroundColor: '#FFCA28' },
                    }}
                    size="medium"
                    variant="contained"
                    onClick={onClose}
                    disabled={miniLoader}
                >
                    Cancel
                </Button>
                <Button
                    sx={{ textTransform: 'none', borderRadius: '20px', position: 'relative' }}
                    color="primary"
                    size="medium"
                    variant="contained"
                    onClick={() => onSubmit()}
                    disabled={miniLoader}
                >
                    {miniLoader ? (
                        <>
                            Submitting…
                            <CircularProgress size={18} color="inherit" sx={{ ml: 1 }} />
                        </>
                    ) : (
                        'Submit'
                    )}
                </Button>
            </Box>
        </DialogActions>
    </Dialog>
);

export default ValueListObjectDialog;