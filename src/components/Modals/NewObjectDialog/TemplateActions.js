import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import FileExtIcon from '../../FileExtIcon';
import FileExtText from '../../FileExtText';import { THEME_COLORS } from '../../../constants/themeColors';


const TemplateActions = ({
    templateIsTrue,
    templates,
    selectedVault,
    onUseTemplate,
    onDontUseTemplates
}) => {
    if (templateIsTrue) {
        return (
            <a
                href="#"
                style={{
                    color: THEME_COLORS.primary,
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                }}
                onClick={(e) => {
                    e.preventDefault();
                    onDontUseTemplates();
                }}
                onMouseEnter={(e) => e.target.style.color = '#4a7bc8'}
                onMouseLeave={(e) => e.target.style.color = '#2757aa'}
            >
                <i className="fa-solid fa-upload mx-2"></i>
                Upload File Without Template / Change Template
            </a>
        );
    }

    return (
        <List
            className="p-0"
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center'
            }}
        >
            {templates && templates.length > 0 ? (
                templates.map((item) => (
                    <ListItem
                        button
                        key={item.id}
                        onClick={() => onUseTemplate(item)}
                        className="rounded-md transition hover:scale-105"
                        sx={{
                            width: 'auto',
                            minWidth: 'fit-content',
                            p: 1,
                            m: 0,
                            border: '1px solid #dee2e6',
                            '&:hover': {
                                backgroundColor: '#f8f9fa'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: "auto", marginRight: "6px" }}>
                            <span className='mx-2'>
                                <FileExtIcon
                                    fontSize={'20px'}
                                    guid={selectedVault?.guid}
                                    objectId={item.id}
                                    classId={item.classID}
                                    version={item.versionId ?? null}
                                />
                            </span>
                        </ListItemIcon>
                        <ListItemText
                            sx={{ '& .MuiTypography-root': { fontSize: '12px', whiteSpace: 'nowrap' } }}
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
                ))
            ) : (
                <p className="text-center my-2" style={{ color: THEME_COLORS.primary }}>
                    No templates available
                </p>
            )}
        </List>
    );
};

export default TemplateActions;