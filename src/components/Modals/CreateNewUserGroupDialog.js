import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import axios from 'axios';
import * as contants from '../Auth/configs';

function CreateNewUserGroupDialog(props) {
    const [groupTitle, setGroupTitle] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleClose = () => {
        props.close();
    };

    const handleGroupCreation = () => {
        const data = {
            title: groupTitle,
            users: selectedUsers
        };

        axios.post(`${contants.auth_api}/api/groups/create/`, data)
            .then((response) => {
                console.log('Group created', response.data);
                props.onGroupCreated(); // Trigger any callback needed
            })
            .catch((error) => {
                console.log('Error creating group', error);
            });
    };

    const handleUserSelection = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedUsers(selected);
    };

    useEffect(() => {
        // Fetch available users when the component loads
        let data = JSON.stringify({
            "vault_id": props.selectedVault
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${contants.auth_api}/api/vault/users/`,
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
        };

        axios.request(config)
        .then((response) => {
          console.log(JSON.stringify(response.data));
          setUsers(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
          
       
    }, []);


    let data = JSON.stringify({
        "vault_id": "{E19BECA0-7542-451B-81E5-4CADB636FCD5}"
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'localhost:8000/api/vault/users/',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    return (
        <Dialog open={props.open} maxWidth="md">
            <DialogTitle>Create a New Group</DialogTitle>
            <DialogContent>
                <TextField
                    label="Group Title"
                    fullWidth
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                />
                <div className="mt-3">
                    <label htmlFor="usersSelect">Add Users</label>
                    <select
                        id="usersSelect"
                        className="form-control"
                        multiple
                        value={selectedUsers}
                        onChange={handleUserSelection}
                    >
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {`${user.first_name} ${user.last_name}`}
                            </option>
                        ))}
                    </select>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
                <Button onClick={handleGroupCreation} color="primary">
                    Create Group
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CreateNewUserGroupDialog;
