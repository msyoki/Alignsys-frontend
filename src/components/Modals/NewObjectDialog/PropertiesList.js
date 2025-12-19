import React from 'react';
import { List, ListItem, Box, Typography } from '@mui/material';
import FormField from './FormField';
import FileExtIcon from '../../FileExtIcon';
import FileExtText from '../../FileExtText';

const PropertiesList = ({
    properties,
    formValues,
    formErrors,
    selectedClassName,
    selectedTemplate,
    selectedVault,
    templateIsTrue,
    onInputChange,
    mfilesId,
    handleClassSelection,
    fetchItemData,
    setAddingValueListItem
}) => (
    <List sx={{ p: 0 }}>
        {templateIsTrue && (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
     
                }}
            >
                <Typography
                    className="my-2"
                    variant="body2"
                    sx={{
                        color: 'black',
                        flexBasis: '35%',
                        fontSize: '13px',
                        textAlign: 'end',
                    }}
                >
                    FROM TEMPLATE:
                </Typography>
                <Box className="my-2" sx={{ flexBasis: '65%', fontSize: '13px', textAlign: 'start', ml: 1, color: '#555b6e' }}>
                    <span className='mx-2'>
                        <FileExtIcon
                            fontSize={'20px'}
                            guid={selectedVault?.guid}
                            objectId={selectedTemplate.id}
                            classId={selectedTemplate.classID}
                            version={selectedTemplate.versionId ?? null}
                        />
                    </span>
                    {selectedTemplate?.title}
                    <FileExtText
                        guid={selectedVault?.guid}
                        objectId={selectedTemplate.id}
                        classId={selectedTemplate.classID}
                        version={selectedTemplate.versionId ?? null}
                    />
                </Box>
            </Box>
        )}

        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              
            }}
        >
            <Typography
                className="my-2"
                variant="body2"
                sx={{
                    color: 'black',
                    flexBasis: '35%',
                    fontSize: '13px',
                    textAlign: 'end'
                }}
            >
                Class :
            </Typography>
            <Box className="my-2" sx={{ flexBasis: '65%', fontSize: '13px', textAlign: 'start', ml: 1, color: '#555b6e' }}>
                {selectedClassName}
            </Box>
        </Box>

        {properties.map((prop) => (
            <ListItem key={prop.propId} sx={{ p: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginY: '2px'
                    }}
                >
                    <Typography
                        className="my-2"
                        variant="body2"
                        sx={{
                            color: 'black',
                            flexBasis: '35%',
                            fontSize: '13px',
                            textAlign: 'end'
                        }}
                    >
                        {prop.title} {prop.isRequired && <span className="text-danger"> *</span>} :
                    </Typography>

                    <Box sx={{ width: '65%', fontSize: '13px', color: '#555b6e', textAlign: 'start', ml: 1 }}>
                        <FormField
                            prop={prop}
                            value={formValues[prop.propId]}
                            onChange={onInputChange}
                            error={formErrors[prop.propId]}
                            selectedVault={selectedVault}
                            mfilesId={mfilesId}
                            handleClassSelection={handleClassSelection}
                            fetchItemData={fetchItemData}
                            setAddingValueListItem={setAddingValueListItem}
                        />
                    </Box>
                </Box>
            </ListItem>
        ))}
    </List>
);

export default PropertiesList;