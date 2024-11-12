import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import axios from 'axios';

function AddPermissionDialog(props) {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedGroups, setSelectedGroups] = useState([]);

    const handleClose = () => {
        props.close();
    };

    const handleUserChange = (event) => {
        const value = event.target.value.toString();
        setSelectedUsers(prevSelected => {
            if (prevSelected.includes(value)) {
                return prevSelected.filter(item => item !== value);
            } else {
                return [...prevSelected, value];
            }
        });
    };

    const handleGroupChange = (event) => {
        const value = event.target.value.toString();
        setSelectedGroups(prevSelected => {
            if (prevSelected.includes(value)) {
                return prevSelected.filter(item => item !== value);
            } else {
                return [...prevSelected, value];
            }
        });
    };

    const handleSubmit = () => {
        // Construct payload
        const payload = {
            vault_guid:props.selectedVault,
            object_id:props.selectedObject.object_id,
            selectedUsers: selectedUsers,
            selectedGroups: selectedGroups
        };

        console.log(payload)

        // Make POST request to API endpoint
        axios.post('http://192.236.194.251:8000/api/create-vault-object-permissions/', payload)
            .then(response => {
                // Handle success
                props.fetchObjectPermisions(props.selectedObject);
                setSelectedUsers([])
                setSelectedGroups([])
                props.close()
                console.log('Data posted successfully:', response.data);
            })
            .catch(error => {
                // Handle error
                console.error('Error posting data:', error);
            });
    };

    return (
        <div>
            <Dialog open={props.open} maxWidth="md">
                <DialogTitle className="p-2 d-flex align-items-center" style={{ backgroundColor: '#1d3557', color: '#fff' }}>
                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span className='mx-2' style={{fontSize:'13px'}}>Select Users or user groups <i className="fas fa-users mx-1" style={{ fontSize: '13px', cursor: 'pointer' }}></i></span>
                </DialogTitle>
                <DialogContent style={{ width: '500px' }}>
                    <div className="row">
                    <p className="shadow-lg p-2">User and user groups</p>
                        <div style={{ height: '220px', overflowY: 'scroll' }}>
                            <FormGroup>
                                {props.listwithoughtpermissions.users && props.listwithoughtpermissions.users.length > 0 && (
                                    <React.Fragment>
                                      
                                        {props.listwithoughtpermissions.users.map(user => (
                                            <FormControlLabel
                                                key={user.id}
                                                control={<Checkbox checked={selectedUsers.includes(user.id.toString())} onChange={handleUserChange} value={user.id.toString()} />}
                                                label={user.name}
                                            />
                                        ))}
                                    </React.Fragment>
                                )}
                                {props.listwithoughtpermissions.user_groups && props.listwithoughtpermissions.user_groups.length > 0 && (
                                    <React.Fragment>
                                       
                                        {props.listwithoughtpermissions.user_groups.map(group => (
                                            <FormControlLabel
                                                key={group.id}
                                                control={<Checkbox checked={selectedGroups.includes(group.id.toString())} onChange={handleGroupChange} value={group.id.toString()} />}
                                                label={group.title}
                                            />
                                        ))}
                                    </React.Fragment>
                                )}
                            </FormGroup>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AddPermissionDialog;
