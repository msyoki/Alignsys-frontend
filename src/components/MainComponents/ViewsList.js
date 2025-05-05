import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Typography } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ObjectPropValue from '../ObjectPropValue'
import * as constants from '../Auth/configs'
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';
import { Tooltip } from '@mui/material';
import OfficeApp from '../Modals/OfficeAppDialog';
import LoadingDialog from '../Loaders/LoaderDialog';
import BasicSimpleTreeView from '../Tree';


import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LinkedObjectsTree from './LinkedObjectsTree';



const ViewsList = (props) => {

    function useSessionState(key, defaultValue) {
        const getInitialValue = () => {
            try {
                const stored = sessionStorage.getItem(key);
                if (stored === null || stored === 'undefined') {
                    return defaultValue;
                }
                return JSON.parse(stored);
            } catch (e) {
                console.warn(`Failed to parse sessionStorage item for key "${key}":`, e);
                return defaultValue;
            }
        };

        const [value, setValue] = useState(getInitialValue);

        useEffect(() => {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn(`Failed to save sessionStorage item for key "${key}":`, e);
            }
        }, [key, value]);

        return [value, setValue];
    }

    const [otherviews, setOtherViews] = useSessionState('ss_otherviews', []);
    const [commonviews, setCommonViews] = useSessionState('ss_commonviews', []);
    const [selectedViewObjects, setSelectedViewObjects] = useSessionState('ss_selectedViewObjects', []);
    const [selectedViewName, setSelectedViewName] = useSessionState('ss_selectedViewName', '');
    const [selectedViewCategory, setSelectedViewCategory] = useSessionState('ss_selectedViewCategory', []);
    const [showOtherViewSublist, setshowOtherViewSublist] = useSessionState('ss_showOtherViewSublist', true);
    const [showCommonViewSublist, setshowCommonViewSublist] = useSessionState('ss_showCommonViewSublist', true);
    const [selectedIndex, setSelectedIndex] = useSessionState('ss_selectedIndex', null);
    const [viewNavigation, setViewNavigation] = useSessionState('ss_viewNavigation', []);
    const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
    const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
    const [loading, setLoading] = useSessionState('ss_loading', false);



    // const [otherviews, setOtherViews] = useState([]);
    // const [commonviews, setCommonViews] = useState([]);
    // const [selectedViewObjects, setSelectedViewObjects] = useState([]);
    // const [selectedViewName, setSelectedViewName] = useState('');
    // const [selectedViewCategory, setSelectedViewCategory] = useState([]);
    // const [showOtherViewSublist, setshowOtherViewSublist] = useState(true);
    // const [showCommonViewSublist, setshowCommonViewSublist] = useState(true);
    // const [selectedIndex, setSelectedIndex] = useState(null);
    // const [viewNavigation, setViewNavigation] = useState([]);
    // const [openOfficeApp, setOpenOfficeApp] = useState(false);
    // const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useState({});
    // const [loading, setLoading] = useState(false);



    const relatedObjects = props.linkedObjects.filter(item => item.objectID !== 0);
    const relatedDocuments = props.linkedObjects.filter(item => item.objectID === 0);


    const handleAccordionChange = (index) => (event, isExpanded) => {
        setSelectedIndex(isExpanded ? index : null);
    };


    const backHome = () => {
        setSelectedViewObjects([])
        setSelectedViewName('')
        setSelectedViewCategory('')
    }


    const toggleCommonViewSublist = () => {
        setshowCommonViewSublist(!showCommonViewSublist);
        setshowOtherViewSublist(showOtherViewSublist);
    };


    const toggleOtherViewSublist = () => {
        setshowOtherViewSublist(!showOtherViewSublist);
        setshowCommonViewSublist(showCommonViewSublist);
    };

    const fetchViewData = async (item) => {
        // Add item to navigation if not already present
        // console.log(item)
        setLoading(true)

        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.propId === item.propId);
            const updatedItems = exists ? prevItems : [...prevItems, { ...item, type: item.type, title: item.title }];

            // Process further within the updater function context
            processNavigation(updatedItems);

            return updatedItems;
        });



        const processNavigation = (updatedItems) => {
            const newItem = {
                "propId": `${item.propId}`,
                "propDatatype": `${item.propDatatype}`
            };


            const itemList = updatedItems.filter(item => item.type && item.type === "MFFolderContentItemTypePropertyFolder");

            // Transform the list to keep only propId and propDatatype
            const transformedList = itemList.map(i => ({
                "propId": i.propId,
                "propDatatype": i.propDatatype
            }));

            console.log(transformedList);
            console.log(updatedItems);



            // Function to check if the new item exists
            function itemExists(list, item) {
                return list.some(existingItem =>
                    existingItem.propId === item.propId &&
                    existingItem.propDatatype === item.propDatatype
                );
            }

            // Add the new item if it doesn't exist
            if (!itemExists(transformedList, newItem)) {
                transformedList.push(newItem);
            }

            // Log the updated item list
            // console.log({
            //     viewId: item.viewId,
            //     properties: transformedList,
            //     vaultGuid: `${props.selectedVault.guid}`
            // });

            apiRequest(transformedList)

        };


        const apiRequest = async (newPropList) => {
            // Pending testing added filterprops as a list 
            try {
                const response = await axios.post(
                    `${constants.mfiles_api}/api/Views/GetViewPropObjects`,
                    {
                        viewId: item.viewId,
                        properties: newPropList,
                        vaultGuid: `${props.selectedVault.guid}`
                    },
                    {
                        headers: {
                            accept: '*/*',
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(response.data)
                setLoading(false)


                setSelectedViewObjects(response.data);
                console.log(response.data)
                setSelectedViewName(item.title);

            } catch (error) {
                setLoading(false)
                props.setAlertPopOpen(true);
                props.setAlertPopSeverity("info");
                props.setAlertPopMessage("Sorry, we couldn't find any objects matching your request.!");
                console.error('Error fetching view objects:', error);
            }
        }
    }

    const fetchMainViewObjects = async (item, viewType) => {
        setLoading(true)
        // Add item to navigation with view type
        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, {
                    ...item,
                    type: viewType,
                    title: item.viewName
                }];
            }
            return prevItems;
        });

        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.mfilesId}`,
                {
                    headers: {
                        accept: '*/*',
                    }
                }
            );
            setLoading(false)
            console.log("fetchMainViewObjects")
            console.log(response.data)
            setSelectedViewObjects(response.data);
            setSelectedViewName(item.viewName);

        } catch (error) {
            setLoading(false)
            props.setAlertPopOpen(true);
            props.setAlertPopSeverity("info");
            props.setAlertPopMessage("Sorry, we couldn't find any objects matching your request.!");
            console.error('Error fetching view objects:', error);
        }
    }

    const fetchMainViewObjects2 = async (item) => {
        // Add item to navigation with ViewFolder type

        setLoading(true)
        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, {
                    ...item,
                    type: 'MFFolderContentItemTypeViewFolder'
                }];
            }
            return prevItems;
        });

        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}`,
                {
                    headers: {
                        accept: '*/*',
                    }
                }
            );
            console.log("fetchMainViewObjects2")
            console.log(response.data)
            setLoading(false)
            setSelectedViewObjects(response.data);
            setSelectedViewName(item.title);

        } catch (error) {

            setLoading(false)
            props.setAlertPopOpen(true);
            props.setAlertPopSeverity("info");
            props.setAlertPopMessage("Sorry, we couldn't find any objects matching your request!");
            console.error('Error fetching view objects:', error);
        }
    }

    useEffect(() => {
        const savedOption = localStorage.getItem('selectedVault');

        const fetchData = async () => {
            const guid = JSON.parse(savedOption).guid;
            try {
                const response = await axios.get(
                    `${constants.mfiles_api}/api/Views/GetViews/${guid}/${props.mfilesId}`
                );

                // Sort the views alphabetically by their names before setting state
                const sortedOtherViews = response.data.otherViews.sort((a, b) =>
                    a.viewName.localeCompare(b.viewName)
                );

                const sortedCommonViews = response.data.commonViews.sort((a, b) =>
                    a.viewName.localeCompare(b.viewName)
                );

                setOtherViews(sortedOtherViews);
                setCommonViews(sortedCommonViews);
                // console.log(sortedOtherViews)
                // console.log(sortedCommonViews)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [viewNavigation, props.mfilesId]);


    const handleViewNavClick = (item) => {
        // Remove clicked item and all items after it from navigation
        const itemIndex = viewNavigation.findIndex(navItem => navItem.id === item.id);
        if (itemIndex !== -1) {
            const updatedItems = viewNavigation.slice(0, itemIndex + 1);
            setViewNavigation(updatedItems);
        }

        // Handle navigation based on item type
        switch (item.type) {
            case 'Common Views':
            case 'Other Views':
                fetchMainViewObjects(item, item.type);
                break;
            case 'MFFolderContentItemTypeViewFolder':
                fetchMainViewObjects2(item);
                break;
            case 'MFFolderContentItemTypePropertyFolder':
                fetchViewData(item);
                break;
            default:
            // console.log('Unknown type');
        }
    };

    function openApp(item) {
        const fetchExtension = async () => {
            const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
            try {
                const response = await axios.get(url);
                const data = response.data;
                const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();

                if (extension === 'csv' || extension === 'xlsx' || extension === 'docx' || extension === 'txt') {
                    const updatedItem = {
                        ...item,
                        guid: props.selectedVault.guid,
                        extension: extension,
                        type: item.objectTypeId ?? item.objectID
                    };

                    setObjectToEditOnOfficeApp(updatedItem);
                    setOpenOfficeApp(true);
                }
            } catch (error) {
                console.error('Error fetching the extension:', error);

            }
        };

        fetchExtension();
    }

    const trimTitle = (title) => {
        const maxLength = 30; // Set your desired max length
        if (title.length > maxLength) {
            return title.substring(0, maxLength) + '...';
            // return title
        }
        return title;
    };

    const trimTitle2 = (title) => {
        const maxLength = 50; // Updated to match the desired max length
        if (title.length > maxLength) {
            // return title.substring(0, maxLength) + '...';
            return title
        }
        return title;
    };


    const backToViews = () => {
        setSelectedViewObjects([])
        setViewNavigation([])
        setSelectedViewCategory([])
    }

    const handleRowClick = (subItem) => {

        if (subItem.objectID === 0) {
            props.previewSublistObject(subItem, false);
        } else {
            props.previewObject(subItem, false);
        }
    };

    const documents = props.linkedObjects.filter(item => item.objecttypeID === 0);
    const otherObjects = props.linkedObjects.filter(item => item.objecttypeID !== 0);

    const filteredOtherViews = otherviews.filter(view => view.userPermission?.readPermission);
    const filteredCommonViews = commonviews.filter(view => view.userPermission?.readPermission);



    return (
        <>
            <LoadingDialog opendialogloading={loading} />
            <OfficeApp open={openOfficeApp} close={() => setOpenOfficeApp(false)} object={objectToEditOnOffice} />
            {selectedViewObjects.length > 0 ? (
                <>
                    <h6
                        className="p-2 text-dark d-flex flex-wrap"
                        style={{
                            fontSize: '12px',
                            backgroundColor: '#ecf4fc',
                            cursor: 'pointer',
                            gap: '8px',
                        }}
                    >
                        {/* Icon Column */}
                        <div className="d-flex align-items-start pt-1" style={{ minWidth: '24px' }}>
                            <FontAwesomeIcon
                                icon={faTable}
                                style={{ color: '#1C4690', fontSize: '20px' }}
                                className='mx-2'
                            />
                        </div>

                        {/* Text + Navigation Column */}
                        <div className="d-flex flex-wrap align-items-center" style={{ gap: '8px', flex: 1 }}>
                            <span onClick={backToViews}>Back to views</span>
                            <i className="fas fa-chevron-right" style={{ color: '#2a68af' }} />

                            {viewNavigation.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Tooltip title={item.title}>
                                        <span
                                            onClick={() => handleViewNavClick(item)}
                                            style={{
                                                cursor: 'pointer',
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word',
                                                maxWidth: '150px',
                                            }}
                                        >
                                            {trimTitle(item.title)}
                                        </span>
                                    </Tooltip>
                                    <i className="fas fa-chevron-right" style={{ color: '#2a68af' }} />
                                </React.Fragment>
                            ))}
                        </div>
                    </h6>


                    <div className='p-2 text-dark' style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {selectedViewObjects.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.type === "MFFolderContentItemTypeObjectVersion" && (
                                    // <Box sx={{ minHeight: 352, minWidth: 250 }}>
                                    <SimpleTreeView>
                                        <TreeItem
                                            key={`tree-item-${item.id || index}`} // Unique key
                                            itemId={`tree-item-${item.id || index}`} // Unique itemId
                                            onClick={() =>
                                                item.objectTypeId === 0
                                                    ? props.previewSublistObject(item, true)
                                                    : props.previewObject(item, true)
                                            }
                                            className='my-1 '


                                            sx={{
                                                marginLeft: '10px',
                                                fontSize: "12px", // Apply directly to TreeItem
                                                "& .MuiTreeItem-label": { fontSize: "12px !important" }, // Force label font size
                                                "& .MuiTypography-root": { fontSize: "12px !important" }, // Ensure all text respects this

                                                backgroundColor: "#fff !important",
                                                "&:hover": {
                                                    backgroundColor: "#fff !important", // Maintain white background on hover
                                                },

                                                borderRadius: "0px !important", // Remove border radius
                                                "& .MuiTreeItem-content": {
                                                    borderRadius: "0px !important", // Remove border radius from content area
                                                },



                                            }}
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    {item.objectTypeId === 0 ? (
                                                        <>
                                                            <FileExtIcon
                                                                guid={props.selectedVault.guid}
                                                                objectId={item.id}
                                                                classId={item.classId !== undefined ? item.classId : item.classID}
                                                            />
                                                        </>
                                                    ) : (
                                                        <i className="fa-solid fa-folder  " style={{ fontSize: '20px', color: '#2a68af', marginLeft: '8px' }}></i>
                                                    )}
                                                    <span style={{ marginLeft: '8px' }}>{item.title}{item.objectTypeId === 0 ? (
                                                        <>
                                                            <FileExtText
                                                                guid={props.selectedVault.guid}
                                                                objectId={item.id}
                                                                classId={item.classId}
                                                            />
                                                        </>
                                                    ) : null} </span>


                                                </Box>
                                            }
                                        >

                                            <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId !== undefined ? item.objectTypeId : item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} />
                                        </TreeItem>
                                    </SimpleTreeView>


                                )}
                                {item.type === "MFFolderContentItemTypePropertyFolder" && (


                                    <SimpleTreeView>
                                        <TreeItem
                                            key={`${index}`} // Unique key
                                            itemId={`${index}`} // Unique itemId
                                            onClick={() => fetchViewData(item)}

                                            sx={{
                                                fontSize: "12px", // Apply directly to TreeItem
                                                "& .MuiTreeItem-label": { fontSize: "12px !important" }, // Force label font size
                                                "& .MuiTypography-root": { fontSize: "12px !important" }, // Ensure all text respects this

                                                backgroundColor: "#fff",
                                                "&:hover": {
                                                    backgroundColor: "#fff !important", // Maintain white background on hover
                                                },

                                                borderRadius: "0px !important", // Remove border radius
                                                "& .MuiTreeItem-content": {
                                                    borderRadius: "0px !important", // Remove border radius from content area
                                                },
                                            }}
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <i className='fas fa-folder-plus mx-2' style={{ color: '#6a994e', fontSize: '20px' }}></i>
                                                    <span style={{ fontSize: '12px' }} className='list-text'>{item.title}</span>

                                                </Box>
                                            }
                                        >
                                        </TreeItem>
                                    </SimpleTreeView>
                                )}
                                {item.type === "MFFolderContentItemTypeViewFolder" && (

                                    <SimpleTreeView>
                                        <TreeItem
                                            key={`${index}`} // Unique key
                                            itemId={`${index}`} // Unique itemId
                                            onClick={() => fetchMainViewObjects2(item)}
                                            className='my-1'

                                            sx={{
                                                fontSize: "12px", // Apply directly to TreeItem
                                                "& .MuiTreeItem-label": { fontSize: "12px !important" }, // Force label font size
                                                "& .MuiTypography-root": { fontSize: "12px !important" }, // Ensure all text respects this

                                                backgroundColor: "#fff",
                                                "&:hover": {
                                                    backgroundColor: "#fff !important", // Maintain white background on hover
                                                },

                                                borderRadius: "0px !important", // Remove border radius
                                                "& .MuiTreeItem-content": {
                                                    borderRadius: "0px !important", // Remove border radius from content area
                                                },
                                            }}
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#1C4690', fontSize: '20px' }} />
                                                    <span style={{ fontSize: '12px' }} className='list-text'>{item.title}</span>

                                                </Box>
                                            }
                                        >
                                        </TreeItem>
                                    </SimpleTreeView>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {filteredCommonViews.length > 0 && (
                        <div className='bg-white'>
                            <h6
                                onClick={toggleCommonViewSublist}
                                className="p-2 text-dark d-flex align-items-center justify-content-between"
                                style={{
                                    fontSize: '12px',
                                    backgroundColor: '#ecf4fc',
                                    cursor: 'pointer',
                                    display: 'flex'
                                }}
                            >
                                {/* List Icon and Text */}
                                <span className="d-flex align-items-center">
                                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i>
                                    Common Views
                                </span>

                                {/* Count in Small Tag */}
                                <small style={{ color: '#2a68af', fontSize: '12px' }}>({filteredCommonViews.length})</small>
                            </h6>

                            {showCommonViewSublist && (
                                <div style={{ height: '26vh', overflowY: 'auto' }} className=' text-dark bg-white '>
                                    {filteredCommonViews.map((view, index) => (

                                        <SimpleTreeView>
                                            <TreeItem
                                                key={`${index}`} // Unique key
                                                itemId={`${index}`} // Unique itemId
                                                onClick={() => fetchMainViewObjects(view, "Common Views")}
                                                className='my-1'

                                                sx={{
                                                    fontSize: "12px", // Apply directly to TreeItem
                                                    "& .MuiTreeItem-label": { fontSize: "12px !important" }, // Force label font size
                                                    "& .MuiTypography-root": { fontSize: "12px !important" }, // Ensure all text respects this

                                                    backgroundColor: "#fff",
                                                    "&:hover": {
                                                        backgroundColor: "#fff !important", // Maintain white background on hover
                                                    },

                                                    borderRadius: "0px !important", // Remove border radius
                                                    "& .MuiTreeItem-content": {
                                                        borderRadius: "0px !important", // Remove border radius from content area
                                                    },
                                                }}
                                                label={
                                                    <Box display="flex" alignItems="center">
                                                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                                                        <span style={{ fontSize: '12px' }} className='list-text'>{view.viewName}</span>
                                                    </Box>
                                                }
                                            >
                                            </TreeItem>
                                        </SimpleTreeView>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {otherviews.length > 0 && (
                        <div className='bg-white'>
                            <h6
                                onClick={toggleOtherViewSublist}
                                className="p-2 text-dark d-flex align-items-center justify-content-between"
                                style={{
                                    fontSize: '12px',
                                    backgroundColor: '#ecf4fc',
                                    cursor: 'pointer',
                                    display: 'flex'
                                }}
                            >
                                {/* List Icon and Text */}
                                <span className="d-flex align-items-center">
                                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i>
                                    Other Views
                                </span>

                                {/* Count in Small Tag */}
                                <small style={{ color: '#2a68af', fontSize: '12px' }}>({otherviews.length})</small>
                            </h6>

                            {showOtherViewSublist && (
                                <div style={{ height: '26vh', overflowY: 'auto' }} className=' text-dark bg-white '>
                                    {otherviews.map((view, index) => (

                                        <SimpleTreeView>
                                            <TreeItem
                                                key={`${index}`} // Unique key
                                                itemId={`${index}`} // Unique itemId
                                                onClick={() => fetchMainViewObjects(view, "Other Views")}
                                                className='my-1'

                                                sx={{
                                                    fontSize: "12px", // Apply directly to TreeItem
                                                    "& .MuiTreeItem-label": { fontSize: "12px !important" }, // Force label font size
                                                    "& .MuiTypography-root": { fontSize: "12px !important" }, // Ensure all text respects this

                                                    backgroundColor: "#fff",
                                                    "&:hover": {
                                                        backgroundColor: "#fff !important", // Maintain white background on hover
                                                    },

                                                    borderRadius: "0px !important", // Remove border radius
                                                    "& .MuiTreeItem-content": {
                                                        borderRadius: "0px !important", // Remove border radius from content area
                                                    },
                                                }}
                                                label={
                                                    <Box display="flex" alignItems="center">
                                                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                                                        <span style={{ fontSize: '12px' }} className='list-text'>{view.viewName}</span>
                                                    </Box>
                                                }
                                            >
                                            </TreeItem>
                                        </SimpleTreeView>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </>

    );
};

export default ViewsList;
