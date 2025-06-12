import React from 'react';
import { Menu, MenuItem, useMediaQuery } from '@mui/material';

const RightClickMenu = ({ anchorEl, open, onClose, item, actions }) => {
    // Responsive minWidth: 400px on desktop, 90vw on small screens
    const isMobile = useMediaQuery('(max-width:600px)');
    const minWidth = isMobile ? '90vw' : 400;
    const minHeight = 100;

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
                style: {
                    minWidth,
                    minHeight,
                    maxWidth: '98vw',
                    boxSizing: 'border-box',
                },
            }}
        >
            {item && actions.map((action, idx) => (
                <MenuItem
                    key={idx}
                    sx={{ fontSize: '14px' }}
                    onClick={() => {
                        action.onClick(item);
                        onClose();
                    }}
                >
                    {action.label}
                </MenuItem>
            ))}
        </Menu>
    );
};

export default RightClickMenu;