import React from 'react';
import { Menu, MenuItem } from '@mui/material';

const RightClickMenu = ({ anchorEl, open, onClose, item, actions }) => (
    <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
        {item && actions.map((action, idx) => (
            <MenuItem
                key={idx}
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

export default RightClickMenu;