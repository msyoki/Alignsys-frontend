import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import * as constants from '../Auth/configs';

const LookupMultiSelect = ({
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
  mfilesid,
}) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Set selectedOptions from itemValue on mount or change
  useEffect(() => {
    if (itemValue && Array.isArray(itemValue)) {
      setSelectedOptions(
        itemValue.map((item) => ({
          value: item.id,
          label: item.title,
        }))
      );
    } else {
      setSelectedOptions([]);
    }
  }, [itemValue]);

  // Fetch initial options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}/${mfilesid}/`
        );

        const formattedOptions = response.data.map((option) => ({
          label: option.name,
          value: option.id,
        }));

        // Ensure selected values are included in the options
        const combined = [
          ...formattedOptions,
          ...selectedOptions.filter(
            (opt) => !formattedOptions.some((fo) => fo.value === opt.value)
          ),
        ];

        setOptions(combined);
      } catch  {
        // console.error('Error fetching lookup options:', error);
      }
    };

    fetchOptions();
  }, [propId, selectedVault, mfilesid, selectedOptions]);

  // Fetch options based on search term
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === '') return;

      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${searchTerm}/${propId}/${mfilesid}/`
        );

        const formattedOptions = response.data.map((option) => ({
          label: option.name,
          value: option.id,
        }));

        const combined = [
          ...options,
          ...formattedOptions.filter(
            (newOption) => !options.some((opt) => opt.value === newOption.value)
          ),
        ];

        setOptions(combined);
      } catch  {
        // console.error('Error fetching lookup options based on search term:', error);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const handleChange = (selected) => {
    setSelectedOptions(selected || []);
    const selectedValues = selected ? selected.map((opt) => opt.value) : [];
    onChange(propId, selectedValues);
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
    singleValue: (base) => ({
      ...base,
      fontSize: '13px',
      color: 'black',
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
        isMulti
        value={selectedOptions}
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

export default LookupMultiSelect;
