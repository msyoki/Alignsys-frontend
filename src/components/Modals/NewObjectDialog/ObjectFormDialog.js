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
    Tooltip,
    IconButton
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
    selectedClassId,
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
    groupedItems,
    ungroupedItems,
    onClassChange,
    setOpenAlert,
    setAlertSeverity,
    setAlertMsg
}) => {

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconStyle = { fontSize: '25px' };
        switch (extension) {
            case 'pdf':
                return <i className="fa-regular fa-file-pdf shadow-sm" style={{ ...iconStyle, color: '#f21b3f' }}></i>;
            case 'csv':
                return <i className="fas fa-file-csv shadow-sm" style={{ ...iconStyle, color: '#7cb518' }}></i>;
            case 'txt':
                return <i className="fas fa-file-alt shadow-sm" style={{ ...iconStyle, color: '#555b6e' }}></i>;
            case 'msg':
                return <i className="fa-solid fa-envelope shadow-sm" style={{ ...iconStyle, color: '#ffb703' }}></i>;
            case 'webp':
                return <i className="fa-brands fa-internet-explorer shadow-sm" style={{ ...iconStyle, color: '#2757aa' }}></i>;
            case 'xlsx':
            case 'xls':
                return <i className="far fa-file-excel shadow-sm" style={{ ...iconStyle, color: '#217045' }}></i>;
            case 'ppt':
            case 'pptx':
                return <i className="fa-solid fa-file-powerpoint shadow-sm" style={{ ...iconStyle, color: '#d34628' }}></i>;
            case 'docx':
            case 'doc':
                return <i className="fas fa-file-word shadow-sm" style={{ ...iconStyle, color: '#35558b' }}></i>;
            case 'png':
            case 'jpeg':
            case 'jpg':
                return <i className="fas fa-file-image shadow-sm" style={{ ...iconStyle, color: '#2a68af' }}></i>;
            case 'vssettings':
                return <i className="fa-solid fa-file-code shadow-sm" style={{ ...iconStyle, color: '#555b6e' }}></i>;
            default:
                return <i className="fas fa-file shadow-sm" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
        }
    };
    const handleReplaceFile = () => {
        document.getElementById('file-upload-input').click();
    };
    return (
        <Dialog
            open={open}
            maxWidth='xl'
            fullWidth={selectedObjectId === 0 && !templateIsTrue}
            PaperProps={{
                sx: {
                    height: uploadedFile ? '90vh' : 'auto',
                    maxHeight: '90vh'
                }
            }}
        >
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

            <DialogContent
                className="form-group my-3"
                sx={{
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    height: uploadedFile ? 'calc(100% - 120px)' : 'auto',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                {(selectedObjectId === 0 && !templateIsTrue) ? (
                    <Grid container spacing={3} sx={{ height: '100%', width: '100%' }}>
                        <Grid
                            item
                            xs={12}
                            md={uploadedFile ? 5 : 6}
                            order={{ xs: 1, md: 1 }}
                            sx={{

                                maxHeight: uploadedFile ? '350px' : '310px',

                            }}
                        >
                            <PropertiesList
                                properties={filteredProperties}
                                formValues={formValues}
                                formErrors={formErrors}
                                selectedClassName={selectedClassName}
                                selectedClassId={selectedClassId}
                                selectedTemplate={selectedTemplate}
                                selectedVault={selectedVault}
                                templateIsTrue={templateIsTrue}
                                onInputChange={onInputChange}
                                mfilesId={mfilesId}
                                handleClassSelection={handleClassSelection}
                                fetchItemData={fetchItemData}
                                setAddingValueListItem={setAddingValueListItem}
                                groupedItems={groupedItems}
                                ungroupedItems={ungroupedItems}
                                selectedObjectId={selectedObjectId}
                                onClassChange={onClassChange}
                                setOpenAlert={setOpenAlert}
                                setAlertSeverity={setAlertSeverity}
                                setAlertMsg={setAlertMsg}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={uploadedFile ? 7 : 6}
                            order={{ xs: 2, md: 2 }}
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{
                                height: uploadedFile ? '350px' : '310px',
                                minHeight: uploadedFile ? '350px' : '310px',
                                width: '100%',
                            }}>


                                <FileUploadComponent
                                    handleFileChange={onFileChange}
                                    uploadedFile={uploadedFile}
                                    getFileIcon={getFileIcon}
                                />
                            </Box>

                        </Grid>
                    </Grid>
                ) : (
                    <Grid container sx={{ width: '100%' }}>
                        <Grid item xs={12} md={12} sx={{ width: '100%' }}>
                            <PropertiesList
                                properties={filteredProperties}
                                formValues={formValues}
                                formErrors={formErrors}
                                selectedClassName={selectedClassName}
                                selectedClassId={selectedClassId}
                                selectedTemplate={selectedTemplate}
                                selectedVault={selectedVault}
                                templateIsTrue={templateIsTrue}
                                onInputChange={onInputChange}
                                mfilesId={mfilesId}
                                handleClassSelection={handleClassSelection}
                                fetchItemData={fetchItemData}
                                setAddingValueListItem={setAddingValueListItem}
                                groupedItems={groupedItems}
                                ungroupedItems={ungroupedItems}
                                selectedObjectId={selectedObjectId}
                                onClassChange={onClassChange}
                                setOpenAlert={setOpenAlert}
                                setAlertSeverity={setAlertSeverity}
                                setAlertMsg={setAlertMsg}
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
                    <>
                        {!miniLoader && (
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
                        )}

                    </>
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