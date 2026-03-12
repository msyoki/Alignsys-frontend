import React, { useCallback, useState, useEffect, useRef } from 'react';
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
    ListItemText,
    CircularProgress,
    Grid,
    Collapse,
    Box,
    Typography,
    Tooltip,
    IconButton,
    Chip,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import logo from '../../../images/ZFWHITE.png';

import { FaRegFilePdf, FaRegFileWord, FaFileCirclePlus, FaFolderPlus, FaEnvelope } from "react-icons/fa6";
import { BsFiletypeCsv, BsFiletypeTxt, BsFiletypePptx } from "react-icons/bs";
import { FaInternetExplorer } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import { CiFileOn, CiImageOn } from "react-icons/ci";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { HiOutlineAnnotation } from "react-icons/hi";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { PiSparkleFill } from "react-icons/pi";
import { THEME_COLORS } from '../../../constants/themeColors';
import FileUploadComponent from '../../FileUpload';
import DynamicIcon from '../../Utils/Dynamicicon';

// ─── Shared file icon map (mirrors ObjectFormDialog) ─────────────────────────
const FILE_ICON_MAP = {
    pdf: <FaRegFilePdf style={{ color: '#f21b3f' }} />,
    csv: <BsFiletypeCsv style={{ color: '#7cb518' }} />,
    txt: <BsFiletypeTxt style={{ color: '#555b6e' }} />,
    msg: <FaEnvelope style={{ color: '#ffb703' }} />,
    webp: <FaInternetExplorer style={{ color: THEME_COLORS.primary }} />,
    xlsx: <PiMicrosoftExcelLogoFill style={{ color: '#217045' }} />,
    xls: <PiMicrosoftExcelLogoFill style={{ color: '#217045' }} />,
    ppt: <BsFiletypePptx style={{ color: '#d34628' }} />,
    pptx: <BsFiletypePptx style={{ color: '#d34628' }} />,
    docx: <FaRegFileWord style={{ color: '#35558b' }} />,
    doc: <FaRegFileWord style={{ color: '#35558b' }} />,
    png: <CiImageOn style={{ color: '#2a68af' }} />,
    jpeg: <CiImageOn style={{ color: '#2a68af' }} />,
    jpg: <CiImageOn style={{ color: '#2a68af' }} />,
    xfdf: <HiOutlineAnnotation style={{ color: '#ffb703' }} />,
    vssettings: <VscVscode style={{ color: '#555b6e' }} />,
};
const ICON_STYLE = { fontSize: '25px' };

const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const icon = FILE_ICON_MAP[ext] ?? <CiFileOn style={{ color: '#e5e5e5' }} />;
    return React.cloneElement(icon, { style: { ...ICON_STYLE, ...icon.props.style } });
};

// ─── ClassListItem — shared between grouped and ungrouped lists ───────────────
const ClassListItem = ({ member, selectedObjectId, onClassSelect, uploadedFile, setFileUploadError }) => (
    <ListItem
        button
        disablePadding
        onClick={
            () => { // If document object and no file uploaded → do nothing
                if (selectedObjectId === 0 && !uploadedFile) {
                    setFileUploadError('File upload is required.');

                }else{
                    onClassSelect(member.classId, member.className, selectedObjectId);
                }
                // onClassSelect(member.classId, member.className, selectedObjectId);


            }

        }

        sx={{ px: 1, py: 0.5, borderRadius: 1, '&:hover': { backgroundColor: '#f0f4f8' } }}
    >
        <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
            {selectedObjectId === 0
                ? <FaFileCirclePlus style={{ color: '#2a68af', fontSize: 15 }} />
                : <DynamicIcon  name={member.className} color={THEME_COLORS.primary} size={15}/> }
        </ListItemIcon>
        <ListItemText primary={member.className} sx={{ '& .MuiTypography-root': { fontSize: 13 } }} />
    </ListItem>
);

// ─── CollapsibleGroup — header row + animated child list ─────────────────────
const CollapsibleGroup = ({ label, groupId, members, expanded, onToggle, selectedObjectId, onClassSelect, uploadedFile, setFileUploadError }) => (
    <Box sx={{ mb: 0.5 }}>
        <ListItem
            button
            onClick={() => onToggle(groupId)}
            sx={{ px: 1.5, py: 0.7, backgroundColor: THEME_COLORS.surfaceLight, borderRadius: 1, '&:hover': { backgroundColor: '#d9e9f7' } }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: THEME_COLORS.primary }}>
                    {label}
                </Typography>
                {expanded
                    ? <ExpandLess sx={{ fontSize: 16, color: THEME_COLORS.primary }} />
                    : <ExpandMore sx={{ fontSize: 16, color: THEME_COLORS.primary }} />}
            </Box>
        </ListItem>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ pl: 1 }}>
                {members.map(member => (
                    <ClassListItem
                        key={member.classId}
                        member={member}
                        selectedObjectId={selectedObjectId}
                        onClassSelect={onClassSelect}
                        uploadedFile={uploadedFile}
                        setFileUploadError={setFileUploadError}
                    />
                ))}
            </List>
        </Collapse>
    </Box>
);

// ─── Upload panel toggle — always visible when isTwoPanel ────────────────────
const UploadToggle = ({ previewVisible, onToggle }) => (
    <Tooltip title={previewVisible ? 'Hide upload panel' : 'Show upload panel'} arrow>
        <IconButton
            size="small"
            onClick={onToggle}
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
                : <GoSidebarExpand style={{ fontSize: 16 }} />}
            <Typography variant="caption" sx={{ color: THEME_COLORS.primary, fontSize: 11, fontWeight: 500 }}>
                {previewVisible ? 'Hide Upload' : 'Attach File'}
            </Typography>
        </IconButton>
    </Tooltip>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ClassSelectionDialog = ({
    open, onClose,
    selectedObjectName, selectedObjectId,
    isLoading, groupedItems, ungroupedItems,
    onClassSelect, searchQuery, onSearchChange,
    uploadedFile, onFileChange, fileUploadError,
    // AI classification extras
    mfilesId, selectedVault, onAIClassSelect,
    // Multi-file background queue
    onEnqueueBackground,
    setFileUploadError
}) => {
    const [expandedGroups, setExpandedGroups] = useState({});
    // Upload panel visible by default only for document objects
    const isTwoPanel = selectedObjectId === 0;
    const [previewVisible, setPreviewVisible] = useState(true);
    const [aiClassifying, setAiClassifying] = useState(false);
    const [aiError, setAiError] = useState('');

    // ── Background-prompt state ───────────────────────────────────────────────
    const [bgPromptOpen, setBgPromptOpen] = useState(false);
    const timeoutRef = useRef(null);
    const abortRef = useRef(null);

    // ── Multi-file queue (files to process one-by-one when creating) ──────────
    // Each entry: { file, status: 'pending'|'done'|'error', result }
    const [fileQueue, setFileQueue] = useState([]);
    const [activeFileIdx, setActiveFileIdx] = useState(0);   // which file we're currently "viewing"

    // Sync single uploadedFile prop into the queue when it changes
    useEffect(() => {
        if (!uploadedFile) { setFileQueue([]); return; }
        // If user picked a brand-new single file via the parent, seed the queue
        setFileQueue(prev => {
            // Drop any stale entries whose File blob was lost (e.g. after hot-reload)
            const valid = prev.filter(f => f.file != null);
            const already = valid.some(f => f.file.name === uploadedFile.name && f.file.size === uploadedFile.size);
            if (already) return valid;
            return [{ id: uploadedFile.name + uploadedFile.size, file: uploadedFile, status: 'pending', result: null }];
        });
    }, [uploadedFile]);

    const handleMultiFileDrop = useCallback((files) => {
        const entries = files.map(f => ({ id: f.name + f.size, file: f, status: 'pending', result: null }));
        setFileQueue(prev => {
            const newEntries = entries.filter(e => !prev.some(p => p.id === e.id));
            const merged = [...prev, ...newEntries];
            // Tell parent about first file so existing single-file preview still works
            if (merged.length > 0) onFileChange(merged[0].file);
            return merged;
        });
    }, [onFileChange]);

    const removeFileFromQueue = useCallback((id) => {
        setFileQueue(prev => {
            const next = prev.filter(f => f.id !== id);
            if (next.length > 0) onFileChange(next[0].file);
            else onFileChange(null);
            return next;
        });
        setActiveFileIdx(0);
    }, [onFileChange]);

    // ── Core AI classify (single file) ───────────────────────────────────────
    const runClassify = useCallback(async (file, signal) => {
        const formData = new FormData();
        formData.append('Files', file);
        formData.append('user_id', mfilesId);
        // selectedVault.guid already contains the braces e.g. {AA54622A-...}
        formData.append('vault', selectedVault?.guid ?? '');
        formData.append('backend_url', 'https://api.alignsys.tech');

        const response = await fetch('https://llm.alignsys.tech/classification/propose', {
            method: 'POST',
            headers: { accept: 'application/json' },
            body: formData,
            signal,
        });

        if (!response.ok) throw new Error(`AI classification failed: ${response.statusText}`);
        const data = await response.json();
        const result = data?.results?.[0];
        if (!result) throw new Error('No classification result returned.');
        return result;
    }, [mfilesId, selectedVault]);

    const handleAIClassify = useCallback(async () => {
        const currentFile = fileQueue[activeFileIdx]?.file ?? uploadedFile;
        if (!currentFile) {
            setAiError('Please attach a file first to use AI classification.');
            return;
        }
        setAiError('');
        setAiClassifying(true);
        setBgPromptOpen(true);

        // AbortController so we can cancel on "run in background"
        const abort = new AbortController();
        abortRef.current = abort;

        // After 60 s without a result → prompt the user
        // timeoutRef.current = setTimeout(() => {
        //     if (!abort.signal.aborted) {
        //         setBgPromptOpen(true);
        //     }
        // }, 60_000);

        try {
            const result = await runClassify(currentFile, abort.signal);
            clearTimeout(timeoutRef.current);

            // Pass class ID, AI properties, AND the known objectId up
            if (onAIClassSelect) {
                onAIClassSelect(result.class, result.properties || [], selectedObjectId);
            } else {
                onClassSelect(result.class, '', selectedObjectId);
            }
        } catch (err) {
            clearTimeout(timeoutRef.current);
            if (err.name === 'AbortError') return;  // sent to background — not an error
            console.error('AI classification error:', err);
            setAiError(err.message || 'AI classification failed. Please try again.');
        } finally {
            setAiClassifying(false);
        }
    }, [fileQueue, activeFileIdx, uploadedFile, runClassify, onAIClassSelect, onClassSelect, selectedObjectId]);

    // ── "Send to background" ─────────────────────────────────────────────────
    const handleSendToBackground = useCallback(() => {
        // Abort the in-progress fetch
        abortRef.current?.abort();
        clearTimeout(timeoutRef.current);
        setBgPromptOpen(false);
        setAiClassifying(false);

        // Enqueue ALL pending files in the background queue
        const pending = fileQueue.filter(f => f.status === 'pending');
        if (onEnqueueBackground && pending.length > 0) {
            onEnqueueBackground(pending.map(f => f.file));
        }
    }, [fileQueue, onEnqueueBackground]);

    // ── Group expansion helpers ───────────────────────────────────────────────
    const buildState = useCallback((value) => {
        const s = {};
        groupedItems?.forEach(g => { s[g.classGroupId] = value; });
        if (ungroupedItems?.length > 0) s['ungrouped'] = value;
        return s;
    }, [groupedItems, ungroupedItems]);

    // Collapse all groups on open
    useEffect(() => {
        if (open) setExpandedGroups(buildState(false));
    }, [open, buildState]);

    // Auto-expand / collapse groups based on search query
    useEffect(() => {
        if (!searchQuery) { setExpandedGroups(buildState(false)); return; }

        const s = {};
        groupedItems?.forEach(g => {
            s[g.classGroupId] = g.members.some(
                m => m.className.toLowerCase().includes(searchQuery) && m.userPermission?.attachObjectsPermission
            );
        });
        if (ungroupedItems?.length > 0) {
            s['ungrouped'] = ungroupedItems.some(
                m => m.className.toLowerCase().includes(searchQuery) && m.userPermission?.attachObjectsPermission
            );
        }
        setExpandedGroups(s);
    }, [searchQuery, groupedItems, ungroupedItems, buildState]);

    const filterItems = useCallback(
        (items) => items.filter(m =>
            m.className.toLowerCase().includes(searchQuery) && m.userPermission?.attachObjectsPermission
        ),
        [searchQuery]
    );

    const toggleGroup = (id) => setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    const expandAll = () => setExpandedGroups(buildState(true));
    const collapseAll = () => setExpandedGroups(buildState(false));

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* ── "This is taking a while" prompt ── */}
            <Dialog
                open={bgPromptOpen}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ backgroundColor: THEME_COLORS.primary, color: '#fff', fontSize: 14, py: 1.2, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PiSparkleFill style={{ fontSize: 15 }} />
                    AI Classification is taking a while…
                </DialogTitle>
                <DialogContent sx={{ pt: '16px !important', px: 2, pb: 1 }}>
                    <Typography sx={{ fontSize: 13, color: '#444' }}>
                        The analysis has been running for over a minute. You can continue working and let it run in the background — we'll notify you when it's done.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
                    <Button
                        size="small"
                        onClick={() => setBgPromptOpen(false)}
                        sx={{ textTransform: 'none', fontSize: 12, color: '#555' }}
                    >
                        Keep waiting
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={handleSendToBackground}
                        sx={{
                            textTransform: 'none',
                            fontSize: 12,
                            borderRadius: '20px',
                            backgroundColor: THEME_COLORS.primary,
                        }}
                    >
                        <PiSparkleFill style={{ marginRight: 4, fontSize: 12 }} />
                        Run in Background
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                fullWidth
                maxWidth={isTwoPanel ? 'xl' : 'sm'}
                PaperProps={{
                    sx: {
                        height: { xs: '100dvh', sm: '95vh', md: '85vh' },
                        maxHeight: { xs: '100dvh', sm: '95vh' },
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
                    <img src={logo} alt="Logo" style={{ width: 'clamp(100px, 28vw, 130px)' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                        {selectedObjectId === 0
                            ? <FaFileCirclePlus style={{ color: '#fff', fontSize: '18px', flexShrink: 0 }} />
                            : <DynamicIcon  name={selectedObjectName} color={'#fff'} size={18}/> }
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#fff',
                                fontSize: { xs: '12px', sm: '14px' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: { xs: '40vw', sm: 'unset' },
                            }}
                        >
                            Select {selectedObjectName} Class
                        </Typography>
                    </Box>
                </DialogTitle>

                {/* ── Body ── */}
                <DialogContent sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: 0, minHeight: 0 }}>
                    <Grid container sx={{ flex: 1, minHeight: 0, height: '100%' }}>

                        {/* ── Left: class selector ── */}
                        <Grid
                            item
                            xs={12}
                            md={isTwoPanel && previewVisible ? 5 : 12}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: { xs: 'auto', md: '100%' },
                                minHeight: 0,
                                borderRight: { md: isTwoPanel && previewVisible ? '1px solid #e0e0e0' : 'none' },
                                borderBottom: { xs: isTwoPanel && previewVisible ? '1px solid #e0e0e0' : 'none', md: 'none' },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {/* Search + controls */}
                            <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 1, flexShrink: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                                    <Typography sx={{ fontSize: 13, color: '#555' }}>
                                        Select or search a class below
                                    </Typography>
                                    {/* Upload toggle — only for document objects */}
                                    {/* {isTwoPanel && (
                                    <UploadToggle
                                        previewVisible={previewVisible}
                                        onToggle={() => setPreviewVisible(v => !v)}
                                    />
                                )} */}
                                </Box>

                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    placeholder="Search class..."
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    InputLabelProps={{ shrink: true, sx: { fontSize: 13, color: '#555b6e' } }}
                                    InputProps={{ sx: { fontSize: 13, color: '#555b6e' } }}
                                />

                                {!isLoading && !searchQuery && (
                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        {[['Expand All', expandAll, ExpandMore], ['Collapse All', collapseAll, ExpandLess]]
                                            .map(([label, handler, Icon]) => (
                                                <Button
                                                    key={label}
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={handler}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontSize: 13,
                                                        px: 1.5, py: 0.4,
                                                        color: THEME_COLORS.primary,
                                                        borderColor: THEME_COLORS.primary,
                                                        '&:hover': { borderColor: '#1e4a8a', backgroundColor: '#f0f4f8' },
                                                    }}
                                                >
                                                    <Icon sx={{ fontSize: 16, mr: 0.5 }} />
                                                    {label}
                                                </Button>
                                            ))}
                                    </Box>
                                )}
                            </Box>

                            {/* Scrollable class list */}
                            <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, px: 1, pb: 1 }}>
                                {isLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    <List sx={{ py: 1, px: 1 }}>
                                        {/* Grouped */}
                                        {groupedItems.map(group => {
                                            const members = filterItems(group.members);
                                            if (!members.length) return null;
                                            return (
                                                <CollapsibleGroup
                                                    key={group.classGroupId}
                                                    label={group.classGroupName}
                                                    groupId={group.classGroupId}
                                                    members={members}
                                                    expanded={!!expandedGroups[group.classGroupId]}
                                                    onToggle={toggleGroup}
                                                    selectedObjectId={selectedObjectId}
                                                    onClassSelect={onClassSelect}
                                                    uploadedFile={uploadedFile}
                                                    setFileUploadError={setFileUploadError}
                                                />
                                            );
                                        })}

                                        {/* Ungrouped */}
                                        {ungroupedItems.length > 0 && filterItems(ungroupedItems).length > 0 && (
                                            <CollapsibleGroup
                                                label="Ungrouped"
                                                groupId="ungrouped"
                                                members={filterItems(ungroupedItems)}
                                                expanded={!!expandedGroups['ungrouped']}
                                                onToggle={toggleGroup}
                                                selectedObjectId={selectedObjectId}
                                                onClassSelect={onClassSelect}
                                            />
                                        )}

                                        {/* ── AI Classification — secondary option inside the list ── */}
                                        {uploadedFile ?
                                            <Box
                                                sx={{
                                                    mt: 1.5,
                                                    mx: 1,
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    border: '1px dashed #a5d6a7',
                                                    backgroundColor: '#f1f8f1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: 1.5,
                                                    flexWrap: 'wrap',
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <PiSparkleFill style={{ fontSize: 13 }} />
                                                        Not sure which class to pick?
                                                    </Typography>
                                                    <Typography sx={{ fontSize: 11.5, color: '#555', mt: 0.3 }}>
                                                        Let AI analyse the file and suggest the best match.
                                                    </Typography>
                                                    {aiError && (
                                                        <Typography sx={{ fontSize: 11, color: '#c62828', mt: 0.5 }}>
                                                            {aiError}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={handleAIClassify}
                                                    disabled={aiClassifying}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontSize: 12,
                                                        px: 1.5,
                                                        py: 0.5,
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0,
                                                        color: '#2e7d32',
                                                        borderColor: '#a5d6a7',
                                                        borderRadius: '20px',
                                                        '&:hover': { backgroundColor: '#e8f5e9', borderColor: '#4CAF50' },
                                                    }}
                                                >
                                                    {aiClassifying ? (
                                                        <>
                                                            <CircularProgress size={11} sx={{ mr: 0.7, color: '#2e7d32' }} />
                                                            Analysing…
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PiSparkleFill style={{ fontSize: 13, marginRight: 4 }} />
                                                            Try AI Classification
                                                        </>
                                                    )}
                                                </Button>
                                            </Box>
                                            : <></>}
                                    </List>
                                )}
                            </Box>


                        </Grid>

                        {/* ── Right: file upload / viewer (document objects only) ── */}
                        {isTwoPanel && previewVisible && (
                            <Grid
                                item
                                xs={12}
                                md={7}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: { xs: '42vh', sm: '48vh', md: '100%' },
                                    minHeight: { xs: 200, md: 0 },
                                }}
                            >
                                {/* ── Multi-file chip strip ── */}
                                {/* {fileQueue.filter(e => e.file != null).length > 1 && (
                                    <Box sx={{ px: 1, pt: 1, flexShrink: 0, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {fileQueue.filter(e => e.file != null).map((entry, idx) => {
                                            const name = entry.file?.name ?? entry.fileName ?? 'File';
                                            const chipLabel = name.length > 22 ? name.slice(0, 20) + '…' : name;
                                            return (
                                                <Chip
                                                    key={entry.id}
                                                    label={chipLabel}
                                                    size="small"
                                                    onClick={() => { setActiveFileIdx(idx); onFileChange(entry.file); }}
                                                    onDelete={() => removeFileFromQueue(entry.id)}
                                                    sx={{
                                                        fontSize: 11,
                                                        backgroundColor: idx === activeFileIdx ? THEME_COLORS.primary : '#e3f0fb',
                                                        color: idx === activeFileIdx ? '#fff' : '#333',
                                                        '& .MuiChip-deleteIcon': { color: idx === activeFileIdx ? '#ffffffbb' : '#999' },
                                                    }}
                                                />
                                            );
                                        })}
                                        <Tooltip title="Add more files" arrow>
                                            <Chip
                                                label="+ Add"
                                                size="small"
                                                onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.multiple = true; inp.onchange = e => handleMultiFileDrop(Array.from(e.target.files)); inp.click(); }}
                                                sx={{ fontSize: 11, backgroundColor: '#f5f5f5', color: '#555', border: '1px dashed #ccc' }}
                                            />
                                        </Tooltip>
                                    </Box>
                                )} */}
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
                </DialogContent>
                {/* Footer — cancel only */}
                <DialogActions
                    sx={{
                        flexShrink: 0,
                        backgroundColor: THEME_COLORS.surfaceLight,
                        borderTop: '1px solid #e0e0e0',
                        px: { xs: 1.5, sm: 2 },
                        py: 1.5,
                    }}
                >
                    <Button
                        className="rounded-pill"
                        variant="contained"
                        size="medium"
                        onClick={onClose}
                        sx={{
                            textTransform: 'none',
                            backgroundColor: '#FFD54F',
                            color: '#000',
                            '&:hover': { backgroundColor: '#FFCA28' },
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ClassSelectionDialog;