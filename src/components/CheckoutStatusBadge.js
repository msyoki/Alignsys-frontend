// components/StatusBadgeIcon.jsx
import React from 'react';
import { Badge } from '@mui/material';

const CheckOutStatusBadgeIcon = ({
  children,               // the wrapped icon (e.g., <FileExtIcon />)
  color = '#3fa34d',      // badge icon color
  icon = 'fa-check-circle', // Font Awesome icon
  size = 8,               // badge icon size
  vertical = 'bottom',    // position of badge
  horizontal = 'left',
  offsetX = '-5px',
  offsetY = '-3px',
}) => {
  return (
    <Badge
      overlap="circular"
      badgeContent={
        <i
          className={`fas ${icon}`}
          style={{
            color,
            fontSize: `${size}px`,
            textShadow: '0 0 1px #fff, 0 0 1px #fff, 0 0 2px #fff',
            filter: 'drop-shadow(0 0 0.5px #fff)',
          }}
        ></i>
      }
      anchorOrigin={{ vertical, horizontal }}
      sx={{
        '.MuiBadge-badge': {
          background: 'transparent',
          padding: 0,
          marginBottom: offsetY,
          marginLeft: offsetX,
          minWidth: 0,
          height: 'auto',
          boxShadow: 'none',
        },
      }}
    >
      {children}
    </Badge>
  );
};

export default CheckOutStatusBadgeIcon;
