import React, { useState,useEffect } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from "@mui/material";
import { toast } from "react-hot-toast";
import Navbar from "../Navbar/Navbar";
import { useNavigate,useParams } from "react-router-dom";
import Footer from "../Footer/Footer";

const AUTH_API_BASE_URL = "http://localhost:8083";
const getTaskUrl = (taskId) => `${AUTH_API_BASE_URL}/api/v1/tasks/${taskId}`;
const updateTaskUrl = (taskId) => `${AUTH_API_BASE_URL}/api/v1/updateTask/${taskId}`;
const getAllEmployeesUrl = `${AUTH_API_BASE_URL}/api/v1/getAllEmployees`;


const UpdateTask = () => {
  const [taskId, setTaskId] =useState(useParams().taskId);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const navigate=useNavigate();

  const today = new Date().toISOString().split("T")[0];
const fetchEmployees = async () => {
  const token = localStorage.getItem("authToken"); // Ensure token is retrieved
  if (!token) {
    toast.error("Unauthorized: Please log in again.");
    navigate("/login");
    return;
  }

  try {
    const response = await axios.get(getAllEmployeesUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setEmployees(response.data); // Store employees in state
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch employees");
  }
};

useEffect(() => {
  const isValid = validateFields();
  setIsButtonDisabled(!isValid); // Disable button if the form is invalid
}, [task]); // Runs whenever the task state updates


useEffect(() => {
  fetchEmployees();
  if (taskId) {
    handleFetchTask();
  }
}, [taskId]);

  // Fetch all employees when the component mounts
  

  const handleFetchTask = async () => {
    if (!taskId) {
      toast.error("Please enter a valid Task ID");
      return;
    }
  
    const token = localStorage.getItem("authToken"); // Ensure consistency
    if (!token) {
      toast.error("Unauthorized: Please log in again.");
      navigate("/login");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.get(getTaskUrl(taskId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedTask = response.data;

      // Convert date format if needed
      const formattedAssignedDate = fetchedTask.taskAssignedDate?.split("T")[0] || "";
      const formattedDeadlineDate = fetchedTask.taskDeadlineDate?.split("T")[0] || "";
  
      setTask({
        ...fetchedTask,
        taskAssignedDate: formattedAssignedDate,
        taskDeadlineDate: formattedDeadlineDate,
      });
  
      toast.success("Task fetched successfully");
      console.log("Fetched task:",fetchedTask);
    } catch (error) {
      toast.error(error.response?.data?.message || "Task not found");
      alert("Your Task Id is wrong...Check once :)");
    } finally {
      setLoading(false);
    }
  };

  const validateFields = () => {
    const newErrors = {};
    if (!task?.taskTitle) newErrors.taskTitle = "Title is required";
    if (!task?.taskDescription) newErrors.taskDescription = "Description is required";
    if (!task?.taskAssignedDate) newErrors.taskAssignedDate = "Assigned Date is required";
    if (!task?.taskDeadlineDate) newErrors.taskDeadlineDate = "Deadline is required";
    if (!task?.taskPriority) newErrors.taskPriority = "Priority is required";
    if (task?.taskProgress < 0 || task?.taskProgress > 100) newErrors.taskProgress = "Progress must be between 0 and 100";
     // Validate Comments
     if (!task?.taskComments || 
      (typeof task.taskComments !== "string" && !Array.isArray(task.taskComments)) || 
      (typeof task.taskComments === "string" && task.taskComments.trim() === "")) {
    newErrors.taskComments = "Comments are required";
  }
  
  

  // Validate Assigned Employees
  if (!task?.assignedEmployees || task.assignedEmployees.length === 0) {
    newErrors.assignedEmployees = "At least one employee must be assigned";
  }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setTask((prevTask) => {
      const updatedTask = { ...prevTask, [name]: value };
  
      // Validate in real-time
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (value.trim() !== "") {
          delete newErrors[name]; // Remove error if input is valid
        }
        return newErrors;
      });
  
      return updatedTask;
    });
  };
  
  
  const handleEmployeeSelection = (event) => {
    setTask({ ...task, assignedEmployees: event.target.value });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!task) return;
  
    const token = localStorage.getItem("authToken"); // Ensure consistency
    if (!token) {
      toast.error("Unauthorized: Please log in again.");
      alert('UnauthorizedPlease login again');
      navigate("/login");
      return;
    }

    // // **Validation for Assigned Date and Deadline**
    const assignedDate = new Date(task.taskAssignedDate);
    const deadlineDate = new Date(task.taskDeadlineDate);

    if (task.progress < 0 || task.progress > 100) {
      alert("Progress must be between 0 and 100");
      toast.error("Progress must be between 0 and 100");
      return;
    }

    // if (assignedDate < new Date()) {
    //   toast.error("Assigned Date cannot be in the past.");
    //   alert("Assigned Date cannot be in the past.");
    //   return;
    // }

    if ((deadlineDate - assignedDate) / (1000 * 60 * 60 * 24) < 2) {
      toast.error("Deadline must be at least 2 days after the assigned date.");
      alert("Deadline must be at least 2 days after the assigned date.");
      return;
    }
  
    const updatedTaskData = {
      taskId,
      taskTitle: task.taskTitle,
      taskDescription: task.taskDescription,
      taskPriority: task.taskPriority || "Low",
      taskStatus: task.taskStatus || "todo",
      taskProgress: Number(task.taskProgress) || 0,
      taskComments: Array.isArray(task.taskComments) ? task.taskComments : [task.taskComments],
      assignedEmployees: task.assignedEmployees,
      taskAssignedDate: task.taskAssignedDate,  // ✅ Use correct field names
      taskDeadlineDate: task.taskDeadlineDate,  
    };
    console.log("Updating Task Data:", updatedTaskData);
    setUpdating(true);
    try {
      const response = await axios.put(updateTaskUrl(taskId), updatedTaskData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true, 
      });
      console.log("Update Response:", response.data);
      toast.success("Task updated successfully");
      alert("Task updated successfully");
      navigate('/home');
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to update task");
      alert("Failed to update task");
    } finally {
      setUpdating(false);
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
      <Box
              sx={{
                minHeight: "100vh",
                background: "linear-gradient(to right, #1E293B, #111827)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 3,
              }}
            >
      <Container maxWidth="sm" style={{ marginTop: "2rem",minHeight:'80vh', p: 4,
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.3)", }}>
        <Typography variant="h5" gutterBottom sx={{mb: 2, fontWeight: "bold", color: "#1e3c72" }}>Update Task</Typography>

        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <TextField
            label="Enter Task ID"
            type="number"
            variant="outlined"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value) }
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchTask}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#1e3c72" },
                "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Fetch Task"}
          </Button>
        </div>

        {task && (
          <form onSubmit={handleUpdateTask}>
            <TextField
              label="Title"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={task?.taskTitle || ""} 
              error={!!errors.taskTitle}
              helperText={errors.taskTitle}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}
              onChange={(e) => setTask({ ...task, taskTitle: e.target.value }) && handleInputChange}
              required
            />
            <TextField
              label="Description"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={task.taskDescription}
              error={!!errors.taskDescription}
              helperText={errors.taskDescription}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}
              onChange={(e) => setTask({ ...task, taskDescription: e.target.value }) && handleInputChange}
            />

            {/* Assigned Date */}
            <TextField
              label="Assigned Date"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={task.taskAssignedDate || ""}
              error={!!errors.taskAssignedDate}
              helperText={errors.taskAssignedDate}
              onChange={(e) => setTask({ ...task, taskAssignedDate: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}
            />

             {/* Deadline */}
             <TextField
              label="Deadline"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={task.taskDeadlineDate || ""}
              error={!!errors.taskDeadlineDate}
              helperText={errors.taskDeadlineDate}
              onChange={(e) =>{const newDeadline = e.target.value;
                if (new Date(newDeadline) - new Date(task.taskAssignedDate) < 2 * 86400000) {
                  toast.error("Deadline must be at least 2 days after the assigned date.");
                  return;
                }
                setTask({ ...task, taskDeadlineDate: newDeadline });
              }}
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: task.taskAssignedDate ? new Date(new Date(task.taskAssignedDate).getTime() + 2 * 86400000).toISOString().split("T")[0] : today }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}
            />

            <FormControl fullWidth margin="normal"  sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#1e3c72" },
            "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
          },
        }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={task.taskPriority}
                onChange={(e) => setTask({ ...task, taskPriority: e.target.value }) && handleInputChange}
                error={!!errors.taskPriority}
              >
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </Select>
              {errors.taskPriority && <Typography color="error">{errors.taskPriority}</Typography>}
            </FormControl>

            <FormControl fullWidth margin="normal"  sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#1e3c72" },
            "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
          },
        }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={task.taskStatus}
                onChange={(e) => setTask({ ...task, taskStatus: e.target.value }) && handleInputChange}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="research">Research</MenuItem>
                <MenuItem value="inprogress">In Progress</MenuItem>
                <MenuItem value="submittedforreview">Submitted for Review</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
              {errors.taskStatus && <Typography color="error">{errors.taskStatus}</Typography>}
            </FormControl>

            <TextField
              label="Progress"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={task.taskProgress}
              error={!!errors.taskProgress}
              helperText={!!errors.taskProgress}
              onChange={(e) => {
                let value = Math.min(100, Math.max(0, Number(e.target.value))); 
                setTask({...task,taskProgress:value});
                handleInputChange
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}
            />

            <TextField
              label="Comments"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              value={Array.isArray(task?.taskComments) ? task.taskComments.join(", ") : task?.taskComments || ""}
              error={!!errors.taskComments}
              helperText={errors.taskComments || ""}
              onChange={(e) => setTask({ ...task, taskComments: e.target.value })&& handleInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}
            />

<FormControl fullWidth margin="normal"  sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#1e3c72" },
            "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
          },
        }}>
  <InputLabel>Assign Employees</InputLabel>
  <Select
    multiple
    value={task.assignedEmployees || []} // Ensure it's always an array
    onChange={(e) => setTask({ ...task, assignedEmployees: e.target.value }) && handleEmployeeSelection}
    renderValue={(selected) => selected.join(", ")}
  >
    {employees.map((employee, index) => (
      <MenuItem key={employee.id || index} value={employee.employeeEmail}>
        <Checkbox checked={task.assignedEmployees?.includes(employee.employeeEmail) || false} />
        <ListItemText primary={`${employee.employeeName} (${employee.employeeEmail})`} />
      </MenuItem>
    ))}
  </Select>
  {errors.assignedEmployees && <Typography color="error">{errors.assignedEmployees}</Typography>}
</FormControl>



            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: "1rem" }}
              disabled={isButtonDisabled || updating}
              sx={{
                backgroundColor: isButtonDisabled ? "#ccc" : "#1e3c72", 
                "&:hover": {
                  backgroundColor: isButtonDisabled ? "#ccc" : "#1c2e4a",},
                padding: "12px",
                fontSize: "16px",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              }}
            >
              {updating ? <CircularProgress size={24} /> : "Update Task"}
            </Button>
          </form>
        )}
      </Container>
      </Box>
      <Footer/>
    </>
  );
};

export default UpdateTask;