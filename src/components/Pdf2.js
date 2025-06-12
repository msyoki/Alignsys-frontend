import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import '../styles/PDFViewerTechedge.css';
import { Tooltip } from '@mui/material';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewerPreview = (props) => {
    const [numPages, setNumPages] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const mainContainerRef = useRef(null);
    const [pageDimensions, setPageDimensions] = useState([]);
    const [isRotated, setIsRotated] = useState(false);

    // Zoom controls
    const zoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.1, 2)), []);
    const zoomOut = useCallback(() => setZoom(prev => Math.max(prev - 0.1, 0.5)), []);

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

    // Window resize (optional for future responsiveness)
    // useEffect(() => {
    //     const updateDimensions = () => { ... };
    //     window.addEventListener('resize', updateDimensions);
    //     updateDimensions();
    //     return () => window.removeEventListener('resize', updateDimensions);
    // }, []);

    // Page load success
    const onPageLoadSuccess = useCallback((page) => {
        const { pageNumber, width, height, rotate } = page;
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
    }, []);

    const onDocumentLoadSuccess = useCallback(({ numPages }) => setNumPages(numPages), []);

    // Page input change
    const handlePageInputChange = useCallback((e) => {
        const value = parseInt(e.target.value, 10);
        if (value >= 1 && value <= numPages) {
            setPageNumber(value);
            const pageElement = mainContainerRef.current?.querySelector(`#page_${value}`);
            if (pageElement) pageElement.scrollIntoView({ behavior: 'smooth' });
        }
    }, [numPages]);

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

    return (
        <>
            {/* Top Controls Bar */}
            <div style={{ backgroundColor: '#fff' }} className="shadow-lg controls text-dark d-flex align-items-center justify-content-between py-2 px-2">
                <div className="d-flex align-items-center flex-wrap gap-2">
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
                        <i onClick={zoomOut} className="fa-solid fa-magnifying-glass-minus" style={{ fontSize: '25px', color: '#2757aa', cursor: 'pointer' }} />
                        <span style={{ minWidth: '40px', textAlign: 'center', fontSize: '13px', color: '#333' }}>
                            {Math.round(zoom * 100)}%
                        </span>
                        <i onClick={zoomIn} className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: '25px', color: '#2757aa', cursor: 'pointer' }} />
                    </div>
                    {/* Upload a different file */}
                    <div className="d-flex align-items-center gap-2 mx-3">
                        <Tooltip title="Upload a different file ">
                            <i onClick={() => props.setUploadedFile(null)} className="fa-solid fa-trash me-1" style={{ fontSize: '25px', color: '#2757aa', cursor: 'pointer' }} />
                        </Tooltip>
                    </div>
                </div>
            </div>

            <div className="pdf-viewer-container">
                <main className="pdf-main-viewer scrollbar-custom" ref={mainContainerRef}>
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