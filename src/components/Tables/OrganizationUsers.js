import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';

function OrganizationUsersTable(props) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Set your default rows per page
  const [totalUsers, setTotalUsers] = useState(0); // Total number of users for pagination

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);  // Reset to first page when rows per page changes
  };

  return (
    <div>
      <TableContainer component={Paper} className='p-2' style={{ overflowY: 'auto' }}>
        <Table stickyHeader className='table table-sm table-responsive'>
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Username</TableCell>
              <TableCell align="center">Email</TableCell>
              <TableCell align="center">First Name</TableCell>
              <TableCell align="center">Last Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell align="center">{user.username}</TableCell>
                <TableCell align="center">{user.email}</TableCell>
                <TableCell align="center">{user.first_name}</TableCell>
                <TableCell align="center">{user.last_name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}  // Options for rows per page
        component="div"
        count={totalUsers}  // Total number of users for pagination
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      </TableContainer>

    </div>
  );
}

export default OrganizationUsersTable;
