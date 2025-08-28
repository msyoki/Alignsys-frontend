import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs';

const FileExtText = (props) => {
  const [extension, setExtension] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchExtension = async () => {
      setLoading(true);
      
      try {
        const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
        const { data } = await axios.get(url, { signal: controller.signal });
        if (isMounted) {
          const ext = data?.[0]?.extension?.replace(/^\./, '').toLowerCase() || '';
          setExtension(ext);
        }
      } catch {
        if (isMounted) setExtension('');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExtension();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [props.guid, props.objectId, props.classId,  props.version ?? null]);

  if (loading) return <CircularProgress size={10} className="mx-2" />;
  if (!extension) return null;
  return <>.{extension}</>;
};

export default FileExtText;