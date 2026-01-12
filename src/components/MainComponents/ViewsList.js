import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import axios from 'axios';

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

import ColumnSimpleTree from '../ColumnSimpleTree';
import Typography from '@mui/material/Typography';
import Loader from '../Loaders/LoaderMini'
import { CiCircleList } from "react-icons/ci";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronDown } from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa6";
import { FaFolderPlus } from "react-icons/fa6";
import { FaTable } from "react-icons/fa";
import { FaBan } from "react-icons/fa";

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
    fontSize: "12px",
    "& .MuiTreeItem-label": { fontSize: "12px !important" },
    "& .MuiTypography-root": { fontSize: "12px !important" },
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
    fontSize: '12px',
    backgroundColor: '#ecf4fc',
    cursor: 'pointer',
    display: 'flex'
};

const BOX_PADDING_STYLES = {
    padding: '3px'
};

const NAVIGATION_STYLES = {
    fontSize: '12px',
    backgroundColor: '#ecf4fc',
    cursor: 'pointer',
    gap: '4px',
};

const DATE_SPAN_STYLES = {
    marginLeft: 'auto',
    fontSize: '12px',
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
const NavigationBreadcrumb = memo(
    ({ viewNavigation, onNavClick, onResetPreview }) => {
        const [collapsed, setCollapsed] = useState(true);
        const MAX_VISIBLE_ITEMS = 3;

        const toggleCollapsed = () => setCollapsed(!collapsed);
        const visibleItems = collapsed
            ? viewNavigation.slice(0, MAX_VISIBLE_ITEMS)
            : viewNavigation;

        const isCollapsible = viewNavigation.length > MAX_VISIBLE_ITEMS;

        return (
            <div
                className="d-flex align-items-center flex-wrap "
                style={{
                    backgroundColor: "#ecf4fc",
                    color: "#333",
                    borderRadius: "4px",
                    padding: "10px 6px",
                    gap: "4px",
                    lineHeight: 1,
                    fontSize: "12px",
                    minHeight: "20px",
                }}
            >
            
                <FaTable className="mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }} />

                {visibleItems.map((item, index) => (
                    <React.Fragment key={index}>
                        <Tooltip title={item.title} placement="top" arrow>
                            <span
                                onClick={() => {
                                    onNavClick(item);
                                    onResetPreview();
                                }}
                                style={{
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    color: "#333",
                                    padding: "1px 4px",
                                    borderRadius: "2px",
                                    background: "rgba(39, 87, 170, 0.05)",
                                    transition: "background 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(39, 87, 170, 0.15)")
                                }
                                onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                    "rgba(39, 87, 170, 0.05)")
                                }
                            >
                                {item.title}
                            </span>
                        </Tooltip>

                        {index < visibleItems.length - 1 && (
                       
                            <FaChevronRight style={{ color: "#2757aa", fontSize: "9px", opacity: 0.8 }} />
                        )}
                    </React.Fragment>
                ))}

                {collapsed && isCollapsible && (
                    <>
                        <span style={{ fontSize: "11px", color: "#333", opacity: 0.8 }}>
                            ...
                        </span>
                        <FaChevronDown onClick={toggleCollapsed} style={{ cursor: "pointer", fontSize: "10px", color: "#2757aa", marginLeft: "2px" }} />
                    </>
                )}

                {!collapsed && isCollapsible && (
                  
                    <FaChevronUp onClick={toggleCollapsed} style={{ cursor: "pointer", fontSize: "10px", color: "#2757aa", marginLeft: "2px" }} />
                )}
            </div>
        );
    }
);

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
                        <FaFolderPlus className='mx-2' style={{ color: '#6a994e', fontSize: '20px' }} />
                        
                        <span style={{ fontSize: '12px' }} className='list-text'>{item.title}</span>
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
                        

                        <FaTable className='mx-2' style={{ color: '#2757aa', fontSize: '20px' }} />
                        <span style={{ fontSize: '12px' }} className='list-text'>{item.title}</span>
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
                        <FaTable className='mx-2' style={{ color: '#2757aa', fontSize: '20px' }} />
                        <span style={{ fontSize: '12px' }} className='list-text'>{view.viewName}</span>
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
    // const fetchObjectFile = useCallback(async (item) => {
    //     const classId = item.classId || item.classID
    //     const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.selectedVault.guid}/${item.id}/${classId}`;
    //     try {
    //         const response = await axios.get(url, {
    //             headers: { Accept: '*/*' }
    //         });
    //         const file = response.data?.[0];
    //         setFile(file);
    //     } catch {
    //         // Silent error handling as in original
    //     }
    // }, [props.selectedVault]);

    const convertToPDF = useCallback(async (item, overWriteOriginal) => {
        const payload = {
            vaultGuid: props.selectedVault.guid,
            objectId: item.id,
            classId: item.classID || item.classId,
            fileID: file.fileID,
            overWriteOriginal: overWriteOriginal,
            separateFile: overWriteOriginal ? false : true,
            userID: props.selectedVault?.vaultId
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
    }, [props.selectedVault, file?.fileID, props.selectedVault?.vaultId]);

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
        console.log(savedOption)

        if (!savedOption) return;
        const fetchData = async () => {
            const parsed = JSON.parse(savedOption);
            const guid = parsed.guid;
            const userId = parseInt(parsed.vaultId);
            console.log(guid, userId)
            try {
                const response = await axios.get(
                    `${constants.mfiles_api}/api/Views/GetViews/${guid}/${userId}`
                );
                setOtherViews(response.data.otherViews.sort((a, b) => a.viewName.localeCompare(b.viewName)));
                setCommonViews(response.data.commonViews.sort((a, b) => a.viewName.localeCompare(b.viewName)));

            } catch {

            }
        };
        fetchData();
    }, [props.viewNavigation, props.selectedVault?.vaultId, setOtherViews, setCommonViews]);

    useEffect(() => {
        const loadViews = async () => {
            try {
                // No navigation → fetch MAIN LIST views
                if (props.viewNavigation.length === 0) {
                    const savedOption = sessionStorage.getItem('selectedVault');
                    if (!savedOption) return;

                    let parsed;
                    try {
                        parsed = JSON.parse(savedOption);
                    } catch {
                        console.error("Invalid JSON for selectedVault");
                        return;
                    }

                    const guid = parsed.guid;
                    const userId = parseInt(parsed.vaultId);

                    if (!guid || !userId) return;

                    try {
                        setLoading(true);
                        const response = await axios.get(
                            `${constants.mfiles_api}/api/Views/GetViews/${guid}/${userId}`
                        );

                        const { otherViews = [], commonViews = [] } = response.data;

                        setOtherViews([...otherViews].sort((a, b) => a.viewName.localeCompare(b.viewName)));
                        setCommonViews([...commonViews].sort((a, b) => a.viewName.localeCompare(b.viewName)));
                        setLoading(false);
                    } catch (err) {
                        console.error("Failed to load main views:", err);
                    }

                    return;
                }

                // Inside a view → fetch based on type
                const lastNavItem = props.viewNavigation.at(-1);
                if (!lastNavItem) return;

                try {
                    switch (lastNavItem.type) {
                        case "Common Views":
                        case "Other Views":
                            await fetchMainViewObjects(lastNavItem, lastNavItem.type);
                            break;

                        case "MFFolderContentItemTypeViewFolder":
                            await fetchMainViewObjects2(lastNavItem);
                            break;

                        case "MFFolderContentItemTypePropertyFolder":
                            await fetchViewData(lastNavItem);
                            break;

                        default:
                            console.warn("Unknown view type:", lastNavItem.type);
                            break;
                    }
                } catch (err) {
                    console.error("Error loading nested view:", err);
                }

            } catch (outerErr) {
                console.error("Unhandled error in view loader:", outerErr);
            }
        };

        loadViews();
    }, [props.refreshKey]);


    // Navigation and fetch logic
    const backToViews = useCallback(() => {
        props.resetPreview();
        props.setSelectedViewObjects([]);
        props.setViewNavigation([]);
        props.setViewNavigation2([])
        // setSelectedViewCategory([]);
    }, [props]);

    const handleViewNavClick = useCallback((item) => {
        const itemIndex = props.viewNavigation.findIndex(navItem => navItem.id === item.id);
        if (itemIndex !== -1) {
            props.setViewNavigation(props.viewNavigation.slice(0, itemIndex + 1));
            props.setViewNavigation2(props.viewNavigation2.slice(0, itemIndex + 1));
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
        props.setViewNavigation2([])
        props.setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, { ...item, type: viewType, title: item.viewName }];
            }
            props.setViewNavigation2(prevItems)
            return prevItems;
        });
        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.selectedVault?.vaultId}`,
                { headers: { accept: '*/*' } }
            );
            props.setSelectedViewObjects(response.data);
            setLoading(false);

            // setSelectedViewName(item.viewName);
            console.log(`${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.selectedVault?.vaultId}`)
            console.log('Fetched view data for property folder:', response.data);


        } catch {
            console.log(`${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.selectedVault?.vaultId}`)
            props.setSelectedViewObjects([]);
            setLoading(false);
            // props.setAlertPopOpen(true);
            // props.setAlertPopSeverity("info");
            // props.setAlertPopMessage("Sorry, we couldn't find any objects!");
        }
    }, [props.selectedVault, props.selectedVault?.vaultId, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, props.setViewNavigation]);

    const fetchMainViewObjects2 = useCallback(async (item) => {
        setLoading(true);
        // console.log(item)

        // if (item.type = "MFFolderContentItemTypeViewFolder") {
        //     console.log(props.viewNavigation)
        //     console.log("reset view value")
        // }



        props.setViewNavigation(prevItems => {
            const exists = prevItems.some(navItem => navItem.id === item.id);
            if (!exists) {
                return [...prevItems, { ...item, type: 'MFFolderContentItemTypeViewFolder' }];
            }
            return prevItems;
        });

        // Reset view navigation since you are navigating in a new view 
        props.setViewNavigation2([])

        try {
            const response = await axios.get(
                `${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.selectedVault?.vaultId}`,
                { headers: { accept: '*/*' } }
            );
            props.setSelectedViewObjects(response.data);
            setLoading(false);

            // setSelectedViewName(item.title);
            console.log(`${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.selectedVault?.vaultId}`)
            console.log('Fetched view data for view folder:', response.data);

        } catch {
            console.log(`${constants.mfiles_api}/api/Views/GetObjectsInView?ViewId=${item.id}&VaultGuid=${props.selectedVault.guid}&UserID=${props.selectedVault?.vaultId}`)
            props.setSelectedViewObjects([]);
            setLoading(false);
            // props.setAlertPopOpen(true);
            // props.setAlertPopSeverity("info");
            // props.setAlertPopMessage("Sorry, we couldn't find any objects matching your request!");
        }
    }, [props.selectedVault, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, props.setViewNavigation]);

    const fetchViewData = useCallback(async (item) => {
        setLoading(true);

        // ----------------------------------------
        // Helper: Update a navigation list safely
        // ----------------------------------------
        const updateNavigationList = (setNav) => {
            setNav(prev => {
                const exists = prev.some(n => n.propId === item.propId);
                const updated = exists ? prev : [...prev, { ...item }];

                processNavigation(updated);
                return updated;
            });
        };

        // Update both lists using the helper
        updateNavigationList(props.setViewNavigation);
        updateNavigationList(props.setViewNavigation2);

        // ----------------------------------------
        // Helper: Handle navigation processing
        // ----------------------------------------
        function processNavigation(updatedItems) {
            const newItem = {
                propId: String(item.propId),
                propDatatype: String(item.propDatatype),
            };

            // Only folder-content items
            const propertyFolders = updatedItems.filter(
                (i) => i.type === "MFFolderContentItemTypePropertyFolder"
            );

            const transformedList = propertyFolders.map((i) => ({
                propId: i.propId,
                propDatatype: i.propDatatype,
            }));

            // Add current item if not present
            const exists = transformedList.some(
                (t) => t.propId === newItem.propId && t.propDatatype === newItem.propDatatype
            );

            const finalList = exists ? transformedList : [...transformedList, newItem];

            apiRequest(finalList);
        }

        // ----------------------------------------
        // API Request
        // ----------------------------------------
        async function apiRequest(properties) {
            try {
                const payload = {
                    viewId: item.viewId,
                    userID: props.selectedVault?.vaultId,
                    properties,
                    vaultGuid: props.selectedVault.guid,
                };
                console.log(`${constants.mfiles_api}/api/Views/GetViewPropObjects`);
                console.log(payload);

                const response = await axios.post(
                    `${constants.mfiles_api}/api/Views/GetViewPropObjects`,
                    payload,
                    {
                        headers: {
                            accept: "*/*",
                            "Content-Type": "application/json",
                        },
                    }
                );

                props.setSelectedViewObjects(response.data);

                console.log('Fetched view data for property folder:', response.data);
            } catch (error) {
                console.log(`${constants.mfiles_api}/api/Views/GetViewPropObjects`);
                console.log({
                    viewId: item.viewId,
                    userID: props.selectedVault?.vaultId,
                    properties,
                    vaultGuid: props.selectedVault.guid,
                });
                props.setSelectedViewObjects([]);
            } finally {
                setLoading(false);
            }
        }
    }, [
        props.selectedVault,
        props.setViewNavigation,
        props.setViewNavigation2,
        props.setSelectedViewObjects,
    ]);

    const handleMenuClose = useCallback(() => {
        setMenuAnchor(null);
        setMenuItem(null);
    }, []);

    // Convert viewNavigation to a string for URL
    // const updateUrlFromNavigation = (viewNavigation) => {
    //     if (!viewNavigation || viewNavigation.length === 0) {
    //         window.history.replaceState(null, '', window.location.pathname);
    //         return;
    //     }

    //     const segments = viewNavigation.map(item => {
    //         // Use IDs and type to encode
    //         return `${item.id}`;
    //     });

    //     const newHash = segments.join('/');
    //     window.history.replaceState(null, '', `#${newHash}`);
    // };

    // useEffect(() => {
    //     updateUrlFromNavigation(props.viewNavigation);
    // }, [props.viewNavigation]);



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
                            version={menuItem.versionId ?? null}
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

    useEffect(() => {
    }, [props.selectedVault?.vaultId]);

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
            {/* <LoadingDialog opendialogloading={loading} /> */}
            <OfficeApp
                open={openOfficeApp}
                close={() => setOpenOfficeApp(false)}
                object={objectToEditOnOffice}
                mfilesId={props.selectedVault?.vaultId}
            />
            {loading ? (
                <>

                    {/* <NavigationBreadcrumb
                        viewNavigation={props.viewNavigation}
                        onBackToViews={backToViews}
                        onNavClick={handleViewNavClick}
                        onResetPreview={props.resetPreview}
                    /> */}

                    <Loader />
                </>
            ) :
                <>
                    {props.selectedViewObjects.length > 0 || props.viewNavigation.length > 0 ? (
                        <>
                            {/* Breadcrumb section — fixed and not scrollable */}
                            <div
                                style={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 100,
                                    backgroundColor: '#ecf4fc',
                                    overflow: 'hidden', // prevents internal scrolling
                                    whiteSpace: 'nowrap',

                                    // borderBottom: '1px solid #e0e0e0'
                                }}
                            >
                                <NavigationBreadcrumb
                                    viewNavigation={props.viewNavigation}
                                    onBackToViews={backToViews}
                                    onNavClick={handleViewNavClick}
                                    onResetPreview={props.resetPreview}
                                />
                            </div>

                            {/* Scrollable main content */}
                            <div>
                                {props.selectedViewObjects.length > 0 ? (
                                    <>
                                        <div className="text-dark" style={MAIN_CONTENT_STYLES}>
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

                                            return (
                                                <ColumnSimpleTree
                                                    data={versions}
                                                    selectedVault={props.selectedVault}
                                                    mfilesId={props.selectedVault?.vaultId}
                                                    selectedItemId={props.selectedItemId}
                                                    setSelectedItemId={props.setSelectedItemId}
                                                    onItemClick={props.handleClick}
                                                    onItemDoubleClick={props.handleDoubleClick}
                                                    onItemRightClick={props.handleRightClick}
                                                    onRowClick={props.handleRowClick}
                                                    getTooltipTitle={props.toolTipTitle}
                                                    setBlob={props.setBlob}
                                                    setSelectedFileId={props.setSelectedFileId}
                                                    setExtension={props.setExtension}
                                                    setLoadingFile={props.setLoadingFile}
                                                    a11yProps={props.a11yProps}
                                                    headerTitle="Search Results"
                                                    nameColumnLabel="Name"
                                                    dateColumnLabel="Date Modified"
                                                    renderHeight="60vh"
                                                />
                                            );
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
                                    </>
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 'inherit',
                                            width: '100%',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 3,
                                                backgroundColor: '#fff',
                                            }}
                                        >
                                        
                                            <FaBan className="mx-2" style={{ fontSize: '40px', color: '#2757aa', marginBottom: '16px' }} />
                                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#333', mb: 1 }}>
                                                No Results Found
                                            </Typography>
                                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#333', mb: 1 }}>
                                                No items found in this view
                                            </Typography>
                                        </Box>
                                    </div>
                                )}
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
                                            <CiCircleList className="mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }} />
                                           
                                            Common Views
                                        </span>
                                        <small style={{ color: '#2757aa', fontSize: '12px' }}>({filteredCommonViews.length})</small>
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
                                            <CiCircleList className="mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }} />
                                            Other Views
                                        </span>
                                        <small style={{ color: '#2757aa', fontSize: '12px' }}>({filteredOtherViews.length})</small>
                                    </h6>
                                    {showOtherViewSublist && (
                                        <div style={{
                                            height: filteredCommonViews?.length < 1 ? '70vh' : '27vh',
                                            overflowY: 'auto',
                                        }} className='text-dark bg-white'>
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
                </>}


        </>
    );
};

export default ViewsList;