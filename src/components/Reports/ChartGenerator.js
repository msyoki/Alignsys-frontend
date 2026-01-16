import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography
} from "@mui/material";
import DynamicChart from "./DynamicChart"; import { THEME_COLORS } from '../../constants/themeColors';
// The chart component from previous step


const ChartGenerator = (props) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setChartData(null);
    console.log(  {
          query,
          vaultGuid: props.vaultGuid
        })

    try {
      const response = await axios.post(
        "https://llm.alignsys.tech/chart/invoke",
        {
          query,
          vaultGuid: props.vaultGuid
        },
        {
          headers: { "Content-Type": "application/json", accept: "application/json" }
        }
      );

      if (response.data && response.data.chart) {
        setChartData(response.data);
        console.log("Received chart data:", response.data);
      } else {
        setError("Invalid response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch chart data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontSize: 18 }}>
        Report Generator
      </Typography>
      <div
        className="p-3"
        style={{
          backgroundColor: "#e9f2ff",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "12.8px",
          lineHeight: 1.5,
          color: "#333",
        }}
      >
        <span style={{ color: THEME_COLORS.primary, fontWeight: 500 }}>How it works:  </span>
        Provide a short description of the data or analysis you want to visualize.
        For example: <i>"Show sales by region for the last quarter"</i>.
      </div>



      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Describe Report"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          margin="normal"
          multiline
          minRows={3}
          maxRows={6}
          sx={{
            "& .MuiInputBase-input": {
              fontSize: "13px",   // input text
            },
            "& .MuiInputLabel-root": {
              fontSize: "13px",   // label text
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          size="medium"
          disabled={loading}
          sx={{ mt: 1, bgcolor: THEME_COLORS.primary, "&:hover": { bgcolor: "#456badff" }, textTransform: "none" }}
        >
          {loading ? <CircularProgress size={24} /> : "Generate Report"}
        </Button>
      </form>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {chartData && (
        <Box sx={{ mt: 4 }}>
          <DynamicChart chartData={chartData} />
        </Box>
      )}
    </Box>
  );
};

export default ChartGenerator;
