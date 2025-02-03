import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Button } from '@mui/material';
import axios from 'axios';
import * as constants from '../Auth/configs'
import logo from '../../images/ZFBLU.webp'

function PermissionDialog(props) {
    const [selectedPermission, setSelectedPermission] = useState(null);

    const handleItemClick = (permission) => {
        setSelectedPermission(permission);
    };

    const handleDeletePermission = async () => {

        if (!selectedPermission) return;

        let data = JSON.stringify({
            "permission_id": `${selectedPermission.id}`
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/permissions-delete/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setSelectedPermission(null);
                props.fetchObjectPermisions(props.selectedObject);
            })
            .catch((error) => {
                console.log(error);
            });

    };

    const handleClose = () => {
        props.close();
        setSelectedPermission(null);
    };

    const handleCheckboxChange = (event) => {

        const { name, checked } = event.target;
    
        setSelectedPermission(prevPermission => ({
            ...prevPermission,
            [name]: checked
        }));
        props.fetchObjectPermisions(props.selectedObject)

        let data = JSON.stringify({
          "id": selectedPermission.id,
          "field": `${name}`,
          "value": checked
        });
        
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${constants.auth_api}/api/update-permission/`,
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
        

    
    };

    return (
        <div>
            <Dialog open={props.open} maxWidth="md">
                <DialogTitle className="p-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#bfc0c0', color: '#1C4690', fontSize: '15px'}}>
                <img className="mx-3" src={logo} alt="Loading" width="130px" />
                    <span className="ml-auto mx-3" style={{fontSize:'13px'}}> {props.selectedObject.name_singular} Object Permissions <i className="fas fa-shield-alt mx-1" style={{ fontSize: '13px', cursor: 'pointer' }}></i></span>
                </DialogTitle>

        
                <DialogContent style={{ width: '500px' }}>
                    <div className="row p-2 shadow-lg">
                        {props.permissions.length > 0 ? <p className="shadow-lg p-2">Users and user groups</p> : <></>}
                       
                        <div className="col-md-4 col-sm-12 ">
                            {selectedPermission && (
                                <>
                                    <FormControlLabel
                                        control={<Checkbox checked={selectedPermission.can_view} onChange={handleCheckboxChange} name="can_view" />}
                                        label={<> View </>}
                                        labelPlacement="end"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={selectedPermission.can_edit} onChange={handleCheckboxChange} name="can_edit" />}
                                        label={<> Edit </>}
                                        labelPlacement="end"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={selectedPermission.can_delete} onChange={handleCheckboxChange} name="can_delete" />}
                                        label={<> Delete </>}
                                        labelPlacement="end"
                                    />
                                </>
                            )}
                        </div>
                        <div className="col-md-8 col-sm-12">
                            {props.permissions.length === 0 ? (
                                <div>No Permissions</div>
                            ) : (
                                <div style={{ height: '220px', overflowY: 'scroll' }}>
                                    {props.permissions.map(permission => (
                                        <Button
                                            style={{ textTransform: 'none', width: '100%' }}
                                            className="my-1"
                                            size="small"
                                            variant={selectedPermission && selectedPermission.id === permission.id ? "contained" : "outlined"}
                                            key={permission.id}
                                            onClick={() => handleItemClick(permission)}
                                            color="primary"
                                        >
                                            <small>{permission.name}</small>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-3 shadow-lg text-center">
                        <Button
                            style={{ textTransform: 'none' }}
                            variant="contained"
                            className="mx-2"
                            size="small"
                            color="primary"
                            onClick={() => props.handleAddPermission(props.selectedVault, props.selectedObject.object_id)}
                        >
                            Add Permission
                        </Button>
                        {selectedPermission && (
                            <Button
                                style={{ textTransform: 'none' }}
                                size="small"
                                onClick={handleDeletePermission}
                                color="error"
                                variant="contained"
                            >
                                Remove
                            </Button>
                        )}
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

export default PermissionDialog;
