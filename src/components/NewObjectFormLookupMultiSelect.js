import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // 👈 Import spinner
import * as constants from './Auth/configs';

const LookupMultiSelect = ({ userId, propId, label, onChange, value, required, error, helperText, selectedVault, disabled }) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false); // 👈 Add loading state

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}/${userId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching lookup options:", error);
      }
      setLoading(false); // End loading
    };

    fetchOptions();
  }, [propId, selectedVault, userId]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') return;
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}/${userId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options based on search term:', error);
      }
      setLoading(false); // End loading
    };

    fetchSearchResults();
  }, [searchTerm, selectedVault, propId, userId]);

  const handleChange = (selectedOptions) => {
    onChange(propId, selectedOptions ? selectedOptions.map(option => option.value) : []);
  };

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
        isMulti
        value={options.filter(option => value.includes(option.value))}
        onChange={handleChange}
        options={options}
        placeholder={loading ? `Loading ${label}...` : `Select ${label}`} // Dynamic placeholder
        onInputChange={setSearchTerm}
        noOptionsMessage={() => loading ? `Loading ${label}...` : `No ${label} found`}
        styles={customStyles}
        required={required}
        // isDisabled={disabled || loading} // Disable when loading
        menuPortalTarget={document.body}
        menuPosition="absolute"
      />
      {/* Spinner inside the select field */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
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

export default LookupMultiSelect;
