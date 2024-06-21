import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Button } from '@mui/material';
import axios from 'axios';

function PermissionDialog(props) {
    const [selectedPermission, setSelectedPermission] = useState(null);

    const handleItemClick = (permission) => {
        setSelectedPermission(permission);
    };

    const handleDeletePermission =async () => {
     
        if (!selectedPermission) return;

        let data = JSON.stringify({
            "permission_id": `${selectedPermission.id}`
          });
          
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'http://192.236.194.251:8000/api/permissions-delete/',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : data
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
    };

    return (
        <div>
            <Dialog open={props.open} maxWidth="md">
                <DialogTitle className="p-2 d-flex align-items-center" style={{ backgroundColor: '#2a68af', color: '#fff' }}>
                    <h5 className="text-center mx-2"><b style={{ color: "#ee6c4d" }}>Z</b>F</h5>
                    <span>Permissions</span>
                </DialogTitle>
                <DialogContent style={{ width: '500px' }}>
                    <div className="row p-2 shadow-lg">
                        {props.permissions.length > 0?<p className="shadow-lg p-2">Users and user groups</p>:<></>}
                        <div className="col-md-6 col-sm-12">
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
                        <div className="col-md-6 col-sm-12">
                            {selectedPermission && (
                                <div>
                                    <FormControlLabel
                                        control={<Checkbox checked={selectedPermission.can_view} onChange={handleCheckboxChange} name="can_view" />}
                                        label={<><i className="fas fa-eye mx-2"></i> View</>}
                                        labelPlacement="start"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={selectedPermission.can_edit} onChange={handleCheckboxChange} name="can_edit" />}
                                        label={<><i className="fas fa-edit mx-2"></i> Edit</>}
                                        labelPlacement="start"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={selectedPermission.can_delete} onChange={handleCheckboxChange} name="can_delete" />}
                                        label={<><i className="fas fa-trash mx-2"></i> Delete</>}
                                        labelPlacement="start"
                                    />
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
                            onClick={()=>props.handleAddPermission(props.selectedVault,props.selectedObject.object_id)}
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
