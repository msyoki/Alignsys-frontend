import React, { useRef, useState, useCallback, useMemo } from "react";
import {
    Dialog,
    Grid,
    Button,
    CircularProgress,
    Tooltip,
    TextField,
    Typography,
    Chip,
    Box,
} from "@mui/material";

const AddSignersDialog = (props) => {
    // --- Refs ---
    const emailInputRef = useRef();

    // --- State ---

    const [openalert, setOpenAlert] = useState(false);
    const [alertseverity, setAlertSeverity] = useState("");
    const [alertmsg, setAlertMsg] = useState("");
    const [open, setOpen] = useState(false);
    const [signatureBoxes, setSignatureBoxes] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
    const [loadingSend, setLoadingSend] = useState(false);
    const [loadingAddSigner, setLoadingAddSigner] = useState(false);

    // --- Handlers ---
    const handleClose = useCallback(() => {
        props.setOpenDialogAddSigners(false);
        setSelectedUser(null);
        setSelectedAnnotationId(null);
    }, [props]);

    const handleClose2 = useCallback(() => {
        props.setOpenDialogAddSigners(false);
        props.setSigners([]);
        setSignatureBoxes([]);
        setSelectedUser(null);
        setSelectedAnnotationId(null);
        if (emailInputRef.current) emailInputRef.current.value = "";
    }, [props]);

    const validateEmail = useCallback((email) => {
        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email.trim());
    }, []);

    const showAlert = useCallback((message, severity = "error") => {
        setAlertMsg(message);
        setAlertSeverity(severity);
        setOpenAlert(true);
        setTimeout(() => setOpenAlert(false), 3000);
    }, []);

    const addMailList = useCallback(
        async (e) => {
            e.preventDefault();
            setLoadingAddSigner(true);

            try {
                const email = emailInputRef.current?.value?.trim() || "";

                if (!email) {
                    showAlert("Email is required");
                    return;
                }

                if (!validateEmail(email)) {
                    showAlert(`Email "${email}" is invalid.`);
                    return;
                }

                if (
                    props.signers.some(
                        (item) => item.email.toLowerCase() === email.toLowerCase()
                    )
                ) {
                    showAlert("Email already exists.");
                    return;
                }

                const signer = { email: email.toLowerCase() };
                props.setSigners((prev) => [...prev, signer]);

                if (emailInputRef.current) emailInputRef.current.value = "";

                showAlert("Signer added successfully!", "success");
            } catch (error) {
                console.error("Error adding signer:", error);
                showAlert("An error occurred while adding signer.");
            } finally {
                setLoadingAddSigner(false);
            }
        },
        [props.signers, validateEmail, showAlert]
    );

    const removeSigner = useCallback((e, email) => {
        e.stopPropagation();
        props.setSigners((prev) => prev.filter((item) => item.email !== email));
        setSignatureBoxes((prev) =>
            prev.filter((item) => item.signer?.email !== email)
        );
    }, []);

    // --- Memoized Components ---
    // --- UI Components ---
    const SignersList = useMemo(
        () =>
            ({ signers, removeSigner }) =>
            (
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", mt: 1, mb: 1, maxHeight: "30vh" }}>
                    {signers.map((item, index) => (
                        <React.Fragment key={item.email}>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: "25px",
                                    bgcolor: "white",
                                    boxShadow: 1,
                                    fontSize: "13px",
                                    maxWidth: "100%",
                                    flexShrink: 0,
                                    mr: 1,
                                    mb: 1,
                                }}
                            >
                                <i className="fas fa-user-circle" style={{ color: "#2757aa", marginRight: "6px" }}></i>
                                <span style={{ marginRight: "8px", color: "#000", fontSize:'12.8px' }}>{item.email}</span>

                             
                                <i
                                    className="fas fa-times text-danger"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => removeSigner(e, item.email)}
                                ></i>
                            </Box>

                            {index < signers.length - 1 && (
                                <i
                                    className="fas fa-arrow-right"
                                    style={{ color: "#2757aa", fontSize: "16px", marginRight: "8px" }}
                                ></i>
                            )}
                        </React.Fragment>
                    ))}
                </Box>
            ),
        []
    );


    const AddSignerForm = useMemo(
        () =>
            ({ onSubmit }) =>
            (
                <form onSubmit={onSubmit} noValidate>
                    <Typography
                        variant="h6"
                        sx={{ mb: 2, color: "#2757aa", fontWeight: 500 }}
                    >
                        Add new signer
                    </Typography>

                    <TextField
                        inputRef={emailInputRef}
                        id="signer-email"
                        label="Signer email *"
                        type="email"
                        name="email"
                        placeholder="example@gmail.com"
                        required
                        fullWidth
                        size="small"
                        sx={{ mb: 3 }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="medium"
                        disabled={loadingAddSigner}
                        fullWidth
                        sx={{
                            backgroundColor: "#2757aa",
                            "&:hover": { backgroundColor: "#1e4a8c" },
                            borderRadius: "8px",
                            py: 1,
                            textTransform: "none",
                        }}
                    >
                        {loadingAddSigner ? (
                            <>
                                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                                Adding...
                            </>
                        ) : (
                            "Add signer"
                        )}
                    </Button>
                </form>
            ),
        [loadingAddSigner]
    );

    return (
        <>
            <Dialog
                open={props.opendialogaddsigners}
                onClose={handleClose}
                aria-describedby="add-signers-dialog"
                fullWidth
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: "12px" } }}
            >
                <Grid container>
                    {/* Left Column - Add Signer Form */}
                    <Grid item xs={12} md={5} sx={{ p: 3, bgcolor: "#fff" }}>
                        <AddSignerForm onSubmit={addMailList} />

                        <Box sx={{ textAlign: "center", mt: 3 }}>
                            <Button
                                onClick={handleClose2}
                                variant="outlined"
                                size="medium"
                                sx={{
                                    borderColor: "#fdd85d",
                                    color: "#856404",
                                    backgroundColor: "#fff3cd",
                                    "&:hover": {
                                        backgroundColor: "#fdd85d",
                                        borderColor: "#fdd85d",
                                    },
                                    borderRadius: "8px",
                                    textTransform: "none",
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Grid>

                    {/* Right Column - Signers List */}
                    <Grid item xs={12} md={7} sx={{ p: 3, bgcolor: "grey.50" }}>
                        {props.signers.length === 0 ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                    textAlign: "center",
                                }}
                            >
                                <i
                                    className="fas fa-envelope-open-text"
                                    style={{ fontSize: "48px", color: "#dee2e6" }}
                                ></i>
                                <Typography variant="subtitle1" color="text.secondary">
                                    No signers added yet
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Add signers using the form on the left
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 2,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ color: "#2757aa", fontWeight: 500 }}
                                    >
                                        Signers ({props.signers.length})
                                    </Typography>
                                </Box>

                                <Box sx={{ maxHeight: 200, overflowY: "auto", mb: 3 }}>
                                    <SignersList
                                        signers={props.signers}
                                        removeSigner={removeSigner}
                                    />
                                </Box>

                                {/* <Box sx={{ textAlign: "center" }}>
                                    <Button
                                        onClick={() => setOpen(true)}
                                        variant="contained"
                                        size="medium"
                                        sx={{
                                            backgroundColor: "#28a745",
                                            "&:hover": { backgroundColor: "#218838" },
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            px: 3,
                                            py: 1,
                                        }}
                                    >
                                        Preview / mark where to sign
                                    </Button>
                                </Box> */}
                                 <Box sx={{ textAlign: "center" }}>
                                    <Button
                                        onClick={() => {props.postDataOthers();props.setOpenDialogAddSigners(false)}}
                                        variant="contained"
                                        size="small"
                                        className="rounded-pill"
                                        sx={{
                                            backgroundColor: "#28a745",
                                            "&:hover": { backgroundColor: "#218838" },
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            px: 3,
                                            py: 1,
                                        }}
                                    >
                                        Send for Signing
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Dialog>
        </>
    );
};

export default AddSignersDialog;
