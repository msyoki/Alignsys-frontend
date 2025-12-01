import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const MetadataClassChange = ({ value, onChange }) => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchClasses = async () => {
    if (fetched) return; // don't refetch every time the dropdown opens

    try {
      setLoading(true);

      const res = await axios.get(
        "https://api.alignsys.tech/api/MfilesObjects/GetObjectClasses/%7BAA54622A-CBF9-4C79-BE93-9C7E155DEA52%7D/0/17"
      );

      setClassData(res.data);
      setFetched(true);
    } catch (error) {
      console.error("Error fetching class list:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <FormControl fullWidth size="small">
        <InputLabel>Select Class</InputLabel>

        <Select
          label="Select Class"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onOpen={fetchClasses} // 👈 fetch only when user opens dropdown
        >
          {/* Loading spinner */}
          {loading && (
            <MenuItem disabled>
              <CircularProgress size={18} sx={{ mr: 1 }} />
              Loading...
            </MenuItem>
          )}

          {/* Grouped options */}
          {!loading &&
            classData?.grouped?.map((group) => (
              <React.Fragment key={group.classGroupId}>
                <ListSubheader>{group.classGroupName}</ListSubheader>
                {group.members.map((item) => (
                  <MenuItem key={item.classId} value={item.classId}>
                    {item.className}
                  </MenuItem>
                ))}
              </React.Fragment>
            ))}

          {/* Ungrouped */}
          {!loading && classData?.unGrouped?.length > 0 && (
            <>
              <ListSubheader>Other</ListSubheader>
              {classData.unGrouped.map((item) => (
                <MenuItem key={item.classId} value={item.classId}>
                  {item.className}
                </MenuItem>
              ))}
            </>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default MetadataClassChange;
