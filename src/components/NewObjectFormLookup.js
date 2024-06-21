import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import * as constants from './Auth/configs'


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
    // If the selectedOption is null (when cleared), set value to null or empty
    if (!selectedOption) {
      onChange(propId, null);
    } else {
      // Otherwise, set the value to the selected option's value (ID)
      onChange(propId, selectedOption.value);
    }
  };

  const handleInputChange = (newValue) => {
    setSearchTerm(newValue);
  };

  // Custom styles for react-select
  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'white', // Ensuring the background is not see-through
      zIndex: 9999, // Ensure the dropdown appears above other elements
    }),
    control: (provided) => ({
      ...provided,
      borderColor: error ? 'red' : provided.borderColor, // Handling error state
    }),
  };

  return (
    <div>
      <label><small>{label}</small></label>
      <Select
        label={`Select ${label}`}
        value={lookupOptions.find(option => option.value === value)}
        onChange={handleChange}
        options={lookupOptions}
        isClearable={true}
        placeholder={`Select ${label}`}
        onInputChange={handleInputChange}
        noOptionsMessage={() => "No options found"}
        styles={customStyles}
        required={required}
      />
      {helperText && <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12px' }} className='mx-3'>{helperText}</span>}
    </div>
  );
};

export default LookupSelect;
