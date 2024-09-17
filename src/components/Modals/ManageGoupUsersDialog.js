import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import axios from 'axios';
import * as contants from '../Auth/configs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function GroupUsersDialog(props) {
    const [usersNotLinkedToGroup, setUsersNotLinkedToGroup] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [groupUsers, setGroupUsers] = useState(props.selectedGroup.users || []); // Local state for users

    const handleClose = () => {
        props.close();
    };

    // Fetch users not linked to the group when the component loads
    useEffect(() => {
        if (props.selectedVault && props.selectedGroup.id) {
            getUsersNotLinkedToGroup();
            setGroupUsers(props.selectedGroup.users); // Sync local state with props on load
        }
    }, [props.selectedVault, props.selectedGroup]);

    // Fetch users not linked to the group
    const getUsersNotLinkedToGroup = () => {
        let data = JSON.stringify({
            "vault_id": `${props.selectedVault}`,
            "group_id": `${props.selectedGroup.id}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${contants.auth_api}/api/users-linked-to-vault-not-in-group/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setUsersNotLinkedToGroup(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // Handle adding a user to the group
    const addUserToGroup = (userId) => {

        if (!userId) return;

        // Find the user to be added
        const userToAdd = usersNotLinkedToGroup.find(user => user.id === parseInt(userId, 10));

        if (!userToAdd) {
            console.error("User not found");
            return; // Exit if user is not found
        }

        let data = JSON.stringify({
            "user_id": userId,
            "group_id": `${props.selectedGroup.id}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${contants.auth_api}/api/add-user-to-group/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then(() => {
                const newSelectedGroup = [...groupUsers, userToAdd];
                setGroupUsers(newSelectedGroup); // Update local state

                getUsersNotLinkedToGroup(); // Refresh users not linked to the group
            })
            .catch((error) => {
                console.log(error);
            });
    };

    // Handle removing a user from the group
    const removeUserFromGroup = (userId) => {
        let data = JSON.stringify({
            "user_id": userId,
            "group_id": `${props.selectedGroup.id}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${contants.auth_api}/api/remove-user-from-group/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then(() => {
                const newSelectedGroup = groupUsers.filter(item => item.id !== userId);
                setGroupUsers(newSelectedGroup); // Update local state

                getUsersNotLinkedToGroup(); // Refresh users not linked to the group
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <Dialog open={props.open} maxWidth="md">
                <DialogTitle className="p-2 d-flex align-items-center" style={{ backgroundColor: '#2a68af', color: '#fff' }}>
                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span className='mx-2'> Edit: <b>{props.selectedGroup.title}</b>  </span>
                </DialogTitle>
                <DialogContent style={{ width: '500px' }}>
                    <div className="row">

                        {/* Select dropdown for users not linked to the group */}
                        <div className="mt-3">
                            <label htmlFor="usersNotLinked">Add Users (Not Linked to Group)</label>
                            <select
                                id="usersNotLinked"
                                className="form-control"
                                value={selectedUser}
                                onChange={(e) => {
                                    const userId = e.target.value;
                                    setSelectedUser(userId);
                                    addUserToGroup(userId); // Automatically add user when selected
                                }}
                            >
                                <option value="">Select a user</option>
                                {usersNotLinkedToGroup.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ height: '220px', overflowY: 'scroll' }} className="mt-3">
                            <h6>Users Linked to :  <b>{props.selectedGroup.title}</b> </h6>
                            <ul>
                                {groupUsers && groupUsers.map(user => (
                                    user ? (
                                        <div key={user.id} className="d-flex justify-content-between align-items-center">
                                            {/* <span>{`${user.first_name} ${user.last_name}`}</span> */}
                                       
                                                    <Button
                                              
                                                        size="small"
                                                        variant={"outlined"}
                                                     
                                                       
                                                        color="primary"
                                                        className='my-1'
                                                    >
                                                        <small>{`${user.first_name} ${user.last_name}`} </small> 
                                                    </Button>
                                                    <FontAwesomeIcon
                                                icon={faTrash}
                                                className='mx-4'
                                                style={{ cursor: 'pointer', color: 'red' }}
                                                onClick={() => removeUserFromGroup(user.id)}
                                            />
                                    
                                         
                                           
                                        </div>
                                        
                                    ) : null
                                ))}

                            </ul>
                        </div>

                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default GroupUsersDialog;
