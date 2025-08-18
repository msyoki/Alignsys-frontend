import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
import MultifileFiles from '../MultifileFiles';
import ColumnSimpleTree from '../ColumnSimpleTree';
import Typography from '@mui/material/Typography';

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

// Constants
const MAX_TITLE_LENGTH = 30;

// Style constants to avoid inline object creation
const TREE_ITEM_STYLES = {
    fontSize: "13px",
    "& .MuiTreeItem-label": { fontSize: "13px !important" },
    "& .MuiTypography-root": { fontSize: "13px !important" },
    backgroundColor: '#fff !important',
    "&:hover": { backgroundColor: '#fff !important' },
    borderRadius: "0px !important",
    "& .MuiTreeItem-content": { borderRadius: "0px !important" },
    "& .MuiTreeItem-content.Mui-selected": { backgroundColor: '#fff !important' },
    "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: '#fff !important' },
};

const TREE_ITEM_OBJECT_STYLES = {
    ...TREE_ITEM_STYLES,
    marginLeft: '10px',
};

const SECTION_HEADER_STYLES = {
    fontSize: '13px',
    backgroundColor: '#ecf4fc',
    cursor: 'pointer',
    display: 'flex'
};

const BOX_PADDING_STYLES = {
    padding: '3px'
};

const NAVIGATION_STYLES = {
    fontSize: '13px',
    backgroundColor: '#ecf4fc',
    cursor: 'pointer',
    gap: '4px',
};

const DATE_SPAN_STYLES = {
    marginLeft: 'auto',
    fontSize: '13px',
    color: '#888',
    whiteSpace: 'nowrap'
};

const TITLE_SPAN_STYLES = {
    marginLeft: '8px',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '16px'
};

const TOOLTIP_INNER_STYLES = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 220,
    display: 'inline-block',
    verticalAlign: 'middle'
};

const SCROLLABLE_CONTAINER_STYLES = {
    height: '27vh',
    overflowY: 'auto'
};

const MAIN_CONTENT_STYLES = {
    maxHeight: '60vh',
    overflowY: 'auto'
};

// Utility functions
const trimTitle = (title) => title.length > MAX_TITLE_LENGTH ? title.substring(0, MAX_TITLE_LENGTH) + '...' : title;

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date
        .toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
        .replace(',', '');
};

// Memoized sub-components
const NavigationBreadcrumb = memo(({
    viewNavigation,
    onBackToViews,
    onNavClick,
    onResetPreview
}) => (
    <h6 className="p-1 text-dark d-flex align-items-center flex-wrap" style={NAVIGATION_STYLES}>
        {/* <div className="d-flex align-items-center" style={{ minWidth: '24px' }}>
            <FontAwesomeIcon
                icon={faTable}
                style={{ color: '#1C4690', fontSize: '18px' }}
                className="mx-2"
            />
        </div> */}
        <div
            className="d-flex align-items-center flex-wrap"
            style={{
                gap: '6px',
                flex: 1,
                minHeight: '24px' // Reduced from 32px to 24px
            }}
        >
            {/* Back Button */}
            {/* <span 
    onClick={onBackToViews}
    style={{
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: '13px', // Reduced from 14px
      color: '#1C4690',
      fontWeight: '500',
      gap: '4px' // Reduced from 6px
    }}
  > 
    <i 
      className="fas fa-arrow-left" 
      style={{ 
        color: '#1C4690', 
        fontSize: '14px' // Reduced from 16px
      }}
    />
    Back
  </span> */}
            <FontAwesomeIcon
                icon={faTable}
                style={{ color: '#1C4690', fontSize: '18px' }}
                className="mx-2"
            />

            {/* First Separator */}
            {/* {viewNavigation.length > 0 && (
    <i 
      className="fas fa-chevron-right" 
      style={{ 
        color: '#2a68af', 
        fontSize: '10px', // Reduced from 12px
        opacity: 0.7 
      }} 
    />
  )} */}

            {/* Navigation Items */}
            {viewNavigation.map((item, index) => (
                <React.Fragment key={index}>
                    <Tooltip title={item.title} placement="top" arrow>
                        <span
                            onClick={() => {
                                onNavClick(item);
                                onResetPreview();
                            }}
                            style={{
                                cursor: 'pointer',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                // maxWidth: '150px',
                                fontSize: '13px', // Reduced from 13px
                                color: '#333',
                                padding: '2px 4px', // Reduced from 4px 6px
                                borderRadius: '3px', // Reduced from 4px
                                transition: 'background-color 0.2s ease',
                                display: 'inline-block',
                                lineHeight: '1.1' // Reduced from 1.2
                            }}
                        //   onMouseEnter={(e) => {
                        //     e.target.style.backgroundColor = '#f0f0f0';
                        //   }}
                        //   onMouseLeave={(e) => {
                        //     e.target.style.backgroundColor = 'transparent';
                        //   }}
                        >
                            {trimTitle(item.title)}
                        </span>
                    </Tooltip>

                    {/* Separator after each item except the last */}
                    {index < viewNavigation.length - 1 && (
                        <i
                            className="fas fa-chevron-right"
                            style={{
                                color: '#2a68af',
                                fontSize: '10px', // Reduced from 12px
                                opacity: 0.7
                            }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    </h6>
));


const PropertyFolderItem = memo(({ item, index, selectedItemId, onFetchViewData }) => {
    const handleClick = useCallback(() => {
        onFetchViewData(item);
    }, [item, onFetchViewData]);

    const isSelected = selectedItemId === item.id;

    return (
        <SimpleTreeView>
            <TreeItem
                key={`${index}`}
                itemId={`${index}`}
                onClick={handleClick}
                sx={TREE_ITEM_STYLES}
                label={
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            ...BOX_PADDING_STYLES,
                            backgroundColor: isSelected ? '#fcf3c0' : 'inherit'
                        }}
                    >
                        <i className='fas fa-folder-plus mx-2' style={{ color: '#6a994e', fontSize: '20px' }} />
                        <span style={{ fontSize: '13px' }} className='list-text'>{item.title}</span>
                    </Box>
                }
            />
        </SimpleTreeView>
    );
});

const ViewFolderItem = memo(({ item, index, selectedItemId, onFetchMainViewObjects2 }) => {
    const handleClick = useCallback(() => {
        onFetchMainViewObjects2(item);
    }, [item, onFetchMainViewObjects2]);

    const isSelected = selectedItemId === item.id;

    return (
        <SimpleTreeView>
            <TreeItem
                key={`${index}`}
                itemId={`${index}`}
                onClick={handleClick}
                className='my-1'
                sx={TREE_ITEM_STYLES}
                label={
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            ...BOX_PADDING_STYLES,
                            backgroundColor: isSelected ? '#fcf3c0' : 'inherit'
                        }}
                    >
                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#1C4690', fontSize: '20px' }} />
                        <span style={{ fontSize: '13px' }} className='list-text'>{item.title}</span>
                    </Box>
                }
            />
        </SimpleTreeView>
    );
});

const ViewListItem = memo(({ view, index, selectedItemId, onFetchMainViewObjects, viewType }) => {
    const handleClick = useCallback(() => {
        onFetchMainViewObjects(view, viewType);
    }, [view, viewType, onFetchMainViewObjects]);

    const isSelected = selectedItemId === view.id;

    return (
        <SimpleTreeView key={index}>
            <TreeItem
                itemId={`${index}`}
                onClick={handleClick}
                className='my-1'
                sx={TREE_ITEM_STYLES}
                label={
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            ...BOX_PADDING_STYLES,
                            backgroundColor: isSelected ? '#fcf3c0' : 'inherit'
                        }}
                    >
                        <FontAwesomeIcon icon={faTable} className='mx-2' style={{ color: '#2a68af', fontSize: '20px' }} />
                        <span style={{ fontSize: '13px' }} className='list-text'>{view.viewName}</span>
                    </Box>
                }
            />
        </SimpleTreeView>
    );
});

const ViewsList = (props) => {
    // Session state
    const [otherviews, setOtherViews] = useSessionState('ss_otherviews', []);
    const [commonviews, setCommonViews] = useSessionState('ss_commonviews', []);

    // const [selectedViewName, setSelectedViewName] = useSessionState('ss_selectedViewName', '');
    // const [selectedViewCategory, setSelectedViewCategory] = useSessionState('ss_selectedViewCategory', []);
    const [showOtherViewSublist, setshowOtherViewSublist] = useSessionState('ss_showOtherViewSublist', true);
    const [showCommonViewSublist, setshowCommonViewSublist] = useSessionState('ss_showCommonViewSublist', true);


    const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
    const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
    const [loading, setLoading] = useSessionState('ss_loading', false);

    // Local state
    const [openAlert, setOpenAlert] = useState(false);
    const [alertSeverity, setAlertSeverity] = useState("info");
    const [alertMsg, setAlertMsg] = useState("");
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuItem, setMenuItem] = useState(null);
    const [file, setFile] = useState(null);

    // Memoized filtered views
    const filteredOtherViews = useMemo(
        () => otherviews.filter(view => view),
        [otherviews]
    );
    const filteredCommonViews = useMemo(
        () => commonviews.filter(view => view.userPermission?.readPermission),
        [commonviews]
    );

    // Memoized object type checks
    const hasObjectVersions = useMemo(
        () => props.selectedViewObjects.some(item => item.type === "MFFolderContentItemTypeObjectVersion"),
        [props.selectedViewObjects]
    );

    // Memoized API calls
    const fetchObjectFile = useCallback(async (item) => {
        const classId = item.classId || item.classID
        const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${classId}`;
        try {
            const response = await axios.get(url, {
                headers: { Accept: '*/*' }
            });
            const file = response.data?.[0];
            setFile(file);
        } catch {
            // Silent error handling as in original
        }
    }, [props.selectedVault]);

    const convertToPDF = useCallback(async (item, overWriteOriginal) => {
        const payload = {
            vaultGuid: props.selectedVault.guid,
            objectId: item.id,
            classId: item.classID || item.classId,
            fileID: file.fileID,
            overWriteOriginal: overWriteOriginal,
            separateFile: overWriteOriginal ? false : true,
            userID: props.mfilesId
        };

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
        } catch {

        }
    }, [props.selectedVault, file?.fileID, props.mfilesId]);

    const openApp = useCallback((item) => {
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
    }, [props.selectedVault, setObjectToEditOnOfficeApp, setOpenOfficeApp]);

    // Fetch data effect
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

            } catch {

            }
        };
        fetchData();
    }, [props.viewNavigation, props.mfilesId, setOtherViews, setCommonViews]);

    // Navigation and fetch logic
    const backToViews = useCallback(() => {
        props.resetPreview();
        props.setSelectedViewObjects([]);
        props.setViewNavigation([]);
        // setSelectedViewCategory([]);
    }, [props]);

    const handleViewNavClick = useCallback((item) => {
        const itemIndex = props.viewNavigation.findIndex(navItem => navItem.id === item.id);
        if (itemIndex !== -1) {
            props.setViewNavigation(props.viewNavigation.slice(0, itemIndex + 1));
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
    }, [props.viewNavigation, props.setViewNavigation]);

    const fetchMainViewObjects = useCallback(async (item, viewType) => {
        setLoading(true);
        props.setViewNavigation([])
        props.setViewNavigation(prevItems => {
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
            props.setSelectedViewObjects(response.data);
            // setSelectedViewName(item.viewName);
         
            
        } catch {
            props.setSelectedViewObjects([]);
            setLoading(false);
            // props.setAlertPopOpen(true);
            // props.setAlertPopSeverity("info");
            // props.setAlertPopMessage("Sorry, we couldn't find any objects!");
        }
    }, [props.selectedVault, props.mfilesId, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, setLoading, props.setViewNavigation]);

    const fetchMainViewObjects2 = useCallback(async (item) => {
        setLoading(true);
        props.setViewNavigation(prevItems => {
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
            props.setSelectedViewObjects(response.data);
            // setSelectedViewName(item.title);
          
        } catch {
            props.setSelectedViewObjects([]);
            setLoading(false);
            // props.setAlertPopOpen(true);
            // props.setAlertPopSeverity("info");
            // props.setAlertPopMessage("Sorry, we couldn't find any objects matching your request!");
        }
    }, [props.selectedVault, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, setLoading, props.setViewNavigation]);

    const fetchViewData = useCallback(async (item) => {
        setLoading(true);
        props.setViewNavigation(prevItems => {
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
                props.setSelectedViewObjects(response.data);
                // setSelectedViewName(item.title);
            } catch {
                props.setSelectedViewObjects([]);
                setLoading(false);
                // props.setAlertPopOpen(true);
                // props.setAlertPopSeverity("info");
                // props.setAlertPopMessage("Sorry, we couldn't find any objects!");
            }
        }
    }, [props.selectedVault, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, setLoading, props.setViewNavigation]);

    const handleRowClick = useCallback((subItem) => {
        if (subItem.objectID === 0 && subItem.isSingleFile === true) {
            props.previewDocumentObject(subItem);
        } else {
            props.previewObject(subItem);
        }
    }, [props]);

    // Right click menu handlers
    const handleRightClick = useCallback((event, item) => {
        event.preventDefault();
        setMenuAnchor(event.currentTarget);
        setMenuItem(item);
        if (item.objectID === 0 || item.objectTypeId === 0) {
            fetchObjectFile(item);
        }
    }, [fetchObjectFile]);

    const handleMenuClose = useCallback(() => {
        setMenuAnchor(null);
        setMenuItem(null);
    }, []);

    // Memoized right click actions
    const rightClickActions = useMemo(() => {
        const actions = [];

        if (menuItem && (menuItem.isSingleFile === true) && (menuItem.objectID === 0 || menuItem.objectTypeId === 0)) {
            actions.push({
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
            });
        }

        if (menuItem && menuItem.userPermission && menuItem.userPermission.editPermission &&
            file?.extension &&
            ['docx', 'doc', 'xlsx', 'xls', 'ppt', 'jpg', 'jpeg', 'png', 'gif'].includes(file.extension.toLowerCase())) {
            actions.push(
                {
                    label: <span className='mx-3'>Convert to PDF overwrite Original Copy</span>,
                    onClick: (itm) => {
                        convertToPDF(itm, false);
                        handleMenuClose();
                    }
                },
                {
                    label: <span className='mx-3'>Convert to PDF Keep Original Copy</span>,
                    onClick: (itm) => {
                        convertToPDF(itm, true);
                        handleMenuClose();
                    }
                }
            );
        }

        if (menuItem && menuItem.userPermission && menuItem.userPermission.editPermission) {
            actions.push({
                label: <span className='mx-3'>History</span>,
                onClick: (itm) => {
                    convertToPDF(itm, true);
                    handleMenuClose();
                }
            });
        }

        return actions;
    }, [menuItem, file, props.selectedVault, openApp, handleMenuClose, convertToPDF]);

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
            <OfficeApp
                open={openOfficeApp}
                close={() => setOpenOfficeApp(false)}
                object={objectToEditOnOffice}
                mfilesId={props.mfilesId}
            />

            {props.selectedViewObjects.length > 0 || props.viewNavigation.length > 0 ? (
                <>
                    <NavigationBreadcrumb
                        viewNavigation={props.viewNavigation}
                        onBackToViews={backToViews}
                        onNavClick={handleViewNavClick}
                        onResetPreview={props.resetPreview}
                    />


                    <div >
                        {props.selectedViewObjects.length > 0 ? <>
                            <div className=' text-dark' style={MAIN_CONTENT_STYLES}>
                                {props.selectedViewObjects.map((item, index) => (
                                    <React.Fragment key={index}>

                                        {item.type === "MFFolderContentItemTypePropertyFolder" && (
                                            <PropertyFolderItem
                                                item={item}
                                                index={index}
                                                selectedItemId={props.selectedItemId}
                                                onFetchViewData={fetchViewData}
                                            />
                                        )}
                                        {item.type === "MFFolderContentItemTypeViewFolder" && (
                                            <ViewFolderItem
                                                item={item}
                                                index={index}
                                                selectedItemId={props.selectedItemId}
                                                onFetchMainViewObjects2={fetchMainViewObjects2}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {(() => {
                                const versions = props.selectedViewObjects.filter(
                                    item => item.type === "MFFolderContentItemTypeObjectVersion"
                                );
                                if (versions.length === 0) return null;
                                return versions.length > 0 ? (
                                    <ColumnSimpleTree
                                        data={versions}
                                        selectedVault={props.selectedVault}
                                        mfilesId={props.mfilesId}
                                        selectedItemId={props.selectedItemId}
                                        setSelectedItemId={props.setSelectedItemId}
                                        onItemClick={props.handleClick}
                                        onItemDoubleClick={props.handleDoubleClick}
                                        onItemRightClick={props.handleRightClick}
                                        onRowClick={props.handleRowClick}

                                        headerTitle="Search Results"
                                        nameColumnLabel="Name"
                                        dateColumnLabel="Date Modified"
                                    />
                                ) : null;
                            })()}

                            {rightClickActions.length > 0 && (
                                <RightClickMenu
                                    anchorEl={menuAnchor}
                                    open={Boolean(menuAnchor)}
                                    onClose={handleMenuClose}
                                    item={menuItem}
                                    actions={rightClickActions}
                                />
                            )}
                        </> : <>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 'inherit', // or whatever height you want the parent to have
                                width: '100%'
                            }}>
                                <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 3,
                                    backgroundColor: '#fff'
                                }}>
                                    <i className="fa-solid fa-ban" style={{ fontSize: '40px', color: '#2757aa', marginBottom: '16px' }} />
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#333', mb: 1 }}>
                                        No Results Found
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center', color: '#333', mb: 1 }}>
                                        No items found in this view
                                    </Typography>


                                </Box>
                            </div>
                        </>}
                    </div>

                </>
            ) : (
                <span>
                    {filteredCommonViews.length > 0 && (
                        <div className='bg-white my-1'>
                            <h6
                                onClick={() => setshowCommonViewSublist(v => !v)}
                                className="p-2 text-dark d-flex align-items-center justify-content-between"
                                style={SECTION_HEADER_STYLES}
                            >
                                <span className="d-flex align-items-center">
                                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i>
                                    Common Views
                                </span>
                                <small style={{ color: '#2a68af', fontSize: '13px' }}>({filteredCommonViews.length})</small>
                            </h6>
                            {showCommonViewSublist && (
                                <div style={SCROLLABLE_CONTAINER_STYLES} className='text-dark bg-white'>
                                    {filteredCommonViews.map((view, index) => (
                                        <ViewListItem
                                            key={index}
                                            view={view}
                                            index={index}
                                            selectedItemId={props.selectedItemId}
                                            onFetchMainViewObjects={fetchMainViewObjects}
                                            viewType="Common Views"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {filteredOtherViews.length > 0 && (
                        <div className='bg-white my-1'>
                            <h6
                                onClick={() => setshowOtherViewSublist(v => !v)}
                                className="p-2 text-dark d-flex align-items-center justify-content-between"
                                style={SECTION_HEADER_STYLES}
                            >
                                <span className="d-flex align-items-center">
                                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2a68af' }}></i>
                                    Other Views
                                </span>
                                <small style={{ color: '#2a68af', fontSize: '13px' }}>({filteredOtherViews.length})</small>
                            </h6>
                            {showOtherViewSublist && (
                                <div style={SCROLLABLE_CONTAINER_STYLES} className='text-dark bg-white'>
                                    {filteredOtherViews.map((view, index) => (
                                        <ViewListItem
                                            key={index}
                                            view={view}
                                            index={index}
                                            selectedItemId={props.selectedItemId}
                                            onFetchMainViewObjects={fetchMainViewObjects}
                                            viewType="Other Views"
                                        />
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