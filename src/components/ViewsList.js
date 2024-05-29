import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolderOpen, faTable, faTasks, faChartBar, faUser, faCar, faFile, faFolder, faUserFriends, faPlus, faTag } from '@fortawesome/free-solid-svg-icons';


const ViewsList = (props) => {
    const [otherviews, setOtherViews] = useState([]);
    const [commonviews, setCommonViews] = useState([]);
    const [selectedViewObjects, setSelectedViewObjects] = useState([]);
    const [selectedViewName, setSelectedViewName] = useState('');
    const [selectedViewCategory, setSelectedViewCategory] = useState('');


    const backHome = () => {
        setSelectedViewObjects([])
        setSelectedViewName('')
        setSelectedViewCategory('')
    }

    const [showCommonViewSublist, setshowCommonViewSublist] = useState(false);
    const toggleCommonViewSublist = () => {
        setshowCommonViewSublist(!showCommonViewSublist);
    };

    const [showOtherViewSublist, setshowOtherViewSublist] = useState(false);
    const toggleOtherViewSublist = () => {
        setshowOtherViewSublist(!showOtherViewSublist);
    };

    const previewObject = async (objectId, classId) => {
        try {
            props.setLoadingPreviewObject(true)
            const response = await axios.get(`http://192.236.194.251:240/api/objectinstance/GetObjectViewProps/${props.selectedVault}/${objectId} `);
            props.setPreviewObjectProps(response.data)
            props.setLoadingPreviewObject(false)

        } catch (error) {
            console.error('Error fetching view objects:', error);
        }
    };
    const fetchViewObjects = async (viewId, viewName, viewCategory) => {
        try {
            const response = await axios.get(`http://192.236.194.251:240/api/Views/GetViewObjects/${props.selectedVault}/${viewId} `);
            setSelectedViewObjects(response.data);
            setSelectedViewName(viewName)
            setSelectedViewCategory(viewCategory)
        } catch (error) {
            console.error('Error fetching view objects:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://192.236.194.251:240/api/Views/GetViews/${props.selectedVault}`);
                setOtherViews(response.data.otherViews); // Assuming you want to render items from otherViews
                console.log(response.data.otherViews)
                setCommonViews(response.data.commonViews); // Assuming you want to render items from otherViews
                console.log(response.data.commonViews)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {selectedViewObjects.length > 0 ?
                <>
                    {/* <h6 className='p-2' style={{ fontSize: '12px', backgroundColor: '#2a68af', color: '#fff' }}>
                        <span onClick={backHome} style={{ cursor: 'pointer' }}>{selectedViewCategory}</span> <i class="fas fa-arrow-right mx-2"></i> {selectedViewName}
                    </h6>
                    <List >
                        {selectedViewObjects.map((item) => (
                            <ListItem className='p-0 mx-2' button key={item.id} onClick={() => previewObject(item.id, item.classID)} >

                                <FontAwesomeIcon icon={faFolder} className='mx-3' style={{ color: '#2a68af' }} />

                                <ListItemText primary={item.title} style={{ fontSize: '11px' }} />
                            </ListItem>
                        ))}
                    </List> */}
                    {commonviews.length > 0 ? <>
                        <h6  className='p-2' style={{ fontSize: '12px', backgroundColor: '#2a68af', color: '#fff' }}>  <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#fff', fontSize:'20px' }} /><span onClick={backHome} style={{ cursor: 'pointer' }}>{selectedViewCategory}</span> <i class="fas fa-arrow-right mx-2"></i> {selectedViewName} </h6>
                        <>
                            {selectedViewObjects.map((item) => (
                                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px', fontSize:'12px' }}>

                                    <li onClick={() => previewObject(item.id, item.classID)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                        <FontAwesomeIcon icon={faFolder} className='mx-3' style={{ color: '#2a68af', fontSize:'20px' }} />
                                        <span className='list-text'>{item.title}</span>
                                    </li>

                                </ul>
                            ))}
                        </>
                     
                    </> : <></>}
                </> :
                <>

                    {commonviews.length > 0 ? <>
                        <h6 onClick={toggleCommonViewSublist} className='p-2' style={{ fontSize: '12px', backgroundColor: '#2a68af', color: '#fff' }}> <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i> COMMON VIEWS ( {commonviews.length} ) </h6>

                        {showCommonViewSublist && (
                            <>
                                {commonviews.map((view) => (
                                    <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px', fontSize:'12px' }}>

                                        <li onClick={() => fetchViewObjects(view.id, view.viewName, 'COMMON VIEWS')} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                            <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#2a68af', fontSize:'20px' }} />
                                            <span className='list-text'>{view.viewName}</span>
                                        </li>

                                    </ul>
                                ))}
                            </>
                        )}

                    </> : <></>}

                    {otherviews.length > 0 ? <>
                        <h6 onClick={toggleOtherViewSublist} className='p-2' style={{ fontSize: '12px', backgroundColor: '#2a68af', color: '#fff' }}> <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i> OTHER VIEWS ( {otherviews.length} ) </h6>

                        {showOtherViewSublist && (
                            <>
                                {otherviews.map((view) => (
                                    <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px', fontSize:'12px' }}>

                                        <li onClick={() => fetchViewObjects(view.id, view.viewName, 'OTHER VIEWS')} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                            <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#2a68af', fontSize:'20px' }} />
                                            <span className='list-text'>{view.viewName}</span>
                                        </li>

                                    </ul>
                                ))}
                            </>
                        )}

                    </> : <></>}
                </>
            }


        </>
    );
};

export default ViewsList;
