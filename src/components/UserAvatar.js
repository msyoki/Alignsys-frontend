import { useState } from "react";
import { THEME_COLORS } from '../constants/themeColors';

import {
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Typography,
  ListItemIcon,
  Box,
} from "@mui/material";

import {
  FaEnvelope,
  FaBuilding,
  FaKey,
  FaSignOutAlt
} from "react-icons/fa";

export default function UserAvatarMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    handleCloseMenu();
    props.onLogout();
  };

  const handlePasswordReset = () => {
    handleCloseMenu();
    window.location.href = "/password-reset"; // redirect to password reset page
  };

  const fullName =
    props.user.first_name && props.user.last_name
      ? `${props.user.first_name} ${props.user.last_name}`
      : props.user.first_name || props.user.last_name || props.user.username;

  return (
    <>
      <Tooltip title={fullName} placement="right" arrow>
        <IconButton onClick={handleOpenMenu} size="small">
          <Avatar
            alt={fullName}
            {...props.stringAvatar(fullName)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: THEME_COLORS.primary,
              fontSize: "12.8px",
            }}
          />
        </IconButton>
      </Tooltip>
     <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleCloseMenu}
  PaperProps={{
    elevation: 6,
    sx: {
      minWidth: 220,
      borderRadius: 3,
      mt: 1.5,
      py: 0,
      overflow: "visible",
      boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 22,
        width: 10,
        height: 10,
        bgcolor: "background.paper",
        transform: "translateY(-50%) rotate(45deg)",
        zIndex: 0,
      },
    },
  }}
  transformOrigin={{ horizontal: "left", vertical: "top" }}
  anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
>
  {/* ===== User Info Section ===== */}
  <Box
    sx={{
      px: 2,
      py: 1.5,
      background: `linear-gradient(135deg, ${THEME_COLORS.primary}15, #ffffff)`,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    }}
  >
    <Typography
      variant="subtitle2"
      fontWeight="600"
      sx={{ color: THEME_COLORS.primary }}
    >
      Hi, {fullName}
    </Typography>

    <Box sx={{ mt: 1 }}>
      <Box display="flex" alignItems="center" mb={0.5}>
        <FaEnvelope
          style={{
            fontSize: 13,
            marginRight: 8,
            color: THEME_COLORS.primary,
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {props.user?.email}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center">
        <FaBuilding
          style={{
            fontSize: 13,
            marginRight: 8,
            color: THEME_COLORS.primary,
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {props.user?.organization}
        </Typography>
      </Box>
    </Box>
  </Box>

  <Divider />

  {/* ===== Reset Password ===== */}
  <MenuItem
    onClick={handlePasswordReset}
    sx={{
      py: 1,
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: `${THEME_COLORS.primary}10`,
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 32 }}>
      <FaKey
        style={{
          fontSize: 15,
          color: THEME_COLORS.primary,
        }}
      />
    </ListItemIcon>
    <Typography variant="body2">Reset Password</Typography>
  </MenuItem>

  {/* ===== Logout ===== */}
  <MenuItem
    onClick={handleLogout}
    sx={{
      py: 1,
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: `${THEME_COLORS.primary}10`,
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 32 }}>
      <FaSignOutAlt
        style={{
          fontSize: 15,
          color: THEME_COLORS.primary,
        }}
      />
    </ListItemIcon>
    <Typography variant="body2">Logout</Typography>
  </MenuItem>
</Menu>
    </>
  );
}
