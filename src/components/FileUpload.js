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
                        <>
                            <p style={{fontWeight:'bold' }} >Uploaded File</p>
                            <p style={{ fontSize:'13px',  color:'#2757aa', fontWeight:'bold'  }} className='my-4'>{props.uploadedFile.name}</p>
                            <p>Drag 'n' drop a file here, or click to browse device to change file</p>
                           
                        </>
                    ) : (
                        <>
                            <p>Upload a file </p>
                            <p><i className="fas fa-file-upload my-4" style={{ fontSize: '40px' , color:'#2757aa'}}></i></p>



                            <p>Drag 'n' drop a file here, or click to browse device</p></>
                    )}
                </div>
            )
            }
        </div >
    );
};

export default FileUploadComponent;
