import React, { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import SignButton from '../SignDocument';
import PDFViewerPreview from './Pdf';
import axios from 'axios';
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Tooltip, CircularProgress } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import * as constants from '../Auth/configs';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Styled components (unchanged for brevity)
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

// Optimized ImageViewer with better memoization
const ImageViewer = React.memo(({ src }) => {
  const [zoom, setZoom] = useState(0.8);
  const [rotation, setRotation] = useState(0);

  // Memoized handlers to prevent re-creation on every render
  const handlers = useMemo(() => ({
    zoomIn: () => setZoom(prev => Math.min(prev + 0.1, 5)),
    zoomOut: () => setZoom(prev => Math.max(prev - 0.1, 0.1)),
    rotateLeft: () => setRotation(prev => prev - 90),
    rotateRight: () => setRotation(prev => prev + 90),
    reset: () => {
      setZoom(1);
      setRotation(0);
    },
    download: () => {
      const link = document.createElement('a');
      link.href = src;
      link.download = 'image.jpg';
      link.click();
    }
  }), [src]);

  // Memoized zoom display
  const zoomDisplay = useMemo(() => Math.round(zoom * 100), [zoom]);

  return (
    <ImageViewerContainer>
      <ImageControls>
        <div className="d-flex align-items-center gap-2 mx-1">
          <span className='mx-2'>
            <i onClick={handlers.zoomOut} className="mx-2 fa-solid fa-magnifying-glass-minus" style={{ fontSize: '20px', color: '#2757aa', cursor: 'pointer' }} />
            <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '12.5px', color: '#333' }}>
              {zoomDisplay}%
            </span>
            <i onClick={handlers.zoomIn} className="mx-2 fa-solid fa-magnifying-glass-plus" style={{ fontSize: '20px', color: '#2757aa', cursor: 'pointer' }} />
          </span>
          <Tooltip title="Reset Zoom">
            <button onClick={handlers.reset} className="btn btn-light px-1 py-0" style={{ fontSize: '12.5px', border: '1px solid #2757aa', color: '#2757aa' }}>
              <i className="fa-solid fa-rotate-right me-1" style={{ fontSize: '12px' }} />
              Reset
            </button>
          </Tooltip>
          <Tooltip title="Rotate Left">
            <RotateLeftIcon sx={{ color: '#2757aa', fontSize: '20px' }} onClick={handlers.rotateLeft} />
          </Tooltip>
          <Tooltip title="Rotate Right">
            <RotateRightIcon sx={{ color: '#2757aa', fontSize: '20px' }} onClick={handlers.rotateRight} />
          </Tooltip>
        </div>
        <Tooltip title="Download Image">
          <i onClick={handlers.download} className="fas fa-download" style={{ fontSize: '18px', color: '#2757aa', cursor: 'pointer' }} />
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
}, (prevProps, nextProps) => prevProps.src === nextProps.src);

// Optimized TextViewer
const TextViewer = React.memo(({ content }) => {
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [darkMode, setDarkMode] = useState(false);

  // Memoized styles to prevent recreation
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

  // Memoized handlers
  const handlers = useMemo(() => ({
    decreaseFontSize: () => setFontSize(prev => Math.max(8, prev - 2)),
    increaseFontSize: () => setFontSize(prev => Math.min(24, prev + 2)),
    decreaseLineHeight: () => setLineHeight(prev => Math.max(1, prev - 0.25)),
    increaseLineHeight: () => setLineHeight(prev => Math.min(3, prev + 0.25)),
    toggleDarkMode: () => setDarkMode(prev => !prev)
  }), []);

  return (
    <div>
      <ControlsContainer>
        <ButtonContainer>
          <Button onClick={handlers.decreaseFontSize}>
            <i className="fas fa-minus"></i> Font Size
          </Button>
          <Button onClick={handlers.increaseFontSize}>
            <i className="fas fa-plus"></i> Font Size
          </Button>
          <Button onClick={handlers.decreaseLineHeight}>
            <i className="fas fa-compress-alt"></i> Line Height
          </Button>
          <Button onClick={handlers.increaseLineHeight}>
            <i className="fas fa-expand-alt"></i> Line Height
          </Button>
          <Button onClick={handlers.toggleDarkMode}>
            {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
          </Button>
        </ButtonContainer>
      </ControlsContainer>
      <div style={containerStyle}>
        <pre style={textStyle}>{content}</pre>
      </div>
    </div>
  );
}, (prevProps, nextProps) => prevProps.content === nextProps.content);

// Debounced search hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized CSVViewer with better performance
const CSVViewer = React.memo(({ csvString }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Debounce search to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized CSV parsing
  const data = useMemo(() => {
    const parseCSV = (csv) => {
      const rows = csv.split('\n').filter(Boolean);
      return rows.map(row => {
        const regex = /("([^"]|"")*"|[^,]*)/g;
        const cells = [];
        let match;
        while ((match = regex.exec(row)) !== null) {
          let cell = match[0];
          if (cell.startsWith('"') && cell.endsWith('"')) {
            cell = cell.slice(1, -1).replace(/""/g, '"');
          }
          cells.push(cell.trim());
          if (row[regex.lastIndex] === ',') regex.lastIndex++;
        }
        return cells;
      });
    };
    return parseCSV(csvString);
  }, [csvString]);

  const headers = useMemo(() => data[0] || [], [data]);
  const rows = useMemo(() => data.slice(1), [data]);

  // Memoized filtering and sorting
  const filteredRows = useMemo(() =>
    rows.filter(row =>
      row.some(cell =>
        cell.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    ), [rows, debouncedSearchTerm]
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

  // Memoized handlers
  const handleSort = useCallback((header) => {
    setSortConfig(prev =>
      prev.key === header
        ? { key: header, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: header, direction: 'asc' }
    );
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Reset page when searching
  }, []);

  const handleShowMoreRows = useCallback(() => {
    setRowsPerPage(r => r + 5);
  }, []);

  const handleShowLessRows = useCallback(() => {
    setRowsPerPage(r => Math.max(5, r - 5));
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage(p => Math.max(0, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(p => Math.min(Math.ceil(sortedRows.length / rowsPerPage) - 1, p + 1));
  }, [sortedRows.length, rowsPerPage]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => ({
    start: page * rowsPerPage + 1,
    end: Math.min((page + 1) * rowsPerPage, sortedRows.length),
    total: sortedRows.length,
    isFirstPage: page === 0,
    isLastPage: page >= Math.ceil(sortedRows.length / rowsPerPage) - 1
  }), [page, rowsPerPage, sortedRows.length]);

  return (
    <Box sx={{ width: '100%', p: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 200 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button onClick={handleShowMoreRows}>Show More Rows</Button>
          <Button onClick={handleShowLessRows}>Show Less Rows</Button>
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
          Showing {paginationInfo.start} to {paginationInfo.end} of {paginationInfo.total} entries
        </span>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handlePreviousPage} disabled={paginationInfo.isFirstPage}>Previous</Button>
          <Button onClick={handleNextPage} disabled={paginationInfo.isLastPage}>Next</Button>
        </Box>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => prevProps.csvString === nextProps.csvString);

// Custom hook for session state with better performance
const useSessionState = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored === null || stored === 'undefined') {
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch (e) {
      // console.warn(`Failed to parse sessionStorage item for key "${key}":`, e);
      return defaultValue;
    }
  });

  const setValueWithStorage = useCallback((newValue) => {
    setValue(newValue);
    try {
      sessionStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      // console.warn(`Failed to save sessionStorage item for key "${key}":`, e);
    }
  }, [key]);

  return [value, setValueWithStorage];
};

// Optimized main component
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
  const [fileUrl, setFileUrl] = useSessionState('ss_fileUrl', '');
  const [isProcessing, setIsProcessing] = useState(false);
  const processedContentRef = useRef(null);
  const currentFileRef = useRef(null);

  // Memoized MIME type mapping
  const mimeTypeMap = useMemo(() => ({
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
    ppt: 'application/vnd.ms-powerpoint',
    csv: 'text/csv',
  }), []);

  // Memoized base64 URL generator with cleanup
  const generateBase64Url = useCallback((base64Content, ext) => {
    if (mimeTypeMap[ext]) {
      return `data:${mimeTypeMap[ext]};base64,${base64Content}`;
    }
    return '';
  }, [mimeTypeMap]);

  // Optimized upload function with abort controller
  const uploadBase64WithExtension = useCallback(async (base64String, extension, abortSignal) => {
    try {
      const mimeType = mimeTypeMap[extension.toLowerCase()] || 'application/octet-stream';
      const base64Data = base64String.split(',').pop();
      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: mimeType });
      const formData = new FormData();
      formData.append('file', blob, `file.${extension}`);

      const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData, {
        signal: abortSignal
      });

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
      if (axios.isCancel(error)) {
        // console.log('Upload cancelled');
      } else {
        // console.error('Error uploading file:', error);
      }
      return null;
    }
  }, [mimeTypeMap]);

  // Memoized file identifier to prevent unnecessary processing
  const fileIdentifier = useMemo(() => {
    if (!base64Content || !fileExtension) return null;
    return `${base64Content.slice(0, 100)}_${fileExtension}`;
  }, [base64Content, fileExtension]);

  // Optimized file processing with abort controller
  const handleViewFile = useCallback(async () => {
    if (!base64Content || !fileExtension || isProcessing) return;

    const ext = fileExtension.toLowerCase();
    const fileId = `${base64Content.slice(0, 100)}_${ext}`;

    // Skip processing if same file
    if (currentFileRef.current === fileId && fileUrl) {
      return;
    }

    setIsProcessing(true);
    currentFileRef.current = fileId;

    const abortController = new AbortController();

    try {
      let src = '';

      if (['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt'].includes(ext)) {
        src = generateBase64Url(base64Content, ext);
      } else if (['docx', 'xlsx', 'xls', 'doc', 'ppt'].includes(ext)) {
        src = await uploadBase64WithExtension(base64Content, ext, abortController.signal);
      }

      if (src && currentFileRef.current === fileId) {
        setFileUrl(src);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        // console.error('Error processing file:', error);
      }
    } finally {
      setIsProcessing(false);
    }

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [base64Content, fileExtension, fileUrl, generateBase64Url, uploadBase64WithExtension, isProcessing]);

  // Effect with proper cleanup
  useEffect(() => {
    // console.log(base64Content)
    // console.log(fileExtension)
    if (fileIdentifier) {
      const cleanup = handleViewFile();
      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      };
    }
  }, [fileIdentifier, handleViewFile]);

  // Memoized file type detection
  const fileType = useMemo(() => {
    if (!fileExtension) return 'none';
    const ext = fileExtension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'txt') return 'text';
    if (['docx', 'doc', 'xlsx', 'xls', 'ppt'].includes(ext)) return 'office';
    if (ext === 'csv') return 'csv';
    return 'unsupported';
  }, [fileExtension]);

  // Memoized decoded content for text/csv files
  const decodedContent = useMemo(() => {
    if (!base64Content || (fileType !== 'text' && fileType !== 'csv')) return null;
    try {
      return atob(base64Content);
    } catch {
      return null;
    }
  }, [base64Content, fileType]);

  // Render content with better performance
  const renderContent = useMemo(() => {
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

    // if (isProcessing) {
    //   return (
    //     <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
    //       <CircularProgress sx={{ width: '50%' }} />
    //     </Box>
    //   );
    // }

    switch (fileType) {
      case 'image':
        return <ImageViewer src={fileUrl} />;
      case 'pdf':
        return (
          <PDFViewerPreview
            windowWidth={windowWidth}
            document={fileUrl}
            objectid={objectid}
            fileId={fileId}
            vault={vault}
            email={email}
            base64Content={base64Content}
            fileExtension={fileExtension}
            fileName={fileName}
            selectedObject={selectedObject}
            mfilesId={mfilesId}
          />
        );
      case 'text':
        return <TextViewer content={decodedContent} />;
      case 'office':
        return (
          // <iframe
          //   src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
          //   width="100%"
          //   height="500px"
          //   frameBorder="0"
          //   title="Office File"
          // />
          <div className="viewer-container">
            <Box className='chat-header'>


              <button

                onClick={() =>
                  window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, "_blank")
                }
                style={{
                  padding: "6px 12px",
                  fontSize: "11px",
                  cursor: "pointer",
                  border: "1px solid #2757aa",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  color: "#2757aa"
                }}
              >
                Open in New Tab
              </button>


            </Box>

            <Box className="chat-header">

              <Box>
                <span className="mx-2">
                  {/* <i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '20px' }}></i> */}
                  <FileExtIcon
                    fontSize="20px"
                    guid={vault}
                    objectId={selectedObject.id}
                    classId={selectedObject.classId ?? selectedObject.classID}
                    sx={{ fontSize: '25px !important', marginRight: '10px' }}
                  />
                  <span className='mx-2' style={{ fontSize: '13px' }}>{fileName}
                    <FileExtText
                      guid={vault}
                      objectId={selectedObject.id}
                      classId={selectedObject.classId ?? selectedObject.classID}
                    />
                  </span>
                </span>
              </Box>
            </Box>


            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
              style={{ width: "100%", height: "calc(100vh - 140px)", border: "none" }}
              title="Office File"
            />
          </div>

        );
      case 'csv':
        return <CSVViewer csvString={decodedContent} />;
      default:
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
              Unsupported format <span style={{ color: '#2757aa' }}>"{fileExtension}"</span>
            </Typography>
            <Typography
              variant="body2"
              sx={{ textAlign: 'center', fontSize: '13px' }}
            >
              Please select a different file, type not supported
            </Typography>
          </Box>
        );
    }
  }, [base64Content, fileExtension, fileType, fileUrl, isProcessing, decodedContent, windowWidth, objectid, fileId, vault, email, fileName, selectedObject, mfilesId]);

  return <div>{renderContent}</div>;
};

export default React.memo(DynamicFileViewer, (prevProps, nextProps) => {
  return (
    prevProps.base64Content === nextProps.base64Content &&
    prevProps.fileExtension === nextProps.fileExtension &&
    prevProps.objectid === nextProps.objectid &&
    prevProps.fileId === nextProps.fileId &&
    prevProps.vault === nextProps.vault &&
    prevProps.email === nextProps.email &&
    prevProps.fileName === nextProps.fileName &&
    prevProps.windowWidth === nextProps.windowWidth &&
    prevProps.mfilesId === nextProps.mfilesId
  );
});