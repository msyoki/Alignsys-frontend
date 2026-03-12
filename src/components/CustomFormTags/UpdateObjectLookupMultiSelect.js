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
  item
}) => {
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Set selectedOptions from itemValue on mount or change
  useEffect(() => {
    if (itemValue && Array.isArray(itemValue)) {
      console.log(item)
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
        console.log(`${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}/${mfilesid}/`)
        console.log(propId)
        console.log(response.data)

        setOptions(formattedOptions);
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
  }, [mfilesid, options, propId, searchTerm, selectedVault.guid]);

  const handleChange = (selected) => {
    setSelectedOptions(selected || []);
    const selectedValues = selected ? selected.map((opt) => opt.value) : [];
    onChange(propId, selectedValues);
  };

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    // Allow the control to grow vertically when multiple values are selected
    control: (base) => ({
      ...base,
      minHeight: '36px',
      borderColor: error ? 'red' : base.borderColor,
      fontSize: '12.8px',
      color: 'black',
      backgroundColor: disabled ? '#f5f5f5' : 'white',
      padding: '2px 6px',
    }),
    valueContainer: (base) => ({
      ...base,
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      alignItems: 'center',
      padding: '0 2px',
    }),
    option: (base, state) => ({
      ...base,
      color: 'black',
      fontSize: '12.8px',
      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'black',
      fontSize: '12.8px',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '12.8px',
      color: 'black',
    }),
    multiValue: (base) => ({
      ...base,
      fontSize: '12.8px',
      margin: '2px 4px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: '12.8px',
      padding: '2px 6px',
    }),
    input: (base) => ({
      ...base,
      fontSize: '12.8px',
      margin: 0,
      padding: 0,
    }),
  };


  return (
    <div style={{ marginTop: '6px', marginBottom: '6px' }}>
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
        disabled={disabled}
        menuPortalTarget={document.body}
        menuPosition="absolute"
      />
      {helperText && <div style={{ color: 'red' }}>{helperText}</div>}
    </div>
  );
};

export default LookupMultiSelect;
