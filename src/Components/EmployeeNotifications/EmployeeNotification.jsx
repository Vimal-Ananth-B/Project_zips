import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeNavbar from '../EmployeeNavbar/EmployeeNavbar';
import { Box, Paper, Typography, Button, Select, MenuItem  } from "@mui/material";

const AUTH_API_BASE_URL = "http://localhost:8083";
const notificationUrl = `${AUTH_API_BASE_URL}/api/v1/my-notifications`;

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5); // Pagination
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const response = await axios.get(notificationUrl, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;

        console.log("Fetched Notifications:", data);

        if (!Array.isArray(data)) throw new Error("Expected an array but got something else");
        data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(data);

        const unread = data.filter((notif) => !notif.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const truncateText = (text, maxLength = 50) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const loadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter((notif) => notif.changeDescription.toLowerCase().includes(filter));

  return (
    <div>
      <EmployeeNavbar unreadCount={unreadCount}/>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Notifications
        </Typography>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ mb: 2 }}>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="inprogress">In Progress</MenuItem>
          <MenuItem value="research">Research</MenuItem>
        </Select>
        {filteredNotifications.length === 0 ? (
          <Typography variant="body1">No recent notifications</Typography>
        ) : (
          <Box>
            {filteredNotifications.slice(0,visibleCount).map((notif, index) => (
              <Paper
                key={index}
                elevation={3}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: "#f9f9f9",
                  transition: "0.3s",
                  '&:hover': {
                    bgcolor: "#e0f7fa",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)"
                  },
                  borderLeft: notif.read ? "5px solid #4caf50" : "5px solid #f44336",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>{notif.changeDescription || "Update"}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Changed By: {notif.emailId}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Updated at: {new Date(notif.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            ))}
            {visibleCount < filteredNotifications.length && (
              <Button variant="contained" onClick={loadMore} sx={{ mt: 2, bgcolor: "#1976d2", '&:hover': { bgcolor: "#115293" } }}>
                Load More
              </Button>
            )}
          </Box>
        )}
      </Box>
    </div>
  );
};

export default EmployeeNotifications;
