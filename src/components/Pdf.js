import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Tooltip, Box } from '@mui/material';
import LoadingDialog from './Loaders/LoaderDialog';
import SignButton from './SignDocument';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerPreview = (props) => {
  const [numPages, setNumPages] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isAsideOpen, setIsAsideOpen] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const containerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [pageDimensions, setPageDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoaded, setPagesLoaded] = useState(0);
  const [isRotated, setIsRotated] = useState(false);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const prevWidthRef = useRef(props.windowWidth);

  // Zoom controls
  const zoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.1, 2)), []);
  const zoomOut = useCallback(() => setZoom(prev => Math.max(prev - 0.1, 0.5)), []);
  const resetZoom = useCallback(() => setZoom(0.9), []);

  // Pinch zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setZoom(prevZoom => Math.min(Math.max(prevZoom + delta, 0.5), 2));
      }
    };
    const container = mainContainerRef.current;
    if (container) container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container && container.removeEventListener('wheel', handleWheel);
  }, []);

  // Window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (mainContainerRef.current) setContainerWidth(mainContainerRef.current.offsetWidth);
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const toggleAside = useCallback(() => setIsAsideOpen(open => !open), []);

  // Page load success
  const onPageLoadSuccess = useCallback((page) => {
    const { pageNumber, width, height, rotate } = page;
    setPagesLoaded(prev => Math.min(prev + 1, numPages));
    setLoadingPercentage(((pagesLoaded + 1) / numPages) * 100);
    if (rotate % 360 !== 0) setIsRotated(true);
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
  }, [numPages, pagesLoaded]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => setNumPages(numPages), []);

  // Page input change
  const handlePageInputChange = useCallback((e) => {
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
  }, [numPages]);

  // Thumbnail navigation
  const thumbnailNavigation = useCallback((pageIndex) => {
    const pageNumber = pageIndex + 1;
    const pageElement = mainContainerRef.current?.querySelector(`#page_${pageNumber}`);
    const thumbnailElement = containerRef.current?.querySelector(`#thumbnail_${pageNumber}`);
    if (!pageElement || !thumbnailElement) return;
    const scrollOptions = { behavior: 'smooth', block: 'center' };
    const thumbRect = thumbnailElement.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    const isThumbnailVisible = (
      thumbRect.top >= containerRect.top &&
      thumbRect.bottom <= containerRect.bottom
    );
    if (!isThumbnailVisible) thumbnailElement.scrollIntoView(scrollOptions);
    requestAnimationFrame(() => {
      pageElement.scrollIntoView(scrollOptions);
      setPageNumber(pageNumber);
    });
  }, []);

  // Scale for page
  const getScaleForPage = useCallback((pageNumber, zoom = 1) => {
    const pageDim = pageDimensions.find(dim => dim.pageNumber === pageNumber);
    if (!pageDim) return 1 * zoom;
    const { width, height } = pageDim;
    const isLandscape = width > height;
    let baseScale;
    if (isLandscape) {
      baseScale = isRotated ? 0.758 : 0.558;
    } else {
      baseScale = 0.89;
    }
    return baseScale * zoom;
  }, [pageDimensions, isRotated]);

  // Scale for thumbnail
  const getScaleForPageThumbnail = useCallback((pageNumber) => {
    const pageDim = pageDimensions.find(dim => dim.pageNumber === pageNumber);
    return pageDim && pageDim.width > pageDim.height ? 0.15 : 0.25;
  }, [pageDimensions]);

  // Download handler
  const handleDownload = useCallback((base64, ext, fileName) => {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
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
      const mimeType = mimeTypes[ext.toLowerCase()] || "application/octet-stream";
      const blob = new Blob([byteArray], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.${ext}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
      alert("Failed to download the file. Please try again.");
    }
  }, []);

  // Keyboard navigation
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
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll sync for page number
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

  // Responsive zoom for aside open/close
  useEffect(() => {
    setZoom(prevZoom => {
      const newZoom = isAsideOpen ? prevZoom - 0.05 : prevZoom + 0.05;
      return Math.max(0.5, Math.min(2, newZoom));
    });
  }, [isAsideOpen]);

  // Responsive zoom for window width
  useEffect(() => {
    let prev = parseFloat(prevWidthRef.current);
    let current = parseFloat(props.windowWidth);
    if (isNaN(prev) || isNaN(current)) return;
    const diff = current - prev;
    if (diff !== 0) {
      const sensitivity = 0.01;
      setZoom(prevZoom => {
        let newZoom = current > prev
          ? prevZoom + diff * sensitivity
          : prevZoom - Math.abs(diff * sensitivity);
        return Math.max(0.5, Math.min(2, newZoom));
      });
      prevWidthRef.current = props.windowWidth;
    }
  }, [props.windowWidth, props.document]);

  // Memoized title
  const trimTitle = useCallback((title) => {
    const maxLength = 65;
    return title;
  }, []);

  return (
    <>
      {/* File Info Bar */}
      <Tooltip title={props.selectedObject?.title}>
        {/* <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            backgroundColor: '#ecf4fc',
            height: '53px',
            color: '#1d3557',
          }}
        >
          <i style={{ fontSize: '25px', marginLeft: '15px', marginRight: '8px' }} className='fas fa-file-pdf text-danger '></i>
          <span style={{ fontSize: '13px' }}>{trimTitle(props.selectedObject.title)}.pdf</span>
        </Box> */}
        <Box className="chat-header2 p-2">

          <span className='mx-2' >  <i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '25px' }} ></i> <span style={{ fontSize: '13px' }}>{trimTitle(props.selectedObject.title)}.pdf</span> </span>

        </Box>
      </Tooltip>

      {/* Top Controls Bar */}
      <div style={{ backgroundColor: '#fff' }} className="shadow-lg controls text-dark d-flex align-items-center justify-content-between py-2 px-2">
        <div className="d-flex align-items-center flex-wrap gap-2">
          {/* Toggle Sidebar Button */}
          <span className="d-flex align-items-center cursor-pointer" onClick={toggleAside}>
            <Tooltip title={isAsideOpen ? "Close thumbnail view" : "Open thumbnail view"}>
              <i className={`mx-1 ${isAsideOpen ? "fa-solid fa-bars-staggered" : "fas fa-bars"}`} style={{ fontSize: '18px', color: '#2757aa' }} />
              <span className="text-muted ms-1" style={{ fontSize: '13px', cursor: 'pointer' }}>
                <span style={{ color: '#2757aa' }}>{isAsideOpen ? "Close" : "Open"} thumbnail</span>
              </span>
            </Tooltip>
          </span>
          {/* Page Navigation */}
          <span className="d-flex align-items-center text-dark" style={{ fontSize: '13px' }}>
            Page
            <input
              type="number"
              value={pageNumber}
              onChange={handlePageInputChange}
              className="mx-2 form-control form-control-sm"
              style={{ width: '50px', padding: '2px 6px', fontSize: '13px' }}
            />
            / {numPages}
          </span>
          {/* Zoom Controls */}
          <div className="d-flex align-items-center gap-2 mx-3">
            <i onClick={zoomOut} className="fa-solid fa-magnifying-glass-minus" style={{ fontSize: '18px', color: '#2757aa', cursor: 'pointer' }} />
            <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '13px', color: '#333' }}>
              {Math.round(zoom * 100)}%
            </span>
            <i onClick={zoomIn} className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: '18px', color: '#2757aa', cursor: 'pointer' }} />
            <Tooltip title="Reset Zoom">
              <i onClick={resetZoom} className="fa-solid fa-rotate-right me-1" style={{ fontSize: '18px', color: '#2757aa' }} />
            </Tooltip>
          </div>
          {/* Download PDF */}
          <Tooltip title="Download PDF">
            <i onClick={() => handleDownload(props.base64Content, props.fileExtension, props.fileName)} className="fas fa-download" style={{ fontSize: '18px', color: '#2757aa', cursor: 'pointer' }} />
          </Tooltip>
          {/* Sign PDF */}
          <Tooltip title="Digitally Sign Copy">
            <span className='mx-1'>
              <SignButton
                objectid={props.selectedObject.id}
                classid={props.selectedObject.classId || props.selectedObject.classID}
                fileId={props.fileId}
                vault={props.vault}
                email={props.email}
                mfilesId={props.mfilesId}
              />
            </span>
          </Tooltip>
        </div>
      </div>

      <div className="pdf-viewer-container">
        {isAsideOpen && (
          <aside className={`pdf-thumbnail-panel ${isMobile ? 'mobile' : ''} scrollbar-custom1`} ref={containerRef}>
            <Document className="pdf-container" file={props.document}>
              {[...Array(numPages).keys()].map((pageIndex) => (
                <div
                  key={`thumbnail_${pageIndex + 1}`}
                  id={`thumbnail_${pageIndex + 1}`}
                  className={`thumbnail-item ${pageNumber === pageIndex + 1 ? 'active' : ''}`}
                  onClick={() => thumbnailNavigation(pageIndex)}
                >
                  <Page
                    pageNumber={pageIndex + 1}
                    scale={getScaleForPageThumbnail(pageIndex + 1)}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="page-container"
                  />
                  <span className="thumbnail-page-number">{`${pageIndex + 1}`}</span>
                </div>
              ))}
            </Document>
          </aside>
        )}

        <main className="pdf-main-viewer scrollbar-custom" ref={mainContainerRef}>
          <Document
            className="pdf-container"
            file={props.document}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="loading-indicator text-dark">
              Loading PDF<span>.</span><span>.</span><span>.</span>
            </div>}
            error={<div>Error loading PDF!</div>}
          >
            {[...Array(numPages).keys()].map((pageIndex) => (
              <div
                key={`page_${pageIndex + 1}`}
                id={`page_${pageIndex + 1}`}
                className="pdf-page-wrapper"
              >
                <Page
                  pageNumber={pageIndex + 1}
                  scale={getScaleForPage(pageIndex + 1, zoom)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="page-container shadow-sm"
                  onLoadSuccess={onPageLoadSuccess}
                />
              </div>
            ))}
          </Document>
        </main>
      </div>
    </>
  );
};

export default PDFViewerPreview;