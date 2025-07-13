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

    // Memoized download handler to prevent recreation
    const handleDownload = useCallback((fileID) => {
        if (props.downloadFile) {
            props.downloadFile(fileID, props.item);
        }
    }, [props.downloadFile, props.item]);

    // Memoized document items to prevent unnecessary re-renders
    const documentItems = useMemo(() => {
        return documents.map((doc, index) => {
            const isSelected = props.selectedItemId === `${doc.fileID}-${doc.fileTitle}`;
            const itemId = `${doc.fileID}-multifile-${index}`;
            
            return (
                <SimpleTreeView key={doc.fileID || index}>
                    <TreeItem
                        itemId={itemId}
                        onClick={() => {handleDownload(doc.fileID); props.setSelectedItemId(`${doc.fileID}-${doc.fileTitle}`)}}
                        sx={treeItemStyles}
                        label={
                            <Box 
                                display="flex" 
                                alignItems="center" 
                                sx={{ 
                                    padding: '3px', 
                                    backgroundColor: isSelected ? '#fcf3c0' : 'inherit',
                                    borderRadius: '2px'
                                }}
                            >
                                {getIcon(doc.extension)}
                                <Tooltip 
                                    title={`${doc.fileTitle}.${doc.extension}` || 'No title'} 
                                    placement="right"
                                    arrow
                                    enterDelay={500}
                                    leaveDelay={200}
                                >
                                    <span 
                                        style={{ 
                                            fontSize: '12.5px',
                                            minWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} 
                                        className='list-text mx-2'
                                    >
                                        {doc.fileTitle}
                                    </span>
                                </Tooltip>
                            </Box>
                        }
                    />
                </SimpleTreeView>
            );
        });
    }, [documents, props.selectedItemId, getIcon, handleDownload, treeItemStyles]);

    // Memoized loading component
    const loadingComponent = useMemo(() => (
        <Box 
           display="flex" 
            alignItems="center" 
            sx={{ 
                padding: '8px', 
                marginLeft:'10px',
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
        // <Box 
        //     display="flex" 
        //     alignItems="center" 
        //     sx={{ 
        //         padding: '8px', 
        //         marginLeft:'10px',
        //         color: '#555',
        //         fontSize: '12px'
        //     }}
        // >
        //     {/* <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i> */}
        //     <span className='mx-3'>No files found</span>
        // </Box>
        <></>
      
    ), []);

    // Memoized empty state component
    const emptyComponent = useMemo(() => (
        // <Box 
        //     display="flex" 
        //     alignItems="center" 
        //     sx={{ 
        //         padding: '8px', 
        //         color: '#888',
        //         fontSize: '12px'
        //     }}
        // >
        //     <i className="fas fa-folder-open" style={{ marginRight: '8px' }}></i>
        //     <span>No files found</span>
        // </Box>
        <></>
    ), []);

    // Main render logic
    // if (loading) {
    //     return loadingComponent;
    // }

    if (error) {
        return errorComponent;
    }

    if (!documents || documents.length === 0) {
        return emptyComponent;
    }

    return <>{documentItems}</>;
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