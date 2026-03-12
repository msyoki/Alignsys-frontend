import React from 'react';
import { TextField, Select, MenuItem, Typography, Box } from '@mui/material';
import LookupSelect from '../../CustomFormTags/NewObjectFormLookup';
import LookupMultiSelect from '../../CustomFormTags/NewObjectFormLookupMultiSelect';
import AddValuelistItem from './../AddValueList';

/* Shared MUI sx for all Select / TextField inputs */
const INPUT_SX = { fontSize: '13px', color: '#555b6e' };

const FormField = ({
    prop,
    value,
    onChange,
    error,
    selectedVault,
    mfilesId,
    handleClassSelection,
    fetchItemData,
    setAddingValueListItem,
    setOpenAlert,
    setAlertSeverity,
    setAlertMsg,
}) => {
    /* Read-only / automatic fields */
    if (prop.isAutomatic || !prop.userPermission.editPermission) {
        return (
            <Typography
                variant="body2"
                sx={{ fontSize: '13px', color: '#888', pl: '2px', pt: '8px', pb: '8px' }}
            >
                ( Automatic )
            </Typography>
        );
    }

    if (prop.isHidden) return null;

    const handleChange = (newValue) => onChange(prop.propId, newValue);

    /* ── If the prop already has a locked value just show it ── */
    const ReadOnly = ({ text }) => (
        <Typography sx={{ fontSize: '13px', color: '#555b6e', pt: '8px', pb: '4px', pl: '2px' }}>
            {text}
        </Typography>
    );

    switch (prop.propertytype) {

        /* ── Plain text / number ── */
        case 'MFDatatypeText':
        case 'MFDatatypeFloating':
        case 'MFDatatypeInteger':
            return (
                <TextField
                    value={prop.value || value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    size="small"
                    sx={{ mt: '2px', backgroundColor: 'white' }}
                    disabled={!!prop.value}
                    InputProps={{ sx: INPUT_SX }}
                    InputLabelProps={{ sx: INPUT_SX }}
                />
            );

        /* ── Multiline text ── */
        case 'MFDatatypeMultiLineText':
            if (prop.value) return <ReadOnly text={prop.value} />;
            return (
                <TextField
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    multiline
                    rows={4}
                    size="small"
                    sx={{ mt: '2px', backgroundColor: 'white' }}
                    InputProps={{ sx: INPUT_SX }}
                    InputLabelProps={{ sx: INPUT_SX }}
                />
            );

        /* ── Lookup (single) ── */
        case 'MFDatatypeLookup':
            if (prop.value) return <ReadOnly text={prop.value} />;
            return (
                <Box display="flex" alignItems="center" gap={0.5} sx={{ width: '100%', mt: '2px' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
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
                            onSuccess={() => {}}
                            item={prop}
                            handleClassSelection={handleClassSelection}
                            fetchItemData={fetchItemData}
                            setAddingValueListItem={setAddingValueListItem}
                            setOpenAlert={setOpenAlert}
                            setAlertSeverity={setAlertSeverity}
                            setAlertMsg={setAlertMsg}
                        />
                    )}
                </Box>
            );

        /* ── Lookup (multi) ── */
        case 'MFDatatypeMultiSelectLookup':
            if (prop.value) return <ReadOnly text={prop.value} />;
            return (
                <Box display="flex" alignItems="center" gap={0.5} sx={{ width: '100%', mt: '2px' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <LookupMultiSelect
                            userId={parseInt(mfilesId, 10)}
                            propId={prop.propId}
                            label={prop.title}
                            onChange={onChange}
                            value={Array.isArray(value) ? value : (value ? [value] : [])}
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
                            onSuccess={() => {}}
                            item={prop}
                            handleClassSelection={handleClassSelection}
                            fetchItemData={fetchItemData}
                            setAddingValueListItem={setAddingValueListItem}
                            setOpenAlert={setOpenAlert}
                            setAlertSeverity={setAlertSeverity}
                            setAlertMsg={setAlertMsg}
                        />
                    )}
                </Box>
            );

        /* ── Boolean ── */
        case 'MFDatatypeBoolean':
            if (prop.value) return <ReadOnly text={prop.value} />;
            return (
                <Select
                    size="small"
                    value={value ?? (prop.value === 'Yes' ? true : prop.value === 'No' ? false : '')}
                    onChange={(e) => handleChange(e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{
                        mt: '2px',
                        backgroundColor: 'white',
                        fontSize: '13px',
                        color: '#555b6e',
                        '& .MuiSelect-select': { fontSize: '13px', color: '#555b6e', py: '6px' },
                    }}
                >
                    <MenuItem sx={INPUT_SX} value=""><em>None</em></MenuItem>
                    <MenuItem sx={INPUT_SX} value={true}>True</MenuItem>
                    <MenuItem sx={INPUT_SX} value={false}>False</MenuItem>
                </Select>
            );

        /* ── Timestamp ── */
        case 'MFDatatypeTimestamp':
            if (prop.value) return <ReadOnly text={prop.value} />;
            return (
                <input
                    type="datetime-local"
                    className="form-control bg-white"
                    style={{ color: '#555b6e', fontSize: '13px', marginTop: '2px' }}
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                />
            );

        /* ── Date ── */
        case 'MFDatatypeDate':
            if (prop.value) return <ReadOnly text={prop.value} />;
            return (
                <TextField
                    type="date"
                    value={value || ''}
                    onChange={(e) => handleChange(e.target.value)}
                    fullWidth
                    required={prop.isRequired}
                    error={!!error}
                    helperText={error}
                    size="small"
                    sx={{ mt: '2px', backgroundColor: 'white' }}
                    InputLabelProps={{ shrink: true, sx: INPUT_SX }}
                    InputProps={{ sx: INPUT_SX }}
                />
            );

        default:
            return null;
    }
};

export default FormField;