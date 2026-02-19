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
import { THEME_COLORS } from '../constants/themeColors';



const VaultSelectForm = () => {
  const { authTokens, user ,logoutUser} = useContext(Authcontext);
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
    // fetchOrganizations();
  }, [authTokens.access, user.is_superuser]);

  const handleVaultChange = (event) => {
    const value = event.target.value;
    setSelectedVaultGuid(value);

    const selectedObj = vaults.find(vault => vault.guid === value);
    if (selectedObj) {
      sessionStorage.setItem('selectedVault', JSON.stringify(selectedObj));
      console.log('Selected Vault:', selectedObj);
      navigate('/', { state: { openalert: true, alertMsg: "logged in successfully", alertSeverity: "success" } });
    }
  };


  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  return (
    <div style={{ backgroundColor: THEME_COLORS.primary }}>
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
          className="shadow-lg text-dark bg-white"
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
              backgroundColor: THEME_COLORS.primary,
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
                fontSize: '13px',
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
                  <i className="fa-solid fa-database me-2" style={{ color: THEME_COLORS.primary }}></i> {vault.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>



          {/* Admin Dashboard Button */}
          {user.is_admin === "True"&& (
            <Button
              variant="outlined"
              onClick={handleAdminDashboard}
              sx={{
                mt: 2,
                color: THEME_COLORS.primary,
                borderColor: THEME_COLORS.primary,
                fontSize: '13px',
                '&:hover': {
                  backgroundColor: THEME_COLORS.primary,
                  color: 'white',
                },
              }}
            >
              <i className="fa-solid fa-cog me-2"></i>
              Admin Dashboard
            </Button>
          )}
           <Button
              variant="outlined"
              onClick={logoutUser}
              sx={{
                mt: 2,
                color: THEME_COLORS.primary,
                borderColor: THEME_COLORS.primary,
                fontSize: '13px',
                '&:hover': {
                  backgroundColor: THEME_COLORS.primary,
                  color: 'white',
                },
              }}
            >
              <i className="fas fa-sign-out-alt mx-2" style={{ fontSize: "18px" }}></i>
              Log Out 
            </Button>
          
         {/* <AttachExistingVault authTokens={authTokens} user={user}/> */}
        </Box>
      </Container>


    </div>
  );
};

export default VaultSelectForm;