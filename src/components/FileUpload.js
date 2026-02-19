import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Tooltip, IconButton } from '@mui/material';
import '../styles/FileUpload.css';
import DynamicFileViewer3 from './Viewer/DynamicFileViewer3';
import { THEME_COLORS } from '../constants/themeColors';
import { MdOutlineFileUpload } from "react-icons/md";


const FileUploadComponent = (props) => {
    const [fileData, setFileData] = useState(null);

    // Extract file extension
    const getFileExtension = (filename) =>
        filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);

    // Convert file to base64
    const convertToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
        });

    // Process uploaded file
    useEffect(() => {
        if (!props.uploadedFile) {
            setFileData(null);
            return;
        }

        convertToBase64(props.uploadedFile)
            .then((base64) => {
                setFileData({
                    title: props.uploadedFile.name,
                    base64,
                    extension: getFileExtension(props.uploadedFile.name),
                });
            })
            .catch(console.error);
    }, [props.uploadedFile]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles?.length) {
                props.handleFileChange(acceptedFiles[0]);
            }
        },
        [props]
    );
    
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        open,
    } = useDropzone({
        onDrop,
        multiple: false,
        noClick: !!props.uploadedFile,
        accept: {
            // Images (all formats)
            'image/*': [],

            // PDF
            'application/pdf': ['.pdf'],

            // Word
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],

            // Excel
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],

            // PowerPoint
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],

            // Text
            'text/plain': ['.txt'],
        },
    });



    return (
        <>
            {/* Header */}
            {props.uploadedFile?.name && (
                <Box
                    className="chat-header2 p-2"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 40,
                    }}
                >
                    <Tooltip title={props.uploadedFile.name}>
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            {props.getFileIcon(props.uploadedFile.name)}
                            <span style={{ marginLeft: 8, fontSize: 12.8 }}>
                                {props.uploadedFile.name}
                            </span>
                        </span>
                    </Tooltip>

                    <Tooltip title="Replace document">
                        <IconButton
                            size="small"
                            onClick={open}
                            sx={{
                                color: THEME_COLORS.primary,
                                '&:hover': {
                                    backgroundColor: 'rgba(39, 87, 170, 0.1)',
                                },
                            }}
                        >
                            <i className="fas fa-sync-alt" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}

            {/* Dropzone */}
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div
                    {...getRootProps({ className: 'dropzone' })}
                    style={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: props.uploadedFile ? 'transparent' : '#ecf4fc',
                        border: props.uploadedFile ? 'none' : `1.4px dashed ${props.fileUploadError ? "#CC3333" : "#ccc"}`,
                        borderRadius: props.uploadedFile ? 0 : 8,
                        position: 'relative',
                        outline: isDragActive ? '1px solid #2757aa' : 'none',
                    }}
                >
                    <input {...getInputProps()} />

                    {/* Drag overlay */}
                    {isDragActive && props.uploadedFile && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(39, 87, 170, 0.1)',
                                border: '1px dashed #2757aa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                pointerEvents: 'none',
                            }}
                        >
                            <Box
                                sx={{
                                    backgroundColor: THEME_COLORS.primary,
                                    color: '#fff',
                                    px: 4,
                                    py: 2,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                }}
                            >
                                <MdOutlineFileUpload style={{ marginRight: 8 }} />
                                Drop to replace file
                            </Box>
                        </Box>
                    )}

                    {/* Viewer or Placeholder */}
                    {props.uploadedFile && fileData ? (
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            <DynamicFileViewer3 {...fileData} />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                height: '100%',
                                minHeight: 150,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                textAlign: 'center',
                                p: 2,
                            }}
                        >
                            <p>Upload a file</p>
                            <MdOutlineFileUpload
                                style={{ fontSize: 40, color: THEME_COLORS.primary, margin: 16 }}
                            />
                            <p>Drag & drop a file here, or click  here to upload </p>

                            {props.fileUploadError && (
                                <div style={{ color: '#CC3333', fontSize: 13 }}>
                                    {props.fileUploadError}
                                </div>
                            )}
                        </Box>
                    )}
                </div>
            </div>
        </>
    );
};

export default FileUploadComponent;
