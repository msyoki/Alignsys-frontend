import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './components/Auth/Authprovider';
import PrivateRoute from './components/Auth/Privateroute';
import { registerLicense } from '@syncfusion/ej2-base';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VaultSelectForm from './pages/Vault';



function App() {
  registerLicense('Mgo+DSMBPh8sVXJ0S0J+XE9HflRDX3xKf0x/TGpQb19xflBPallYVBYiSV9jS31TckVnWHlbcXFWT2NbVA==');
  return (
    <Router>
      <AuthProvider>
      <div className="App bg-dark text-white">
        <Routes>
          <Route path="/"  exact={true} element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          <Route path="/vault" element={<PrivateRoute><VaultSelectForm/></PrivateRoute>}></Route>
          <Route path="/admin"  exact={true} element={<PrivateRoute><AdminDashboard/></PrivateRoute>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
