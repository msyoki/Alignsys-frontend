import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import AddUserToVault from './AddUserToVault';
import * as constants from './Auth/configs'


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

    } catch (error) {
      console.error('Error detaching user from vault:', error);
    }
  };




  return (
    <>

      <Button className='my-2' variant="contained" color="primary" onClick={props.syncUser}>
        <span style={{ fontSize: '12px' }}>Sync Vault Users</span>
      </Button>
      <AddUserToVault
        selectedVault={props.vault}
        viewvaultusers={props.viewvaultusers}
        usersnotlinkedtovault={props.usersnotlinkedtovault}
        fetchUsersNotLinkedToVault={props.fetchUsersNotLinkedToVault}
      />

      <TableContainer component={Paper}  style={{ height: '250px', overflowY: 'auto', fontSize:'8px' }}>
        <Table className='table table-sm table-responsive'>
          <TableHead>
            <TableRow>
              <TableCell style={{ textAlign: 'center' }}>ID (M-Files)</TableCell>
              {/* <TableCell>Username</TableCell> */}
              <TableCell style={{ textAlign: 'center' }}>Email</TableCell>
              <TableCell style={{ textAlign: 'center' }}>FName</TableCell>
              <TableCell style={{ textAlign: 'center' }}>LName</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Active</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Admin</TableCell>
              <TableCell style={{ textAlign: 'center' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.vaultUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell style={{ textAlign: 'center' }}>{user.mfiles_id}</TableCell>
                {/* <TableCell>{user.username}</TableCell> */}
                <TableCell style={{ textAlign: 'center' }}>{user.email}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.first_name}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.last_name}</TableCell>
                {/* <TableCell>{user.is_staff ? 'Yes' : 'No'}</TableCell> */}
                <TableCell style={{ textAlign: 'center' }}>{user.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell style={{ textAlign: 'center' }}>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                {/* <TableCell>{user.organization}</TableCell> */}
                <TableCell style={{ textAlign: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => handleDetach(user.id)}
                  >
                    <small><i className='fas fa-unlink mx-2'></i>Detach</small>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </>
  );
}

export default VaultUsersTable;
