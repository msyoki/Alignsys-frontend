import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  ModalFooter,
} from "@chakra-ui/react";
import XLSX from 'xlsx'; // You may need to install this library
import { CSVLink, CSVDownload } from "react-csv";
import { Document, Page } from 'react-pdf';

const DocumentPreviewModal = ({ document, isOpen, onClose }) => {
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
 
    var csvData = null;
    var csvArray = null;
    if(document.documentExtension){
      csvData=atob(document.documentHash)
      csvArray = csvData.split('\n').map(row => row.split(','));
    }
 
  
    // setFileContent(newcsvData)

    
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" width='150%' height='100%' isCentered>
        <ModalOverlay />
        <ModalContent className='text-center'>
          <ModalHeader style={{ fontSize:'12px' }}>Document Preview</ModalHeader>
          <ModalCloseButton  />
          {document.documentExtension === 'pdf'?  
          <>
            <iframe
             title="Document Preview"
             src={`data:application/pdf;base64,${document.documentHash}`}
            //  src={data3.document}
             
             style={{ width: '100%', height:'85vh' }}
           />
          </>
          :<></>} 
        
          {/* <CSVLink data={csvArray}>Download me</CSVLink> */}
          {/* <pre>{atob(data)}</pre> */}
      
          {document.documentExtension === 'CSV' || document.documentExtension === 'txt' || document.documentExtension === 'xlsx'?   
          <div className='table-responsive p-3'>
            <table className='table table-sm' style={{fontSize:'12px'}}>
              <thead>
                {csvArray.length > 0 && (
                  <tr>
                    {csvArray[0].map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {csvArray.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          :<></>} 
      
    


          {/* <ModalFooter><small>Document Preview</small></ModalFooter> */}
      
      </ModalContent>
    </Modal>
  );
};

export default DocumentPreviewModal;
