import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Authcontext from "../Auth/Authprovider";
import * as constants from "../Auth/configs";
import {
  Box,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import {
  ExpandMore,
  ChevronRight,
  People,
  Storage,
  AccountBox,
  Timeline
} from "@mui/icons-material";

function OrganizationVaultList(props) {
  const [expanded, setExpanded] = useState([]);
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

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleVaultExpand = (vault) => {
    props.setSelectedVault(vault);
    props.viewvaultusers(vault.guid);
  
  };

  const handleVaultUsersClick = (vault) => {
    props.setSelectedVault(vault);
    props.viewvaultusers(vault.guid);
  };

  // Function to get TreeItem styles based on selection state
  const getTreeItemStyles = (isSelected) => ({
    backgroundColor: isSelected ? '#fcf3c0 !important' : '#fff !important',
    "&:hover": { 
      backgroundColor: isSelected ? '#fcf3c0 !important' : '#f5f5f5 !important' 
    },
    borderRadius: "0px !important",
    "& .MuiTreeItem-content": { 
      borderRadius: "0px !important",
      backgroundColor: isSelected ? '#fcf3c0 !important' : 'inherit !important'
    },
    "& .MuiTreeItem-content.Mui-selected": { 
      backgroundColor: isSelected ? '#fcf3c0 !important' : '#fff !important' 
    },
    "& .MuiTreeItem-content.Mui-selected:hover": { 
      backgroundColor: isSelected ? '#fcf3c0 !important' : '#f5f5f5 !important' 
    },
  });

  return (
    <Box sx={{ backgroundColor: "#fff",  color: 'black' }}>

      {/* Vaults TreeView */}
      <Box sx={{ maxHeight: '330px', overflowY: "auto", backgroundColor: "#fff", color: 'black' }}>
        <TreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
          expanded={expanded}
          onNodeToggle={handleToggle}
          sx={{
            "& .MuiTreeItem-root": {
              "& .MuiTreeItem-content": {
                borderRadius: 1,
                color: 'black',
                mb: 0.5,
              },
            },
          }}
        >
          {props.vaults?.map((vault, index) => {
            // Check if this vault is currently selected
            const isSelected = props.selectedVault?.guid === vault.guid;
            
            return (
              <TreeItem
                key={`vault-${vault.guid}`}
                sx={getTreeItemStyles(isSelected)}
                nodeId={`vault-${vault.guid}`}
                itemId={`vault-${vault.guid}`}
                onIconClick={() => handleVaultExpand(vault)}
                label={
                  <Box
                    sx={{
                      color: "#2757aa",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      padding: '5px',
                      backgroundColor: isSelected ? '#fcf3c0' : 'transparent'
                    }}
                    onClick={() => handleVaultExpand(vault)}
                  >
                    <i
                      className="fa-solid fa-database"
                      style={{ fontSize: "16px" }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 500, color: 'black' }}>
                      {vault.name}  
                    </Typography>
                  </Box>
                }
              >
                {/* Vault Users Sub-item */}
                <TreeItem
                  key={`vault-${vault.guid}-users`}
                  nodeId={`vault-${vault.guid}-users`}
                  itemId={`vault-${vault.guid}-users`}
                  sx={{ 
                    backgroundColor: isSelected ? '#fcf3c0 !important' : '#fff !important',
                    "& .MuiTreeItem-content": {
                      backgroundColor: isSelected ? '#fcf3c0 !important' : '#fff !important'
                    }
                  }}
                  label={
                    <>
                      {/* <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          p: 0.5,
                          borderRadius: 1,
                          cursor: "pointer",
                          backgroundColor: isSelected ? '#fcf3c0' : 'transparent'
                        }}
                        onClick={() => handleVaultUsersClick(vault)}
                      >
                        <People sx={{ color: "black", fontSize: 16 }} />
                        <Typography variant="caption">User accounts</Typography>
                      </Box> */}
                      {/* Vault GUID Sub-item */}
                      <Box sx={{ backgroundColor: isSelected ? '#fcf3c0' : 'transparent' }}>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: 10, fontFamily: "monospace" }}
                        >
                          GUID: {vault.guid}
                        </Typography>
                      </Box>
                    </>
                  }
                />
              </TreeItem>
            );
          })}
        </TreeView>
      </Box>

    
    </Box>
  );
}

export default OrganizationVaultList;