import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  IconButton,
  Grid,
  CircularProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SimpleIconTree from '../SimpleIconTree';
import axios from 'axios';
import * as constants from '../Auth/configs';
import DynamicFileViewer3 from '../Viewer/DynamicFileViewer3';
import Loader from '../Loaders/LoaderMini';import { THEME_COLORS } from '../../constants/themeColors';


function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function History(props) {
  const [tabValue, setTabValue] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const [col1Width, setCol1Width] = useState(58);
  const col1Ref = useRef(null);
  const dividerRef = useRef(null);
  const col2Ref = useRef(null);
  const isResizing = useRef(false);

  const getIcon = (ext, font) => {
    if (!ext)
      return <i className="fas fa-folder" style={{ fontSize: `${font}px`, color: '#2a68af' }} />;
    const e = ext.replace(/^\./, '').toLowerCase();

    const colorMap = {
      pdf: '#f21b3f',
      csv: '#7cb518',
      txt: '#555b6e',
      msg: '#ffb703',
      webp: '#2757aa',
      xlsx: '#217045',
      xls: '#217045',
      ppt: '#d34628',
      pptx: '#d34628',
      doc: '#35558b',
      docx: '#35558b',
      png: '#2a68af',
      jpeg: '#2a68af',
      jpg: '#2a68af',
      vssettings: '#555b6e',
    };

    const iconClass =
      e === 'msg'
        ? 'fa-solid fa-envelope'
        : e === 'ppt' || e === 'pptx'
        ? 'fa-solid fa-file-powerpoint'
        : e === 'xlsx' || e === 'xls'
        ? 'far fa-file-excel'
        : e === 'doc' || e === 'docx'
        ? 'fas fa-file-word'
        : e === 'pdf'
        ? 'fas fa-file-pdf'
        : e === 'png' || e === 'jpeg' || e === 'jpg'
        ? 'fas fa-file-image'
        : e === 'csv'
        ? 'fas fa-file-csv'
        : e === 'txt'
        ? 'fas fa-file-alt'
        : 'fas fa-folder';

    return <i className={iconClass} style={{ fontSize: `${font}px`, color: colorMap[e] || '#2a68af' }} />;
  };

  const handleClose = () => {
    props.setObjectHistory([]);
    setPreviewData(null);
    setSelectedItem(null);
    props.close(false);
    props.handleTabAction();
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;

    const startX = e.clientX;
    const startWidth = col1Ref.current.getBoundingClientRect().width;
    const totalWidth = col1Ref.current.parentElement.getBoundingClientRect().width;

    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const deltaX = e.clientX - startX;
      let newWidth = ((startWidth + deltaX) / totalWidth) * 100;
      if (newWidth < 15) newWidth = 15;
      if (newWidth > 70) newWidth = 70;
      setCol1Width(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  async function rollbackObjectVersion() {
    if (!selectedItem) return;
    setRollbackLoading(true);
    try {
      const payload = {
        vaultGuid: props.selectedVault.guid,
        objectId: props.selectedObject.id,
        classId: props.selectedObject.classId ?? props.selectedObject.classID,
        userID: props.mfilesId,
        versionID: selectedItem.versionid,
      };

      await axios.post(
        `${constants.mfiles_api}/api/ObjectVersions/RollbackToVersion`,
        payload,
        { headers: { Accept: '*/*', 'Content-Type': 'application/json' } }
      );
      props.handleTabAction()

      handleClose();
    } catch (error) {
      console.error('Error rolling back version:', error.response?.data || error.message);
    } finally {
      setRollbackLoading(false);
    }
  }

  const fetchPreviewData = async () => {
    if (!selectedItem || props.selectedObject.objectID !== 0) return;

    const url = `${constants.mfiles_api}/api/ObjectVersions/GetObjectFileVersion/${props.selectedVault?.guid}/${props.selectedObject?.id}/${selectedItem.versionid}/${selectedItem.objectFiles[0].fileID}/${selectedItem.class}/${props.mfilesId}`;

    try {
      const response = await axios.get(url, { headers: { accept: '*/*' } });
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error fetching preview:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1 && selectedItem) {
      fetchPreviewData();
    }
  };

  useEffect(() => {
    fetchPreviewData();
  }, [selectedItem]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseDown);
    };
  }, []);

  return (
    <Modal open={props.open} onClose={handleClose} aria-labelledby="modal-title">
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
          {/* Left Column */}
          <div
            ref={col1Ref}
            style={{
              width: isMobile ? '100%' : `${col1Width}%`,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              minWidth: '15%',
              overflowY: 'hidden',
              overflowX: 'auto',
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #ddd', backgroundColor: '#fff' }}>
              <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
                History
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowX: 'auto',
                overflowY: 'auto',
                whiteSpace: 'nowrap',
                p: 1,
              }}
            >
              {props.loadingHisytory ? (
                <Loader />
              ) : (
                <Box sx={{ display: 'inline-block', minWidth: '100%' }}>
                  <SimpleIconTree
                    data={props.data}
                    onItemClick={setSelectedItem}
                    getTooltipTitle={(item) => item.title}
                    renderHeight="100%"
                    isFile={props.isFile}
                    fetchPreviewData={fetchPreviewData}
                    getIcon={getIcon}
                  />
                </Box>
              )}
            </Box>
          </div>

          {/* Divider */}
          {!isMobile && (
            <div
              ref={dividerRef}
              onMouseDown={handleMouseDown}
              style={{ width: '4px', cursor: 'ew-resize', backgroundColor: '#ddd' }}
            />
          )}

          {/* Right Column */}
          <div
            ref={col2Ref}
            style={{
              width: isMobile ? '100%' : `${100 - col1Width}%`,
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minWidth: '30%',
              padding: '16px',
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Metadata" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '15px' }} />
                <Tab label="Preview" sx={{ textTransform: 'none', fontWeight: 500, fontSize: '15px' }} />
              </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {/* Metadata Tab */}
              <TabPanel value={tabValue} index={0}>
                {selectedItem ? (
                  <Box display="flex" flexDirection="column" height="100%">
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600, fontSize: '16px', mb: 1.5 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, flexShrink: 0 }}>
                          {getIcon(selectedItem?.objectFiles?.[0]?.extension, 30)}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          {selectedItem.title}
                          {selectedItem?.objectFiles?.[0]?.extension ? `.${selectedItem.objectFiles[0].extension}` : null}
                        </Box>
                      </Typography>

                      <Typography variant="caption" sx={{ display: 'block', color: '#555', mb: 1.5 }}>
                        Version: {selectedItem?.versionid || '-'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#f9f9f9',
                        borderRadius: 1,
                        overflowY: 'auto',
                        flex: 1,
                        maxHeight: 300,
                      }}
                    >
                      <Grid container spacing={1} direction="column">
                        {selectedItem.objectprops?.map((prop, i) => (
                          <Grid
                            container
                            item
                            key={i}
                            alignItems="flex-start"
                            sx={{
                              py: 0.5,
                              borderBottom: i < selectedItem.objectprops.length - 1 ? '1px solid #e0e0e0' : 'none',
                            }}
                          >
                            <Grid item xs={isMobile ? 12 : 4}>
                              <Typography sx={{ fontWeight: 600, fontSize: '12px', lineHeight: 1.2 }}>
                                {prop.propName}
                              </Typography>
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 8}>
                              <Typography sx={{ color: '#555', wordBreak: 'break-word', fontSize: '12.5px', lineHeight: 1.3 }}>
                                {prop.value || '-'}
                              </Typography>
                            </Grid>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#777', fontSize: '12.8px' }}>
                    Select an item to view its metadata.
                  </Typography>
                )}
              </TabPanel>

              {/* Preview Tab */}
              <TabPanel value={tabValue} index={1}>
                {selectedItem ? (
                  <DynamicFileViewer3
                    title={selectedItem.title}
                    base64={previewData?.base64}
                    extension={previewData?.extension}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: '#777' }}>
                    Select a document to preview.
                  </Typography>
                )}
              </TabPanel>
            </Box>
          </div>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            borderTop: '1px solid #ddd',
            backgroundColor: '#f9f9f9',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: '#666', fontSize: 12 }}>
            {props.data?.length || 0} items found
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: '#666', fontSize: 12 }}>
              Current Version: {props.selectedObject.versionId}
            </Typography>
            {selectedItem && (
              <Typography variant="body2" sx={{ color: '#666', fontSize: 12 }}>
                Selected Version: {selectedItem.versionid}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedItem && selectedItem.versionid !== props.selectedObject.versionId && (
              <Button
                onClick={() => setConfirmDialogOpen(true)}
                variant="contained"
                size="small"
                sx={{ textTransform: 'none', backgroundColor: THEME_COLORS.primary }}
                disabled={rollbackLoading}
                className="mx-4"
              >
                {rollbackLoading && <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} />}
                Roll Back to This Version ({selectedItem?.versionid})
              </Button>
            )}
            <Button onClick={handleClose} variant="outlined" size="small">
              Close
            </Button>
          </Box>
        </Box>

        {/* ✅ Rollback Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontSize: 18, fontWeight: 600 }}>Confirm Rollback</DialogTitle>
          <DialogContent dividers>
            <Typography sx={{ fontSize: 14 }}>
              Are you sure you want to roll back this object to version{' '}
              <strong>{selectedItem?.versionid}</strong>? This action will overwrite the current version.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setConfirmDialogOpen(false)}
              color="inherit"
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setConfirmDialogOpen(false);
                rollbackObjectVersion();
              }}
              color="primary"
              variant="contained"
              size="small"
              sx={{ textTransform: 'none', backgroundColor: THEME_COLORS.primary }}
              disabled={rollbackLoading}
            >
              {rollbackLoading ? <CircularProgress size={16} sx={{ color: '#fff', mr: 1 }} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
}
