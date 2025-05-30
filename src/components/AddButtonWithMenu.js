import React, { useState } from 'react';
import { Menu, MenuItem, Tooltip, Box } from '@mui/material';

const AddButtonWithMenu = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget); // Anchor the menu to the icon
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectOption = (option) => {
    handleClose();
    props.getVaultObjects(option); // You can pass the selected option if needed
  };

  return (
    <>
      <Tooltip title="Create/Add new object or document">
        <i
          onClick={handleIconClick}
          className="fas fa-plus mx-2"
          style={{
            fontSize: '30px',
            cursor: 'pointer',
            color: '#1C4690',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
          }}
        ></i>
      </Tooltip>
      {props.vaultObjectsList !== null && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          PaperProps={{
            sx: {
              padding: 0,
              marginTop: 0,
              borderRadius: '4px',
              width: '220px',
            },
            className: 'no-menu-padding',
          }}
          className="shadow-lg"
        >
          {/* Fixed Title */}
          <Box
            sx={{
              fontSize: '13px',
              padding: '8px 16px',
              // borderBottom: '1px solid #ddd',
              backgroundColor: '#fff',
            
              margin: 0,
            }}
            className='shadow-sm '
          >
           <i class="fa-solid fa-plus mx-2"  style={{ color: '#2757aa' }}></i>  Create New ...
          </Box>

          {/* Scrollable Items */}
          <Box
            sx={{
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {props.vaultObjectsList &&
              props.vaultObjectsList
                .filter((item) => item.userPermission?.attachObjectsPermission)
                .map((item) => (
                  <MenuItem
                    key={item.objectid}
                    style={{ fontSize: '13px' }}
                    onClick={() => {
                      props.fetchItemData(item.objectid, item.namesingular);
                      handleClose();
                    }}
                  >
                    <i
                      className={`${item.objectid === 0
                        ? 'fas fa-file-circle-plus'
                        : 'fas fa-folder-plus'
                        } mx-2`}
                      style={{ color: '#2757aa', fontSize: '18px' }}
                    ></i>
                    {item.namesingular}
                  </MenuItem>
                ))}
          </Box>
        </Menu>


      )}
    </>
  );
};

export default AddButtonWithMenu;
