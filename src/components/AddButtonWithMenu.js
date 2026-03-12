import React, { useState } from 'react';
import { Menu, MenuItem, Tooltip, Box } from '@mui/material';
import { THEME_COLORS } from '../constants/themeColors';
import { MdOutlineScanner } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

import { FaFolderPlus } from "react-icons/fa6";
import { FaFileCirclePlus } from "react-icons/fa6";
import DynamicIcon from './Utils/Dynamicicon';

const AddButtonWithMenu = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleIconClick = (event) => {
    setAnchorEl(event.currentTarget); // Anchor the menu to the icon
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const iconStyle = {
    fontSize: 30,
    cursor: "pointer",
    color: THEME_COLORS.primary,
    textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
  };

  const menuItemIconStyle = {
    color: THEME_COLORS.primary,
    fontSize: 18,
    marginRight: "0.5rem",
  };

  const permittedObjects =
    props.vaultObjectsList?.filter(
      (item) => item.userPermission?.attachObjectsPermission
    ) || [];

  return (
    <>
      <Tooltip title="Create/Add new object or document">
        <FaPlus
          onClick={handleIconClick}
          className="mx-2"
          style={iconStyle}
        />

      </Tooltip>

      {permittedObjects.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          PaperProps={{
            sx: { p: 0, mt: 0, width: "auto" },
            className: "no-menu-padding",
          }}
          className="shadow-lg"
        >
          {/* Header */}
          <Box
            sx={{
              fontSize: 13,
              px: 2,
              py: 1,
              backgroundColor: "#fff",
            }}
            className="shadow-sm"
          >
            <div className="d-flex align-items-center">
              <FaPlus style={menuItemIconStyle} />
              <span>Create New ...</span>
            </div>
          </Box>

          {/* Object List */}
          <Box sx={{ maxHeight: 340, overflowY: "auto" }}>
            {permittedObjects.map((item) => (
              <MenuItem
                key={item.objectid}
                sx={{ fontSize: 13 }}
                onClick={() => {
                  props.fetchItemData(item.objectid, item.namesingular);
                  handleClose();
                }}
              >

                {
                  item.objectid === 0 ? (
                    <FaFileCirclePlus style={menuItemIconStyle} />
                  ) : (
                    // <FaFolderPlus style={menuItemIconStyle} />
                    <DynamicIcon name={item.namesingular} color={THEME_COLORS.primary} size={18} />
                  )
                }
                <span className="mx-1">{item.namesingular}</span>
              </MenuItem>
            ))}
          </Box>

          {/* Footer */}
          {/* Footer */}
          <Box
            sx={{
              fontSize: 13,
              px: 2,
              py: 1,
              backgroundColor: "#fff",
              cursor: "pointer",
              "&:hover": { backgroundColor: "#f5f5f5" },
            }}
            className="shadow-sm"
            onClick={() => {
              props.setScannerDialogOpen(true);
              handleClose();
            }}
          >
            <div className="d-flex align-items-center">
              <MdOutlineScanner
                style={{ fontSize: 18, marginRight: "0.5rem", color: THEME_COLORS.primary }}
              />
              <span>Add Document from Scanner ...</span>
            </div>
          </Box>
        </Menu>
      )}
    </>
  );

};

export default AddButtonWithMenu;
