import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as constants from './Auth/configs';

const LookupMultiSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault }) => {
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
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown is always on top
    control: (provided) => ({
      ...provided,
      borderColor: error ? 'red' : provided.borderColor, // Handles error state
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
      {helperText && <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12px' }} className='mx-3'>{helperText}</span>}
    </div>
  );
};

export default LookupMultiSelect;
