import React, { useState } from 'react';
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
    IconButton,
} from '@mui/material';
import logo from '../../../images/ZFWHITE.png';
import FileUploadComponent from '../../FileUpload';
import PropertiesList from './PropertiesList';
import TemplateActions from './TemplateActions';

import { FaRegFilePdf, FaRegFileWord, FaFileCirclePlus, FaFolderPlus, FaEnvelope } from "react-icons/fa6";
import { BsFiletypeCsv, BsFiletypeTxt, BsFiletypePptx, BsUpload } from "react-icons/bs";
import { FaInternetExplorer } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import { CiFileOn, CiImageOn } from "react-icons/ci";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiTemplate, HiOutlineAnnotation } from "react-icons/hi";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { THEME_COLORS } from '../../../constants/themeColors';
import DynamicIcon from '../../Utils/Dynamicicon';

// ─── File icon map ────────────────────────────────────────────────────────────
const FILE_ICON_MAP = {
    pdf:       <FaRegFilePdf   style={{ color: '#f21b3f' }} />,
    csv:       <BsFiletypeCsv  style={{ color: '#7cb518' }} />,
    txt:       <BsFiletypeTxt  style={{ color: '#555b6e' }} />,
    msg:       <FaEnvelope     style={{ color: '#ffb703' }} />,
    webp:      <FaInternetExplorer style={{ color: THEME_COLORS.primary }} />,
    xlsx:      <PiMicrosoftExcelLogoFill style={{ color: '#217045' }} />,
    xls:       <PiMicrosoftExcelLogoFill style={{ color: '#217045' }} />,
    ppt:       <BsFiletypePptx style={{ color: '#d34628' }} />,
    pptx:      <BsFiletypePptx style={{ color: '#d34628' }} />,
    docx:      <FaRegFileWord  style={{ color: '#35558b' }} />,
    doc:       <FaRegFileWord  style={{ color: '#35558b' }} />,
    png:       <CiImageOn      style={{ color: '#2a68af' }} />,
    jpeg:      <CiImageOn      style={{ color: '#2a68af' }} />,
    jpg:       <CiImageOn      style={{ color: '#2a68af' }} />,
    xfdf:      <HiOutlineAnnotation style={{ color: '#ffb703' }} />,
    vssettings:<VscVscode      style={{ color: '#555b6e' }} />,
};
const ICON_STYLE = { fontSize: '25px' };

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icon = FILE_ICON_MAP[ext] ?? <CiFileOn style={{ color: '#e5e5e5' }} />;
    return React.cloneElement(icon, { style: { ...ICON_STYLE, ...icon.props.style } });
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FileHeader = ({ uploadedFile, previewVisible, onTogglePreview }) => (
    <Box
        className="chat-header2 p-2"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, minHeight: 44 }}
    >
        {/* File info — only shown once a file is selected */}
        {uploadedFile?.name ? (
            <Tooltip title={uploadedFile.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    {getFileIcon(uploadedFile.name)}
                    <Box component="span" sx={{ ml: 1, fontSize: 12.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: { xs: 160, sm: 260, md: 340 } }}>
                        {uploadedFile.name}
                    </Box>
                </Box>
            </Tooltip>
        ) : (
            <Typography variant="caption" sx={{ color: THEME_COLORS.primary, fontSize: 12, fontWeight: 500 }}>
                {previewVisible ? 'File Upload' : 'No file attached'}
            </Typography>
        )}

        {/* Toggle always visible */}
        {/* <Tooltip title={previewVisible ? 'Hide upload panel' : 'Show upload panel'} arrow>
            <IconButton
                size="small"
                onClick={onTogglePreview}
                sx={{
                    color: THEME_COLORS.primary,
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '6px',
                    px: 2, py: 0.5, gap: '4px',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)', border: `1px solid ${THEME_COLORS.primary}` },
                    transition: 'all 0.2s ease',
                }}
            >
                {previewVisible
                    ? <GoSidebarCollapse style={{ fontSize: 16 }} />
                    : <GoSidebarExpand   style={{ fontSize: 16 }} />}
                <Typography variant="caption" sx={{ color: THEME_COLORS.primary, fontSize: 11, fontWeight: 500 }}>
                    {previewVisible ? 'Hide Upload' : 'Attach File'}
                </Typography>
            </IconButton>
        </Tooltip> */}
    </Box>
);

const TemplateSection = ({ miniLoader, templateIsTrue, templates, selectedVault, onUseTemplate, onDontUseTemplates }) => {
    if (miniLoader) return null;

    if (templateIsTrue) {
        return (
            <Typography variant="body2" sx={{ color: '#666', fontSize: '13px' }}>
                <a
                    href="#"
                    style={{ color: THEME_COLORS.primary, textDecoration: 'none', fontSize: '14.5px' }}
                    onClick={(e) => { e.preventDefault(); onDontUseTemplates(); }}
                >
                    <BsUpload className="mx-2" />
                    Switch to File Upload / Change Template
                </a>
            </Typography>
        );
    }

    if (!templates?.length) return null;

    return (
        <>
            <Typography variant="caption" sx={{ color: THEME_COLORS.primary, fontWeight: 600, fontSize: '12px', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ObjectFormDialog = ({
    open, onClose,
    selectedObjectId, selectedClassName, selectedClassId,
    filteredProperties, formValues, formErrors,
    selectedTemplate, selectedVault,
    templateIsTrue, templates,
    onInputChange, onSubmit, onFileChange,
    uploadedFile, miniLoader, mfilesId,
    handleClassSelection, fetchItemData, setAddingValueListItem,
    onUseTemplate, onDontUseTemplates,
    groupedItems, ungroupedItems, onClassChange,
    setOpenAlert, setAlertSeverity, setAlertMsg,
    fileUploadError,
}) => {
    const [previewVisible, setPreviewVisible] = useState(true);

    // Two-panel layout only when creating a new document object (not using a template)
    const isTwoPanel = selectedObjectId === 0 && !templateIsTrue;

    const sharedPropertiesListProps = {
        properties: filteredProperties,
        formValues, formErrors,
        selectedClassName, selectedClassId,
        selectedTemplate, selectedVault,
        templateIsTrue, onInputChange, mfilesId,
        handleClassSelection, fetchItemData,
        setAddingValueListItem, groupedItems, ungroupedItems,
        selectedObjectId: selectedObjectId || 0,
        onClassChange, setOpenAlert, setAlertSeverity, setAlertMsg,
    };

    const footer = (
        <DialogActions
            sx={{
                flexShrink: 0,
                backgroundColor: THEME_COLORS.surfaceLight,
                borderTop: '1px solid #e0e0e0',
                // Stack vertically on mobile, row on sm+
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 1.5, sm: 0 },
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
            }}
        >
            {/* Templates section */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <TemplateSection
                    miniLoader={miniLoader}
                    templateIsTrue={templateIsTrue}
                    templates={templates}
                    selectedVault={selectedVault}
                    onUseTemplate={onUseTemplate}
                    onDontUseTemplates={onDontUseTemplates}
                />
            </Box>

            {/* Action buttons — full-width & equal on mobile, auto on sm+ */}
            <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                <Button
                    className="rounded-pill"
                    variant="contained"
                    size="medium"
                    onClick={onClose}
                    disabled={miniLoader}
                    sx={{
                        textTransform: 'none',
                        flex: { xs: 1, sm: 'none' },
                        backgroundColor: '#FFD54F',
                        color: '#000',
                        '&:hover': { backgroundColor: '#FFCA28' },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    className="rounded-pill"
                    variant="contained"
                    color="success"
                    size="medium"
                    onClick={onSubmit}
                    disabled={miniLoader}
                    sx={{
                        textTransform: 'none',
                        position: 'relative',
                        flex: { xs: 1, sm: 'none' },
                        whiteSpace: 'nowrap',
                    }}
                >
                    {miniLoader ? (
                        <>
                            Creating…
                            <CircularProgress size={16} color="inherit" sx={{ ml: 1 }} />
                        </>
                    ) : `Create ${selectedClassName}`}
                </Button>
            </Box>
        </DialogActions>
    );

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth={isTwoPanel ? 'xl' : 'sm'}
            PaperProps={{
                sx: {
                    // Full viewport on mobile, inset on larger screens
                    height: isTwoPanel
                        ? { xs: '100dvh', sm: '95vh', md: '88vh' }
                        : { xs: '100dvh', sm: 'auto' },
                    maxHeight: { xs: '100dvh', sm: '95vh' },
                    // Flush to screen edges on mobile (native sheet feel)
                    borderRadius: { xs: 0, sm: 2 },
                    m: { xs: 0, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                }
            }}
        >
            {/* ── Header ── */}
            <DialogTitle
                sx={{
                    backgroundColor: THEME_COLORS.primary,
                    color: '#fff',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: { xs: 1.5, sm: 2 },
                    py: 1,
                }}
            >
                <img
                    src={logo}
                    alt="Logo"
                    // style={{ width: 'clamp(100px, 28vw, 180px)' }}
                    width="100px" 
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                    {selectedObjectId === 0
                        ? <FaFileCirclePlus style={{ color: '#fff', fontSize: '18px', flexShrink: 0 }} />
                        :  <DynamicIcon  name={selectedClassName} color={'#fff'} size={20}/> }
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#fff',
                            fontSize: { xs: '12px', sm: '14px' },
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: { xs: '35vw', sm: 'unset' },
                        }}
                    >
                        Create {selectedClassName}
                    </Typography>
                </Box>
            </DialogTitle>

            {/* ── Body ── */}
            <DialogContent
                className="form-group"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: isTwoPanel ? 'hidden' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 0,
                }}
            >
                {isTwoPanel ? (
                    /*
                     * Two-panel layout
                     * xs/sm  → stacked vertically (form on top, upload below)
                     * md+    → side by side (form left 5 cols, upload right 7 cols)
                     */
                    <Grid container sx={{ flex: 1, minHeight: 0, height: '100%' }}>

                        {/* Left — form fields */}
                        <Grid
                            item xs={12} md={previewVisible ? 5 : 12}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: { xs: 'auto', md: '100%' },
                                minHeight: 0,
                                borderRight: { md: previewVisible ? '1px solid #e0e0e0' : 'none' },
                                borderBottom: { xs: previewVisible ? '1px solid #e0e0e0' : 'none', md: 'none' },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {/* File header / toggle bar — never scrolls away */}
                            <Box sx={{ flexShrink: 0, px: { xs: 1, sm: 1.5 }, pt: { xs: 1, sm: 1.5 } }}>
                                <FileHeader
                                    uploadedFile={uploadedFile}
                                    previewVisible={previewVisible}
                                    onTogglePreview={() => setPreviewVisible(v => !v)}
                                />
                            </Box>

                            {/* Scrollable form */}
                            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0, px: { xs: 1, sm: 1.5 }, pb: 1 }}>
                                <PropertiesList {...sharedPropertiesListProps} />
                            </Box>
                        </Grid>

                        {/* Right — file upload / viewer */}
                        {previewVisible && (
                            <Grid
                                item xs={12} md={7}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    // On mobile give a reasonable fixed slice; on desktop fill the panel
                                    height: { xs: '42vh', sm: '48vh', md: '100%' },
                                    minHeight: { xs: 200, md: 0 },
                                }}
                            >
                                <Box
                                    sx={{
                                        flex: 1,
                                        minHeight: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        border: uploadedFile ? `1px solid ${THEME_COLORS.surfaceLight}` : 'none',
                                        borderRadius: { xs: 0, md: 2 },
                                        overflow: 'hidden',
                                        m: { xs: 0, md: 1 },
                                    }}
                                >
                                    <FileUploadComponent
                                        handleFileChange={onFileChange}
                                        uploadedFile={uploadedFile}
                                        getFileIcon={getFileIcon}
                                        fileUploadError={fileUploadError}
                                    />
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                ) : (
                    /* Single panel — full-width form */
                    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                        <PropertiesList {...sharedPropertiesListProps} />
                    </Box>
                )}
            </DialogContent>

            {/* ── Footer — always anchored, never scrolls ── */}
            {footer}
        </Dialog>
    );
};

export default ObjectFormDialog;