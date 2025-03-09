import React, { useContext, useEffect, useState } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import '../styles/Navbar.css'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { useNavigate } from "react-router-dom";

import PropTypes from 'prop-types';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import logo from "../images/waica.png";
import axios from 'axios'
import ObjComponent from '../components/Admin/ObjStructureComponent';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { Grid, MenuItem, Select, Input, TextField, FormControl, Button } from '@mui/material';

import MiniLoader from '../components/Modals/MiniLoaderDialog';

import OrganizationVaultList from '../components/MainComponents/OrganizationVaultList';
import OrganizationUsersTable from '../components/OrganizationUsers';
import VaultUsersTable from '../components/VaultUsers';

import UserRegistrationModal from '../components/RegisterUser';
import BulkUserRegistrationDialog from '../components/RegisterBulkUsers';
import * as constants from '../components/Auth/configs'
import PermissionDialog from '../components/Modals/VaultObjectPermissionsDialog';
import AddPermissionDialog from '../components/Modals/AddVaultObjectPermissionDialog';
import GroupUsersDialog from '../components/Modals/ManageGoupUsersDialog';
import { Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import pic from '../images/R.png'



function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


function AdminDashboard() {
    const [progress, setProgress] = React.useState(10);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false); // State for collapsible menu
    const { user, authTokens, logoutUser } = useContext(Authcontext);
    const [vaultObjects, setVaultObjects] = useState([])
    const [miniLoader, setMiniLoader] = useState(false);
    const [loaderMsg, setLoaderMsg] = useState('');
    const [vaultUsers, setVaultUsers] = useState([])
    const [organizationusers, setOrganizationUsers] = useState([])
    const [vaultGroups, setViewVaultGroups] = useState(false);
    const [viewLoginAccounts, setViewLoginAccounts] = useState(false);
    const [viewCreateObject, setViewCreateObject] = useState(false);
    const [viewObjects, setViewObjects] = useState(false);
    const [viewVaultSettings, setViewVaultSettings] = useState(false);

    const [viewVaultUsers, setViewVaultUsers] = useState(false);
    const [viewObjectStructure, setViewObjectStructure] = useState(false);
    const [selectedObjectStructure, setSelectedObjectStructure] = useState({});
    const [selectedVault, setSelectedVault] = useState({});
    const [usersnotlinkedtovault, setUsersNotLinkedToVault] = useState([]);
    const [openObjectPermissionsDialog, setOpenObjectPermissionsDialog] = useState(false)
    const [openAddPermissionDialog, setOpenAddPermissionDialog] = useState(false)
    const [objectpermissions, setObjectPermissions] = useState([])
    const [selectedObject, setSelectedObject] = useState([])
    const [listwithoughtpermissions, setListWithoughtPermissions] = useState({})
    const [userGroups, setuserGroups] = useState([])
    const [selecedGroup, setSelectedGroup] = useState({})
    const [openGroupUsersDialog, setOpenGroupUsersDialog] = useState(false)
    const [vaults, setVaults] = useState([]);




    const [value, setValue] = React.useState(0);
    const [showSublist, setShowSublist] = useState(false);
    const [showVaultSublist, setShowVaultSublist] = useState(false);

    const [showSublist1, setShowSublist1] = useState(false);



    const [loading, setLoading] = useState(false)
    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');


    const navigate = useNavigate()

    const homePage = () => {
        navigate('/')
    }
    const toggleVaultSublist = () => {
        setShowVaultSublist(!showVaultSublist);
    };
    const toggleSublist = () => {
        setShowSublist(!showSublist);
    };
    const toggleSublist1 = () => {
        setShowSublist1(!showSublist1);
    };
    function capitalize(input) {
        // Split the input value into an array of words
        const words = input.value.split(' ');

        // Capitalize the first letter of each word
        const capitalizedWords = words.map(word => {
            // Capitalize the first letter of the word and make the rest lowercase
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });

        // Join the capitalized words back together
        const capitalizedInput = capitalizedWords.join(' ');

        // Update the input value with the capitalized text
        input.value = capitalizedInput;
    }

    const VaultUsergroups = () => {

        let data = JSON.stringify({
            "vault_guid": selectedVault.guid,
        });
        console.log(selectedVault.guid)

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/vault-groups/`,
            headers: { 'Content-Type': 'application/json' },
            data: data
        };
        axios.request(config)
            .then((response) => {
                setuserGroups(response.data)
            })
            .catch((error) => {
                console.log(error);
            });

    }


    let selectedGroupUsers = (row) => {
        let group = userGroups.find(item => item.id === row.id)
        setSelectedGroup(group)
        setOpenGroupUsersDialog(true)
    }

    const handleAddPermission = (guid, object_id) => {


        let data = JSON.stringify({
            "vault_guid": guid,
            "object_id": object_id
        });


        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/list-users-without-permissions/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        console.log(data)

        axios.request(config)
            .then((response) => {

                setListWithoughtPermissions(response.data)
                setOpenAddPermissionDialog(true)

            })
            .catch((error) => {
                console.log(error);
            });

    }


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const [objectName, setObjectName] = useState('');
    const [properties, setProperties] = useState([]);

    const PROP_DATA_TYPES = [
        { value: 'MFDatatypeText', label: 'Text' },
        { value: 'MFDatatypeMultiLineText', label: 'Text (multi-line)' },
        // { value: 'MFDatatypeLookup', label: 'Choose from list' },
        // { value: 'MFDatatypeMultiSelectLookup', label: 'Choose from list (multi-select)' },
        { value: 'MFDatatypeBoolean', label: 'Boolean (yes/no)' },
        { value: 'MFDatatypeInteger', label: 'Number (integer)' },
        // { value: 'MFDatatypeDate', label: 'Date' },
        // { value: 'MFDatatypeTime', label: 'Time' },
        // { value: 'MFDatatypeTimestamp', label: 'Timestamp' },
        // { value: 'MFDatatypeFloating', label: 'Number (Real)' },
    ];
    const PROP_REQUIRED = [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },


    ];

    const getObjectStructureById = (id) => {
        viewobjectstructure()
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/structure/object/${id}/`,
            headers: {},
        };

        axios.request(config)
            .then((response) => {
                // console.log(JSON.stringify(response.data));
                setSelectedObjectStructure(response.data)
            })
            .catch((error) => {
                console.log(error);
            });

    }


    const handleSubmit = async () => {
        setLoaderMsg("Adding New Object...")
        setMiniLoader(true)
        try {
            const payload = {
                objectName: objectName,
                properties: properties.map(property => ({
                    title: property.title,
                    propertytype: property.dataType,
                    isRequired: property.required
                }))
            };

            const emptyItems = [];
            let alertsTriggered = false; // Flag to track if alerts were triggered

            // Check objectName
            if (!payload.objectName) {
                emptyItems.push("ObjectName");
                alertsTriggered = true;
            }

            // Check properties
            if (payload.properties.length === 0) {
                alert("Please add properties to create the object");
                alertsTriggered = true;
            } else {
                const propertyTitles = new Set();
                payload.properties.forEach(property => {
                    if (!property.title) {
                        emptyItems.push(`Property "${property.title}"`);
                        alertsTriggered = true;
                    } else if (propertyTitles.has(property.title)) {
                        alert(`Duplicate property found: "${property.title}"`);
                        alertsTriggered = true;
                    } else {
                        propertyTitles.add(property.title);
                    }
                    if (!property.propertytype) {
                        emptyItems.push(`Property "${property.propertytype}" data_type`);
                        alertsTriggered = true;
                    }
                    if (property.isRequired === "") {
                        emptyItems.push(`Property "${property.isRequired}" required`);
                        alertsTriggered = true;
                    }


                });
            }

            // If there are empty items, alert them
            if (emptyItems.length > 0) {
                const alertMessage = `The following items are empty: ${emptyItems.join(", ")}`;
                alert(alertMessage);
            }

            // If no alerts were triggered, run another code
            if (!alertsTriggered) {
                // Your additional code here


                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${constants.mfiles_api}/api/objectstracture/CreateObjectAdmin`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: payload
                };

                axios.request(config)
                    .then((response) => {
                        setMiniLoader(false)
                        setObjectName('')
                        setProperties([])
                        alert('Object creacted successfully !!');

                    })
                    .catch((error) => {
                        console.log(error);
                    });

            }
            setMiniLoader(false)



        } catch (error) {
            setMiniLoader(false)
            if (error.response) {
                // The server responded with an error status code
                setObjectName('')
                setProperties([])
                console.error('Error:', error.response.data);
                alert(`${error.response.data.message}`);
            } else if (error.request) {
                // The request was made but no response was received

                console.error('Error:', error.request);
                alert('No response from server');
            } else {
                // Something happened in setting up the request that triggered an error

                console.error('Error:', error.message);
                alert('Error occurred');
            }
            // Handle error scenario
        }
    };

    const handlePropertyChange = (index, key, value) => {
        const updatedProperties = [...properties];
        updatedProperties[index][key] = value;
        setProperties(updatedProperties);
    };

    const addProperty = () => {
        setProperties([...properties, { title: '', dataType: '', required: '' }]);
    };

    const removeProperty = (index) => {
        const updatedProperties = [...properties];
        updatedProperties.splice(index, 1);
        setProperties(updatedProperties);
    };


    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };


    const viewnewobject = () => {
        setViewCreateObject(true)
        setViewVaultUsers(false)
        setViewLoginAccounts(false)
        setViewVaultGroups(false)
        setViewObjects(false)
        setViewObjectStructure(false)

    }

    const viewvaultobjects = () => {
        setViewObjects(true)
        setViewVaultUsers(false)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewVaultGroups(false)
        setViewObjectStructure(false)
    }

    const viewvaultusers = async (vault) => {
        setVaultUsers([])
        let data = {
            vault_id: vault
        }
        let config = {
            method: 'post',
            url: `${constants.auth_api}/api/users-linked-to-vault/`,
            headers: {
                //   'Authorization': `Bearer ${authTokens.access}`,
                //   'Content-Type': 'application/json',
            },
            data: data
        };
        console.log(data)

        await axios.request(config)
            .then((response) => {
                setVaultUsers(response.data);
            })
            .catch((error) => {
                console.log(error);
            });


        setViewVaultUsers(true)
        setViewObjects(false)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewVaultGroups(false)
        setViewObjectStructure(false)
    }

    const viewobjectstructure = () => {
        setViewObjectStructure(true)
        setViewVaultUsers(false)
        setViewObjects(false)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewVaultGroups(false)
    }
    const viewvaultgroups = () => {
        setViewVaultGroups(true)
        setViewVaultUsers(false)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewObjects(false)
        setViewObjectStructure(false)

    }

    const viewloginaccounts = () => {
        setViewLoginAccounts(true)
        setViewVaultUsers(false)
        setViewCreateObject(false)
        setViewVaultGroups(false)
        setViewObjects(false)
        setViewObjectStructure(false)
    }

    const fetchObjectPermisions = async (object) => {
        setSelectedObject(object)
        let data = JSON.stringify({
            "object_id": object.object_id,
            "vault_guid": selectedVault.guid
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/get-vault-object-permissions/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        await axios.request(config)
            .then((response) => {


                setObjectPermissions(response.data)
                setOpenObjectPermissionsDialog(true)
            })
            .catch((error) => {
                console.log(error);
            });

    }

    const fetchUsersNotLinkedToVault = async (vault) => {

        try {
            const response = await axios.post(`${constants.auth_api}/api/users-not-linked-to-vault/`, { vault_id: vault });
            setUsersNotLinkedToVault(response.data.map(user => ({ value: user.id, label: `${user.first_name} ${user.last_name} (${user.email})` })));
        } catch (error) {
            console.error('Error fetching users:', error);

        }
    };

    const fetchVaultObjects = async (guid) => {
        alert(guid)
        try {
            const payload = {
                guid: guid
            }

            const headers = {
                'Authorization': `Bearer ${authTokens.access}`,
                'Content-Type': 'application/json'
            }
            const response = await axios.post(`${constants.auth_api}/api/get-vault-objects/`, payload, headers);
            setVaultObjects(response.data);

        } catch (error) {
            console.error('Error fetching vault objects:', error);
        }
    };
    const fetchOrgUsers = async () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/users/organization/${user.organizationid}/`,
            headers: {}
        };

        try {
            const response = await axios.request(config);
            setOrganizationUsers(response.data)

        } catch (error) {
            console.log(error);
        }
    };

    function stringToColor(string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name) {

        const nameParts = name.split(' '); // Split the name into parts
        const firstInitial = nameParts[0] ? nameParts[0][0] : ''; // Get the first letter of the first part
        const secondInitial = nameParts[1] ? nameParts[1][0] : ''; // Get the first letter of the second part (if it exists)

        return {
            sx: {
                bgcolor: stringToColor(name), // Assuming stringToColor is defined elsewhere
            },
            children: `${firstInitial}${secondInitial}`, // Combine the initials
        };
    }

    const buttonStyle = {
        textTransform: 'none',
        fontWeight: 'lighter',
        fontSize: '10px',
        mx: 1,
    };

    const smallButtonStyle = {
        textTransform: 'none',
        fontWeight: 'lighter',
        fontSize: '9px',
        mx: 2,
    };

    const inputStyle = {
        fontSize: '12px',
        mx: 2,
    };

    const syncUser = async () => {
        setLoading(true)
        let data = JSON.stringify({
            "guid": `${selectedVault.guid}`,
            "organization_id": `${user.organizationid}`
        });

        console.log(data)

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/sync-vault-users/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        await axios.request(config)
            .then((response) => {
                fetchOrgUsers()
                viewvaultusers(selectedVault.guid)
                console.log(JSON.stringify(response.data));
                setLoading(false)
                setOpenAlert(true);
                setAlertSeverity("success");
                setAlertMsg("Accouns were synced successfully");
            })
            .catch((error) => {
                setLoading(false)
                setOpenAlert(true);
                setAlertSeverity("error");
                setAlertMsg("Failed syncing accounts, ensure vault users have emails (unique)");
                console.log(error);
            });



    }


    useEffect(() => {
        fetchOrgUsers();
    }, []);



    return (
        <>
            <PermissionDialog selectedVault={selectedVault.guid} handleAddPermission={handleAddPermission} selectedObject={selectedObject} fetchObjectPermisions={fetchObjectPermisions} permissions={objectpermissions} open={openObjectPermissionsDialog} close={() => setOpenObjectPermissionsDialog(false)} />
            <GroupUsersDialog selectedGroupUsers={selectedGroupUsers} selectedGroup={selecedGroup} selectedVault={selectedVault.guid} open={openGroupUsersDialog} close={setOpenGroupUsersDialog} />
            <AddPermissionDialog fetchObjectPermisions={fetchObjectPermisions} selectedObject={selectedObject} selectedVault={selectedVault.guid} listwithoughtpermissions={listwithoughtpermissions} open={openAddPermissionDialog} close={() => setOpenAddPermissionDialog(false)} />
            <MiniLoader loading={miniLoader} loaderMsg={loaderMsg} setLoading={setMiniLoader} />
            <div className="dashboard">
                <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    {/* Sidebar content */}
                    <div className="sidebar-content" style={{ marginTop: '0%' }}>
                        {sidebarOpen && (
                            <>
                                <div className='bg-white shadow-lg' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Avatar
                                        alt={
                                            user.first_name && user.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : user.first_name
                                                    ? user.first_name
                                                    : user.last_name
                                                        ? user.last_name
                                                        : user.username
                                        }
                                        {...stringAvatar(
                                            user.first_name && user.last_name
                                                ? `${user.first_name} ${user.last_name}`
                                                : user.first_name
                                                    ? user.first_name
                                                    : user.last_name
                                                        ? user.last_name
                                                        : user.username
                                        )}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                                            transform: 'translateZ(0)',
                                            transition: 'transform 0.2s'


                                        }}
                                        className='my-3'
                                    />


                                </div>
                           
                                <ul className="bottom-top menu-items">
                                <li  className="menu-item main-li  shadow-lg " style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  
                                    <span className=' text-center' style={{ fontSize: '13px' }}>{user.first_name} {user.last_name}</span>
                                    </div>
                     
                                </li>
                                <li  className="menu-item main-li  shadow-lg " style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                 
                                    <span className=' text-center' style={{ fontSize: '13px' }}> {user.organization} Admin</span>
                                    </div>
                     
                                </li>
                                </ul>
                                {/* <div className='shadow-lg ' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
                                    <span className='p-2 mx-3'>{user.organization}</span>
                                </div> */}


                                <div>
                                    <ul className="bottom-buttons">


                                        <li onClick={homePage} className="menu-item main-li shadow-lg">
                                            <i className="fas fa-house-user" style={{ fontSize: '20px' }}></i>
                                            <span style={{ fontSize: '13px' }}>Back Home</span>
                                        </li>

                                        <li onClick={logoutUser} className="menu-item main-li shadow-lg">
                                            <i className="fas fa-sign-out-alt" style={{ fontSize: '20px' }}></i>
                                            <span style={{ fontSize: '13px' }}>Logout</span>
                                        </li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>

                </nav >
                <main className={`content ${sidebarOpen ? 'shifted' : 'full-width'} bg-white`} >
                    <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
                        <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
                            <i style={{ fontSize: '18px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'}`} ></i>
                        </div>
                    </Tooltip>
                    <div className='row container-fluid ' style={{ height: '100Vh' }} >

                        <div className="col-lg-5 col-md-5 col-sm-12 text-dark " style={{ backgroundColor: '#e5e5e5' }}>
                            {/* Header Box */}
                            <Box
                                sx={{
                                    fontSize: '12px',
                                    backgroundColor: '#e0fbfc',
                                    color: '#2757aa',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow

                                    display: 'flex',
                                    alignItems: 'center', // Vertical alignment
                                    justifyContent: 'space-between', // Spacing between icon and text

                                    padding: '12px', // Add padding for better spacing
                                }}

                            >

                                {/* <i
                                    className="fas fa-user-shield"
                                    style={{
                                        fontSize: '1.5em',
                                        color: '#2757aa',
                                    }}
                                ></i> */}
                                <span style={{ fontSize: '14px' }} className='text-dark'>  Vault Accounts Manager</span>
                                {/* <span >
                                    <i
                                        className="fas fa-cog"
                                        style={{
                                            fontSize: '1.5em',
                                            color: '#2757aa',
                                        }}
                                    ></i>

                                </span> */}
                            </Box>
                            {/* Action Button */}

                            {/* Vault List */}
                            <div
                                style={{
                                    fontSize: '12px',

                                    overflowY: 'auto', // Enable scrolling
                                    // border: '1px solid #ddd',
                                    marginLeft: '20px'


                                }}
                                className="mb-3 shadow-lg"
                            >

                                <OrganizationVaultList
                                    VaultUsergroups={VaultUsergroups}
                                    fetchVaultObjects={fetchVaultObjects}
                                    fetchOrgUsers={fetchOrgUsers}
                                    fetchUsersNotLinkedToVault={fetchUsersNotLinkedToVault}
                                    setSelectedVault={setSelectedVault}
                                    viewvaultusers={viewvaultusers}
                                    getObjectStructureById={getObjectStructureById}
                                    viewnewobject={viewnewobject}
                                    showSublist={showSublist}
                                    showSublist1={showSublist1}
                                    toggleSublist={toggleSublist}
                                    toggleSublist1={toggleSublist1}
                                    viewvaultobjects={viewvaultobjects}
                                    viewLoginAccounts={viewLoginAccounts}
                                    viewvaultgroups={viewvaultgroups}
                                    vaultObjects={vaultObjects}
                                    viewloginaccounts={viewloginaccounts}
                                    vaults={vaults}
                                    setVaults={setVaults}


                                />
                            </div>



                        </div>

                        <div className="col-lg-7 col-md-7 col-sm-12 bg-white shadow-lg text-dark" style={{ fontSize: '12px', height: '90vh', overflowY: 'auto' }}>
                            {viewCreateObject ?
                                <div id="newobject" style={{ fontSize: '12px', marginBottom: '20px' }}>
                                    <div>
                                        <Box sx={{ p: 3, boxShadow: 2, fontSize: '1.2em', display: 'flex', alignItems: 'center' }}>
                                            <i className="fas fa-plus mx-2" style={{ fontSize: '1.5em' }}></i> Create New Object
                                        </Box>
                                        <Typography variant="body2" sx={{ my: 3, fontSize: '0.8em' }}>
                                            Please create your new object type below with the respective properties
                                        </Typography>

                                        <Box className="card-body" sx={{ my: 4, overflowY: 'auto' }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <FormControl variant="standard" fullWidth>
                                                        <Input
                                                            id="objectName"
                                                            placeholder="Object name"
                                                            className="mx-2"
                                                            value={objectName}
                                                            onChange={(e) => setObjectName(e.target.value)}
                                                            type="text"
                                                            required
                                                            onInput={(e) => capitalize(e.target)}
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <ButtonComponent size="sm" onClick={addProperty} sx={buttonStyle}>
                                                        <i className="fas fa-tag mx-1"></i> Add Property
                                                    </ButtonComponent>
                                                    <ButtonComponent onClick={handleSubmit} sx={buttonStyle}>
                                                        <i className="fas fa-plus-circle mx-1"></i> Create Object
                                                    </ButtonComponent>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Box className="container-fluid" sx={{ overflowY: 'auto' }}>
                                            {properties.map((property, index) => (
                                                <Grid container spacing={2} alignItems="center" key={index} sx={{ fontSize: '9px', mb: 2 }}>
                                                    <Grid item xs={12} sm={4}>
                                                        <FormControl variant="standard" fullWidth>
                                                            <Input
                                                                sx={inputStyle}
                                                                id={`title-input-${index}`}
                                                                placeholder="Property Title*"
                                                                value={property.title}
                                                                onChange={(e) => handlePropertyChange(index, 'title', e.target.value)}
                                                                type="text"
                                                                onInput={(e) => capitalize(e.target)}
                                                                required
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <FormControl variant="standard" fullWidth>
                                                            <Select
                                                                sx={inputStyle}
                                                                id={`dataType-select-${index}`}
                                                                displayEmpty
                                                                value={property.dataType}
                                                                onChange={(e) => handlePropertyChange(index, 'dataType', e.target.value)}
                                                                required
                                                            >
                                                                <MenuItem value="" disabled>Select Data Type</MenuItem>
                                                                {PROP_DATA_TYPES.map((item, idx) => (
                                                                    <MenuItem key={idx} value={item.value}>{item.label}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={2}>
                                                        <FormControl variant="standard" fullWidth>
                                                            <Select
                                                                sx={inputStyle}
                                                                id={`required-select-${index}`}
                                                                displayEmpty
                                                                value={property.required}
                                                                onChange={(e) => handlePropertyChange(index, 'required', e.target.value)}
                                                                required
                                                            >
                                                                <MenuItem value="" disabled>Is required?</MenuItem>
                                                                {PROP_REQUIRED.map((item, idx) => (
                                                                    <MenuItem key={idx} value={item.value}>{item.label}</MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={2}>
                                                        <ButtonComponent onClick={() => removeProperty(index)} sx={smallButtonStyle}>
                                                            <i className="fas fa-trash mx-1"></i> Remove Property
                                                        </ButtonComponent>
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </Box>
                                    </div>
                                </div>

                                : <></>

                            }

                            {viewObjects ?
                                <>
                                    <h6 className='shadow-lg p-3 '><i className="fas fa-hdd  mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i>{selectedVault.name} ( Vault Objects )</h6>

                                    <div id='vaultobjects' style={{ fontSize: '12px', marginBottom: '20px' }}>


                                        <div style={{ boxShadow: 'none' }} className='shadow-lg p-3'>
                                            <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                                <TableHead className='my-3 p-3'>
                                                    <TableRow >
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Object Name</TableCell>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Object ID</TableCell>
                                                        {/* <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}></TableCell> */}
                                                    </TableRow>
                                                </TableHead>
                                            </Table>
                                            <div style={{ overflowY: 'auto' }}>
                                                <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                                    <TableBody>
                                                        {vaultObjects.map((row) => (
                                                            <TableRow key={row.object_id}>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                                                                    <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i> {row.name_singular}
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: 'none' }}>{row.object_id}</TableCell>
                                                                {/* <TableCell>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="warning"
                                                                    onClick={() => fetchObjectPermisions(row)}
                                                                    style={{ textTransform: 'none' }}
                                                                >
                                                                    <small>
                                                                        <i className="fas fa-cog" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Permissions
                                                                    </small>
                                                                </Button>
                                                            </TableCell> */}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>



                                    </div>
                                </>
                                : <></>

                            }
                            {viewObjectStructure ?
                                <div id='updateobjstructure' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                    <div>
                                        <div>
                                            <h6 className='shadow-lg p-3' style={{ fontSize: '1.2em' }}>
                                                <i className="fas fa-edit mx-2" style={{ fontSize: '1.5em' }}></i> Update Object
                                            </h6>
                                        </div>


                                        <ObjComponent
                                            selectedObjectStructure={selectedObjectStructure}
                                            setSelectedObjectStructure={setSelectedObjectStructure}
                                            authTokens={authTokens}
                                        />

                                    </div>
                                </div>
                                : <></>

                            }

                            {vaultGroups ?
                                <div id='permissions' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                    <div>

                                        <h6 className='shadow-lg p-3 '><i className="fas fa-hdd  mx-2" style={{ fontSize: '1.5em' }}></i>{selectedVault.name} ( User Groups )</h6>

                                        <TableContainer component={Paper} sx={{ boxShadow: 'none' }} className='shadow-lg p-3' style={{ overflowY: 'auto' }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => alert("add user group")}
                                                style={{ textTransform: 'none' }}
                                                className='my-2'

                                            >
                                                <small>  <i className="fas fa-users" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Add New User Group </small>
                                            </Button>
                                            <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                                <TableHead>
                                                    <TableRow className='my-3'>

                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Name</TableCell>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}> ID</TableCell>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userGroups.map((row) => (
                                                        <TableRow key={row.object_id}>

                                                            <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                                                                <i className="fas fa-users mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i> {row.title}
                                                            </TableCell>
                                                            <TableCell style={{ borderBottom: 'none' }}>{row.id}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    color="warning"
                                                                    onClick={() => selectedGroupUsers(row)}
                                                                    style={{ textTransform: 'none' }}

                                                                >
                                                                    <small>  <i className="fas fa-users" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Manage Users </small>
                                                                </Button>

                                                            </TableCell>


                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </div>
                                : <></>

                            }

                            {viewLoginAccounts ?
                                <div id='usermanagement' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                    <div>

                                        <h6 className='shadow-lg p-3'><i className="fas fa-users  mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i>Login Accounts</h6>
                                        <p className='my-3' style={{ fontSize: '10px' }}>User Accounts</p>
                                    </div>
                                    <div className='btn-group my-3' role="group" aria-label="Basic example">
                                        {/* <UserRegistrationModal authTokens={authTokens} fetchOrgUsers={fetchOrgUsers} />
                                        <BulkUserRegistrationDialog authTokens={authTokens} fetchOrgUsers={fetchOrgUsers} /> */}

                                    </div>

                                    <OrganizationUsersTable users={organizationusers} />
                                </div>
                                : <></>

                            }
                            {viewVaultUsers ?
                                <div id='vaultusermanagement' style={{ fontSize: '12px' }}>

                                    <h6 className='shadow-lg p-3'><i className="fas fa-users  mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i> <span style={{ color: '#2757aa' }}>{selectedVault.name}</span>  Vault Users</h6>

                                    <VaultUsersTable alertOpen={alertOpen} setOpenAlert={setOpenAlert} alertSeverity={alertSeverity} setAlertSeverity={setAlertSeverity} alertMsg={alertMsg} setAlertMsg={setAlertMsg} setLoading={setLoading} loading={loading} syncUser={syncUser} fetchUsersNotLinkedToVault={fetchUsersNotLinkedToVault} usersnotlinkedtovault={usersnotlinkedtovault} setUsersNotLinkedToVault={setUsersNotLinkedToVault} vaultUsers={vaultUsers} vault={selectedVault} viewvaultusers={viewvaultusers} />
                                </div>
                                : <></>


                            }

                            {!viewLoginAccounts && !viewLoginAccounts && !viewvaultgroups && !viewObjects && !viewCreateObject && !viewObjectStructure && !viewVaultUsers ?
                                <div style={{ fontSize: '12px', marginBottom: '20px' }}>

                                    <h5 className='shadow-lg p-3'><img className="mx-3" src={logo} alt="Loading" width='40px' />Organization Details </h5>
                                    <ul className=' p-3' style={{ overflowY: 'auto' }}>
                                        <li className='my-2' style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                            <i className="fas fa-building mx-3" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>Organization Name: <b>{user.organization}</b></span>
                                        </li>
                                        <li className='my-2' style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                            <i className="fas fa-hdd mx-3" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>Number of Vaults: <b>{user.vaultcount}</b></span>
                                        </li>

                                        <li className='my-2' onClick={toggleSublist} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                            <i className="fas fa-users mx-3" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>Number of Users : <b>{organizationusers.length}</b></span>
                                        </li>

                                    </ul>


                                </div>
                                : <></>

                            }
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default AdminDashboard;
