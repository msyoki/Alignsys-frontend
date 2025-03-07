import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function OrganizationUsersTable(props) {

  return (
    <TableContainer component={Paper} className='p-2' style={{ height: '300px', overflowY: 'auto' }}>
      <Table className='table table-sm table-responsive'>
        <TableHead>
          <TableRow>
            {/* <TableCell>ID</TableCell> */}
            <TableCell align="center">ID</TableCell>
            <TableCell align="center">Username</TableCell>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">First Name</TableCell>
            <TableCell align="center">Last Name</TableCell>
            {/* <TableCell align="center">Active</TableCell>
            <TableCell align="center">Admin</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              {/* <TableCell align="center">{user.mfiles_id}</TableCell> */}
              <TableCell align="center">{user.username}</TableCell>
              <TableCell align="center">
                {user.email}
              </TableCell>
              <TableCell align="center">{user.first_name} </TableCell>
              <TableCell align="center">{user.last_name}</TableCell>
              {/* <TableCell align="center">{user.is_active ? 'Yes' : 'No'}</TableCell>
              <TableCell align="center">{user.is_admin ? 'Yes' : 'No'}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

  );
}

export default OrganizationUsersTable;
