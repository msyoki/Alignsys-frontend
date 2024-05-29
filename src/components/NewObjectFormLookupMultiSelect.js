import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Checkbox, ListItemText, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import axios from 'axios';

const LookupMultiSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get(`http://192.236.194.251:240/api/ValuelistInstance/${selectedVault}/${propId}`);
                setOptions(response.data);
                console.log(response.data)
            } catch (error) {
                console.error("Error fetching lookup options:", error);
            }
        };
        
        fetchOptions();
    }, [propId, selectedVault]);

    const handleSelectChange = (event) => {
        onChange(propId, event.target.value);
    };

    return (
        <FormControl fullWidth margin="normal" size="small" error={error}>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={value}
                onChange={handleSelectChange}
                renderValue={(selected) => selected.map(val => options.find(opt => opt.id === val)?.name).join(', ')}
            >
                {options.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                        <Checkbox checked={value.indexOf(option.id) > -1} />
                        <ListItemText primary={option.name} />
                    </MenuItem>
                ))}
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default LookupMultiSelect;
