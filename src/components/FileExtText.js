import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs'

const FileExtText = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
   
      try {
        const response = await axios.get(url);
        const data = response.data;
        console.log(data)
    
        const extension = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        setExtension(extension);
      } catch (error) {
        console.error('Error fetching the extension:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExtension();
  }, [props.guid, props.objectId, props.classId]); // Added props dependencies to re-fetch if props change

  if (loading) {
    return <CircularProgress size={10} className='mx-2' />;
  }

  if (error) {
    // return <p>Error: {error}</p>;
    return <p></p>;
    
  }

  return extension

};

export default FileExtText;
