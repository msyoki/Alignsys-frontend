import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    Typography,
    Box,
    Paper,
    CircularProgress,
    Grid,
    Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { MdOutlineScanner, MdErrorOutline, MdRefresh } from "react-icons/md";
import { BsFillHddNetworkFill } from "react-icons/bs";
import { FaDownload } from "react-icons/fa6";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { VscLibrary } from "react-icons/vsc";
import FileUploadComponent from "../../FileUpload";
import * as constants from "../../Auth/configs";
import { THEME_COLORS } from '../../../constants/themeColors';
import file from './639074537916572448.pdf';

// ─── Design tokens ────────────────────────────────────────────────────────────
// THEME_COLORS.primary is a concrete hex (#2757aa) — safe to use directly with alpha().
// Guard: alpha() crashes on CSS variables like var(--color-primary).
// Resolve to a concrete hex at module load time.
const resolveColor = (val) =>
    (!val || typeof val !== 'string' || val.startsWith('var(')) ? '#2757aa' : val;
const P = resolveColor(THEME_COLORS.primary);

// Derive darker/lighter variants of P without any external lib.
// Works by parsing the hex and shifting lightness in HSL space.
const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d/(2-max-min) : d/(max+min);
        switch(max){ case r: h=((g-b)/d+(g<b?6:0))/6; break; case g: h=((b-r)/d+2)/6; break; default: h=((r-g)/d+4)/6; }
    }
    return [h*360, s*100, l*100];
};
const hslToHex = (h, s, l) => {
    h/=360; s/=100; l/=100;
    const hue2rgb = (p,q,t) => { if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    const q = l<0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    const r=hue2rgb(p,q,h+1/3), g=hue2rgb(p,q,h), b=hue2rgb(p,q,h-1/3);
    return '#'+[r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
};
const shiftL = (hex, delta) => { const [h,s,l] = hexToHsl(hex); return hslToHex(h, s, Math.max(0, Math.min(100, l+delta))); };

// Precomputed variants — tweak deltas to taste
const P_DARK   = shiftL(P, -18);   // deeper shade  (hover states, header end)
const P_DARKER = shiftL(P, -30);   // darkest shade (header start)

const D = {
    navy:         P,          // header gradient start
    navyLight:    P,            // header gradient end
    primary:      P,
    border:       '#e2e8f0',
    borderDark:   '#cbd5e1',
    surface:      '#f8fafc',
    text:         '#1e293b',
    textMuted:    '#64748b',
    success:      '#16a34a',
    successBg:    '#f0fdf4',
    successBorder:'#86efac',
    scanLine:     'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.015) 2px, rgba(255,255,255,0.015) 4px)',
};

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes sd-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(0.9); }
}
@keyframes sd-scan {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(500%); opacity: 0; }
}
@keyframes sd-fadein {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;

// ─── LoadingState ─────────────────────────────────────────────────────────────
const LoadingState = () => (
    <Box sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", py: 5, px: 3,
        background: "linear-gradient(135deg, #f0f4ff 0%, #f8faff 100%)",
        borderRadius: 3, border: `1px solid ${alpha(P, 0.18)}`,
        maxWidth: 340, mx: "auto",
    }}>
        <Box sx={{ position: "relative", mb: 3 }}>
            <Box sx={{
                width: 64, height: 64, borderRadius: "50%",
                backgroundColor: alpha(P, 0.1),
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "sd-pulse 1.8s ease-in-out infinite",
            }}>
                <MdOutlineScanner size={30} color={P} />
            </Box>
            <Box sx={{
                position: "absolute", top: 0, left: 0, right: 0, height: "18%",
                background: `linear-gradient(transparent, ${alpha(P, 0.3)}, transparent)`,
                animation: "sd-scan 2s ease-in-out infinite",
                borderRadius: "50%",
            }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: D.text, mb: 0.5 }}>
            Scanning for devices
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: D.textMuted, textAlign: "center", lineHeight: 1.6 }}>
            Ensure your scanner is powered on and connected
        </Typography>
        <Box sx={{ display: "flex", gap: 0.75, mt: 2.5 }}>
            {[0, 1, 2].map(i => (
                <Box key={i} sx={{
                    width: 6, height: 6, borderRadius: "50%",
                    backgroundColor: P,
                    animation: `sd-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
            ))}
        </Box>
    </Box>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ apiUnreachable, onRetry, onDownload }) => (
    <Box sx={{
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", py: 4, px: 3, maxWidth: 400, mx: "auto",
        borderRadius: 3, animation: "sd-fadein 0.3s ease",
        border: `1px solid ${apiUnreachable ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.22)'}`,
        backgroundColor: apiUnreachable ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
    }}>
        <Box sx={{
            width: 52, height: 52, borderRadius: "50%", mb: 2,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: apiUnreachable ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
            color: apiUnreachable ? '#dc2626' : '#d97706', fontSize: 26,
        }}>
            {apiUnreachable ? <MdErrorOutline /> : <BsFillHddNetworkFill />}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: D.text, mb: 0.75 }}>
            {apiUnreachable ? "Scanner service unreachable" : "No scanners detected"}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: D.textMuted, lineHeight: 1.6, mb: 2.5 }}>
            {apiUnreachable
                ? "Install the Alignsys Plug-in to enable scanning from this device."
                : "Make sure your scanner is powered on and connected, then try again."}
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
            {apiUnreachable && (
                <Button onClick={onDownload} variant="outlined" size="small"
                    startIcon={<FaDownload size={12} />}
                    sx={{
                        textTransform: "none", fontSize: 12.5, borderRadius: "20px", px: 2.5, py: 0.75,
                        borderColor: P, color: P,
                        "& .MuiButton-startIcon": { mr: 0.75 },
                        "&:hover": { backgroundColor: alpha(P, 0.06) },
                    }}>
                    Download Plug-in
                </Button>
            )}
            <Button onClick={onRetry} variant="contained" size="small"
                startIcon={<MdRefresh size={15} />}
                sx={{
                    textTransform: "none", fontSize: 12.5, borderRadius: "20px", px: 2.5, py: 0.75,
                    backgroundColor: P,
                    "& .MuiButton-startIcon": { mr: 0.75 },
                    "&:hover": { backgroundColor: P_DARK },
                }}>
                Try Again
            </Button>
        </Box>
    </Box>
);

// ─── ScannerListItem ──────────────────────────────────────────────────────────
const ScannerListItem = ({ scanner, isSelected, processing, onSelect, index }) => (
    <ListItem disablePadding sx={{ mb: 0.75, animation: `sd-fadein 0.25s ease ${index * 0.07}s both` }}>
        <Paper onClick={() => onSelect(scanner)} elevation={0} sx={{
            width: "100%", px: 2, py: 1.25, borderRadius: "10px",
            cursor: processing ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 1.5,
            opacity: processing && !isSelected ? 0.42 : 1,
            transition: "all 0.18s ease",
            border: isSelected ? `1.5px solid ${P}` : `1px solid ${D.border}`,
            backgroundColor: isSelected ? alpha(P, 0.05) : "#fff",
            boxShadow: isSelected
                ? `0 0 0 3px ${alpha(P, 0.08)}, 0 2px 6px rgba(0,0,0,0.06)`
                : "0 1px 3px rgba(0,0,0,0.04)",
            "&:hover": !processing ? {
                borderColor: P,
                backgroundColor: alpha(P, 0.03),
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.09)",
            } : {},
        }}>
            <Box sx={{
                width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                backgroundColor: isSelected ? P : D.borderDark,
                boxShadow: isSelected ? `0 0 0 3px ${alpha(P, 0.18)}` : "none",
                transition: "all 0.2s",
            }} />
            <MdOutlineScanner size={16} color={isSelected ? P : D.textMuted} style={{ flexShrink: 0, transition: "color 0.2s" }} />
            <Typography sx={{ flexGrow: 1, fontSize: 13, fontWeight: isSelected ? 600 : 500, color: isSelected ? P : D.text, transition: "all 0.2s" }}>
                {scanner.name}
            </Typography>
            {processing && isSelected ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <CircularProgress size={13} thickness={4} sx={{ color: P }} />
                    <Typography sx={{ fontSize: 11, color: D.textMuted, fontStyle: "italic" }}>Scanning…</Typography>
                </Box>
            ) : isSelected ? (
                <Chip label="Selected" size="small" sx={{
                    height: 19, fontSize: 10.5, fontWeight: 700,
                    backgroundColor: alpha(P, 0.09), color: P,
                    border: `1px solid ${alpha(P, 0.22)}`,
                    "& .MuiChip-label": { px: 1 },
                }} />
            ) : null}
        </Paper>
    </ListItem>
);

// ─── Main component ───────────────────────────────────────────────────────────
const ScannerDialog = ({ open, onClose, fetchItemData, setUploadedFile, uploadedFile }) => {
    const [scanners, setScanners]               = useState([]);
    const [loading, setLoading]                 = useState(false);
    const [sessionId, setSessionId]             = useState("");
    const [noScanners, setNoScanners]           = useState(false);
    const [selectedScanner, setSelectedScanner] = useState(null);
    const [processing, setProcessing]           = useState(false);
    const [apiUnreachable, setApiUnreachable]   = useState(false);
    const [fileUploadError, setFileUploadError] = useState("");
    const [previewVisible, setPreviewVisible]   = useState(true);

    const hasPreview = !!uploadedFile;
    const isTwoPanel = hasPreview && previewVisible;

    const fetchScanners = async () => {
        setLoading(true); setNoScanners(false); setApiUnreachable(false);
        setScanners([]); setSessionId("");
        try {
            // ── Simulated API response ──
            await new Promise(r => setTimeout(r, 900));
            setSessionId("639074537916572448");
            setScanners([{ id: 0, name: "Canon G3020 series" }]);
        } finally {
            setLoading(false);
        }
    };

    const processScanner = async (sid, name) => {
        // ── Simulated scan: fetch the imported local PDF as a blob ──
        await new Promise(r => setTimeout(r, 1200)); // mimic scan duration
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load simulated scan file: ${res.status}`);
        const blob = await res.blob();
        const scannedFile = new File([blob], `ScannedDocument_${sid}.pdf`, { type: "application/pdf" });
        setUploadedFile(scannedFile);
        setFileUploadError("");
        setPreviewVisible(true);
    };

    // previewScannedDocument is unused in simulation mode — kept for easy revert to real API
    // eslint-disable-next-line no-unused-vars
    const previewScannedDocument = async (sid) => {
        try {
            const res = await axios.get(`http://localhost:5005/api/Scanners/\${sid}`,
                { responseType: "blob", headers: { Accept: "*/*" }, timeout: 0 });
            const ct = res.headers["content-type"]?.split(";")[0].trim() || "application/octet-stream";
            const extMap = {
                "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png",
                "application/msword": "doc",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
                "text/plain": "txt", "application/octet-stream": "bin",
            };
            setUploadedFile(new File([new Blob([res.data], { type: ct })], `ScannedDocument_\${sid}.\${extMap[ct] || "bin"}`, { type: ct }));
            setFileUploadError(""); setPreviewVisible(true);
        } catch {
            setFileUploadError("Failed to load scanned document. Please try again.");
            setUploadedFile(null);
        }
    };

    const handleSelectScanner = async (scanner) => {
        if (processing) return;
        setSelectedScanner(scanner); setProcessing(true); setUploadedFile(null);
        try { await processScanner(sessionId, scanner.name); }
        catch { /* keep selection */ }
        finally { setProcessing(false); }
    };

    const handleClose = () => {
        onClose(); setSelectedScanner(null); setProcessing(false);
        setApiUnreachable(false); setUploadedFile(null); setPreviewVisible(true);
    };

    useEffect(() => { if (open) fetchScanners(); }, [open]);

    return (
        <>
            <style>{KEYFRAMES}</style>
            <Dialog open={open} fullWidth maxWidth={isTwoPanel ? "lg" : "sm"}
                PaperProps={{ sx: {
                    height: isTwoPanel ? { xs: "100dvh", sm: "90vh", md: "85vh" } : { xs: "100dvh", sm: "auto" },
                    maxHeight: { xs: "100dvh", sm: "92vh" },
                    borderRadius: { xs: 0, sm: "12px" },
                    m: { xs: 0, sm: 2 },
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)",
                }}}>

                {/* ── Header ── */}
                <DialogTitle sx={{
                    backgroundImage: `${D.scanLine}, linear-gradient(135deg, ${D.navy} 0%, ${D.navyLight} 100%)`,
                    color: "#fff", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    px: { xs: 2, sm: 2.5 }, py: 1.5,
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box sx={{
                            width: 34, height: 34, borderRadius: "8px",
                            backgroundColor: alpha("#fff", 0.12),
                            border: `1px solid ${alpha("#fff", 0.2)}`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <MdOutlineScanner size={18} color="#fff" />
                        </Box>
                        <Box>
                            <Typography sx={{ color: "#fff", fontSize: { xs: 13, sm: 14 }, fontWeight: 700, lineHeight: 1.2 }}>
                                Select Scanner
                            </Typography>
                            <Typography sx={{ color: alpha("#fff", 0.5), fontSize: 11 }}>
                                {loading ? "Searching…" : noScanners ? "No devices found" : `${scanners.length} device${scanners.length !== 1 ? "s" : ""} available`}
                            </Typography>
                        </Box>
                    </Box>

                    {hasPreview && (
                        <Button size="small" onClick={() => setPreviewVisible(v => !v)}
                            startIcon={previewVisible
                                ? <GoSidebarCollapse style={{ fontSize: 14 }} />
                                : <GoSidebarExpand   style={{ fontSize: 14 }} />}
                            sx={{
                                color: alpha("#fff", 0.85), textTransform: "none", fontSize: 12, fontWeight: 500,
                                border: `1px solid ${alpha("#fff", 0.25)}`, borderRadius: "20px", px: 1.5, py: 0.4,
                                "&:hover": { backgroundColor: alpha("#fff", 0.12), color: "#fff" },
                            }}>
                            {previewVisible ? "Hide Preview" : "Show Preview"}
                        </Button>
                    )}
                </DialogTitle>

                {/* ── Body ── */}
                <DialogContent sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", p: 0, minHeight: 0, backgroundColor: D.surface }}>
                    {loading ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, p: 3 }}>
                            <LoadingState />
                        </Box>
                    ) : noScanners ? (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, p: 3 }}>
                            <EmptyState
                                apiUnreachable={apiUnreachable}
                                onRetry={fetchScanners}
                                onDownload={() => window.open(`${constants.office_app_plugin}/api/FilesDownload`, "_blank")}
                            />
                        </Box>
                    ) : (
                        <Grid container sx={{ flex: 1, minHeight: 0, height: "100%" }}>

                            {/* Left — scanner list */}
                            <Grid item xs={12} md={isTwoPanel ? 4 : 12} sx={{
                                display: "flex", flexDirection: "column",
                                height: { xs: "auto", md: "100%" }, minHeight: 0,
                                backgroundColor: "#fff",
                                borderRight: { md: isTwoPanel ? `1px solid ${D.border}` : "none" },
                                borderBottom: { xs: isTwoPanel ? `1px solid ${D.border}` : "none", md: "none" },
                                transition: "all 0.3s ease",
                            }}>
                                <Box sx={{
                                    px: 2, py: 1.25, flexShrink: 0,
                                    borderBottom: `1px solid ${D.border}`,
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: D.textMuted, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                                        Available Devices
                                    </Typography>
                                    <Button size="small" onClick={fetchScanners}
                                        startIcon={<MdRefresh size={13} />}
                                        sx={{
                                            fontSize: 11, textTransform: "none", color: D.textMuted,
                                            py: 0.25, px: 1, minWidth: 0, borderRadius: "6px",
                                            "& .MuiButton-startIcon": { mr: 0.5 },
                                            "&:hover": { backgroundColor: alpha(P, 0.07), color: P },
                                        }}>
                                        Refresh
                                    </Button>
                                </Box>

                                <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0, p: 1.5 }}>
                                    <List dense disablePadding>
                                        {scanners.map((scanner, i) => (
                                            <ScannerListItem key={scanner.id} scanner={scanner} index={i}
                                                isSelected={selectedScanner?.id === scanner.id}
                                                processing={processing} onSelect={handleSelectScanner} />
                                        ))}
                                    </List>
                                </Box>
                            </Grid>

                            {/* Right — preview */}
                            {isTwoPanel && (
                                <Grid item xs={12} md={8} sx={{
                                    display: "flex", flexDirection: "column",
                                    height: { xs: "42vh", sm: "48vh", md: "100%" },
                                    minHeight: { xs: 200, md: 0 },
                                    backgroundColor: "#f1f5f9",
                                }}>
                                    <Box sx={{
                                        px: 2, py: 1.25, flexShrink: 0,
                                        borderBottom: `1px solid ${D.border}`,
                                        backgroundColor: "#fff",
                                        display: "flex", alignItems: "center", gap: 1,
                                    }}>
                                        <HiOutlineDocumentSearch size={15} color={D.textMuted} />
                                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: D.textMuted, textTransform: "uppercase", letterSpacing: "0.7px" }}>
                                            Scanned Document
                                        </Typography>
                                        {uploadedFile && (
                                            <Chip label="Ready" size="small" sx={{
                                                ml: "auto", height: 18, fontSize: 10, fontWeight: 700,
                                                backgroundColor: D.successBg, color: D.success,
                                                border: `1px solid ${D.successBorder}`,
                                                "& .MuiChip-label": { px: 0.75 },
                                            }} />
                                        )}
                                    </Box>
                                    <Box sx={{
                                        flex: 1, minHeight: 0, display: "flex", flexDirection: "column",
                                        overflow: "hidden", m: { xs: 0, md: 1 },
                                        borderRadius: { xs: 0, md: "8px" },
                                        border: `1px solid ${D.border}`,
                                        backgroundColor: "#fff",
                                    }}>
                                        <FileUploadComponent handleFileChange={() => {}} uploadedFile={uploadedFile}
                                            getFileIcon={() => {}} fileUploadError={fileUploadError} />
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>

                {/* ── Footer ── */}
                <DialogActions sx={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    gap: { xs: 1, sm: 0 },
                    px: { xs: 1.5, sm: 2.5 },
                    py: { xs: 1.5, sm: 1.75 },
                    backgroundColor: "#fff",
                    borderTop: `1px solid ${D.border}`,
                }}>
                    <Button onClick={handleClose} variant="outlined"
                        sx={{
                            textTransform: "none", fontSize: 13, borderRadius: "8px",
                            flex: { xs: 1, sm: "none" }, minWidth: { sm: 130 },
                            borderColor: D.borderDark, color: D.textMuted,
                            "&:hover": { borderColor: D.text, color: D.text, backgroundColor: "transparent" },
                        }}>
                        Cancel
                    </Button>

                    {hasPreview && (
                        <Button
                            onClick={() => { fetchItemData(0, "Document"); onClose(); }}
                            variant="contained"
                            startIcon={<VscLibrary size={14} />}
                            sx={{
                                textTransform: "none", fontSize: 13, borderRadius: "8px",
                                flex: { xs: 1, sm: "none" }, minWidth: { sm: 170 },
                                backgroundColor: D.success,
                                "& .MuiButton-startIcon": { mr: 0.75 },
                                boxShadow: `0 2px 8px ${alpha(D.success, 0.32)}`,
                                "&:hover": { backgroundColor: "#15803d", boxShadow: `0 4px 14px ${alpha(D.success, 0.42)}` },
                            }}>
                            Classify Scanned Document
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ScannerDialog;