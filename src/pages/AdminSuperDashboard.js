import React, {
    useContext,
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
    memo
} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

// Context
import Authcontext from '../components/Auth/Authprovider';

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
    Avatar,
    Stack,
} from '@mui/material';

import { People, Timeline } from "@mui/icons-material";

// Other components
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import ObjComponent from '../components/Admin/ObjStructureComponent';
import MiniLoader from '../components/Modals/MiniLoaderDialog';
import OrganizationVaultList from '../components/MainComponents/OrganizationVaultList';
import OrganizationUsersTable from '../components/Tables/OrganizationUsers';
import VaultUsersTable from '../components/Tables/VaultUsers';
import PermissionDialog from '../components/Modals/VaultObjectPermissionsDialog';
import AddPermissionDialog from '../components/Modals/AddVaultObjectPermissionDialog';
import GroupUsersDialog from '../components/Modals/ManageGoupUsersDialog';
import LoginActivityTable from '../components/LoginActivity';
import { toSentenceCase } from '../components/Utils/Utils';

// Constants and utilities
import * as constants from '../components/Auth/configs';
import logo from '../images/TechEdgeLogo.png';
import VaultFormDialog from '../components/Modals/AddVaultModal';
import RegisterVaultUsersForm from '../components/Registration/Register_vault_and _newUsers';

// ============= CONSTANTS =============
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
        backgroundColor: '#fff',
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

// ============= UTILITY FUNCTIONS =============
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
};

const stringAvatar = (name) => {
    const nameParts = name.split(' ');
    const firstInitial = nameParts[0]?.[0] || '';
    const secondInitial = nameParts[1]?.[0] || '';
    return {
        sx: { bgcolor: stringToColor(name) },
        children: `${firstInitial}${secondInitial}`,
    };
};

const capitalize = (input) => {
    const words = input.value.split(' ');
    const capitalizedWords = words.map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    input.value = capitalizedWords.join(' ');
};

// ============= CUSTOM HOOKS =============
const useResizeHandler = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isDragging, setIsDragging] = useState(false);
    const col1Ref = useRef(null);
    const col2Ref = useRef(null);
    const dividerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) return;

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const containerWidth = containerRef.current.getBoundingClientRect().width;
            let newCol1Width = (e.clientX / containerWidth) * 100;
            newCol1Width = Math.max(10, Math.min(90, newCol1Width));
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

// ============= MEMOIZED COMPONENTS =============
const Sidebar = memo(({ sidebarOpen, user, userDisplayName, onNavigateHome, onLogout }) => (
    <nav className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-content" style={{ fontFamily: STANDARD_FONT_FAMILY, fontSize: STANDARD_FONT_SIZE }}>
            {sidebarOpen && (
                <>
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
                    {/* Menu Items */}
                    <ul className="menu-items">
                        <li onClick={onNavigateHome} className="menu-item main-li shadow-lg">
                            <i className="fa-solid fa-arrow-left" style={{ fontSize: "18px" }}></i>
                            <span style={{ fontSize: "14px" }}>Return Home</span>
                        </li>

                    </ul>
                    <div>
                        <ul className="bottom-buttons">

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

const PropertyRow = memo(({ property, index, onPropertyChange, onRemoveProperty }) => (
    <Grid container spacing={2} alignItems="center" sx={{ fontSize: '9px', mb: 2 }}>
        <Grid item xs={12} sm={4}>
            <FormControl variant="standard" fullWidth>
                <Input
                    sx={STYLES.inputStyle}
                    placeholder="Property Title*"
                    value={property.title}
                    onChange={(e) => onPropertyChange(index, 'title', e.target.value)}
                    onInput={(e) => capitalize(e.target)}
                    required
                />
            </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
            <FormControl variant="standard" fullWidth>
                <Select
                    sx={STYLES.inputStyle}
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

const HeaderBox = memo(({ children, className, sx = {} }) => (
    <Box
        sx={[STYLES.headerBox, sx]}
        className={className}
    >
        {children}
    </Box>
));

const ObjectsTable = memo(({ vaultObjects, selectedVault }) => (
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
    </>
));

const VaultGroupsTable = memo(({ userGroups, selectedVault, onSelectedGroupUsers }) => (
    <div id='permissions' style={{ fontSize: '13px', marginBottom: '20px' }}>
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
                        <TableRow key={row.id}>
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
                                    onClick={() => onSelectedGroupUsers(row)}
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
));

// ============= MAIN COMPONENT =============
function SuperAdminDashboard() {
    // Context and navigation
    const { user, authTokens, logoutUser } = useContext(Authcontext);
    const navigate = useNavigate();

    // Custom hooks
    const { isMobile, col1Ref, col2Ref, dividerRef, containerRef, handleMouseDown } = useResizeHandler();

    // State management - grouped by functionality
    const [progress, setProgress] = useState(10);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    // Data state
    const [vaultObjects, setVaultObjects] = useState([]);
    const [vaultUsers, setVaultUsers] = useState([]);
    const [organizationusers, setOrganizationUsers] = useState([]);
    const [userGroups, setuserGroups] = useState([]);
    const [vaults, setVaults] = useState([]);
    const [objectpermissions, setObjectPermissions] = useState([]);
    const [usersnotlinkedtovault, setUsersNotLinkedToVault] = useState([]);
    const [addNewVault, setAddNewVault] = useState(true);

    const [showForm, setShowForm] = useState(true);

    const handleSuccess = (data) => {
        console.log('Registration successful:', data);
        alert('Vault and users registered successfully!');
        // You can handle success here - maybe redirect or refresh data
    };

    const handleCancel = () => {
        setShowForm(false);
        // Handle cancel - maybe go back to previous page
    };

    // UI state
    const [viewStates, setViewStates] = useState({
        vaultGroups: false,
        loginAccounts: false,
        loginActivity: false,
        createObject: false,
        objects: false,
        vaultSettings: false,
        vaultUsers: false,
        objectStructure: false,
    });

    // Selected items state
    const [selectedItems, setSelectedItems] = useState({
        objectStructure: {},
        vault: {},
        object: [],
        group: {},
    });

    // Dialog state
    const [dialogStates, setDialogStates] = useState({
        objectPermissions: false,
        addPermission: false,
        groupUsers: false,
    });

    // Form state
    const [formData, setFormData] = useState({
        objectName: '',
        properties: [],
    });

    // UI feedback state
    const [uiState, setUiState] = useState({
        miniLoader: false,
        loaderMsg: '',
        showSublist: false,
        showVaultSublist: false,
        showSublist1: false,
        loading: false,
        alertOpen: false,
        alertSeverity: '',
        alertMsg: '',
        value: 0,
    });

    const [listwithoughtpermissions, setListWithoughtPermissions] = useState({});

    // Memoized computed values
    const userDisplayName = useMemo(() => {
        const { first_name, last_name, username } = user;
        return first_name && last_name
            ? `${first_name} ${last_name}`
            : first_name || last_name || username;
    }, [user]);

    // Memoized handlers - organized by functionality
    const navigationHandlers = useMemo(() => ({
        homePage: () => navigate('/'),
        toggleSidebar: () => setSidebarOpen(prev => !prev),
        toggleMenu: () => setMenuOpen(prev => !prev),
    }), [navigate]);

    const viewHandlers = useMemo(() => ({
        toggleVaultSublist: () => setUiState(prev => ({ ...prev, showVaultSublist: !prev.showVaultSublist })),
        toggleSublist: () => setUiState(prev => ({ ...prev, showSublist: !prev.showSublist })),
        toggleSublist1: () => setUiState(prev => ({ ...prev, showSublist1: !prev.showSublist1 })),
        handleChange: (event, newValue) => setUiState(prev => ({ ...prev, value: newValue })),
    }), []);

    const formHandlers = useMemo(() => ({
        handlePropertyChange: (index, key, value) => {
            setFormData(prev => ({
                ...prev,
                properties: prev.properties.map((prop, i) =>
                    i === index ? { ...prop, [key]: value } : prop
                )
            }));
        },
        addProperty: () => {
            setFormData(prev => ({
                ...prev,
                properties: [...prev.properties, { title: '', dataType: '', required: '' }]
            }));
        },
        removeProperty: (index) => {
            setFormData(prev => ({
                ...prev,
                properties: prev.properties.filter((_, i) => i !== index)
            }));
        },
        setObjectName: (name) => {
            setFormData(prev => ({ ...prev, objectName: name }));
        },
    }), []);

    // View state management functions
    const setViewState = useCallback((stateName, value = true) => {
        setViewStates(prev =>
            Object.keys(prev).reduce((acc, key) => {
                acc[key] = key === stateName ? value : false;
                return acc;
            }, {})
        );
    }, []);

    const viewFunctions = useMemo(() => ({
        viewnewobject: () => setViewState('createObject'),
        viewvaultobjects: () => setViewState('objects'),
        viewobjectstructure: () => setViewState('objectStructure'),
        viewvaultgroups: () => setViewState('vaultGroups'),
        viewloginaccounts: () => setViewState('loginAccounts'),
        viewloginactivity: () => setViewState('loginActivity'),
    }), [setViewState]);

    // API functions
    const apiHandlers = useMemo(() => ({
        VaultUsergroups: async () => {
            try {
                const response = await axios.post(`${constants.auth_api}/api/vault-groups/`, {
                    vault_guid: selectedItems.vault.guid,
                });
                setuserGroups(response.data);
            } catch (error) {
                console.error('Error fetching vault user groups:', error);
            }
        },

        fetchObjectPermisions: async (object) => {
            try {
                setSelectedItems(prev => ({ ...prev, object }));
                const response = await axios.post(`${constants.auth_api}/api/get-vault-object-permissions/`, {
                    object_id: object.object_id,
                    vault_guid: selectedItems.vault.guid
                });
                setObjectPermissions(response.data);
                setDialogStates(prev => ({ ...prev, objectPermissions: true }));
            } catch (error) {
                console.error('Error fetching object permissions:', error);
            }
        },

        fetchVaultObjects: async (guid) => {
            try {
                const response = await axios.post(`${constants.auth_api}/api/get-vault-objects/`,
                    { guid },
                    { headers: { 'Authorization': `Bearer ${authTokens.access}` } }
                );
                setVaultObjects(response.data);
            } catch (error) {
                console.error('Error fetching vault objects:', error);
            }
        },

        fetchOrgUsers: async () => {
            try {
                const response = await axios.get(`${constants.auth_api}/api/users/organization/${user.organizationid}/`);
                setOrganizationUsers(response.data);
            } catch (error) {
                console.error('Error fetching organization users:', error);
            }
        },

        fetchUsersNotLinkedToVault: async (vault) => {
            try {
                const response = await axios.post(`${constants.auth_api}/api/users-not-linked-to-vault/`, { vault_id: vault });
                setUsersNotLinkedToVault(response.data.map(user => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name} (${user.email})`
                })));
            } catch (error) {
                console.error('Error fetching users not linked to vault:', error);
            }
        },

        viewvaultusers: async (vault) => {
            try {
                setVaultUsers([]);
                const response = await axios.post(`${constants.auth_api}/api/users-linked-to-vault/`, { vault_id: vault });
                setVaultUsers(response.data);
                setViewState('vaultUsers');
            } catch (error) {
                console.error('Error fetching vault users:', error);
            }
        },

        syncUser: async () => {
            try {
                setUiState(prev => ({ ...prev, loading: true }));
                const response = await axios.post(`${constants.auth_api}/api/sync-vault-users/`, {
                    guid: selectedItems.vault.guid,
                    organization_id: user.organizationid
                });

                await apiHandlers.fetchOrgUsers();
                await apiHandlers.viewvaultusers(selectedItems.vault.guid);

                setUiState(prev => ({
                    ...prev,
                    loading: false,
                    alertOpen: true,
                    alertSeverity: "success",
                    alertMsg: "Accounts were synced successfully"
                }));
            } catch (error) {
                setUiState(prev => ({
                    ...prev,
                    loading: false,
                    alertOpen: true,
                    alertSeverity: "error",
                    alertMsg: "Failed syncing accounts, try again later"
                }));
                console.error('Error syncing users:', error);
            }
        },
    }), [selectedItems.vault.guid, user.organizationid, authTokens.access, setViewState]);

    // Additional handlers
    const additionalHandlers = useMemo(() => ({
        selectedGroupUsers: (row) => {
            const group = userGroups.find(item => item.id === row.id);
            setSelectedItems(prev => ({ ...prev, group }));
            setDialogStates(prev => ({ ...prev, groupUsers: true }));
        },

        handleAddPermission: async (guid, object_id) => {
            try {
                const response = await axios.post(`${constants.auth_api}/api/list-users-without-permissions/`, {
                    vault_guid: guid,
                    object_id
                });
                setListWithoughtPermissions(response.data);
                setDialogStates(prev => ({ ...prev, addPermission: true }));
            } catch (error) {
                console.error('Error fetching users without permissions:', error);
            }
        },

        getObjectStructureById: async (id) => {
            try {
                viewFunctions.viewobjectstructure();
                const response = await axios.get(`${constants.auth_api}/api/structure/object/${id}/`);
                setSelectedItems(prev => ({ ...prev, objectStructure: response.data }));
            } catch (error) {
                console.error('Error fetching object structure:', error);
            }
        },

        handleSubmit: async () => {
            try {
                setUiState(prev => ({ ...prev, miniLoader: true, loaderMsg: "Adding New Object..." }));

                const payload = {
                    objectName: formData.objectName,
                    properties: formData.properties.map(property => ({
                        title: property.title,
                        propertytype: property.dataType,
                        isRequired: property.required
                    }))
                };

                // Validation
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
                    alert(`The following items are empty: ${emptyItems.join(", ")}`);
                }

                if (!alertsTriggered) {
                    await axios.post(`${constants.mfiles_api}/api/objectstracture/CreateObjectAdmin`, payload);
                    setFormData({ objectName: '', properties: [] });
                    alert('Object created successfully !!');
                }
            } catch (error) {
                console.error('Error creating object:', error);
                setFormData({ objectName: '', properties: [] });
                if (error.response) {
                    alert(`${error.response.data.message}`);
                } else if (error.request) {
                    alert('No response from server');
                } else {
                    alert('Error occurred');
                }
            } finally {
                setUiState(prev => ({ ...prev, miniLoader: false }));
            }
        },
    }), [userGroups, formData, viewFunctions]);

    // Effects
    useEffect(() => {
        apiHandlers.fetchOrgUsers();
    }, []);

    // Memoized rendered properties
    const renderedProperties = useMemo(() => {
        return formData.properties.map((property, index) => (
            <PropertyRow
                key={index}
                property={property}
                index={index}
                onPropertyChange={formHandlers.handlePropertyChange}
                onRemoveProperty={formHandlers.removeProperty}
            />
        ));
    }, [formData.properties, formHandlers]);

    return (
        <>
            <VaultFormDialog open={addNewVault} onClose={() => setAddNewVault(false)} />

            <div className="dashboard" style={{ fontFamily: STANDARD_FONT_FAMILY, fontSize: STANDARD_FONT_SIZE }}>
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    user={user}
                    userDisplayName={userDisplayName}
                    onNavigateHome={navigationHandlers.homePage}
                    onLogout={logoutUser}
                />



                <main className={`content ${sidebarOpen ? 'shifted' : 'full-width'}`}>
                 
                        <RegisterVaultUsersForm
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                
                </main>
            </div>
        </>
    );
}

export default SuperAdminDashboard;