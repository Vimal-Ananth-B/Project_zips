import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { useNavigate,useParams } from "react-router-dom";
import { toast } from "react-toastify"; 
import { Container, Typography, Card, CardContent, Grid, Alert,Box } from "@mui/material";
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import IconButton from '@mui/material/IconButton';
import Footer from "../Footer/Footer";
const ArchiveTask = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArchivedTasks = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Unauthorized: Please log in again.");
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8083/api/v1/archivedTasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setTasks([...response.data]);
        } else {
          console.error("Invalid data format received:", response.data);
          setError("Invalid data format received");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError("Failed to load archived tasks");
          console.error("Error fetching archived tasks:", error);
        }
      }
    };

    fetchArchivedTasks();
  }, [navigate]);

  console.log("Tasks State:", tasks);
   

  return (
    
    <>
    <Box sx={{
          minHeight: "100vh",
          background: "linear-gradient(to right, #1E293B, #111827)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 3,
        }} >
    <Container sx={{minHeight:'80vh'}}>
      <Navbar />
      <Typography variant="h4" sx={{ mt: 3, mb: 2, textAlign: "center" ,color:'White'}}>
        Archived Tasks
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {tasks.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: "center", width: "100%" }}>
            No archived tasks found.
          </Typography>
        ) : (
          tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {task.title}
                  </Typography>
                  <Typography variant="body2"><strong>ID:</strong> {task.taskId}</Typography>
                  <Typography variant="body2"><strong>Title:</strong> {task.taskTitle}</Typography>
                  <Typography variant="body2"><strong>Description:</strong> {task.taskDescription}</Typography>
                  <Typography variant="body2"><strong>Priority:</strong> {task.taskPriority}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {task.taskStatus}</Typography>
                  <Typography variant="body2"><strong>Comments:</strong> {task.taskComments?.join(", ") || "No comments"}</Typography>
                  <Typography variant="body2"><strong>Assigned Employees:</strong> {task.assignedEmployees?.join(", ") || "None"}</Typography>
                </CardContent>
                <IconButton onClick={() => navigate(`/restoreTask/${task.taskId}`)} color="green">                 
                  <RestoreFromTrashIcon />
                </IconButton>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
    </Box>
    <Footer/>
    
    </>
  );
};

export default ArchiveTask;