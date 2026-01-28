import { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box } from "@mui/material";
import FileExtIcon from "../FileExtIcon";
import FileExtText from "../FileExtText";
import * as constants from '../Auth/configs'
import RightClickMenu from "../RightMenu";
import OfficeApp from "../Modals/OfficeAppDialog";
import { Tooltip } from '@mui/material';
import MultifileFiles from "../MultifileFiles";
import { SimpleTreeView } from '@mui/x-tree-view';

import { FaBook } from "react-icons/fa";
import { FaRegFolderOpen } from "react-icons/fa6";
import { FaFolder } from "react-icons/fa";
import { TbFoldersFilled } from "react-icons/tb";
import { IoDocuments } from "react-icons/io5";
import { BsFiles } from "react-icons/bs";
import { LuFolderSymlink } from "react-icons/lu";
import { SiFiles } from "react-icons/si";
import { MdOutlineFolderCopy } from "react-icons/md";
import SubLinkedObjectsTree from "./SubLinkedObjectsTree";


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

// Optimized constants with minimal spacing
const TREE_ITEM_STYLES = {
  ml: 2.5, // Reduced from 13px to 8px
  backgroundColor: '#fff',
  "&:hover": { backgroundColor: "#fff !important" },
  "& .MuiTreeItem-content:hover": { backgroundColor: "#fff !important" },
  "& .MuiTreeItem-content.Mui-selected": { backgroundColor: "#fff !important" },
  "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: "#fff !important" },
  borderRadius: 0,
  "& .MuiTreeItem-content": { borderRadius: 0 },
  "--TreeView-itemPadding": "0px",
  "--TreeView-itemIndentation": "0px",
  padding: 0,
  /* 🔑 hide arrow if no children */
  "& .MuiTreeItem-group:empty": {
    display: "none",
  },
  "& .MuiTreeItem-group:empty ~ .MuiTreeItem-content .MuiTreeItem-iconContainer": {
    display: "none",
  },
};

const LOADING_STYLES = {
  backgroundColor: '#fff',
  p: 0.5, // Reduced padding
  color: '#555b6e',

  fontSize: "13px",
  "& .MuiTreeItem-label": { fontSize: "13px !important" },
  "& .MuiTypography-root": { fontSize: "13px !important" },
  "--TreeView-itemPadding": "0px",
  "--TreeView-itemIndentation": "0px",
};

const BOX_STYLES = {
  backgroundColor: '#fff',
  p: 0.5, // Reduced from 3px to 4px
  borderBottom: '1px solid #dedddd',
};

// Optimized date formatter
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

// Optimized merge function
const mergeObjects = (objects) => {
  const mergedMap = new Map();
  objects.forEach(obj => {
    const key = `${obj.objecttypeID}-${obj.propertyName}`;
    if (!mergedMap.has(key)) {
      mergedMap.set(key, {
        objecttypeID: obj.objecttypeID,
        propertyName: obj.propertyName,
        propertyName: obj.propertyName,
        items: []
      });
    }
    mergedMap.get(key).items.push(...obj.items);
  });
  return Array.from(mergedMap.values());
};

// Updated TreeSubItem with unique itemId generation and selection highlighting
const TreeSubItem = memo(({
  subItem,
  selectedItemId,
  setSelectedItemId,
  selectedVault,
  onRightClick,
  onItemClick,
  isDocument,
  parentKey // Add this new prop to ensure uniqueness
}) => {
  const toolTipTitle = useMemo(() => (
    <span >
      {subItem.title}
      {subItem.objectID === 0 && (
        <FileExtText
          guid={selectedVault.guid}
          objectId={subItem.id}
          classId={subItem.classID}
        />
      )}
    </span>
  ), [subItem.title, subItem.objectID, subItem.id, subItem.classID, selectedVault.guid]);

  const formattedDate = useMemo(() => formatDate(subItem.lastModifiedUtc), [subItem.lastModifiedUtc]);

  const handleContextMenu = useCallback((e) => {
    onRightClick(e, subItem);
  }, [onRightClick, subItem]);

  const handleClick = useCallback(() => {
    onItemClick(subItem);
  }, [onItemClick, subItem]);

  const isSelected = selectedItemId === `${subItem.id}-${subItem.title}`;
  const isObjectType0 = subItem.objectTypeId === 0 || subItem.objectID === 0;
  const isSingleFile = subItem.isSingleFile === true;

  // Generate unique itemId using parentKey to avoid duplicates
  const uniqueItemId = `${parentKey}-${subItem.id}-${subItem.title?.replace(/[^a-zA-Z0-9]/g, '')?.substring(0, 10)}`;

  return (
    <TreeItem
      onClick={handleClick}
      key={uniqueItemId}
      itemId={uniqueItemId}
      sx={{
        /* Remove ALL indentation */
        "--TreeView-itemPadding": "0px",
        "--TreeView-itemIndentation": "0px",

        /* Content */
        "& .MuiTreeItem-content": {
          paddingLeft: "0px !important",
          marginLeft: "0px !important",
          gap: "6px",
          backgroundColor: isSelected ? "#e5e5e5 !important" : "#fff !important"
        },

        /* Expand icon container */
        "& .MuiTreeItem-iconContainer": {
          display: "none !important",
          width: "0px !important",
          margin: "0px !important",
          padding: "0px !important"
        },

        /* Children group indentation */
        "& .MuiTreeItem-group": {
          marginLeft: "0px !important",
          paddingLeft: "0px !important"
        },

        /* Root label wrapper */
        "& .MuiTreeItem-label": {
          paddingLeft: "0px !important"
        }
      }}
      label={
        <>
          <div
            onContextMenu={handleContextMenu}
            style={{ width: '100%', display: 'flex', alignItems: 'center' }}
          >
            <Box
              className="p-1"
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isSelected ? '#e5e5e5' : 'inherit',
                width: '100%',
                gap: 1 // Using gap instead of margins
              }}
            >


              {/* Icon with no extra margins */}
              {isDocument ? (
                isObjectType0 && isSingleFile ? (
                  <FileExtIcon
                    fontSize={'18px'}
                    guid={selectedVault.guid}
                    objectId={subItem.id}
                    classId={subItem.classId !== undefined ? subItem.classId : subItem.classID}
                    sx={{ flexShrink: 0 }}
                  />
                ) : (
                  isObjectType0 && !isSingleFile ? (
                    <FaBook style={{ color: '#7cb518', fontSize: '18px', flexShrink: 0 }} />
                  ) : (
                    <FaFolder style={{ fontSize: '18px', color: '#2a68af', flexShrink: 0 }} />
                  )
                )
              ) : (
                <FaFolder style={{ fontSize: "18px", color: "#2a68af", flexShrink: 0 }} />
              )}

              {/* Title with optimized spacing */}
              <Tooltip title={toolTipTitle} placement="top" arrow>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '13px'
                  }}
                >
                  {subItem.title}
                  {isDocument && isObjectType0 && isSingleFile && (
                    <FileExtText
                      guid={selectedVault.guid}
                      objectId={subItem.id}
                      classId={subItem.classID}
                    />
                  )}
                </Box>
              </Tooltip>

              {/* Date flexed to the end */}
              <Box sx={{
                fontSize: '13px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                marginLeft: 'auto'  // This pushes the date to the far right
              }}>
                {formattedDate}
              </Box>
            </Box>
          </div>
          {isDocument && !isSingleFile && (
            <MultifileFiles
              item={subItem}
              selectedItemId={selectedItemId}
              selectedVault={selectedVault}
              setSelectedItemId={setSelectedItemId}
            />
          )}
        </>
      }
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.selectedItemId === nextProps.selectedItemId &&
    prevProps.subItem.id === nextProps.subItem.id &&
    prevProps.subItem.title === nextProps.subItem.title &&
    prevProps.subItem.lastModifiedUtc === nextProps.subItem.lastModifiedUtc
  );
});

const LinkedObjectsTree = ({
  id,
  classId,
  objectType,
  selectedVault,
  mfilesId,
  handleRowClick,
  onItemRightClick,
  setSelectedItemId,
  selectedItemId,
}) => {
  const [linkedObjects, setLinkedObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
  const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [file, setFile] = useState(null);

  // Memoized data processing
  const { otherObjects, documents } = useMemo(() => {
    const docs = linkedObjects.filter((item) => {
      // Check if all items in this group have objectID === 0 (documents)
      return item.items && item.items.every(subItem => subItem.objectID === 0);
    });

    const others = linkedObjects.filter((item) => {
      // Check if items in this group have objectID !== 0 (other objects)
      return item.items && item.items.some(subItem => subItem.objectID !== 0);
    });

    const merged = mergeObjects(others);

    return { otherObjects: merged, documents: docs };
  }, [linkedObjects]);

  const fetchLinkedObjects = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/LinkedObjects/${selectedVault.guid}/${objectType}/${id}/${classId}/${mfilesId}`;
      const response = await axios.get(url);
      setLinkedObjects(response.data || []);

    } catch {
      setLinkedObjects([]);
    }
    setLoading(false);
  }, [selectedVault.guid, objectType, id, mfilesId]);

  // API calls and handlers
  const fetchObjectFile = useCallback(async (item) => {
    alert("Fetching file for objectID ");
    const classId = item.classId || item.classID
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${selectedVault.guid}/${item.id}/${classId}`;
    try {
      const response = await axios.get(url, {
        headers: { Accept: '*/*' }
      });
      const file = response.data?.[0];

      setFile(file);
    } catch {
      // console.error('Failed to fetch object file:', error);
      // throw error;
    }
  }, [selectedVault.guid]);

  const convertToPDF = useCallback(async (item, keepOriginal) => {
    try {
      const response = await axios.get(
        `${constants.mfiles_api}/api/objectinstance/ConvertObjectToPDF/${selectedVault.guid}/${file?.fileID}/${keepOriginal}`,
        {
          headers: {
            'x-mfiles-unique-key': mfilesId,
          }
        }
      );
      return response.data;
    } catch {
      // console.error('Error converting to PDF:', error);
    }
  }, [selectedVault.guid, file?.fileID, mfilesId]);

  const openApp = useCallback((item) => {
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;
      try {
        const response = await axios.get(url);
        const data = response.data;
        const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        if (['csv', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf', 'ppt', 'jpeg', 'png', 'jpg'].includes(extension)) {
          setObjectToEditOnOfficeApp({
            ...item,
            guid: selectedVault.guid,
            extension,
            type: item.objectTypeId ?? item.objectID
          });
          setOpenOfficeApp(true);
        }
      } catch { }
    };
    fetchExtension();
  }, [selectedVault.guid, setObjectToEditOnOfficeApp, setOpenOfficeApp]);

  const handleRightClick = useCallback((event, item) => {
    event.preventDefault();

    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
    if (item.objectID === 0 || item.objectTypeId === 0) {
      alert("Fetching file for objectID in right click");
      fetchObjectFile(item);
    }
  }, [fetchObjectFile]);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setMenuItem(null);
  }, []);

  const handleItemClick = useCallback((subItem) => {
    setSelectedItemId(`${subItem.id}-${subItem.title}`);
    handleRowClick(subItem);
  }, [setSelectedItemId, handleRowClick]);

  // Optimized right click actions
  const rightClickActions = useMemo(() => {
    const actions = [];

    if (menuItem && (menuItem.objectID === 0 || menuItem.objectTypeId === 0)) {
      actions.push({
        label: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <FileExtIcon
              fontSize={'18px'}
              guid={selectedVault.guid}
              objectId={menuItem.id}
              classId={menuItem.classId !== undefined ? menuItem.classId : menuItem.classID}
            />
            <Box>Open</Box>
            <Box sx={{ ml: 'auto', color: '#666', fontWeight: 500, fontSize: '13px' }}>
              Open in default application
            </Box>
          </Box>
        ),
        onClick: (itm, event) => {
          event?.preventDefault();
          event?.stopPropagation();
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
          label: <Box sx={{ px: 1 }}>Convert to PDF overwrite Original Copy</Box>,
          onClick: (itm, event) => {
            event?.preventDefault();
            event?.stopPropagation();
            convertToPDF(itm, false);
            handleMenuClose();
          }
        },
        {
          label: <Box sx={{ px: 1 }}>Convert to PDF Keep Original Copy</Box>,
          onClick: (itm, event) => {
            event?.preventDefault();
            event?.stopPropagation();
            convertToPDF(itm, true);
            handleMenuClose();
          }
        }
      );
    }

    return actions;
  }, [menuItem, file, selectedVault.guid, openApp, handleMenuClose, convertToPDF]);

  useEffect(() => {
    fetchLinkedObjects();
  }, [fetchLinkedObjects]);

  return (
    <>
      <OfficeApp
        open={openOfficeApp}
        close={() => setOpenOfficeApp(false)}
        object={objectToEditOnOffice}
        mfilesId={mfilesId}
      />
      {loading ? (
        <TreeItem
          sx={LOADING_STYLES}
          itemId={`loading-main-${id}-${classId}`}
          label={
            <Box >
              <span className="loading-indicator text-muted" style={{ fontSize: '13px', color: '#333' }}>
                Checking relationships<span>.</span><span>.</span><span>.</span>
              </span>
            </Box>
          }
        />
      ) : linkedObjects.length > 0 ? (
        <>
          {/* Render Other Objects with optimized spacing */}
          {otherObjects.length > 0 &&
            otherObjects.map((obj, index) => (
              <TreeItem
                sx={TREE_ITEM_STYLES}
                key={`grid-object-${index}`}
                itemId={`grid-object-${index}`}
                label={
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1, // Using gap instead of margins
                    ...BOX_STYLES
                  }}>
                    <MdOutlineFolderCopy style={{ fontSize: '18px', color: '#8d99ae' }} />
                    <Box sx={{ fontSize: '13px' }}>
                      {obj.propertyName?.replace(/\(s\)/g, '')}
                    </Box>
                    <Box sx={{ fontSize: '13px', color: '#666' }}>
                      ({obj.items?.length})
                    </Box>
                  </Box>
                }
              >
                {obj.items?.map((subItem, subIndex) => (
                  <TreeItem
                    sx={{
                      ml: 2,
                      "--TreeView-itemPadding": "0px",
                      "--TreeView-itemIndentation": "0px",
                    }}
                    key={`obj-${subIndex}-${subItem.id}`}
                    itemId={`obj-${subIndex}-${subItem.id}`}
                    label={
                      <TreeSubItem
                        key={`sub-${obj.propertyName}-${subItem.id}-${subIndex}`}
                        subItem={subItem}
                        selectedItemId={selectedItemId}
                        setSelectedItemId={setSelectedItemId}
                        selectedVault={selectedVault}
                        onRightClick={handleRightClick}
                        onItemClick={handleItemClick}
                        isDocument={false}
                        parentKey={`obj-${index}-${obj.propertyName?.replace(/[^a-zA-Z0-9]/g, '')}`}
                      />
                    }
                  >
                    <SubLinkedObjectsTree
                      id={subItem.id}
                      classId={subItem.classId || subItem.classID}
                      objectType={subItem.objectTypeId || subItem.objectID}
                      selectedVault={selectedVault}
                      mfilesId={mfilesId}
                      handleRowClick={handleRowClick}
                      onItemRightClick={onItemRightClick}
                      setSelectedItemId={setSelectedItemId}
                      selectedItemId={selectedItemId}
                    />
                  </TreeItem>


                ))}
              </TreeItem>
            ))}

          {/* Render Documents with optimized spacing */}
          {documents.length > 0 && (

            <TreeItem
              sx={TREE_ITEM_STYLES}
              key="grid-document"
              itemId="grid-document"
              label={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1, // Using gap instead of margins
                    ...BOX_STYLES
                  }}>
                  <BsFiles style={{ fontSize: '18px', color: '#8d99ae' }} />
                  <Box sx={{ fontSize: '13px' }}>Document</Box>
                  {documents.map((doc) => (
                    <Box key={doc.propertyName} sx={{ fontSize: '13px', color: '#666' }}>
                      ({doc.items.length})
                    </Box>
                  ))}
                </Box>
              }
            >
              {documents.map((doc, docIndex) =>
                doc.items?.map((subItem, subIndex) => (
                  <TreeItem
                    sx={{
                      ml: 2,
                      "--TreeView-itemPadding": "0px",
                      "--TreeView-itemIndentation": "0px",
                    }}
                    key={`doc-${docIndex}-${subItem.id}`}
                    itemId={`doc-${docIndex}-${subItem.id}`}
                    label={
                      <TreeSubItem
                        subItem={subItem}
                        selectedItemId={selectedItemId}
                        setSelectedItemId={setSelectedItemId}
                        selectedVault={selectedVault}
                        onRightClick={onItemRightClick}
                        onItemClick={handleItemClick}
                        isDocument
                        parentKey={`doc-${docIndex}`}
                      />
                    }
                  >
                    <SubLinkedObjectsTree
                      id={subItem.id}
                      classId={subItem.classId || subItem.classID}
                      objectType={subItem.objectTypeId || subItem.objectID}
                      selectedVault={selectedVault}
                      mfilesId={mfilesId}
                      handleRowClick={handleRowClick}
                      onItemRightClick={onItemRightClick}
                      setSelectedItemId={setSelectedItemId}
                      selectedItemId={selectedItemId}
                    />
                  </TreeItem>

                ))
              )}
            </TreeItem>

          )}

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
        <></>
      )}
    </>
  );
};

export default LinkedObjectsTree;