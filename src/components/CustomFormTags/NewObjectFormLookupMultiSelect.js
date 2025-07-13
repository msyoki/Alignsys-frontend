import React, { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import * as constants from '../Auth/configs';

const LookupMultiSelect = ({
  userId,
  propId,
  label,
  onChange,
  value = [],
  required,
  error,
  helperText,
  selectedVault,
  disabled,
}) => {
  const [options, setOptions] = useState([]);
  const [defaultOptions, setDefaultOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef();

  // Map value prop to selectedOptions for react-select
  const selectedOptions = options.concat(defaultOptions)
    .filter((option, idx, arr) =>
      value.includes(option.value) &&
      arr.findIndex(o => o.value === option.value) === idx
    )
    .map(option => ({ value: option.value, label: option.label }));

  // Fetch initial/default options
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/ValuelistInstance/${selectedVault.guid}/${propId}/${userId}`
        );
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        setDefaultOptions(formattedOptions);
        // Merge with selected values to ensure all are present
        const combined = [
          ...formattedOptions,
          ...value
            .filter(val => !formattedOptions.some(opt => opt.value === val))
            .map(val => {
              // Try to find label from previous options or fallback to value
              const prev = options.find(opt => opt.value === val);
              return prev || { value: val, label: String(val) };
            }),
        ];
        setOptions(combined);
      } catch  {
        // console.error('Error fetching lookup options:', error);
      }
      setLoading(false);
    };
    fetchOptions();
    // eslint-disable-next-line
  }, [propId, selectedVault, userId]);

  // Fetch options based on search term (debounced)
  useEffect(() => {
    if (inputValue.trim() === '') {
      // Reset to default options + selected
      const combined = [
        ...defaultOptions,
        ...value
          .filter(val => !defaultOptions.some(opt => opt.value === val))
          .map(val => {
            const prev = options.find(opt => opt.value === val);
            return prev || { value: val, label: String(val) };
          }),
      ];
      setOptions(combined);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${constants.mfiles_api}/api/ValuelistInstance/Search/${selectedVault.guid}/${inputValue}/${propId}/${userId}`
        );
        const formattedOptions = response.data.map(option => ({
          label: option.name,
          value: option.id,
        }));
        // Merge search results with selected values (avoid duplicates)
        const combined = [
          ...formattedOptions,
          ...value
            .filter(val => !formattedOptions.some(opt => opt.value === val))
            .map(val => {
              const prev = options.find(opt => opt.value === val);
              return prev || { value: val, label: String(val) };
            }),
        ];
        setOptions(combined);
      } catch  {
        // console.error('Error fetching lookup options based on search term:', error);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
    // eslint-disable-next-line
  }, [inputValue, defaultOptions, value, propId, selectedVault, userId]);

  const handleChange = (selected) => {
    onChange(propId, selected ? selected.map(option => option.value) : []);
    setInputValue(''); // Clear search after selection
  };

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({
      ...base,
      borderColor: error ? 'red' : base.borderColor,
      fontSize: '13px',
      color: '#555',
      backgroundColor: disabled ? '#f5f5f5' : 'white',
      minHeight: '40px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#555',
      fontSize: '13px',
    }),
    option: (base, state) => ({
      ...base,
      color: '#555',
      fontSize: '13px',
      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#555',
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
    <div style={{ position: 'relative' }}>
      <Select
        isMulti
        value={selectedOptions}
        onChange={handleChange}
        options={options}
        placeholder={loading ? `Loading ${label}...` : `Select ${label}`}
        inputValue={inputValue}
        onInputChange={(val, { action }) => {
          if (action === 'input-change') setInputValue(val);
          if (action === 'menu-close') setInputValue('');
        }}
        noOptionsMessage={() => loading ? `Loading ${label}...` : `No ${label} found`}
        styles={customStyles}
        required={required}
        disabled={disabled}
        menuPortalTarget={document.body}
        menuPosition="absolute"
      />
      {loading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <CircularProgress size={20} />
        </div>
      )}
      {helperText && (
        <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '13px' }} className='mx-3'>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default LookupMultiSelect;