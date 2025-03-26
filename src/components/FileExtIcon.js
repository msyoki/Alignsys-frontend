import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs';

const FileExtIcon = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
      try {
        const response = await axios.get(url, { signal: controller.signal });
        const data = response.data;
        const ext = data[0]?.extension?.replace(/^\./, '').toLowerCase(); // Normalize the extension
        // console.log(ext)
        setExtension(ext);
      } catch (err) {
        if (axios.isCancel(err)) {
          // console.log('Request canceled:', err.message);
        } else {
          console.error('Error fetching the extension:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExtension();

    // Cleanup function to cancel the request on unmount
    return () => {
      controller.abort();
    };
  }, [props.guid, props.objectId, props.classId]);

  if (loading) {
    return <CircularProgress size={10} className="mx-2" />;
  }

  if (error) {
    return (
      props.objectId === 0 ? (
        <i className="fas fa-folder " style={{ fontSize: props.fontSize || '20px', color: "#2a68af" }}></i>
      ) : (
        <i className="fas fa-file " style={{ fontSize: props.fontSize || '20px', color: "#2a68af" }}></i>
      )
    );
  }



  // Render icons based on extension
  switch (extension) {
    case 'pdf':
      return (
        <i
        className="fas fa-file-pdf"
        style={{ fontSize: props.fontSize || '20px', color: '#f21b3f' }}
      ></i>
      
      );
    case 'csv':
      return (
        <i
          className="fas fa-file-csv "
          style={{ fontSize: props.fontSize || '20px', color: '#7cb518' }}
        ></i>
      );
    case 'txt':
      return (
        <i
          className="fas fa-file-alt  text-secondary"
          style={{ fontSize: props.fontSize || '20px', }}
        ></i>
      );
    case 'xlsx':
      return (
        <i
          className="far fa-file-excel "
          style={{ fontSize: props.fontSize || '20px', color: '#3e8914' }}
        ></i>
      );
    case 'docx':
    case 'doc':
      return (
        <i
          className="fas fa-file-word "
          style={{ fontSize: props.fontSize || '20px', color: '#0077b6' }}
        ></i>
      );
    case 'png':
    case 'jpeg':
    case 'jpg':
      return (
        <i
          className="fas fa-file-image "
          style={{ fontSize: props.fontSize || '20px',color: '#2a68af' }}
        ></i>
      );
    default:
      return (
        props.objectId === 0 ? (
          <i className="fas fa-folder " style={{ fontSize: props.fontSize || '20px', color: "#2a68af" }}></i>
        ) : (
          <i className="fas fa-file " style={{ fontSize: props.fontSize || '20px', color: "#2a68af" }}></i>
        )
      );
      
  }
};

export default FileExtIcon;
