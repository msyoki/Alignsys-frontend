import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Authcontext from '../Auth/Authprovider';
import * as constants from '../Auth/configs'
import Box from '@mui/material/Box';


function OrganizationVaultList(props) {

  const [openVaults, setOpenVaults] = useState({});
  const [showFlatSublists, setShowFlatSublists] = useState({});
  const [showHierarchicalSublists, setShowHierarchicalSublists] = useState({});
  let { authTokens } = useContext(Authcontext);

  useEffect(() => {
    const getOrganizationVaults = () => {
      let config = {
        method: 'get',
        url: `${constants.auth_api}/api/organization-vaults/`,
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
          'Content-Type': 'application/json',
        },
      };

      axios.request(config)
        .then((response) => {
          props.setVaults(response.data);
          // console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
          console.log(error);
        });
    };

    getOrganizationVaults();
  }, [authTokens]);

  const toggleVaultSublist = (vault) => {
    props.setSelectedVault(vault)
    props.fetchUsersNotLinkedToVault(vault.guid)
    setOpenVaults(prevState => ({
      ...prevState,
      [vault.guid]: !prevState[vault.guid],
    }));

  };

  const toggleFlatSublist = (guid) => {
    setShowFlatSublists(prevState => ({
      ...prevState,
      [guid]: !prevState[guid],
    }));
  };

  const toggleHierarchicalSublist = (guid) => {
    setShowHierarchicalSublists(prevState => ({
      ...prevState,
      [guid]: !prevState[guid],
    }));
  };


  const sycVaultObjects = async (guid) => {

    let data = JSON.stringify({
      "guid": `${guid}`
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${constants.auth_api}/api/update-specific-vault-objects/`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
        props.viewvaultobjects();
        props.fetchVaultObjects(guid)
      })
      .catch((error) => {
        console.log(error);
      });

  }

  return (
    <>

      <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '30px' }} className='shadow-lg '>
        {props.vaults.map((vault) => (
          <li key={vault.guid} className='my-3'>
            <div
              onClick={() => toggleVaultSublist(vault)}
              className="p-2 text-center flex items-center cursor-pointer rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-105"
              style={{
                backgroundColor: '#2757aa',
                color: '#fff',
                gap: '12px', // Adds spacing between elements
              }}
            >
              {/* Left Content */}
              <div className="flex items-center gap-2">

                <div>
                  {/* Main Name */}
                  <i className="fas fa-hdd mx-2" style={{ fontSize: '2.0em' }}></i>
                  <span className="font-bold text-sm">{vault.name}</span>

                </div>
              </div>
            </div>


            {openVaults[vault.guid] && (
              <>


                <ul className='shadow-lg p-3 ml-4 rounded-lg transition-all duration-300 ease-in-out' style={{ listStyleType: 'none', padding: 0 }}>
                  <li onClick={() => toggleFlatSublist(vault.guid)} className='flex items-center cursor-pointer my-2 transition-all duration-300 ease-in-out transform hover:scale-105'>
                    <i className="fas fa-list mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i>
                    <span className='list-text'>Metadata Structure (Flat View)</span>
                  </li>

                  {showFlatSublists[vault.guid] && (
                    <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>
                      <li onClick={() => { props.viewvaultobjects(); props.fetchVaultObjects(vault.guid); }} className='flex items-center cursor-pointer my-2 transition-all duration-300 ease-in-out transform hover:scale-105'>
                        <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i>
                        <span className='list-text'>Object Types</span>
                      </li>
                      <li onClick={() => sycVaultObjects(vault.guid)} className='flex items-center cursor-pointer my-2 transition-all duration-300 ease-in-out transform hover:scale-105'>
                        <i className="fas fa-sync-alt mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i>
                        <span className='list-text'>Sync Vault Objects</span>
                      </li>
                    </ul>
                  )}

                  <li onClick={() => { props.setSelectedVault(vault); props.viewvaultusers(vault.guid); }} className='flex items-center cursor-pointer my-2 transition-all duration-300 ease-in-out transform hover:scale-105'>
                    <i className="fas fa-users mx-2" style={{ fontSize: '1.5em', color: '#2757aa' }}></i>
                    <span className='list-text'>Vault Users</span>
                  </li>
                  <li className='my-3'>
                   
                    <span  style={{ fontSize: '10px' }}>GUID:  {vault.guid}</span>
                  </li>
                  {/* <li onClick={() => { props.viewvaultgroups(); props.VaultUsergroups() }} className='flex items-center cursor-pointer my-2 transition-all duration-300 ease-in-out transform hover:scale-105'>
                        <i className="fas fa-users mx-2" style={{ fontSize: '1.5em' }}></i>
                        <span className='list-text'>User Groups</span>
                    </li> */}
                </ul>

              </>
            )}
          </li>
        ))}

      </ul>
    </>

  );
}

export default OrganizationVaultList;
