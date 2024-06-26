import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const FileExt = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExtension = async () => {
      const url = `http://192.236.194.251:240/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
   
      try {
        const response = await axios.get(url);
        const data = response.data;
        const extension = data[0]?.extension.toLowerCase();
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
    return <CircularProgress size={10} />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  switch (extension) {
    case 'pdf':
      return <i className="fas fa-file-pdf mx-1" style={{ fontSize: '15px', color: '#f21b3f' }}></i>;
    case 'csv':
      return <i className="fas fa-file-csv mx-1" style={{ fontSize: '15px', color: '#3e8914' }}></i>;
    case 'txt':
      return <i className="fas fa-file-alt mx-1 text-secondary" style={{ fontSize: '15px' }}></i>;
    case 'xlsx':
      return <i className="fas fa-file-excel mx-1" style={{ fontSize: '15px', color: '#3e8914' }}></i>;
    case 'docx':
      return <i className="fas fa-file-word mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i>;
    case 'png':
      return <i className="fas fa-image mx-1" style={{ fontSize: '15px', color: '#2a68af' }}></i>;
    case 'jpeg':
      return <i className="fas fa-file-image mx-1" style={{ fontSize: '15px', color: '#2a68af' }}></i>;
    default:
      return <i className="fas fa-file mx-1" style={{ fontSize: '15px', color: '#0077b6' }}></i>;
  }
};

export default FileExt;
