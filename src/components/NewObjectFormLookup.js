import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import axios from 'axios';

const LookupSelect = ({ propId, label, onChange, value, required, error, helperText }) => {
  const sampleData= [
    {
      "name": "Musyoki Mutua",
      "value": 1,
    },
    {
      "name": "Sam Kamau",
       "value": 5
    }
  ]
  const [lookupOptions, setLookupOptions] = useState(sampleData);

  useEffect(() => {
  
    const fetchLookupOptions = async () => {
      try {
        const response = await axios.get(`http://your-api-url/${propId}/lookup`);
        // setLookupOptions(response.data);
      } catch (error) {
        console.error('Error fetching lookup options:', error);
      }
    };

    fetchLookupOptions();
  }, [propId]);

  return (
    <FormControl fullWidth required={required} error={error} margin="normal">
      <InputLabel shrink>{label}</InputLabel>
      <Select value={value} onChange={(e) => onChange(propId, e.target.value)} size='small' label={label}>
        {lookupOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default LookupSelect;
