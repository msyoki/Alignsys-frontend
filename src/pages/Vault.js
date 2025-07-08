import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import logo from '../images/ZFBLU.webp';
import Authcontext from '../components/Auth/Authprovider';
import * as constants from '../components/Auth/configs';
import axios from 'axios';

const VaultSelectForm = () => {
  const { authTokens, user } = useContext(Authcontext);
  const [selectedVaultGuid, setSelectedVaultGuid] = useState('');

  const [vaults, setVaults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserVaults = async () => {
      try {
        const response = await axios.get(`${constants.auth_api}/api/user/vaults/`, {
          headers: {
            'Authorization': `Bearer ${authTokens.access}`,
            'Content-Type': 'application/json'
          }
        });
        setVaults(response.data);
        // console.log(JSON.stringify(response.data));
      } catch (error) {
        // console.log(error);
      }
    };

    fetchUserVaults();
  }, [authTokens.access]);

  const handleVaultChange = (event) => {
    const value = event.target.value;
    setSelectedVaultGuid(value);

    const selectedObj = vaults.find(vault => vault.guid === value);
    if (selectedObj) {
      sessionStorage.setItem('selectedVault', JSON.stringify(selectedObj));
      navigate('/', { state: { openalert: true, alertMsg: "logged in successfully", alertSeverity: "success" } });
    }
  };



  return (
    <div style={{ backgroundColor: '#fff' }}>
      <Container
        maxWidth="sm"
        className="p-2"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Box
          component="form"
          className="shadow-lg bg-white text-dark"
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid white',
            borderRadius: 2,
            p: 2,
            fontSize: '13px',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              my: 2,
              maxWidth: '100%',
              width: { xs: '180px', sm: '250px', md: '300px' }, // Responsive sizes
            }}
          />

          <p className="text-dark text-center" style={{ fontSize: '13px' }}>
            Welcome back{' '}
            <span style={{ color: '#1C4690' }}>
              {user.first_name} {user.last_name}
            </span>
            , please select a vault below
          </p>

          <FormControl fullWidth className="my-3" sx={{ fontSize: '13px' }}>

            <Select
              value={selectedVaultGuid}
              onChange={handleVaultChange}
              displayEmpty
              size="medium"
              sx={{
                fontSize: '12px',
                '& .MuiSelect-select': {
                  fontSize: '14px',
                },
              }}
              inputProps={{ 'aria-label': 'Select Vault' }}
            >
              <MenuItem value="" disabled>
                <span style={{ fontSize: '14px' }}>Please select a vault</span>
              </MenuItem>
              {vaults.map((vault) => (
                <MenuItem
                  key={vault.guid}
                  value={vault.guid}
                  sx={{ fontSize: '14px' }}
                >
                  <i className="fa-solid  fa-database me-2" style={{ color: '#1C4690' }}></i> {vault.name}
                </MenuItem>
              ))}
            </Select>


          </FormControl>


        </Box>
      </Container>
    </div>



  );
};

export default VaultSelectForm;
