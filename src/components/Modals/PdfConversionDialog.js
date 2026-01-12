import React, { useMemo,useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
  IconButton
} from '@mui/material';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';


import { FaRegFilePdf } from "react-icons/fa6";
import { BsFiletypeCsv } from "react-icons/bs";
import { FaRegFileWord } from "react-icons/fa6";
import { BsFiletypeTxt } from "react-icons/bs";
import { FaEnvelope } from "react-icons/fa";
import { FaInternetExplorer } from "react-icons/fa";
import { BsFiletypePptx } from "react-icons/bs";
import { VscVscode } from "react-icons/vsc";
import { CiFileOn } from "react-icons/ci";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { CiImageOn } from "react-icons/ci";
import { HiOutlineAnnotation } from "react-icons/hi";

import { BsFiles } from "react-icons/bs";

const PdfConversionDialog = ({
  open,
  onClose,
  onConfirm,
  fileName,
  file,
  vault,
  overwriteOriginal,
  isConverting = false
}) => {
  // Event handlers
  const handleConfirm = () => onConfirm();
  const handleCancel = () => !isConverting && onClose();


  // Memoized icon style to prevent recreation
  const iconStyle = useMemo(() => ({
    fontSize: '18px',
  }), []);



  // Memoized icon generation function
      const getIcon = useCallback((extension) => {
          const ext = (extension || '').toLowerCase();
  
          switch (ext) {
              case 'pdf':
                  return <FaRegFilePdf style={{ ...iconStyle, color: '#f21b3f' }} />;
              case 'csv':
                  return <BsFiletypeCsv style={{ ...iconStyle, color: '#7cb518' }} />;
              case 'txt':
                  return <BsFiletypeTxt style={{ ...iconStyle, color: '#555b6e' }} />;
              case 'msg':
                  return <FaEnvelope style={{ ...iconStyle, color: '#ffb703' }} />;
              case 'webp':
                  return <FaInternetExplorer style={{ ...iconStyle, color: '#2757aa' }} />;
              case 'xlsx':
              case 'xls':
                  return <PiMicrosoftExcelLogoFill style={{ ...iconStyle, color: '#217045' }} />;
              case 'ppt':
              case 'pptx':
                  return <BsFiletypePptx style={{ ...iconStyle, color: '#d34628' }} />;
              case 'docx':
              case 'doc':
                  return <FaRegFileWord style={{ ...iconStyle, color: '#35558b' }} />;
              case 'png':
              case 'jpeg':
              case 'jpg':
                  return <CiImageOn style={{ ...iconStyle, color: '#2a68af' }} />;
              case 'xfdf':
                  return <HiOutlineAnnotation style={{ ...iconStyle, color: '#ffb703' }} />;
              case 'vssettings':
                  return <VscVscode style={{ ...iconStyle, color: '#555b6e' }} />;
              default:
                  return <CiFileOn style={{ ...iconStyle, color: '#e5e5e5' }} />;
          }
      }, [iconStyle]);

  // Helper function to get class ID
  const getClassId = () => file?.classId ?? file?.classID;

  // File display component
  const FileDisplay = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {file?.extension ? getIcon(file.extension) : <FileExtIcon
        fontSize="20px"
        guid={vault?.guid}
        objectId={file?.id || file?.fileID}
        classId={getClassId()}
      />}

      <span>
        {fileName}{file?.extension ? `.${file.extension}` : <FileExtText
          guid={vault?.guid}
          objectId={file?.id}
          classId={getClassId()}
        />}

      </span>
    </Box>
  );

  // Warning/Info box component
  const ActionInfoBox = () => {
    if (overwriteOriginal) {
      return (
        <Box sx={{
          backgroundColor: '#fcefb4',
          border: '1px solid #fcefb4',
          borderRadius: 1,
          p: 2
        }}>
          <Typography variant="body2" sx={{ color: '#856404' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }} />
            Warning: This will permanently replace the original file with a PDF version.
            This action cannot be undone.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{
        backgroundColor: '#bde0fe',
        border: '1px solid #bde0fe',
        borderRadius: 1,
        p: 2
      }}>
        <Typography variant="body2">
          NB: A multi-file document will be created containing both the original copy
          and the newly generated PDF version.
        </Typography>
      </Box>
    );
  };

  // File info box component
  const FileInfoBox = ({ showAction = true }) => (
    <Box sx={{
      backgroundColor: '#f5f5f5',
      p: 2,
      borderRadius: 1,
      mb: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 'fit-content', mr: 2 }}>
          File:
        </Typography>
        <FileDisplay />
      </Box>
      {showAction && (
        <Typography variant="body2" color="text.secondary">
          Action: {overwriteOriginal
            ? 'Replace original file with PDF version'
            : 'Create new PDF file (keep original)'
          }
        </Typography>
      )}
      {!showAction && (
        <Typography variant="body2" color="text.secondary">
          Please wait while we process your document.
        </Typography>
      )}
    </Box>
  );

  // Progress indicator component
  const ProgressIndicator = () => (
    <Box sx={{ width: '100%', mt: 2 }}>
      <LinearProgress
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#1976d2'
          }
        }}
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, textAlign: 'center' }}
      >
        Processing...
      </Typography>
    </Box>
  );

  // Dialog header
  const DialogHeader = () => (
    <DialogTitle sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      pb: 1
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <i className="fas fa-file-pdf" style={{ color: '#d32f2f', fontSize: '20px' }} />
        <Typography variant="h6" component="span">
          Convert to PDF
        </Typography>
      </Box>
      {!isConverting && (
        <IconButton
          onClick={handleCancel}
          size="small"
          sx={{ color: 'grey.500' }}
        >
          <i className="fas fa-times" />
        </IconButton>
      )}
    </DialogTitle>
  );

  // Confirmation content
  const ConfirmationContent = () => (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Are you sure you want to convert this document to PDF?
      </Typography>
      <FileInfoBox />
      <ActionInfoBox />
    </Box>
  );

  // Converting content
  const ConvertingContent = () => (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Converting document to PDF...
      </Typography>
      <FileInfoBox showAction={false} />
      <ProgressIndicator />
    </Box>
  );

  // Dialog actions
  const DialogFooter = () => (
    !isConverting && (
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          sx={{ minWidth: 100 }}
        >
          Convert
        </Button>
      </DialogActions>
    )
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isConverting}
    >
      <DialogHeader />

      <DialogContent sx={{ pt: 2 }}>
        {isConverting ? <ConvertingContent /> : <ConfirmationContent />}
      </DialogContent>

      <DialogFooter />
    </Dialog>
  );
};

export default PdfConversionDialog;