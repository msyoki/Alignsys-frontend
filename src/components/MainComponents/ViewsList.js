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
import FileExt from '../FileExtIcon';
import FileExtText from '../FileExtText';

import OfficeApp from '../Modals/OfficeAppDialog';


const ViewsList = (props) => {
    const [otherviews, setOtherViews] = useState([]);
    const [commonviews, setCommonViews] = useState([]);
    const [selectedViewObjects, setSelectedViewObjects] = useState([]);
    const [selectedViewName, setSelectedViewName] = useState('');
    const [selectedViewCategory, setSelectedViewCategory] = useState([]);
    const [showOtherViewSublist, setshowOtherViewSublist] = useState(false);
    const [showCommonViewSublist, setshowCommonViewSublist] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [viewNavigation, setViewNavigation] = useState([])
    const [openOfficeApp, setOpenOfficeApp] = useState(false)
    const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useState({})
    
    

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
        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, {
                    ...item,
                    type: 'MFFolderContentItemTypePropertyFolder'
                }];
            }
            return prevItems;
        });

        try {
            const response = await axios.post(
                `${constants.mfiles_api}/api/Views/GetViewPropObjects`,
                {
                    viewId: item.viewId,
                    propId: `${item.propId}`,
                    propDatatype: `${item.propDatatype}`,
                    vaultGuid: `${props.selectedVault.guid}`
                },
                {
                    headers: {
                        accept: '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );
        
            setSelectedViewObjects(response.data);
            setSelectedViewName(item.title);

        } catch (error) {
            console.error('Error fetching view objects:', error);
        }
    }

    const fetchMainViewObjects = async (item, viewType) => {
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
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}`,
                {
                    headers: {
                        accept: '*/*',
                    }
                }
            );
       
            setSelectedViewObjects(response.data);
            setSelectedViewName(item.viewName);

        } catch (error) {
            console.error('Error fetching view objects:', error);
        }
    }

    const fetchMainViewObjects2 = async (item) => {
        // Add item to navigation with ViewFolder type
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

            setSelectedViewObjects(response.data);
            setSelectedViewName(item.title);

        } catch (error) {
            console.error('Error fetching view objects:', error);
        }
    }

    useEffect(() => {
        const savedOption = localStorage.getItem('selectedVault');

        const fetchData = async () => {
            try {
                const response = await axios.get(`${constants.mfiles_api}/api/Views/GetViews/${JSON.parse(savedOption).guid}`);

                setOtherViews(response.data.otherViews); // Assuming you want to render items from otherViews

                setCommonViews(response.data.commonViews); // Assuming you want to render items from otherViews

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [viewNavigation]);

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
          const url = `http://192.236.194.251:240/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
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
            alert('Failed to retrieve file extension.');
          }
        };
      
        fetchExtension();
      }

    return (
        <div style={{ height: '100%' }}>
        <OfficeApp open={openOfficeApp} close={() => setOpenOfficeApp(false)} object={objectToEditOnOffice} />
        {selectedViewObjects.length > 0 ? (
            <>
                <h6 className='p-3 text-dark' style={{ fontSize: '12px', backgroundColor: '#e8f9fa', cursor: 'pointer' }}>
                    <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#1d3557', fontSize: '20px' }} />
                    {viewNavigation.map((item, index) => (
                        <React.Fragment key={index}>
                            <span onClick={() => handleViewNavClick(item)} style={{ cursor: 'pointer' }}>
                                {item.title}{item.index}
                            </span>
                            <span className="fas fa-chevron-right mx-2" style={{ color: '#2a68af' }}></span>
                        </React.Fragment>
                    ))}
                </h6>
                <div style={{ height: '65vh', overflowY: 'scroll' }} className='shadow-lg p-3'>
                    {selectedViewObjects.map((item, index) => (
                        <React.Fragment key={index}>
                            {item.type === "MFFolderContentItemTypeObjectVersion" && (
                                <Accordion
                                    expanded={selectedIndex === index}
                                    onChange={handleAccordionChange(index)}
                                    sx={{
                                        border: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)',
                                        '&:not(:last-child)': { borderBottom: selectedIndex === index ? '2px solid #0077b6' : '1px solid rgba(0, 0, 0, .125)' },
                                        '&::before': { display: 'none' },
                                    }}
                                >
                                    <AccordionSummary
                                        onClick={() => {props.previewSublistObject(item);props.previewObject(item)}}
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`panel${index}a-content`}
                                        id={`panel${index}a-header`}
                                        sx={{ bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit' }}
                                        className='shadow-sm'
                                    >
                                        <Typography variant="body1" style={{ fontSize: '12px' }}>
                                            {item.objectID === 0 || item.objectTypeId === 0 ? (
                                                <>
                                                    <FileExt guid={props.selectedVault.guid} objectId={item.id} classId={(item.classId !== undefined ? item.classId : item.classID)} />
                                                    {item.title}
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-layer-group mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i>
                                                    {item.title}
                                                </>
                                            )}
                                        </Typography>
                                    </AccordionSummary>
                                    {props.linkedObjects && props.linkedObjects.requisitionID === item.internalID && (
                                        <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className='p-2 shadow-sm mx-3'>
                                            {props.loadingobjects ? (
                                                <div className='text-center'>
                                                    <CircularProgress style={{ width: '20px', height: '20px' }} />
                                                    <p className='text-dark' style={{ fontSize: '11px' }}>Searching relationships...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {props.linkedObjects.length > 0 ? (
                                                        <>
                                                            {relatedObjects.length > 0 && (
                                                                <>
                                                                    <Typography variant="body2" style={{ fontSize: '11px', color: "#fff", backgroundColor: '#1d3557' }} className='p-1'>
                                                                        Related Objects ({relatedObjects.length})
                                                                    </Typography>
                                                                    <table id='createdByMe' className="table" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                                                        <tbody>
                                                                            {relatedObjects.map((relatedItem, relatedIndex) => (
                                                                                <tr key={relatedIndex} onClick={() => props.previewObject(relatedItem)} style={{ cursor: 'pointer' }}>
                                                                                    <td>
                                                                                        <i className="fas fa-layer-group mx-1" style={{ fontSize: '15px', color: '#1d3557' }}></i>
                                                                                        {relatedItem.title}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </>
                                                            )}
                                                            {relatedDocuments.length > 0 && (
                                                                <>
                                                                    <Typography variant="body2" style={{ fontSize: '11px', color: "#fff", backgroundColor: '#1d3557' }} className='p-1'>
                                                                        Attached Documents ({relatedDocuments.length})
                                                                    </Typography>
                                                                    <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }}>
                                                                        <tbody>
                                                                            {relatedDocuments.map((doc, docIndex) => (
                                                                                <tr key={docIndex} onClick={() => props.previewSublistObject(doc)} onDoubleClick={() => openApp(doc)} style={{ cursor: 'pointer' }}>
                                                                                    <td>
                                                                                        <FileExt guid={props.selectedVault.guid} objectId={doc.id} classId={(doc.classId !== undefined ? doc.classId : doc.classID)} />
                                                                                        {doc.title}.<FileExtText guid={props.selectedVault.guid} objectId={doc.id} classId={(doc.classId !== undefined ? doc.classId : doc.classID)} />
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No Relationships Found</p>
                                                    )}
                                                </>
                                            )}
                                        </AccordionDetails>
                                    )}
                                </Accordion>
                            )}
                            {item.type === "MFFolderContentItemTypePropertyFolder" && (
                                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }}>
                                    <li onClick={() => fetchViewData(item)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                        <i className='fas fa-folder-plus mx-2' style={{ color: '#6a994e', fontSize: '20px' }}></i>
                                        <span className='list-text'>{item.title}</span>
                                    </li>
                                </ul>
                            )}
                            {item.type === "MFFolderContentItemTypeViewFolder" && (
                                <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }}>
                                    <li onClick={() => fetchMainViewObjects2(item)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#1d3557', fontSize: '20px' }} />
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
                {commonviews.length > 0 && (
                    <>
                        <h6 onClick={toggleCommonViewSublist} className='p-3 text-dark' style={{ fontSize: '12px', backgroundColor: '#e8f9fa', cursor: 'pointer' }}>
                            <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1d3557' }}></i> Common Views <small style={{ color: '#2a68af' }}>({commonviews.length})</small>
                        </h6>
                        {showCommonViewSublist && (
                            <div style={{ height: '30vh', overflowY: 'scroll' }} className='ml-4 shadow-lg'>
                                {commonviews.map((view) => (
                                    <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }} key={view.viewName}>
                                        <li onClick={() => fetchMainViewObjects(view, "Common Views")} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                            <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#1d3557', fontSize: '20px' }} />
                                            <span className='list-text'>{view.viewName}</span>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        )}
                    </>
                )}
                {otherviews.length > 0 && (
                    <>
                        <h6 onClick={toggleOtherViewSublist} className='p-3 text-dark' style={{ fontSize: '12px', backgroundColor: '#e8f9fa', cursor: 'pointer' }}>
                            <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#1d3557' }}></i> Other Views <small style={{ color: '#2a68af' }}>({otherviews.length})</small>
                        </h6>
                        {showOtherViewSublist && (
                            <div style={{ height: '30vh', overflowY: 'scroll' }} className='ml-4 shadow-lg'>
                                {otherviews.map((view) => (
                                    <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }} key={view.viewName}>
                                        <li onClick={() => fetchMainViewObjects(view, "Other Views")} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                                            <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#1d3557', fontSize: '20px' }} />
                                            <span className='list-text'>{view.viewName}</span>
                                        </li>
                                    </ul>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </>
        )}
    </div>
    
    );
};

export default ViewsList;
