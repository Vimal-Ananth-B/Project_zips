import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import { Link,useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar,Badge, Typography, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Select, Snackbar, Alert,TextField } from "@mui/material";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import SearchTask from "../SearchTask/SearchTask";
import axios from "axios";
import NotificationsIcon from "@mui/icons-material/Notifications";
import searchTaskName from "../../Utils/SearchTaskName";
import TaskDetailsCard from "../Landing/TaskDetailsCard";

const Navbar = ({filter,setFilter,searchText, setSearchText,unreadCount }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { loggedIn, email, makemelogout } = useAuth();
  const [username, setUsername] = useState(""); 

  const navigate=useNavigate();
  // Fetch username using email
  useEffect(() => {
    if (loggedIn && email) {
      const token = localStorage.getItem("authToken"); // Get JWT token
      axios
        .get(`http://localhost:8083/api/v1/employee/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in headers
          },
        })
        .then((response) => {
          setUsername(response.data.employeeName);
        })
        .catch((error) => {
          console.error("Error fetching user name:", error);
          setUsername("User");
        });
    }
  }, [loggedIn, email]);
  

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };


    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleAction = (message) => {
      setSnackbarMessage(message);
      setSnackbarOpen(true);
    };
    
  
    

  return (
    <>
      {/* Navbar */}
      <AppBar position="sticky" sx={{ background: "linear-gradient(to right, #1E293B, #111827)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left: Kanban Title */}
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setIsSidebarOpen(true)}>
            <HiMenu size={30} />
            <Badge color="error" sx={{paddingLeft:'50px'}} onClick={()=> {navigate('/employeeNotifications')}}>
            <NotificationsIcon />
          </Badge>
          </IconButton>
          <Typography variant="h6" component={Link} to="/employeeProfilePage" sx={{ textDecoration: "none", color: "white", fontWeight: "bold", "&:hover": { color: "#60A5FA" } }}>
            Kanban
          </Typography>
          <Box>
          <Typography variant="label">Filter by Priority:</Typography>
          <Select value={filter} onChange={handleFilterChange} sx={{backgroundColor:'white'}}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
          <TextField
            label="Search by Title"
            variant="outlined"
            size="small"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ backgroundColor: "white", ml: 2 }}
          />
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton edge="end" color="inherit" aria-label="menu" onClick={() => setIsMobileMenuOpen(true)} sx={{ display: { xs: "block", md: "none" } }}>
            <HiMenu size={30} />
          </IconButton>

          {/* Right: User Profile or Login Button (Desktop) */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {loggedIn ? (
              <>
                <IconButton onClick={handleMenuOpen} color="inherit">
                  <FaUserCircle size={30} />
                </IconButton>
                <Typography variant="body1" sx={{ color: "white", ml: 1 }}>
                  {username} {/* Displaying the username here */}
                </Typography>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
                  <MenuItem disabled>{email}</MenuItem>
                  <MenuItem onClick={makemelogout} sx={{ color: "red", "&:hover": { backgroundColor: "#F87171", color: "white" } }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Typography component={Link} to="/" sx={{ textDecoration: "none", color: "white", backgroundColor: "#3B82F6", px: 2, py: 1, borderRadius: "4px", "&:hover": { backgroundColor: "#2563EB" } }}>
                Login
              </Typography>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer (for smaller screens) */}
      <Drawer anchor="left" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <List sx={{ width: 250, bgcolor: "#1E293B", height: "100vh", color: "white" }}>
          <ListItem button onClick={() => setIsSidebarOpen(false)} sx={{ justifyContent: "flex-end" }}>
            <HiX size={30} />
          </ListItem>

          <ListItem button onClick={() => {navigate('/employeeProfilePage');
          }}> 
            <ListItemText primary="Home" sx={{ color: "green" }} />
          </ListItem>

          <ListItem button onClick={() => {navigate('/employeeUpdateTask');
          }}> 
            <ListItemText primary="Update Task" sx={{ color: "green" }} />
          </ListItem>

          <ListItem button onClick={() => {navigate('/EmployeeNotifications');
          }}> 
            <ListItemText primary="Notifications" sx={{ color: "green" }} />
          </ListItem>
          

          {loggedIn && (
            <>
              <ListItem>
                <ListItemText primary={email} sx={{ textAlign: "center" }} />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  makemelogout();
                  setIsSidebarOpen(false);
                }}
                sx={{
                  bgcolor: "red",
                  color: "white",
                  "&:hover": { bgcolor: "#DC2626" },
                }}
              >
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}
        </List>
      </Drawer>


         {/* Snackbar */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
      <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
        
    </>
  );
};

export default Navbar;
