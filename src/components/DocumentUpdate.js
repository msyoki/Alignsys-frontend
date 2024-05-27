// DocumentUpdate.js

import React, { useState } from 'react';

const DocumentUpdate = () => {
  const [file, setFile] = useState(null);
  const [documentName, setDocumentName] = useState('');

  const handleFileChange = (e) => {
    // Handle file selection and update 'file' state
  };

  const handleUpdate = () => {
    // Make an API request to update the document
    // You can use FormData to send the file and other data
  };

  return (
    <div className='d-flex justify-content-center my-3'>
      <input size='sm' type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Document Name"
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
      />
      <a onClick={handleUpdate}><i class="fas fa-edit"></i> </a>
    </div>
  );
};

export default DocumentUpdate;
