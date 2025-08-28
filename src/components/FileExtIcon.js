import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as constants from './Auth/configs';

const FileExtIcon = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [is400, setIs400] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchExtension = async () => {
      setLoading(true);
      setIs400(false);
      
      const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
     
      try {
        const response = await axios.get(url, { signal: controller.signal });
        const data = response.data;
        const ext = data[0]?.extension?.replace(/^\./, '').toLowerCase();
        if (isMounted) {
          setExtension(ext);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response && err.response.status === 400) {
          if (isMounted) {
            setIs400(true);
          }
        } else if (!axios.isCancel(err)) {
          console.error('Error fetching the extension:', err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExtension();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [props.guid, props.objectId, props.classId, props.version ?? null ]); // Removed props.isMultifile as it's not used

  const iconStyle = {
    fontSize: props.fontSize || '20px',
  };

  if (loading) {
    // Show grey file icon while loading
    return <i className="fas fa-file" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
  }

  if (is400) {
    // Show book icon if 400 error
    return <i className="fas fa-file" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
  }

  // Render icons based on extension
  switch (extension) {
    case 'pdf':
      return <i className="fas fa-file-pdf shadow-sm" style={{ ...iconStyle, color: '#f21b3f' }}></i>;
    case 'csv':
      return <i className="fas fa-file-csv shadow-sm" style={{ ...iconStyle, color: '#7cb518' }}></i>;
    case 'txt':
      return <i className="fas fa-file-alt shadow-sm" style={{ ...iconStyle, color: '#6c757d' }}></i>;
    case 'msg':
      return <i className="fa-solid fa-envelope shadow-sm" style={{ ...iconStyle, color: '#ffb703' }}></i>;
    case 'webp':
      return <i className="fa-brands fa-internet-explorer shadow-sm" style={{ ...iconStyle, color: '#2757aa' }}></i>;
    case 'xlsx':
    case 'xls':
      return <i className="far fa-file-excel shadow-sm" style={{ ...iconStyle, color: '#7cb518' }}></i>;
    case 'ppt':
      return <i className="fa-solid fa-file-powerpoint shadow-sm" style={{ ...iconStyle, color: '#ef6351' }}></i>;
    case 'docx':
    case 'doc':
      return <i className="fas fa-file-word shadow-sm" style={{ ...iconStyle, color: '#0077b6' }}></i>;
    case 'png':
    case 'jpeg':
    case 'jpg':
      return <i className="fas fa-file-image shadow-sm" style={{ ...iconStyle, color: '#2a68af' }}></i>;
    case 'vssettings':
      return <i className="fa-solid fa-code shadow-sm" style={{ ...iconStyle, color: '#2a68af' }}></i>;
    default:
      return <i className="fas fa-file shadow-sm" style={{ ...iconStyle, color: '#e5e5e5' }}></i>;
  }
};

export default FileExtIcon;