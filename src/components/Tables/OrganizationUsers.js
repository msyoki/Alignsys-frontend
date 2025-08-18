import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination,Box,Typography,Chip,Avatar } from '@mui/material';

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
<TableContainer
  className='shadow-lg'
  sx={{
    maxHeight: 450,
    minHeight: 450,
    overflowY: 'auto'
  }}
>
  <Table stickyHeader className='table table-sm table-responsive p-2'>
    <TableHead>
      <TableRow>
        {['ID', 'Username', 'Email', 'First Name', 'Last Name'].map((header) => (
          <TableCell
            key={header}
            align="center"
            sx={{
              backgroundColor: '#ffffff !important',
              borderBottom: '2px solid #e0e0e0',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              py: 1
            }}
          >
            {header}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>

    <TableBody>
      {props.users.map((user) => (
        <TableRow
          key={user.id}
          sx={{
            '&:hover': { backgroundColor: '#f8f9fa' },
            '&:nth-of-type(even)': { backgroundColor: '#fdfdfd' }
          }}
        >
          <TableCell sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
            <Chip
              label={user.id}
              size="small"
              sx={{
                fontSize: '10px',
                height: '20px',
                backgroundColor: '#e8f5e8',
                color: '#2e7d32',
                fontWeight: 500
              }}
            />
          </TableCell>

          <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#2c3e50', lineHeight: 1.2 }}>
              {user.username || 'N/A'}
            </Typography>
          </TableCell>

          <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
            <Typography sx={{ fontSize: '13px', color: '#495057', fontWeight: 400, lineHeight: 1.2 }}>
              {user.email || 'N/A'}
            </Typography>
          </TableCell>

          <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
            <Typography sx={{ fontSize: '13px', color: '#495057', fontWeight: 400, lineHeight: 1.2 }}>
              {user.first_name || 'N/A'}
            </Typography>
          </TableCell>

          <TableCell align="center" sx={{ fontSize: '13px', py: 0.5, borderBottom: '1px solid #f5f5f5' }}>
            <Typography sx={{ fontSize: '13px', color: '#495057', fontWeight: 400, lineHeight: 1.2 }}>
              {user.last_name || 'N/A'}
            </Typography>
          </TableCell>
        </TableRow>
      ))}

      {props.users.length === 0 && (
        <TableRow>
          <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: '#9e9e9e' }}>
              <Avatar sx={{ width: 48, height: 48, backgroundColor: '#f0f0f0' }}>
                <Typography sx={{ fontSize: '20px', color: '#ccc' }}>👤</Typography>
              </Avatar>
              <Typography sx={{ fontSize: '12px' }}>No users found</Typography>
            </Box>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>

  <TablePagination
    rowsPerPageOptions={[10, 25, 50]}
    component="div"
    count={totalUsers}
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
      '& .MuiTablePagination-select': { fontSize: '11px' }
    }}
  />
</TableContainer>


    </div>
  );
}

export default OrganizationUsersTable;
