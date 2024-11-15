import React, { useState, useContext, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Authcontext from '../components/Auth/Authprovider';
import axios from 'axios';
import * as constants from './Auth/configs'


const VaultSelectForm = () => {
    let { authTokens } = useContext(Authcontext);
    const [vaults, setVaults] = useState([]);
    const [selectedVault, setSelectedVault] = useState(null);

    const handleVaultChange = (event) => {
        const value = event.target.value;
        const selectedObj = vaults.find(vault => vault.guid === value);
        setSelectedVault(selectedObj);
        localStorage.setItem('selectedVault', JSON.stringify(selectedObj));
        window.location.reload();
    };

    const getUserVaults = () => {
        let config = {
            method: 'get',
            url: `${constants.auth_api}/api/user/vaults/`,
            headers: {
                'Authorization': `Bearer ${authTokens.access}`,
                'Content-Type': 'application/json'
            }
        };

        axios.request(config)
            .then((response) => {
                setVaults(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    };



    useEffect(() => {
        const savedOption = localStorage.getItem('selectedVault');
        if (savedOption) {
            setSelectedVault(JSON.parse(savedOption));
        }
        getUserVaults();
    }, []);

    return (
        <FormControl style={{width:'100%'}} >
            <InputLabel id="vault-select-label" ><span className='text-white'>Vault</span></InputLabel>
            <Select
                labelId="vault-select-label"
                value={selectedVault ? selectedVault.guid : ''}
                label="Please Select Vault"
                onChange={handleVaultChange}
                size='small'
                autoWidth
                className='text-white'
               
            
            >
                {vaults.map((vault, index) => (
                    <MenuItem key={index} value={vault.guid} className='text-dark'>
                        {vault.name}
                    </MenuItem>
                ))}
            </Select>

        </FormControl>
    );
};

export default VaultSelectForm;
