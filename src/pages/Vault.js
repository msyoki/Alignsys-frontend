import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import logo from '../images/ZF.png';
import Authcontext from '../components/Auth/Authprovider';

import axios from 'axios';

const VaultSelectForm = () => {
    let { authTokens } = useContext(Authcontext)
    let [selectedVault,setSelectedVault]=useState({})
    const navigate = useNavigate()
    const [vaults,setVaults] =useState([]);
    const handleVaultChange = (event) => {
        const value = event.target.value;
        const selectedObj = vaults.find(vault => vault.guid === value);
        setSelectedVault(selectedObj);
        localStorage.setItem('selectedVault', JSON.stringify(selectedObj));
        navigate('/');
    };
    
    let getUserVaults = () => {
        let config = {
            method: 'get',
            url: 'http://127.0.0.1:8000/api/user/vaults/',
            headers : {
                'Authorization': `Bearer ${authTokens.access}`,
                'Content-Type': 'application/json'
            }
        };
    
        axios.request(config)
            .then((response) => {
                setVaults(response.data)
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
    }
    



    useEffect(() => {
        getUserVaults()
    }, []);


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
                        value={selectedVault.guid}
                        label="Please Select Vault"
                        onChange={handleVaultChange}
                        size='medium'
                    >
                        {vaults.map((vault,index) => (
                            <MenuItem key={index} value={vault.guid}>
                                {vault.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

            </Box>
        </Container>
    );
};

export default VaultSelectForm;
