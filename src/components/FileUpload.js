import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/FileUpload.css'; // Custom styles for the dropzone

const FileUploadComponent = (props) => {
    const [selectedObjectId, setSelectedObjectId] = useState(0);

    const onDrop = useCallback((acceptedFiles) => {
        props.handleFileChange(acceptedFiles[0]);
    }, [props]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div>
            {selectedObjectId === 0 && (
                <div
                    {...getRootProps({ className: 'dropzone' })}
                    style={{
                        height: '300px',
                        backgroundColor: '#ecf4fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        flexDirection: 'column',
                        padding: '16px',
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <input {...getInputProps()} />

                    {isDragActive ? (
                        <p>Drop the files here...</p>
                    ) : props.uploadedFile ? (
                        <p style={{ fontSize: '13px' }}>{props.uploadedFile.name}</p>
                    ) : (
                        <>
                           <p>Upload a file </p>
                            <p><i className="fas fa-upload my-4" style={{ fontSize: '50px' }}></i></p>

                         

                            <p>Drag 'n' drop a file here, or click to browse device</p></>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;
