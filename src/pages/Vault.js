import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import logo from '../images/ZFBLU.webp';
import Authcontext from '../components/Auth/Authprovider';
import * as constants from '../components/Auth/configs';
import axios from 'axios';

const VaultSelectForm = () => {
    const { authTokens, user } = useContext(Authcontext);
    const [selectedVault, setSelectedVault] = useState({});
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
                console.log(error);
            }
        };

        fetchUserVaults();
    }, [authTokens.access]);

    const handleVaultChange = (event) => {
        const value = event.target.value;
        const selectedObj = vaults.find(vault => vault.guid === value);
        setSelectedVault(selectedObj);
        localStorage.setItem('selectedVault', JSON.stringify(selectedObj));
        navigate('/');
    };

    return (
        <div style={{ backgroundColor: '#fff' }}>
        <Container
          maxWidth="sm"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
          className='p-2'
        >
          <Box
            className='shadow-lg bg-white text-dark'
            component="form"
            sx={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid white',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            {/* <p className="text-dark text-center" style={{ fontSize: '13px' }}>
              TECHEDGE AFRICA
            </p> */}
            <img className="my-3" src={logo} alt="Logo" width='350px' />
            <p className="text-dark text-center" style={{ fontSize: '12px' }}>
              Welcome back <span style={{ color: '#1C4690' }}>{user.first_name} {user.last_name}</span>, please select a vault below
            </p>
            <FormControl fullWidth className='my-3'>
              <InputLabel className='text-dark' id="vault-select-label">Select Vault</InputLabel>
              <Select
                labelId="vault-select-label"
                value={selectedVault.guid || ''}
                label="Please Select Vault"
                onChange={handleVaultChange}
                size='medium'
              >
                {vaults.map((vault) => (
                  <MenuItem key={vault.guid} value={vault.guid}>
                    {vault.name}
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
