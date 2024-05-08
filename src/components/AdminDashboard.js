import React, { useContext, useEffect, useState } from 'react';
import Authcontext from './Auth/Authprovider';
import '../styles/Dashboard.css'
import '../styles/Custombuttons.css'
import '../styles/Navbar.css'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Link, useNavigate } from "react-router-dom";
import Navbar from './Navbar';
import ImageAvatars from './Avatar';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AccordionUsage from './Accordion';
import logo from "../images/ZF.png";
import axios from 'axios'



import { Grid, MenuItem, Select, Input, FormControl, InputAdornment, InputLabel } from '@mui/material';
import NestedModal from './NewObjectModal';
import DownloadCSV from './DownloadCSV';


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
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false); // State for collapsible menu
    const { authTokens, logoutUser } = useContext(Authcontext);



    const [ viewPermissions, setViewpermissions ] = useState(false);
    const [ viewLoginAccounts, setViewLoginAccounts ] = useState(false);
    const [ viewCreateObject, setViewCreateObject ] = useState(false);


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
        { value: 'MFDatatypeLookup', label: 'choose from list' },
        { value: 'MFDatatypeMultiSelectLookup', label: 'choose from list (multi-select) ' },
        { value: 'MFDatatypeBoolean', label: 'Boolean (yes/no)' },
        { value: 'MFDatatypeInteger', label: 'Number (integer)' },
        { value: 'MFDatatypeDate', label: 'Date' },
        { value: 'MFDatatypeTime', label: 'Time' },
        { value: 'MFDatatypeTimestamp', label: 'Timestamp' },
        { value: 'MFDatatypeFloating', label: 'Floating' },


    ];


    const handleSubmit = async () => {
        try {
            const payload = {
                objectName: objectName,
                properties: properties.map(property => ({
                    title: property.title,
                    data_type: property.dataType
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
                    if (!property.data_type) {
                        emptyItems.push(`Property "${property.title}" data_type`);
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
                    alert('Object and properties created successfully');
                    // Handle success scenario
                } else {
                    alert('Failed to create object and properties');
                    // Handle error scenario
                }
            }



        } catch (error) {
            console.error('Error:', error.message);
            // Handle error scenario
        }
    };

    const handlePropertyChange = (index, key, value) => {
        const updatedProperties = [...properties];
        updatedProperties[index][key] = value;
        setProperties(updatedProperties);
    };

    const addProperty = () => {
        setProperties([...properties, { title: '', dataType: '' }]);
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

    }

    const viewpermissions = () => {
        setViewCreateObject(false)
        setViewLoginAccounts(false)
        setViewpermissions(true)
    }

    const viewloginaccounts = () => {
        setViewCreateObject(false)
        setViewLoginAccounts(true)
        setViewpermissions(false)
    }

    useEffect(() => {
        
    })

    return (
        <div className="dashboard">
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <img className=' mb-4' src={logo} alt="logo" width='100%' />
                <ul className='text-center' style={{ listStyleType: 'none', fontSize: '13px' }}>

                    {sidebarOpen ?
                        <>




                            {/* <li style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-layer-group mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text  '>New Object Type</span>
                            </li> */}
                            <li style={{ display: 'flex', alignItems: 'center' }} onClick={homePage}>
                                <i className="fas fa-home   mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Back Home</span>
                            </li>

                            <li onClick={toggleSidebar} style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-arrow-left mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Hide</span>
                            </li>


                            <li className='mt-5' style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-question-circle  mx-2" style={{ fontSize: '20px' }}></i>
                                <span className='list-text '>Manual</span>
                            </li>
                            <li onClick={logoutUser} style={{ display: 'flex', alignItems: 'center' }}>
                                <i className="fas fa-power-off mx-2" style={{ fontSize: '25px' }}></i>
                                <span className='list-text '>Logout</span>
                            </li>
                        </>
                        : <>
                            <>

                                {/* <li ><i class="fas fa-layer-group" style={{ fontSize: '20px' }}></i> </li> */}
                                <li onClick={homePage}><i class="fas fa-home" style={{ fontSize: '20px' }}></i></li>

                                <li onClick={toggleSidebar}  ><i class="fas fa-arrow-right" style={{ fontSize: '20px' }}></i></li>


                                <li className='mt-5'><i class="fas fa-question-circle" style={{ fontSize: '20px' }}></i></li>
                                <li onClick={logoutUser}><i class="fas fa-power-off" style={{ fontSize: '20px' }}></i></li>

                            </>
                        </>}

                </ul>
                {/* <div className="toggle-button" onClick={toggleSidebar}>
          {sidebarOpen ? 'Hide' : 'Show'}
        </div> */}
            </div>
            <div className="content">
                {/* Navbar with collapsible menu */}
                {/* <nav className="navbar">
          <div className="navbar-header">
            <div className="navbar-toggle" onClick={toggleMenu}>
              <span className="bar">=</span>
              <span className="bar">=</span>
              <span className="bar">=</span>
            </div>
          </div>
          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li>Home</li>
              <li>About</li>
              <li>Contact</li>
            </ul>
          </div>
        </nav> */}


                <div className="row ">
                    <div class="col-5 col-md-5 col-sm-12 "  >
                        <h6 className='shadow-lg'><i className="fas fa-cog mx-2 p-2 " style={{ fontSize: '1.5em' }}></i> Vault Cofigurations</h6>
                        <ul className='text-center shadow-lg p-3' style={{ listStyleType: 'none', padding: 0, height: '80vh', overflowY: 'scroll', fontSize: '12px', marginBottom: '20px' }}>
                            <li onClick={viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3'>
                                <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Create Object</span>
                            </li>
                            <li onClick={toggleSublist} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Metadata Structure (Flat View)</span>
                            </li>

                            {showSublist && (
                                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>

                                    <li onClick={viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3'>
                                        <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Object Types</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3'>
                                        <i className="fas fa-hashtag mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Classes</span>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} >
                                        <i className="fas fa-tag mx-2" style={{ fontSize: '1.5em' }}></i>
                                        <span className='list-text'>Properties</span>
                                    </li>
                                </ul>
                            )}
                            <li onClick={toggleSublist1} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3'>
                                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Metadata Structure (Hierarchical View)</span>
                            </li>
                            {showSublist1 && (
                                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>
                                    <li onClick={viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} >
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
                                    </li>
                                </ul>
                            )}
                            <li onClick={viewpermissions} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} >
                                <i className="fas fa-shield-alt mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Permissions</span>
                            </li>
                            <li onClick={viewloginaccounts} style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }} className='my-3' >
                                <i className="fas fa-users mx-2" style={{ fontSize: '1.5em' }}></i>
                                <span className='list-text'>Login Accounts</span>
                            </li>

                        </ul>


                    </div>
                    {viewCreateObject?
                        <div id='newobject' className='col-7 col-md-7 col-sm-12 shadow-lg p-4' style={{ height: '88vh', overflowY: 'scroll', fontSize: '12px', marginBottom: '20px' }}>
                            <div>
                                <h5>Create New Object</h5>
                                <p className='my-3' style={{ fontSize: '10px' }}>Please create your new object type below with the respective properties</p>
                            </div>
                            <div className='card-body'>
                                <Grid item xs={12}>
                                    <FormControl variant='standard'>
                                        <InputLabel htmlFor="objectName">Object Name</InputLabel>
                                        <Input
                                            id="objectName"
                                            value={objectName}
                                            onChange={(e) => setObjectName(e.target.value)}
                                            type='text'
                                            required
                                            onInput={(e) => capitalize(e.target)}
                                        />
                                    </FormControl>
                                    <ButtonComponent size='sm' onClick={addProperty} className='mx-1' style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }} disabled={false}><i class="fas fa-tag mx-1"></i> Add Property</ButtonComponent>
                                    <ButtonComponent onClick={handleSubmit} className='mx-1' style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '10px' }} disabled={false}><i className='fas fa-plus-circle mx-1'></i> Create Object</ButtonComponent>
                                </Grid>
                            </div>
                            <div className='container-fluid'>
                                {properties.map((property, index) => (
                                    <Grid item xs={12} key={index} container alignItems="center" style={{ fontSize: '9px' }}>
                                        <Grid item xs={4}>
                                            <FormControl variant="standard" className='mx-2'>
                                                <InputLabel id={`dataType-label-${index}`}>Property Title*</InputLabel>
                                                <Input
                                                    style={{ fontSize: '12px' }}
                                                    id={`dataType-input-${index}`}
                                                    value={property.title}
                                                    onChange={(e) => handlePropertyChange(index, 'title', e.target.value)}
                                                    type='text'
                                                    onInput={(e) => capitalize(e.target)}
                                                    required
                                                />
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <FormControl variant='standard' fullWidth>
                                                <InputLabel id={`dataType-label-${index}`}>Select Data Type</InputLabel>
                                                <Select
                                                    style={{ fontSize: '12px' }}
                                                    labelId={`dataType-label-${index}`}
                                                    value={property.dataType}
                                                    onChange={(e) => handlePropertyChange(index, 'dataType', e.target.value)}
                                                    required
                                                >
                                                    <MenuItem value="">Select Data Type</MenuItem>
                                                    {PROP_DATA_TYPES.map((item, index) => (
                                                        <MenuItem key={index} value={item.value}>{item.label}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <ButtonComponent onClick={() => removeProperty(index)} className='mx-2' style={{ textTransform: 'none', fontWeight: 'lighter', fontSize: '9px' }} disabled={false}><i className='fas fa-trash mx-1'></i> Remove Property</ButtonComponent>
                                        </Grid>
                                    </Grid>
                                ))}
                            </div>
                        </div>
                        :<></>
                       
                    }
                    
                    {viewPermissions?
                        <div id='permissions' className='col-7 col-md-7  col-sm-12 shadow-lg p-3' style={{ height: '85vh', overflowY: 'scroll', fontSize: '12px', marginBottom: '20px' }}>
                            <div>
                                <h5>Permissions</h5>
                                <p className='my-3' style={{ fontSize: '10px' }}>Vault permissions Management</p>
                            </div>
                        </div>
                        :<></>
                      
                    }

                    {viewLoginAccounts?
                        <div id='loginaccounts' className='col-7 col-md-7  col-sm-12 shadow-lg p-3' style={{ height: '85vh', overflowY: 'scroll', fontSize: '12px', marginBottom: '20px' }}>
                            <div>
                                <h5>Login Accounts</h5>
                                <p className='my-3' style={{ fontSize: '10px' }}>user Account Management</p>
                            </div>
                            <DownloadCSV />
                        </div>
                        :<></>
                        
                    }
                    
                    {!viewCreateObject && !viewPermissions && !viewLoginAccounts?
                        <div id='loginaccounts' className='col-7 col-md-7  col-sm-12 shadow-lg p-3' style={{ height: '85vh', overflowY: 'scroll', fontSize: '12px', marginBottom: '20px' }}>
                         
                        </div>:<></>
                    }
                



                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
