import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AutomaticPermissionsDialog from './AutomaticPermissionsDialog';

const AutomaticPermissionsButton = ({ permissions }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (!permissions) return;
    setOpen(true);
  };

  return (
    <>
      {/* Wrapper aligns button to the right */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
        }}
      >
        <Box
          onClick={handleClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#ecf4fc',
            color: '#555b6e',
            padding: '6px 10px',
            cursor: 'pointer',
           
            width: 'fit-content',
            transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: '#555b6e', color: '#fff' },
            userSelect: 'none',
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 18 }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              fontSize: '13.5px',
              whiteSpace: 'nowrap',
            }}
          >
            Automatic permissions
          </Typography>
        </Box>
      </Box>

      {/* Permissions dialog */}
      <AutomaticPermissionsDialog
        open={open}
        onClose={() => setOpen(false)}
        permissions={permissions}
      />
    </>
  );
};

export default AutomaticPermissionsButton;
