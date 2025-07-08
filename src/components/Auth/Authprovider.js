import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Loading from '../Loaders/Loader';
import axios from "axios";
import * as constants from './configs';

const Authcontext = createContext();
export default Authcontext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const stored = sessionStorage.getItem('authTokens');
    return stored ? JSON.parse(stored) : null;
  });
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('authTokens');
    return stored ? jwt_decode(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const navigate = useNavigate();

  // Login
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const emailOrUsername = e.target.email.value;
      const password = e.target.password.value;

      const isEmailAuth = constants.auth_type_email === 'true';

      const payload = isEmailAuth
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password };

      const response = await axios.post(`${constants.auth_api}/api/token/`, payload);
      const { data, status } = response;

      if (status === 200) {
        setAuthTokens(data);
        setUser(jwt_decode(data.access));
        sessionStorage.setItem('authTokens', JSON.stringify(data));
        navigate('/vault');
      }

    } catch (error) {
      setOpenAlert(true);
      setAlertSeverity("error");
      setAlertMsg("Invalid username or password");
      console.log(`${error.response?.data?.error || error.message}!!`);
    }

  };

  // Logout
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    sessionStorage.clear();
  };

  // Token refresh
  const updateToken = async () => {
    try {
      const storedTokens = sessionStorage.getItem('authTokens');
      const refresh = storedTokens ? JSON.parse(storedTokens).refresh : null;
      const { data, status } = await axios.post(`${constants.auth_api}/api/token/refresh/`, { refresh });
      if (status === 200) {
        setAuthTokens(data);
        setUser(jwt_decode(data.access));
        sessionStorage.setItem('authTokens', JSON.stringify({ access: data.access, refresh }));
      }
    } catch {
      logoutUser();
    }
    if (loading) setLoading(false);
  };

  // Guest authentication
  const authenticateGuest = async (rtoken) => {
    try {
      const response = await fetch(`${constants.auth_api}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: rtoken })
      });
      const data = await response.json();
      if (response.status === 200) {
        setAuthTokens(data);
        setUser(jwt_decode(data.access));
        sessionStorage.setItem('authTokens', JSON.stringify(data));
      } else {
        logoutUser();
      }
    } catch {
      logoutUser();
    }
    if (loading) setLoading(false);
  };

  // Token auto-refresh
  useEffect(() => {
    if (loading) updateToken();
    const interval = setInterval(() => {
      if (authTokens) updateToken();
    }, 1000 * 60 * 3);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [authTokens, loading]);

  const contextData = {
    user,
    updateToken,
    authTokens,
    loginUser,
    logoutUser,
    authenticateGuest,
    alertMsg,
    alertSeverity,
    openAlert,
    setOpenAlert,
    setAlertMsg,
    setAlertSeverity
  };

  return (
    <Authcontext.Provider value={contextData}>
      {loading ? <Loading /> : children}
    </Authcontext.Provider>
  );
};