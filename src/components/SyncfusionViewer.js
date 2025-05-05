import React, { useEffect, useRef } from 'react';
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from '@syncfusion/ej2-react-documenteditor';
import { registerLicense } from '@syncfusion/ej2-base';

function WritingAssist({ base64File }) {
  const containerRef = useRef(null);
  registerLicense('Ngo9BigBOggjHTQxAR8/V1NNaF5cXmBCeEx3WmFZfVtgfV9FYlZVQGYuP1ZhSXxWdkBjW39Xc3ZRTmJZUUJ9XUs=');
  useEffect(() => {
    if (base64File && containerRef.current) {
      openBase64Document(base64File);
    }
  }, [base64File]);

  const openBase64Document = (base64) => {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob(
        [byteArray],
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      );
      containerRef.current.documentEditor.open(blob, 'Docx');
    } catch (err) {
      console.error('Failed to open base64 document:', err);
    }
  };

  return (
    <div style={{ height: '80vh' }}>
      <DocumentEditorContainerComponent
        id="document-editor"
        ref={containerRef}
        enableToolbar={true}
        hidePropertiesPane={true}
        height="100%"
        width='auto'
        serviceUrl="https://services.syncfusion.com/js/production/api/documenteditor/"
      >
        <Inject services={[Toolbar]} />
      </DocumentEditorContainerComponent>
    </div>
  );
}

export default WritingAssist;
