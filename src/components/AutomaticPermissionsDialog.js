import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";
import { MdLockOutline } from "react-icons/md";

const AutomaticPermissionsDialog = ({ open, onClose, permissions }) => {
  if (!permissions) return null;

  const { title, objectTypeName, classTypeName, userPermission } = permissions;

  // Filter out irrelevant key
  const filteredPermissions = Object.entries(userPermission || {}).filter(
    ([key]) => key !== 'isClassDeleted'
  );

  // Group key types for clarity
  const grouped = {
    Read: filteredPermissions.find(([k]) => k.toLowerCase().includes('read')),
    Edit: filteredPermissions.find(([k]) => k.toLowerCase().includes('edit')),
    Delete: filteredPermissions.find(([k]) => k.toLowerCase().includes('delete')),
    Attach: filteredPermissions.find(([k]) => k.toLowerCase().includes('attach')),
  };

  const renderIcon = (val) => (
    <>
      {val ? <FaCheck style={{ color: '#2e7d32', fontSize: '15px' }} /> : <FaTimes style={{ color: '#d32f2f', fontSize: '15px' }} />}
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth

    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ecf4fc',
          px: 2,
          py: 1.3,
          borderBottom: '1px solid #dbe4f0',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'normal' }}>
           <MdLockOutline style={{ fontSize: 18, color: '#9e9e9e' }} className='mx-2' /> Automatic Permissions
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <FaXmark />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ pt: 2.5 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
          Object Information
        </Typography>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
          <Typography variant="body2" >
            <strong>Title:</strong> <span style={{fontSize:'12px'}}>{title}</span> 
          </Typography>
          <Typography variant="body2">
            <strong>Type:</strong> <span style={{fontSize:'12px'}}>{objectTypeName}</span>
          </Typography>
          <Typography variant="body2">
            <strong>Class:</strong> <span style={{fontSize:'12px'}}>{classTypeName}</span>
          </Typography>
        </Paper>

        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
          User Permissions
        </Typography>

        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                <TableCell align="center">Read</TableCell>
                <TableCell align="center">Edit</TableCell>
                <TableCell align="center">Delete</TableCell>
                <TableCell align="center">Attach</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">
                  {grouped.Read ? renderIcon(grouped.Read[1]) : '-'}
                </TableCell>
                <TableCell align="center">
                  {grouped.Edit ? renderIcon(grouped.Edit[1]) : '-'}
                </TableCell>
                <TableCell align="center">
                  {grouped.Delete ? renderIcon(grouped.Delete[1]) : '-'}
                </TableCell>
                <TableCell align="center">
                  {grouped.Attach ? renderIcon(grouped.Attach[1]) : '-'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default AutomaticPermissionsDialog;
