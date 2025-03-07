import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import * as constants from './Auth/configs';

const LookupSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault }) => {
  const [lookupOptions, setLookupOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLookupOptions = async () => {
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setLookupOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options:', error);
      }
    };

    fetchLookupOptions();
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
        setLookupOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options based on search term:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm, selectedVault, propId]);

  const handleChange = (selectedOption) => {
    onChange(propId, selectedOption ? selectedOption.value : null);
  };

  const handleInputChange = (newValue) => {
    setSearchTerm(newValue);
  };

  // Custom styles for react-select
  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown stays above all elements
    control: (provided) => ({
      ...provided,
      borderColor: error ? 'red' : provided.borderColor,
    }),
  };

  return (
    <div>
      <Select
        label={`Select ${label}`}
        value={lookupOptions.find(option => option.value === value)}
        onChange={handleChange}
        options={lookupOptions}
        isClearable
        placeholder={`Select ${label}`}
        onInputChange={handleInputChange}
        noOptionsMessage={() => "No options found"}
        styles={customStyles}
        required={required}
        menuPortalTarget={document.body}  // Fix overflow issue
        menuPosition="absolute"  // Ensures dropdown renders correctly
      />
      {helperText && <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12px' }} className='mx-3'>{helperText}</span>}
    </div>
  );
};

export default LookupSelect;
