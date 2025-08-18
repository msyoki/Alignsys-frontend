import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, Button, TextField, Typography, Avatar, Chip, Box
} from '@mui/material';
import * as constants from './Auth/configs';


const cellStyle = {
    fontSize: '13px',
    py: 0.5,
    borderBottom: '1px solid #f5f5f5'
};

const typographyStyle = {
    fontSize: '13px',
    color: '#495057',
    fontWeight: 400,
    lineHeight: 1.2
};

function LoginActivityTable(props) {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalLogs, setTotalLogs] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');



    const fetchLogs = async () => {
        const storedTokens = JSON.parse(sessionStorage.getItem('authTokens'));
        const accessToken = storedTokens?.access;

        const response = await axios.post(`${constants.auth_api}/api/login-activity/`, {
            start_date: startDate,
            end_date: endDate,
            organization_id: props.user?.organizationid || null
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const allLogs = response.data.activity;
        console.log(allLogs)
        setLogs(allLogs);
        setFilteredLogs(applySearch(allLogs, searchTerm));
        setTotalLogs(allLogs.length);
    };

    const applySearch = (data, term) => {
        if (!term) return data;
        return data.filter(log =>
            log.user.toLowerCase().includes(term.toLowerCase())
        );
    };

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setFilteredLogs(applySearch(logs, term));
        setPage(0); // reset pagination
    };

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const paginatedLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    function getUsernameFromEmail(email) {
        if (!email || typeof email !== 'string') return '';
        return email.split('@')[0];
    }

    return (
        <div className="p-1">
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <div className="d-flex gap-2">
                    <input
                        className="form-control form-control-sm"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        style={{ minWidth: '150px' }}
                    />
                    <input
                        className="form-control form-control-sm"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        style={{ minWidth: '150px' }}
                    />
                </div>

                <TextField
                    size="small"
                    label="Search by user"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ minWidth: '200px' }}
                    className="mx-2"
                />
              

                <Button
                    onClick={fetchLogs}
                    variant="contained"
                    color="primary"
                    className="mx-2"
                    sx={{
                        fontSize: '11px',
                        textTransform: 'none',
                        py: 1,
                        px:2


                    }}
                 
                >
                    <i class="fa-solid fa-filter"></i><span className='mx-2'>Filter</span>
                </Button>
            </div>

            <TableContainer className="shadow-lg" sx={{ maxHeight: 450, minHeight: 450 }}>
                <Table stickyHeader className="table table-sm table-responsive p-2">
                    <TableHead className="bg-white">
                        <TableRow>
                            {['User', 'Timestamp', 'IP Address', 'Device Type', 'Browser'].map((label, idx) => (
                                <TableCell
                                    key={idx}
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
                                    {label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                </Table>

                {/* Scrollable Table Body */}
                <Box
                    sx={{
                        maxHeight: '55vh', // 👈 you can adjust height here
                        overflowY: 'auto',
                        borderTop: '1px solid #f0f0f0'
                    }}
                >
                    <Table>
                        <TableBody>
                            {paginatedLogs.map((log, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:hover': { backgroundColor: '#f8f9fa' },
                                        '&:nth-of-type(even)': { backgroundColor: '#fdfdfd' }
                                    }}
                                >
                                    <TableCell align="center" sx={cellStyle}>
                                        <Typography sx={typographyStyle}>{log.user || 'N/A'}</Typography>
                                    </TableCell>

                                    <TableCell align="center" sx={cellStyle}>
                                        <Typography sx={typographyStyle}>{log.timestamp || 'N/A'}</Typography>
                                    </TableCell>

                                    <TableCell align="center" sx={cellStyle}>
                                        <Typography sx={typographyStyle}>{log.ip_address || 'N/A'}</Typography>
                                    </TableCell>

                                    <TableCell align="center" sx={cellStyle}>
                                        {log.device_type ? (
                                            <Chip
                                                label={log.device_type}
                                                size="small"
                                                sx={{
                                                    fontSize: '10px',
                                                    height: '20px',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#2757aa',
                                                    fontWeight: 500
                                                }}
                                            />
                                        ) : (
                                            <Typography sx={{ fontSize: '11px', color: '#9e9e9e' }}>N/A</Typography>
                                        )}
                                    </TableCell>

                                    <TableCell align="center" sx={cellStyle}>
                                        <Typography sx={typographyStyle}>{log.browser || 'N/A'}</Typography>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {paginatedLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: '#9e9e9e'
                                            }}
                                        >
                                            <Avatar sx={{ width: 48, height: 48, backgroundColor: '#f0f0f0' }}>
                                                <Typography sx={{ fontSize: '20px', color: '#ccc' }}>?</Typography>
                                            </Avatar>
                                            <Typography sx={{ fontSize: '12px' }}>No logs found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredLogs.length}
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

export default LoginActivityTable;
