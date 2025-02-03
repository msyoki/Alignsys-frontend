import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as constants from './Auth/configs';

const LookupMultiSelect = ({ propId, label, onChange, value, required, error, helperText, selectedVault, itemValue,disabled }) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [initialValues, setInitialValues] = useState([]);

  // Fetch options and set initial values
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

        // Filter and map to get the matched values
        const matchedOptions = formattedOptions.filter(option => initialValuesArray.includes(option.label));
        const matchedValues = matchedOptions.map(option => option.value);

        // Set initial values and options (excluding already selected values)
        setOptions(formattedOptions);
        setInitialValues(matchedValues);

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

        // Update options with the new search results, excluding already selected values
        setOptions(formattedOptions.filter(option => !initialValues.includes(option.value)));
      } catch (error) {
        console.error('Error fetching lookup options based on search term:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm, selectedVault, propId, initialValues]);

  const handleChange = (selectedOptions) => {
    // Get the selected values from the `Select` component
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    // Call the `onChange` callback with the selected values
    onChange(propId, selectedValues);
    // Update the `initialValues` state with the new selected values
    setInitialValues(selectedValues);
  };

  // Get the filtered options excluding the already selected initial values
  const filteredOptions = options.filter(option => !initialValues.includes(option.value));

  // Convert `value` array to options format
  const selectedOptions = options.filter(option => value.includes(option.value));

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
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        options={filteredOptions}
        placeholder={itemValue?itemValue: `Please Select ${label} ...`}
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

export default LookupMultiSelect;
