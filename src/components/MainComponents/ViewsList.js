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
    maxHeight: '55vh',
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
    <h6 className="px-2 py-1 text-dark d-flex align-items-center flex-wrap" style={NAVIGATION_STYLES}>
        <div className="d-flex align-items-center" style={{ minWidth: '24px' }}>
            <FontAwesomeIcon
                icon={faTable}
                style={{ color: '#1C4690', fontSize: '18px' }}
                className="mx-2"
            />
        </div>
        <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px', flex: 1 }}>
            <span onClick={onBackToViews}>Back to views</span>
            <i className="fas fa-chevron-right" style={{ color: '#2a68af' }} />
            {viewNavigation.map((item, index) => (
                <React.Fragment key={index}>
                    <Tooltip title={item.title}>
                        <span
                            onClick={() => {
                                onNavClick(item);
                                onResetPreview();
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
));

const TableHeader = memo(() => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 10px 4px 10px',
            backgroundColor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            fontWeight: 400,
            fontSize: '12px',
            color: '#555'
        }}
    >
        <span style={{ marginLeft: '10%', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Name
        </span>
        <span style={{ marginRight: '10%', width: 160, textAlign: 'right', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            Date Modified
        </span>
    </div>
));

const ObjectTreeItem = memo(({
    item,
    index,
    selectedItemId,
    selectedVault,
    onItemClick,
    onRightClick,
    onPreviewSublistObject,
    onPreviewObject,
    setSelectedItemId,
    handleRowClick,
    mfilesId,
    downloadFile
}) => {
    const toolTipTitle = useMemo(() => (
        <span>
            {item.title}
            {(item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true) ? (
                <FileExtText
                    guid={selectedVault.guid}
                    objectId={item.id}
                    classId={item.classId}
                />
            ) : null}
        </span>
    ), [item.title, item.objectTypeId, item.objectID, item.isSingleFile, item.id, item.classId, selectedVault.guid]);

    const formattedDate = useMemo(() => formatDate(item.lastModifiedUtc), [item.lastModifiedUtc]);

    const handleClick = useCallback(() => {
        setSelectedItemId(item.id);
        (item.objectTypeId === 0 || item.objectID === 0) && (item.isSingleFile === true)
            ? onPreviewSublistObject(item, true)
            : onPreviewObject(item, true);
    }, [item, setSelectedItemId, onPreviewSublistObject, onPreviewObject]);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault();
        onRightClick(e, item);
    }, [onRightClick, item]);

    const isSelected = selectedItemId === item.id;
    const isObjectType0 = item.objectTypeId === 0 || item.objectID === 0;
    const isSingleFile = item.isSingleFile === true;

    return (
        <SimpleTreeView>
            <TreeItem
                key={`tree-item-${item.id || index}`}
                itemId={`tree-item-${item.id || index}`}
                onClick={handleClick}
                className='my-1'
                sx={TREE_ITEM_OBJECT_STYLES}
                label={
                    <div
                        onContextMenu={handleContextMenu}
                        style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            sx={{
                                ...BOX_PADDING_STYLES,
                                backgroundColor: isSelected ? '#fcf3c0' : 'inherit',
                                width: '100%'
                            }}
                        >
                            {isObjectType0 && isSingleFile ? (
                                <FileExtIcon
                                    fontSize={'15px'}
                                    guid={selectedVault.guid}
                                    objectId={item.id}
                                    classId={item.classId !== undefined ? item.classId : item.classID}
                                />
                            ) : (
                                isObjectType0 && !isSingleFile ? (
                                    <i className='fas fa-book' style={{ color: '#7cb518', fontSize: '15px' }} />
                                ) : (
                                    <i className='fa-solid fa-folder' style={{ fontSize: '15px', color: '#2a68af' }} />
                                )
                            )}
                            <span style={TITLE_SPAN_STYLES}>
                                <Tooltip title={toolTipTitle} placement="right" arrow>
                                    <span style={TOOLTIP_INNER_STYLES}>
                                        {item.title}
                                    </span>
                                </Tooltip>
                                {isObjectType0 && isSingleFile && (
                                    <FileExtText
                                        guid={selectedVault.guid}
                                        objectId={item.id}
                                        classId={item.classId}
                                    />
                                )}
                            </span>
                            <span style={DATE_SPAN_STYLES}>
                                {formattedDate}
                            </span>
                        </Box>
                    </div>
                }
            >
                {isObjectType0 && !isSingleFile && (
                    <MultifileFiles
                        selectedVault={selectedVault}
                        item={item}
                        downloadFile={downloadFile}
                        selectedItemId={selectedItemId}
                        setSelectedItemId={setSelectedItemId}


                    />
                )}
                <LinkedObjectsTree
                    id={item.id}
                    classId={item.classId || item.classID}
                    objectType={item.objectTypeId !== undefined ? item.objectTypeId : item.objectID}
                    selectedVault={selectedVault}
                    mfilesId={mfilesId}
                    handleRowClick={handleRowClick}
                    setSelectedItemId={setSelectedItemId}
                    selectedItemId={selectedItemId}
                    downloadFile={downloadFile}
                />
            </TreeItem>
        </SimpleTreeView>
    );
});

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
    const [selectedViewObjects, setSelectedViewObjects] = useSessionState('ss_selectedViewObjects', []);
    const [selectedViewName, setSelectedViewName] = useSessionState('ss_selectedViewName', '');
    const [selectedViewCategory, setSelectedViewCategory] = useSessionState('ss_selectedViewCategory', []);
    const [showOtherViewSublist, setshowOtherViewSublist] = useSessionState('ss_showOtherViewSublist', true);
    const [showCommonViewSublist, setshowCommonViewSublist] = useSessionState('ss_showCommonViewSublist', true);

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
        () => selectedViewObjects.some(item => item.type === "MFFolderContentItemTypeObjectVersion"),
        [selectedViewObjects]
    );

    // Memoized API calls
    const fetchObjectFile = useCallback(async (item) => {
         const classId= item.classId || item.classID
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
    }, [viewNavigation, props.mfilesId, setOtherViews, setCommonViews]);

    // Navigation and fetch logic
    const backToViews = useCallback(() => {
        props.resetPreview();
        setSelectedViewObjects([]);
        setViewNavigation([]);
        setSelectedViewCategory([]);
    }, [props, setSelectedViewObjects, setViewNavigation, setSelectedViewCategory]);

    const handleViewNavClick = useCallback((item) => {
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
    }, [viewNavigation, setViewNavigation]);

    const fetchMainViewObjects = useCallback(async (item, viewType) => {
        setLoading(true);
        setViewNavigation([])
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
    }, [props.selectedVault, props.mfilesId, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, setLoading, setViewNavigation, setSelectedViewObjects, setSelectedViewName]);

    const fetchMainViewObjects2 = useCallback(async (item) => {
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
    }, [props.selectedVault, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, setLoading, setViewNavigation, setSelectedViewObjects, setSelectedViewName]);

    const fetchViewData = useCallback(async (item) => {
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
    }, [props.selectedVault, props.setAlertPopOpen, props.setAlertPopSeverity, props.setAlertPopMessage, setLoading, setViewNavigation, setSelectedViewObjects, setSelectedViewName]);

    const handleRowClick = useCallback((subItem) => {
        if (subItem.objectID === 0 && subItem.isSingleFile === true) {
            props.previewSublistObject(subItem, false);
        } else {
            props.previewObject(subItem, false);
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

            {selectedViewObjects.length > 0 ? (
                <>
                    <NavigationBreadcrumb
                        viewNavigation={viewNavigation}
                        onBackToViews={backToViews}
                        onNavClick={handleViewNavClick}
                        onResetPreview={props.resetPreview}
                    />

                    {hasObjectVersions && <TableHeader />}

                    <div className='p-2 text-dark' style={MAIN_CONTENT_STYLES}>
                        {selectedViewObjects.map((item, index) => (
                            <React.Fragment key={index}>
                                {item.type === "MFFolderContentItemTypeObjectVersion" && (
                                    <ObjectTreeItem
                                        item={item}
                                        index={index}
                                        selectedItemId={props.selectedItemId}

                                        selectedVault={props.selectedVault}
                                        onItemClick={handleRightClick}
                                        onRightClick={handleRightClick}
                                        onPreviewSublistObject={props.previewSublistObject}
                                        onPreviewObject={props.previewObject}
                                        setSelectedItemId={props.setSelectedItemId}
                                        handleRowClick={handleRowClick}
                                        mfilesId={props.mfilesId}
                                        downloadFile={props.downloadFile}
                                    />
                                )}
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