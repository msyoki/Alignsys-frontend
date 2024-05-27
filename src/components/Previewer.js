import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ReactViewer(props) {
  const [fileUrl, setFileUrl] = useState(null);
  const [interactionMode, setInteractionMode] = useState('default');

  const handleMouseDown = () => {
    setInteractionMode('hand');
  };

  const handleMouseUp = () => {
    setInteractionMode('default');
  };

  const handleMouseMove = (e) => {
    if (interactionMode === 'hand') {
      // Implement panning logic based on mouse movement
      // For example, adjust the scroll position of the container
    }
  };

  useEffect(() => {
    // Set the PDF file URL here. You can fetch it from 'sample.pdf' or any other source.
    setFileUrl(`data:application/pdf;base64,${props.fileurl}`);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    // You can set the total number of pages in the parent component
    props.setNumPages(numPages);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      
      style={{
        cursor: interactionMode === 'hand' ? 'grabbing' : 'default',
        // fontSize: '12.5px',
        width: '100%',
        margin:0,
        padding:20,
        height: '75vh',
        overflowY: 'scroll',
        overflowX:'scroll-hidden',
        backgroundColor:'#555',
        border: 'none',
        borderRadius: 0
        
      
      }}
      className='card shadow-lg'
    >
    <Document  file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
      {/* Render all pages dynamically */}
      {Array.from(new Array(props.numPages), (el, index) => (
        <Page
   
          pageNumber={props.pageNumber}
          width={props.pageWidth}
          scale={1.5}
          renderMode="canvas"
          renderTextLayer={false}
          style={{ margin: 0, height: '100%'}}
          className='shadow-lg m-1'
        />
      ))}
    </Document>

    </div>
  );
}

export default ReactViewer;



