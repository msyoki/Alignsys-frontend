import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './components/Auth/Authprovider';
import PrivateRoute from './components/Auth/Privateroute';
import { registerLicense } from '@syncfusion/ej2-base';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VaultSelectForm from './pages/Vault';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import PasswordResetRequest from './pages/PasswordResetRequest';

import * as constants from './components/Auth/configs'
import NetworkSnackbarAlert from './components/NetworkSnackbarAlert';
import SuperAdminDashboard from './pages/AdminSuperDashboard';
import { ThemeProvider } from './context/ThemeContext';
import injectThemeVariables from './utils/themeInjector';
import createAppTheme from './config/muiTheme';
import './styles/theme-variables.css';
import './styles/muiThemeOverrides.css';

function App() {
  registerLicense(constants.syncfusion_key);
  const muiTheme = createAppTheme();

  // Inject theme variables on app startup
  useEffect(() => {
    injectThemeVariables();
  }, []);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <div className="App bg-dark text-white">
              <NetworkSnackbarAlert/>
              <Routes>
                <Route path="/"  exact={true} element={<PrivateRoute><Dashboard/></PrivateRoute>} />
                <Route path="/reset/:uid/:token" element={<PasswordResetConfirm/>}  />
                <Route path="/password-reset" element={<PasswordResetRequest/>}  />
                <Route path="/vault" element={<PrivateRoute><VaultSelectForm/></PrivateRoute>}></Route>
                <Route path="/admin"  exact={true} element={<PrivateRoute><AdminDashboard/></PrivateRoute>} />
                <Route path="/admin/super"  exact={true} element={<PrivateRoute><SuperAdminDashboard/></PrivateRoute>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/register" element={<Register/>} />
              </Routes>
            </div>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default App;
