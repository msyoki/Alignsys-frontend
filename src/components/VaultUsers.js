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
      <AddUserToVault selectedVault={props.vault} viewvaultusers={props.viewvaultusers} usersnotlinkedtovault={props.usersnotlinkedtovault} fetchUsersNotLinkedToVault={ props.fetchUsersNotLinkedToVault} />

      <TableContainer component={Paper} className='p-2'>
        <Table className='table table-sm'>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Admin</TableCell>
              {/* <TableCell>Organization</TableCell> */}
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.vaultUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.first_name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.is_staff ? 'Yes' : 'No'}</TableCell>
                <TableCell>{user.is_active ? 'Yes' : 'No'}</TableCell>
                <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                {/* <TableCell>{user.organization}</TableCell> */}
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => handleDetach(user.id)}
                  >
                    <small>Detach</small> 
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
