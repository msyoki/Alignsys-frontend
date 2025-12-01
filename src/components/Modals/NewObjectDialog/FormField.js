import React from 'react';
import { TextField, Select, MenuItem, Typography, Box } from '@mui/material';
import LookupSelect from '../../CustomFormTags/NewObjectFormLookup';
import LookupMultiSelect from '../../CustomFormTags/NewObjectFormLookupMultiSelect';
import AddValuelistItem from './../AddValueList';

const FormField = ({
    prop,
    value,
    onChange,
    error,
    selectedVault,
    mfilesId,
    handleClassSelection,
    fetchItemData,
    setAddingValueListItem
}) => {
    if (prop.isAutomatic || !prop.userPermission.editPermission) {
        return (
            <Typography
                className='my-2'
                variant="body2"
                sx={{ fontSize: '13px' }}
            >
                ( Automatic )
            </Typography>
        );
    }

    const handleChange = (newValue) => onChange(prop.propId, newValue);

    switch (prop.propertytype) {
        case 'MFDatatypeText':
        case 'MFDatatypeFloating':
        case 'MFDatatypeInteger':
            if (prop.isHidden) return null;
            return (
                <TextField
                    value={prop.value || value}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    size="small"
                    className="my-1 bg-white"
                    disabled={!!prop.value}
                    InputProps={{ style: { fontSize: '13px' } }}
                    InputLabelProps={{ style: { fontSize: '13px' } }}
                />
            );

        case 'MFDatatypeMultiLineText':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <TextField
                    label={prop.title}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    multiline
                    rows={4}
                    size="small"
                    className="my-1 bg-white"
                    InputProps={{ style: { fontSize: '13px' } }}
                    InputLabelProps={{ style: { fontSize: '13px' } }}
                />
            );

        case 'MFDatatypeLookup':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <Box display="flex" alignItems="center" className="my-1" sx={{ width: '100%' }}>
                    <Box sx={{ flex: `0 0 ${prop.allowAdding ? '90%' : '100%'}` }}>
                        <LookupSelect
                            userId={parseInt(mfilesId, 10)}
                            propId={prop.propId}
                            label={prop.title}
                            onChange={onChange}
                            value={value}
                            required={prop.isRequired}
                            error={!!error}
                            helperText={error}
                            selectedVault={selectedVault}
                            size="small"
                            fullWidth
                        />
                    </Box>
                    {prop.allowAdding && (
                        <AddValuelistItem
                            vaultGuid={selectedVault?.guid}
                            userID={parseInt(mfilesId, 10)}
                            valuelistID={prop.typeID}
                            onSuccess={(newItem) => {
                                // Component will refresh automatically
                            }}
                            item={prop}
                            handleClassSelection={handleClassSelection}
                            fetchItemData={fetchItemData}
                            setAddingValueListItem={setAddingValueListItem}
                        />
                    )}
                </Box>
            );

        case 'MFDatatypeMultiSelectLookup':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <Box display="flex" alignItems="center" className="my-1" sx={{ width: '100%' }}>
                    <Box sx={{ flex: `0 0 ${prop.allowAdding ? '90%' : '100%'}` }}>
                        <LookupMultiSelect
                            userId={parseInt(mfilesId, 10)}
                            propId={prop.propId}
                            label={prop.title}
                            onChange={onChange}
                            value={value || []}
                            required={prop.isRequired}
                            error={!!error}
                            helperText={error}
                            selectedVault={selectedVault}
                            size="small"
                            className="my-1"
                            fullWidth
                        />
                    </Box>
                    {prop.allowAdding && (
                        <AddValuelistItem
                            vaultGuid={selectedVault?.guid}
                            userID={parseInt(mfilesId, 10)}
                            valuelistID={prop.typeID}
                            onSuccess={(newItem) => {
                                // Component will refresh automatically
                            }}
                            item={prop}
                            handleClassSelection={handleClassSelection}
                            fetchItemData={fetchItemData}
                            setAddingValueListItem={setAddingValueListItem}
                        />
                    )}
                </Box>
            );

        case 'MFDatatypeBoolean':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <Select
                    size="small"
                    value={value ?? (prop.value === "Yes" ? true : prop.value === "No" ? false : '')}
                    onChange={(e) => handleChange(e.target.value)}
                    displayEmpty
                    fullWidth
                    className='bg-white'
                    sx={{
                        backgroundColor: 'white',
                        marginY: '8px',
                        fontSize: '13px',
                        '& .MuiSelect-select': {
                            fontSize: '13px',
                            color: '#555b6e',
                            paddingTop: '6px',
                            paddingBottom: '6px',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                            minHeight: 'unset',
                        },
                        '& .MuiInputBase-root': {
                            minHeight: '32px',
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '6px 10px',
                            fontSize: '13px',
                        },
                        '& .MuiMenuItem-root': {
                            fontSize: '13px',
                            color: '#555b6e',
                        },
                    }}
                >
                    <MenuItem sx={{ fontSize: '13px', color: '#555b6e' }} value=""><em>None</em></MenuItem>
                    <MenuItem sx={{ fontSize: '13px', color: '#555b6e' }} value={true}>True</MenuItem>
                    <MenuItem sx={{ fontSize: '13px', color: '#555b6e' }} value={false}>False</MenuItem>
                </Select>
            );

        case 'MFDatatypeTimestamp':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <input
                    style={{ color: '#555b6e', fontSize: '13px' }}
                    type="datetime-local"
                    className="form-control bg-white"
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                />
            );

        case 'MFDatatypeDate':
            if (prop.isHidden) return null;
            return prop.value ? (
                <p className="p-1 my-1">{prop.value}</p>
            ) : (
                <TextField
                    type="date"
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    InputLabelProps={{
                        shrink: true,
                        sx: { fontSize: '13px', color: '#555b6e' }
                    }}
                    InputProps={{
                        sx: { fontSize: '13px', color: '#555b6e' }
                    }}
                    size="small"
                    className="my-1 bg-white"
                />
            );

        default:
            return null;
    }
};

export default FormField;