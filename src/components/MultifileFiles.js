import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Tooltip, CircularProgress } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import FileExtIcon from './FileExtIcon';
import FileExtText from './FileExtText';
import axios from 'axios';
import * as constants from './Auth/configs';


const MultifileFiles = React.memo((props) => {


    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedItems, setExpandedItems] = useState(['multifile-root']); // Start expanded by default

    // Memoized icon style to prevent recreation
    const iconStyle = useMemo(() => ({
        fontSize: props.fontSize || '15px',
    }), [props.fontSize]);

    // Memoized icon generation function
    const getIcon = useCallback((extension) => {
        const ext = (extension || '').toLowerCase();
        const baseStyle = { ...iconStyle };

        switch (ext) {
            case 'pdf':
                return <i className="fas fa-file-pdf" style={{ ...baseStyle, color: '#f21b3f' }}></i>;
            case 'csv':
                return <i className="fas fa-file-csv" style={{ ...baseStyle, color: '#7cb518' }}></i>;
            case 'txt':
                return <i className="fas fa-file-alt" style={{ ...baseStyle, color: '#6c757d' }}></i>;
            case 'xlsx':
            case 'xls':
                return <i className="fas fa-file-excel" style={{ ...baseStyle, color: '#3e8914' }}></i>;
            case 'ppt':
            case 'pptx':
                return <i className="fas fa-file-powerpoint" style={{ ...baseStyle, color: '#ef6351' }}></i>;
            case 'docx':
            case 'doc':
                return <i className="fas fa-file-word" style={{ ...baseStyle, color: '#0077b6' }}></i>;
            case 'png':
            case 'jpeg':
            case 'jpg':
            case 'gif':
                return <i className="fas fa-file-image" style={{ ...baseStyle, color: '#2a68af' }}></i>;
            default:
                // If extension exists but is not handled, show grey file icon
                if (ext) {
                    return <i className="fas fa-file" style={{ ...baseStyle, color: '#e5e5e5' }}></i>;
                }
                // If no extension, show book icon as fallback
                return <i className="fas fa-book" style={{ ...baseStyle, color: '#7cb518' }}></i>;
        }
    }, [iconStyle]);

    // Memoized API URL to prevent unnecessary effect triggers
    const apiUrl = useMemo(() => {
        if (!props.selectedVault?.guid || !props.item?.id) return null;
        return `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${props.item.id}/${props.item.classId ?? props.item.classID}`;
    }, [props.selectedVault?.guid, props.item?.id, props.item?.classId, props.item?.classID]);

    // Optimized data fetching with proper cleanup
    useEffect(() => {
        console.log(props.item)
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
                    console.log(response.data)
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
    }, [apiUrl]);

    // Memoized tree item styles to prevent recreation
    const treeItemStyles = useMemo(() => ({
        fontSize: "12.5px",
        "& .MuiTreeItem-label": { fontSize: "12.5px !important" },
        "& .MuiTypography-root": { fontSize: "12.5px !important" },
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
                timeout: 0, // disable timeout for large files
            });

            const blobData = response.data;
            if (!(blobData instanceof Blob)) {
                throw new Error("Invalid file format received");
            }


            props.setSelectedFileId(fileId)
            props.setExtension(extension)
            if (blobData.size === 0) {
                alert("File is empty");

            }
            props.a11yProps(1)
            // return blobData;
            props.setBlob(blobData);
            props.setLoadingFile(false);

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
                        props.setSelectedItemId(`${doc.fileID}-${doc.fileTitle}`)
                        downloadFileBlob(doc.fileID, doc.extension)
                    }}
                    sx={treeItemStyles}
                    label={
                        <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                                p: 0.5, // shorthand for padding
                                backgroundColor: isSelected ? '#fcf3c0' : '#fff',
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
                                            fontSize: '12px',
                                            mx: 1,
                                            minWidth: 0, // better than 100% for ellipsis inside flex
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
    }, [documents, props.selectedItemId, getIcon, treeItemStyles]);

    // Memoized loading component
    const loadingComponent = useMemo(() => (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                padding: '8px',
                marginLeft: '10px',
                color: '#555',
                fontSize: '12px'
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
        <SimpleTreeView
            expandedItems={expandedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
            sx={{
                "& .MuiTreeItem-root": {
                    "& .MuiTreeItem-content": {
                        padding: "2px 0",
                    }
                }
            }}
        >
            <TreeItem
                itemId="multifile-root"
                sx={{
                    ...treeItemStyles,
                    marginLeft: '15px'
                }}
                label={
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            padding: '3px',

                            color: '#333'
                        }}
                    >
                        {/* <i className="fa-solid fa-book-open" style={{ fontSize: '15px', color: '#8d99ae' }} />
                        */}
                        <Box sx={{ fontSize: '12.5px' }}> Files ({documents.length})</Box>
                    </Box>
                }
            >
                {documentItems}
            </TreeItem>
        </SimpleTreeView>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for memoization
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

// Set display name for debugging
MultifileFiles.displayName = 'MultifileFiles';

export default MultifileFiles;