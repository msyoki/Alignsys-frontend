import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FileExt = (props) => {
  const [extension, setExtension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExtension = async () => {
      const url = `http://192.236.194.251:240/api/objectinstance/GetObjectFiles/${props.guid}/${props.objectId}/${props.classId}`;
      console.log(url)
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
  }, []); // Empty dependency array ensures this runs once after the initial render

  
  if (extension === 'pdf') {
    return <i className="fas fa-file-pdf mx-1" style={{ fontSize: '15px', color: '#f21b3f' }} ></i> ;
  }
  else if (extension === 'csv') {
    return <i className="fas fa-file-excel mx-1 " style={{ fontSize: '15px', color: '#3e8914' }} ></i>;
  }
  else if (extension === 'docx') {
    return <i className="fas fa-file-word mx-1" style={{ fontSize: '15px', color: '#0077b6' }} ></i>;
  }
  else if (extension === 'png') {
    return <i className="fas fa-image mx-1" style={{ fontSize: '15px', color: '#2a68af' }} ></i>;
  }
  else{
    return <i className="fas fa-file mx-1" style={{ fontSize: '15px', color: '#0077b6' }} ></i>;
  }
  

 
};

export default FileExt;
