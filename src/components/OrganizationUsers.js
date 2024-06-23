import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function OrganizationUsersTable(props) {

  return (
    <TableContainer component={Paper} className='p-2'>
      <Table className='table table-sm'>
        <TableHead>
          <TableRow>
            {/* <TableCell>ID</TableCell> */}
            <TableCell>Email</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            {/* <TableCell>Staff</TableCell> */}
            <TableCell>Active</TableCell>
            <TableCell>Admin</TableCell>
            {/* <TableCell>Organization</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.users.map((user) => (
            <TableRow key={user.id}>
              {/* <TableCell>{user.id}</TableCell> */}
              <TableCell> <i className='fas fa-user mx-2' style={{color:'#2a68af'}}></i>{user.email}</TableCell>
              <TableCell>{user.first_name}</TableCell>
              <TableCell>{user.last_name}</TableCell>
              {/* <TableCell>{user.is_staff ? 'Yes' : 'No'}</TableCell> */}
              <TableCell>{user.is_active ? 'Yes' : 'No'}</TableCell>
              <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
              {/* <TableCell>{user.organization}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OrganizationUsersTable;
