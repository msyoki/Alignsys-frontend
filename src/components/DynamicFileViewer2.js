import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import SignButton from './SignDocument';
import PDFViewerPreview from './Pdf2';
import axios from 'axios';
import { Table, TableBody, Typography, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import * as constants from './Auth/configs'
import DownloadIcon from '@mui/icons-material/Download'; // optional icon
import { DocumentEditorContainerComponent, Toolbar } from '@syncfusion/ej2-react-documenteditor';
import SyncfusionViewer from './SyncfusionViewer';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

DocumentEditorContainerComponent.Inject(Toolbar);


const DynamicFileViewer = ({ base64Content, fileExtension, setUploadedFile }) => {

    const FileViewerContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden; /* prevent horizontal scroll */
  background-color: #555;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 16px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

    const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
`;

    const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

    const Button = styled.button`
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background-color: #2a68af;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #1d3557;
  }
`;

    const ImageViewerContainer = styled.div`
  width: 100%;
  height: 85vh;
  display: flex;
  flex-direction: column;
  background: #555; /* to match FileViewerContainer */
  border: 1px solid #dee2e6;

  overflow: hidden;
`;

    const ImageControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
`;

    const ImageWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: #555;
  cursor: grab;
  padding: 1rem;

  display: flex;
  justify-content: center;
  align-items: center;

  /* Ensure the container can grow to fit zoomed image height */
  min-height: 0;
`;


    const StyledImage = styled.img`
  transform: ${({ zoom, rotation }) => `scale(${zoom}) rotate(${rotation}deg)`};
  transition: transform 0.2s ease;
  transform-origin: center center;

  /* Allow full image to be visible and scrollable */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;




    const ImageViewer = ({ src }) => {
        const [zoom, setZoom] = useState(0.8);
        const [rotation, setRotation] = useState(0);
        const imageRef = useRef(null);

        const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 5));
        const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
        const handleRotateLeft = () => setRotation(prev => prev - 90);
        const handleRotateRight = () => setRotation(prev => prev + 90);
        const handleReset = () => {
            setZoom(1);
            setRotation(0);
        };

        const handleDownload = () => {
            const link = document.createElement('a');
            link.href = src;
            link.download = 'image.jpg';
            link.click();
        };

        return (
            <ImageViewerContainer>
                <ImageControls>

                    <div className="d-flex align-items-center gap-2 mx-1">
                        <span className='mx-2'>
                            <i onClick={handleZoomOut} className="mx-2 fa-solid fa-magnifying-glass-minus" style={{ fontSize: '20px', color: '#2757aa', cursor: 'pointer' }} />
                            <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '12.5px', color: '#333' }}>
                                {Math.round(zoom * 100)}%

                            </span>
                            <i onClick={handleZoomIn} className="mx-2 fa-solid fa-magnifying-glass-plus" style={{ fontSize: '20px', color: '#2757aa', cursor: 'pointer' }} />
                        </span>
                        <Tooltip title="Reset Zoom">
                            <button onClick={handleReset} className="btn btn-light px-1 py-0" style={{ fontSize: '12.5px', border: '1px solid #2757aa', color: '#2757aa' }}>
                                <i className="fa-solid fa-rotate-right me-1" style={{ fontSize: '12px' }} />
                                Reset
                            </button>
                        </Tooltip>
                        <Tooltip title="Rotate Left">
                            <RotateLeftIcon sx={{ color: '#2757aa', fontSize: '20px' }} onClick={handleRotateLeft} />
                        </Tooltip>

                        <Tooltip title="Rotate Right">
                            <RotateRightIcon sx={{ color: '#2757aa', fontSize: '20px' }} onClick={handleRotateRight} />
                        </Tooltip>

                    </div>

                    {/* Download PDF */}
                    <Tooltip title="Download PDF">
                        <i onClick={handleDownload} className="fas fa-download" style={{ fontSize: '18px', color: '#2757aa', cursor: 'pointer' }} />
                    </Tooltip>
                    <i onClick={() => setUploadedFile(null)} className="fa-solid fa-trash me-1" style={{ fontSize: '25px', color: '#2757aa' }} />

                </ImageControls>
                <ImageWrapper>
                    <StyledImage
                        ref={imageRef}
                        src={src}
                        zoom={zoom}
                        rotation={rotation}
                        alt="Loaded content"
                    />
                </ImageWrapper>
            </ImageViewerContainer>
        );
    };

    const TextViewer = ({ content }) => {
        const [fontSize, setFontSize] = useState(14);
        const [lineHeight, setLineHeight] = useState(1.5);
        const [darkMode, setDarkMode] = useState(false);

        const containerStyle = {
            backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
            padding: '20px',
            borderRadius: '8px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.3s, color 0.3s'
        };

        const textStyle = {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            fontFamily: 'monospace'
        };

        return (
            <div>
                <ControlsContainer>
                    <ButtonContainer>
                        <Button onClick={() => setFontSize(prev => Math.max(8, prev - 2))}>
                            <i className="fas fa-minus"></i> Font Size
                        </Button>
                        <Button onClick={() => setFontSize(prev => Math.min(24, prev + 2))}>
                            <i className="fas fa-plus"></i> Font Size
                        </Button>
                        <Button onClick={() => setLineHeight(prev => Math.max(1, prev - 0.25))}>
                            <i className="fas fa-compress-alt"></i> Line Height
                        </Button>
                        <Button onClick={() => setLineHeight(prev => Math.min(3, prev + 0.25))}>
                            <i className="fas fa-expand-alt"></i> Line Height
                        </Button>
                        <Button onClick={() => setDarkMode(prev => !prev)}>
                            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                        </Button>
                        <i onClick={() => setUploadedFile(null)} className="fa-solid fa-trash me-1" style={{ fontSize: '25px', color: '#2757aa' }} />

                    </ButtonContainer>
                </ControlsContainer>
                <div style={containerStyle}>
                    <pre style={textStyle}>{content}</pre>
                </div>
            </div>
        );
    };

    const CSVViewer = ({ data }) => {
        const [searchTerm, setSearchTerm] = useState('');
        const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
        const [page, setPage] = useState(0);
        const [rowsPerPage, setRowsPerPage] = useState(10);

        const headers = data[0] || [];

        const filteredData = data.slice(1).filter(row =>
            row.some(cell =>
                cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

        const sortedData = useMemo(() => {
            if (!sortConfig.key) return filteredData;

            return [...filteredData].sort((a, b) => {
                const aValue = a[headers.indexOf(sortConfig.key)];
                const bValue = b[headers.indexOf(sortConfig.key)];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }, [filteredData, sortConfig, headers]);

        const handleSort = (columnKey) => {
            setSortConfig(prevConfig => ({
                key: columnKey,
                direction: prevConfig.key === columnKey && prevConfig.direction === 'asc' ? 'desc' : 'asc'
            }));
        };

        const paginatedData = sortedData.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );

        return (
            <Box sx={{ width: '100%', p: 2 }} className='shadow-lg'>
                {/* Header Controls */}
                <Box
                    sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <TextField
                        size="small"
                        label="Search"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 200 }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button onClick={() => setRowsPerPage((prev) => prev + 5)}>Show More Rows</Button>
                        <Button onClick={() => setRowsPerPage((prev) => Math.max(5, prev - 5))}>Show Less Rows</Button>
                        <i
                            onClick={() => setUploadedFile(null)}
                            className="fa-solid fa-trash"
                            style={{ fontSize: '22px', color: '#2757aa', cursor: 'pointer' }}
                        />
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} sx={{ maxHeight: 260 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                {headers.map((header, index) => (
                                    <TableCell
                                        key={index}
                                        onClick={() => handleSort(header)}
                                        sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        {header}
                                        {sortConfig.key === header && (
                                            <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} hover>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer Pagination Controls */}
                <Box
                    sx={{
                        mt: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <span>
                        Showing {page * rowsPerPage + 1} to{' '}
                        {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries
                    </span>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(Math.ceil(sortedData.length / rowsPerPage) - 1, prev + 1)
                                )
                            }
                            disabled={page >= Math.ceil(sortedData.length / rowsPerPage) - 1}
                        >
                            Next
                        </Button>
                    </Box>
                </Box>
            </Box>

        );
    };

    const ReactViewer = ({ fileurl, numPages, setNumPages, pageNumber, setPageNumber, zoomLevel, setZoomLevel, objectid, fileId, vault, email }) => {
        const onDocumentLoadSuccess = ({ numPages }) => {
            setNumPages(numPages);
        };

        const handlePreviousPage = () => {
            if (pageNumber > 1) setPageNumber(pageNumber - 1);
        };

        const handleNextPage = () => {
            if (pageNumber < numPages) setPageNumber(pageNumber + 1);
        };

        const handleZoomIn = () => {
            setZoomLevel(zoomLevel + 0.2);
        };

        const handleZoomOut = () => {
            if (zoomLevel > 0.4) setZoomLevel(zoomLevel - 0.2);
        };

        return (
            <FileViewerContainer>
                <ControlsContainer>
                    <ButtonContainer>
                        <SignButton objectid={objectid} fileId={fileId} vault={vault} email={email} />
                        <Button onClick={handlePreviousPage} disabled={pageNumber <= 1}>Previous</Button>
                        <span>Page {pageNumber} of {numPages}</span>
                        <Button onClick={handleNextPage} disabled={pageNumber >= numPages}>Next</Button>
                    </ButtonContainer>
                    <ButtonContainer>
                        <Button onClick={handleZoomOut}>Zoom Out</Button>
                        <Button onClick={handleZoomIn}>Zoom In</Button>
                        <i onClick={() => setUploadedFile(null)} className="fa-solid fa-trash me-1" style={{ fontSize: '25px', color: '#2757aa' }} />

                    </ButtonContainer>
                </ControlsContainer>
                <Document file={fileurl} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page pageNumber={pageNumber} scale={zoomLevel} />
                </Document>
            </FileViewerContainer>
        );
    };

    function useSessionState(key, defaultValue) {
        const getInitialValue = () => {
            try {
                const stored = sessionStorage.getItem(key);
                if (stored === null || stored === 'undefined') {
                    return defaultValue;
                }
                return JSON.parse(stored);
            } catch (e) {
                console.warn(`Failed to parse sessionStorage item for key "${key}":`, e);
                return defaultValue;
            }
        };

        const [value, setValue] = useState(getInitialValue);

        useEffect(() => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn(`Failed to save sessionStorage item for key "${key}":`, e);
            }
        }, [key, value]);

        return [value, setValue];
    }
    const [fileUrl, setFileUrl] = useSessionState('ss_fileUrl', '');
    const [csvContent, setCSVContent] = useState([]);


    const handleViewFile = async () => {
        if (!base64Content || !fileExtension) return;

        const ext = fileExtension.toLowerCase();
        let src = '';

        // Helper function to handle base64 conversion
        const generateBase64Url = (base64Content, ext) => {
            const mimeTypeMap = {
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                gif: 'image/gif',
                pdf: 'application/pdf',
                txt: 'text/plain',
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                doc: 'application/msword',
                // Add more types as needed
            };

            if (mimeTypeMap[ext]) {
                return `data:${mimeTypeMap[ext]};base64,${base64Content}`;
            }
            return '';
        };

        // Function to handle file upload and generate download URL
        const uploadBase64WithExtension = async (base64String, extension) => {
            const mimeTypeMap = {
                docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                pdf: 'application/pdf',
                txt: 'text/plain',
                png: 'image/png',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                // Add more as needed
            };

            try {
                const mimeType = mimeTypeMap[extension.toLowerCase()] || 'application/octet-stream';

                // Strip base64 header if present
                const base64Data = base64String.split(',').pop();
                const byteCharacters = atob(base64Data);
                const byteArray = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
                const blob = new Blob([byteArray], { type: mimeType });

                const formData = new FormData();
                formData.append('file', blob, `file.${extension}`);

                const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData);

                const fileUrl = response.data?.data?.url;
                if (fileUrl) {
                    const downloadUrl = transformToDownloadUrl(fileUrl);
                    return downloadUrl;
                }

                return null;
            } catch (error) {
                console.error('Error uploading file:', error);
                return null;
            }
        };

        // Helper function to transform the URL for downloading
        const transformToDownloadUrl = (url) => {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            pathParts.splice(1, 0, 'dl'); // Insert 'dl' after the domain and before the file path
            urlObj.pathname = pathParts.join('/');
            return urlObj.toString();
        };

        // Handle the file extension logic
        if (['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(ext)) {
            src = generateBase64Url(base64Content, ext);
        } else if (['docx', 'xlsx', 'doc'].includes(ext)) {
            // Wait for the upload to finish before setting the file URL
            src = await uploadBase64WithExtension(base64Content, ext);
        } else if (ext === 'csv') {
            setCSVContent(parseCSV(atob(base64Content)));
            return; // Return early for CSV, no need to set fileUrl
        }

        if (src) {
            setFileUrl(src);
        } else {
            console.error('Unsupported file type or error occurred.');
        }
    };


    const parseCSV = (csvContent) => {
        const rows = csvContent.split('\n');
        return rows.map(row => {
            const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(cell => cell.replace(/(^"|"$)/g, '')) : [];
        });
    };


    const renderContent = () => {
        if (!base64Content || !fileExtension) {
            return (
                <div className="d-flex justify-content-center align-items-center text-dark" style={{ width: "100%", height: "60vh", overflowY: 'scroll' }}>
                    <div>
                        <p className="text-center">
                            <i className="fas fa-tv" style={{ fontSize: "100px" }}></i>
                        </p>
                        <p className="text-center">Select a file to preview</p>
                    </div>
                </div>
            );
        }

        const ext = fileExtension.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return <ImageViewer src={fileUrl} />;
        }

        if (ext === 'pdf') {
            return <PDFViewerPreview document={fileUrl} setUploadedFile={setUploadedFile} />;
        }

        if (ext === 'txt') {
            return <TextViewer content={atob(base64Content)} />;

            <DocumentEditorContainerComponent id="container" style={{ 'height': '590px' }} serviceUrl="https://services.syncfusion.com/vue/production/api/documenteditor/" enableToolbar={true} />
        }

        if (ext === 'docx' || ext === 'doc' || ext === 'xlsx' || ext === 'xls') {

            return (
                <Box sx={{ position: 'relative', width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                        
                        </Typography>
                        <i
                            onClick={() => setUploadedFile(null)}
                            className="fa-solid fa-trash"
                            style={{ fontSize: '22px', color: '#2757aa', cursor: 'pointer' }}
                        />
                    </Box>

                    <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
                        width="100%"
                        height="350px"
                        frameBorder="0"
                        style={{ display: 'block', borderRadius: 4 }}
                    />
                </Box>


            );
        }

        if (ext === 'csv') {
            return <CSVViewer data={csvContent} />;
        }

        return <p>Unsupported file type. {ext}</p>;
    };

    useEffect(() => {
        // const uploadData = async () => {

        //   try {
        //     const response = await axios.post(
        //       `${constants.tempfilesurl}`,
        //       {
        //         base64_content: base64Content,
        //         file_extension: fileExtension
        //       },
        //       {
        //         headers: {
        //           'accept': 'application/json',
        //           'Content-Type': 'application/json'
        //         }
        //       }
        //     );
        //     if (response.data) {

        //       console.log(response.data.url)
        //     }

        //     setTempUrl(response.data.url);

        //   } catch (error) {
        //     // alert(error)
        //     console.error("Error uploading data:", error);
        //   }
        // };

        // if (['xlsx', 'docx', 'doc'].includes(fileExtension?.toLowerCase())) {
        //   uploadData();
        // }

        if (base64Content && fileExtension) {
            handleViewFile();
        }
    }, [base64Content, fileExtension]);





    return (
        <div >
            {renderContent()}
        </div>
    );
};

export default DynamicFileViewer;
