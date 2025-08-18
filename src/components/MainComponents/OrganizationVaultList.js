import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Authcontext from "../Auth/Authprovider";
import * as constants from "../Auth/configs";
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
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
import AttachExistingVault from "../AttachExistingVault";

function OrganizationVaultList(props) {
  const [expanded, setExpanded] = useState([]);
  const { authTokens, user } = useContext(Authcontext);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [vaultName, setVaultName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {

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

  // Dialog handlers
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setVaultName('');
    setErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setVaultName('');
    setErrors({});
    setLoading(false);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!vaultName.trim()) {
      newErrors.vaultName = 'Vault name is required';
      // } else if (vaultName.trim().length < 3) {
      //   newErrors.vaultName = 'Vault name must be at least 3 characters long';
    } else if (vaultName.trim().length > 50) {
      newErrors.vaultName = 'Vault name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler (placeholder function)
  const handleSubmit = async () => {
    if (!validateForm()) return;
    const trimmedVaultName = vaultName.trim().toLowerCase();
    setLoading(true)

    const nameConflict = props.vaults.some(vault =>
      vault.name.toLowerCase().includes(trimmedVaultName)
    );

    if (nameConflict) {
      props.setOpenAlert(true);
      props.setAlertSeverity("warning");
      props.setAlertMsg(`A vault with a similar name already exists. Please choose a different name.`);
      return;
    }

    const userData = {
      company_id: props.user.organizationid,
      admin_email: props.user.email,
      vault_name: vaultName.trim()
    };
    console.log(userData)

    axios.post(`${constants.auth_api}/api/add-new-vault/`, userData)
      .then(response => {
        getOrganizationVaults()
        setLoading(false);
        handleCloseDialog();
        // Show success message

        props.setOpenAlert(true)
        props.setAlertSeverity('success')
        props.setAlertMsg("Vault was created successfully!")

      })
      .catch(error => {
        setLoading(false);
        props.setOpenAlert(true)
        props.setAlertSeverity('error')
        props.setAlertMsg("Vault creation failed")

      });
  };

  // Compact TreeItem styles
  const getTreeItemStyles = (isSelected) => ({
    margin: '1px 0',
    backgroundColor: isSelected ? '#ecf4fc !important' : 'transparent !important',
    border: isSelected ? '1px solid #ecf4fc' : '1px solid transparent',
    "&:hover": {
      backgroundColor: isSelected ? '#ecf4fc !important' : '#f8f9fa !important'
    },
    "& .MuiTreeItem-content": {
      backgroundColor: 'transparent !important',
      padding: '2px 6px',
      minHeight: '28px'
    },
    "& .MuiTreeItem-content.Mui-selected": {
      backgroundColor: 'transparent !important'
    },
    "& .MuiTreeItem-iconContainer": {
      color: '#666',
      marginRight: '4px'
    }
  });

  const getChildTreeItemStyles = (isSelected) => ({
    marginLeft: '16px',
    marginTop: '1px',
    borderRadius: '3px !important',
    backgroundColor: isSelected ? '#ecf4fc !important' : 'transparent !important',
    "& .MuiTreeItem-content": {
      borderRadius: '3px !important',
      backgroundColor: 'transparent !important',
      padding: '1px 6px',
      minHeight: '24px'
    }
  });

  return (
    <Box className='shadow-lg' sx={{
      backgroundColor: "#fff",
    }}>
      {/* Add Vault Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{
          backgroundColor: '#2757aa',
          color: 'white',
          fontSize: '16px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <i className="fa-solid fa-database" style={{ fontSize: '18px' }}></i>
          Create New Repository
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            label="Vault Name"
            placeholder="Enter vault name"
            value={vaultName}
            onChange={(e) => setVaultName(e.target.value)}
            error={!!errors.vaultName}
            helperText={errors.vaultName}
            disabled={loading}
            sx={{ mb: 2 }}
            InputProps={{
              style: { fontSize: '14px' }
            }}
          />

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '12px' }}>
            The vault name should be descriptive and unique within your organization.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={loading}
            sx={{
              textTransform: 'none',
              color: '#666'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: '#555' }} /> : <i className="fa-solid fa-plus" style={{ fontSize: '12px' }}></i>}
            sx={{
              textTransform: 'none',
              backgroundColor: '#2757aa',
              '&:hover': {
                backgroundColor: '#1e4a8c'
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Repository'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Compact Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        justifyContent: 'space-between',
        backgroundColor: '#eef2f7'
      }} className='shadow-lg'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="fa-solid fa-database" style={{ color: '#2757aa ', fontSize: 20 }}></i>
          <Typography sx={{
            fontWeight: 500,
            color: '#555',
            fontSize: '12px',
            lineHeight: 1
          }}>
            Repository Count ({props.vaults?.length || 0})
          </Typography>
        </Box>

        {process.env.REACT_APP_ONSITE === "false" && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            disabled={props.vaults?.length >= process.env.REACT_APP_MAX_VAULTS}
            sx={{
              fontSize: '11px',
              textTransform: 'none',
              py: 1,
              px: 2
            }}
          >
            <i className="fa-solid fa-plus"></i>
            <span className="mx-1">New Repo</span>
          </Button>


        )}

      </Box>
   

      {/* Compact Vaults TreeView */}
      <Box sx={{
        maxHeight: '400px',
        overflowY: "auto",
        backgroundColor: "#fff",
        color: 'black',
        p: 1,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '2px',
        },
      }}>


        {props.vaults?.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 2,
            color: '#9e9e9e'
          }}>
            <Storage sx={{ fontSize: 24, mb: 1, opacity: 0.5 }} />
            <Typography sx={{ textAlign: 'center', fontSize: '12px' }}>
              No vaults
            </Typography>
          </Box>
        ) : (
          <TreeView
            defaultCollapseIcon={<ExpandMore sx={{ fontSize: 16 }} />}
            defaultExpandIcon={<ChevronRight sx={{ fontSize: 16 }} />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            sx={{
              "& .MuiTreeItem-root": {
                "& .MuiTreeItem-content": {
                  color: 'black',
                },
              },
            }}
          >
            {props.vaults?.map((vault, index) => {
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        cursor: "pointer",
                        width: '100%'
                      }}
                      onClick={() => handleVaultExpand(vault)}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '4px',
                          backgroundColor: '#2757aa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <i
                            className="fa-solid fa-database"
                            style={{
                              fontSize: "10px",
                              color: 'white'
                            }}
                          />
                        </Box>
                        <Typography sx={{
                          fontWeight: 500,
                          color: '#2c3e50',
                          fontSize: '12px',
                          lineHeight: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {vault.name}
                        </Typography>
                      </Box>

                      {isSelected && (
                        <Box sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: '#4caf50',
                          flexShrink: 0
                        }} />
                      )}
                    </Box>
                  }
                >
                  {/* Compact GUID Sub-item */}
                  <TreeItem
                    key={`vault-${vault.guid}-guid`}
                    nodeId={`vault-${vault.guid}-guid`}
                    itemId={`vault-${vault.guid}-guid`}
                    sx={getChildTreeItemStyles(isSelected)}
                    label={
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography sx={{
                          fontSize: '12px',
                          color: '#666',
                          fontWeight: 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          ID:{vault.guid}
                        </Typography>
                      </Box>
                    }
                  />
                </TreeItem>
              );
            })}
          </TreeView>
        )}  <span className="text-center">
          <AttachExistingVault authTokens={authTokens} user={user} />
        </span>
      
      </Box>
    </Box>
  );
}

export default OrganizationVaultList;