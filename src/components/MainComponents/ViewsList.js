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




const ViewsList = (props) => {
    const [otherviews, setOtherViews] = useState([]);
    const [commonviews, setCommonViews] = useState([]);
    const [selectedViewObjects, setSelectedViewObjects] = useState([]);
    const [selectedViewName, setSelectedViewName] = useState('');
    const [selectedViewCategory, setSelectedViewCategory] = useState([]);
    const [showOtherViewSublist, setshowOtherViewSublist] = useState(true);
    const [showCommonViewSublist, setshowCommonViewSublist] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [viewNavigation, setViewNavigation] = useState([]);
    const [openOfficeApp, setOpenOfficeApp] = useState(false);
    const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useState({});
    const [loading, setLoading] = useState(false);


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

            // console.log(transformedList);
            // console.log(updatedItems);



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
            // console.log(response.data)
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
                console.log(sortedOtherViews)
                console.log(sortedOtherViews)
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
                console.log('Unknown type');
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
        const maxLength = 12; // Set your desired max length
        if (title.length > maxLength) {
            return title.substring(0, maxLength) + '...';
        }
        return title;
    };

    const trimTitle2 = (title) => {
        const maxLength = 50; // Updated to match the desired max length
        if (title.length > maxLength) {
            return title.substring(0, maxLength) + '...';
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
                    <h6 className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e0fbfc', cursor: 'pointer' }}>

                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#1C4690', fontSize: '20px' }} />
                        <span onClick={backToViews} style={{ cursor: 'pointer', width: '0.05px' }}>Back to views</span>
                        <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span>
                        {viewNavigation.map((item, index) => (
                            <React.Fragment key={index}>
                                <Tooltip title={item.title}>
                                    <span onClick={() => handleViewNavClick(item)} style={{ cursor: 'pointer', width: '0.05px', overflowX: 'hidden' }}>
                                        {trimTitle(item.title)}
                                    </span>
                                </Tooltip>
                                <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span>
                            </React.Fragment>
                        ))}
                    </h6>
                    <div style={{ height: '60vh', overflowY: 'auto'}} className=' text-dark bg-white p-3'>
                        {selectedViewObjects.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.type === "MFFolderContentItemTypeObjectVersion" && (
                                    <Accordion
                                        expanded={selectedIndex === index}
                                        onChange={handleAccordionChange(index)}
                                        sx={{
                                            border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                                            '&:not(:last-child)': {
                                                borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                                            },
                                            '&::before': { display: 'none' },
                                        }}
                                    >
                                        {item.objectTypeId === 0 ? (
                                            <AccordionSummary
                                                onClick={() => props.previewSublistObject(item, true)}

                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`panel${index}a-content`}
                                                id={`panel${index}a-header`}
                                                sx={{
                                                    bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                                                    padding: 0, // Removes all padding
                                                    minHeight: 'unset', // Ensures the height is not restricted by default styles
                                                }}
                                                className="shadow-sm"
                                            >
                                                <Typography
                                                    variant="body1"
                                                    style={{
                                                        fontSize: '11px',
                                                        margin: 0, // Removes any extra margin
                                                    }}
                                                >
                                                    <span className='mx-1'> <FileExtIcon
                                                        guid={props.selectedVault.guid}
                                                        objectId={item.id}
                                                        classId={item.classId !== undefined ? item.classId : item.classID}
                                                    /></span>

                                                    {trimTitle2(item.title)}.<FileExtText
                                                        guid={props.selectedVault.guid}
                                                        objectId={item.id}
                                                        classId={item.classId}
                                                    />
                                                </Typography>
                                            </AccordionSummary>

                                        ) : (
                                            <AccordionSummary
                                                onClick={() => props.previewObject(item, true)}
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`panel${index}a-content`}
                                                id={`panel${index}a-header`}
                                                sx={{
                                                    bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                                                    padding: 0, // Removes all padding
                                                    minHeight: 'unset', // Ensures the height is not restricted by default styles
                                                }}
                                                className="shadow-sm"
                                            >
                                                <Typography variant="body1" style={{ fontSize: '11px' }}>
                                                    <i className="fas fa-layer-group mx-3" style={{ fontSize: '15px', color: '#2a68af' }}></i>
                                                    {trimTitle2(item.title)}
                                                </Typography>
                                            </AccordionSummary>
                                        )}

                                      
                                        {props.linkedObjects && (
                                            <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className="p-2 shadow-sm mx-3">
                                                {props.loadingobjects ? (
                                                    <div className="text-center">
                                                        <CircularProgress style={{ width: '20px', height: '20px' }} />
                                                        <p className="text-dark" style={{ fontSize: '11px' }}>Searching relationships...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {props.linkedObjects.length > 0 ? (
                                                            <>
                                                                {/* Render Other Objects */}
                                                                {otherObjects.map((item, index) => (
                                                                    <div key={index}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                                                                            className="p-1"
                                                                        >
                                                                          <i class="fas fa-stream mx-1"></i> <span>{item.objectTitle}</span> 
                                                                        </Typography>

                                                                        <table
                                                                            id="createdByMe"
                                                                            className="table table-hover"
                                                                            style={{ fontSize: '11px', backgroundColor: '#ffff' }}
                                                                        >
                                                                            <tbody>
                                                                                {item.items.map((subItem, subIndex) => (
                                                                                    <tr
                                                                                        key={subIndex}
                                                                                        onClick={() => handleRowClick(subItem)}
                                                                                        onDoubleClick={() => openApp(subItem)}
                                                                                        style={{ cursor: 'pointer' }}
                                                                                    >
                                                                                        <td>
                                                                                            {subItem.objectID === 0 ? (
                                                                                                <>
                                                                                                    <FileExtIcon
                                                                                                        guid={props.selectedVault.guid}
                                                                                                        objectId={subItem.id}
                                                                                                        classId={subItem.classID}
                                                                                                    />
                                                                                                    {subItem.title}.
                                                                                                    <FileExtText
                                                                                                        guid={props.selectedVault.guid}
                                                                                                        objectId={subItem.id}
                                                                                                        classId={subItem.classID}
                                                                                                    />
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                                                                                                    {subItem.title}
                                                                                                </>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                ))}

                                                                {/* Render Documents Together */}
                                                                {documents.length > 0 && (
                                                                    <>
                                                                        <Typography
                                                                            variant="body2"
                                                                            style={{ fontSize: '11.5px', color: "#fff", backgroundColor: '#2a68af' }}
                                                                            className="p-1"
                                                                        >
                                                                            <i class="fas fa-stream mx-1"></i><span>Document{documents.length > 0?<>s</>:<></>}</span> <small>( {documents.length} )</small>
                                                                        </Typography>

                                                                        <table
                                                                            id="createdByMe"
                                                                            className="table table-hover"
                                                                            style={{ fontSize: '11px', backgroundColor: '#ffff', margin: '0%' }}
                                                                        >
                                                                            <tbody>
                                                                                {documents.flatMap(item => item.items).map((subItem, index) => (
                                                                                    <tr
                                                                                        key={index}
                                                                                        onClick={() => handleRowClick(subItem)}
                                                                                        onDoubleClick={() => openApp(subItem)}
                                                                                        style={{ cursor: 'pointer' }}
                                                                                    >
                                                                                        <td>
                                                                                            {subItem.objectID === 0 ? (
                                                                                                <>
                                                                                                    <FileExtIcon
                                                                                                        guid={props.selectedVault.guid}
                                                                                                        objectId={subItem.id}
                                                                                                        classId={subItem.classID}
                                                                                                    />
                                                                                                    {subItem.title}.
                                                                                                    <FileExtText
                                                                                                        guid={props.selectedVault.guid}
                                                                                                        objectId={subItem.id}
                                                                                                        classId={subItem.classID}
                                                                                                    />
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    <i className="fas fa-layer-group mx-2" style={{ fontSize: '14px', color: '#2a68af' }}></i>
                                                                                                    {subItem.title}
                                                                                                </>
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p className="my-1 mx-1 text-center" style={{ fontSize: '11px' }}>
                                                                No Relationships Found
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </AccordionDetails>
                                        )}
                                    </Accordion>

                                )}
                                {item.type === "MFFolderContentItemTypePropertyFolder" && (
                                    <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }}>
                                        <li className='mx-4' onClick={() => fetchViewData(item)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                            <i className='fas fa-folder-plus mx-2' style={{ color: '#6a994e', fontSize: '20px' }}></i>
                                            <span className='list-text'>{item.title}</span>
                                        </li>
                                    </ul>
                                )}
                                {item.type === "MFFolderContentItemTypeViewFolder" && (
                                    <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }}>
                                        <li className='mx-4' onClick={() => fetchMainViewObjects2(item)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                            <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#1C4690', fontSize: '20px' }} />
                                            <span className='list-text'>{item.title}</span>
                                        </li>
                                    </ul>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    {filteredCommonViews.length > 0 && (
                        <div className='bg-white'>
                            <h6 onClick={toggleCommonViewSublist} className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e0fbfc', cursor: 'pointer' }}>
                                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i> Common Views <small style={{ color: '#2a68af' }}>({filteredCommonViews.length})</small>
                            </h6>
                            {showCommonViewSublist && (
                                <div style={{ height: '30vh', overflowY: 'auto' }} className='p-1  text-dark bg-white'>
                                    {filteredCommonViews.map((view) => (
                                        <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }} key={view.viewName}>
                                            <li className='mx-4' onClick={() => fetchMainViewObjects(view, "Common Views")} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                                <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                                                <span className='list-text'>{view.viewName}</span>
                                            </li>
                                        </ul>
                                    ))}
                                </div>
                            )}
                          </div>
                    )}
                    {filteredOtherViews.length > 0 && (
                        <div className='bg-white'>
                            <h6 onClick={toggleOtherViewSublist} className=' p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e0fbfc', cursor: 'pointer' }}>
                                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i> Other Views <small style={{ color: '#2a68af' }}>({filteredOtherViews.length})</small>
                            </h6>
                            {showOtherViewSublist && (
                                <div style={{ height: '30vh', overflowY: 'auto' }} className='p-1 text-dark bg-white'>
                                    {filteredOtherViews.map((view) => (
                                        <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }} key={view.viewName}>
                                            <li className='mx-4' onClick={() => fetchMainViewObjects(view, "Other Views")} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                                <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                                                <span className='list-text'>{view.viewName}</span>
                                            </li>
                                        </ul>
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
