import React from 'react'
import { createContext, useState, useEffect } from 'react'
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Loading from '../Loaders/Loader';
import axios from "axios"
import * as constants from '../Constants'
const Authcontext = createContext()

export default Authcontext;

export const AuthProvider = ({ children }) => {

    let [authTokens, setAuthtokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null)
    let [user, setUser] = useState(() => localStorage.getItem('authTokens') ? jwt_decode(localStorage.getItem('authTokens')) : null)
    let [loading, setLoading] = useState(true)
    let navigate = useNavigate()
    let [vaults,setVaults]=useState(['Vault 1', 'Vault 2', 'Vault 3', 'Vault 4'])
    let [selectedVault, setSelectedVault] = useState(() => localStorage.getItem('selectedVault') ? localStorage.getItem('selectedVault') : null);

    let [openalert, setOpenAlert] = useState(false)
    let [alertseverity, setAlertSeverity] = useState('')
    let [alertmsg, setAlertMsg] = useState('')


    // login request
    let loginUser = async (e) => {
        e.preventDefault()
        try {
            
            const response = await axios.post(`${constants.apiurl}/api/token/`, {
                email: e.target.email.value,
                password: e.target.password.value
            });

            if (response.status === 200) {
                const data = response.data;
                setAuthtokens(data);
                setUser(jwt_decode(data.access))
                localStorage.setItem('authTokens', JSON.stringify(data))
                navigate('/vault', { state: { openalert: true, alertmsg: "logged in successfully", alertseverity: "success" } })

                // if (jwt_decode(response.data.access).is_superuser === 'True') {

                //     navigate('/super/admin/dashboard', { state: { openalert: true, alertmsg: "logged in successfully", alertseverity: "success" } })

                // }
                // else {
                //     navigate('/', { state: { openalert: true, alertmsg: "logged in successfully", alertseverity: "success" } })
                // }
            }
        }
        catch (error) {
            alert("login failed")

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
        setSelectedVault(null)
        localStorage.removeItem('selectedVault')
        localStorage.removeItem('authTokens')
    }

    let loggedInVault=(event)=>{
       
        const vault = event.target.value;
        setSelectedVault(vault);
        localStorage.setItem('selectedVault', vault); // Store the selected vault in local storage
        navigate('/');
      
    }

    // Update token

    

    let updateToken = async () => {
        try {
            // Get refresh token directly from local storage
            const storedTokens = localStorage.getItem('authTokens');
            const refresh = storedTokens ? JSON.parse(storedTokens).refresh : null;
    
            console.log(`${refresh}`);
    
            const response = await axios.post(`${constants.apiurl}/api/token/refresh/`, {
                refresh: refresh
            });
    
            const data = response.data;
    
            if (response.status === 200) {
                setAuthtokens(data);
                setUser(jwt_decode(data.access));
                let new_auth_token = { "access": data.access, "refresh": refresh };
                localStorage.setItem('authTokens', JSON.stringify(new_auth_token));
            }
        } catch (error) {
            logoutUser();
        }
    
        if (loading) {
            setLoading(false);
        }
    }
    

    let authenticateGuest = async (rtoken) => {
        let response = await fetch(`${constants.apiurl}/api/token/refresh/`, {
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
            localStorage.setItem('authTokens', JSON.stringify(data))
            alert("user authenticated")
        } else {
            // console.log(response)
            logoutUser()
        }

        if (loading) {
            setLoading(false)
        }

    }

    let contextData = {
        loggedInVault:loggedInVault,
        selectedVault:selectedVault,
        user: user,
        updateToken: updateToken,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
        authenticateGuest: authenticateGuest,
        alertmsg: alertmsg,
        alertseverity: alertseverity,
        openalert: openalert,
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
