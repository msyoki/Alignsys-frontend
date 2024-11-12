import React, { useState, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import SignButton from './SignDocument';
import PDFViewerPreview from './Pdf';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Container = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FileViewerContainer = styled.div`
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
`;

const ImageViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: calc(100vh - 40px); /* Adjust for padding */
  overflow: hidden;
`;

const ImageControls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ImageWrapper = styled.div`
  position: relative;
  max-width: 100%;
  max-height: calc(100% - 80px); /* Account for controls height */
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.3s ease;
  transform: ${props => `scale(${props.zoom}) rotate(${props.rotation}deg)`};
`;

const ImageButton = styled(IconButton)`
  &:hover {
    background-color: rgba(0,0,0,0.1);
  }
`;

const ZoomControls = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  background-color: #2a68af;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 12px;

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #1d3557;
  }
`;

const ImageViewer = ({ src }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.1));
  const handleRotateLeft = () => setRotation(prev => prev - 90);
  const handleRotateRight = () => setRotation(prev => prev + 90);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  return (
    <ImageViewerContainer>
      <ImageControls>
        <Tooltip title="Zoom In">
          <ImageButton onClick={handleZoomIn}>
            <ZoomInIcon />
          </ImageButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <ImageButton onClick={handleZoomOut}>
            <ZoomOutIcon />
          </ImageButton>
        </Tooltip>
        <Tooltip title="Rotate Left">
          <ImageButton onClick={handleRotateLeft}>
            <RotateLeftIcon />
          </ImageButton>
        </Tooltip>
        <Tooltip title="Rotate Right">
          <ImageButton onClick={handleRotateRight}>
            <RotateRightIcon />
          </ImageButton>
        </Tooltip>
        <Button onClick={handleReset}>Reset</Button>
      </ImageControls>
      <ImageWrapper>
        <StyledImage src={src} zoom={zoom} rotation={rotation} alt="Loaded content" />
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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 200 }}
        />
        <Box>
          <Button onClick={() => setRowsPerPage(prev => prev + 5)}>Show More Rows</Button>
          <Button onClick={() => setRowsPerPage(prev => Math.max(5, prev - 5))}>Show Less Rows</Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell 
                  key={index}
                  onClick={() => handleSort(header)}
                  style={{ cursor: 'pointer', fontWeight: 'bold' }}
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
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>
          Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries
        </span>
        <Box>
          <Button 
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setPage(prev => Math.min(Math.ceil(sortedData.length / rowsPerPage) - 1, prev + 1))}
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
        </ButtonContainer>
      </ControlsContainer>
      <Document file={fileurl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} scale={zoomLevel} />
      </Document>
    </FileViewerContainer>
  );
};

const DynamicFileViewer = ({ base64Content, fileExtension, objectid, fileId, vault, email }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [csvContent, setCSVContent] = useState([]);
  const [tempUrl, setTempUrl] = useState('');

  const mimeTypes = useMemo(() => ({
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg', 
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    txt: 'text/plain',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }), []);

  const handleViewFile = async () => {
    if (!base64Content || !fileExtension) return;

    const ext = fileExtension.toLowerCase();
    let src = '';
    let blob;

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      src = `data:image/${ext};base64,${base64Content}`;
    } else if (ext === 'pdf') {
      src = `data:application/pdf;base64,${base64Content}`;
    } else if (ext === 'txt') {
      src = `data:text/plain;base64,${base64Content}`;
    } else if (ext === 'docx') {
      blob = base64ToBlob(base64Content, ext);
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);
      return;
    } else if (ext === 'xlsx') {
      blob = base64ToBlob(base64Content, ext);
      const workbook = XLSX.read(await blob.arrayBuffer(), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      setCSVContent(parseCSV(XLSX.utils.sheet_to_csv(worksheet)));
      return;
    } else if (ext === 'csv') {
      setCSVContent(parseCSV(atob(base64Content)));
      return;
    }

    setFileUrl(src);
  };

  const parseCSV = (csvContent) => {
    const rows = csvContent.split('\n');
    return rows.map(row => {
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(cell => cell.replace(/(^"|"$)/g, '')) : [];
    });
  };

  const base64ToBlob = (base64, extension) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeTypes[extension] || 'application/octet-stream' });
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
      return <PDFViewerPreview document={fileUrl} objectid={objectid} fileId={fileId} vault={vault} email={email} />;
    }

    if (ext === 'txt') {
      return <TextViewer content={atob(base64Content)} />;
    }

    if (ext === 'docx' || ext === 'xlsx') {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=https://fastapitempfile.techedge.dev${tempUrl}`}
          width="100%"
          height="500px"
          frameBorder="0"
        />
      );
    }

    if (ext === 'csv') {
      return <CSVViewer data={csvContent} />;
    }

    return <p>Unsupported file type.</p>;
  };

  useEffect(() => {
    const uploadData = async () => {
      try {
        const response = await axios.post(
          'https://fastapitempfile.techedge.dev/upload',
          {
            base64_content: base64Content,
            file_extension: fileExtension
          },
          {
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        setTempUrl(response.data.url);
      } catch (error) {
        console.error("Error uploading data:", error);
      }
    };

    if (['xlsx', 'docx'].includes(fileExtension?.toLowerCase())) {
      uploadData();
    }
    
    if (base64Content && fileExtension) {
      handleViewFile();
    }
  }, [base64Content, fileExtension]);

  return (
    <div style={{ height: "100%" }}>
      {renderContent()}
    </div>
  );
};

export default DynamicFileViewer;
