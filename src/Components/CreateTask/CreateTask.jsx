import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const AUTH_API_BASE_URL = "http://localhost:8083";
const createTaskUrl = `${AUTH_API_BASE_URL}/api/v1/createTask`;
const getAllEmployeesUrl = `${AUTH_API_BASE_URL}/api/v1/getAllEmployees`;

const CreateTask = () => {
  const [taskId] = useState(()=> Math.floor(Math.random() * 1000000000));
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskComments, setTaskComments] = useState("");
  const [employees, setEmployees] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const navigate = useNavigate();
  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  const [assignedDate, setAssignedDate] = useState(todayDate);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const verifyToken = () => {
      const token = localStorage.getItem("authToken");
      console.log(token);
      if (!token) {
        console.error("No authentication token found! Redirecting to login...");
        navigate("/login");
      }
    };
    verifyToken();

    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(getAllEmployeesUrl,
           {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
        console.log('Employees data:',response.data);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      }
    };
    fetchEmployees();
  }, [navigate]);

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

  const handleCreateTask = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found! Redirecting to login...");
      navigate("/login");
      return;
    }
    if (!taskTitle || !taskDescription || assignedEmployees.length < 1 || !deadlineDate) {
      alert("Please fill in all required fields and select at least one employee.");
      return;
    }

    const assigned = new Date(assignedDate);
    const deadline = new Date(deadlineDate);
    const minDeadlineDate = new Date(assigned);
    minDeadlineDate.setDate(minDeadlineDate.getDate() + 2);

    if (assigned < new Date(todayDate)) {
      alert("Assigned date must be today or a future date.");
      return;
    }
    if (deadline <= minDeadlineDate) {
      alert("Deadline date must be at least 2 days ahead of the assigned date.");
      return;
    }

    const taskData = {
      taskId,
      taskTitle,
      taskDescription,
      taskPriority: taskPriority || "Low", // Default Priority
      taskStatus: taskStatus || "todo", // Default Status
      taskProgress: Number(taskProgress), // Convert to number
      taskComments: [taskComments], 
      assignedEmployees,
      taskAssignedDate: assignedDate,
      taskDeadlineDate: deadlineDate,
    };

    console.log("Sending Task Data:", taskData);

    try {
       const response = await axios.post("http://localhost:8083/api/v1/createTask", taskData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        });

      if (response.status === 201) {
        console.log("Task created successfully",response.data);
        alert("Task Created Successfully");
        navigate("/home");
      }
      else
      {
        console.error("Unexpected response:",response);
      }
    } catch (error) {
      console.error("Failed to create task:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.error("Unauthorized! Redirecting to login...");
        navigate("/login");
      } else if (error.response?.data) {
        alert(`Error: ${error.response.data.message || "Failed to create task."}`);
      } else {
        alert("Something went wrong. Please try again.");
      }
    }
  };

  const handleTextOnly = (value) => {
    return value.replace(/[^a-zA-Z ]/g, "");
  };

  return (
    <>
    <Navbar/>
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
    <Container maxWidth="sm" sx={{   p: 4,
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.3)",}}>
    <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: "bold", color: "#1e3c72"  }}>
      Create a New Task
    </Typography>
    <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Task ID"
          value={taskId}
          fullWidth
          disabled
        />
      <TextField
        label="Task Title"
        value={taskTitle}
        error={!!errors.taskTitle}
        helperText={errors.taskTitle || "*Fill Title,Your Title won't be empty*"}
        onChange={(e) => setTaskTitle(handleTextOnly(e.target.value)) && handleInputChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#1e3c72" },
            "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
          },
        }}
        fullWidth
      />
      <TextField
        label="Task Description"
        value={taskDescription}
        error={!!errors.taskDescription}
        helperText={errors.taskDescription || "*Fill Description,Your Description won't be empty*"}
        onChange={(e) => setTaskDescription(handleTextOnly(e.target.value)) && handleInputChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#1e3c72" },
            "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
          },
        }}
        fullWidth
      />

      <FormControl fullWidth    sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={taskPriority}
          error={!!errors.taskPriority}
          helperText={errors.taskPriority || "*Choose TaskStatus,Your status won't be empty*"}
          onChange={(e) => setTaskPriority(e.target.value) && handleInputChange}
        >
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </Select>
        <FormHelperText>*Choose TaskPriority,Your priority won't be empty*</FormHelperText>
         {errors.taskPriority && <Typography color="error">{errors.taskPriority}</Typography>}
      </FormControl>

      <FormControl fullWidth    sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#1e3c72" },
                  "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
                },
              }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={taskStatus}
          onChange={(e) => setTaskStatus(e.target.value) && handleInputChange}
          helperText={"*Choose TaskStatus,Your status won't be empty*"}
          sx={{
            "& .MuiOutlinedInput-root": {
              "&:hover fieldset": { borderColor: "#1e3c72" },
              "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
            },
          }}
        >
          <MenuItem value="todo">To Do</MenuItem>
          <MenuItem value="research">Research</MenuItem>
          <MenuItem value="inprogress">In Progress</MenuItem>
          <MenuItem value="submittedforreview">Submitted for Review</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
        <FormHelperText>*Choose TaskStatus,Your status won't be empty*</FormHelperText>
         {errors.taskStatus && <Typography color="error">{errors.taskStatus}</Typography>}
      </FormControl>

      <TextField
        label="Progress"
        type="number"
        value={taskProgress}
        error={!!errors.taskProgress}
              helperText={!!errors.taskProgress || "Note: Your progress must be o to 100 only"}
        onChange={(e) => {
          let value = Number(e.target.value);
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    setTaskProgress(value);
    handleInputChange
   
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": { borderColor: "#1e3c72" },
      "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
    },
  }}
        fullWidth
        inputProps={{ min: 0, max: 100 }}
      />

      <TextField
        label="Comments"
        value={Array.isArray(taskComments) ? taskComments.join(", ") : taskComments || ""}
        error={!!errors.taskComments}
        helperText={errors.taskComments || "Enter your comments here"}
        onChange={(e) => setTaskComments(e.target.value) && handleInputChange}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": { borderColor: "#1e3c72" },
            "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
          },
        }}
        fullWidth
      />

      {/* Assigned Date */}
      <TextField
            label="Assigned Date"
            type="date"
            value={assignedDate}
            helperText={errors.assignedDate || "Make note that your assigned date won't be in past"}
            onChange={(e) => {
              const newAssignedDate = e.target.value;
              setAssignedDate(newAssignedDate);
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": { borderColor: "#1e3c72" },
      "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
    },
  }}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayDate }}
          />

          {/* Deadline Date with validation */}
          <TextField
            label="Deadline Date"
            type="date"
            value={deadlineDate}
            helperText={errors.deadLineDate || "Your deadline date must be 2days ahead of your assigned date"}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { borderColor: "#1e3c72" },
                "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
              },
            }}
            onChange={(e) => {
              const deadLineDate = e.target.value;
              setDeadlineDate(deadLineDate);
  }}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date(new Date(assignedDate).setDate(new Date(assignedDate).getDate() + 2)).toISOString().split("T")[0] }}
          />

      <FormControl fullWidth  sx={{
      "& .MuiOutlinedInput-root": {
        "&:hover fieldset": { borderColor: "#1e3c72" },
        "&.Mui-focused fieldset": { borderColor: "#1e3c72" },
      },
    }}>
        <InputLabel>Assign Employees (Max 3)</InputLabel>
        <Select
          multiple
          value={assignedEmployees}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 3) setAssignedEmployees(value);
          }}
          renderValue={(selected) => selected.join(", ")}
        >
          {employees.map((employee,index) => (
            <MenuItem key={employee.id || index} value={employee.employeeEmail}>
              <Checkbox checked={assignedEmployees.includes(employee.employeeEmail)} />
              <ListItemText primary={`${employee.employeeName} (${employee.employeeEmail})`} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>*Assign atleast one employee per task*</FormHelperText>
        {errors.assignedEmployees && <Typography color="error">{errors.assignedEmployees}</Typography>}
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleCreateTask} disabled={!taskTitle || !taskDescription || assignedEmployees.length < 1 || !deadlineDate}               sx={{
                backgroundColor: "#1e3c72",
                "&:hover": { backgroundColor: "#2a5298" },
                padding: "12px",
                fontSize: "16px",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              }}
>
        Create Task
      </Button>
      <Typography variant="body2" color="error">
  {(!taskTitle || !taskDescription || assignedEmployees.length < 1 || !deadlineDate) && "Please fill all required fields."}
</Typography>
    </Box>
  </Container>
  </Box>
  <Footer/>
  </>
  );
};

export default CreateTask;
