import React, { useContext, useEffect, useState } from 'react';
import Authcontext from '../components/Auth/Authprovider';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import '../styles/Navbar.css'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Link, useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import ImageAvatars from '../components/Avatar';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccordionUsage from '../components/Accordion';
import logo from "../images/ZF.png";
import axios from 'axios'
import ObjComponent from '../components/Admin/SelectedObjComponent';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

import { Grid, MenuItem, Select, Input, TextField, FormControl, InputAdornment, InputLabel } from '@mui/material';
import NestedModal from '../components/NewObjectModal';
import DownloadCSV from '../components/DownloadCSV';
import MiniLoader from '../components/Modals/MiniLoader';
import LoadingMini from '../components/Loaders/LoaderMini';


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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // State for collapsible menu
    const { user, authTokens, logoutUser } = useContext(Authcontext);
    const [vaultObjects, setVaultObjects] = useState([])
    const [miniLoader, setMiniLoader] = useState(false);
    const [loaderMsg, setLoaderMsg] = useState('');


    const [viewPermissions, setViewpermissions] = useState(false);
    const [viewLoginAccounts, setViewLoginAccounts] = useState(false);
    const [viewCreateObject, setViewCreateObject] = useState(false);
    const [viewObjects, setViewObjects] = useState(false);
    const [viewObjectStructure, setViewObjectStructure] = useState(false);
    const [selectedObjectStructure, setSelectedObjectStructure] = useState({});


    const [value, setValue] = React.useState(0);
    const [showSublist, setShowSublist] = useState(false);
    const [showSublist1, setShowSublist1] = useState(false);
    const navigate = useNavigate()

    const homePage = () => {
        navigate('/')
    }
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
            url: `http://localhost:8000/api/structure/object/${id}/`,
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
            console.log(payload)
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
                console.log(payload)
                const response = await axios.post('http://localhost:8000/api/new/object/', payload, {
                    headers: {
                        'Authorization': `Bearer ${authTokens.access}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.status === 201) {
                    setMiniLoader(false)
                    alert('Object creacted successfully !!');
                    setObjectName('')
                    setProperties([])
                    // Handle success scenario
                }
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
        setViewLoginAccounts(false)
        setViewpermissions(false)
        setViewObjects(false)
        setViewObjectStructure(false)

    }

    const viewvaultobjects = () => {
        setViewObjects(true)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewpermissions(false)
        setViewObjectStructure(false)
    }

    const viewobjectstructure = () => {

        setViewObjectStructure(true)
        setViewObjects(false)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewpermissions(false)
    }
    const viewpermissions = () => {
        setViewpermissions(true)
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewObjects(false)
        setViewObjectStructure(false)

    }

    const viewloginaccounts = () => {
        setViewLoginAccounts(true)
        setViewCreateObject(false)
        setViewpermissions(false)
        setViewObjects(false)
        setViewObjectStructure(false)
    }

    useEffect(() => {
        const fetchVaultObjects = async () => {
            try {
                const payload = {
                    vault: user.vault
                }

                const headers = {
                    'Authorization': `Bearer ${authTokens.access}`,
                    'Content-Type': 'application/json'
                }
                const response = await axios.post('http://localhost:8000/api/vault/objects/', payload, headers);
                setVaultObjects(response.data);
            } catch (error) {
                console.error('Error fetching vault objects:', error);
            }
        };

        fetchVaultObjects();
    })

    return (

        <div className="dashboard">
            <MiniLoader loading={miniLoader} loaderMsg={loaderMsg} setLoading={setMiniLoader} />
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <img className=' mb-4' src={logo} alt="logo" width='100%' height='12%' />
                <ul className='text-center' style={{ listStyleType: 'none', fontSize: '13px' }}>

                    {sidebarOpen ?
                        <>




                            {/* <li style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-layer-group mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text  '>New Object Type</span>
                            </li> */}
                            <li className='mt-5' style={{ display: 'flex', alignItems: 'center' }} onClick={homePage}>
                                <i className="fas fa-home   mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Home</span>
                            </li>




                            <li style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-question-circle  mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Manual</span>
                            </li>
                            <li className='mt-5' onClick={logoutUser} style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-power-off mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Logout</span>
                            </li>

                            <li className='mt-5' onClick={toggleSidebar} style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-arrow-left mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Hide</span>
                            </li>

                        </>
                        : <>
                            <>

                                {/* <li ><i class="fas fa-layer-group" style={{ fontSize: '20px' }}></i> </li> */}
                                <li className='mt-5' onClick={homePage}><i class="fas fa-home" style={{ fontSize: '20px' }}></i></li>

                                <li ><i class="fas fa-question-circle" style={{ fontSize: '20px' }}></i></li>
                                <li className='mt-5' onClick={logoutUser}><i class="fas fa-power-off" style={{ fontSize: '20px' }}></i></li>
                                <li className='mt-5' onClick={toggleSidebar}  ><i class="fas fa-arrow-right" style={{ fontSize: '20px' }}></i></li>

                            </>
                        </>}

                </ul>

            </div>
            <div className="content bg-white" style={{height: '100vh', overflowY: 'scroll'}}>
                <div className="row  content-container" >
                    <div className="col-lg-4 col-md-4 col-sm-12  " style={{  fontSize: '12px' }}>
                        <h6 className='shadow-lg p-3'><i className="fas fa-cog  mx-2" style={{ fontSize: '1.5em' }}></i> VAULT MANAGEMENT</h6>
                        <ul className='shadow-lg p-3' >
                            <li onClick={viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                <i className="fas fa-plus mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Create New Vault Object</span>
                            </li>
                            <li onClick={toggleSublist} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Metadata Structure (Flat View)</span>
                            </li>

                            {showSublist && (
                                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>

                                    <li onClick={viewvaultobjects} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                        <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Object Types</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                        <i className="fas fa-hashtag mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Classes</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} >
                                        <i className="fas fa-tag mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Properties</span>
                                    </li>
                                </ul>
                            )}
                            <li onClick={toggleSublist1} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Metadata Structure (Hierarchical View)</span>
                            </li>
                            {showSublist1 && (
                                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>
                                    {vaultObjects.map((object, index) => (
                                        <li onClick={() => {  getObjectStructureById(object.object_id); }} key={index} className='my-3' style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} >
                                            <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>{object.object_name}</span>
                                        </li>
                                    ))}
                                    {/* <li onClick={viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} >
                                        <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Employee</span>
                                    </li>
                                    <li onClick={viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3'>
                                        <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Contact Person</span>
                                    </li>
                                    <li onClick={viewpermissions} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3'>
                                        <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Vendor</span>
                                    </li> */}
                                </ul>
                            )}
                            <li onClick={viewpermissions} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} >
                                <i className="fas fa-shield-alt mx-2" style={{ fontSize: '1.5em', cursor: 'pointer' }}></i>
                                <span className='list-text'>Permissions</span>
                            </li>
                            <li onClick={viewloginaccounts} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3' >
                                <i className="fas fa-users mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Login Accounts</span>
                            </li>

                        </ul>


                    </div>
                    <div className="col-lg-8 col-md-8 col-sm-12 shadow-lg" style={{  fontSize: '12px' }}>
                        {viewCreateObject ?
                            <div id='newobject' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                <div>
                                    <div>
                                        <h6 className='shadow-lg p-3' style={{ fontSize: '1.2em' }}>
                                            <i className="fas fa-plus mx-2" style={{ fontSize: '1.5em' }}></i> Create New Object
                                        </h6>
                                        <p className='my-3' style={{ fontSize: '0.8em' }}>Please create your new object type below with the respective properties</p>
                                    </div>
                                    <div className='card-body my-4'>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControl variant='standard' fullWidth>
                                                    <Input
                                                        id="objectName"
                                                        placeholder='Object name'
                                                        className='mx-2'
                                                        value={objectName}
                                                        onChange={(e) => setObjectName(e.target.value)}
                                                        type='text'
                                                        required
                                                        onInput={(e) => capitalize(e.target)}
                                                    />
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <ButtonComponent
                                                    size='sm'
                                                    onClick={addProperty}
                                                    className='mx-1'
                                                    style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                                    disabled={false}
                                                >
                                                    <i className="fas fa-tag mx-1"></i> Add Property
                                                </ButtonComponent>
                                                <ButtonComponent
                                                    onClick={handleSubmit}
                                                    className='mx-1'
                                                    style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                                    disabled={false}
                                                >
                                                    <i className='fas fa-plus-circle mx-1'></i> Create Object
                                                </ButtonComponent>
                                            </Grid>
                                        </Grid>
                                    </div>
                                    <div className='container-fluid'>
                                        {properties.map((property, index) => (
                                            <Grid container spacing={2} alignItems="center" key={index} style={{ fontSize: '9px', marginBottom: '10px' }}>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl variant="standard" fullWidth>
                                                        <Input
                                                            style={{ fontSize: '12px' }}
                                                            className='mx-2'
                                                            id={`title-input-${index}`}
                                                            placeholder='Property Title*'
                                                            value={property.title}
                                                            onChange={(e) => handlePropertyChange(index, 'title', e.target.value)}
                                                            type='text'
                                                            onInput={(e) => capitalize(e.target)}
                                                            required
                                                        />
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl variant='standard' fullWidth>
                                                        <Select
                                                            style={{ fontSize: '12px' }}
                                                            className='mx-2'
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
                                                    <FormControl variant='standard' fullWidth>
                                                        <Select
                                                            style={{ fontSize: '12px' }}
                                                            className='mx-2'
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
                                                    <ButtonComponent
                                                        onClick={() => removeProperty(index)}
                                                        className='mx-2'
                                                        style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '9px' }}
                                                        disabled={false}
                                                    >
                                                        <i className='fas fa-trash mx-1'></i> Remove Property
                                                    </ButtonComponent>
                                                </Grid>
                                            </Grid>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            : <></>

                        }

                        {viewObjects ?
                            <div id='vaultobjects' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                

                                    <h6 className='shadow-lg p-3 '><i className="fas fa-hdd  mx-2" style={{ fontSize: '1.5em' }}></i> Vault Objects</h6>
                                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }} className='shadow-lg p-3'>
                                        <Table className='table-sm p-3' sx={{ minWidth: 300 }} aria-label="simple table">
                                            <TableHead>
                                                <TableRow className='my-3'>
                                                    <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Object Name</TableCell>
                                                    <TableCell style={{ borderBottom: 'none', fontWeight: 'bold' }}>Object ID</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {vaultObjects.map((row) => (
                                                    <TableRow key={row.object_id}>
                                                        <TableCell component="th" scope="row" style={{ borderBottom: 'none' }}>
                                                            <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i> {row.object_name}
                                                        </TableCell>
                                                        <TableCell style={{ borderBottom: 'none' }}>{row.object_id}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                              
                            </div>
                            : <></>

                        }
                        {viewObjectStructure ?
                            <div id='updateobjstructure' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                <div>
                                    <div>
                                        <h6 className='shadow-lg p-3' style={{ fontSize: '1.2em' }}>
                                            <i className="fas fa-edit mx-2" style={{ fontSize: '1.5em' }}></i> Update Object
                                        </h6>
                                        {/* <p className='my-3' style={{ fontSize: '0.8em' }}>Please create your new object type below with the respective properties</p> */}
                                    </div>

                                    {/* {selectedObjectStructure?
                                    <>
                                        <div className='card-body my-4' >
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <FormControl variant='standard' fullWidth>
                                                                <Input
                                                                    id={selectedObjectStructure.object_id}
                                                                    placeholder={selectedObjectStructure.object_name}
                                                                    className='mx-2'
                                                                    value={selectedObjectStructure.object_name}
                                                                    onChange={(e) => setObjectName(e.target.value)}
                                                                    type='text'
                                                                    required
                                                                    onInput={(e) => capitalize(e.target)}
                                                                />
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <ButtonComponent
                                                                size='sm'
                                                                onClick={addProperty}
                                                                className='mx-1'
                                                                style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                                                disabled={false}
                                                            >
                                                                <i className="fas fa-tag mx-1"></i> Add Property
                                                            </ButtonComponent>
                                                            <ButtonComponent
                                                                onClick={handleSubmit}
                                                                className='mx-1'
                                                                style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }}
                                                                disabled={false}
                                                            >
                                                                <i className='fas fa-plus-circle mx-1'></i> Update Object
                                                            </ButtonComponent>
                                                        </Grid>
                                                    </Grid>
                                        </div>
                                        <div className='container-fluid'>
                                            {selectedObjectStructure.properties.map((property, index) => (
                                                <Grid container spacing={2} alignItems="center" key={index} style={{ fontSize: '9px', marginBottom: '10px' }}>
                                                    <Grid item xs={12} sm={4}>
                                                        <FormControl variant="standard" fullWidth>
                                                            <Input
                                                                style={{ fontSize: '12px' }}
                                                                className='mx-2'
                                                                id={property.property_id}
                                                                placeholder={property.property_title}
                                                                value={property.property_title}
                                                                onChange={(e) => handlePropertyChange(index, 'title', e.target.value)}
                                                                type='text'
                                                                onInput={(e) => capitalize(e.target)}
                                                                required
                                                            />
                                                        </FormControl>
                                                    </Grid>
                                                    <Grid item xs={12} sm={4}>
                                                        <FormControl variant='standard' fullWidth>
                                                            <Select
                                                                style={{ fontSize: '12px' }}
                                                                className='mx-2'
                                                                id={`dataType-select-${index}`}
                                                                displayEmpty
                                                                value={property.property_datatype}
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
                                                        <FormControl variant='standard' fullWidth>
                                                            <Select
                                                                style={{ fontSize: '12px' }}
                                                                className='mx-2'
                                                                id={`required-select-${index}`}
                                                                displayEmpty
                                                                value={property.property_required}
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
                                                        <ButtonComponent
                                                            onClick={() => removeProperty(index)}
                                                            className='mx-2'
                                                            style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '9px' }}
                                                            disabled={false}
                                                        >
                                                            <i className='fas fa-trash mx-1'></i> Remove Property
                                                        </ButtonComponent>
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </div>
                                    </>:
                                    <></>
                                    } */}
                                    <ObjComponent
                                        selectedObjectStructure={selectedObjectStructure}
                                        setSelectedObjectStructure={setSelectedObjectStructure}
                                        authTokens={authTokens}
                                    />

                                </div>
                            </div>
                            : <></>

                        }

                        {viewPermissions ?
                            <div id='permissions' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                <div>

                                    <h6 className='shadow-lg p-3'><i className="fas fa-user-secret  mx-2" style={{ fontSize: '1.5em' }}></i>Permissions</h6>
                                    <p className='my-3' style={{ fontSize: '10px' }}>Vault permissions Management</p>
                                </div>
                            </div>
                            : <></>

                        }

                        {viewLoginAccounts ?
                            <div id='usermanagement' style={{ fontSize: '12px', marginBottom: '20px' }}>
                                <div>

                                    <h6 className='shadow-lg p-3'><i className="fas fa-users  mx-2" style={{ fontSize: '1.5em' }}></i>Login Accounts</h6>
                                    <p className='my-3' style={{ fontSize: '10px' }}>user Account Management</p>
                                </div>
                                <DownloadCSV />
                            </div>
                            : <></>

                        }
                        {!viewLoginAccounts && !viewLoginAccounts && !viewPermissions && !viewObjects && !viewCreateObject && !viewObjectStructure ?
                            <div className='shadow-lg' style={{ fontSize: '12px', marginBottom: '20px' }}>
                            
                                    <h5 className='shadow-lg p-3'><img className="mx-3" src={logo} alt="Loading" width='40px' />Account Details </h5>
                                    <ul className=' p-3' >
                                        <li className='my-2' style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                            <i className="fas fa-building mx-3" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>Organization Name: {user.organization}</span>
                                        </li>
                                        <li className='my-2' onClick={toggleSublist} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                            <i className="fas fa-hdd mx-3" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>Vault ID : {user.vault}</span>
                                        </li>
                                        <li className='my-2' onClick={toggleSublist} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                            <i className="fas fa-users mx-3" style={{ fontSize: '1.5em' }}></i>
                                            <span className='list-text'>Number of Users : 20</span>
                                        </li>

                                    </ul>
                          

                            </div>
                            : <></>

                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
