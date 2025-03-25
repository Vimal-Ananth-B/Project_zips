import React, { useState,useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Container, Grid, Card, CardContent, Typography, Box,IconButton} from "@mui/material";
import TaskDetailsCard from "./TaskDetailsCard.jsx";
import Navbar from "../Navbar/Navbar";
import StickyNavbar from "../StickyNavbar/StickyNavbar";
import CreateTask from "../CreateTask/CreateTask";
import { Avatar, AvatarGroup } from "@mui/material";
import md5 from 'md5';
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer/Footer";
import axios from "axios";
import { formatDistanceToNow } from 'date-fns';
import Analytics from "../AnalyticsPage/Analytics.jsx";




const AUTH_API_BASE_URL = "http://localhost:8083"; 
const taskUrl = `${AUTH_API_BASE_URL}/api/v1/tasks`;
const getUpdateUrl = (taskId) => `${AUTH_API_BASE_URL}/api/v1/updateTask/${taskId}`;
const updateTaskUrl = (taskId) => `${AUTH_API_BASE_URL}/api/v1/updateTask/${taskId}`;


const LandingPage = () => {
  const [tasks, setTasks] = useState({
    todo: [],
    research: [],
    inprogress: [],
    submittedforreview: [],
    completed: [],
  });

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [searchText, setSearchText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); 
  const [filter,setFilter]=useState("All");

  useEffect(() => {
    const fetchTasks = async () => {
      try {

        const token = localStorage.getItem("authToken"); // Retrieve the token from storage

      if (!token) {
        console.error("No authentication token found!");
        return;
      }
        const response = await axios.get(taskUrl, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = response.data; // Corrected line

    console.log("Fetched Data:", data);
  
        if (!Array.isArray(data)) throw new Error("Expected an array but got something else");
  
        const tasksByStatus = { todo: [], research: [], inprogress: [], submittedforreview: [], completed: [] };
  
        data.forEach(task => {
          const statusKey = task.taskStatus.replace(/\s/g, "").toLowerCase();
          if (tasksByStatus[statusKey]) {
            tasksByStatus[statusKey].push({
              id: task.taskId.toString(),
              title: task.taskTitle,
              description: task.taskDescription,
              priority: task.taskPriority,
              status: task.taskStatus,
              progress: task.taskProgress,
              comments: task.taskComments,
              employees: task.assignedEmployees,
              taskAssignedDate: task.taskAssignedDate || "not Assigned",
              taskDeadlineDate: task.taskDeadlineDate || "not set",
              lastCreated:task.lastCreated,
              lastUpdated:task.lastUpdated
            });
          }
        });
  
        setTasks(tasksByStatus);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
  
    fetchTasks();
  }, []);

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };
  
  useEffect(() => {
    setFilteredTasks(() => {
      return Object.keys(tasks).reduce((acc, status) => {
        acc[status] = tasks[status].filter(
          (task) =>
            searchText === "" || (task.title && task.title.toLowerCase().includes(searchText.toLowerCase())) // Filter by title
        );
        return acc;
      }, {});
    });
  }, [searchText, tasks]);
 

  

useEffect(() => {
  setFilteredTasks(() => {
    return Object.keys(tasks).reduce((acc, status) => {
      acc[status] = tasks[status].filter(
        (task) => filter === "All" || (task.priority && task.priority.toLowerCase() === filter.toLowerCase())
      );
      return acc;
    }, {});
  });
}, [filter, tasks]);



  const getPriorityColor = (priority) => {
    if (!priority) return "#9E9E9E"; 
    switch (priority.toLowerCase()) {
      case "low": 
        return "#2196F3"; // Blue
      case "medium":
        return "#FFC107"; // Yellow
      case "high": 
        return "#F44336"; // Red
      default: 
        return "#9E9E9E"; // Grey
    }
  };


  const onDragEnd = async (result) => {
    const { source, destination } = result;
  
    if (!destination) return; // Dropped outside a valid column
  
    const sourceColumn = source.droppableId;
    const destinationColumn = destination.droppableId;
  
    if (sourceColumn === destinationColumn) return; // No change in status
  
    // Deep copy the tasks object
    const updatedTasks = JSON.parse(JSON.stringify(tasks));
  
    // Find the moved task
    const movedTaskIndex = updatedTasks[sourceColumn].findIndex((task) => task.id === result.draggableId);
    if (movedTaskIndex === -1) return;
  
    // Copy the moved task details
    const movedTask = { ...updatedTasks[sourceColumn][movedTaskIndex] };
  
    // Remove from the source column
    updatedTasks[sourceColumn].splice(movedTaskIndex, 1);
  
    // Update only the status while keeping other details unchanged
    movedTask.status = destinationColumn; 
    updatedTasks[destinationColumn].push(movedTask);
  
    // Update state
    setTasks(updatedTasks);
  
    // Send an update request to the backend
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(updateTaskUrl(movedTask.id), 
        { 
          taskTitle: movedTask.title,
          taskDescription: movedTask.description,
          taskPriority: movedTask.priority,
          taskProgress: movedTask.progress,
          taskComments: movedTask.comments,
          taskAssignedDate :movedTask.taskAssignedDate,
          taskDeadlineDate :movedTask.taskDeadlineDate,
          lastCreated:movedTask.lastCreated,
          lastUpdated:movedTask.lastUpdated,
          assignedEmployees: movedTask.employees,
          taskStatus: destinationColumn // Only updating the status
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  

  const navigate=useNavigate();

 
  return (
    <>
    <Navbar filter={filter} setFilter={setFilter} searchText={searchText} setSearchText={setSearchText}/>
    <Box sx={{ position: "relative", zIndex: 1 }}>
        <Analytics />
      </Box>
     <Box
            sx={{
              minHeight: "100vh",
              background: "linear-gradient(to right, #1E293B, #111827)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop:0,
              paddingRight:2,
              paddingLeft:2,
              paddingTop:0,
              top: 0,
              left: 0,
              zIndex: 3
            }}
          >
            
    <Container maxWidth="xl" sx={{   p: 4,
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            borderStyle:'double',
            borderWidth:'20px',
            borderColor:'#111827',
            boxShadow: "0px 6px 25px rgba(0, 0, 0, 0.3)",
           // Adjust based on layout
            position: "relative",
            zIndex: 2,
            }}>
    <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          {Object.entries(filteredTasks).map(([status,taskList]) => (
            <Grid item xs={12} sm={6} md={2.4} key={status} style={{padding:'10px'}}> 
             <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", 
    textTransform: "capitalize", 
    letterSpacing: "0.5px", 
    color: "#343a40", 
    borderBottom: "2px solid #1E293B",
    pb: 1 }}>
                  {status.replace(/([A-Z])/g, " $1")}
                </Typography>
                {status === "todo" && (
                  <IconButton color="primary">
                    <AddIcon onClick={() => navigate('/createTask')} />
                  </IconButton>
                )}
              </Box>
              <Droppable droppableId={status}>
                {(provided) => (
                  <Box
                  {...provided.droppableProps}
                      ref={provided.innerRef}
                  sx={{
                    minHeight: 300,
                    p: 2,
                    borderRadius: "12px",
                    background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)", 
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
                    border: status === "Completed" ? "2px solid green" : "none"
                  }}
                >
                  {taskList.map((task,index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                <Card
                ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                  key={task.id}
                          sx={{
                            mb: 2,
                            p:1,
                            bgcolor: getPriorityColor(task.priority),
                            color: task.priority === "Medium" ? "black" : "white",
                            borderRadius: "8px",
                            borderLeft: `5px solid ${getPriorityColor(task.priority)}`, // Left border based on priority
                            boxShadow: "0px 3px 10px rgba(0,0,0,0.2)", 
                            transition: "transform 0.2s ease-in-out",
                            "&:hover": { transform: "scale(1.05)", boxShadow: "0px 5px 15px rgba(0,0,0,0.3)" },
                          }}
                          onClick={() => {
                            console.log("Selected Task",task);
                            setSelectedTask(task);
                          }}
                        >
                          
                          <CardContent sx={{color:'black',fontWeight:'bold'}}>
                            <Typography sx={{fontWeight:'bold',color:'white'}}>Id:{task.id}</Typography>
                            <Typography sx={{ fontWeight: 'bold',color:'white' }}>Title:{task.title}</Typography>
                            <Typography variant="body2" sx={{color:'white'}}>Description:{task.description}</Typography>
                            <Typography variant="body2" sx={{color:'white'}}>Priority:{task.priority}</Typography>
                            <Typography variant="body2" sx={{color:'white'}}>Status:{task.status}</Typography>
                            <Typography variant="body2" sx={{color:'white'}}>Progress:{task.progress}</Typography>
                            {/* <Typography variant="body2" sx={{color:'white'}}>Comments:{task.comments}</Typography> */}
                            {/* <Typography variant="body2" sx={{ color: "white" }}>
                              Assigned Date: {task.taskAssignedDate ? task.taskAssignedDate : "Not Assigned"}
                            </Typography> */}
                            <Typography variant="body2" sx={{ color: "white" }}>
                              Deadline Date: {task.taskDeadlineDate ? task.taskDeadlineDate : "Not Set"}
                            </Typography>
                            {/* <Typography variant="body2" sx={{ color: "white" }}>
                            Last Created:{task.lastCreated ? formatRelativeTime(task.lastCreated) : "null"}
                            </Typography> */}
                            <Typography variant="body2" sx={{ color: "white" }}>
                              Last Updated:{task.lastUpdated ? formatRelativeTime(task.lastUpdated) : "null"}
                            </Typography>
                            {/* Employee Avatars in Top-Right Corner */}
                          <AvatarGroup sx={{bgcolor: getPriorityColor(task.priority)}} max={4}>
                            {(task.employees || []).map((email, index) => (
                              <Avatar sx={{color:"white"}} key={index} alt={email}>
                                {email.charAt(0).toUpperCase()}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                           <Box display="flex" justifyContent="space-between" mt={1}>
                              <IconButton onClick={() => navigate(`/updateTask/${task.id}`)}  sx={{ 
    color: "white", 
    background: "linear-gradient(45deg, #ff9800, #ff5722)", 
    borderRadius: "50%", 
    p: "5px",
    transition: "0.3s",
    "&:hover": { background: "linear-gradient(45deg, #ff5722, #e64a19)" }
  }}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => navigate(`/deleteTask/${task.id}`)} sx={{ 
    color: "white", 
    background: "linear-gradient(45deg, #d32f2f, #b71c1c)", 
    borderRadius: "50%", 
    p: "5px",
    transition: "0.3s",
    "&:hover": { background: "linear-gradient(45deg, #b71c1c, #7f0000)" }
  }}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                       )}
                       </Draggable>
                     ))}
                     {provided.placeholder}
                </Box>
                )}
              </Droppable>
                  
            </Grid>
          ))}
          </Grid>
          </DragDropContext>
    </Container>
     {/* Enlarged Task Display */}
     <TaskDetailsCard
  task={selectedTask}
  onClose={() => setSelectedTask(null)}
  // Pass the update function
/>
    <StickyNavbar/>
    
    </Box>
    <Footer/>
    </>
  );
};



export default LandingPage;
