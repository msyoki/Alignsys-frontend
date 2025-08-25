import React from 'react';
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

const PdfMergeDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  item, 
  isConverting = false 
}) => {
  // Event handlers
  const handleConfirm = () => onConfirm();
  const handleCancel = () => !isConverting && onClose();

  // Object info box component
  const ObjectInfoBox = ({ showAction = true }) => (
    <Box sx={{ 
      backgroundColor: '#f5f5f5', 
      p: 2, 
      borderRadius: 1, 
      mb: 2 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 'fit-content', mr: 2 }}>
          {showAction ? 'Object:' : 'File:'}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {item?.title}
        </Typography>
      </Box>
      {showAction && (
        <Typography variant="body2" color="text.secondary">
          Action: Merge all linked documents to a single PDF file.
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

    const ActionInfoBox = () => {
 
  
      return (
        <Box sx={{
          backgroundColor: '#bde0fe',
          border: '1px solid #bde0fe',
          borderRadius: 1,
          p: 2
        }}>
          <Typography variant="body2">
            NB: Generating a consolidated copy of documents linked to this object will create a new PDF version. The original documents will remain unaffected.
          </Typography>
        </Box>
      );
    };

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
          Consolidate Linked Documents to PDF
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
        Are you sure you want to consolidate documents linked to this Object?
      </Typography>
      <ObjectInfoBox />
            <ActionInfoBox />
    </Box>
  );

  // Converting content
  const ConvertingContent = () => (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Converting document to PDF...
      </Typography>
      <ObjectInfoBox showAction={false} />
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
          Consolidate
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

export default PdfMergeDialog;