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
  // Guard: AI classification (and any other source) may pass a plain string or
  // number instead of an array. Normalise once here so every .filter / .includes
  // call below is always operating on an array.
  const safeValue = Array.isArray(value)
    ? value
    : value !== null && value !== undefined && value !== ''
      ? String(value).split(',').map(v => v.trim()).filter(Boolean)
      : [];

  const [options, setOptions] = useState([]);
  const [defaultOptions, setDefaultOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef();

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
        ...safeValue
          .filter(val => !formattedOptions.some(opt => String(opt.value) === String(val)))
          .map(val => {
            const prev = options.find(opt => String(opt.value) === String(val));
            return prev || { value: val, label: String(val) };
          }),
      ];
      setOptions(combined);
    } catch {
      // console.error('Error fetching lookup options:', error);
    }
    setLoading(false);
  };

  // Map value prop to selectedOptions for react-select
  // Use String() comparison to handle numeric IDs vs string values from AI
  const selectedOptions = options.concat(defaultOptions)
    .filter((option, idx, arr) =>
      safeValue.some(v => String(v) === String(option.value)) &&
      arr.findIndex(o => o.value === option.value) === idx
    )
    .map(option => ({ value: option.value, label: option.label }));

  // Fetch initial/default options
  useEffect(() => {
    fetchOptions();
    // eslint-disable-next-line
  }, [propId, selectedVault, userId]);

  // Fetch options based on search term (debounced)
  useEffect(() => {
    if (inputValue.trim() === '') {
      // Reset to default options + selected
      const combined = [
        ...defaultOptions,
        ...safeValue
          .filter(val => !defaultOptions.some(opt => String(opt.value) === String(val)))
          .map(val => {
            const prev = options.find(opt => String(opt.value) === String(val));
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
          ...safeValue
            .filter(val => !formattedOptions.some(opt => String(opt.value) === String(val)))
            .map(val => {
              const prev = options.find(opt => String(opt.value) === String(val));
              return prev || { value: val, label: String(val) };
            }),
        ];
        setOptions(combined);
      } catch {
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
    multiValue: (base) => ({
      ...base,
      fontSize: '12.8px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: '12.8px',
    }),
    input: (base) => ({
      ...base,
      fontSize: '12.8px',
    }),
  };

  return (
    <div style={{ position: 'relative' }}>
      <Select
        isMulti
        value={selectedOptions}
        options={options}
        onChange={handleChange}
        openMenuOnClick={true}  // let the menu open normally
        onMenuOpen={() => fetchOptions()} // fetch options only when menu opens
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
        <span style={{ color: error ? '#CC3333' : 'inherit', fontSize: '12.8px' }} className='mx-3'>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default LookupMultiSelect;