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
    props.fetchUsersNotLinkedToVault(vault.guid);
  };

  const handleVaultUsersClick = (vault) => {
    props.setSelectedVault(vault);
    props.viewvaultusers(vault.guid);
  };

  const TREE_ITEM_STYLES = {
    backgroundColor: '#fff !important',
    "&:hover": { backgroundColor: '#fff !important' },
    borderRadius: "0px !important",
    "& .MuiTreeItem-content": { borderRadius: "0px !important" },
    "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
    "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
  };


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
          {props.vaults?.map((vault, index) => (
            <TreeItem
              key={`vault-${vault.guid}`}

              sx={[TREE_ITEM_STYLES, { backgroundColor: '#fff' }]}
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
                    padding: '5px'
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
                sx={{ backgroundColor: '#ecf4fc' }}
                label={
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 0.5,

                        borderRadius: 1,
                        cursor: "pointer",
                      }}
                      onClick={() => handleVaultUsersClick(vault)}
                    >
                      <People sx={{ color: "black", fontSize: 16 }} />
                      <Typography variant="caption">Vault Users</Typography>
                    </Box>
                    {/* Vault GUID Sub-item */}
                    <Box >
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
          ))}
        </TreeView>
      </Box>

      {/* Management Buttons */}
      <Stack spacing={1} sx={{p:2}}>
        <Button
          variant="contained"
          color='warning'
          startIcon={<People />}
          onClick={() => {
            props.fetchOrgUsers();
            props.viewloginaccounts();
          }}
          sx={{
            // backgroundColor: "#2757aa",
            // color: "#fff",
            textTransform: "none",
            // "&:hover": { backgroundColor: "#1e4686" },
          }}
        >
          <Typography variant="caption">Login Accounts</Typography>
        </Button>

        <Button
          variant="contained"
          color='warning'
          startIcon={<Timeline />}
          onClick={() => {
            props.fetchOrgUsers();
            props.viewloginactivity();
          }}
          sx={{
            // backgroundColor: "#2757aa",
            color: "#fff",
            textTransform: "none",
            // "&:hover": { backgroundColor: "#1e4686" },
          }}
        >
          <Typography variant="caption">Login Activity</Typography>
        </Button>
      </Stack>
    </Box>
  );
}

export default OrganizationVaultList;