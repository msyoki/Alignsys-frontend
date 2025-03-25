import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import * as constants from './Auth/configs';

const FileExtText = (props) => {
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
        const ext = data[0]?.extension?.replace(/^\./, '').toLowerCase(); // Normalize extension
        console.log(ext);
        setExtension(ext);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request canceled:', err.message);
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
    return <p></p>; // Return empty text if there's an error
  }

  return <>.{extension}</> || ''; // Ensure a safe fallback for extension
};

export default FileExtText;
