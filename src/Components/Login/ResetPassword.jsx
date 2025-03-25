import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Retrieve stored email from localStorage
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setEmployeeEmail(storedEmail);
    }
  }, []);

   const handleOtpChange = (index, value) => {
     // Allow only numbers

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to the next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleResetPassword = async () => {
    const formattedOtp = otp.join("");
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:8083/api/v1/resetPassword",
        { employeeEmail, otp: formattedOtp, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage("Password reset successful!");

      // Remove stored email from localStorage
      localStorage.removeItem("resetEmail");

      // Redirect to login page after success
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage("Error: " + (error.response?.data || "Something went wrong"));
    }
  };

  return (
    <Container>
      <Typography variant="h6">Reset Password</Typography>
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={employeeEmail}
        disabled
        sx={{ mt: 2 }}
      />
      <Typography sx={{ mt: 2 }}>Enter OTP</Typography>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
        {otp.map((digit, index) => (
          <TextField
            key={index}
            id={`otp-${index}`}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
            sx={{ width: "40px" }}
          />
        ))}
      </div>
      <TextField
        fullWidth
        label="New Password"
        type={showPassword ? "text" : "password"}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ mt: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        fullWidth
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mt: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button variant="contained" color="primary" onClick={handleResetPassword} sx={{ mt: 2 }}>
        Reset Password
      </Button>
      {message && <Typography sx={{ mt: 2, color: "green" }}>{message}</Typography>}
    </Container>
  );
};

export default ResetPassword;