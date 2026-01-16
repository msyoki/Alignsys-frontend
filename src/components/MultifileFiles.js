import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Tooltip, CircularProgress } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FileExtIcon from './FileExtIcon';
import FileExtText from './FileExtText';
import axios from 'axios';
import * as constants from './Auth/configs';

import { FaRegFilePdf } from "react-icons/fa6";
import { BsFiletypeCsv } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa6";
import { BsFiletypeTxt } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa";
import { FaInternetExplorer } from "react-icons/fa";
import { BsFiletypePptx } from "react-icons/bs";
import { VscVscode } from "react-icons/vsc";
import { CiFileOn } from "react-icons/ci";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { CiImageOn } from "react-icons/ci";
import { HiOutlineAnnotation } from "react-icons/hi";
import RightClickMenu from './RightMenu';
import { BsFiles } from "react-icons/bs";
import OfficeApp from './Modals/OfficeAppDialog';
import TimedAlert from './TimedAlert';
import PdfMergeDialog from './Modals/PdfMergeDialog';
import PdfConversionDialog from './Modals/PdfConversionDialog';
import {THEME_COLORS} from '../constants/themeColors';

function useSessionState(key, defaultValue) {
    const getInitialValue = () => {
        try {
            const stored = sessionStorage.getItem(key);
            if (stored === null || stored === 'undefined') return defaultValue;
            return JSON.parse(stored);
        } catch {
            return defaultValue;
        }
    };
    const [value, setValue] = useState(getInitialValue);
    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch { }
    }, [key, value]);
    return [value, setValue];
}

const MultifileFiles = React.memo((props) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState(['multifile-root']);

    const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
    const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
    const [openAlert, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [alertMsg, setAlertMsg] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuItem, setMenuItem] = useState(null);
    const [file, setFile] = useState(null);


    const [pdfDialogOpen, setPdfDialogOpen] = useSessionState('ss_pdfDialogOpen', false);
    const [pdfConversionItem, setPdfConversionItem] = useSessionState('ss_pdfConversionItem', null);
    const [pdfOverwriteOriginal, setPdfOverwriteOriginal] = useSessionState('ss_pdfOverwriteOriginal', false);
    const [isConvertingToPdf, setIsConvertingToPdf] = useSessionState('ss_isConvertingToPdf', false);


    const [mergeDialogOpen, setMergeDialogOpen] = useSessionState('ss_mergeDialogOpen', false);
    const [mergeItem, setMergeItem] = useSessionState('ss_mergeItem', null);
    const [isMergingToPdf, setIsMergingToPdf] = useSessionState('ss_isMergeToPdf', false);






    // Memoized icon style to prevent recreation
    const iconStyle = useMemo(() => ({
        fontSize: props.fontSize || '18px',
    }), [props.fontSize]);



    // Memoized icon generation function
    const getIcon = useCallback((extension) => {
        const ext = (extension || '').toLowerCase();

        switch (ext) {
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
    }, [iconStyle]);

    const handlePdfConversionRequest = (item, overwriteOriginal) => {
        setPdfConversionItem(item);
        setPdfOverwriteOriginal(overwriteOriginal);
        setPdfDialogOpen(true);
    };



    const handlePdfConversionConfirm = () => {
     
        if (pdfConversionItem) {
            setIsConvertingToPdf(true);
            convertToPDF(pdfConversionItem, pdfOverwriteOriginal);
        }
    };

    const handlePdfConversionCancel = () => {
        setPdfDialogOpen(false);
        setPdfConversionItem(null);
        setIsConvertingToPdf(false);
    };

    const handlMergeCancel = () => {
        setMergeDialogOpen(false);
        setMergeItem(null);
        setIsMergingToPdf(false);
    };

    const handleMergeConfirm = async () => {
        setIsMergingToPdf(true);

        // console.log("Merge item:", mergeItem);
        if (mergeItem) {
            // Prepare payload
            const payload = {
                vaultGuid: props.selectedVault.guid,
                userID: props.selectedVault?.vaultId,
                oldClassID: mergeItem.classID ?? mergeItem.classId,
                oldObjectTypeID: mergeItem.objectID ?? mergeItem.objectTypeId,
                objectId: mergeItem.id,
                title: mergeItem.title,
            };

            // Log payload before sending
            // console.log("Payload to be sent:", payload);

            try {
                const response = await axios.post(
                    `${constants.mfiles_api}/api/objectinstance/CombinePdfObjectFiles`,
                    payload,
                    {
                        headers: {
                            Accept: "*/*",
                            "Content-Type": "application/json",
                        },
                    }
                );

                // console.log("Response:", response.data);

                props.handleTabAction();

            } catch (error) {
                console.error("Error combining PDF object files:", error);

            } finally {
                setIsMergingToPdf(false);
                setMergeDialogOpen(false);
                setMergeItem(null);
            }
        }

        props.handleTabAction()


    };



    const deleteObject = useCallback((item) => {
        const data = JSON.stringify({
            "vaultGuid": props.selectedVault.guid,
            "objectId": item.id,
            "classId": item.classID || item.classId,
            "userID": props.mfilesId
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.mfiles_api}/api/ObjectDeletion/DeleteObject`,
            headers: { 'Content-Type': 'application/json' },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setOpenAlert(true);
                setAlertSeverity("success");
                setAlertMsg("Object was deleted successfully");
                setDeleteDialogOpen(false);
            })
            .catch((error) => {
                setOpenAlert(true);
                setAlertSeverity("error");
                setAlertMsg("Failed to delete, please try again later");
                setDeleteDialogOpen(false);
            });
    }, [props.selectedVault.guid, props.mfilesId]);

    const convertToPDF = useCallback(async (doc, overWriteOriginal) => {
        // doc is a file from documents array, props.item is the parent object
        const payload = {
            vaultGuid: props.selectedVault.guid,
            objectId: props.item.id,
            classId: props.item.classId || props.item.classID,
            fileID: doc.fileID,
            overWriteOriginal: overWriteOriginal,
            separateFile: overWriteOriginal ? false : true,
            userID: props.mfilesId
        };
    

        try {
            const response = await axios.post(
                `${constants.mfiles_api}/api/objectinstance/ConvertToPdf`,
                payload,
                {
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );
            setIsConvertingToPdf(false);
            setPdfDialogOpen(false)
            props.handleTabAction()
            return response.data;
        } catch (error) {
            setIsConvertingToPdf(false);
            setPdfDialogOpen(false)
            console.error('Error converting to PDF:', error);
            setOpenAlert(true);
            setAlertSeverity("error");
            const rawMessage = error?.response?.data;
            const userMessage = typeof rawMessage === 'string'
                ? rawMessage.split('\n')[0].trim()
                : 'Failed to convert file to PDF';
            setAlertMsg(`ConvertToPdf error: ${userMessage}`);
        }
    }, [props.selectedVault.guid, props.mfilesId, props.item]);

    const openApp = useCallback((doc) => {
        // doc is a file from documents array with its own fileID and extension
        const extension = doc.extension?.replace(/^\./, '').toLowerCase();
      
        if (['csv', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf', 'ppt', 'jpeg', 'png', 'jpg'].includes(extension)) {
       
            setObjectToEditOnOfficeApp({
                ...props.item, // Parent object data
                guid: props.selectedVault.guid,
                extension,
                type: props.item.objectTypeId ?? props.item.objectID,
                fileID: doc.fileID // Specific file ID from the clicked doc
            });
            setOpenOfficeApp(true);
        }
    }, [props.selectedVault.guid, props.item, setObjectToEditOnOfficeApp, setOpenOfficeApp]);

    const handleRightClick = useCallback((e, item) => {
        e.preventDefault();
        e.stopPropagation();
     
        setMenuAnchor(e.currentTarget);
        setMenuItem(item);
        setFile(item);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuAnchor(null);
        setMenuItem(null);
    }, []);

    // Optimized right click actions - borrowed from LinkedObjectsTree
    const rightClickActions = useMemo(() => {
        const actions = [];

        if (menuItem) {
            // menuItem is a specific file (doc) from the documents array
            // props.item is the parent object that contains all these files

            // Open action - always available
            actions.push({
                label: (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        {getIcon(menuItem.extension)}
                        <Box>Open</Box>
                        <Box sx={{ ml: 'auto', color: '#666', fontWeight: 500, fontSize: '13px' }}>
                            Open in default application
                        </Box>
                    </Box>
                ),
                onClick: (item, event) => {
                    event?.preventDefault();
                    event?.stopPropagation();
              
                    openApp(menuItem); // menuItem contains the specific file with fileID
                    handleMenuClose();
                }
            });

            // Convert to PDF actions - only for supported file types
            // Check the extension of the specific file (menuItem), not the parent object
            if (menuItem.extension &&
                ['docx', 'doc', 'xlsx', 'xls', 'ppt', 'jpg', 'jpeg', 'png', 'gif'].includes(
                    menuItem.extension.toLowerCase().replace(/^\./, '')
                )) {
                actions.push(
                    {
                        label: <Box sx={{ px: 1 }}>Convert to PDF overwrite Original Copy</Box>,
                        onClick: (item, event) => {
                            event?.preventDefault();
                            event?.stopPropagation();
                          
                            handlePdfConversionRequest(menuItem, true);
                            // onvertToPDF(menuItem, true); // Pass the specific file doc
                            handleMenuClose();
                        }
                    },
                    {
                        label: <Box sx={{ px: 1 }}>Convert to PDF Keep Original Copy</Box>,
                        onClick: (item, event) => {
                            event?.preventDefault();
                            event?.stopPropagation();
                            handlePdfConversionRequest(menuItem, false);
                            // convertToPDF(menuItem, false); // Pass the specific file doc
                            handleMenuClose();
                        }
                    }
                );
            }
        }

        return actions;
    }, [menuItem, props.selectedVault.guid, props.item, openApp, handleMenuClose, convertToPDF]);


    // Memoized API URL to prevent unnecessary effect triggers
    const apiUrl = useMemo(() => {
        if (!props.selectedVault?.guid || !props.item?.id) return null;
        return `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${props.item.id}/${props.item.classId ?? props.item.classID}`;
    }, [props.selectedVault?.guid, props.item?.id, props.item?.classId, props.item?.classID]);

    // Optimized data fetching with proper cleanup
    useEffect(() => {
      
        if (!apiUrl) {
            setLoading(false);
            setDocuments([]);
            return;
        }

        let isMounted = true;
        const abortController = new AbortController();

        const fetchDocuments = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(apiUrl, {
                    signal: abortController.signal
                });

                if (isMounted) {
                    setDocuments(response.data || []);
                
                }
            } catch (err) {
                if (isMounted && !axios.isCancel(err)) {
                    console.error('Error fetching documents:', err);
                    setError(err);
                    setDocuments([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDocuments();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [apiUrl, props.item]);

    // Memoized tree item styles to prevent recreation
    const treeItemStyles = useMemo(() => ({
        fontSize: "13px",
        "& .MuiTreeItem-label": { fontSize: "13px !important" },
        "& .MuiTypography-root": { fontSize: "13px !important" },
        backgroundColor: '#fff !important',
        "&:hover": { backgroundColor: '#fff !important' },
        borderRadius: "0px !important",
        "& .MuiTreeItem-content": { borderRadius: "0px !important" },
        "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
        "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
    }), []);

    // Handle expand/collapse
    const handleExpandedItemsChange = useCallback((event, itemIds) => {
        setExpandedItems(itemIds);
    }, []);

    const downloadFileBlob = async (fileId, extension) => {
        props.setLoadingFile(true);
        try {
            const url = `${constants.mfiles_api}/api/objectinstance/DownloadOtherFiles?ObjectId=${props.item.id}&VaultGuid=${props.selectedVault.guid}&fileID=${fileId}&ClassId=${props.item.classId ?? props.item.classID}`;

            const response = await axios.get(url, {
                headers: { Accept: "*/*" },
                responseType: "blob",
                timeout: 0,
            });

            const blobData = response.data;
            if (!(blobData instanceof Blob)) {
                throw new Error("Invalid file format received");
            }

            props.setSelectedFileId(fileId);
            props.setExtension(extension);
            if (blobData.size === 0) {
                alert("File is empty");
            }
            props.a11yProps(1);
            props.setBlob(blobData);
            console.log("Blob data:", blobData);
            props.setLoadingFile(false);
            console.log("File downloaded successfully");
        } catch (error) {
            props.setLoadingFile(false);
            console.error("Download failed:", error);
            throw error;
        }
    };

    // Memoized document items to prevent unnecessary re-renders
    const documentItems = useMemo(() => {
        return documents.map((doc, index) => {
            const isSelected = props.selectedItemId === `${doc.fileID}-${doc.fileTitle}`;
            const itemId = `${doc.fileID}-multifile-${index}`;

            return (
                <TreeItem
                    key={doc.fileID || index}
                    itemId={itemId}
                    onClick={() => {
                        props.setSelectedItemId(`${doc.fileID}-${doc.fileTitle}`);
                        props.onItemClick?.(props.item);
                        downloadFileBlob(doc.fileID, doc.extension);
                    }}
                    onContextMenu={(e) => handleRightClick(e, doc)}
                    sx={treeItemStyles}
                    label={
                        <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                                p: 0.5,
                                backgroundColor: isSelected ? '#e5e5e5' : '#fff',
                                overflow: 'hidden'
                            }}
                        >
                            <Tooltip
                                title={doc?.fileTitle ? `${doc.fileTitle}.${doc.extension}` : 'No title'}
                                placement="right"
                                arrow
                            >
                                <Box display="flex" alignItems="center" sx={{ overflow: 'hidden' }}>
                                    <Box sx={{ mx: 0.5 }}>{getIcon(doc.extension)}</Box>
                                    <Box
                                        className="list-text"
                                        sx={{
                                            fontSize: '13px',
                                            mx: 1,
                                            minWidth: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {doc?.fileTitle}.{doc?.extension}
                                    </Box>
                                </Box>
                            </Tooltip>
                        </Box>
                    }
                />
            );
        });
    }, [documents, props.selectedItemId, getIcon, treeItemStyles, handleRightClick, props, downloadFileBlob]);

    // Memoized loading component
    const loadingComponent = useMemo(() => (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                padding: '8px',
                marginLeft: '10px',
                color: '#555b6e',
                fontSize: '13px'
            }}
        >
            <span className="loading-indicator text-muted">
                Searching Files<span>.</span><span>.</span><span>.</span>
            </span>
        </Box>
    ), []);

    // Memoized error component
    const errorComponent = useMemo(() => (
        <></>
    ), []);

    // Memoized empty state component
    const emptyComponent = useMemo(() => (
        <></>
    ), []);

    // Main render logic
    if (error) {
        return errorComponent;
    }

    if (!documents || documents.length === 0) {
        return emptyComponent;
    }

    return (
        <>


            <PdfConversionDialog
                open={pdfDialogOpen}
                onClose={handlePdfConversionCancel}
                onConfirm={handlePdfConversionConfirm}
                fileName={pdfConversionItem?.fileTitle || 'Unknown'}
                file={pdfConversionItem}
                vault={props.selectedVault}
                overwriteOriginal={pdfOverwriteOriginal}
                isConverting={isConvertingToPdf}
            />

            <TimedAlert
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                severity={alertSeverity}
                message={alertMsg}
                setSeverity={setAlertSeverity}
                setMessage={setAlertMsg}
            />

            <OfficeApp
                open={openOfficeApp}
                close={() => setOpenOfficeApp(false)}
                object={objectToEditOnOffice}
                mfilesId={props.mfilesId}

            />
            <SimpleTreeView
                expandedItems={expandedItems}
                onExpandedItemsChange={handleExpandedItemsChange}
                sx={{
                    "& .MuiTreeItem-root": {
                        "& .MuiTreeItem-content": {
                            padding: "2px 0",
                            minHeight: "28px", // Reduces vertical space
                            marginLeft: '10px'
                        }
                    }
                }}
            >
                <TreeItem
                    itemId="multifile-root"
                    sx={{
                        ...treeItemStyles,
                        marginLeft: '8px' // Reduced from 15px
                    }}
                    label={
                        <Box
                            display="flex"
                            alignItems="center"
                            gap="10px" // Replaces marginLeft for consistent spacing
                            sx={{
                                padding: '2px 0', // Reduced from 3px
                                color: '#333'
                            }}
                        >
                            <BsFiles style={{ fontSize: '15px', color: '#8d99ae' }} />

                            <Box sx={{ fontSize: '13px', color: '#666' }}>
                                Files ({documents.length})
                            </Box>
                        </Box>
                    }
                >
                    {documentItems}
                </TreeItem>
            </SimpleTreeView>

            {/* Render RightClickMenu once, outside the tree */}
            {rightClickActions.length > 0 && (
                <RightClickMenu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                    item={menuItem}
                    actions={rightClickActions}
                />
            )}
        </>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.fontSize === nextProps.fontSize &&
        prevProps.selectedVault?.guid === nextProps.selectedVault?.guid &&
        prevProps.item?.id === nextProps.item?.id &&
        prevProps.item?.classId === nextProps.item?.classId &&
        prevProps.item?.classID === nextProps.item?.classID &&
        prevProps.selectedItemId === nextProps.selectedItemId &&
        prevProps.downloadFile === nextProps.downloadFile
    );
});

MultifileFiles.displayName = 'MultifileFiles';

export default MultifileFiles;