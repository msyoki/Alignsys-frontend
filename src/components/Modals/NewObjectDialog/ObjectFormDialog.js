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

import { FaRegFilePdf } from "react-icons/fa6";
import { BsFiletypeCsv } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa6";
import { BsFiletypeTxt } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa";
import { FaInternetExplorer } from "react-icons/fa";
import { BsFiletypePptx } from "react-icons/bs";
import { VscVscode } from "react-icons/vsc";
import { CiFileOn } from "react-icons/ci";
import { FaFileCirclePlus } from "react-icons/fa6";
import { FaFolderPlus } from "react-icons/fa6";
import { BsUpload } from "react-icons/bs";
import { HiTemplate } from "react-icons/hi";
import { CiImageOn } from "react-icons/ci";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineAnnotation } from "react-icons/hi";
import { THEME_COLORS } from '../../../constants/themeColors';



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
    setAlertMsg,
    fileUploadError

}) => {

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconStyle = { fontSize: '25px' };
        switch (extension) {
            case 'pdf':
                return <FaRegFilePdf style={{ ...iconStyle, color: '#f21b3f' }} />;
            case 'csv':
                return <BsFiletypeCsv style={{ ...iconStyle, color: '#7cb518' }} />;
            case 'txt':
                return <BsFiletypeTxt style={{ ...iconStyle, color: '#555b6e' }} />;
            case 'msg':
                return <FaEnvelope style={{ ...iconStyle, color: '#ffb703' }} />;
            case 'webp':
                return <FaInternetExplorer style={{ ...iconStyle, color: THEME_COLORS.primary }} />;
            case 'xlsx':
            case 'xls':
                return <PiMicrosoftExcelLogoFill style={{ ...iconStyle, color: '#217045' }} />;
            case 'ppt':
            case 'pptx':
                return <BsFiletypePptx style={{ ...iconStyle, color: '#d34628' }} />;
            case 'docx':
            case 'doc':
                return <FaRegFileWord style={{ ...iconStyle, color: '#35558b' }} />;
            case 'png':
            case 'jpeg':
            case 'jpg':
                return <CiImageOn style={{ ...iconStyle, color: '#2a68af' }} />;
            case 'xfdf':
                return <HiOutlineAnnotation style={{ ...iconStyle, color: '#ffb703' }} />;
            case 'vssettings':
                return <VscVscode style={{ ...iconStyle, color: '#555b6e' }} />;
            default:
                return <CiFileOn style={{ ...iconStyle, color: '#e5e5e5' }} />;
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
                style={{ backgroundColor: THEME_COLORS.primary, color: '#fff', fontSize: '15px' }}
            >
                <img className="mx-3" src={logo} alt="Loading" width="180px" />
                <span className="ml-auto mx-3">
                    {selectedObjectId === 0 ? (

                        <FaFileCirclePlus style={{ color: "#fff", fontSize: "20px" }} />

                    ) : (

                        <FaFolderPlus style={{ color: "#fff", fontSize: "20px" }} />
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
                                    fileUploadError={fileUploadError}
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
                    backgroundColor: THEME_COLORS.surfaceLight,
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
                                            style={{ color: THEME_COLORS.primary, textDecoration: 'none', fontSize: '14.5px' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onDontUseTemplates();
                                            }}
                                        >
                                            <BsUpload className="mx-2" />

                                            Switch to File Upload / Change Template
                                        </a>
                                    </Typography>
                                ) : (
                                    <>
                                        {templates && templates.length > 0 && (
                                            <>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: THEME_COLORS.primary,
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        mb: 0.5,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}
                                                >
                                                    <HiTemplate className="mx-2" style={{ fontSize: '15px' }} />


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