import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs'


const AddUserToVault = (props) => {
    
    const [selectedUser, setSelectedUser] = useState(null);
 

    const handleSelectChange = async (selectedOption) => {
        const userId = selectedOption.value;
        setSelectedUser(selectedOption);

        try {
            await axios.post(`${constants.auth_api}/api/assign-vault/`, { user_id: userId, vault_id: props.selectedVault.guid });
            // Remove selected user from the list
            props.fetchUsersNotLinkedToVault(props.selectedVault.guid);
            props.viewvaultusers(props.selectedVault.guid)
        } catch (error) {
            console.error('Error posting user ID:', error);
        }
    };

    useEffect(() => {
        // Fetch the list of users
        props.fetchUsersNotLinkedToVault(props.selectedVault.guid);
    }, []);

    if (props.loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            <label >Select to add new login account</label>
            <Select
                openMenuOnFocus={props.fetchUsers}
                value={selectedUser}
                onChange={handleSelectChange}
                options={props.usersnotlinkedtovault}
                placeholder="Select an account"
                className='my-2'
            />
        </div>
    );
};

export default AddUserToVault;
