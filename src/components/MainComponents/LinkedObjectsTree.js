import { useState, useEffect } from "react";
import axios from "axios";
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box } from "@mui/material";
import FileExtIcon from "../FileExtIcon";
import FileExtText from "../FileExtText";
import * as constants from '../Auth/configs'
import RightClickMenu from "../RightMenu";
import OfficeApp from "../Modals/OfficeAppDialog";

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

const LinkedObjectsTree = ({ id, objectType, selectedVault, mfilesId, handleRowClick, setSelectedItemId, selectedItemId }) => {
  const [linkedObjects, setLinkedObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [objectToEditOnOffice, setObjectToEditOnOfficeApp] = useSessionState('ss_objectToEditOnOfficeApp', {});
  const [openOfficeApp, setOpenOfficeApp] = useSessionState('ss_openOfficeApp', false);


  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertMsg, setAlertMsg] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Right-click menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [file, setFile] = useState(null);

  async function fetchObjectFile(item) {
    // const objectType = item.objectTypeId ?? item.objectID;
    const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${selectedVault.guid}/${item.id}/0`;

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
      throw error;
    }
  }

  const handleRightClick = (event, item) => {
    event.preventDefault();
    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
    // console.log(item)
    if (item.objectID === 0 || item.objectTypeId === 0) {
      fetchObjectFile(item);
    }

  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuItem(null);
  };

  useEffect(() => {
    fetchLinkedObjects();
  }, [id, objectType, selectedVault.guid]);

  const fetchLinkedObjects = async () => {
    setLoading(true);
    try {
      const url = `${constants.mfiles_api}/api/objectinstance/LinkedObjects/${selectedVault.guid}/${objectType}/${id}/${mfilesId}`
      const response = await axios.get(url);
      setLinkedObjects(response.data || []);
    } catch (error) {
      setLinkedObjects([]);
    }
    setLoading(false);
  };

  const deleteObject = (item) => {
    let data = JSON.stringify({
      "vaultGuid": selectedVault.guid,
      "objectId": item.id,
      "classId": item.classID || item.classId,
      "userID": mfilesId
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${constants.mfiles_api}/api/ObjectDeletion/DeleteObject`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        setOpenAlert(true);
        setAlertSeverity("success");
        setAlertMsg("Object was deleted successsfully");
        setDeleteDialogOpen(false);
        fetchLinkedObjects(); // <-- Reload the component data after delete
      })
      .catch((error) => {
        setOpenAlert(true);
        setAlertSeverity("error");
        setAlertMsg("Failed to delete, please try again later");
        setDeleteDialogOpen(false);
      });
  }

  function mergeObjects(objects) {
    const mergedMap = new Map();
    objects.forEach(obj => {
      const key = `${obj.objecttypeID}-${obj.propertyName}`;
      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          objecttypeID: obj.objecttypeID,
          objectTitle: obj.objectTitle,
          propertyName: obj.propertyName,
          items: []
        });
      }
      mergedMap.get(key).items.push(...obj.items);
    });
    return Array.from(mergedMap.values());
  }

  const otherObjects = mergeObjects(linkedObjects.filter((item) => item.objecttypeID !== 0));
  const documents = linkedObjects.filter((item) => item.objecttypeID === 0);

  async function convertToPDF(item, overWriteOriginal) {
    // alert(file.fileID);
    // console.log('Converting to PDF:', file);

    console.log(item)
    const payload = {
      vaultGuid: selectedVault.guid,  // string
      objectId: item.id,                      // number
      classId: item.classID || item.classId,                       // number
      fileID: file.fileID,                        // number
      overWriteOriginal: overWriteOriginal,           // boolean
      separateFile: overWriteOriginal ? false : true,                // boolean
      userID: mfilesId                     // number
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



  function openApp(item) {
    // console.log(item)
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${selectedVault.guid}/${item.id}/${item.classId ?? item.classID}`;

      try {
        const response = await axios.get(url);
        const data = response.data;
        const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        if (['csv', 'xlsx', 'xls', 'doc', 'docx', 'txt', 'pdf', 'ppt'].includes(extension)) {
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
  }

  const rightClickActions = [
    ...(menuItem && (menuItem.objectID === 0 || menuItem.objectTypeId === 0) ? [
      {
        label: (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <FileExtIcon
              fontSize={'24px'}
              guid={selectedVault.guid}
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

  return (
    <>
      <OfficeApp open={openOfficeApp} close={() => setOpenOfficeApp(false)} object={objectToEditOnOffice} />
      {loading ? (
        <TreeItem className="text-muted" sx={{
          backgroundColor: '#fff',
          padding: '3px',
          color: '#555 !impoetant',
          borderBottom: '1px solid #dedddd',
          fontSize: "12px",
          "& .MuiTreeItem-label": { fontSize: "13px !important" },
          "& .MuiTypography-root": { fontSize: "13px !important" },
        }} itemId="loading" label="Loading..." />
      ) : linkedObjects.length > 0 ? (
        <>
          {/* Render Other Objects */}
          {otherObjects.length > 0 &&
            otherObjects.map((obj, index) => (
              <TreeItem
                sx={{
                  marginLeft: '13px',
                  backgroundColor: '#fff',
                  "&:hover": { backgroundColor: "#fff !important" },
                  "& .MuiTreeItem-content:hover": { backgroundColor: "#fff !important" },
                  "& .MuiTreeItem-content.Mui-selected": { backgroundColor: "#fff !important" },
                  borderRadius: "0px !important",
                  "& .MuiTreeItem-content": { borderRadius: "0px !important" },
                }}
                key={`grid-object-${index}`}
                itemId={`grid-object-${index}`}
                label={
                  <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                      backgroundColor: '#fff',
                      padding: '3px',
                      borderBottom: '1px solid #dedddd'
                    }}
                  >
                    <i style={{ fontSize: '15px', color: '#8d99ae' }} className="fa-regular fa-folder-open mx-2"></i>
                    {obj.propertyName.includes('(s)') ? obj.propertyName : `${obj.propertyName}(s)`}
                  </Box>
                }
              >
                {obj.items?.map((subItem) => (
                  <TreeItem
                    onClick={() => { setSelectedItemId(subItem.id); handleRowClick(subItem) }}
                    key={`grid-object-sub-${obj.propertyName}-${subItem.id}`}
                    itemId={`grid-object-sub-${obj.propertyName}-${subItem.id}`}
                    label={
                      <div
                        onContextMenu={e => handleRightClick(e, subItem)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                      >
                        <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: selectedItemId === subItem.id ? '#fcf3c0' : 'inherit' }}>
                          {subItem.objectID === 0 ? (
                            <FileExtIcon
                              fontSize={'15px'}
                              guid={selectedVault.guid}
                              objectId={subItem.id}
                              classId={subItem.classId !== undefined ? subItem.classId : subItem.classID}
                            />
                          ) : (
                            <i
                              className="fas fa-folder mx-2"
                              style={{ fontSize: "15px", color: "#2a68af" }}
                            ></i>
                          )}
                          <span style={{ fontSize: '13px' }}>{subItem.title}{subItem.objectID === 0 && (
                            <FileExtText
                              guid={selectedVault.guid}
                              objectId={subItem.id}
                              classId={subItem.classID}
                            />
                          )}</span>
                        </Box>
                      </div>
                    }
                  />
                ))}
              </TreeItem>
            ))}

          {/* Render Documents */}
          {documents.length > 0 && (
            <TreeItem
              sx={{
                marginLeft: '13px',
                backgroundColor: '#fff',
                "&:hover": { backgroundColor: "#fff !important" },
                "& .MuiTreeItem-content:hover": { backgroundColor: "#fff !important" },
                "& .MuiTreeItem-content.Mui-selected": { backgroundColor: "#fff !important" },
                "& .MuiTreeItem-content.Mui-selected:hover": { backgroundColor: "#fff !important" },
                borderRadius: "0px !important",
                "& .MuiTreeItem-content": { borderRadius: "0px !important" },
              }}
              key="grid-document"
              itemId="grid-document"
              label={
                <Box display="flex" alignItems="center" sx={{
                  backgroundColor: '#fff',
                  padding: '3px',
                  borderBottom: '1px solid #dedddd'
                }}>
                  <i style={{ fontSize: '15px', color: '#8d99ae' }} className="fa fa-book mx-2 "></i> Document(s)
                </Box>}
            >
              {documents.map((doc) =>
                doc.items?.map((subItem, index) => (
                  <TreeItem
                    onClick={() => { setSelectedItemId(subItem.id); handleRowClick(subItem) }}
                    key={`grid-document-sub-${index}-${subItem.id}`}
                    itemId={`grid-document-sub-${index}-${subItem.id}`}
                    label={
                      <div
                        onContextMenu={e => handleRightClick(e, subItem)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center' }}
                      >
                        <Box display="flex" alignItems="center" sx={{ padding: '3px', backgroundColor: selectedItemId === subItem.id ? '#fcf3c0' : 'inherit' }}>
                          {subItem.objectID === 0 ? (
                            <FileExtIcon
                              fontSize={'15px'}
                              guid={selectedVault.guid}
                              objectId={subItem.id}
                              classId={subItem.classId !== undefined ? subItem.classId : subItem.classID}
                            />
                          ) : (
                            <i
                              className="fas fa-folder mx-1"
                              style={{ fontSize: "15px", color: "#fff" }}
                            ></i>
                          )}
                          <span style={{ marginLeft: '8px', fontSize: '13px' }}>{subItem.title}{subItem.objectID === 0 && (
                            <FileExtText
                              guid={selectedVault.guid}
                              objectId={subItem.id}
                              classId={subItem.classID}
                            />
                          )}</span>
                        </Box>
                      </div>
                    }
                  />
                ))
              )}
            </TreeItem>
          )}
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
        </>
      ) : (
        <TreeItem
          sx={{
            backgroundColor: '#fff',
            padding: '3px',
            borderBottom: '1px solid #dedddd',
            fontSize: "12px",
            "& .MuiTreeItem-label": { fontSize: "13px !important" },
            "& .MuiTypography-root": { fontSize: "13px !important" },
          }}
          itemId="no-relationships"
          label="No relationships found"
          className="text-muted"
        />
      )}
    </>
  );
};

export default LinkedObjectsTree;