import React from 'react'
import { createContext, useState, useEffect } from 'react'
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Loading from '../Loaders/Loader';
import axios from "axios"
import * as constants from './configs'
const Authcontext = createContext()

export default Authcontext;

export const AuthProvider = ({ children }) => {

    let [authTokens, setAuthtokens] = useState(() => sessionStorage.getItem('authTokens') ? JSON.parse(sessionStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(() => sessionStorage.getItem('authTokens') ? jwt_decode(sessionStorage.getItem('authTokens')) : null)
    let [loading, setLoading] = useState(true)
    let navigate = useNavigate()
  

    let [openAlert, setOpenAlert] = useState(false)
    let [alertSeverity, setAlertSeverity] = useState('')
    let [alertMsg, setAlertMsg] = useState('')


    // login request
    let loginUser = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(`${constants.auth_api}/api/token/`, {
                username: e.target.email.value,
                password: e.target.password.value
            });

            if (response.status === 200) {
                const data = response.data;
                
                setAuthtokens(data);
                setUser(jwt_decode(data.access))
                sessionStorage.setItem('authTokens', JSON.stringify(data))
                navigate('/vault')

                // if (jwt_decode(response.data.access).is_superuser === 'True') {

                //     navigate('/super/admin/dashboard', { state: { openalert: true, alertmsg: "logged in successfully", alertseverity: "success" } })

                // }
                // else {
                //     navigate('/', { state: { openalert: true, alertmsg: "logged in successfully", alertseverity: "success" } })
                // }
            }
        }
        catch (error) {

            setOpenAlert(true);
            setAlertSeverity("error");
            setAlertMsg(`Login failed, ivalid username or password!!`);
            console.log(`${error}`)
            // alert("login failed")

        }
    }


    // logout user
    let logoutUser = () => {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://ipapi.co/json',
            headers: {}
        };
        setAuthtokens(null)
        setUser(null)
        sessionStorage.removeItem('selectedVault')
        sessionStorage.removeItem('authTokens')
    }



    // Update token

    

    let updateToken = async () => {
        try {
            // Get refresh token directly from local storage
            const storedTokens = sessionStorage.getItem('authTokens');
            const refresh = storedTokens ? JSON.parse(storedTokens).refresh : null;
    
          
    
            const response = await axios.post(`${constants.auth_api}/api/token/refresh/`, {
                refresh: refresh
            });
    
            const data = response.data;
    
            if (response.status === 200) {
                setAuthtokens(data);
                setUser(jwt_decode(data.access));
                let new_auth_token = { "access": data.access, "refresh": refresh };
                sessionStorage.setItem('authTokens', JSON.stringify(new_auth_token));
            }
        } catch (error) {
            logoutUser();
        }
    
        if (loading) {
            setLoading(false);
        }
    }
    

    let authenticateGuest = async (rtoken) => {
        let response = await fetch(`${constants.auth_api}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'refresh': rtoken })
        })

        let data = await response.json()
        // console.log('data:', data)
        if (response.status === 200) {
            setAuthtokens(data)
            setUser(jwt_decode(data.access))
            // console.log(data.refresh)
            sessionStorage.setItem('authTokens', JSON.stringify(data))
           
        } else {
            // console.log(response)
            logoutUser()
        }

        if (loading) {
            setLoading(false)
        }

    }

    let contextData = {
        user: user,
        updateToken: updateToken,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        authenticateGuest: authenticateGuest,
        alertMsg: alertMsg,
        alertSeverity: alertSeverity,
        openAlert: openAlert,
        setOpenAlert: setOpenAlert,
        setAlertMsg: setAlertMsg,
        setAlertSeverity: setAlertSeverity

    }


    // Update token
    useEffect(() => {

        if (loading) {
            updateToken()
        }
        let threeMinutes = 1000 * 60 * 3
        let interval = setInterval(() => {
            if (authTokens) {
                updateToken()
            }
        }, threeMinutes)
        return () => clearInterval(interval)
    }, [authTokens, loading])
    return (

        <Authcontext.Provider value={contextData}>
            {loading ? <Loading /> : children}
        </Authcontext.Provider>

    )
}
