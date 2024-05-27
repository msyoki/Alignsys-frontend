import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import logo from '../images/ZF.png';
import Authcontext from '../components/Auth/Authprovider';


const VaultSelectForm = () => {

    let { loggedInVault, selectedVault } = useContext(Authcontext)
    const handleVaultChange = (event) => {
        loggedInVault(event)
    };

    const vaults = ['Vault 1', 'Vault 2', 'Vault 3', 'Vault 4'];

    return (
        <Container
            maxWidth="sm"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}
        >
            <Box
                className='shadow-lg bg-white text-dark'
                component="form"
                sx={{
                    width: 300,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid grey',
                    borderRadius: '8px',
                    padding: '16px'
                }}
            >
                <img className="my-3" src={logo} alt="Loading" width='60px' />
                <p className="text-dark" style={{ fontSize: '13px' }}> The Smart way to work.</p>
                <FormControl fullWidth >
                    <InputLabel className='text-dark' id="vault-select-label">Select Vault</InputLabel>
                    <Select
                        labelId="vault-select-label"
                        value={selectedVault}
                        label="Please Select Vault"
                        onChange={handleVaultChange}
                        size='medium'
                    >
                        {vaults.map((vault) => (
                            <MenuItem key={vault} value={vault}>
                                {vault}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </Box>
        </Container>
    );
};

export default VaultSelectForm;
