import React, { useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Grid
} from '@mui/material';
import logo from '../../../images/ZFWHITE.png';

const ClassSelectionDialog = ({
    open,
    onClose,
    selectedObjectName,
    selectedObjectId,
    isLoading,
    groupedItems,
    ungroupedItems,
    onClassSelect,
    searchQuery,
    onSearchChange
}) => {
    const filterItems = useCallback((items) => {
        return items.filter((member) =>
            member.className.toLowerCase().includes(searchQuery) &&
            member.userPermission?.attachObjectsPermission
        );
    }, [searchQuery]);

    return (
        <Dialog open={open} fullWidth maxWidth="sm">
            <DialogTitle
                className="p-2 d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#2757aa", color: "#fff", fontSize: "14px" }}
            >
                <img src={logo} alt="Loading" width="130px" className="mx-3" />
                <span className="flex items-center mx-3">
                    {selectedObjectId === 0 ? (
                        <i
                            style={{ color: "#fff", fontSize: "20px" }}
                            className="fa-solid fa-file-circle-plus mx-1"
                        ></i>
                    ) : (
                        <i
                            style={{ color: "#fff", fontSize: "20px" }}
                            className="fas fa-folder-plus mx-1"
                        ></i>
                    )}{" "}
                    Select {selectedObjectName} Class
                </span>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <p className="mt-2" style={{ fontSize: "13px" }}>
                            Please select / search from classes below
                        </p>

                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                                sx: { fontSize: "13px", color: "#555b6e" },
                            }}
                            InputProps={{
                                sx: { fontSize: "13px", color: "#555b6e" },
                            }}
                            placeholder="Search class..."
                            value={searchQuery}
                            onChange={onSearchChange}
                            sx={{ mb: 2 }}
                        />
                        <div style={{ maxHeight: "250px", overflowY: "auto", overflowX: "hidden" }}>
                            {isLoading ? (
                                <div className="flex justify-center items-center w-full">
                                    <CircularProgress size={24} />
                                </div>
                            ) : (
                                <List className="p-0">
                                    {groupedItems.map((group) => {
                                        const filteredMembers = filterItems(group.members);
                                        return (
                                            filteredMembers.length > 0 && (
                                                <div key={group.classGroupId}>
                                                    <ListItem
                                                        className="p-0 my-3"
                                                        style={{ backgroundColor: "#ecf4fc" }}
                                                    >
                                                        <ListItemText
                                                            primary={group.classGroupName}
                                                            className="p-1 mx-2"
                                                            sx={{
                                                                "& .MuiTypography-root": { fontSize: "13px" },
                                                                color: "#555",
                                                            }}
                                                        />
                                                    </ListItem>
                                                    <List component="div" disablePadding className="ml-4">
                                                        {filteredMembers.map((member) => (
                                                            <ListItem
                                                                key={member.classId}
                                                                onClick={() =>
                                                                    onClassSelect(
                                                                        member.classId,
                                                                        member.className,
                                                                        selectedObjectId
                                                                    )
                                                                }
                                                                className="p-0 mx-2 transition hover:bg-gray-100 rounded-lg"
                                                                button
                                                                disablePadding
                                                            >
                                                                <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                                                                    <i
                                                                        className={`fas ${selectedObjectId === 0
                                                                            ? "fa-file-circle-plus"
                                                                            : "fa-folder-plus"
                                                                            }`}
                                                                        style={{
                                                                            color: "#2a68af",
                                                                            fontSize: "20px",
                                                                        }}
                                                                    />
                                                                </ListItemIcon>
                                                                <ListItemText
                                                                    sx={{
                                                                        "& .MuiTypography-root": { fontSize: "13px" },
                                                                    }}
                                                                    primary={member.className}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </div>
                                            )
                                        );
                                    })}

                                    {ungroupedItems.length > 0 &&
                                        filterItems(ungroupedItems).length > 0 && (
                                            <>
                                                <ListItem
                                                    className="p-0 my-3"
                                                    style={{ backgroundColor: "#ecf4fc" }}
                                                >
                                                    <ListItemText
                                                        sx={{
                                                            "& .MuiTypography-root": { fontSize: "13px" },
                                                            color: "#555b6e",
                                                        }}
                                                        primary="Ungrouped"
                                                        className="p-1 mx-2"
                                                    />
                                                </ListItem>
                                                <List component="div" disablePadding className="ml-4">
                                                    {filterItems(ungroupedItems).map((member) => (
                                                        <ListItem
                                                            key={member.classId}
                                                            onClick={() =>
                                                                onClassSelect(
                                                                    member.classId,
                                                                    member.className,
                                                                    selectedObjectId
                                                                )
                                                            }
                                                            className="p-0 mx-2 transition hover:bg-gray-100 rounded-lg"
                                                            button
                                                            disablePadding
                                                        >
                                                            <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
                                                                <i
                                                                    className={`fas ${selectedObjectId === 0
                                                                        ? "fa-file-circle-plus"
                                                                        : "fa-folder-plus"
                                                                        }`}
                                                                    style={{
                                                                        color: "#2a68af",
                                                                        fontSize: "20px",
                                                                    }}
                                                                />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                sx={{
                                                                    "& .MuiTypography-root": { fontSize: "13px" },
                                                                }}
                                                                primary={member.className}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </>
                                        )}
                                </List>
                            )}
                        </div>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    sx={{ textTransform: "none" }}
                    className="mx-4 rounded-pill"
                    color="warning"
                    size="medium"
                    variant="contained"
                    onClick={onClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClassSelectionDialog;