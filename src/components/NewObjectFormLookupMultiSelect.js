import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';

const LookupMultiSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault }) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`http://192.236.194.251:240/api/ValuelistInstance/${selectedVault.guid}/${propId}`);
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
        const response = await axios.get(`http://192.236.194.251:240/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}`);
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
    onChange(propId, selectedOptions.map(option => option.value));
  };

  const customStyles = {
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'white', // Ensure the dropdown background is not see-through
      zIndex: 9999, // Ensure the dropdown appears above other elements
    }),
    control: (provided) => ({
      ...provided,
      borderColor: error ? 'red' : provided.borderColor, // Handling error state
    }),
  };

  return (
    <div>
      <label ><small>{`${label}`}</small></label>
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
      />
      {helperText && <span style={{ color: error ? '#CC3333' : 'inherit',fontSize:'12px' }} className='mx-3'>{helperText}</span>}
    </div>
  );
};

export default LookupMultiSelect;
