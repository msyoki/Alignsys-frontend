import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function VaultUsersTable(props) {
  const [users, setUsers] = useState([]);

  useEffect(() => {

  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Staff</TableCell>
            <TableCell>Active</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>Organization</TableCell>
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
              <TableCell>{user.organization}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default VaultUsersTable;
