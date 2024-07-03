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
import FileExt from '../FileExt';


const ViewsList = (props) => {
    const [otherviews, setOtherViews] = useState([]);
    const [commonviews, setCommonViews] = useState([]);
    const [selectedViewObjects, setSelectedViewObjects] = useState([]);
    const [selectedViewName, setSelectedViewName] = useState('');
    const [selectedViewCategory, setSelectedViewCategory] = useState('');
    const [showOtherViewSublist, setshowOtherViewSublist] = useState(true);
    const [showCommonViewSublist, setshowCommonViewSublist] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);

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


    const fetchViewObjects = async (viewId, viewName, viewCategory) => {
        try {
            const array = props.viewableobjects;
            const formattedString = array.join(',\n    ');
            const response = await axios.get(`${constants.mfiles_api}/api/Views/GetViewObjects/${props.selectedVault.guid}/${viewId}/${formattedString}`);
            setSelectedViewObjects(response.data);
            setSelectedViewName(viewName)
            setSelectedViewCategory(viewCategory)
        } catch (error) {
            console.error('Error fetching view objects:', error);
        }
    };

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
    }, []);

    return (
        <div >
            {selectedViewObjects.length > 0 ?
                <>
 
                    {selectedViewObjects.length > 0 ? <>
                        <h6 className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e5e5e5'}}>  <FontAwesomeIcon icon={faTable} className='mx-3 ' style={{ color: '#2a68af', fontSize: '20px' }} /><span onClick={backHome} style={{ cursor: 'pointer' }}>{selectedViewCategory}</span> <i class="fas fa-chevron-right mx-2"></i> {selectedViewName} </h6>
                        <div style={{ height: '65vh', overflowY: 'scroll' }} className='p-3 shadow-lg'>
                            {selectedViewObjects.map((item, index) => (
                                <Accordion key={index}
                                    expanded={selectedIndex === index}
                                    onChange={handleAccordionChange(index)}
                                    sx={{
                                        border: selectedIndex === index ? '2px solid #2a68af' : '1px solid rgba(0, 0, 0, .125)',
                                        '&:not(:last-child)': {
                                            borderBottom: selectedIndex === index ? '2px solid #2a68af' : '1px solid rgba(0, 0, 0, .125)',
                                        },
                                        '&::before': {
                                            display: 'none',
                                        },
                                    }} >
                                    {item.objectID === 0 ? <></> :
                                        <AccordionSummary onClick={() => props.previewObject(item)} expandIcon={<ExpandMoreIcon />}
                                            aria-controls={`panel${index}a-content`}
                                            id={`panel${index}a-header`}
                                            sx={{
                                                bgcolor: selectedIndex === index ? '#f8f9f' : 'inherit',
                                            }} >
                                            <Typography  variant="body1" style={{ fontSize: '12px' }}><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i> <ObjectPropValue vault={props.selectedVault.guid} objectId={item.id} classId={item.classID} propName={'Class'} /> - {item.title} </Typography>
                                        </AccordionSummary>
                                    }
                                    {props.linkedObjects ?
                                       <AccordionDetails style={{ backgroundColor: '#e5e5e5' }} className='p-2 shadow-sm mx-3'>
                                       {/* <NewFileFormModal internalId={`${selectedObject.internalID}`} selectedObjTitle={selectedObject.title} searchTerm={props.searchTerm} handleSearch={props.handleSearch2} docClasses={props.docClasses} allrequisitions={props.allrequisitions} user={props.user} setOpenAlert={setOpenAlert} setAlertSeverity={setAlertSeverity} setAlertMsg={setAlertMsg} /> */}
                                       {props.linkedObjects.requisitionID === item.internalID ? <>
                                         {props.loadingobjects ?
                                           <div className='text-center'>
                                             {/* <Spinner
                                               thickness='4px'
                                               speed='0.65s'
                                               emptyColor='white.200'
                                               color='blue.500'
                                               size='xl'
                                               style={{ width: '40px', height: '40px' }}
                                             /> */}
         
                                             <CircularProgress style={{ width: '20px', height: '20px' }} />
         
                                             <p className='text-dark ' style={{ fontSize: '11px' }}>Searching relationships...</p>
                                           </div>
                                           :
                                           <>
                                             {props.linkedObjects.length > 0 ?
                                               <>
                                                 <Typography variant="body2" style={{ fontSize: '11px', color: "#fff",backgroundColor:'#2a68af' }} className=' p-1'>Related Objects </Typography>
                                                 <table id='createdByMe' className="table " style={{ fontSize: '11px', backgroundColor: '#ffff' }} >
                                               
                                                   <tbody>
         
                                                     {props.linkedObjects.map((item, index) => (
                                                       <>
                                                         {item.objectID != 0 ?
                                                           <>
         
         
                                                             <tr key={index} onClick={() => props.previewObject(item)} style={{cursor:'pointer'}}>
                                                               <td ><i className="fas fa-folder mx-1" style={{ fontSize: '15px', color: '#0077b6' }} ></i> {item.title}</td>
                                                            
                                                             </tr>
         
                                                           </> :
                                                           <>
         
                                                           </>}
         
                                                       </>
                                                     ))}
                                                   </tbody>
                                                 </table>
                                                 <Typography variant="body2" style={{ fontSize: '11px', color: "#fff",backgroundColor:'#2a68af' }} className=' p-1'>Attached Documents </Typography>
                                                 <table id='createdByMe' className="table table-hover" style={{ fontSize: '11px', backgroundColor: '#ffff' }} >
                                                   <tbody>
                                                    
                                                     {props.linkedObjects.map((item, index) => (
                                                       <>
                                                         {item.objectID === 0 ?
                                                           <>
         
                                                             <tr key={index} onClick={() => props.previewSublistObject(item)} style={{cursor:'pointer'}}>
                                                
                                                             <td><FileExt guid={props.selectedVault.guid} objectId={item.id} classId={item.classID} /> {item.title}</td>
         
                                                             </tr>
                                                           </> :
                                                           <>
         
                                                           </>}
         
                                                       </>
                                                     ))}
                                                   </tbody>
                                                 </table>
         
                                               </>
                                               :
                                               <>
                                                 <p className='my-1 mx-1 text-center' style={{ fontSize: '11px' }}> No Relationships Found</p>
                                               </>
                                             }
                                           </>
                                         }
                                       </> : <></>}
                                     </AccordionDetails>
                                        :
                                        <>
                                        </>
                                    }
                                </Accordion>
                            ))}
                        </div>

                    </> : <></>}
                </> :
                <>


                    {commonviews.length > 0 ? <>
                        <h6 onClick={toggleCommonViewSublist} className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e5e5e5',cursor:'pointer' }}> <i className="fas fa-list mx-2 " style={{ fontSize: '1.5em' ,color:'#2a68af'}}></i> Common Views <small>( {commonviews.length} )</small>  </h6>

                        {showCommonViewSublist && (
                            <div style={{ height: '30vh', overflowY: 'scroll' }} className='p-1'>
                                {commonviews.map((view) => (
                                    <ul style={{ listStyleType: 'none', padding: 0,  fontSize: '12px' }}>

                                        <li onClick={() => fetchViewObjects(view.id, view.viewName, 'Common Views')} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                            <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#0077b6', fontSize: '20px' }} />
                                            <span className='list-text'>{view.viewName}</span>
                                        </li>

                                    </ul>

                                ))}
                            </div>
                        )}

                    </> : <></>}

                    {otherviews.length > 0 ? <>
                        <h6 onClick={toggleOtherViewSublist} className='p-2 text-dark' style={{ fontSize: '12px', backgroundColor: '#e5e5e5',cursor:'pointer' }}> <i className="fas fa-list mx-2 " style={{ fontSize: '1.5em',color:'#2a68af' }}></i> Other Views <small>( {otherviews.length} )</small> </h6>

                        {showOtherViewSublist && (
                            <div style={{ height: '30vh', overflowY: 'scroll' }} className='p-1'>
                                {otherviews.map((view) => (
                                    <ul style={{ listStyleType: 'none', padding: 0, fontSize: '12px' }}>

                                        <li onClick={() => fetchViewObjects(view.id, view.viewName, 'Other Views')} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                                            <FontAwesomeIcon icon={faTable} className='mx-3' style={{ color: '#0077b6', fontSize: '20px' }} />
                                            <span className='list-text'>{view.viewName}</span>
                                        </li>

                                    </ul>
                                ))}
                            </div>
                        )}

                    </> : <></>}
                </>
            }


        </div>
    );
};

export default ViewsList;
