import React, { useRef, useState, useCallback, useMemo } from "react";import { THEME_COLORS } from '../../constants/themeColors';

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
    Stack
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
                                <i className="fas fa-user-circle" style={{ color: THEME_COLORS.primary, marginRight: "6px" }}></i>
                                <span style={{ marginRight: "8px", color: "#000", fontSize: '12.8px' }}>{item.email}</span>


                                <i
                                    className="fas fa-times text-danger"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => removeSigner(e, item.email)}
                                ></i>
                            </Box>

                            {index < signers.length - 1 && (
                                <i
                                    className="fas fa-arrow-right"
                                    style={{ color: THEME_COLORS.primary, fontSize: "16px", marginRight: "8px" }}
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
                    <div className='p-3' style={{ backgroundColor: '#e9f2ff', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                        <span style={{ color: THEME_COLORS.primary }}>Instructions</span>: Add signers in the order they should sign. Once the list is complete, proceed to send for signing.
                    </div>
                    <h5 className="mb-2" style={{ fontSize: 13, color: THEME_COLORS.primary }}>
                        <i className="fas fa-user-plus me-2"></i>Add new signer
                    </h5>


                    <TextField
                        inputRef={emailInputRef}
                        id="signer-email"
                        label="Signer email"
                        type="email"
                        name="email"
                        placeholder="example@gmail.com"
                        required
                        fullWidth
                        size="small"
                        sx={{ mb: 3, mt: 1 }}
                    />

                    <Stack
                        direction={{ xs: "column", sm: "row" }} // column on extra-small screens, row on small+
                        spacing={2}
                        justifyContent="flex-start"
                        alignItems="stretch"
                    >
                        <Button
                            onClick={handleClose2}
                            variant="outlined"
                            size="small"
                            className="rounded-pill"
                            fullWidth
                            sx={{
                                borderColor: "#f0c040",      // modern gold border
                                color: "#555",            // darker golden text
                                backgroundColor: "#fff8e1",  // soft yellow background
                                "&:hover": {
                                    backgroundColor: "#f0c040",
                                    borderColor: "#f0c040",
                                },
                                borderRadius: "8px",
                                textTransform: "none",
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            size="small"
                            className="rounded-pill"
                            disabled={loadingAddSigner}
                            fullWidth
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
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
                                <>
                                    <i className="fas fa-plus-circle mx-2"></i>
                                    Add Signer
                                </>
                            )}
                        </Button>


                    </Stack>

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
                                        sx={{ color: THEME_COLORS.primary, fontWeight: 500 }}
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
                                        onClick={() => { props.postDataOthers(); props.setOpenDialogAddSigners(false) }}
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
