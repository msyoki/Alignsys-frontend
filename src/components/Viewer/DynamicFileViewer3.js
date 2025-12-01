import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import PDFViewerPreview3 from './Pdf3';
import FileExtIcon from '../FileExtIcon';

// ==== Styled Components ====
const ImageViewerContainer = styled.div`
  width: 100%;
  height: 85vh;
  display: flex;
  flex-direction: column;
  background: #555b6e;
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
  background: #555b6e;
  cursor: grab;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled.img`
  transform: ${({ zoom, rotation }) => `scale(${zoom}) rotate(${rotation}deg)`};
  transition: transform 0.2s ease;
  transform-origin: center center;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

// ==== Image Viewer ====
const ImageViewer = React.memo(({ src }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handlers = {
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
  };

  const zoomDisplay = Math.round(zoom * 100);

  return (
    <ImageViewerContainer>
      <ImageControls>
        <div>
          <i onClick={handlers.zoomOut} className="fas fa-search-minus" style={{ fontSize: 20, cursor: 'pointer', marginRight: 8 }} />
          {zoomDisplay}%
          <i onClick={handlers.zoomIn} className="fas fa-search-plus" style={{ fontSize: 20, cursor: 'pointer', marginLeft: 8 }} />
          <Tooltip title="Reset Zoom">
            <button onClick={handlers.reset} style={{ marginLeft: 12, padding: '2px 6px', fontSize: 12 }}>Reset</button>
          </Tooltip>
          <Tooltip title="Rotate Left">
            <RotateLeftIcon onClick={handlers.rotateLeft} sx={{ marginLeft: 12, cursor: 'pointer' }} />
          </Tooltip>
          <Tooltip title="Rotate Right">
            <RotateRightIcon onClick={handlers.rotateRight} sx={{ cursor: 'pointer' }} />
          </Tooltip>
        </div>
        <Tooltip title="Download Image">
          <i onClick={handlers.download} className="fas fa-download" style={{ cursor: 'pointer', marginLeft: 12 }} />
        </Tooltip>
      </ImageControls>
      <ImageWrapper>
        <StyledImage src={src} zoom={zoom} rotation={rotation} alt="Loaded content" />
      </ImageWrapper>
    </ImageViewerContainer>
  );
});

// ==== Text Viewer ====
const TextViewer = ({ content }) => (
  <Box sx={{ p: 2, background: '#fff', border: '1px solid #e0e0e0', fontSize: 13, fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowY: 'auto', height: '80vh' }}>
    {content}
  </Box>
);

// ==== CSV Viewer ====
const CSVViewer = ({ csvString }) => {
  const rows = csvString.split('\n').map(r => r.split(','));
  return (
    <Box sx={{ p: 2, background: '#fff', fontSize: 13, overflow: 'auto', height: '80vh' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={{ border: '1px solid #ccc', padding: 4 }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

// ==== Upload helper for Office files ====
const uploadBase64WithExtension = async (base64, ext) => {
  try {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

    const formData = new FormData();
    formData.append('file', blob, `file.${ext}`);

    const response = await axios.post('https://tmpfiles.org/api/v1/upload', formData);
    const fileUrl = response.data?.data?.url;
    if (fileUrl) {
      const urlObj = new URL(fileUrl);
      const parts = urlObj.pathname.split('/');
      parts.splice(1, 0, 'dl');
      urlObj.pathname = parts.join('/');
      return urlObj.toString();
    }
    return null;
  } catch (err) {
    console.error('Error uploading base64 file:', err);
    return null;
  }
};

// ==== Main Component ====
const DynamicFileViewer3 = ({ base64, extension, title }) => {
  const [fileUrl, setFileUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileType = useMemo(() => {
    if (!extension) return 'none';
    const ext = extension.replace('.', '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (ext === 'txt') return 'text';
    if (['docx', 'doc', 'xlsx', 'xls', 'ppt', 'pptx'].includes(ext)) return 'office';
    if (ext === 'csv') return 'csv';
    return 'unsupported';
  }, [extension]);

  useEffect(() => {
    if (!base64 || !extension) return;
    setIsProcessing(true);

    (async () => {
      try {
        const ext = extension.replace('.', '').toLowerCase();
        let mimeType = 'application/octet-stream';

        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (['jpg', 'jpeg'].includes(ext)) mimeType = 'image/jpeg';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'txt') mimeType = 'text/plain';
        else if (ext === 'csv') mimeType = 'text/csv';

        if (fileType === 'text' || fileType === 'csv') {
          const byteCharacters = atob(base64);
          const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
          const byteArray = new Uint8Array(byteNumbers);
          const text = new TextDecoder().decode(byteArray);
          setTextContent(text);
        } else if (fileType === 'pdf' || fileType === 'image') {
          setFileUrl(`data:${mimeType};base64,${base64}`);
        } else if (fileType === 'office') {
          const url = await uploadBase64WithExtension(base64, ext);
          if (url) setFileUrl(url);
        }
      } catch (err) {
        console.error('Error decoding base64 file:', err);
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [base64, extension, fileType]);

  if (isProcessing) {
    return (
      <Box sx={{ width: '100%', height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!base64 || !extension) {
    return (
      <Box sx={{ textAlign: 'center', mt: '20%', color: '#555' }}>
        <i className="fas fa-tv" style={{ fontSize: 80, color: '#2757aa' }} />
        <Typography variant="body2" sx={{ mt: 2, fontSize: 13 }}>
          Nothing to preview - Select a file to view
        </Typography>
      </Box>
    );
  }

  switch (fileType) {
    case 'image':
      return <ImageViewer src={fileUrl} />;
    case 'pdf':
      return <PDFViewerPreview3 document={fileUrl} title={title} />;
    case 'text':
      return <TextViewer content={textContent} />;
    case 'csv':
      return <CSVViewer csvString={textContent} />;
    case 'office':
      return (
        <div className="viewer-container">
          {fileUrl ? (
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`}
              style={{ width: '100%', height: 'calc(100vh - 140px)', border: 'none' }}
              title="Office File"
            />
          ) : (
            <Typography sx={{ textAlign: 'center', mt: '20%', color: '#555' }}>
              Unable to display Office document.
            </Typography>
          )}
        </div>
      );

    default:
      return (
        <Box sx={{ textAlign: 'center', mt: '20%', color: '#555' }}>
          <i className="fa-solid fa-ban" style={{ fontSize: 80, color: '#2757aa' }} />
          <Typography variant="body2" sx={{ mt: 2, fontSize: 13 }}>
            Unsupported format "{extension}"
          </Typography>
        </Box>
      );
  }
};

export default DynamicFileViewer3;
