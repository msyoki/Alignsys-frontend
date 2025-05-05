import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as constants from './Auth/configs';

const FileExtIcon = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchExtension = async () => {
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
      try {
        const response = await axios.get(url, { signal: controller.signal });
        const data = response.data;
        const ext = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        setExtension(ext);
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error('Error fetching the extension:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExtension();

    return () => {
      controller.abort();
    };
  }, [props.guid, props.objectId, props.classId]);

  if (loading) {
    return null; // Don't show anything while loading
  }

  const iconStyle = {
    fontSize: props.fontSize || '20px',
  };

  // Render icons based on extension
  switch (extension) {
    case 'pdf':
      return <i className="fas fa-file-pdf" style={{ ...iconStyle, color: '#f21b3f' }}></i>;
    case 'csv':
      return <i className="fas fa-file-csv" style={{ ...iconStyle, color: '#7cb518' }}></i>;
    case 'txt':
      return <i className="fas fa-file-alt" style={{ ...iconStyle, color: '#6c757d' }}></i>;
    case 'xlsx':
      return <i className="far fa-file-excel" style={{ ...iconStyle, color: '#3e8914' }}></i>;
    case 'docx':
    case 'doc':
      return <i className="fas fa-file-word" style={{ ...iconStyle, color: '#0077b6' }}></i>;
    case 'png':
    case 'jpeg':
    case 'jpg':
      return <i className="fas fa-file-image" style={{ ...iconStyle, color: '#2a68af' }}></i>;
    default:
      // Always show the default grey file icon
      return <i className="fas fa-file" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
  }
};

export default FileExtIcon;
