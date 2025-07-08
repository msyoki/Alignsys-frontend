import React, { useContext, useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Styles
import '../styles/Dashboard.css';
import '../styles/Custombuttons.css';
import '../styles/Navbar.css';

// Material-UI components
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Grid,
    MenuItem,
    Select,
    Input,
    FormControl,
    Button,
    Tooltip,
    Avatar
} from '@mui/material';

// Other components
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import ObjComponent from '../components/Admin/ObjStructureComponent';
import MiniLoader from '../components/Modals/MiniLoaderDialog';
import OrganizationVaultList from '../components/MainComponents/OrganizationVaultList';
import OrganizationUsersTable from '../components/OrganizationUsers';
import VaultUsersTable from '../components/VaultUsers';
import PermissionDialog from '../components/Modals/VaultObjectPermissionsDialog';
import AddPermissionDialog from '../components/Modals/AddVaultObjectPermissionDialog';
import GroupUsersDialog from '../components/Modals/ManageGoupUsersDialog';
import LoginActivityTable from '../components/LoginActivity';

// Constants and utilities
import * as constants from '../components/Auth/configs';
import logo from '../images/waica.png';

// Constants moved outside component
const STANDARD_FONT_FAMILY = "'Segoe UI', 'Roboto', 'Arial', sans-serif";
const STANDARD_FONT_SIZE = '13px';

const PROP_DATA_TYPES = [
    { value: 'MFDatatypeText', label: 'Text' },
    { value: 'MFDatatypeMultiLineText', label: 'Text (multi-line)' },
    { value: 'MFDatatypeBoolean', label: 'Boolean (yes/no)' },
    { value: 'MFDatatypeInteger', label: 'Number (integer)' },
];

const PROP_REQUIRED = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' },
];

// Utility functions moved outside
const stringToColor = (string) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
};

const stringAvatar = (name) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0] ? nameParts[0][0] : '';
    const secondInitial = nameParts[1] ? nameParts[1][0] : '';

    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${firstInitial}${secondInitial}`,
    };
};

const capitalize = (input) => {
    const words = input.value.split(' ');
    const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    const capitalizedInput = capitalizedWords.join(' ');
    input.value = capitalizedInput;
};

// Style constants
const STYLES = {
    buttonStyle: {
        textTransform: 'none',
        fontWeight: 'lighter',
        fontSize: '10px',
        mx: 1,
    },
    smallButtonStyle: {
        textTransform: 'none',
        fontWeight: 'lighter',
        fontSize: '9px',
        mx: 2,
    },
    inputStyle: {
        fontSize: '13px',
        mx: 2,
    },
    headerBox: {
        fontSize: '13px',
        backgroundColor: '#ecf4fc',
        color: '#2757aa',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px',
    },
    menuItemStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 15px",
        borderRadius: "8px",
        width: "100%",
    }
};

// Custom hooks
const useResizeHandler = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isDragging, setIsDragging] = useState(false);
    const col1Ref = useRef(null);
    const col2Ref = useRef(null);
    const dividerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const containerWidth = containerRef.current.getBoundingClientRect().width;
            let newCol1Width = (e.clientX / containerWidth) * 100;
            if (newCol1Width < 10) newCol1Width = 10;
            if (newCol1Width > 90) newCol1Width = 90;
            col1Ref.current.style.width = `${newCol1Width}%`;
            col2Ref.current.style.width = `${100 - newCol1Width}%`;
        };

        const handleMouseUp = () => setIsDragging(false);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isMobile]);

    const handleMouseDown = useCallback(() => {
        if (!isMobile) setIsDragging(true);
    }, [isMobile]);

    return {
        isMobile,
        isDragging,
        col1Ref,
        col2Ref,
        dividerRef,
        containerRef,
        handleMouseDown
    };
};

// Memoized sidebar component
const Sidebar = memo(({ sidebarOpen, user, userDisplayName, onNavigateHome, onLogout }) => (
    <nav className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-content" style={{ fontFamily: STANDARD_FONT_FAMILY, fontSize: STANDARD_FONT_SIZE }}>
            {sidebarOpen && (
                <>
                    {/* Logo Section */}
                    <div
                        className="d-flex flex-column justify-content-center align-items-center bg-white shadow-lg"
                        style={{
                            height: "58px",
                            minHeight: "56px",
                            maxHeight: "56px",
                            overflow: "hidden",
                        }}
                    >
                        <img
                            src={logo}
                            alt="Organization logo"
                            className="logo"
                            style={{
                                width: "auto",
                                maxWidth: "80%",
                                maxHeight: "48px",
                                objectFit: "contain",
                            }}
                        />
                    </div>


                    <div>
                        <ul className="bottom-buttons">
                            <li onClick={onNavigateHome} className="menu-item main-li shadow-lg">
                                <i className="fas fa-house-user" style={{ fontSize: "18px" }}></i>
                                <span style={{ fontSize: "14px" }}>Home</span>
                            </li>

                            <li onClick={onLogout} className="menu-item main-li shadow-lg">
                                <i className="fas fa-sign-out-alt" style={{ fontSize: "18px" }}></i>
                                <span style={{ fontSize: "14px" }}>Logout</span>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    </nav>
));

// Memoized property row component
const PropertyRow = memo(({ property, index, onPropertyChange, onRemoveProperty }) => (
    <Grid container spacing={2} alignItems="center" sx={{ fontSize: '9px', mb: 2 }}>
        <Grid item xs={12} sm={4}>
            <FormControl variant="standard" fullWidth>
                <Input
                    sx={STYLES.inputStyle}
                    id={`title-input-${index}`}
                    placeholder="Property Title*"
                    value={property.title}
                    onChange={(e) => onPropertyChange(index, 'title', e.target.value)}
                    type="text"
                    onInput={(e) => capitalize(e.target)}
                    required
                />
            </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
            <FormControl variant="standard" fullWidth>
                <Select
                    sx={STYLES.inputStyle}
                    id={`dataType-select-${index}`}
                    displayEmpty
                    value={property.dataType}
                    onChange={(e) => onPropertyChange(index, 'dataType', e.target.value)}
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
                    sx={STYLES.inputStyle}
                    id={`required-select-${index}`}
                    displayEmpty
                    value={property.required}
                    onChange={(e) => onPropertyChange(index, 'required', e.target.value)}
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
            <ButtonComponent onClick={() => onRemoveProperty(index)} sx={STYLES.smallButtonStyle}>
                <i className="fas fa-trash mx-1"></i> Remove Property
            </ButtonComponent>
        </Grid>
    </Grid>
));

// Main component
function AdminDashboard() {
    // Context and navigation
    const { user, authTokens, logoutUser } = useContext(Authcontext);
    const navigate = useNavigate();

    // Custom hooks
    const { isMobile, col1Ref, col2Ref, dividerRef, containerRef, handleMouseDown } = useResizeHandler();

    // State variables (keeping all original state variables)
    const [progress, setProgress] = useState(10);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [vaultObjects, setVaultObjects] = useState([]);
    const [miniLoader, setMiniLoader] = useState(false);
    const [loaderMsg, setLoaderMsg] = useState('');
    const [vaultUsers, setVaultUsers] = useState([]);
    const [organizationusers, setOrganizationUsers] = useState([]);
    const [vaultGroups, setViewVaultGroups] = useState(false);
    const [viewLoginAccounts, setViewLoginAccounts] = useState(false);
    const [viewLoginActivity, setViewLoginActivity] = useState(false);
    const [viewCreateObject, setViewCreateObject] = useState(false);
    const [viewObjects, setViewObjects] = useState(false);
    const [viewVaultSettings, setViewVaultSettings] = useState(false);
    const [viewVaultUsers, setViewVaultUsers] = useState(false);
    const [viewObjectStructure, setViewObjectStructure] = useState(false);
    const [selectedObjectStructure, setSelectedObjectStructure] = useState({});
    const [selectedVault, setSelectedVault] = useState({});
    const [usersnotlinkedtovault, setUsersNotLinkedToVault] = useState([]);
    const [openObjectPermissionsDialog, setOpenObjectPermissionsDialog] = useState(false);
    const [openAddPermissionDialog, setOpenAddPermissionDialog] = useState(false);
    const [objectpermissions, setObjectPermissions] = useState([]);
    const [selectedObject, setSelectedObject] = useState([]);
    const [listwithoughtpermissions, setListWithoughtPermissions] = useState({});
    const [userGroups, setuserGroups] = useState([]);
    const [selecedGroup, setSelectedGroup] = useState({});
    const [openGroupUsersDialog, setOpenGroupUsersDialog] = useState(false);
    const [vaults, setVaults] = useState([]);
    const [value, setValue] = useState(0);
    const [showSublist, setShowSublist] = useState(false);
    const [showVaultSublist, setShowVaultSublist] = useState(false);
    const [showSublist1, setShowSublist1] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertOpen, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState('');
    const [alertMsg, setAlertMsg] = useState('');
    const [objectName, setObjectName] = useState('');
    const [properties, setProperties] = useState([]);

    // Memoized values
    const userDisplayName = useMemo(() => {
        return user.first_name && user.last_name
            ? `${user.first_name} ${user.last_name}`
            : user.first_name || user.last_name || user.username;
    }, [user.first_name, user.last_name, user.username]);

    // Memoized handlers
    const homePage = useCallback(() => {
        navigate('/');
    }, [navigate]);

    const toggleVaultSublist = useCallback(() => {
        setShowVaultSublist(prev => !prev);
    }, []);

    const toggleSublist = useCallback(() => {
        setShowSublist(prev => !prev);
    }, []);

    const toggleSublist1 = useCallback(() => {
        setShowSublist1(prev => !prev);
    }, []);

    const handleChange = useCallback((event, newValue) => {
        setValue(newValue);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev);
    }, []);

    const toggleMenu = useCallback(() => {
        setMenuOpen(prev => !prev);
    }, []);

    const handlePropertyChange = useCallback((index, key, value) => {
        setProperties(prev => {
            const updatedProperties = [...prev];
            updatedProperties[index][key] = value;
            return updatedProperties;
        });
    }, []);

    const addProperty = useCallback(() => {
        setProperties(prev => [...prev, { title: '', dataType: '', required: '' }]);
    }, []);

    const removeProperty = useCallback((index) => {
        setProperties(prev => {
            const updatedProperties = [...prev];
            updatedProperties.splice(index, 1);
            return updatedProperties;
        });
    }, []);

    // API functions memoized
    const VaultUsergroups = useCallback(() => {
        const data = JSON.stringify({
            "vault_guid": selectedVault.guid,
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/vault-groups/`,
            headers: { 'Content-Type': 'application/json' },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setuserGroups(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [selectedVault.guid]);

    const selectedGroupUsers = useCallback((row) => {
        const group = userGroups.find(item => item.id === row.id);
        setSelectedGroup(group);
        setOpenGroupUsersDialog(true);
    }, [userGroups]);

    const handleAddPermission = useCallback((guid, object_id) => {
        const data = JSON.stringify({
            "vault_guid": guid,
            "object_id": object_id
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/list-users-without-permissions/`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setListWithoughtPermissions(response.data);
                setOpenAddPermissionDialog(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const getObjectStructureById = useCallback((id) => {
        viewobjectstructure();
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/structure/object/${id}/`,
            headers: {},
        };

        axios.request(config)
            .then((response) => {
                setSelectedObjectStructure(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleSubmit = useCallback(async () => {
        setLoaderMsg("Adding New Object...");
        setMiniLoader(true);

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
            let alertsTriggered = false;

            if (!payload.objectName) {
                emptyItems.push("ObjectName");
                alertsTriggered = true;
            }

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

            if (emptyItems.length > 0) {
                const alertMessage = `The following items are empty: ${emptyItems.join(", ")}`;
                alert(alertMessage);
            }

            if (!alertsTriggered) {
                const config = {
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
                        setMiniLoader(false);
                        setObjectName('');
                        setProperties([]);
                        alert('Object created successfully !!');
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
            setMiniLoader(false);

        } catch (error) {
            setMiniLoader(false);
            if (error.response) {
                setObjectName('');
                setProperties([]);
                console.error('Error:', error.response.data);
                alert(`${error.response.data.message}`);
            } else if (error.request) {
                console.error('Error:', error.request);
                alert('No response from server');
            } else {
                console.error('Error:', error.message);
                alert('Error occurred');
            }
        }
    }, [objectName, properties]);

    // View management functions
    const viewnewobject = useCallback(() => {
        setViewCreateObject(true);
        setViewLoginActivity(false);
        setViewVaultUsers(false);
        setViewLoginAccounts(false);
        setViewVaultGroups(false);
        setViewObjects(false);
        setViewObjectStructure(false);
    }, []);

    const viewvaultobjects = useCallback(() => {
        setViewObjects(true);
        setViewLoginActivity(false);
        setViewVaultUsers(false);
        setViewCreateObject(false);
        setViewLoginAccounts(false);
        setViewVaultGroups(false);
        setViewObjectStructure(false);
    }, []);

    const viewvaultusers = useCallback(async (vault) => {
        setVaultUsers([]);
        const data = { vault_id: vault };
        const config = {
            method: 'post',
            url: `${constants.auth_api}/api/users-linked-to-vault/`,
            headers: {},
            data: data
        };

        await axios.request(config)
            .then((response) => {
                setVaultUsers(response.data);
            })
            .catch((error) => {
                console.log(error);
            });

        setViewVaultUsers(true);
        setViewLoginActivity(false);
        setViewObjects(false);
        setViewCreateObject(false);
        setViewLoginAccounts(false);
        setViewVaultGroups(false);
        setViewObjectStructure(false);
    }, []);

    const viewobjectstructure = useCallback(() => {
        setViewObjectStructure(true);
        setViewLoginActivity(false);
        setViewVaultUsers(false);
        setViewObjects(false);
        setViewCreateObject(false);
        setViewLoginAccounts(false);
        setViewVaultGroups(false);
    }, []);

    const viewvaultgroups = useCallback(() => {
        setViewVaultGroups(true);
        setViewLoginActivity(false);
        setViewVaultUsers(false);
        setViewCreateObject(false);
        setViewLoginAccounts(false);
        setViewObjects(false);
        setViewObjectStructure(false);
    }, []);

    const viewloginaccounts = useCallback(() => {
        setViewLoginAccounts(true);
        setViewLoginActivity(false);
        setViewVaultUsers(false);
        setViewCreateObject(false);
        setViewVaultGroups(false);
        setViewObjects(false);
        setViewObjectStructure(false);
    }, []);

    const viewloginactivity = useCallback(() => {
        setViewLoginActivity(true);
        setViewLoginAccounts(false);
        setViewVaultUsers(false);
        setViewCreateObject(false);
        setViewVaultGroups(false);
        setViewObjects(false);
        setViewObjectStructure(false);
    }, []);

    const fetchObjectPermisions = useCallback(async (object) => {
        setSelectedObject(object);
        const data = JSON.stringify({
            "object_id": object.object_id,
            "vault_guid": selectedVault.guid
        });

        const config = {
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
                setObjectPermissions(response.data);
                setOpenObjectPermissionsDialog(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [selectedVault.guid]);

    const fetchUsersNotLinkedToVault = useCallback(async (vault) => {
        try {
            const response = await axios.post(`${constants.auth_api}/api/users-not-linked-to-vault/`, { vault_id: vault });
            setUsersNotLinkedToVault(response.data.map(user => ({
                value: user.id,
                label: `${user.first_name} ${user.last_name} (${user.email})`
            })));
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, []);

    const fetchVaultObjects = useCallback(async (guid) => {
        alert(guid);
        try {
            const payload = { guid: guid };
            const headers = {
                'Authorization': `Bearer ${authTokens.access}`,
                'Content-Type': 'application/json'
            };
            const response = await axios.post(`${constants.auth_api}/api/get-vault-objects/`, payload, { headers });
            setVaultObjects(response.data);
        } catch (error) {
            console.error('Error fetching vault objects:', error);
        }
    }, [authTokens.access]);

    const fetchOrgUsers = useCallback(async () => {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${constants.auth_api}/api/users/organization/${user.organizationid}/`,
            headers: {}
        };

        try {
            const response = await axios.request(config);
            setOrganizationUsers(response.data);
        } catch (error) {
            console.log(error);
        }
    }, [user.organizationid]);

    const syncUser = useCallback(async () => {
        setLoading(true);
        const data = JSON.stringify({
            "guid": `${selectedVault.guid}`,
            "organization_id": `${user.organizationid}`
        });

        const config = {
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
                fetchOrgUsers();
                viewvaultusers(selectedVault.guid);
                console.log(JSON.stringify(response.data));
                setLoading(false);
                setOpenAlert(true);
                setAlertSeverity("success");
                setAlertMsg("Accounts were synced successfully");
            })
            .catch((error) => {
                setLoading(false);
                setOpenAlert(true);
                setAlertSeverity("error");
                setAlertMsg("Failed syncing accounts, try again later");
                console.log(error);
            });
    }, [selectedVault.guid, user.organizationid, fetchOrgUsers, viewvaultusers]);

    // Effects
    useEffect(() => {
        fetchOrgUsers();
    }, [fetchOrgUsers]);

    // Memoized rendered properties
    const renderedProperties = useMemo(() => {
        return properties.map((property, index) => (
            <PropertyRow
                key={index}
                property={property}
                index={index}
                onPropertyChange={handlePropertyChange}
                onRemoveProperty={removeProperty}
            />
        ));
    }, [properties, handlePropertyChange, removeProperty]);

    return (
        <>
            <PermissionDialog
                selectedVault={selectedVault.guid}
                handleAddPermission={handleAddPermission}
                selectedObject={selectedObject}
                fetchObjectPermisions={fetchObjectPermisions}
                permissions={objectpermissions}
                open={openObjectPermissionsDialog}
                close={() => setOpenObjectPermissionsDialog(false)}
            />
            <GroupUsersDialog
                selectedGroupUsers={selectedGroupUsers}
                selectedGroup={selecedGroup}
                selectedVault={selectedVault.guid}
                open={openGroupUsersDialog}
                close={setOpenGroupUsersDialog}
            />
            <AddPermissionDialog
                fetchObjectPermisions={fetchObjectPermisions}
                selectedObject={selectedObject}
                selectedVault={selectedVault.guid}
                listwithoughtpermissions={listwithoughtpermissions}
                open={openAddPermissionDialog}
                close={() => setOpenAddPermissionDialog(false)}
            />
            <MiniLoader loading={miniLoader} loaderMsg={loaderMsg} setLoading={setMiniLoader} />

            <div className="dashboard" style={{ fontFamily: STANDARD_FONT_FAMILY, fontSize: STANDARD_FONT_SIZE }}>
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    user={user}
                    userDisplayName={userDisplayName}
                    onNavigateHome={homePage}
                    onLogout={logoutUser}
                />

                <main className={`content ${sidebarOpen ? 'shifted' : 'full-width'}`}>
                    {/* <Tooltip title={sidebarOpen ? 'Minimize sidebar' : 'Expand sidebar'}>
                        <div className={`bump-toggle ${sidebarOpen ? 'attached' : 'moved'}`} onClick={toggleSidebar}>
                            <i style={{ fontSize: '16px' }} className={`fas fa-${sidebarOpen ? 'caret-left' : 'caret-right'} mx-2`}></i>
                        </div>
                    </Tooltip> */}

                    <div id="container" ref={containerRef} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', backgroundColor: '#fff' }}>
                        <div id="col1" ref={col1Ref} style={{ width: isMobile ? '100%' : '30%', backgroundColor: '#fff', minWidth: '35%', minHeight: '100vh' }}>
                            <Box
                                sx={[STYLES.headerBox, {

                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }]}

                            >
                                <Box
                                    onClick={toggleSidebar}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        cursor: 'pointer',
                                        borderRadius: 1,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: '#f0f4fa',
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                >
                                    <i className="fa-solid fa-bars" style={{ fontSize: '25px', color: '#2757aa' }} />
                                </Box>

                                <Box >
                                    <span style={{ fontSize: '14px' }} className='text-dark'>ADMIN MANAGER</span>
                                </Box>
                                <Tooltip title={`${user.first_name} ${user.last_name}`}>
                                    <Avatar
                                        alt={userDisplayName}
                                        {...stringAvatar(userDisplayName)}
                                         sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: '#2757aa',
                  fontSize: '13px',
                }}

                                    />
                                </Tooltip>
                            </Box>

                            <div style={{
                                backgroundColor: 'white',
                                fontSize: '13px',
                                borderRadius: '4px'
                            }}>
                                <ul style={{
                                    margin: 0,
                                    padding: 0,
                                    listStyle: 'none',
                                    overflowY: 'auto',
                                    marginLeft: '10px'
                                }}>
                                    <li style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                        {/* <i className="fas fa-building" style={{
                                            fontSize: '20px',
                                            marginRight: '8px',
                                            color: '#2757aa'
                                        }}></i> */}
                                        <span >Organization Name: <span style={{ color: '#2757aa' }}>{user.organization}</span></span>
                                    </li>

                                    <li style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s ease'
                                    }}>
                                        {/* <i className="fa-solid fa-database" style={{
                                            fontSize: '20px',
                                            marginRight: '8px',
                                            color: '#2757aa'
                                        }}></i> */}
                                        <span>Total Vaults: <span style={{ color: '#2757aa' }}>{user.vaultcount}</span></span>
                                        <span className='mx-2'>Total Users: <span style={{ color: '#2757aa' }}>{organizationusers.length}</span></span>
                                    </li>

                                </ul>
                            </div>

                            <div style={{ fontSize: '13px', overflowY: 'auto' }} className="mb-3 shadow-lg">
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
                                    viewLoginActivity={viewLoginActivity}
                                    viewloginactivity={viewloginactivity}
                                    viewvaultgroups={viewvaultgroups}
                                    vaultObjects={vaultObjects}
                                    viewloginaccounts={viewloginaccounts}
                                    vaults={vaults}
                                    setVaults={setVaults}
                                />
                            </div>



                        </div>

                        {!isMobile && (
                            <div id="divider" ref={dividerRef} onMouseDown={handleMouseDown} style={{ width: '5px', cursor: 'ew-resize', backgroundColor: '#ccc' }}></div>
                        )}

                        <div id="col2" ref={col2Ref} style={{ width: isMobile ? '100%' : '80%', backgroundColor: '#fff', minWidth: '35%', minHeight: '100vh' }}>
                            {viewCreateObject && (
                                <div id="newobject" style={{ fontSize: '13px', marginBottom: '20px' }}>
                                    <div>
                                        <Box sx={{ p: 3, boxShadow: 2, fontSize: '1.2em', display: 'flex', alignItems: 'center' }}>
                                            <i className="fas fa-plus mx-2" style={{ fontSize: '13px' }}></i> Create New Object
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
                                                    <ButtonComponent size="sm" onClick={addProperty} sx={STYLES.buttonStyle}>
                                                        <i className="fas fa-tag mx-1"></i> Add Property
                                                    </ButtonComponent>
                                                    <ButtonComponent onClick={handleSubmit} sx={STYLES.buttonStyle}>
                                                        <i className="fas fa-plus-circle mx-1"></i> Create Object
                                                    </ButtonComponent>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        <Box className="container-fluid" sx={{ overflowY: 'auto' }}>
                                            {renderedProperties}
                                        </Box>
                                    </div>
                                </div>
                            )}

                            {viewObjects && (
                                <>
                                    <h6 className='shadow-lg p-3'>
                                        <i className="fa-solid fa-database mx-2" style={{ fontSize: '13px', color: '#2757aa' }}></i>
                                        {selectedVault.name} ( Vault Objects )
                                    </h6>

                                    <div id='vaultobjects' style={{ fontSize: '13px', marginBottom: '20px' }}>
                                        <div style={{ boxShadow: 'none' }} className='shadow-lg p-3'>
                                            <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                                <TableHead className='my-3 p-3'>
                                                    <TableRow>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Object Name</TableCell>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Object ID</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                            </Table>
                                            <div style={{ overflowY: 'auto' }}>
                                                <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                                    <TableBody>
                                                        {vaultObjects.map((row) => (
                                                            <TableRow key={row.object_id}>
                                                                <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                                                                    <i className="fas fa-layer-group mx-2" style={{ fontSize: '13px', color: '#2a68af' }}></i>
                                                                    {row.name_singular}
                                                                </TableCell>
                                                                <TableCell style={{ borderBottom: 'none' }}>{row.object_id}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {viewObjectStructure && (
                                <div id='updateobjstructure' style={{ fontSize: '13px', marginBottom: '20px' }}>
                                    <div>
                                        <h6 className='shadow-lg p-2' style={{ fontSize: '1.2em' }}>
                                            <i className="fas fa-edit mx-2" style={{ fontSize: '13px' }}></i> Update Object
                                        </h6>
                                        <ObjComponent
                                            selectedObjectStructure={selectedObjectStructure}
                                            setSelectedObjectStructure={setSelectedObjectStructure}
                                            authTokens={authTokens}
                                        />
                                    </div>
                                </div>
                            )}

                            {vaultGroups && (
                                <div id='permissions' style={{ fontSize: '13px', marginBottom: '20px' }}>
                                    <div>
                                        <h6 className='shadow-lg p-2'>
                                            <i className="fa-solid fa-database mx-2" style={{ fontSize: '13px' }}></i>
                                            {selectedVault.name} ( User Groups )
                                        </h6>

                                        <TableContainer component={Paper} sx={{ boxShadow: 'none' }} className='shadow-lg p-3' style={{ overflowY: 'auto' }}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => alert("add user group")}
                                                style={{ textTransform: 'none' }}
                                                className='my-2'
                                            >
                                                <small>
                                                    <i className="fas fa-users" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Add New User Group
                                                </small>
                                            </Button>
                                            <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                                <TableHead>
                                                    <TableRow className='my-3'>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Name</TableCell>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>ID</TableCell>
                                                        <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {userGroups.map((row) => (
                                                        <TableRow key={row.object_id}>
                                                            <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                                                                <i className="fas fa-users mx-2" style={{ fontSize: '13px', color: '#2a68af' }}></i>
                                                                {row.title}
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
                                                                    <small>
                                                                        <i className="fas fa-users" style={{ fontSize: '11px', cursor: 'pointer' }}></i> Manage Users
                                                                    </small>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </div>
                            )}

                            {viewLoginAccounts && (
                                <div id='usermanagement' style={{ fontSize: '13px', marginBottom: '20px' }}>
                                    <div>
                                        <h6 className='shadow-lg p-3'>
                                            <i className="fas fa-users mx-2" style={{ fontSize: '13px', color: '#2757aa' }}></i>
                                            Login Accounts
                                        </h6>
                                    </div>
                                    <div className='btn-group my-3' role="group" aria-label="Basic example">
                                        {/* Comments preserved as in original */}
                                    </div>
                                    <OrganizationUsersTable users={organizationusers} />
                                </div>
                            )}

                            {viewLoginActivity && (
                                <div id='loginactivity' style={{ fontSize: '13px', marginBottom: '20px' }}>
                                    <div>
                                        <h6 className='shadow-lg p-3'>
                                            <i className="fas fa-users mx-2" style={{ fontSize: '13px', color: '#2757aa' }}></i>
                                            Activity Logs
                                        </h6>
                                    </div>
                                    <div className='btn-group my-3' role="group" aria-label="Basic example">
                                        {/* Comments preserved as in original */}
                                    </div>
                                    <LoginActivityTable />
                                </div>
                            )}

                            {viewVaultUsers && (
                                <div className='p-2' id='vaultusermanagement' style={{ fontSize: '12px' }}>
                                    <h6 className='shadow-lg p-2'>
                                        <i className="fas fa-users mx-2" style={{ fontSize: '12px', color: '#2757aa' }}></i>
                                        <span style={{ color: '#2757aa' }}>{selectedVault.name}</span> Vault Users
                                    </h6>
                                    <VaultUsersTable
                                        alertOpen={alertOpen}
                                        setOpenAlert={setOpenAlert}
                                        alertSeverity={alertSeverity}
                                        setAlertSeverity={setAlertSeverity}
                                        alertMsg={alertMsg}
                                        setAlertMsg={setAlertMsg}
                                        setLoading={setLoading}
                                        loading={loading}
                                        syncUser={syncUser}
                                        fetchUsersNotLinkedToVault={fetchUsersNotLinkedToVault}
                                        usersnotlinkedtovault={usersnotlinkedtovault}
                                        setUsersNotLinkedToVault={setUsersNotLinkedToVault}
                                        vaultUsers={vaultUsers}
                                        vault={selectedVault}
                                        viewvaultusers={viewvaultusers}
                                    />
                                </div>
                            )}


                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default AdminDashboard;