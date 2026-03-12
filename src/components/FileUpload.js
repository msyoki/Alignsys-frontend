import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box } from '@mui/material';
import '../styles/FileUpload.css';
import DynamicFileViewer3 from './Viewer/DynamicFileViewer3';
import { THEME_COLORS } from '../constants/themeColors';
import { MdOutlineFileUpload } from "react-icons/md";

const FileUploadComponent = (props) => {
    const [fileData, setFileData] = useState(null);

    const getFileExtension = (filename) =>
        filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);

    const convertToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
        });

    useEffect(() => {
        if (!props.uploadedFile) {
            setFileData(null);
            return;
        }
        convertToBase64(props.uploadedFile)
            .then((base64) =>
                setFileData({
                    title: props.uploadedFile.name,
                    base64,
                    extension: getFileExtension(props.uploadedFile.name),
                })
            )
            .catch(console.error);
    }, [props.uploadedFile]);

    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles?.length) props.handleFileChange(acceptedFiles[0]);
        },
        [props]
    );

    const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
        onDrop,
        multiple: false,
        noClick: true,
        noDrag: false,
        accept: {
            'image/*': [],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
            'text/plain': ['.txt'],
        },
    });

    return (
        /*
         * Root: owns its own border/radius and visual chrome.
         * Parent only needs to handle positioning (flex, margin).
         */
        <>

            {/* Dropzone — grows to fill all remaining height */}
            <Box
                {...getRootProps({
                    className: 'dropzone', // maintain className
                    onClick: (e) => {
                        if (!props.uploadedFile) {
                            openFileDialog(); // only open if no file uploaded
                        } else {
                            e.preventDefault(); // prevent accidental clicks
                        }
                    },
                })}
                sx={{
                    flex: 1,
                    minHeight: 0,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: props.uploadedFile ? '#ecf4fc' : '#ecf4fc',
                    border: props.uploadedFile
                        ? 'none'
                        : `1.4px dashed ${props.fileUploadError ? '#CC3333' : '#CC3333'}`,
                    borderRadius: props.uploadedFile ? 0 : '8px',
                    position: 'relative',
                    outline: isDragActive ? '2px dashed #2757aa' : 'none',
                    outlineOffset: '-2px',
                    cursor: props.uploadedFile ? 'default' : 'pointer',
                    overflow: 'hidden',
                }}
            >
                <input {...getInputProps()} />

                {/* Drag-over overlay (replacement mode) */}
                {isDragActive && props.uploadedFile && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(39, 87, 170, 0.1)',
                            //border: 'px dashed #2757aa',
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
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <MdOutlineFileUpload style={{ fonstSize: 30 }} />
                            Drop to replace file
                        </Box>
                    </Box>
                )}

                {/* Content: viewer or placeholder */}
                {props.uploadedFile && fileData ? (
                    /*
                     * Viewer wrapper: flex + overflow:hidden so DynamicFileViewer3
                     * fills the entire available space without overflowing.
                     */
                    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        <Box
                            onClick={openFileDialog}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                px: 2,
                                py: 0.8,
                                backgroundColor: '#ddeaf9',
                                borderBottom: '1px dashed #2757aa',
                                cursor: 'pointer',
                                fontSize: 12,
                                color: '#2757aa',
                                fontWeight: 500,
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    backgroundColor: '#ccdff5',
                                },
                            }}
                        >
                            <MdOutlineFileUpload style={{ fontSize: 15 }} />
                            <span>
                                <strong>{props.uploadedFile.name}</strong> — Click here or drag &amp; drop to replace
                            </span>
                        </Box>

                        <DynamicFileViewer3 {...fileData} />
                    </Box>
                ) : (
                    <Box
                        sx={{
                            flex: 1,
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
                            style={{ fontSize: 100, color: THEME_COLORS.primary, margin: 16 }}
                        />
                        <p>Drag &amp; drop a file here, or click here to upload</p>

                        {props.fileUploadError && (
                            <Box sx={{ color: '#CC3333', fontSize: 13, mt: 1 }}>
                                {props.fileUploadError}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </>
    );
};

export default FileUploadComponent;