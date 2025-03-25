import React, { useState,useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { toast } from "react-hot-toast";
import Navbar from "../Navbar/Navbar";
import { useNavigate,useParams } from "react-router-dom";
import Footer from "../Footer/Footer";

const AUTH_API_BASE_URL = "http://localhost:8083";
const getTaskUrl = (taskId) => `${AUTH_API_BASE_URL}/api/v1/tasks/${taskId}`;
const archiveTaskUrl = (taskId) => `${AUTH_API_BASE_URL}/api/v1/archiveTask/${taskId}`;
const restoreTaskUrl=(taskId) => `${AUTH_API_BASE_URL}/api/v1/restoreTask/${taskId}`;

const RestoreTask = () => {
  const [taskId, setTaskId] = useState(useParams().taskId);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate=useNavigate();

  const handleFetchTask = async () => {
    if (!taskId) {
      toast.error("Please enter a valid Task ID");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Unauthorized: Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(getTaskUrl(taskId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(response.data);
      toast.success("Task fetched successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Task not found");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Unauthorized: Please log in again.");
      return;
    }

    setDeleting(true);
    try {
      await axios.put(restoreTaskUrl(taskId), null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Task restored successfully");
      alert('Task restored Successfully');
      navigate("/home");
      setTask(null);
      setTaskId("");
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to archive task");
      alert("task restoring failed");
    } finally {
      setDeleting(false);
    }
  };

   useEffect(() => {
      if (taskId) {
        setTaskId(taskId); // Set the taskId state
        handleFetchTask(); // Automatically fetch the task
      }
    }, [taskId]);
  
  
    

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" style={{ marginTop: "2rem",minHeight:'80vh' }}>
        <Typography variant="h5" gutterBottom>Restore Task</Typography>

        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <TextField
            label="Enter Task ID"
            type="number"
            variant="outlined"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchTask}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Fetch Task"}
          </Button>
        </div>

        {task && (
          <Card style={{ marginTop: "1rem" }}>
            <CardContent>
              <Typography variant="h6">{task.taskTitle}</Typography>
              <Typography>{task.taskDescription}</Typography>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteTask}
                fullWidth
                style={{ marginTop: "1rem" }}
                disabled={deleting}
              >
                {deleting ? <CircularProgress size={24} /> : "restore & Undo"}
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>
      <Footer/>
    </>
  );
};

export default RestoreTask;