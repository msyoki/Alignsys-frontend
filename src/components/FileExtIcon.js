import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs'

const FileExtIcon = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;

      try {
        const response = await axios.get(url);
        const data = response.data;

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
    return <i
      className="fas fa-layer-group mx-2"
      style={{ fontSize: '15px', color: '#0077b6' }}
    ></i>;
  }



  switch (extension) {
    case 'pdf':
      return <i className="fas fa-file-pdf mx-2" style={{ fontSize: '15px', color: '#f21b3f' }}></i>;
    case 'csv':
      return <i className="fas fa-file-csv mx-2" style={{ fontSize: '15px', color: '#7cb518' }}></i>;
    case 'txt':
      return <i className="fas fa-file-alt mx-2 text-secondary" style={{ fontSize: '15px' }}></i>;
    case 'xlsx':
      return <i className="far fa-file-excel mx-2" style={{ fontSize: '15px', color: '#3e8914' }}></i>;
    case 'docx':
      return <i className="fas fa-file-word mx-2" style={{ fontSize: '15px', color: '#0077b6' }}></i>;
    case 'png':
      return <i className="fas fa-image mx-2" style={{ fontSize: '15px', color: '#2a68af' }}></i>;
    case 'jpeg':
    case 'jpg':
      return <i className="fas fa-file-image mx-2" style={{ fontSize: '15px', color: '#2a68af' }}></i>;
    default:
      return <i className="fas fa-image mx-2" style={{ fontSize: '15px', color: '#0077b6' }}></i>;
  }
};

export default FileExtIcon;
