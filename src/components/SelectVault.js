import React, { useState, useContext, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem , Box} from '@mui/material';
import Authcontext from '../components/Auth/Authprovider';
import axios from 'axios';
import * as constants from './Auth/configs';

const VaultSelectForm = ({ onVaultChange }) => {
  const { authTokens } = useContext(Authcontext);
  const [vaults, setVaults] = useState([]);
  const [selectedVault, setSelectedVault] = useState(null);

  const handleVaultChange = (event) => {
    const value = event.target.value;
    const selectedObj = vaults.find(vault => vault.guid === value);
    setSelectedVault(selectedObj);

    const savedTokens = sessionStorage.getItem('authTokens');
    sessionStorage.clear();

    if (savedTokens) sessionStorage.setItem('authTokens', savedTokens);
    sessionStorage.setItem('selectedVault', JSON.stringify(selectedObj));

    if (onVaultChange) onVaultChange(selectedObj);

    window.location.reload();
  };

  const getUserVaults = () => {
    axios.get(`${constants.auth_api}/api/user/vaults/`, {
      headers: {
        Authorization: `Bearer ${authTokens.access}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => setVaults(response.data))
      .catch((error) => console.error('Error fetching vaults:', error));
  };

  useEffect(() => {
    const savedOption = sessionStorage.getItem('selectedVault');
    if (savedOption) setSelectedVault(JSON.parse(savedOption));
    getUserVaults();
  }, []);

  return (
    <FormControl
      size="small"
      className="mx-1 "
      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center'}}
    >


      <Select
        value={selectedVault?.guid || ''}
        onChange={handleVaultChange}
        size="small"
        displayEmpty
        className='rounded-pill'
        sx={{
          color: '#1C4690',
          fontSize: '12px',
          flexGrow: 1,
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 250,
              color: '#1C4690',
            },
          },
        }}
      >
        <MenuItem value="" disabled>
          <span  style={{ fontSize: '12px' }}>Switch selcted vault</span>
        </MenuItem>
        {vaults.map((vault) => (
          <MenuItem key={vault.guid} value={vault.guid}>
            <i className="fa-solid  fa-database me-2" style={{ color: '#1C4690' }}></i>
            <span className="text-dark" style={{ fontSize: '12px' }}>{vault.name}</span>
          </MenuItem>
        ))}
      </Select>
    </FormControl>

  );
};

export default VaultSelectForm;
