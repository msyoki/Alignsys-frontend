import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import SignButton from './SignDocument';
import PDFViewerPreview from './Pdf';
import axios from 'axios';
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Tooltip } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import * as constants from './Auth/configs';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FileViewerContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
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
  background: #555;
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
  min-height: 0;
`;

const StyledImage = styled.img`
  transform: ${({ zoom, rotation }) => `scale(${zoom}) rotate(${rotation}deg)`};
  transition: transform 0.2s ease;
  transform-origin: center center;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const ImageViewer = React.memo(({ src }) => {
  const [zoom, setZoom] = useState(0.8);
  const [rotation, setRotation] = useState(0);

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
        <Tooltip title="Download Image">
          <i onClick={handleDownload} className="fas fa-download" style={{ fontSize: '18px', color: '#2757aa', cursor: 'pointer' }} />
        </Tooltip>
      </ImageControls>
      <ImageWrapper>
        <StyledImage
          src={src}
          zoom={zoom}
          rotation={rotation}
          alt="Loaded content"
        />
      </ImageWrapper>
    </ImageViewerContainer>
  );
});

const TextViewer = React.memo(({ content }) => {
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [darkMode, setDarkMode] = useState(false);

  const containerStyle = useMemo(() => ({
    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    padding: '20px',
    borderRadius: '8px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s, color 0.3s'
  }), [darkMode]);

  const textStyle = useMemo(() => ({
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: `${fontSize}px`,
    lineHeight: lineHeight,
    fontFamily: 'monospace'
  }), [fontSize, lineHeight]);

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
        </ButtonContainer>
      </ControlsContainer>
      <div style={containerStyle}>
        <pre style={textStyle}>{content}</pre>
      </div>
    </div>
  );
});

const CSVViewer = React.memo(({ csvString }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Parse CSV string into array of arrays
  const parseCSV = useCallback((csv) => {
    const rows = csv.split('\n').filter(Boolean);
    return rows.map(row => {
      // Handles quoted fields and commas inside quotes
      const regex = /("([^"]|"")*"|[^,]*)/g;
      const cells = [];
      let match;
      while ((match = regex.exec(row)) !== null) {
        let cell = match[0];
        if (cell.startsWith('"') && cell.endsWith('"')) {
          cell = cell.slice(1, -1).replace(/""/g, '"');
        }
        cells.push(cell.trim());
        // Remove trailing comma
        if (row[regex.lastIndex] === ',') regex.lastIndex++;
      }
      return cells;
    });
  }, []);

  const data = useMemo(() => parseCSV(csvString), [csvString, parseCSV]);
  const headers = data[0] || [];
  const rows = data.slice(1);

  // Filtered and sorted data
  const filteredRows = useMemo(() =>
    rows.filter(row =>
      row.some(cell =>
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ), [rows, searchTerm]
  );

  const sortedRows = useMemo(() => {
    if (!sortConfig.key) return filteredRows;
    const idx = headers.indexOf(sortConfig.key);
    return [...filteredRows].sort((a, b) => {
      if (a[idx] < b[idx]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[idx] > b[idx]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig, headers]);

  const paginatedRows = useMemo(() =>
    sortedRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [sortedRows, page, rowsPerPage]
  );

  const handleSort = (header) => {
    setSortConfig(prev =>
      prev.key === header
        ? { key: header, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: header, direction: 'asc' }
    );
  };

  return (
    <Box sx={{ width: '100%', p: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ width: 200 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={() => setRowsPerPage(r => r + 5)}>Show More Rows</Button>
          <Button onClick={() => setRowsPerPage(r => Math.max(5, r - 5))}>Show Less Rows</Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: 350 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, idx) => (
                <TableCell
                  key={idx}
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
            {paginatedRows.map((row, rowIdx) => (
              <TableRow key={rowIdx} hover>
                {row.map((cell, cellIdx) => (
                  <TableCell key={cellIdx}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <span>
          Showing {page * rowsPerPage + 1} to{' '}
          {Math.min((page + 1) * rowsPerPage, sortedRows.length)} of {sortedRows.length} entries
        </span>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
          <Button
            onClick={() => setPage(p => Math.min(Math.ceil(sortedRows.length / rowsPerPage) - 1, p + 1))}
            disabled={page >= Math.ceil(sortedRows.length / rowsPerPage) - 1}
          >Next</Button>
        </Box>
      </Box>
    </Box>
  );
});

const DynamicFileViewer = ({
  base64Content,
  fileExtension,
  objectid,
  fileId,
  vault,
  email,
  fileName,
  selectedObject,
  windowWidth,
  mfilesId
}) => {
  // Session state for fileUrl
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

  // Helper: parse CSV
  const parseCSV = useCallback((csvContent) => {
    const rows = csvContent.split('\n');
    return rows.map(row => {
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(cell => cell.replace(/(^"|"$)/g, '')) : [];
    });
  }, []);

  // Helper: base64 to data url
  const generateBase64Url = useCallback((base64Content, ext) => {
    const mimeTypeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      txt: 'text/plain',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      doc: 'application/msword',
    };
    if (mimeTypeMap[ext]) {
      return `data:${mimeTypeMap[ext]};base64,${base64Content}`;
    }
    return '';
  }, []);

  // Helper: upload base64 to temp file server
  const uploadBase64WithExtension = useCallback(async (base64String, extension) => {
    const mimeTypeMap = {
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      pdf: 'application/pdf',
      txt: 'text/plain',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      doc: 'application/msword',
      ppt: 'application/vnd.ms-powerpoint',
      csv: 'text/csv', // <-- Add this line
    };
    try {
      const mimeType = mimeTypeMap[extension.toLowerCase()] || 'application/octet-stream';
      const base64Data = base64String.split(',').pop();
      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: mimeType });
      const formData = new FormData();
      formData.append('file', blob, `file.${extension}`);
      const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData);
      const fileUrl = response.data?.data?.url;
      if (fileUrl) {
        const urlObj = new URL(fileUrl);
        const pathParts = urlObj.pathname.split('/');
        pathParts.splice(1, 0, 'dl');
        urlObj.pathname = pathParts.join('/');
        return urlObj.toString();
      }
      return null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }, []);

  // Main file handler
  const handleViewFile = useCallback(async () => {
    if (!base64Content || !fileExtension) return;
    const ext = fileExtension.toLowerCase();
    let src = '';
    if (['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(ext)) {
      src = generateBase64Url(base64Content, ext);
    } else if (['docx', 'xlsx', 'xls', 'doc', 'ppt'].includes(ext)) {
      src = await uploadBase64WithExtension(base64Content, ext);

    }
    if (src) {
      setFileUrl(src);
    } else {
      console.error('Unsupported file type or error occurred.');
    }
  }, [base64Content, fileExtension, generateBase64Url, uploadBase64WithExtension, parseCSV, setFileUrl]);

  // Effect: handle file view on change
  useEffect(() => {
    if (base64Content && fileExtension) {
      handleViewFile();
    }
    // eslint-disable-next-line
  }, [base64Content, fileExtension]);

  // Render logic
  const renderContent = useCallback(() => {
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
      return <PDFViewerPreview windowWidth={windowWidth} document={fileUrl} objectid={objectid} fileId={fileId} vault={vault} email={email} base64Content={base64Content} fileExtension={fileExtension} fileName={fileName} selectedObject={selectedObject} mfilesId={mfilesId} />;
    }
    if (ext === 'txt') {
      return <TextViewer content={atob(base64Content)} />;
    }
    if (['docx', 'doc', 'xlsx', 'xls', 'ppt'].includes(ext)) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
          width="100%"
          height="500px"
          frameBorder="0"
          title="Office File"
        />
      );
    }
    if (ext === 'csv') {
      return <CSVViewer csvString={atob(base64Content)} />;
    }

    return (
      <Box
        sx={{
          width: '100%',
          marginTop: '20%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto'
        }}
      >
        <i
          className="fa-solid fa-ban my-2"
          style={{ fontSize: '120px', color: '#2757aa' }}
        />
        <Typography
          variant="body2"
          className='my-2'
          sx={{ textAlign: 'center' }}
        >
          Unsupported format <span style={{ color: '#2757aa' }}>"{ext}"</span>
        </Typography>
        <Typography
          variant="body2"
          sx={{ textAlign: 'center', fontSize: '13px' }}
        >
          Please select a different file, type not supported
        </Typography>
      </Box>
    );
  }, [base64Content, fileExtension, fileUrl, windowWidth, objectid, fileId, vault, email, fileName, selectedObject, mfilesId, csvContent]);

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default DynamicFileViewer;