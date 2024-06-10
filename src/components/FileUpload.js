import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/FileUpload.css'; // Assuming you want to style your component

const FileUploadComponent = (props) => {
    const [selectedObjectId, setSelectedObjectId] = useState(0);

    const onDrop = useCallback((acceptedFiles) => {
        props.handleFileChange(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className='my-3'>
            {selectedObjectId === 0 && (
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the files here...</p>
                    ) : (
                        <p>Drag 'n' drop a file here, or click to select one</p>
                    )}
                </div>
            )}
            {props.uploadedFile && (
                <div>
                    <p>Selected file: {props.uploadedFile.name}</p>
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;
