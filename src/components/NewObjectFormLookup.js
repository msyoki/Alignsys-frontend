import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import CircularProgress from '@mui/material/CircularProgress'; // 👈 Import Material UI spinner
import * as constants from './Auth/configs';

const LookupSelect = ({ userId, propId, label, onChange, value, required, error, helperText, selectedVault, disabled }) => {
  const [lookupOptions, setLookupOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // 👈 Add loading state

  useEffect(() => {
    const fetchLookupOptions = async () => {
      setLoading(true); // 👈 Start loading
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}/${userId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setLookupOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options:', error);
      }
      setLoading(false); // 👈 End loading
    };

    fetchLookupOptions();
  }, [propId, selectedVault, userId]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') return;
      setLoading(true); // 👈 Start loading
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}/${userId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setLookupOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options based on search term:', error);
      }
      setLoading(false); // 👈 End loading
    };

    fetchSearchResults();
  }, [searchTerm, selectedVault, propId, userId]);

  const handleChange = (selectedOption) => {
    onChange(propId, selectedOption ? selectedOption.value : null);
  };

  const handleInputChange = (newValue) => {
    setSearchTerm(newValue);
  };

  // Custom styles for react-select
  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base, state) => ({
      ...base,
      borderColor: error ? 'red' : base.borderColor,
      fontSize: '12.5px',
      color: '#555',
      backgroundColor: disabled ? '#f5f5f5' : 'white',
      minHeight: '40px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#555',
      fontSize: '12.5px',
    }),
    option: (base, state) => ({
      ...base,
      color: '#555',
      fontSize: '12.5px',
      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#555',
      fontSize: '12.5px',
    }),
  };

  return (
    <div style={{ position: 'relative' }}>
      <Select
        label={`Select ${label}`}
        value={lookupOptions.find(option => option.value === value) || null}
        onChange={handleChange}
        options={lookupOptions}
        isClearable
        placeholder={loading ? "Loading..." : `Select ${label}`} // 👈 Dynamic placeholder
        onInputChange={handleInputChange}
        noOptionsMessage={() => loading ? "Loading options..." : "No options found"}
        styles={customStyles}
        required={required}
        // isDisabled={disabled || loading} // 👈 Disable while loading
        menuPortalTarget={document.body}
        menuPosition="absolute"
      />
      {/* 👇 Show CircularProgress when loading */}
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          pointerEvents: 'none' 
        }}>
          <CircularProgress size={20} />
        </div>
      )}
      {helperText && (
        <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12.5px' }} className='mx-3'>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default LookupSelect;
