import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Authcontext from "../Auth/Authprovider";
import * as constants from "../Auth/configs";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore, People, Storage } from "@mui/icons-material";

function OrganizationVaultList(props) {
  const [openVaults, setOpenVaults] = useState({});
  const { authTokens } = useContext(Authcontext);

  useEffect(() => {
    const getOrganizationVaults = async () => {
      try {
        const response = await axios.get(
          `${constants.auth_api}/api/organization-vaults/`,
          {
            headers: {
              Authorization: `Bearer ${authTokens.access}`,
              "Content-Type": "application/json",
            },
          }
        );
        props.setVaults(response.data);
      } catch (error) {
        console.error("Error fetching vaults:", error);
      }
    };
    getOrganizationVaults();
  }, [authTokens, props.setVaults]);

  const toggleVaultSublist = (vault) => {
    props.setSelectedVault(vault);
    props.fetchUsersNotLinkedToVault(vault.guid);
    setOpenVaults((prevState) => ({
      ...prevState,
      [vault.guid]: !prevState[vault.guid],
    }));
  };

  return (
    <Box className="shadow-lg p-2 rounded-lg" sx={{ backgroundColor: "#fff" }}>
    {/* Total Vaults Section */}
    <Box sx={{ p: 1, backgroundColor: "#e0fbfc", borderRadius: 1 }}>
      <Typography variant="caption">
        <i className="fas fa-list mx-1"></i>
        Total Vaults:{" "}
        <strong style={{ color: "#2757aa" }}>
          ({props.vaults ? props.vaults.length : 0})
        </strong>
      </Typography>
    </Box>
  
    {/* Vaults List */}
    <List sx={{ maxHeight: "350px", overflowY: "auto", p: 3 }}>
      {props.vaults.map((vault) => (
        <Box key={vault.guid}>
          {/* Vault Item */}
          <ListItemButton
            onClick={() => toggleVaultSublist(vault)}
            sx={{
              backgroundColor: "#2757aa",
              color: "#fff",
              borderRadius: 1,
              p: 1,
              my: 0.5,
              "&:hover": { backgroundColor: "#1e4686" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 30 }}>
              {/* <Storage sx={{ color: "#fff", fontSize: 18 }} /> */}
              <i class="fas fa-hdd" style={{ color: "#fff", fontSize: "18px" }}></i>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: "caption" }} primary={vault.name} />
            {openVaults[vault.guid] ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </ListItemButton>
  
          {/* Vault Sublist */}
          <Collapse in={openVaults[vault.guid]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }} className="shadow-lg bg-white">
              {/* Vault Users */}
              <ListItemButton
                onClick={() => {
                  props.setSelectedVault(vault);
                  props.viewvaultusers(vault.guid);
                }}
                sx={{ "&:hover": { backgroundColor: "#f0f0f0" }, p: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <People sx={{ color: "#2757aa", fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: "caption" }} primary="Vault Users" />
              </ListItemButton>
  
              {/* Vault GUID */}
              <ListItem sx={{  py: 0.5 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: 10 }}>
                  GUID: {vault.guid}
                </Typography>
              </ListItem>
            </List>
          </Collapse>
        </Box>
      ))}
    </List>
  
    {/* Login Accounts Section */}
    <List sx={{ p: 0 ,my:2 }}>
      <ListItemButton
        onClick={() => {
          props.fetchOrgUsers();
          props.viewloginaccounts();
        }}
        sx={{
          backgroundColor: "#2757aa",
          color: "#fff",
          borderRadius: 1,
          p: 1,
          "&:hover": { backgroundColor: "#1e4686" },
        }}
      >
        <ListItemIcon sx={{ minWidth: 30 }}>
          <People sx={{ color: "#fff", fontSize: 18 }} />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ variant: "caption" }} primary="Login Accounts" />
      </ListItemButton>
    </List>
  </Box>
  
  );
}

export default OrganizationVaultList;
