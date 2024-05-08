import { Route, Navigate  } from 'react-router-dom'

import React from 'react'
import { useContext } from 'react';
import Authcontext from './Authprovider';


const PrivateRoute = ({ children }) => {
  let {user}= useContext(Authcontext)
    return !user? <Navigate to="/login" /> : children;
  };
export default PrivateRoute