import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import logo from '../../images/ZFWHITE.png';
import TimedAlert from '../TimedAlert';
import * as constants from '../Auth/configs';
import axios from 'axios';

function VaultUsersTable(props) {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add user dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [userType, setUserType] = useState('new'); // 'new' or 'existing'
  const [selectedExistingUser, setSelectedExistingUser] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    user: null,
    loading: false
  });

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (userType === 'new') {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    } else {
      if (!selectedExistingUser) newErrors.selectedExistingUser = 'Please select a user';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email, userType, selectedExistingUser]);

  // Dialog handlers
  const handleOpenDialog = useCallback(() => setOpenDialog(true), []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setUserType('new');
    setSelectedExistingUser('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setIsAdmin(false);
    setErrors({});
    setRegistrationLoading(false);
  }, []);

  // Confirmation dialog handlers
  const handleOpenConfirmDialog = useCallback((user) => {
    setConfirmDialog({
      open: true,
      user,
      loading: false
    });
  }, []);

  const handleCloseConfirmDialog = useCallback(() => {
    setConfirmDialog({
      open: false,
      user: null,
      loading: false
    });
  }, []);

  // Pagination handlers
  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // API calls
  const registerNewUser = useCallback(async () => {
    if (!validateForm()) return;

    setRegistrationLoading(true);
    let payload = {}; // Declare once

    if (userType === 'existing') {
      const selectedUser = props.availableUsers?.find(user => user.id === selectedExistingUser);
      if (selectedUser) {
        payload = {
          email: selectedUser.email,
          vaultGuid: props.vault.guid,
          isAdmin: selectedUser.is_admin
        };
      }
    } else {
      payload = {
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        vaultGuid: props.vault.guid,
        is_admin: isAdmin
      };
    }

    try {
      const response = await axios.post(
        `${constants.auth_api}/api/register/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${props.authTokens.access}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await props.viewvaultusers(props.vault.guid);

      props.setOpenAlert(true);
      props.setAlertSeverity("success");
      props.setAlertMsg("User registered successfully");

      handleCloseDialog();
      console.log('User registered successfully:', response.data);
    } catch (error) {
      props.setOpenAlert(true);
      props.setAlertSeverity("error");
      props.setAlertMsg(
        error.response?.data?.message || "Failed to register user. Please try again."
      );
      console.error('Registration failed:', error.response?.data || error.message);
    } finally {
      setRegistrationLoading(false);
    }
  }, [validateForm, userType, selectedExistingUser, props, email, firstName, lastName, isAdmin, handleCloseDialog]);

  const removeVaultUser = useCallback(async (user) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));

    const payload = {
      vaultGuid: props.vault.guid,
      emailAddress: user.email,
      organization_id: props.user.organizationid
    };

    try {
      const response = await axios.post(
        `${constants.auth_api}/api/remove-user-from-vault/`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${props.authTokens.access}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await props.viewvaultusers(props.vault.guid);

      props.setOpenAlert(true);
      props.setAlertSeverity("success");
      props.setAlertMsg(`${user.username || user.email} was removed successfully`);

      handleCloseConfirmDialog();
      console.log('User was detached successfully:', response.data);
    } catch (error) {
      props.setOpenAlert(true);
      props.setAlertSeverity("error");
      props.setAlertMsg(
        error.response?.data?.message ||
        "Failed to remove user. Please try again."
      );
      console.error('Failed to detach user:', error.response?.data || error.message);

      setConfirmDialog(prev => ({ ...prev, loading: false }));
    }
  }, [props, handleCloseConfirmDialog]);

  // Utility function
  const getUserInitials = useCallback((firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || '?';
  }, []);

  // Memoized sorted and paginated users
  const { sortedUsers, paginatedUsers } = useMemo(() => {
    const sorted = [...props.vaultUsers].sort((a, b) => {
      const usernameA = a.username || '';
      const usernameB = b.username || '';
      return usernameA.localeCompare(usernameB, undefined, { sensitivity: 'base' });
    });

    const paginated = sorted.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

    return { sortedUsers: sorted, paginatedUsers: paginated };
  }, [props.vaultUsers, page, rowsPerPage]);

  // Table headers
  const tableHeaders = useMemo(() =>
    ['Username', 'RepoID', 'Email', 'Full Name', 'Action'],
    []
  );

  return (
    <>
      <TimedAlert
        open={props.alertOpen}
        onClose={props.setOpenAlert}
        severity={props.alertSeverity}
        message={props.alertMsg}
        setSeverity={props.setAlertSeverity}
        setMessage={props.setAlertMsg}
      />

      {/* Add User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle
          className="p-2 d-flex justify-content-between align-items-center"
          style={{ backgroundColor: '#2757aa', color: '#fff', fontSize: '15px' }}
        >
          <img className="mx-3" src={logo} alt="Loading" width="180px" />
          <span className="ml-auto mx-3">
            <small className="mx-2">
              New user – <span style={{ color: '#fff' }}>{props.vault?.name} Vault</span>
            </small>
          </span>
        </DialogTitle>

        <DialogContent dividers>
          {/* User Type Selection */}
          <Box sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontSize: '14px', fontWeight: 600, color: '#2c3e50' }}>
              Select User Type
            </FormLabel>
            <RadioGroup
              row
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value);
                setErrors({});
                setSelectedExistingUser('');
              }}
              sx={{ mt: 1 }}
            >
              <FormControlLabel
                value="new"
                control={<Radio size="small" />}
                label="New User"
                disabled={registrationLoading}
              />
              <FormControlLabel
                value="existing"
                control={<Radio size="small" />}
                label="Existing User"
                disabled={registrationLoading}
              />
            </RadioGroup>
          </Box>

          {userType === 'existing' ? (
            // Existing User Selection
            <FormControl
              fullWidth
              size="small"
              error={!!errors.selectedExistingUser}
              disabled={registrationLoading}
            >
              <InputLabel>Select User</InputLabel>
              <Select
                value={selectedExistingUser}
                onChange={(e) => setSelectedExistingUser(e.target.value)}
                label="Select User"
              >
                {props.availableUsers?.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.username || `${user.first_name} ${user.last_name}`.trim()}
                        {user.is_admin && (
                          <Chip
                            label="Admin"
                            size="small"
                            sx={{
                              fontSize: '8px',
                              height: '14px',
                              backgroundColor: '#ffc107',
                              color: 'white',
                              ml: 1,
                            }}
                          />
                        )}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.selectedExistingUser && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                  {errors.selectedExistingUser}
                </Typography>
              )}
            </FormControl>
          ) : (
            // New User Form
            <>
              <TextField
                size="small"
                fullWidth
                margin="dense"
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                error={!!errors.firstName}
                helperText={errors.firstName}
                disabled={registrationLoading}
              />
              <TextField
                size="small"
                fullWidth
                margin="dense"
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                error={!!errors.lastName}
                helperText={errors.lastName}
                disabled={registrationLoading}
              />
              <TextField
                size="small"
                fullWidth
                margin="dense"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                error={!!errors.email}
                helperText={errors.email}
                disabled={registrationLoading}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    color="primary"
                    size="small"
                    disabled={registrationLoading}
                  />
                }
                label="Is Admin?"
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            disabled={registrationLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={registerNewUser}
            variant="contained"
            color="primary"
            disabled={registrationLoading}
            startIcon={registrationLoading ? <CircularProgress size={16} /> : null}
          >
            {registrationLoading ? 'Processing...' : (userType === 'existing' ? 'Add User' : 'Create User')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCloseConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 600 }}>
          Confirm User Removal
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to remove the following user from the vault?
          </Typography>
          {confirmDialog.user && (
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                User Details:
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {confirmDialog.user.username || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <strong>Email:</strong> {confirmDialog.user.email}
              </Typography>
              <Typography variant="body2">
                <strong>Full Name:</strong> {`${confirmDialog.user.first_name || ''} ${confirmDialog.user.last_name || ''}`.trim() || 'N/A'}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
            This action cannot be undone. The user will lose access to this vault.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDialog}
            color="inherit"
            disabled={confirmDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => removeVaultUser(confirmDialog.user)}
            color="error"
            variant="contained"
            disabled={confirmDialog.loading}
            startIcon={confirmDialog.loading ? <CircularProgress size={16} /> : null}
          >
            {confirmDialog.loading ? 'Removing...' : 'Remove User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Buttons */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          className="rounded-pill"
          variant="contained"
          color="success"
          onClick={props.syncUser}
          disabled={props.loading}
          startIcon={
            props.loading ? <CircularProgress size={14} color="inherit" /> : null
          }
          sx={{
            fontSize: '11px',
            textTransform: 'none',
            paddingX: 2,
            paddingY: 1,
            minWidth: 'auto',
          }}
        >
          Sync / Update Accounts
        </Button>

        {process.env.REACT_APP_ONSITE !== "true" && (
          <Button
            className="rounded-pill"
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            // disabled={props.loading}
            // startIcon={
            //   props.loading ? <CircularProgress size={14} color="inherit" /> : null
            // }
            sx={{
              fontSize: '11px',
              textTransform: 'none',
              px: 2,
              py: 1,
              minWidth: 'auto',
            }}
          >
            Add User to Vault
          </Button>
        )}
      </Box>

      {/* Table */}
      <TableContainer className="shadow-lg" sx={{ maxHeight: 400 }}>
        <Table stickyHeader className="table table-sm table-responsive p-2" aria-label="scrollable table">
          <TableHead className="bg-white">
            <TableRow>
              {tableHeaders.map((header) => (
                <TableCell
                  key={header}
                  align={header === 'Username' ? 'left' : 'center'}
                  sx={{
                    backgroundColor: '#ffffff !important',
                    borderBottom: '2px solid #e0e0e0',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    fontWeight: 600,
                    fontSize: '13px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    py: 1,
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow
                key={user.id}
                sx={{
                  '&:hover': { backgroundColor: '#f8f9fa' },
                  '&:nth-of-type(even)': { backgroundColor: '#fdfdfd' },
                }}
              >
                {/* Username */}
                <TableCell sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#2c3e50',
                        lineHeight: 1.2,
                      }}
                    >
                      {user.username || 'N/A'}
                      {user.is_admin && (
                        <Chip
                          label="Admin"
                          size="small"
                          sx={{
                            fontSize: '9px',
                            height: '16px',
                            backgroundColor: '#ffc107',
                            color: 'white',
                            fontWeight: 500,
                            ml: 1,
                          }}
                        />
                      )}
                    </Typography>
                  </Box>
                </TableCell>

                {/* RepoID */}
                <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                  {user.mfiles_id ? (
                    <Chip
                      label={user.mfiles_id}
                      size="small"
                      sx={{
                        fontSize: '10px',
                        height: '20px',
                        backgroundColor: '#e3f2fd',
                        color: '#2757aa',
                        fontWeight: 500,
                      }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: '11px', color: '#9e9e9e' }}>N/A</Typography>
                  )}
                </TableCell>

                {/* Email */}
                <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                  <Typography sx={{ fontSize: '13px', color: '#495057', fontWeight: 400, lineHeight: 1.2 }}>
                    {user.email}
                  </Typography>
                </TableCell>

                {/* Full Name */}
                <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                  <Typography sx={{ fontSize: '13px', color: '#495057', fontWeight: 400, lineHeight: 1.2 }}>
                    {`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'N/A'}
                  </Typography>
                </TableCell>

                {/* Action */}
                <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
                  <i
                    onClick={() => handleOpenConfirmDialog(user)}
                    className="fa-solid fa-trash text-danger"
                    style={{
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#fee'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    title={`Remove ${user.username || user.email} from vault`}
                  />
                </TableCell>
              </TableRow>
            ))}

            {paginatedUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#9e9e9e' }}>
                    <Avatar sx={{ width: 48, height: 48, backgroundColor: '#f0f0f0' }}>
                      <Typography sx={{ fontSize: '20px', color: '#ccc' }}>?</Typography>
                    </Avatar>
                    <Typography sx={{ fontSize: '12px' }}>No users found in this vault</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={sortedUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid #f0f0f0',
            backgroundColor: '#fafafa',
            '& .MuiTablePagination-toolbar': { fontSize: '11px' },
            '& .MuiTablePagination-selectLabel': { fontSize: '11px' },
            '& .MuiTablePagination-displayedRows': { fontSize: '11px' },
            '& .MuiTablePagination-select': { fontSize: '11px' },
          }}
        />
      </TableContainer>
    </>
  );
}

export default VaultUsersTable;