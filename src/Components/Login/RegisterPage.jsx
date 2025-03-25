import React, { useState , useContext } from "react";
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
import Navbar from '../Navbar/Navbar.jsx';
import Footer from '../Footer/Footer.jsx';





const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ employeeName: "", employeeEmail: "", employeePassword: "", employeeRole: "" });
  const [errors, setErrors] = useState({});
  const theme = useTheme();
  const {loggedIn,
    username,
    setUsername,
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
    closePopup,} = useAuth();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md")); // Check if screen is small
  const { enqueueSnackbar } = useSnackbar();
  const API_BASE_URL_1 = "http://localhost:8083";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const gotoBoard=()=>{
    navigate('/');
  }
  
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const validateForm = (field, value) => {
    let newErrors = { ...errors };


    
    if (field === "employeeName") {
      if (!value.trim()) {
          newErrors.employeeName = "Employee name is required";
      } else if (!/^[A-Za-z]{4,}$/.test(value)) {
          newErrors.employeeName = "Name must be at least 4 characters long and contain only letters";
      } else {
          delete newErrors.employeeName;
      }
  }
  
      if (field === "employeeRole") {
        if (!value.trim()) {
          newErrors.employeeRole = "Employee role is required";
        } else if (/\d/.test(value) || /[^a-zA-Z]/.test(value)) {
          newErrors.employeeRole = "Employee role cannot contain numbers or special characters";
        } else {
          delete newErrors.employeeRole;
        }
      }

    if (field === "employeeEmail") {
      // Allowed email domains (Only popular providers)
      const allowedDomains = [
        "gmail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
        "yahoo.com", "ymail.com", "protonmail.com", "zoho.com", "icloud.com",
        "me.com", "mac.com", "aol.com", "gmx.com", "gmx.net", "mail.com",
        "yandex.com", "yandex.ru"
      ];
      

    // Proper email regex with domain extraction
    const emailRegex = /^[a-zA-Z0-9](?!.*\.{2})[a-zA-Z0-9._%+-]{2,28}[a-zA-Z0-9]@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

    // Match and extract domain
    const match = value.match(emailRegex);
    const emailDomain = match ? match[1].toLowerCase() : "";

    if (!match) {
      newErrors.employeeEmail = "Enter a valid email address";
    } else if (!allowedDomains.includes(emailDomain)) {
      newErrors.employeeEmail = "Email domain not allowed";
    } else {
      delete newErrors.employeeEmail;
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
    setFormData({ ...formData, [name]: value });
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

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (Object.keys(errors).length > 0) return;
    
//     const url = `${DATA_API_BASE_URL}/api/v1/login`;

//     try {
//       console.log("Sending login request to:", url);
//       console.log("Login Data:", formData);
//       const response = await axios.post(url, formData);
//       const token=response.data.token;
//       const user=response.data.user;
//       setEmail(formData.employeeEmail);
//       setPassword(formData.employeePassword);
//       makemelogin(formData.employeeEmail);
//       localStorage.setItem("authToken",token);
//       localStorage.setItem("email",formData.employeeEmail);
//       localStorage.setItem("user",JSON.stringify(user));
//       console.log(token);
//       console.log("Login Response:", response);
//       alert("Login successful");
//       navigate("/home"); // Move to BoardPage
//     } catch (error) {
//       console.error("Login Error:", error);
//       alert(error.response?.data?.message || "Login failed");
//     }
//   };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;

    const url = `${AUTH_API_BASE_URL}/api/v1/register`;

    try {
      console.log("Sending register request to:", url);
      console.log("Register Data:", formData);
      const response = await axios.post(url, formData);

      console.log("Register Response:", response);
      if (formData.employeeRole.toLowerCase() === "admin" || formData.employeeRole.toLowerCase() === "Admin") {
        alert("New Admin registered successfully!");
    } else {
        alert("New Employee added successfully!");
    }
      enqueueSnackbar(
        formData.employeeRole.toLowerCase() === "admin" || "Admin"
          ? "New Admin registered successfully!"
          : "New Employee added successfully!",
        { variant: "success" }
      );
      // alert("Registration successful");
      navigate("/home"); // Move to LoginPage after registration
    } catch (error) {
      console.error("Register Error:", error);
      // alert(error.response?.data?.message || "Registration failed");
      enqueueSnackbar("Registration failed", { variant: "error" });
      alert(error.response?.data || "Registration failed");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      window.open("http://localhost:8083/api/v1/auth/google", "_self"); 
      // Update with your actual backend API endpoint for Google OAuth
    } catch (error) {
      console.error("Google Signup Failed:", error);
      alert("Failed to sign up with Google.");
    }
  };
 

  return (
    <>
    <Navbar/>
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
            : "row-reverse",
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
          
        </Grid>

        {/* Form Section */}
        <Grid item xs={12} md={6} sx={{ padding: 5, display: "flex", justifyContent: "center", alignItems: "center", height: isSmallScreen ? "50vh" : "100vh", width: "100vw", bgcolor: "white" }}>
          <Box sx={{ width: "100vw", maxWidth: 400, transition: "opacity 0.4s ease-in-out, transform 0.5s ease-in-out" }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center">Registration</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{color:'white',zIndex:1}}>
            Welcome...!
          </Typography>
            <Box component="form" sx={{ mt: 3 }} onSubmit={handleRegister}>
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
              <TextField
                  label="Name"
                  name="employeeName"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={!!errors.employeeName}
                  helperText={errors.employeeName}
                  value={formData.employeeName}
                  onChange={handleChange}
                />
                {/* <TextField
                  label="Role"
                  name="employeeRole"
                  variant="outlined"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={!!errors.employeeRole}
                  helperText={errors.employeeRole}
                  value={formData.employeeRole}
                  onChange={handleChange}
                /> */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select name="employeeRole" value={formData.employeeRole} onChange={handleChange}>
                  <MenuItem value="admin">admin</MenuItem>
                  <MenuItem value="employee">employee</MenuItem>
                </Select>
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
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.5 }} disabled={Object.keys(errors).length > 0}>
                Sign Up
              </Button>
          
            </Box>
          </Box>
        </Grid>
      </Paper>
    </Container>
    <Footer/>
    </>
  );
};

export default AuthPage;
