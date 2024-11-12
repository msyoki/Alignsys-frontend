import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import Draggable from 'react-draggable';
import '../styles/PDFViewerTechedge.css'
import { Tooltip } from '@mui/material';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import LoadingDialog from './Loaders/LoaderDialog';
import SignButton from './SignDocument';


// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerPreview = (props) => {
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [isRotated, setIsRotated] = useState(false);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Add zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

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

    if (!pageDim) {
      // Return a default scale if page dimensions are not found
      return 0.8;
    }

    const { width, height } = pageDim;
    const isLandscape = width > height;


    // Determine scale based on orientation and rotation status
    if (isLandscape) {
      // return isRotated ? 1 : 0.7;
      return isRotated ? 0.8 : 0.5;
    }

    // For portrait orientation
    return 0.8;
  };


  const getScaleForPageThumbnail = (pageNumber) => {
    const pageDim = pageDimensions.find(dim => dim.pageNumber === pageNumber);
    return pageDim && pageDim.width > pageDim.height ? 0.08 : 0.14; // Adjust the scale as needed
  };


  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      const link = window.document.createElement('a');
      link.href = document;
      link.download = `sample.pdf`;
      link.click();
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
      <div className="controls bg-white shadow-lg text-dark  shadow-sm d-flex align-items-center justify-content-between">
        <div className="toggle-button mx-4" style={{ marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <span onClick={toggleAside} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Tooltip title={isAsideOpen ? "Close thumbnail view" : "Open thumbnail view"}>
                <span>
                  <i 
                    className={isAsideOpen ? "fas fa-clone mx-1" : "fas fa-bars mx-1"}
                    style={{ fontSize: isMobile ? '16px' : '20px', color: '#1C4690' }} 
                  />
                </span>
              </Tooltip>
              <span className='text-muted' style={{ fontSize: isMobile ? '10px' : '12px', marginLeft: '8px' }}>
                {isAsideOpen ? "Close" : "Open"} Snapshot View
              </span>
            </span>

            <span className="text-dark" style={{ fontSize: isMobile ? '10px' : '12px' }}>
              Page{' '}
              <input
                type="number"
                value={pageNumber}
                placeholder={pageNumber}
                onChange={handlePageInputChange}
                style={{
                  marginLeft: '1rem',
                  width: isMobile ? '40px' : '60px',
                  padding: '5px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              />{' '}
              / {numPages}
            </span>

            <Tooltip title="Download PDF">
              <button className='btn btn-sm mx-3' onClick={handleDownload}>
                <i className="fas fa-download" style={{ fontSize: isMobile ? '16px' : '20px', color: '#1C4690' }}></i>
              </button>
            </Tooltip>

            <Tooltip title="Digitally Sign copy">
              <span>
                <SignButton 
                  objectid={props.objectid} 
                  fileId={props.fileId} 
                  vault={props.vault} 
                  email={props.email} 
                />
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="pdfrender" style={{ display: 'flex', height: '90vh', backgroundColor: '#e5e6e4' }}>
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
                  scale={getScaleForPage(pageIndex + 1)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="page-container shadow-sm"
                  onLoadSuccess={onPageLoadSuccess}
                  style={{
                    transform: `scale(${zoom})`,
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


