import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import SignButton from './SignDocument';

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

  const handleViewFile = async () => {
    if (base64Content && fileExtension) {
      let src = '';
      let blob;
      switch (fileExtension.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          src = `data:image/${fileExtension.toLowerCase()};base64,${base64Content}`;
          break;
        case 'pdf':
          src = `data:application/pdf;base64,${base64Content}`;
          break;
        case 'txt':
          src = `data:text/plain;base64,${base64Content}`;
          break;
        case 'docx':
          blob = base64ToBlob(base64Content, fileExtension);
          const arrayBuffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setHtmlContent(result.value);
          return;
        case 'xlsx':
          blob = base64ToBlob(base64Content, fileExtension);
          const workbook = XLSX.read(await blob.arrayBuffer(), { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          setCSVContent(parseCSV(csv));
          return;
        case 'csv':
          const decodedCSVContent = atob(base64Content);
          setCSVContent(parseCSV(decodedCSVContent));
          return;
        default:
          break;
      }
      setFileUrl(src);
    }
  };

  const parseCSV = (csvContent) => {
    // Handle numbers with commas by considering quoted values
    const rows = csvContent.split('\n');
    return rows.map(row => {
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      return matches ? matches.map(cell => cell.replace(/(^"|"$)/g, '')) : [];
    });
  };

  const base64ToBlob = (base64, extension) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const mimeType = getMimeType(extension);
    return new Blob([bytes], { type: mimeType });
  };

  const getMimeType = (extension) => {
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
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

    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'PNG':
      case 'gif':
        return <img src={fileUrl} alt="Loaded content" style={{ maxWidth: '100%' }} />;
      case 'pdf':
        return (
          <ReactViewer
            fileurl={fileUrl}
            numPages={numPages}
            setNumPages={setNumPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            objectid={objectid}
            fileId={fileId}
            vault={vault}
            email={email}
          />
        );
      case 'txt':
        const decodedContent = atob(base64Content);
        return <div className='bg-white shadow-lg p-3'><pre style={{ whiteSpace: 'pre-wrap' }}>{decodedContent}</pre></div>;
      case 'docx':
        return (
          <>
            <ZoomControls>
              <Button size='small' onClick={() => setZoomLevel(zoomLevel - 0.2)}
                disabled={zoomLevel <= 0.4}>Zoom Out</Button>
              <Button onClick={() => setZoomLevel(zoomLevel + 0.2)}>Zoom In</Button>
            </ZoomControls>
            <div style={{ overflowY: 'scroll', height: '100%' }} className='bg-white shadow-lg p-3'>

              <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          </>

        );
      case 'xlsx':
      case 'csv':
        return (
          <div style={{ fontSize: '11px' }}>
            <table className='table table-bordered bg-white shadow-lg'>
              <thead>
                <tr>
                  {csvContent.length > 0 && csvContent[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvContent.slice(1).map((row, index) => (
                  <tr key={index}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return <p>Unsupported file type.</p>;
    }
  };

  useEffect(() => {
    if (base64Content && fileExtension) {
      handleViewFile();
    }
  }, [base64Content, fileExtension]);

  return (
    <>
      {renderContent()}
    </>
  );
};

export default DynamicFileViewer;
