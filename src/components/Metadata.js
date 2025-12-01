import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Paper,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import CircleIcon from '@mui/icons-material/Circle';

export default function MetadataPanel({ item }) {
  if (!item) {
    return (
      <Typography variant="body2" sx={{ color: '#777' }}>
        Select a document to view its metadata.
      </Typography>
    );
  }

  const file = item.objectFiles?.[0];
  const props = Object.fromEntries(item.objectprops?.map(p => [p.propName, p.value]) || []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #ddd',
        borderRadius: 2,
        backgroundColor: '#fff',
        maxHeight: '75vh',
        overflowY: 'auto',
      }}
    >
      {/* 🟥 Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <PictureAsPdfIcon sx={{ fontSize: 40, color: '#d32f2f', mr: 2 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {file?.fileTitle || item.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            <b>ID:</b> {item.displayID} &nbsp; | &nbsp;
            <b>Version:</b> {item.versionid}
          </Typography>
        </Box>
      </Box>

      {/* 🟦 Created / Modified Info */}
      <Typography variant="caption" sx={{ color: '#666' }}>
        Created: {props['Created']} &nbsp;&nbsp; | &nbsp;&nbsp; 
        Last modified: {props['Last modified']}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* 🟩 Metadata Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Class"
          value={props['Class'] || ''}
          size="small"
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Vendor Contract Title"
          value={props['Vendor Contract Title'] || ''}
          size="small"
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Document Date"
          placeholder="mm/dd/yyyy"
          size="small"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small">
          <InputLabel>Vendor(s)</InputLabel>
          <Select value="" displayEmpty>
            <MenuItem value="">Select Vendor(s)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Department</InputLabel>
          <Select value="" displayEmpty>
            <MenuItem value="">Select Department</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Expiry / Renewal Date"
          placeholder="mm/dd/yyyy"
          size="small"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Notice Period (Months)"
          placeholder="Enter number"
          size="small"
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* 🟨 Workflow Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <WorkflowIcon sx={{ color: '#2a68af', mr: 1 }} />
        <Typography variant="body2">
          {props['Workflow'] || 'No workflow assigned'}
        </Typography>
      </Box>

      {/* 🟧 State */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CircleIcon sx={{ color: '#fbc02d', fontSize: 12, mr: 1 }} />
        <Typography variant="body2">{props['State'] || 'No state'}</Typography>
      </Box>

      {/* 🟦 Permissions */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
        <LockOutlinedIcon sx={{ fontSize: 16, mr: 1 }} />
        <Typography variant="body2">Automatic permissions</Typography>
      </Box>
    </Paper>
  );
}
