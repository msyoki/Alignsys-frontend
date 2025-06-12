import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, Box } from '@mui/material';
import OfficeApp from '../Modals/OfficeAppDialog';
import LoadingDialog from '../Loaders/LoaderDialog';
import FileExtIcon from '../FileExtIcon';
import FileExtText from '../FileExtText';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import LinkedObjectsTree from './LinkedObjectsTree';
import * as constants from '../Auth/configs';
import RightClickMenu from '../RightMenu';
import TimedAlert from '../TimedAlert';

function useSessionState(key, defaultValue) {
    const getInitialValue = () => {
        try {
            const stored = sessionStorage.getItem(key);
            if (stored === null || stored === 'undefined') return defaultValue;
            return JSON.parse(stored);
        } catch {
            return defaultValue;
        }
    };
    const [value, setValue] = useState(getInitialValue);
    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch { }
    }, [key, value]);
    return [value, setValue];
}

const MAX_TITLE_LENGTH = 30;
const trimTitle = (title) => title.length > MAX_TITLE_LENGTH ? title.substring(0, MAX_TITLE_LENGTH) + '...' : title;

const ViewsList = (props) => {
    // Session state
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

    // Local state
    const [openAlert, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [alertMsg, setAlertMsg] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuItem, setMenuItem] = useState(null);

    const [file, setFile] = useState(null);

    async function convertToPDF(item, overWriteOriginal) {
        // alert(file.fileID);
        // console.log('Converting to PDF:', file);

        console.log(item)
        const payload = {
            vaultGuid: props.selectedVault.guid,  // string
            objectId: item.id,                      // number
            classId: item.classID || item.classId,                       // number
            fileID: file.fileID,                        // number
            overWriteOriginal: overWriteOriginal,           // boolean
            separateFile: overWriteOriginal ? false : true,                // boolean
            userID: props.mfilesId                     // number
        };

        console.log(payload)
        try {
            const response = await axios.post(
                `${constants.mfiles_api}/api/objectinstance/ConvertToPdf`,
                payload,
                {
                    headers: {
                        'Accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error converting to PDF:', error);
            // throw error;
        }
    }


    async function fetchObjectFile(item) {
        // const objectType = item.objectTypeId ?? item.objectID;
        const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/0`;
        console.log('Fetching object file from URL:', url);
        try {
            const response = await axios.get(url, {
                headers: {
                    Accept: '*/*'
                }
            });

            const file = response.data?.[0];
            setFile(file);
            // console.log('Fetched file:', file);
            // alert(`File ID is: ${file.fileID}`)
        } catch (error) {
            console.error('Failed to fetch object file:', error);
            // throw error;
        }
    }



    // Memoized filtered views
    const filteredOtherViews = useMemo(
        () => otherviews.filter(view => view),
        [otherviews]
    );
    const filteredCommonViews = useMemo(
        () => commonviews.filter(view => view.userPermission?.readPermission),
        [commonviews]
    );

    // Fetch views on mount or navigation change
    useEffect(() => {
        const savedOption = sessionStorage.getItem('selectedVault');
        if (!savedOption) return;
        const fetchData = async () => {
            const guid = JSON.parse(savedOption).guid;
            try {
                const response = await axios.get(
                    `${constants.mfiles_api}/api/Views/GetViews/${guid}/${props.mfilesId}`
                );
                setOtherViews(response.data.otherViews.sort((a, b) => a.viewName.localeCompare(b.viewName)));
                setCommonViews(response.data.commonViews.sort((a, b) => a.viewName.localeCompare(b.viewName)));
            } catch { }
        };
        fetchData();
    }, [viewNavigation, props.mfilesId, setOtherViews, setCommonViews]);

    // Navigation and fetch logic
    const backToViews = () => {
        props.resetPreview();
        setSelectedViewObjects([]);
        setViewNavigation([]);
        setSelectedViewCategory([]);
    };

    const handleViewNavClick = (item) => {
        const itemIndex = viewNavigation.findIndex(navItem => navItem.id === item.id);
        if (itemIndex !== -1) {
            setViewNavigation(viewNavigation.slice(0, itemIndex + 1));
        }
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
        }
    };

    const fetchMainViewObjects = async (item, viewType) => {
        setLoading(true);
        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, { ...item, type: viewType, title: item.viewName }];
            }
            return prevItems;
        });
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.mfilesId}`,
                { headers: { accept: '*/*' } }
            );
            setLoading(false);
            setSelectedViewObjects(response.data);
            setSelectedViewName(item.viewName);
        } catch {
            setLoading(false);
            props.setAlertPopOpen(true);
            props.setAlertPopSeverity("info");
            props.setAlertPopMessage("Sorry, we couldn't find any objects!");
        }
    };

    const fetchMainViewObjects2 = async (item) => {
        setLoading(true);
        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, { ...item, type: 'MFFolderContentItemTypeViewFolder' }];
            }
            return prevItems;
        });
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}`,
                { headers: { accept: '*/*' } }
            );
            setLoading(false);
            setSelectedViewObjects(response.data);
            setSelectedViewName(item.title);
        } catch {
            setLoading(false);
            props.setAlertPopOpen(true);
            props.setAlertPopSeverity("info");
            props.setAlertPopMessage("Sorry, we couldn't find any objects matching your request!");
        }
    };

    const fetchViewData = async (item) => {
        setLoading(true);
        setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.propId === item.propId);
            const updatedItems = exists ? prevItems : [...prevItems, { ...item, type: item.type, title: item.title }];
            processNavigation(updatedItems);
            return updatedItems;
        });

        function processNavigation(updatedItems) {
            const newItem = { propId: `${item.propId}`, propDatatype: `${item.propDatatype}` };
            const itemList = updatedItems.filter(i => i.type === "MFFolderContentItemTypePropertyFolder");
            const transformedList = itemList.map(i => ({
                propId: i.propId,
                propDatatype: i.propDatatype
            }));
            if (!transformedList.some(existingItem =>
                existingItem.propId === newItem.propId &&
                existingItem.propDatatype === newItem.propDatatype
            )) {
                transformedList.push(newItem);
            }
            apiRequest(transformedList);
        }

        async function apiRequest(newPropList) {
            try {
                const response = await axios.post(
                    `${constants.mfiles_api}/api/Views/GetViewPropObjects`,
                    {
                        viewId: item.viewId,
                        properties: newPropList,
                        vaultGuid: `${props.selectedVault.guid}`
                    },
                    { headers: { accept: '*/*', 'Content-Type': 'application/json' } }
                );
                setLoading(false);
                setSelectedViewObjects(response.data);
                setSelectedViewName(item.title);
            } catch {
                setLoading(false);
                props.setAlertPopOpen(true);
                props.setAlertPopSeverity("info");
                props.setAlertPopMessage("Sorry, we couldn't find any objects!");
            }
        }
    };

    function openApp(item) {
        const fetchExtension = async () => {
            const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
            try {
                const response = await axios.get(url);
                const data = response.data;
                const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();
                if (['csv', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf', 'ppt'].includes(extension)) {
                    setObjectToEditOnOfficeApp({
                        ...item,
                        guid: props.selectedVault.guid,
                        extension,
                        type: item.objectTypeId ?? item.objectID
                    });
                    setOpenOfficeApp(true);
                }
            } catch { }
        };
        fetchExtension();
    }

    const handleRowClick = (subItem) => {
        if (subItem.objectID === 0) {
            props.previewSublistObject(subItem, false);
        } else {
            props.previewObject(subItem, false);
        }
    };

    // Right click menu
    const handleRightClick = (event, item) => {
        event.preventDefault();
        setMenuAnchor(event.currentTarget);
        setMenuItem(item);
        if (item.objectID === 0 || item.objectTypeId === 0) {
            fetchObjectFile(item);
        }
    };
    const handleMenuClose = () => {
        setMenuAnchor(null);
        setMenuItem(null);
    };

    const rightClickActions = [
        ...(menuItem && (menuItem.objectID === 0 || menuItem.objectTypeId === 0) ? [
            {
                label: (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <FileExtIcon
                            fontSize={'24px'}
                            guid={props.selectedVault.guid}
                            objectId={menuItem.id}
                            classId={menuItem.classId !== undefined ? menuItem.classId : menuItem.classID}
                        />
                        <span className='mx-2'>Open</span>
                        <span className='text-muted' style={{ marginLeft: '8px', marginRight: 0, marginLeft: 'auto', fontWeight: 500 }}>
                            Open in default application
                        </span>
                    </span>
                ),
                onClick: (itm) => {
                    openApp(itm);
                    handleMenuClose();
                }
            }
        ] : []),
        // ...(menuItem && menuItem.userPermission && menuItem.userPermission.deletePermission ? [
        //   {
        //     label: (
        //         <span style={{fontSize: '13px'}}>
        //         <i className="fa-solid fa-trash-can" style={{ marginRight: '6px', color: '#2757aa' }}></i>
        //         Delete
        //       </span>
        //     ),
        //     onClick: (itm) => {
        //       deleteObject(itm);
        //       handleMenuClose();
        //     }
        //   }
        // ] : []),
        ...(menuItem && menuItem.userPermission && menuItem.userPermission.editPermission && file ? [
            {
                label: (
                    <span className='mx-3'>

                        {/* <i className="fa-solid fa-arrows-spin" style={{ marginRight: '6px', color: '#2757aa', fontSize: '24px' }}></i> */}
                        Convert to PDF overwrite Original Copy
                    </span>
                ),
                onClick: (itm) => {
                    convertToPDF(itm, false);
                    handleMenuClose();
                }
            }
        ] : []),
        ...(menuItem && menuItem.userPermission && menuItem.userPermission.editPermission && file ? [
            {
                label: (
                    <span className='mx-3'>

                        {/* <i className="fa-solid fa-arrows-spin" style={{ marginRight: '6px', color: '#2757aa', fontSize: '24px' }}></i> */}
                        Convert to PDF Keep Original Copy
                    </span>
                ),
                onClick: (itm) => {
                    convertToPDF(itm, true);
                    handleMenuClose();
                }
            }
        ] : [])
    ];
    // --- UI ---
    return (
        <>
            <TimedAlert
                open={openAlert}
                onClose={() => setOpenAlert(false)}
                severity={alertSeverity}
                message={alertMsg}
                setSeverity={setAlertSeverity}
                setMessage={setAlertMsg}
            />
            <LoadingDialog opendialogloading={loading} />
            <OfficeApp open={openOfficeApp} close={() => setOpenOfficeApp(false)} object={objectToEditOnOffice} />
            {selectedViewObjects.length > 0 ? (
                <>
                    <h6
                        className="px-2 py-1 text-dark d-flex align-items-center flex-wrap my-1"
                        style={{
                            fontSize: '13px',
                            backgroundColor: '#ecf4fc',
                            cursor: 'pointer',
                            gap: '4px',
                        }}
                    >
                        <div className="d-flex align-items-center" style={{ minWidth: '24px' }}>
                            <FontAwesomeIcon
                                icon={faTable}
                                style={{ color: '#1C4690', fontSize: '18px' }}
                                className="mx-2"
                            />
                        </div>
                        <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px', flex: 1 }}>
                            <span onClick={backToViews}>Back to views</span>
                            <i className="fas fa-chevron-right" style={{ color: '#2a68af' }} />
                            {viewNavigation.map((item, index) => (
                                <React.Fragment key={index}>
                                    <Tooltip title={item.title}>
                                        <span
                                            onClick={() => {
                                                handleViewNavClick(item);
                                                props.resetPreview();
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                whiteSpace: 'normal',
                                                wordBreak: 'break-word',
                                                maxWidth: '150px',
                                                fontSize: '13px',
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
                                    <SimpleTreeView>
                                        <TreeItem
                                            key={`tree-item-${item.id || index}`}
                                            itemId={`tree-item-${item.id || index}`}
                                            onClick={() => {
                                                props.setSelectedItemId(item.id);
                                                item.objectTypeId === 0
                                                    ? props.previewSublistObject(item, true)
                                                    : props.previewObject(item, true)
                                            }}

                                            className='my-1'
                                            sx={{
                                                marginLeft: '10px',
                                                fontSize: "13px",
                                                "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                                "& .MuiTypography-root": { fontSize: "13px !important" },
                                                backgroundColor: '#fff !important',
                                                "&:hover": { backgroundColor: '#fff !important' },
                                                borderRadius: "0px !important",
                                                "& .MuiTreeItem-content": { borderRadius: "0px !important" },
                                                "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                                "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                            }}
                                            label={
                                                <div
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        handleRightClick(e, item);

                                                    }}

                                                    style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                                                >
                                                    <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: props.selectedItemId === item.id ? '#fcf3c0' : 'inherit' }}>
                                                        {item.objectTypeId === 0 ? (
                                                            <>
                                                                <FileExtIcon
                                                                    fontSize={'15px'}
                                                                    guid={props.selectedVault.guid}
                                                                    objectId={item.id}
                                                                    classId={item.classId !== undefined ? item.classId : item.classID}
                                                                />
                                                            </>
                                                        ) : (
                                                            <i className="fa-solid fa-folder" style={{ fontSize: '15px', color: '#2a68af', marginLeft: '8px' }}></i>
                                                        )}
                                                        <span style={{ marginLeft: '8px' }}>
                                                            {item.title}
                                                            {item.objectTypeId === 0 ? (
                                                                <FileExtText
                                                                    guid={props.selectedVault.guid}
                                                                    objectId={item.id}
                                                                    classId={item.classId}
                                                                />
                                                            ) : null}
                                                        </span>
                                                    </Box>
                                                </div>
                                            }
                                        >
                                            <LinkedObjectsTree id={item.id} objectType={(item.objectTypeId !== undefined ? item.objectTypeId : item.objectID)} selectedVault={props.selectedVault} mfilesId={props.mfilesId} handleRowClick={handleRowClick} setSelectedItemId={props.setSelectedItemId} selectedItemId={props.selectedItemId} />
                                        </TreeItem>
                                    </SimpleTreeView>
                                )}
                                {item.type === "MFFolderContentItemTypePropertyFolder" && (
                                    <SimpleTreeView>
                                        <TreeItem
                                            key={`${index}`}
                                            itemId={`${index}`}
                                            onClick={() => fetchViewData(item)}
                                            sx={{
                                                fontSize: "13px",
                                                "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                                "& .MuiTypography-root": { fontSize: "13px !important" },
                                                backgroundColor: '#fff !important',
                                                "&:hover": { backgroundColor: '#fff !important' },
                                                borderRadius: "0px !important",
                                                "& .MuiTreeItem-content": { borderRadius: "0px !important" },
                                                "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                                "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                            }}
                                            label={
                                                <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: props.selectedItemId === item.id ? '#fcf3c0' : 'inherit' }}>
                                                    <i className='fas fa-folder-plus mx-2' style={{ color: '#6a994e', fontSize: '20px' }}></i>
                                                    <span style={{ fontSize: '13px' }} className='list-text'>{item.title}</span>
                                                </Box>
                                            }
                                        />
                                    </SimpleTreeView>
                                )}
                                {item.type === "MFFolderContentItemTypeViewFolder" && (
                                    <SimpleTreeView>
                                        <TreeItem
                                            key={`${index}`}
                                            itemId={`${index}`}
                                            onClick={() => fetchMainViewObjects2(item)}

                                            className='my-1'
                                            sx={{
                                                fontSize: "13px",
                                                "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                                "& .MuiTypography-root": { fontSize: "13px !important" },
                                                backgroundColor: '#fff !important',
                                                "&:hover": { backgroundColor: '#fff !important' },
                                                borderRadius: "0px !important",
                                                "& .MuiTreeItem-content": { borderRadius: "0px !important" },
                                                "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                                "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                            }}
                                            label={
                                                <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: props.selectedItemId === item.id ? '#fcf3c0' : 'inherit' }}>
                                                    <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#1C4690', fontSize: '20px' }} />
                                                    <span style={{ fontSize: '13px' }} className='list-text'>{item.title}</span>
                                                </Box>
                                            }
                                        />
                                    </SimpleTreeView>
                                )}
                            </React.Fragment>
                        ))}
                        {/* RightClickMenu rendered once, controlled by state */}
                        {rightClickActions.length > 0 && (
                            <RightClickMenu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={handleMenuClose}
                                item={menuItem}
                                actions={rightClickActions}
                            />
                        )}

                    </div>
                </>
            ) : (
                <span>
                    {filteredCommonViews.length > 0 && (
                        <div className='bg-white  my-1'>
                            <h6
                                onClick={e => setshowCommonViewSublist(v => !v)}
                                className="p-2 text-dark d-flex align-items-center justify-content-between"
                                style={{
                                    fontSize: '13px',
                                    backgroundColor: '#ecf4fc',
                                    cursor: 'pointer',
                                    display: 'flex'
                                }}
                            >
                                <span className="d-flex align-items-center">
                                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i>
                                    Common Views
                                </span>
                                <small style={{ color: '#2a68af', fontSize: '13px' }}>({filteredCommonViews.length})</small>
                            </h6>
                            {showCommonViewSublist && (
                                <div style={{ height: '27vh', overflowY: 'auto' }} className=' text-dark bg-white '>
                                    {filteredCommonViews.map((view, index) => (
                                        <SimpleTreeView key={index}>
                                            <TreeItem
                                                itemId={`${index}`}
                                                onClick={() => fetchMainViewObjects(view, "Common Views")}
                                                className='my-1'
                                                sx={{
                                                    fontSize: "13px",
                                                    "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                                    "& .MuiTypography-root": { fontSize: "13px !important" },
                                                    backgroundColor: '#fff !important',
                                                    "&:hover": { backgroundColor: '#fff !important' },
                                                    borderRadius: "0px !important",
                                                    "& .MuiTreeItem-content": { borderRadius: "0px !important" },
                                                    "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                                    "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                                }}
                                                label={
                                                    <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: props.selectedItemId === view.id ? '#fcf3c0' : 'inherit' }}>
                                                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                                                        <span style={{ fontSize: '13px' }} className='list-text'>{view.viewName}</span>
                                                    </Box>
                                                }
                                            />
                                        </SimpleTreeView>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {filteredOtherViews.length > 0 && (
                        <div className='bg-white  my-1'>
                            <h6
                                onClick={e => setshowOtherViewSublist(v => !v)}
                                className="p-2 text-dark d-flex align-items-center justify-content-between"
                                style={{
                                    fontSize: '13px',
                                    backgroundColor: '#ecf4fc',
                                    cursor: 'pointer',
                                    display: 'flex'
                                }}
                            >
                                <span className="d-flex align-items-center">
                                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i>
                                    Other Views
                                </span>
                                <small style={{ color: '#2a68af', fontSize: '13px' }}>({filteredOtherViews.length})</small>
                            </h6>
                            {showOtherViewSublist && (
                                <div style={{ height: '27vh', overflowY: 'auto' }} className=' text-dark bg-white '>
                                    {filteredOtherViews.map((view, index) => (
                                        <SimpleTreeView key={index}>
                                            <TreeItem
                                                itemId={`${index}`}
                                                onClick={() => fetchMainViewObjects(view, "Other Views")}
                                                className='my-1'
                                                sx={{
                                                    fontSize: "13px",
                                                    "& .MuiTreeItem-label": { fontSize: "13px !important" },
                                                    "& .MuiTypography-root": { fontSize: "13px !important" },
                                                    backgroundColor: '#fff !important',
                                                    "&:hover": { backgroundColor: '#fff !important' },
                                                    borderRadius: "0px !important",
                                                    "& .MuiTreeItem-content": { borderRadius: "0px !important" },
                                                    "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
                                                    "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
                                                }}
                                                label={
                                                    <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: props.selectedItemId === view.id ? '#fcf3c0' : 'inherit' }}>
                                                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                                                        <span style={{ fontSize: '13px' }} className='list-text'>{view.viewName}</span>
                                                    </Box>
                                                }
                                            />
                                        </SimpleTreeView>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </span>
            )}
        </>
    );
};

export default ViewsList;