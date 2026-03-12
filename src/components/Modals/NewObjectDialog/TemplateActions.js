import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import FileExtIcon from '../../FileExtIcon';
import FileExtText from '../../FileExtText';
import { THEME_COLORS } from '../../../constants/themeColors';

const TemplateActions = ({
    templateIsTrue,
    templates,
    selectedVault,
    onUseTemplate,
    onDontUseTemplates,
}) => {
    if (templateIsTrue) {
        return (
            <Box
                component="a"
                href="#"
                onClick={(e) => { e.preventDefault(); onDontUseTemplates(); }}
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    color: THEME_COLORS.primary,
                    textDecoration: 'none',
                    fontSize: '13px',
                    '&:hover': { color: '#4a7bc8' },
                }}
            >
                <i className="fa-solid fa-upload" />
                Upload File Without Template / Change Template
            </Box>
        );
    }

    if (!templates?.length) {
        return (
            <Typography sx={{ fontSize: '13px', color: THEME_COLORS.primary }}>
                No templates available
            </Typography>
        );
    }

    return (
        <List
            disablePadding
            sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'flex-start',
                p: 0,
            }}
        >
            {templates.map((item) => (
                <ListItem
                    button
                    key={item.id}
                    onClick={() => onUseTemplate(item)}
                    sx={{
                        width: 'auto',
                        maxWidth: { xs: '100%', sm: '220px' },
                        p: 0.75,
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        transition: 'box-shadow 0.15s, border-color 0.15s',
                        '&:hover': {
                            backgroundColor: '#f8f9fa',
                            borderColor: THEME_COLORS.primary,
                            boxShadow: '0 1px 4px rgba(39,87,170,0.15)',
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 0.75 }}>
                        <FileExtIcon
                            fontSize="18px"
                            guid={selectedVault?.guid}
                            objectId={item.id}
                            classId={item.classID}
                            version={item.versionId ?? null}
                        />
                    </ListItemIcon>
                    <ListItemText
                        sx={{
                            m: 0,
                            '& .MuiTypography-root': {
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            },
                        }}
                        primary={
                            <>
                                {item.title}
                                <FileExtText
                                    guid={selectedVault?.guid}
                                    objectId={item.id}
                                    classId={item.classID}
                                    version={item.versionId ?? null}
                                />
                            </>
                        }
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default TemplateActions;