import React, { useState , useContext, useRef } from "react";
import { useAuth } from "../AuthContext/AuthContext";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSnackbar } from "notistack";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  IconButton, InputAdornment,
  MenuItem,
  Select,
  FilledInput,
  FormControl,
  FormHelperText,
  InputLabel
} from "@mui/material";
import { Google, Visibility, VisibilityOff } from "@mui/icons-material";
import {useNavigate} from "react-router-dom";





const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    employeeEmail: "",
    employeePassword: "",
    employeeRole: ""});
  const [errors, setErrors] = useState({});
  const theme = useTheme();
  const {loggedIn,
    username,
    setUsername,
    employeeRole,
    setEmployeeRole,
    email,
    setEmail,
    password,
    setPassword,
    makemelogin,
    makemelogout, 
    openPopup,
    message,
    setMessage,
    setOpenPopup,
    closePopup,
  employeeRoleUseRef} = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // Check if screen is small
  const { enqueueSnackbar } = useSnackbar();
  const API_BASE_URL_1 = "http://localhost:8083";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const gotoBoard=()=>{
    navigate('/home');
  }
  
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = (field, value) => {
    let newErrors = { ...errors };

  //   if (field === "employeeEmail") {
  //     // Allowed email domains (Only popular providers)
  //     const allowedDomains = [
  //       "gmail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
  //       "yahoo.com", "ymail.com", "protonmail.com", "zoho.com", "icloud.com",
  //       "me.com", "mac.com", "aol.com", "gmx.com", "gmx.net", "mail.com",
  //       "yandex.com", "yandex.ru"
  //     ];
      

  //   // Proper email regex with domain extraction
  //   // const emailRegex = /^[a-zA-Z0-9](?!.*\.{2})[a-zA-Z0-9._%+-]{2,28}[a-zA-Z0-9]@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
  //   const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  //   // Match and extract domain
  //   const match = value.toLowerCase().match(emailRegex);
  //   const emailDomain = match ? match[1] : "";

  //   if (!match) {
  //     newErrors.employeeEmail = "Enter a valid email address";
  //   } else if (!allowedDomains.has(emailDomain)) {
  //     newErrors.employeeEmail = `Email domain '${emailDomain}' is not allowed`;
  //   } else {
  //     delete newErrors.employeeEmail;
  //   }
  // }
    
  //   if (field === "employeeName") {
  //     if (!value.trim()) {
  //         newErrors.employeeName = "Employee name is required";
  //     } else if (!/^[A-Za-z]{4,}$/.test(value)) {
  //         newErrors.employeeName = "Name must be at least 4 characters long and contain only letters";
  //     } else {
  //         delete newErrors.employeeName;
  //     }
  // }

  if (field === "employeeEmail") {
    // Allowed email domains (Popular providers)
    const allowedDomains = new Set([
      "gmail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
      "yahoo.com", "ymail.com", "protonmail.com", "zoho.com", "icloud.com",
      "me.com", "mac.com", "aol.com", "gmx.com", "gmx.net", "mail.com",
      "yandex.com", "yandex.ru"
    ]);
  
    // Improved regex: prevents consecutive dots and extracts domain properly
    // const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    const emailRegex = /^[a-zA-Z0-9](?!.*\.{2})[a-zA-Z0-9._%+-]{2,28}[a-zA-Z0-9]@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    const match = value.toLowerCase().match(emailRegex);
    const emailDomain = match ? match[1] : "";
  
    if (!match) {
      newErrors.employeeEmail = "Enter a valid email address";
    } else if (!allowedDomains.has(emailDomain)) {
      newErrors.employeeEmail = `Email domain '${emailDomain}' is not allowed`;
    } else {
      delete newErrors.employeeEmail;
    }
  }

  if (field === "employeeRole") {
    if (!value) {
      newErrors.employeeRole = "Role selection is required";
    } else {
      delete newErrors.employeeRole;
    }
  }
  
  
    if (field === "employeePassword") {
      if (value.length < 6) {
        newErrors.employeePassword = "Password must be at least 6 characters";
      } else {
        delete newErrors.employeePassword;
      }
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating Role ${name} to:`, value); 
    setFormData({ 
      ...formData, 
      [name]: value  // Ensure "role" updates "employeeRole"
    });
    validateForm(name, value);
  };
  

  const AUTH_API_BASE_URL = "http://localhost:8083"; // Auth service
    const DATA_API_BASE_URL = "http://localhost:8082"; // Other service

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (Object.keys(errors).length > 0) return;
    
    
  //   const url = isLogin
  //       ? `${DATA_API_BASE_URL}/api/v1/login`
  //       : `${AUTH_API_BASE_URL}/api/v1/register`; // Use 8083 for authentication
    
  //   const userDataUrl = `${DATA_API_BASE_URL}/api/v1/users`; // Use 8082 for data

  //   //const url = isLogin ? "/api/v1/login" : `${API_BASE_URL}/api/v1/register`;
    
  //   try {
  //     console.log("Sending request to:", url);
  //     console.log("Form data:", formData);
  //     const response = await axios.post(url, formData);
  //     setEmail(formData.employeeEmail);
  //     setUsername(formData.employeeName);
  //     setPassword(formData.employeePassword);
  //     makemelogin();
  //     console.log("Response:", response);
  //     alert(`${isLogin ? "Login" : "Registration"} successful`);
  //     gotoBoard();
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert(error.response?.data?.message || "Something went wrong");
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Validate all fields before proceeding
    let newErrors = {};
    Object.keys(formData).forEach((field) => validateForm(field, formData[field]));

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return; // Stop submission if there are errors
    }
    // if (Object.keys(errors).length > 0) return;
    
    const url = `${DATA_API_BASE_URL}/api/v1/login`;

     // Ensure role is mapped properly
  const requestData = {
    employeeEmail: formData.employeeEmail,
    employeePassword: formData.employeePassword,
    employeeRole: formData.employeeRole  // Ensuring correct key
  };

    try {
      console.log("Sending login request to:", url);
      console.log("Login Data:", formData);
      const response = await axios.post(url, requestData);
      if(response.data.token)
      {
        let token=response.data.token;
        let user = {
          employeeEmail: response.data.email,
          employeeRole: response.data.role || "employee",
        };
  
        console.log("Login Response:", response);
        console.log("User details:", user);
        if (!user) {
          console.error("User data is missing in response:", response.data);
          alert("Login failed: Invalid response from server");
          return;
        }
        console.log("Login Response:", response);
        console.log("User details",user);
        setEmail(user.employeeEmail);
        setEmployeeRole(user.employeeRole);
      setPassword(formData.employeePassword);

      makemelogin(user.employeeEmail, token,user.employeeRole);
      console.log("Login Request Data:", JSON.stringify(formData));
      console.log("Login successfully with token : ",token);

      localStorage.setItem("authToken",token);
      localStorage.setItem("email",user.employeeEmail);
      localStorage.setItem("user",JSON.stringify(user));
      localStorage.setItem("employeeRole",user.employeeRole);
      console.log("Stored Role in Local Storage:", localStorage.getItem("role"));
      
      alert(`Login successfull as ${user.employeeRole}`);
      if ((user.employeeRole.toLowerCase()) === "admin") {
        navigate("/home"); // Redirect to admin page
      } else {
        navigate("/employeeProfilePage"); // Redirect to home for employees
      }
    } else {
      alert("Login failed: Token missing in response");
    }
      
      
       // Move to BoardPage
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.response?.data || "Login failed...Please check your mail and password once");
    }
  };

  // const handleRegister = async (e) => {
  //   e.preventDefault();
  //   if (Object.keys(errors).length > 0) return;

  //   const url = `${AUTH_API_BASE_URL}/api/v1/register`;

  //   try {
  //     console.log("Sending register request to:", url);
  //     console.log("Register Data:", formData);
  //     const response = await axios.post(url, formData);

  //     console.log("Register Response:", response);
  //     alert("Registration successful");
  //     navigate("/login"); // Move to LoginPage after registration
  //   } catch (error) {
  //     console.error("Register Error:", error);
  //     alert(error.response?.data?.message || "Registration failed");
  //   }
  // };
 
  return (
    <Container
      disableGutters
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100vw", 
          height: "100vh",
          display: "flex",
          flexDirection: isSmallScreen
            ? "column-reverse" // Stack top-bottom on small screens
            : "row",
          transition: "all 0.6s ease-in-out", // Smooth transition effect
        }}
      >
        {/* Left/Right Panel (Switching Sides) */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
            position: "relative",
            height: isSmallScreen ? "50vh" : "100vh",
            width: "100vw",
            transition: "all 0.6s ease-in-out", // Smooth transition
          }}
        >
           <video autoPlay loop  muted playsInline style={{zIndex:0,position: 'absolute',top: 0,left: 0,width: '100%', height: '100%', objectFit: 'cover', zIndex: 0}}>
        <source src=".\6563889-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>
          {/* <Typography variant="h4" fontWeight="bold" sx={{color:'black',zIndex:1}}>
            Welcome Back!
          </Typography> */}
        </Grid>

        {/* Form Section */}
        <Grid item xs={12} md={6} sx={{ padding: 5, display: "flex", justifyContent: "center", alignItems: "center", height: isSmallScreen ? "50vh" : "100vh", width: "100vw", bgcolor: "white" }}>
          <Box sx={{ width: "100vw", maxWidth: 400, transition: "opacity 0.4s ease-in-out, transform 0.5s ease-in-out" }}>
          <Typography variant="h4" fontWeight="bold" textAlign="center" color="primary">Your's Kanban</Typography>
          <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{marginTop:'30px'}}>Welcome Back...!</Typography>
            <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{marginTop:'20px'}}>Login</Typography>
            <Box component="form" sx={{ mt: 5 }} onSubmit={handleLogin}>
           
              <TextField
                label="Email"
                name="employeeEmail"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                error={!!errors.employeeEmail}
                helperText={errors.employeeEmail}
                value={formData.employeeEmail}
                onChange={handleChange}
              />
              
               {/* Role Selection */}
               <FormControl fullWidth error={!!errors.employeeRole} sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="employeeRole"
                  value={formData.employeeRole}
                  error={!!errors.employeeRole}
                  helperText={errors.employeeRole || "*Role must be selected*"}
                  onChange={handleChange}
                >
                  <MenuItem value="admin">admin</MenuItem>
                  <MenuItem value="employee">employee</MenuItem>
                </Select>
                {errors.employeeRole && <FormHelperText>{errors.employeeRole}</FormHelperText>}
              </FormControl>
              <TextField
                label="Password"
                name="employeePassword"
                type={showPassword ? "text" : "password"} // Toggle password visibility
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                error={!!errors.employeePassword}
                helperText={errors.employeePassword}
                value={formData.employeePassword}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
                <Typography
                variant="body2"
                color="primary"
                sx={{ textAlign: "right", cursor: "pointer" }}
                onClick={() => navigate("/forgotPassword")} // Redirect to Forgot Password page
              >
                Forgot password?
              </Typography>
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }} disabled={Object.keys(errors).length > 0}>
                Login
              </Button>
            </Box>
          </Box>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AuthPage;
