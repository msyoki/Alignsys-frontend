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
    ListItemText,
    Box,
    Typography,
} from '@mui/material';
import logo from '../../../images/ZFWHITE.png';
import { THEME_COLORS } from '../../../constants/themeColors';

const TemplateSelectionDialog = ({
    open,
    onClose,
    selectedClassName,
    selectedObjectId,
    templates,
    onUseTemplate,
    onDontUseTemplates,
}) => (
    <Dialog
        open={open}
        fullWidth
        maxWidth="xs"
        PaperProps={{
            sx: {
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
            },
        }}
    >
        <DialogTitle
            className="p-2 d-flex justify-content-between align-items-center"
            style={{
                backgroundColor: THEME_COLORS.primary,
                color: '#fff',
                fontSize: '14px',
                flexShrink: 0,
            }}
        >
            <img src={logo} alt="Logo" width="100px" className="mx-3" />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="mx-3">
                <i className="fa-solid fa-copy" />
                {selectedClassName} Templates
            </span>
        </DialogTitle>

        <DialogContent
            sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                minHeight: 0,
                px: 2,
                pt: '12px !important',
                pb: 1,
            }}
        >
            <Typography sx={{ fontSize: '13px', mb: 1.5, flexShrink: 0 }}>
                Please select a template
            </Typography>

            {/* Scrollable list */}
            <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                <List disablePadding>
                    {templates?.length > 0 ? (
                        templates.map((item) => (
                            <ListItem
                                button
                                key={item.id}
                                onClick={() => onUseTemplate(item)}
                                sx={{
                                    px: 1,
                                    py: 0.75,
                                    borderRadius: '4px',
                                    '&:hover': { backgroundColor: '#f0f4f8' },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                                    <i
                                        style={{ color: '#2a68af', fontSize: '18px' }}
                                        className={`fas ${selectedObjectId === 0 ? 'fa-file-circle-plus' : 'fa-folder-plus'}`}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.title}
                                    sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', color: THEME_COLORS.primary, fontSize: '13px', mt: 2 }}>
                            No templates available
                        </Typography>
                    )}
                </List>
            </Box>
        </DialogContent>

        <DialogActions sx={{ flexShrink: 0, gap: 1, px: 2, pb: 1.5, borderTop: '1px solid #e0e0e0' }}>
            <Button
                sx={{
                    textTransform: 'none',
                    backgroundColor: '#FFD54F',
                    color: '#000',
                    borderRadius: '20px',
                    '&:hover': { backgroundColor: '#FFCA28' },
                }}
                size="medium"
                variant="contained"
                onClick={onClose}
            >
                Close
            </Button>
            <Button
                sx={{ textTransform: 'none', fontSize: '12px', borderRadius: '20px' }}
                color="primary"
                size="medium"
                variant="contained"
                onClick={onDontUseTemplates}
                startIcon={<i className="fa-solid fa-upload" />}
            >
                Upload Without Template / Switch
            </Button>
        </DialogActions>
    </Dialog>
);

export default TemplateSelectionDialog;