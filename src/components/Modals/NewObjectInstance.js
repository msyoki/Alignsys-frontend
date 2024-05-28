import React, { useState, useContext } from 'react';
import { Container, Box, FormControl, InputLabel, Select, MenuItem, Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import logo from '../../images/ZF.png';
import Authcontext from '../../components/Auth/Authprovider';
import { TroubleshootSharp } from '@mui/icons-material';

import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTasks, faChartBar, faUser, faCar } from '@fortawesome/free-solid-svg-icons';

const items = [
    { "objectid": 0, "namesingular": "Document", "nameplural": "Documents" },
    { "objectid": 9, "namesingular": "Document collection", "nameplural": "Document collections" },
    { "objectid": 10, "namesingular": "Assignment", "nameplural": "Assignments" },
    { "objectid": 15, "namesingular": "Report", "nameplural": "Reports" },
    { "objectid": 129, "namesingular": "Staff", "nameplural": "Staffs" },
    { "objectid": 130, "namesingular": "Vehicle", "nameplural": "Vehicles" }
];

const iconMap = {
    Document: faFileAlt,
    "Document collection": faFolderOpen,
    Assignment: faTasks,
    Report: faChartBar,
    Staff: faUser,
    Vehicle: faCar
};
const NewObjectInstance = (props) => {
    const { loggedInVault, selectedVault } = useContext(Authcontext);


    const handleClose = () => {
        props.setOpen(false);
    };

    const [dataOpen, setDataOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [grouped, setGrouped] = useState([]);
    const [unGrouped, setUnGrouped] = useState([]);

    const handleItemClick = async (objectid) => {
        console.log(objectid);
        setLoading(true);
        try {
            const response = await axios.get(`http://192.236.194.251:240/api/MfilesObjects/%7BE19BECA0-7542-451B-81E5-4CADB636FCD5%7D/${objectid}`);
            setGrouped(response.data.grouped);
            setUnGrouped(response.data.unGrouped);
            setLoading(false);
            setDataOpen(true);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    return (
        <div>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle style={{backgroundColor: '#2a68af',color:'#fff'}}>Select an Item</DialogTitle>
                <DialogContent>
                    <List>
                        {items.map((item) => (
                            // (item.objectid !== 0 && item.objectid !== 9 && item.objectid !== 10 && item.objectid !== 15) ? (
                                <ListItem button key={item.objectid} onClick={() => handleItemClick(item.objectid)}>
                                    <ListItemIcon>
                                        <FontAwesomeIcon icon={iconMap[item.namesingular]} />
                                    </ListItemIcon>
                                    <ListItemText primary={item.namesingular} />
                                </ListItem>
                            // ) : null
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dataOpen} onClose={handleClose} fullWidth>
                <DialogTitle>Select a Class</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {grouped.map((group) => (
                                <div key={group.classGroupId}>
                                    <h4>{group.classGroupName}</h4>
                                    <List>
                                        {group.members.map((member) => (
                                            <ListItem button key={member.classId} onClick={() => console.log(member.classId)}>
                                                <ListItemText primary={member.className} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </div>
                            ))}
                            <h4>Ungrouped</h4>
                            <List>
                                {unGrouped.map((item) => (
                                    <ListItem button key={item.classId} onClick={() => console.log(item.classId)}>
                                        <ListItemText primary={item.className} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default NewObjectInstance;
