import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs';

// Simple in-memory cache
const extCache = {};

const FileExtText = ({ guid, objectId, classId }) => {
  const cacheKey = `${guid}_${objectId}_${classId}`;
  const [extension, setExtension] = useState(extCache[cacheKey] || '');
  const [loading, setLoading] = useState(!extCache[cacheKey]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (extCache[cacheKey]) {
      setExtension(extCache[cacheKey]);
      setLoading(false);
      return;
    }

    const fetchExtension = async () => {
      try {
        const url = `${constants.mfiles_api}/api/objectinstance/GetObjectFiles/${guid}/${objectId}/${classId}`;
        const { data } = await axios.get(url, { signal: controller.signal });
        if (isMounted) {
          const ext = data?.[0]?.extension?.replace(/^\./, '').toLowerCase() || '';
          extCache[cacheKey] = ext;
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
  }, [guid, objectId, classId, cacheKey]);

  if (loading) return <CircularProgress size={10} className="mx-2" />;
  if (!extension) return null;
  return <>.{extension}</>;
};

export default FileExtText;