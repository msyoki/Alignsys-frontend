import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Collapse,
} from "@mui/material";
import {
  ChatBubbleOutline,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";

const TaskMessenger = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [loadingTask, setLoadingTask] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState({}); // Per-task toggle state

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("tasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem("tasks", JSON.stringify(newTasks));
  };

  const formatLocalTime = (isoTime) => {
    if (!isoTime) return "";
    const date = new Date(isoTime);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleFetchStatus = async (task_id) => {
    setSelectedTask(task_id);
    setLoadingTask(task_id);
    try {
      const response = await axios.get(
        `https://llm.alignsys.tech/classification/invoke/status/${task_id}`,
        { headers: { accept: "application/json" } }
      );
      setTaskStatus((prev) => ({ ...prev, [task_id]: response.data }));
    } catch (err) {
      setTaskStatus((prev) => ({
        ...prev,
        [task_id]: { error: "Failed to fetch status" },
      }));
    } finally {
      setLoadingTask(null);
    }
  };

  const handleCloseTask = (task_id) => {
    const updated = tasks.filter((t) => t.task_id !== task_id);
    saveTasks(updated);
    if (updated.length === 0) localStorage.removeItem("tasks");
    setTaskStatus((prev) => {
      const copy = { ...prev };
      delete copy[task_id];
      return copy;
    });
  };

  const toggleExpand = (task_id) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [task_id]: !prev[task_id],
    }));
  };

  const renderTaskStatus = (task_id) => {
    const statusData = taskStatus[task_id];
    if (!statusData) return null;
    if (loadingTask === task_id)
      return (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={22} />
        </Box>
      );

    const status = statusData.status || "unknown";
    const isDone = status.toLowerCase() === "done";

    const dotStyle = {
      width: 10,
      height: 10,
      borderRadius: "50%",
      display: "inline-block",
      marginRight: 8,
      backgroundColor: isDone ? "green" : "red",
    };

    return (
      <Box sx={{ mt: 1, bgcolor: "#fafafa", borderRadius: 2, p: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <span style={dotStyle}></span>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {status.toUpperCase()}
          </Typography>
        </Box>

        {/* Show/Hide Completed Docs per Task */}
        {isDone && statusData.result?.metadata && (
          <>
            <Button
              onClick={() => toggleExpand(task_id)}
              size="small"
              endIcon={
                expandedTasks[task_id] ? <ExpandLess /> : <ExpandMore />
              }
              sx={{
                textTransform: "none",
                color: "#007bff",
                fontWeight: 500,
                px: 0,
              }}
            >
              {expandedTasks[task_id]
                ? "Hide Completed Documents"
                : "Show Completed Documents"}
            </Button>

            <Collapse in={expandedTasks[task_id]}>
              <Box sx={{ mt: 1 }}>
                {statusData.result.metadata.map((entry, index) => {
                  const [title, raw] = Object.entries(entry)[0];
                  const idMatch = raw.match(/"objID":(\d+)/);
                  const id = idMatch ? idMatch[1] : "N/A";
                  return (
                    <Paper
                      key={index}
                      sx={{
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: "#eef6ff",
                        border: "1px solid #cce0ff",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {id}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </Collapse>
          </>
        )}

        {statusData.error && (
          <Typography variant="body2" color="error">
            {statusData.error}
          </Typography>
        )}
      </Box>
    );
  };

  if (tasks.length === 0) return null;

  return (
    <>
      {/* Floating Chat Bubble */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 2000,
        }}
      >
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            bgcolor: "#007bff",
            color: "white",
            width: 60,
            height: 60,
            boxShadow: 4,
            "&:hover": { bgcolor: "#0056b3" },
          }}
        >
          <ChatBubbleOutline />
        </IconButton>

        {open && (
          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              bottom: 70,
              right: 0,
              width: 360,
              borderRadius: 3,
              overflow: "hidden",
              maxHeight: "65vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1,
                bgcolor: "#007bff",
                color: "white",
              }}
            >
              <Typography variant="subtitle1">AI Task Updates</Typography>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{ color: "white" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Task List */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
              {tasks.map((t) => (
                <Paper
                  key={t.task_id}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    bgcolor:
                      selectedTask === t.task_id ? "#f1f9ff" : "white",
                    transition: "all 0.2s",
                    "&:hover": { boxShadow: 2 },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Task ID: {t.task_id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatLocalTime(t.time)}
                  </Typography>

                  <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon fontSize="small" />}
                      onClick={() => handleFetchStatus(t.task_id)}
                      sx={{ textTransform: "none" }}
                    >
                      Check
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      color="error"
                      onClick={() => handleCloseTask(t.task_id)}
                    >
                      Close
                    </Button>
                  </Box>

                  {/* Status Display per Task */}
                  {renderTaskStatus(t.task_id)}
                </Paper>
              ))}
            </Box>

            <Divider />
          </Paper>
        )}
      </Box>
    </>
  );
};

export default TaskMessenger;
