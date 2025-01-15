import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Authcontext from '../Auth/Authprovider';
import * as constants from '../Auth/configs'


function OrganizationVaultList(props) {
  const [vaults, setVaults] = useState([]);
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
          setVaults(response.data);
          console.log(JSON.stringify(response.data));
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
      url: 'http://192.236.194.251:8000/api/update-specific-vault-objects/',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        props.viewvaultobjects();
        props.fetchVaultObjects(guid)
      })
      .catch((error) => {
        console.log(error);
      });

  }

  return (
    <ul style={{ listStyleType: 'none', padding: 0,height:'80%' ,overflowY:'scroll' }} className='shadow-lg p-2'>
      {vaults.map((vault) => (
        <li key={vault.guid} className='my-3'>
          <div
            onClick={() => { toggleVaultSublist(vault); }}
            style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}
          >
            <i className="fas fa-hdd mx-2" style={{ fontSize: '1.5em' }}></i>
            <span className='list-text'>{vault.name}</span>
          </div>

          {openVaults[vault.guid] && (
            <ul className='shadow-lg p-3'>
              {/* <li onClick={props.viewnewobject} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                <i className="fas fa-plus mx-2" style={{ fontSize: '1.5em' }}></i>
                <span className='list-text'>Create New Vault Object</span>
              </li> */}
             
              <li onClick={() => toggleFlatSublist(vault.guid)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i>
                <span className='list-text'>Metadata Structure (Flat View)</span>
              </li>

              {showFlatSublists[vault.guid] && (
                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>
                  <li onClick={() => { props.viewvaultobjects(); props.fetchVaultObjects(vault.guid); }} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                    <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                    <span className='list-text'>Object Types</span>
                  </li>
                  <li onClick={() => sycVaultObjects(vault.guid)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                    <i className="fas fa-sync-alt mx-2" style={{ fontSize: '1.5em', cursor: 'pointer' }}></i>
                    <span className='list-text'>Sync Vault Objects</span>
                  </li>
                  {/* <li style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                    <i className="fas fa-hashtag mx-2" style={{ fontSize: '1.5em' }}></i>
                    <span className='list-text'>Classes</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                    <i className="fas fa-tag mx-2" style={{ fontSize: '1.5em' }}></i>
                    <span className='list-text'>Properties</span>
                  </li> */}
                </ul>
              )}
              {/* <li onClick={() => toggleHierarchicalSublist(vault.guid)} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                <i className="fas fa-list mx-2" style={{ fontSize: '1.5em' }}></i>
                <span className='list-text'>Metadata Structure (Hierarchical View)</span>
              </li>
              {showHierarchicalSublists[vault.guid] && (
                <ul style={{ listStyleType: 'none', padding: 0, marginLeft: '20px' }}>
                  {props.vaultObjects.map((object, index) => (
                    <li onClick={() => { props.getObjectStructureById(object.object_id); }} key={index} className='my-3' style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                      <i className="fas fa-layer-group mx-2" style={{ fontSize: '1.5em' }}></i>
                      <span className='list-text'>{object.name_singular}</span>
                    </li>
                  ))}
                </ul>
              )} */}


              <li onClick={() => { props.setSelectedVault(vault); props.viewvaultusers(vault.guid); }} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                <i className="fas fa-users mx-2" style={{ fontSize: '1.5em' }}></i>
                <span className='list-text'>Vault Users</span>
              </li>
              <li onClick={() => { props.viewvaultgroups(); props.VaultUsergroups() }} style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
                <i className="fas fa-users mx-2" style={{ fontSize: '1.5em', cursor: 'pointer' }}></i>
                <span className='list-text'>User Groups</span>
              </li>


            </ul>
          )}
        </li>
      ))}
      <li onClick={() => {
        props.fetchOrgUsers();
        props.viewloginaccounts();
      }}
        style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }} className='my-3'>
        <i className="fas fa-users mx-2" style={{ fontSize: '1.5em' }}></i>
        <span className='list-text'>All Login Accounts</span>
      </li>
    </ul>
  );
}

export default OrganizationVaultList;
