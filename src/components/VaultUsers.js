import React, { useState } from 'react';
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
  CircularProgress
} from '@mui/material';

import TimedAlert from './TimedAlert';
import * as constants from './Auth/configs';
import axios from 'axios';

function VaultUsersTable(props) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDetach = async (userId) => {
    try {
      await axios.post(`${constants.auth_api}/api/detach-user-from-vault/`, {
        user_id: userId,
        vault_id: props.vault.guid
      });

      props.fetchUsersNotLinkedToVault(props.vault.guid);
      props.viewvaultusers(props.vault.guid);

      props.setOpenAlert(true);
      props.setAlertSeverity("success");
      props.setAlertMsg("Detached successfully");
    } catch (error) {
      props.setOpenAlert(true);
      props.setAlertSeverity("error");
      props.setAlertMsg("Failed to detach, please try later");
      console.error('Error detaching user from vault:', error);
    }
  };

  const paginatedUsers = props.vaultUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
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

      <Button
        className='my-2'
        variant="contained"
        color="primary"
        onClick={props.syncUser}
      >
        <span style={{ fontSize: '11px' }}>
          Sync {props.vault.name} Vault Users
        </span>
        {props.loading && (
          <span className='mx-2'>
            <CircularProgress size="15px" color="inherit" />
          </span>
        )}
      </Button>

      <TableContainer component={Paper} style={{ height: '70vh', overflowY: 'auto' }}>
        <Table stickyHeader className='table table-sm table-responsive p-2'>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">Full Name</TableCell>
              {/* <TableCell align="center">Action</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell align="center">{user.mfiles_id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.first_name} {user.last_name}</TableCell>
                {/* <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => handleDetach(user.id)}
                  >
                    <small><i className='fas fa-unlink mx-2'></i>Detach</small>
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={props.vaultUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </TableContainer>

     
    </>
  );
}

export default VaultUsersTable;
