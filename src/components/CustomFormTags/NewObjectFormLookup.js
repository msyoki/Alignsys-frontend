import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import CircularProgress from '@mui/material/CircularProgress';
import * as constants from '../Auth/configs';

const LookupSelect = ({
  userId,
  propId,
  label,
  onChange,
  value,
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
        setOptions(formattedOptions);
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
      setOptions(defaultOptions);
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
        // Always include the currently selected value in the options
        const selectedOption = options.find(opt => opt.value === value) ||
          defaultOptions.find(opt => opt.value === value);
        const combined = selectedOption && !formattedOptions.some(opt => opt.value === value)
          ? [selectedOption, ...formattedOptions]
          : formattedOptions;
        setOptions(combined);
      } catch  {
        // console.error('Error fetching lookup options based on search term:', error);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
    // eslint-disable-next-line
  }, [inputValue, defaultOptions, value, propId, selectedVault, userId]);

  const handleChange = (selectedOption) => {
    onChange(propId, selectedOption ? selectedOption.value : null);
    setInputValue(''); // Clear search after selection
  };

  const handleInputChange = (newValue, { action }) => {
    if (action === 'input-change') setInputValue(newValue);
    if (action === 'menu-close') setInputValue('');
  };

  // Custom styles for react-select
  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({
      ...base,
      borderColor: error ? 'red' : base.borderColor,
      fontSize: '12.8px',
      color: '#555',
      backgroundColor: disabled ? '#f5f5f5' : 'white',
      minHeight: '40px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#555',
      fontSize: '12.8px',
    }),
    option: (base, state) => ({
      ...base,
      color: '#555',
      fontSize: '12.8px',
      backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#555',
      fontSize: '12.8px',
    }),
    input: (base) => ({
      ...base,
      fontSize: '12.8px',
    }),
  };

  // Find the selected option from the current options
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div style={{ position: 'relative' }}>
      <Select
        label={`Select ${label}`}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isClearable
        placeholder={loading ? "Loading..." : `Select ${label}`}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        noOptionsMessage={() => loading ? "Loading options..." : "No options found"}
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
          pointerEvents: 'none'
        }}>
          <CircularProgress size={20} />
        </div>
      )}
      {helperText && (
        <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12.8px' }} className='mx-3'>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default LookupSelect;