import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import mammoth from 'mammoth';
import styled from 'styled-components';

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
  height: 75vh;
  overflow-y: auto;
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ZoomControls = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 15px;
  margin: 0 5px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
`;

const ReactViewer = ({ fileurl, numPages, setNumPages, pageNumber, setPageNumber, zoomLevel, setZoomLevel }) => {
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
      <Controls>
        <Button onClick={handlePreviousPage} disabled={pageNumber <= 1}>Previous</Button>
        <span>Page {pageNumber} of {numPages}</span>
        <Button onClick={handleNextPage} disabled={pageNumber >= numPages}>Next</Button>
      </Controls>
      <ZoomControls>
        <Button onClick={handleZoomOut}>Zoom Out</Button>
        <Button onClick={handleZoomIn}>Zoom In</Button>
      </ZoomControls>
      <Document file={fileurl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} scale={zoomLevel} />
      </Document>
    </FileViewerContainer>
  );
};

const DynamicFileViewer = () => {
  const [base64Content, setBase64Content] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const handleFileExtensionChange = (event) => {
    const extension = event.target.value.toLowerCase();
    setFileExtension(extension);
  };

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
          src = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Content}`;
          break;
        default:
          break;
      }
      setFileUrl(src);
    }
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
      return <p>Please provide valid base64 content and file extension.</p>;
    }

    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
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
          />
        );
      case 'txt':
        const decodedContent = atob(base64Content);
        return <pre style={{ whiteSpace: 'pre-wrap' }}>{decodedContent}</pre>;
      case 'docx':
        return (
          <div>
            <ZoomControls>
              <Button onClick={() => setZoomLevel(zoomLevel - 0.2)} disabled={zoomLevel <= 0.4}>Zoom Out</Button>
              <Button onClick={() => setZoomLevel(zoomLevel + 0.2)}>Zoom In</Button>
            </ZoomControls>
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: '0 0' }} dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        );
      case 'xlsx':
        return <iframe src={fileUrl} style={{ width: '100%', height: '600px' }} />;
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
    <Container>
      <h1>Dynamic File Viewer</h1>
      <label htmlFor="base64Content">Base64 Content:</label><br />
      <TextArea
        id="base64Content"
        rows="10"
        value={base64Content}
        onChange={(e) => setBase64Content(e.target.value)}
      /><br /><br />
      
      <label htmlFor="fileExtension">File Extension:</label><br />
      <Input
        type="text"
        id="fileExtension"
        value={fileExtension}
        onChange={handleFileExtensionChange}
      /><br /><br />
      
      <h2>File Preview:</h2>
      {renderContent()}
    </Container>
  );
};

export default DynamicFileViewer;
