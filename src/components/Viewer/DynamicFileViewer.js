import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import Box from '@mui/material/Box';
import PDFViewerPreview from './Pdf';
import axios from 'axios';
import { Table, Typography, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Tooltip, CircularProgress } from '@mui/material';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Styled components
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

// ImageViewer component
const ImageViewer = React.memo(({ src }) => {
  const [zoom, setZoom] = useState(0.8);
  const [rotation, setRotation] = useState(0);

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

// TextViewer component
const TextViewer = React.memo(({ content }) => {
  const [fontSize, setFontSize] = useState(14);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [darkMode, setDarkMode] = useState(false);

  const containerStyle = useMemo(() => ({
    backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
    color: darkMode ? '#ffffff' : '#000000',
    padding: '20px',
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

  const handlers = useMemo(() => ({
    decreaseFontSize: () => setFontSize(prev => Math.max(8, prev - 2)),
    increaseFontSize: () => setFontSize(prev => Math.min(24, prev + 2)),
    decreaseLineHeight: () => setLineHeight(prev => Math.max(1, prev - 0.25)),
    increaseLineHeight: () => setLineHeight(prev => Math.min(3, prev + 0.25)),
    toggleDarkMode: () => setDarkMode(prev => !prev)
  }), []);

  return (
    <div >
      <ControlsContainer className='p-3'>
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

// CSVViewer component
const CSVViewer = React.memo(({ csvString }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const data = useMemo(() => {
    const parseCSV = (csv) => {
      if (!csv || typeof csv !== 'string') return [];

      const rows = csv.split('\n').filter(row => row.trim() !== '');
      return rows.map(row => {
        const cells = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < row.length) {
          const char = row[i];

          if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
              // Handle escaped quotes
              current += '"';
              i += 2;
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
              i++;
            }
          } else if (char === ',' && !inQuotes) {
            // End of cell
            cells.push(current.trim());
            current = '';
            i++;
          } else {
            current += char;
            i++;
          }
        }

        // Add the last cell
        cells.push(current.trim());

        // Ensure we don't exceed reasonable cell count to prevent memory issues
        return cells.length > 1000 ? cells.slice(0, 1000) : cells;
      });
    };

    try {
      return parseCSV(csvString);
    } catch (error) {
      console.error('CSV parsing error:', error);
      return [];
    }
  }, [csvString]);

  const headers = useMemo(() => data[0] || [], [data]);
  const rows = useMemo(() => data.slice(1), [data]);

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

  const handleSort = useCallback((header) => {
    setSortConfig(prev =>
      prev.key === header
        ? { key: header, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: header, direction: 'asc' }
    );
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(0);
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

  const paginationInfo = useMemo(() => ({
    start: page * rowsPerPage + 1,
    end: Math.min((page + 1) * rowsPerPage, sortedRows.length),
    total: sortedRows.length,
    isFirstPage: page === 0,
    isLastPage: page >= Math.ceil(sortedRows.length / rowsPerPage) - 1
  }), [page, rowsPerPage, sortedRows.length]);

  return (
    <Box sx={{ width: '100%', p: 1, background: '#fff', boxShadow: 1 }}>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 180, '& .MuiInputBase-root': { height: 32 } }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button onClick={handleShowMoreRows} sx={{ minWidth: 'auto', p: '4px 8px', fontSize: '11px' }}>+Rows</Button>
          <Button onClick={handleShowLessRows} sx={{ minWidth: 'auto', p: '4px 8px', fontSize: '11px' }}>-Rows</Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ maxHeight: 400, '& .MuiPaper-root': { boxShadow: 'none', border: '1px solid #e0e0e0' } }}>
        <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 } }}>
          <TableHead>
            <TableRow>
              {headers.map((header, idx) => (
                <TableCell
                  key={idx}
                  onClick={() => handleSort(header)}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    py: 0.5,
                    px: 1,
                    background: '#f5f5f5',
                    borderBottom: '2px solid #e0e0e0'
                  }}
                >
                  {header}
                  {sortConfig.key === header && (
                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, rowIdx) => (
              <TableRow
                key={rowIdx}
                hover
                sx={{
                  '&:hover': { backgroundColor: '#f9f9f9' },
                  '& .MuiTableCell-root': { fontSize: '12px', py: 0.25, px: 1 }
                }}
              >
                {row.map((cell, cellIdx) => (
                  <TableCell
                    key={cellIdx}
                    sx={{
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={cell}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <span style={{ fontSize: '11px', color: '#666' }}>
          Showing {paginationInfo.start} to {paginationInfo.end} of {paginationInfo.total} entries
        </span>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handlePreviousPage}
            disabled={paginationInfo.isFirstPage}
            sx={{ minWidth: 'auto', p: '4px 8px', fontSize: '11px' }}
          >
            Previous
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={paginationInfo.isLastPage}
            sx={{ minWidth: 'auto', p: '4px 8px', fontSize: '11px' }}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => prevProps.csvString === nextProps.csvString);

// Main component
const DynamicFileViewer = ({
  blob,
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
  const [fileUrl, setFileUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const currentBlobRef = useRef(null);

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

  const uploadBlobWithExtension = useCallback(async (blob, ext) => {
    if (!(blob instanceof Blob)) {
      console.error("Invalid blob passed to upload function");
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("file", blob, `file.${ext}`);

      const response = await axios.post(
        "https://tmpfiles.org/api/v1/upload",
        formData
      );

      const fileUrl = response.data?.data?.url;
      if (fileUrl) {
        const urlObj = new URL(fileUrl);
        const pathParts = urlObj.pathname.split("/");
        pathParts.splice(1, 0, "dl");
        urlObj.pathname = pathParts.join("/");
        return urlObj.toString();
      }
      return null;
    } catch (error) {
      console.error("Error uploading blob:", error);
      return null;
    }
  }, []);

  const processBlobContent = useCallback(async (blob, ext) => {
    if (!blob) return;

    setIsProcessing(true);
    currentBlobRef.current = blob;

    try {
      switch (fileType) {
        case 'image':
        case 'pdf':
          const objectUrl = URL.createObjectURL(blob);
          setFileUrl(objectUrl);
          break;

        case 'text':
        case 'csv':
          const text = await blob.text();
          setTextContent(text);
          break;

        case 'office':
          const uploadedUrl = await uploadBlobWithExtension(blob, ext);
          if (uploadedUrl) {
            setFileUrl(uploadedUrl);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error processing blob:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [fileType, uploadBlobWithExtension]);

  useEffect(() => {
    if (blob instanceof Blob && fileExtension) {
      processBlobContent(blob, fileExtension.toLowerCase());
    }

    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [blob, fileExtension, processBlobContent]);

  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  const renderContent = useMemo(() => {
    if (!blob || !fileExtension) {
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
          <>
            <i className="fas fa-tv my-2" style={{ fontSize: '120px', color: '#2757aa' }} />
            <Typography className='mt-3' variant="body2" sx={{ textAlign: 'center', fontSize: '12.5px' }}>
              Nothing to preview, please select a file
            </Typography>
          </>

        </Box>
      );
    }

    if (isProcessing) {
      return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (fileType) {
      case 'image':
        return fileUrl ? <ImageViewer src={fileUrl} /> : null;

      case 'pdf':
        return fileUrl ? (
          <PDFViewerPreview
            windowWidth={windowWidth}
            document={fileUrl}
            objectid={objectid}
            fileId={fileId}
            vault={vault}
            email={email}
            fileExtension={fileExtension}
            fileName={fileName}
            selectedObject={selectedObject}
            mfilesId={mfilesId}
            fileUrl={fileUrl}
            blob={blob}
          />
        ) : null;

      case 'text':
        return textContent ? <TextViewer content={textContent} /> : null;

      case 'csv':
        return textContent ? <CSVViewer csvString={textContent} /> : null;

      case 'office':
        return (
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
                  <FileExtIcon
                    fontSize="20px"
                    guid={vault}
                    objectId={selectedObject.id}
                    classId={selectedObject.classId ?? selectedObject.classID}
                    sx={{ fontSize: '25px !important', marginRight: '10px' }}
                  />
                  <span className='mx-2' style={{ fontSize: '12.5px' }}>{fileName}
                    <FileExtText
                      guid={vault}
                      objectId={selectedObject.id}
                      classId={selectedObject.classId ?? selectedObject.classID}
                    />
                  </span>
                </span>
              </Box>
            </Box>

            {fileUrl && (
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
                style={{ width: "100%", height: "calc(100vh - 140px)", border: "none" }}
                title="Office File"
              />
            )}
          </div>
        );

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
              sx={{ textAlign: 'center', fontSize: '12.5px' }}
            >
              Please select a different file, type not supported
            </Typography>
          </Box>
        );
    }
  }, [blob, fileExtension, fileType, fileUrl, textContent, isProcessing, windowWidth, objectid, fileId, vault, email, fileName, selectedObject, mfilesId]);

  return <div>{renderContent}</div>;
};

export default React.memo(DynamicFileViewer, (prevProps, nextProps) => {
  return (
    prevProps.blob === nextProps.blob &&
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