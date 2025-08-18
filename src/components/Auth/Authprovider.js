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
  const [miniLoader, setMiniLoader] = useState(false);

  const navigate = useNavigate();

  // Login
 // Enhanced error handling function (add this to your component or utils)
const extractErrorMessage = (error) => {
  // Handle different error response structures from Django REST Framework
  
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle validation errors with 'detail' field (most common for our custom messages)
    if (data.detail) {
      return data.detail;
    }
    
    // Handle non-field errors
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
      return data.non_field_errors[0]; // Return first error message
    }
    
    // Handle field-specific errors (username, password, etc.)
    if (data.username && Array.isArray(data.username)) {
      return `Username: ${data.username[0]}`;
    }
    
    if (data.password && Array.isArray(data.password)) {
      return `Password: ${data.password[0]}`;
    }
    
    if (data.email && Array.isArray(data.email)) {
      return `Email: ${data.email[0]}`;
    }
    
    // Handle generic error field
    if (data.error) {
      return data.error;
    }
    
    // Handle message field
    if (data.message) {
      return data.message;
    }
    
    // If data is a string, return it directly
    if (typeof data === 'string') {
      return data;
    }
    
    // Try to extract first available error message from any field
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && value.length > 0) {
        return `${key}: ${value[0]}`;
      }
      if (typeof value === 'string') {
        return value;
      }
    }
  }
  
  // Fallback to axios error message
  if (error.message) {
    return error.message;
  }
  
  // Default fallback
  return "Login failed due to an unknown error.";
};

// Enhanced error handler with user-friendly messages
const handleAuthError = (error) => {
  const status = error.response?.status;
  let userMessage = extractErrorMessage(error);
  
  // Enhance messages based on status codes for better user experience
  if (status === 401) {
    // Keep our custom backend messages as they are more specific and helpful
    // Only enhance if the message is too generic
    if (userMessage === "Invalid credentials" || userMessage === "Unauthorized") {
      userMessage = "Invalid email/username or password. Please check your credentials and try again.";
    }
  } else if (status === 403) {
    if (!userMessage.includes("deactivated") && !userMessage.includes("inactive")) {
      userMessage = "Access denied. Please contact your administrator.";
    }
  } else if (status === 503) {
    userMessage = "Authentication service is temporarily unavailable. Please try again later.";
  } else if (status >= 500) {
    userMessage = "Server error occurred. Please try again or contact support.";
  } else if (!error.response) {
    userMessage = "Network error. Please check your internet connection and try again.";
  }
  
  return userMessage;
};

// Your enhanced loginUser function
const loginUser = async (e) => {
  e.preventDefault();
  setMiniLoader(true)
  
  try {
    const emailOrUsername = e.target.email.value;
    const password = e.target.password.value;

    const isEmailAuth = constants.auth_type_email === 'true';

    const payload = isEmailAuth
      ? { username: emailOrUsername, password , auth_type : "email"}
      : { username: emailOrUsername, password, auth_type: "username" };

    const response = await axios.post(`${constants.auth_api}/api/token/`, payload);
    const { data, status } = response;

    if (status === 200) {
      setMiniLoader(false)
  
      setAuthTokens(data);
      setUser(jwt_decode(data.access));
      sessionStorage.setItem('authTokens', JSON.stringify(data));
      navigate('/vault');
    }

  } catch (error) {
    // Use enhanced error handling
    setMiniLoader(false)
  
    const errorMessage = handleAuthError(error);
    
    setAlertSeverity("error");
    setAlertMsg(errorMessage);
    setOpenAlert(true);
    
    // Enhanced logging for debugging
    console.error("Login error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage,
      fullError: error
    });
    
    // Optional: Handle specific error scenarios
    const status = error.response?.status;
    if (status === 401) {
      console.log("Authentication failed - check credentials");
    } else if (status === 403) {
      console.log("Account access forbidden - possibly deactivated");
    } else if (status === 503) {
      console.log("Service temporarily unavailable");
    } else if (status >= 500) {
      console.log("Server error occurred");
    } else if (!error.response) {
      console.log("Network error occurred");
    }
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
    miniLoader,
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