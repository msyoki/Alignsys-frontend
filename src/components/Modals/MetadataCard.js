import React from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  Link,
  Paper,
} from "@mui/material";

const MetadataCard = ({ metadata }) => {
  if (!metadata) {
    return (
      <Typography variant="body2" sx={{ color: "#777" }}>
        Select an item to view its metadata.
      </Typography>
    );
  }

  const get = (name) => metadata[name] || "-";

  return (
    <Box
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: "#fff",
        fontSize: 13,
        color: "#333",
      }}
    >
      {/* Header Section */}
      <Typography
        variant="h6"
        sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}
      >
        {get("Vendor Contract Title")}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "#666", fontSize: 13, mb: 2 }}
      >
        {get("Class")}
      </Typography>

      <Divider sx={{ my: 1 }} />

      {/* General Information */}
      <Typography
        variant="subtitle2"
        sx={{
          color: "#555",
          textTransform: "uppercase",
          fontWeight: 600,
          fontSize: 12,
          mb: 1,
        }}
      >
        General Information
      </Typography>

      <Grid container spacing={0.5}>
        <Grid item xs={5}>
          <Typography variant="body2">Document Date</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Document Date.")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Vendor(s)</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Vendor(s)")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Department</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Department")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Expiry / Renewal Date</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Expiry/ Renewal Date")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Notice Period (Months)</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Notice Period (Months)")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Narrative / Purpose</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Narrative/ Purpose")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Sign Now</Typography>
        </Grid>
        <Grid item xs={7}>
          <Link
            href={get("Sign Now")}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{ fontSize: 13 }}
          >
            {get("Sign Now")}
          </Link>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      {/* Review & Status */}
      <Typography
        variant="subtitle2"
        sx={{
          color: "#555",
          textTransform: "uppercase",
          fontWeight: 600,
          fontSize: 12,
          mb: 1,
        }}
      >
        Review & Status
      </Typography>

      <Grid container spacing={0.5}>
        <Grid item xs={5}>
          <Typography variant="body2">Contract Reviewed?</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Contract Reviewed?")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Archive Box</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Archive Box")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Doc Close Date</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Doc Close Date")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Signed?</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Signed?")}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      {/* Workflow Section */}
      <Typography
        variant="subtitle2"
        sx={{
          color: "#555",
          textTransform: "uppercase",
          fontWeight: 600,
          fontSize: 12,
          mb: 1,
        }}
      >
        Workflow
      </Typography>

      <Grid container spacing={0.5}>
        <Grid item xs={5}>
          <Typography variant="body2">Workflow</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Workflow")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">State</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("State")}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.5 }} />

      {/* System Information */}
      <Typography
        variant="subtitle2"
        sx={{
          color: "#555",
          textTransform: "uppercase",
          fontWeight: 600,
          fontSize: 12,
          mb: 1,
        }}
      >
        System Information
      </Typography>

      <Grid container spacing={0.5}>
        <Grid item xs={5}>
          <Typography variant="body2">Created</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Created")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Created by</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Created by")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Last modified</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Last modified")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Last modified by</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Last modified by")}</Typography>
        </Grid>

        <Grid item xs={5}>
          <Typography variant="body2">Accessed by me</Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body2">{get("Accessed by me")}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetadataCard;
