import React, { useState, useEffect } from "react";

const TempFile = ({ base64Content, ext }) => {
    const [fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
        console.log(`base64 : ${base64Content}`)
        const loadDocument = () => {
            try {
                // Decode the Base64 content
                const byteCharacters = atob(base64Content);

                // Convert Base64 to byte array
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                // Determine MIME type based on extension
                let mimeType;
                console.log(`Extension : ${ext}`)
                if (ext === "docx" || ext === "doc") {
                    mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                } else if (ext === "xlsx") {
                    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                } else {
                    throw new Error("Unsupported file type");
                }

                // Create a Blob and generate a temporary URL
                const blob = new Blob([byteArray], { type: mimeType });
                const url = URL.createObjectURL(blob);
                setFileUrl(url);
            } catch (error) {
                console.error("Failed to load document:", error);
            }
        };

        loadDocument();

        // Cleanup the temporary URL when the component unmounts
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [base64Content, ext]);

    if (!fileUrl) {
        return <p>Loading document...</p>;
    }

    // Render the document using Microsoft's Office Viewer
    return (
        <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                fileUrl
            )}`}
            width="100%"
            height="500px"
            frameBorder="0"
            title="Document Viewer"
        />
    );
};

export default TempFile;
