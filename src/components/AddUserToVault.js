import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';

const AddUserToVault = (props) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {

            const response = await axios.post('http://localhost:8000/api/users-not-linked-to-vault/', { vault_id: props.selectedVault.guid });
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    const handleSelectChange = async (event) => {
        const userId = event.target.value;
        setSelectedUser(userId);

        try {
            await axios.post('http://localhost:8000/api/assign-vault/', { user_id: userId, vault_id: props.selectedVault.guid });
            // Remove selected user from the list
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            props.viewvaultusers(props.selectedVault.guid)
        } catch (error) {
            console.error('Error posting user ID:', error);
        }
    };
    useEffect(() => {
        // Fetch the list of users


        fetchUsers();
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <FormControl fullWidth>
            <InputLabel id="user-select-label">Add User</InputLabel>
            <Select
                labelId="user-select-label"
                id="user-select"
                value={selectedUser}
                onChange={handleSelectChange}
                label="Select User"
            >

                {users.length === 0 ? (
                    <MenuItem disabled>All users have access</MenuItem>
                ) : (
                    users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.first_name} {user.last_name} <small className='mx-2'> ( {user.email} )</small>
                        </MenuItem>
                    ))
                )}
            </Select>
        </FormControl>
    );
};

export default AddUserToVault;
