import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as constants from './Auth/configs';

const LookupSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault, itemValue, disabled }) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialValue, setInitialValue] = useState(null);  // Change to handle single value

  // Fetch options and set initial value
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));

        // Split itemValue into an array of trimmed strings if itemValue is not empty or undefined
        const initialValuesArray = itemValue ? itemValue.split(';').map(value => value.trim()) : [];

        // Find the initial value option
        const initialOption = formattedOptions.find(option => initialValuesArray.includes(option.label));

        // Set initial value and options
        setOptions(formattedOptions);
        setInitialValue(initialOption || null);

      } catch (error) {
        console.error("Error fetching lookup options:", error);
      }
    };

    fetchOptions();
  }, [propId, selectedVault, itemValue]);

  // Fetch search results based on the search term
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') return;
      try {
        const response = await axios.get(`${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}`);
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));

        // Update options with the new search results, excluding the initial value
        setOptions(formattedOptions.filter(option => option.value !== initialValue?.value));
      } catch (error) {
        console.error('Error fetching lookup options based on search term:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm, selectedVault, propId, initialValue]);

  const handleChange = (selectedOption) => {
    // Get the selected value from the `Select` component
    const selectedValue = selectedOption ? selectedOption.value : null;
    // Call the `onChange` callback with the selected value
    onChange(propId, selectedValue);
    // Update the `initialValue` state with the new selected value
    setInitialValue(selectedOption);
  };

  // Get the filtered options excluding the already selected initial value
  const filteredOptions = options.filter(option => option.value !== initialValue?.value);

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
  
      <Select
        value={initialValue}
        onChange={handleChange}
        options={filteredOptions}
        placeholder={itemValue ? itemValue : `Please Select ${label} ...`}
        onInputChange={setSearchTerm}
        noOptionsMessage={() => `No ${label} found`}
        styles={customStyles}
        required={required}
        className='my-2'
        disabled={disabled}
      />
      {helperText && <div style={{ color: 'red' }}>{helperText}</div>}
    </div>
  );
};

export default LookupSelect;
