import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import AddUserToVault from './AddUserToVault';
import * as constants from './Auth/configs'
import LoadingMini from './Loaders/LoaderMini';
import TimedAlert from './TimedAlert';
import CircularProgress from '@mui/material/CircularProgress';

function VaultUsersTable(props) {


  const handleDetach = async (userId) => {

    try {
      // Call the API to detach the user from the vault
      await axios.post(`${constants.auth_api}/api/detach-user-from-vault/`, {
        user_id: userId,
        vault_id: props.vault.guid
      });

      // Refresh the list of users (this can be replaced with a call to fetch updated data)
      props.fetchUsersNotLinkedToVault(props.vault.guid)
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

        <Button className='my-2' variant="contained" color="primary" onClick={props.syncUser}>
          <span style={{ fontSize: '11px' }}>Sync {props.vault.name} Vault Users</span> {props.loading?<span className='mx-2'><CircularProgress size="15px" color="inherit"  /></span>:<></>}
        </Button>
      

        <TableContainer component={Paper} style={{ height: '60%', overflowY: 'auto', fontSize: '5px' }}>
          <Table className='table table-sm table-responsive p-2' style={{ fontSize: '5px' }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ textAlign: 'center' }}>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell style={{ textAlign: 'center' }}>Email</TableCell>
                {/* <TableCell style={{ textAlign: 'center' }}>Username</TableCell> */}
                <TableCell style={{ textAlign: 'center' }}>Full Name</TableCell>
                {/* <TableCell style={{ textAlign: 'center' }}>LName</TableCell> */}
                {/* <TableCell style={{ textAlign: 'center' }}>Active</TableCell> */}
                {/* <TableCell style={{ textAlign: 'center' }}>Admin</TableCell> */}
                {/* <TableCell style={{ textAlign: 'center' }}>Action</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.vaultUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell style={{ textAlign: 'center' }}>{user.mfiles_id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{user.email}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>{user.first_name} {user.last_name}</TableCell>
                  {/* <TableCell style={{ textAlign: 'center' }}>{user.last_name}</TableCell> */}
                  {/* <TableCell>{user.is_staff ? 'Yes' : 'No'}</TableCell> */}
                  {/* <TableCell style={{ textAlign: 'center' }}>{user.is_active ? 'Yes' : 'No'}</TableCell> */}
                  {/* <TableCell style={{ textAlign: 'center' }}>{user.is_admin ? 'Yes' : 'No'}</TableCell> */}
                  {/* <TableCell>{user.organization}</TableCell> */}
                  {/* <TableCell style={{ textAlign: 'center' }}>
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
        </TableContainer>

        {/* <AddUserToVault
          selectedVault={props.vault}
          viewvaultusers={props.viewvaultusers}
          usersnotlinkedtovault={props.usersnotlinkedtovault}
          fetchUsersNotLinkedToVault={props.fetchUsersNotLinkedToVault}
        /> */}
  


    </>
  );
}

export default VaultUsersTable;
