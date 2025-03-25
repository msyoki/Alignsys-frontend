import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import Draggable from 'react-draggable';
import '../styles/PDFViewerTechedge.css'
import { Tooltip } from '@mui/material';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import LoadingDialog from './Loaders/LoaderDialog';
import SignButton from './SignDocument';
import { ZoomOut } from '@mui/icons-material';


// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerPreview = (props) => {
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pageNumber, setPageNumber] = useState(0.9);
  const containerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [isRotated, setIsRotated] = useState(false);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [isAsideOpen, setIsAsideOpen] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Add zoom controls
  const zoomIn = () =>{ setZoom(prev => Math.min(prev + 0.1, 2))}
  const zoomOut = () => {setZoom(prev => Math.max(prev - 0.1, 0.5))}
  const resetZoom = () => setZoom(0.9);

  // Handle pinch zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setZoom(prevZoom => {
          const newZoom = prevZoom + delta;
          return Math.min(Math.max(newZoom, 0.5), 2);
        });
      }
    };

    const container = mainContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mainContainerRef.current) {
        setContainerWidth(mainContainerRef.current.offsetWidth);
      }
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const toggleAside = () => {
    setIsAsideOpen(!isAsideOpen);
  };

  const onPageLoadSuccess = (page) => {
    const { pageNumber, width, height, rotate } = page;

    if (pageNumber <= numPages) {
      setPagesLoaded(prev => Math.min(prev + 1, numPages));
      const newPercentage = ((pagesLoaded + 1) / numPages) * 100;
      setLoadingPercentage(newPercentage);
    }

    if (rotate % 360 !== 0) {
      setIsRotated(true);
    }

    setPageDimensions(prev => {
      const pageExists = prev.find(p => p.pageNumber === pageNumber);
      if (pageExists) {
        return prev.map(p =>
          p.pageNumber === pageNumber ? { pageNumber, width, height } : p
        );
      }
      return [...prev, { pageNumber, width, height }];
    });

    if (pagesLoaded + 1 === numPages) {
      setLoading(false);
      setPagesLoaded(0);
      setLoadingPercentage(100);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= numPages) {
      setPageNumber(value);
      const pageElement = mainContainerRef.current?.querySelector(`#page_${value}`);
      const thumbnailElement = containerRef.current?.querySelector(`#thumbnail_${value}`);
      if (pageElement && thumbnailElement) {
        pageElement.scrollIntoView({ behavior: 'smooth' });
        thumbnailElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const thumbnailNavigation = (pageIndex) => {
    const pageNumber = pageIndex + 1;
    const pageElement = mainContainerRef.current?.querySelector(`#page_${pageNumber}`);
    const thumbnailElement = containerRef.current?.querySelector(`#thumbnail_${pageNumber}`);

    if (pageElement && thumbnailElement) {
      // First scroll the thumbnail into view
      thumbnailElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Then smoothly scroll the main page with a slight delay for visual flow
      setTimeout(() => {
        pageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        setPageNumber(pageNumber);
      }, 100);
    }
  };

  // Function to calculate the scale based on page number
  const getScaleForPage = (pageNumber) => {
    const pageDim = pageDimensions.find(dim => dim.pageNumber === pageNumber);

    if (!pageDim || containerWidth === 0) {
      return 1; // Default scale
    }

    const { width, height } = pageDim;

    // Check if the page is rotated
    const adjustedWidth = isRotated ? height : width;

    // Calculate scale based on container width
    const newScale = containerWidth / adjustedWidth;

    return newScale;
  };




  const getScaleForPageThumbnail = (pageNumber) => {
    const pageDim = pageDimensions.find(dim => dim.pageNumber === pageNumber);
    return pageDim && pageDim.width > pageDim.height ? 0.08 : 0.17; // Adjust the scale as needed
  };




  const handleDownload = (base64, ext, fileName) => {
    try {
      // Convert Base64 to raw binary data
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // Determine the MIME type from the extension
      const mimeTypes = {
        pdf: "application/pdf",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        txt: "text/plain",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ppt: "application/vnd.ms-powerpoint",
        pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        csv: "text/csv"
      };

      const mimeType = mimeTypes[ext.toLowerCase()] || "application/octet-stream"; // Default if unknown

      // Create a Blob from the byteArray
      const blob = new Blob([byteArray], { type: mimeType });

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.${ext}`);

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
      alert("Failed to download the file. Please try again.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (mainContainerRef.current) {
        if (event.key === 'ArrowDown') {
          mainContainerRef.current.scrollBy({ top: 100, behavior: 'smooth' });
        } else if (event.key === 'ArrowUp') {
          mainContainerRef.current.scrollBy({ top: -100, behavior: 'smooth' });
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pages = Array.from(container.querySelectorAll('.page-container'));
      const containerTop = container.getBoundingClientRect().top;
      let newCurrentPage = 1;

      pages.forEach((page, index) => {
        const pageRect = page.getBoundingClientRect();
        const pageTop = pageRect.top - containerTop;
        const pageBottom = pageRect.bottom - containerTop;

        if (pageTop < container.clientHeight / 2 && pageBottom > container.clientHeight / 2) {
          newCurrentPage = index + 1;
        }
      });

      setPageNumber(prev => prev !== newCurrentPage ? newCurrentPage : prev);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [numPages]);

  return (
    <>
      <div className="controls bg-white shadow-lg text-dark d-flex align-items-center justify-content-between px-3 py-2">
        <div className="d-flex align-items-center flex-wrap gap-3">

          {/* Toggle Sidebar Button */}
          <span className="d-flex align-items-center cursor-pointer" onClick={toggleAside}>
            <Tooltip title={isAsideOpen ? "Close thumbnail view" : "Open thumbnail view"}>
              <i className={`mx-1 fas ${isAsideOpen ? "fa-clone" : "fa-bars"} `} style={{ fontSize: isMobile ? '16px' : '20px' , color:'#2757aa'}} />
            </Tooltip>
            <span className="text-muted ms-2" style={{ fontSize: isMobile ? '10px' : '12px' }}>
              {isAsideOpen ? "Close" : "Open"} Snapshot View
            </span>
          </span>

          {/* Page Navigation */}
          <span className="d-flex align-items-center text-dark" style={{ fontSize: isMobile ? '10px' : '12px' }}>
            Page
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageInputChange}
              className="mx-2 page-input "
            />
            / {numPages}
          </span>

          {/* Zoom Controls */}
          <div className="d-flex align-items-center">
            <i style={{color:'#2757aa', fontSize:'20px'}} onClick={zoomIn} className="fa-solid fa-magnifying-glass-plus mx-2 zoom-icon" />
            <i  style={{color:'#2757aa',fontSize:'20px'}} onClick={zoomOut} className="fa-solid fa-magnifying-glass-minus mx-2 zoom-icon" />
               {/* Reset Zoom Button */}
               <Tooltip title="Reset Zoom">
            <button style={{fontSize:'12px'}} onClick={resetZoom} className="btn btn-sm btn-light ">Reset Zoom</button>
          </Tooltip>

          </div>

     
          {/* Download Button */}
          <Tooltip title="Download PDF">
          
              <i onClick={() => handleDownload(props.base64Content, props.fileExtension, props.fileName)} className="fas fa-download " style={{ fontSize: isMobile ? '16px' : '20px', color:'#2757aa' }}></i>
       
          </Tooltip>

          {/* Sign Button */}
          <Tooltip title="Digitally Sign Copy">
            <span>
              <SignButton {...props} />
            </span>
          </Tooltip>

        </div>
      </div>


      <div className="pdfrender" style={{ display: 'flex', height: '100vh', backgroundColor: '#e5e6e4' }}>
        {isAsideOpen && (
          <aside style={{
            position: 'relative',
            height: '100%',
            width: isMobile ? '80px' : '120px',
            backgroundColor: '#e5e6e4',
            color: 'black',
            zIndex: 1000,
            flexShrink: 0,
            borderRight: '1px solid #e5e6e4',
          }}>
            <div ref={containerRef} style={{
              position: 'relative',
              overflowY: 'auto',
              height: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}>
              <Document className="pdf-container" file={props.document}>
                {[...Array(numPages).keys()].map((pageIndex) => (
                  <div
                    key={`thumbnail_${pageIndex + 1}`}
                    id={`thumbnail_${pageIndex + 1}`}
                    className="text-center shadow-sm"
                    onClick={() => thumbnailNavigation(pageIndex)}
                    style={{
                      width: '100%',
                      marginBottom: '25px',
                      padding: '0',
                      borderWidth: pageNumber === pageIndex + 1 ? '3.5px' : '0.5px',
                      borderStyle: pageNumber === pageIndex + 1 ? 'solid' : 'none',
                      borderColor: pageNumber === pageIndex + 1 ? '#f58549' : '#fff',
                      backgroundColor: pageNumber === pageIndex + 1 ? '#f58549' : 'white',
                      color: pageNumber === pageIndex + 1 ? '#fff' : '#003049',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  >
                    <Page
                      pageNumber={pageIndex + 1}
                      scale={getScaleForPageThumbnail(pageIndex + 1)}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="page-container"
                    />
                    <span className='my-2' style={{ fontSize: '10px' }}>
                      {`${pageIndex + 1}`}
                    </span>
                  </div>
                ))}
              </Document>
            </div>
          </aside>
        )}

        <div ref={mainContainerRef} style={{
          position: 'relative',
          overflowY: 'auto',
          height: '85%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          backgroundColor: '#e5e6e4',
          padding: isMobile ? '5px' : '10px'
        }}>
          <Document
            className="pdf-container"
            file={props.document}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div>Loading PDF...</div>}
            error={<div>Error loading PDF!</div>}
          >
            {[...Array(numPages).keys()].map((pageIndex) => (
              <div
                key={`page_${pageIndex + 1}`}
                id={`page_${pageIndex + 1}`}
                style={{
                  position: 'relative',
                  width: '100%',
                  marginBottom: '10px',
                }}
              >
                <Page
                  pageNumber={pageIndex + 1}
                  scale={zoom}

                  key={`page_${pageNumber}`}

                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="page-container shadow-sm"
                  onLoadSuccess={onPageLoadSuccess}
                  style={{

                    transformOrigin: 'top left',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </>
  );
};



export default PDFViewerPreview;


