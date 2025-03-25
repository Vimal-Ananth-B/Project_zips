import React, { useState } from "react";
import { TextField, Button, Typography, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = ({ onClose }) => {
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post("http://localhost:8083/api/v1/forgotPassword", { employeeEmail });
      setMessage("OTP sent successfully! Check your email.");
      
      // Store email in localStorage for use in Reset Password
      localStorage.setItem("resetEmail", employeeEmail);
      
      // Redirect to Reset Password page
      setTimeout(() => {
        navigate("/resetPassword");
      }, 2000);
    } catch (error) {
      setMessage("Error: " + (error.response?.data || "Something went wrong"));
    }
  };

  return (
    <Container>
      <Typography variant="h6">Forgot Password</Typography>
      <TextField
        fullWidth
        label="Enter your email"
        type="email"
        value={employeeEmail}
        onChange={(e) => setEmployeeEmail(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button variant="contained" color="primary" onClick={handleForgotPassword} sx={{ mt: 2 }}>
        Send OTP to Email
      </Button>
      {message && <Typography sx={{ mt: 2, color: "green" }}>{message}</Typography>}
      <Button onClick={() => navigate("/")} sx={{ mt: 1 }}>Back</Button>
    </Container>
  );
};

export default ForgotPassword;