import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as constants from './Auth/configs';

const LookupMultiSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault, disabled }) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Error fetching lookup options:", error);
      }
    };

    fetchOptions();
  }, [propId, selectedVault]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') return;
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options based on search term:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm, selectedVault, propId]);

  const handleChange = (selectedOptions) => {
    onChange(propId, selectedOptions ? selectedOptions.map(option => option.value) : []);
  };
  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  
    control: (base, state) => ({
      ...base,
      borderColor: error ? 'red' : base.borderColor,
      fontSize: '12.5px',
      color: '#555',              // Text color in the control (selected)
      backgroundColor: disabled ? '#f5f5f5' : 'white',
    }),
  
    singleValue: (base) => ({
      ...base,
      color: '#555',              // Color of selected option text
      fontSize: '12.5px',
    }),
  
    option: (base, state) => ({
      ...base,
      color: '#555',              // Color of dropdown option text
      fontSize: '12.5px',
      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    }),
  
    placeholder: (base) => ({
      ...base,
      color: '#555',              // Placeholder color
      fontSize: '12.5px',
    }),
  };


  return (
    <div>
      <Select
        isMulti
        value={options.filter(option => value.includes(option.value))}
        onChange={handleChange}
        options={options}
        placeholder={`Select ${label}`}
        onInputChange={setSearchTerm}
        noOptionsMessage={() => `No ${label} found`}
        styles={customStyles}
        required={required}
        menuPortalTarget={document.body}  // Fix overflow issue
        menuPosition="absolute"  // Ensures dropdown is positioned correctly
      />
      {helperText && <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12.5px' }} className='mx-3'>{helperText}</span>}
    </div>
  );
};

export default LookupMultiSelect;
