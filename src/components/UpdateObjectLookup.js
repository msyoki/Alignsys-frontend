import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as constants from './Auth/configs';

const LookupSelect = ({
  propId,
  label,
  onChange,
  value,
  required,
  error,
  helperText,
  selectedVault,
  itemValue,
  disabled,
  mfilesid
}) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // Set initial selected option from itemValue on mount
  useEffect(() => {
    if (Array.isArray(itemValue) && itemValue.length > 0) {
      setSelectedOption({ value: itemValue[0].id, label: itemValue[0].title });
    } else {
      setSelectedOption(null);
    }
  }, [itemValue]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}/${mfilesid}/`
        );

        const formattedOptions = response.data.map((option) => ({
          label: option.name,
          value: option.id
        }));

        // Add selectedOption if missing
        if (selectedOption && !formattedOptions.find((opt) => opt.value === selectedOption.value)) {
          formattedOptions.push(selectedOption);
        }

        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching lookup options:', error);
      }
    };

    fetchOptions();
  }, [propId, selectedVault, mfilesid, selectedOption]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') return;

      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}/${mfilesid}/`
        );

        const formattedSearchOptions = response.data.map((option) => ({
          label: option.name,
          value: option.id
        }));

        const merged = [
          ...formattedSearchOptions,
          ...options.filter((opt) => !formattedSearchOptions.some((s) => s.value === opt.value))
        ];

        setOptions(merged);
      } catch (error) {
        console.error('Error searching lookup options:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleChange = (selected) => {
    setSelectedOption(selected);
    onChange(propId, selected ? selected.value : null);
  };

const customStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (base) => ({
    ...base,
    borderColor: error ? 'red' : base.borderColor,
    fontSize: '13px',
    color: 'black',
    backgroundColor: disabled ? '#f5f5f5' : 'white',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'black',
    fontSize: '13px',
  }),
  option: (base, state) => ({
    ...base,
    color: 'black',
    fontSize: '13px',
    backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'black',
    fontSize: '13px',
  }),
  multiValue: (base) => ({
    ...base,
    fontSize: '13px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: '13px',
  }),
  input: (base) => ({
    ...base,
    fontSize: '13px',
  }),
};


  return (
    <div>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder={`Select ${label}`}
        onInputChange={setSearchTerm}
        noOptionsMessage={() => `No ${label} found`}
        styles={customStyles}
        required={required}
        className="my-2"
        disabled={disabled}
        menuPortalTarget={document.body}
        menuPosition="absolute"
      />
      {helperText && <div style={{ color: 'red' }}>{helperText}</div>}
    </div>
  );
};

export default LookupSelect;
