import { useState, useEffect } from "react";
import axios from "axios";
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box } from "@mui/material";
import FileExtIcon from "../FileExtIcon"; // Import your file icon component
import FileExtText from "../FileExtText"; // Import your file text component
import * as constants from '../Auth/configs'

const LinkedObjectsTree = ({ id, objectType, selectedVault, mfilesId, handleRowClick }) => {
  const [linkedObjects, setLinkedObjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch linked objects when component mounts
  useEffect(() => {
    const fetchLinkedObjects = async () => {
      setLoading(true);
      try {

        const url = `${constants.mfiles_api}/api/objectinstance/LinkedObjects/${selectedVault.guid}/${objectType}/${id}/${mfilesId}`
        // console.log(url)
        const response = await axios.get(url);
        setLinkedObjects(response.data || []);
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching linked objects:", error);
        setLinkedObjects([]);
      }
      setLoading(false);
    };

    fetchLinkedObjects();
  }, [id, objectType, selectedVault.guid]);


  function mergeObjects(objects) {
    const mergedMap = new Map();

    objects.forEach(obj => {
        const key = `${obj.objecttypeID}-${obj.propertyName}`; // Unique key for grouping

        if (!mergedMap.has(key)) {
            mergedMap.set(key, {
                objecttypeID: obj.objecttypeID,
                objectTitle: obj.objectTitle,
                propertyName: obj.propertyName,
                items: []
            });
        }

        mergedMap.get(key).items.push(...obj.items); // Append items to existing list
    });

    return Array.from(mergedMap.values());
}
  // Filter "Other Objects" (objectTypeID !== 0)
  const otherObjects = mergeObjects(linkedObjects.filter((item) => item.objecttypeID !== 0));
  // Filter "Documents" (objectTypeID === 0)
  const documents = linkedObjects.filter((item) => item.objecttypeID === 0);

  return (
    <>
      {loading ? (
        <TreeItem sx={{
         
          backgroundColor: '#fff',
          // backgroundColor: '#e5e5e5',
          padding: '3px',
          color:'#555 !impoetant',
          borderBottom: '1px solid #2757aa',
           fontSize: "10px", // Apply directly to TreeItem
          "& .MuiTreeItem-label": { fontSize: "10px !important" }, // Force label font size
          "& .MuiTypography-root": { fontSize: "10px !important" }, // Ensure all text respects this
        }} itemId="loading" label="Loading..." />
        
      ) : linkedObjects.length > 0 ? (
        <>
          {/* Render Other Objects */}
          {otherObjects.length > 0 &&
            otherObjects.map((obj, index) => (
              <TreeItem

                sx={
                  {
                    marginLeft: '10px',
                    backgroundColor: '#fff',

                    "&:hover": {
                      backgroundColor: "#fff !important", // Maintain white background on hover
                    },
                    "& .MuiTreeItem-content:hover": {
                      backgroundColor: "#fff !important", // Remove hover effect from the content area
                    },
                    "& .MuiTreeItem-content.Mui-selected": {
                      backgroundColor: "#fff !important", // Keep white after selection
                    },
                    "& .MuiTreeItem-content.Mui-selected:hover": {
                      backgroundColor: "#fff !important", // Keep white even when selected and hovered
                    },
                    borderRadius: "0px !important", // Remove border radius
                    "& .MuiTreeItem-content": {
                      borderRadius: "0px !important", // Remove border radius from content area
                    },

                  }
                }
                key={`grid-object-${index}`}
                itemId={`grid-object-${index}`}
                label={
                  <Box
                  display="flex"
                  alignItems="center"
                  sx={{
                    backgroundColor: '#fff',
                    // backgroundColor: '#e5e5e5',
                    padding: '3px',
                    borderBottom: '1px solid #dedddd'
                  }}
                >
                  <i style={{ color: '#2757aa' }} className="fa-solid fa-folder-open mx-2"></i> 
                  {obj.propertyName}(s)
                </Box>
                }
              >
                {obj.items?.map((subItem) => (
                  <TreeItem
                    onClick={() => handleRowClick(subItem)}

                    key={`grid-object-sub-${obj.propertyName}-${subItem.id}`}
                    itemId={`grid-object-sub-${obj.propertyName}-${subItem.id}`}
                    label={
                      <Box display="flex" alignItems="center" >
                        {subItem.objectID === 0 ? (
                          <FileExtIcon
                            guid={selectedVault.guid}
                            objectId={subItem.id}
                            classId={subItem.classId !== undefined ? subItem.classId : subItem.classID}
                          />
                        ) : (
                          <i
                            className="fas fa-folder mx-1"
                            style={{ fontSize: "12px", color: "#2757aa" }}
                          ></i>
                        )}
                        {subItem.title}
                        {subItem.objectID === 0 && (
                          <FileExtText
                            guid={selectedVault.guid}
                            objectId={subItem.id}
                            classId={subItem.classID}
                          />
                        )}
                      </Box>
                    }
                  />
                ))}
              </TreeItem>
            ))}

          {/* Render Documents */}
          {documents.length > 0 && (
            <TreeItem
              sx={
                {
                  marginLeft: '10px',
                  backgroundColor: '#fff',

                  "&:hover": {
                    backgroundColor: "#fff !important", // Maintain white background on hover
                  },
                  "& .MuiTreeItem-content:hover": {
                    backgroundColor: "#fff !important", // Remove hover effect from the content area
                  },
                  "& .MuiTreeItem-content.Mui-selected": {
                    backgroundColor: "#fff !important", // Keep white after selection
                  },
                  "& .MuiTreeItem-content.Mui-selected:hover": {
                    backgroundColor: "#fff !important", // Keep white even when selected and hovered
                  },
                  borderRadius: "0px !important", // Remove border radius
                  "& .MuiTreeItem-content": {
                    borderRadius: "0px !important", // Remove border radius from content area
                  },

                }
              }
              key="grid-document"
              itemId="grid-document"
              label={
                <Box display="flex" alignItems="center" sx={{   backgroundColor: '#fff',
                  // backgroundColor: '#e5e5e5',
                  padding: '3px',
                  borderBottom: '1px solid #dedddd', padding: '3px' }}>
                  <i style={{ color: '#2757aa' }} class="fa-solid fa-copy mx-2"></i> Document(s)
                </Box>}
            >
              {documents.map((doc) =>
                doc.items?.map((subItem,index) => (
                  <TreeItem

                    onClick={() => handleRowClick(subItem)}
                    key={`grid-document-sub-${index}-${subItem.id}`}
                    itemId={`grid-document-sub-${index}-${subItem.id}`}
                    label={
                      <Box display="flex" alignItems="center">
                        {subItem.objectID === 0 ? (


                          <FileExtIcon
                            fontSize={'12px'}
                            guid={selectedVault.guid}
                            objectId={subItem.id}
                            classId={subItem.classId !== undefined ? subItem.classId : subItem.classID}
                          />
                        ) : (
                          <i
                            className="fas fa-layer-group mx-1"
                            style={{ fontSize: "12px", color: "#fff" }}
                          ></i>
                        )}
                        <span style={{marginLeft:'8px'}}>{subItem.title}</span>
                        {subItem.objectID === 0 && (
                          <FileExtText
                            guid={selectedVault.guid}
                            objectId={subItem.id}
                            classId={subItem.classID}
                          />
                        )}
                      </Box>
                    }
                  />
                ))
              )}
            </TreeItem>
          )}
        </>
      ) : (
        <TreeItem
          sx={{
        
            backgroundColor: '#fff',
            // backgroundColor: '#e5e5e5',
            padding: '3px',
            borderBottom: '1px solid #2757aa',
             fontSize: "10px", // Apply directly to TreeItem
            "& .MuiTreeItem-label": { fontSize: "10px !important" }, // Force label font size
            "& .MuiTypography-root": { fontSize: "10px !important" }, // Ensure all text respects this
          }}
          itemId="no-relationships"
          label="No Relationships Found"
        />
      
  
      )}
    </>
  );
};

export default LinkedObjectsTree;
