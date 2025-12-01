import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import logo from '../../../images/ZFWHITE.png';

const TemplateSelectionDialog = ({
    open,
    onClose,
    selectedClassName,
    selectedObjectId,
    templates,
    onUseTemplate,
    onDontUseTemplates
}) => (
    <Dialog open={open} fullWidth>
        <DialogTitle
            className="p-2 d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#2757aa", color: "#fff", fontSize: "14px" }}
        >
            <img src={logo} alt="Loading" width="130px" className="mx-3" />
            <span className="flex items-center mx-3 cursor-pointer">
                <i className="fa-solid fa-copy"></i>
                <span className="mx-1">{selectedClassName} Templates</span>
            </span>
        </DialogTitle>

        <DialogContent>
            <p className="my-4" style={{ fontSize: "13px" }}>
                Please select a template
            </p>

            <List className="p-0">
                {templates && templates.length > 0 ? (
                    templates.map((item) => (
                        <ListItem
                            button
                            key={item.id}
                            onClick={() => onUseTemplate(item)}
                            className="p-2 mx-2 rounded-md transition hover:scale-105"
                        >
                            <ListItemIcon sx={{ minWidth: "auto", marginRight: "4px" }}>
                                {selectedObjectId === 0 ? (
                                    <i style={{ color: "#2a68af", fontSize: "20px" }} className="fa-solid fa-file-circle-plus mx-1"></i>
                                ) : (
                                    <i style={{ color: "#2a68af", fontSize: "20px" }} className="fas fa-folder-plus mx-1"></i>
                                )}
                            </ListItemIcon>
                            <ListItemText sx={{ '& .MuiTypography-root': { fontSize: '13px' } }} primary={item.title} />
                        </ListItem>
                    ))
                ) : (
                    <p className="text-center my-2" style={{ color: "#2757aa" }}>
                        No templates available
                    </p>
                )}
            </List>
        </DialogContent>

        <DialogActions>
            <Button 
                sx={{ textTransform: 'none' }} 
                className='mx-2 rounded-pill' 
                color="warning" 
                size='medium' 
                variant="contained" 
                onClick={onClose}
            >
                Close
            </Button>
            <Button 
                sx={{ textTransform: 'none', fontSize: '12px' }} 
                className='mx-4 rounded-pill' 
                color="primary" 
                size='medium' 
                variant="contained" 
                onClick={onDontUseTemplates}
            >
                <i className="fa-solid fa-upload mx-2"></i> Upload File Without Template / Switch Template
            </Button>
        </DialogActions>
    </Dialog>
);

export default TemplateSelectionDialog;