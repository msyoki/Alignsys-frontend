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
    Typography
} from '@mui/material';
import logo from '../../../images/ZFWHITE.png';
import FileUploadComponent from '../../FileUpload';
import PropertiesList from './PropertiesList';
import TemplateActions from './TemplateActions';

const ObjectFormDialog = ({
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
    onDontUseTemplates
}) => {
    return (
        <Dialog open={open} maxWidth='xl'>
            <DialogTitle
                className='p-2 d-flex justify-content-between align-items-center'
                style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
            >
                <img className="mx-3" src={logo} alt="Loading" width="180px" />
                <span className="ml-auto mx-3">
                    {selectedObjectId === 0 ? (
                        <i
                            style={{ color: "#fff", fontSize: "20px" }}
                            className="fa-solid fa-file-circle-plus"
                        />
                    ) : (
                        <i
                            style={{ color: "#fff", fontSize: "20px" }}
                            className="fas fa-folder-plus"
                        />
                    )}
                    <small className='mx-2'>Create {selectedClassName}</small>
                </span>
            </DialogTitle>

            <DialogContent className="form-group my-3" sx={{ overflow: 'auto' }}>
                {(selectedObjectId === 0 && !templateIsTrue) ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={7} order={{ xs: 1, md: 2 }} sx={{ padding: '20px', width: '250px', maxHeight: '310px', overflowY: 'auto' }}>
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
                        </Grid>
                        <Grid item xs={12} md={5} order={{ xs: 2, md: 2 }} sx={{ width: '700px' }}>
                            <FileUploadComponent
                                handleFileChange={onFileChange}
                                uploadedFile={uploadedFile}
                            />
                        </Grid>
                    </Grid>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12} sx={{ width: '650px' }}>
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
                        </Grid>
                    </Grid>
                )}
            </DialogContent>

            <DialogActions
                style={{
                    backgroundColor: '#ecf4fc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '16px',
                    gap: '16px'
                }}
            >
                {/* Left Side - Template Section */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    minHeight: '40px'
                }}>

                    {!miniLoader ?
                        <>
                            {templateIsTrue ? (
                                <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                                    <a
                                        href="#"
                                        style={{ color: '#2757aa', textDecoration: 'none', fontSize: '14.5px' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onDontUseTemplates();
                                        }}
                                    >
                                        <i className="fa-solid fa-upload mx-1"></i>
                                        Switch to File Upload Or Switch Template
                                    </a>
                                </Typography>
                            ) : (
                                <>
                                    {templates && templates.length > 0 && (
                                        <>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#2757aa',
                                                    fontWeight: 600,
                                                    fontSize: '12px',
                                                    mb: 0.5,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}
                                            >
                                                <i className="fa-solid fa-copy mx-1" style={{ fontSize: '11px' }}></i>
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
                                    )}
                                </>
                            )}
                        </>


                        : <></>}
                </Box>

                {/* Right Side - Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                    <Button
                        sx={{ textTransform: 'none' }}
                        className='rounded-pill'
                        color="warning"
                        size='medium'
                        variant="contained"
                        onClick={onClose}
                        disabled={miniLoader}
                    >
                        Cancel
                    </Button>
                    <Button
                        sx={{ textTransform: 'none', position: 'relative' }}
                        className='rounded-pill'
                        color="primary"
                        size='medium'
                        variant="contained"
                        onClick={onSubmit}
                        disabled={miniLoader}
                    >
                        {miniLoader ? (
                            <>
                                Submiting Please wait ... <CircularProgress size={24} color="inherit" sx={{ ml: 1 }} />
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default ObjectFormDialog;