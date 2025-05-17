import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, Button, TextField
} from '@mui/material';
import * as constants from './Auth/configs';

function LoginActivityTable() {
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
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const allLogs = response.data.activity;
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
        <Paper className="p-2">
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
                    className="rounded-pill"
                    style={{
                        fontSize: '12.5px',
                        color: '#fff',
                        backgroundColor: '#2757aa',
                        padding: '10px 16px',
                        textTransform: 'none',
                    }}
                    variant="contained"
                >
                    Filter
                </Button>
            </div>


            <TableContainer style={{ maxHeight: 325, overflowX: 'auto' }}>
                <Table stickyHeader className='table table-sm table-responsive'>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">User</TableCell>
                            <TableCell align="center">Timestamp</TableCell>
                            <TableCell align="center">IP Address</TableCell>
                            {/* <TableCell align="center">Auth Source</TableCell> */}
                            <TableCell align="center">Device Type</TableCell>
                            <TableCell align="center">Browser</TableCell>
                            <TableCell align="center">OS</TableCell>
                            {/* <TableCell align="center">Platform</TableCell> */}
                            {/* <TableCell align="center">User Agent</TableCell> */}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedLogs.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell align="center">{getUsernameFromEmail(log.user)}</TableCell>
                                <TableCell align="center">{log.timestamp}</TableCell>
                                <TableCell align="center">{log.ip_address}</TableCell>
                                {/* <TableCell align="center">{log.auth_source}</TableCell> */}
                                <TableCell align="center">{log.device_type || '-'}</TableCell>
                                <TableCell align="center">{log.browser || '-'}</TableCell>
                                <TableCell align="center">{log.os || '-'}</TableCell>
                                {/* <TableCell align="center">{log.platform || '-'}</TableCell> */}
                                {/* <TableCell align="center">
                                    <span style={{ wordBreak: 'break-word', maxWidth: 200, display: 'inline-block' }}>
                                        {log.user_agent || '-'}
                                    </span>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

export default LoginActivityTable;
