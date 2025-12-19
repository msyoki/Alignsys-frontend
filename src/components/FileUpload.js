import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Grid, Button, Box, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import '../styles/FileUpload.css'; // Custom styles for the dropzone
import DynamicFileViewer3 from './Viewer/DynamicFileViewer3';

const FileUploadComponent = (props) => {
    const [selectedObjectId, setSelectedObjectId] = useState(0);
    const [fileData, setFileData] = useState(null);
    const fileInputRef = useRef(null);
    const theme = useTheme();
    const isTouchScreen = useMediaQuery('(hover: none) and (pointer: coarse)');

    // Extract file extension from filename
    const getFileExtension = (filename) => {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    };

    // Convert file to base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/png;base64, prefix
            reader.onerror = error => reject(error);
        });
    };

    // Process uploaded file when it changes
    useEffect(() => {
        if (props.uploadedFile) {
            convertToBase64(props.uploadedFile)
                .then(base64 => {
                    setFileData({
                        title: props.uploadedFile.name,
                        base64: base64,
                        extension: getFileExtension(props.uploadedFile.name)
                    });
                })
                .catch(error => {
                    console.error('Error converting file to base64:', error);
                });
        } else {
            setFileData(null);
        }
    }, [props.uploadedFile]);

    const onDrop = useCallback((acceptedFiles) => {
        props.handleFileChange(acceptedFiles[0]);
    }, [props]);

    // Dropzone with click disabled when file is uploaded
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        noClick: !!props.uploadedFile // Disable click when file is uploaded
    });

    // Handle file replacement via button
    const handleReplaceFile = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            props.handleFileChange(file);
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div
                {...getRootProps({ className: 'dropzone' })}
                style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: props.uploadedFile ? 'transparent' : '#ecf4fc',
                    display: 'flex',
                    flexDirection: 'column',
                    border: props.uploadedFile ? 'none' : '2px dashed #ccc',
                    borderRadius: props.uploadedFile ? '0' : '8px',
                    cursor: props.uploadedFile ? 'default' : 'pointer',
                    boxSizing: 'border-box',
                    position: 'relative',
                    outline: isDragActive ? '1px solid #2757aa' : 'none',
                    outlineOffset: '-3px'
                }}
            >
                <input {...getInputProps()} />
                
                {/* Drag overlay indicator */}
                {isDragActive && props.uploadedFile && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(39, 87, 170, 0.1)',
                            border: '1px dashed #2757aa',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            pointerEvents: 'none'
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: '#2757aa',
                                color: 'white',
                                padding: '20px 40px',
                                borderRadius: '8px',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}
                        >
                            <i className="fas fa-file-upload" style={{ marginRight: '10px' }}></i>
                            Drop to replace file
                        </Box>
                    </Box>
                )}

                {props.uploadedFile && fileData ? (
                    <>

                        {/* File Viewer */}
                        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, position: 'relative', zIndex: 0 }}>
                            <DynamicFileViewer3
                                title={fileData.title}
                                base64={fileData.base64}
                                extension={fileData.extension}
                            />
                        </Box>
                    </>
                ) : (
                    <>
                        {selectedObjectId === 0 && (
                            <div
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    minHeight: '150px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    flexDirection: 'column',
                                    padding: '16px',
                                }}
                            >
                                {isDragActive ? (
                                    <p>Drop the files here...</p>
                                ) : (
                                    <>
                                        <p>Upload a file</p>
                                        <p>
                                            <i className="fas fa-file-upload my-4" style={{ fontSize: '40px', color: '#2757aa' }}></i>
                                        </p>
                                        <p>Drag 'n' drop a file here, or click to browse device</p>
                                    </>
                                )}
                            </div>
                        )}
                        {props.fileUploadError && (
                            <div style={{ color: '#CC3333', fontSize: '13px' }}>
                                {props.fileUploadError}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUploadComponent;