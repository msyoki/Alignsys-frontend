import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import logo from '../images/ZFWHITE.png';
import Authcontext from '../components/Auth/Authprovider';
import * as constants from '../components/Auth/configs';
import axios from 'axios';
import AttachExistingVault from '../components/AttachExistingVault';

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
        console.log(JSON.stringify(response.data));
      } catch (error) {
        // console.log(error);
      }
    };



    fetchUserVaults();
    // fetchOrganizations();
  }, [authTokens.access, user.is_superuser]);

  const handleVaultChange = (event) => {
    const value = event.target.value;
    setSelectedVaultGuid(value);

    const selectedObj = vaults.find(vault => vault.guid === value);
    if (selectedObj) {
      sessionStorage.setItem('selectedVault', JSON.stringify(selectedObj));
      navigate('/', { state: { openalert: true, alertMsg: "logged in successfully", alertSeverity: "success" } });
    }
  };


  const handleAdminDashboard = () => {
    navigate('/admin');
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
          className="shadow-lg text-dark"
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
            component="form"
            className="shadow-lg "
            sx={{
              backgroundColor: '#2757aa',
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
                width: { xs: '180px', sm: '250px', md: '300px' },
              }}
            />
            <p className="text-white text-center" style={{ fontSize: '13px' }}>
              Welcome back{' '}
              <span style={{ color: '#fff' }}>
                {user.first_name} {user.last_name}
              </span>
            </p>
          </Box>

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
                <span style={{ fontSize: '14px' }}>Choose a Repository to Access</span>
              </MenuItem>
              {vaults.map((vault) => (
                <MenuItem
                  key={vault.guid}
                  value={vault.guid}
                  sx={{ fontSize: '14px' }}
                >
                  <i className="fa-solid fa-database me-2" style={{ color: '#2757aa' }}></i> {vault.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>


         <AttachExistingVault authTokens={authTokens} user={user}/>

          {/* Admin Dashboard Button */}
          {user.is_admin && (
            <Button
              variant="outlined"
              onClick={handleAdminDashboard}
              sx={{
                mt: 2,
                color: '#2757aa',
                borderColor: '#2757aa',
                fontSize: '12px',
                '&:hover': {
                  backgroundColor: '#2757aa',
                  color: 'white',
                },
              }}
            >
              <i className="fa-solid fa-cog me-2"></i>
              Admin Dashboard
            </Button>
          )}
        </Box>
      </Container>


    </div>
  );
};

export default VaultSelectForm;