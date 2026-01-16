import React, { useRef, useState } from "react";
import axios from "axios";
import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";import { THEME_COLORS } from '../../../constants/themeColors';

import "./style.css";

function AiMultiFileUpload(props) {
    const inputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploaded, setUploaded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (["dragenter", "dragover"].includes(e.type)) {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle file drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    // Handle file input change
    const handleChange = (e) => {
        if (e.target.files?.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
        }
    };

    // Trigger hidden input
    const handleSelectFiles = () => inputRef.current.click();

    // Upload files
    const handleUpload = async () => {
        if (files.length === 0) return;
        setLoading(true);

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("Files", file));
            formData.append("email", props.email);
            formData.append("user_id", props.userId);
            formData.append("vault", props.guid);
            console.log(Object.fromEntries(formData.entries()));


            const res = await axios.post(
                "https://llm.alignsys.tech/classification/invoke",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setUploaded(true);
            props.onUploadComplete?.(res.data);
            setFiles([]);
            console.log("Upload response:", res.data);

            const timeNow = new Date().toISOString(); // e.g. "2025-10-23T09:45:00.000Z"
            let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

            tasks.push({
                task_id: res.data.task_id,
                time: timeNow,
            });

            localStorage.setItem("tasks", JSON.stringify(tasks));
            console.log("Updated task list:", tasks);


        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Delete a single file
    const handleDeleteFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Reset state
    const handleCancel = () => {
        setFiles([]);
        setUploaded(false);
    };

    return (
        <div style={{ width: "100%", maxWidth: 600, fontSize: "14px" }}>
            {/* Keep input always rendered */}
            <input
                ref={inputRef}
                type="file"
                id="input-file-upload"
                multiple
                onChange={handleChange}
                style={{ display: "none" }}
                accept=".pdf,.tiff,.png,.jpeg,.jpg,.gif,
      .xls,.xlsx,.csv,.doc,.docx,.rtf,.pptx,.pptm,.potx"
            />

            {!uploaded ? (
                <>
                    {files.length === 0 ? (
                        <form
                            id="form-file-upload"
                            onDragEnter={handleDrag}
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <label
                                id="label-file-upload"
                                htmlFor="input-file-upload"
                                className={dragActive ? "drag-active" : ""}
                            >
                                <i
                                    className="fas fa-upload"
                                    style={{ fontSize: 28, color: THEME_COLORS.primary, marginBottom: 8 }}
                                />

                                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                    Upload document(s)
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 400, mb: 0.5, color: '#666' }}>
                                    .pdf, .tiff, .png, .jpeg, .jpg, .gif, .xls, .xlsx, .csv, .doc, .docx, .rtf, .pptx, .pptm, .potx
                                </Typography>


                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleSelectFiles}
                                    sx={{ textTransform: "none", fontSize: "13px", mb: 1 }}
                                >
                                    <i className="far fa-plus-square" style={{ marginRight: 6 }} />
                                    Select file(s)
                                </Button>

                                <Typography variant="body2" color="text.secondary">
                                    or Drag & Drop here
                                </Typography>
                            </label>

                            {dragActive && (
                                <div
                                    id="drag-file-element"
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                />
                            )}
                        </form>
                    ) : (
                        <>
                            {/* File list */}
                            <Paper elevation={2} sx={{ mb: 2, p: 1.5 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected Documents:
                                </Typography>
                                <List dense>
                                    {files.map((file, index) => (
                                        <ListItem
                                            key={index}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    color="error"
                                                    onClick={() => handleDeleteFile(index)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={file.name}
                                                primaryTypographyProps={{ fontSize: "13px" }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>

                            <Button
                                variant="outlined"
                                size="medium"
                                onClick={handleSelectFiles}
                                sx={{ textTransform: "none", fontSize: "12px", mb: 1 }}
                            >
                                + Add File(s)
                            </Button>

                            <div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                    onClick={handleUpload}
                                    disabled={loading}
                                    sx={{ m: 0.5 }}
                                >
                                    {loading ? "Uploading..." : "Upload"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    size="medium"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    sx={{ m: 0.5 }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <div style={{ marginTop: 10, fontSize: "14px" }}>
                    <Typography variant="subtitle2">Uploaded Documents:</Typography>
                    <ul style={{ paddingLeft: 16, margin: "6px 0" }}>
                        {files.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>

                    <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={() => setUploaded(false)}
                        sx={{ m: 0.5 }}
                    >
                        Add More
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="medium"
                        onClick={handleCancel}
                        sx={{ m: 0.5 }}
                    >
                        Cancel
                    </Button>
                </div>
            )}
        </div>

    );
}

export default AiMultiFileUpload;
