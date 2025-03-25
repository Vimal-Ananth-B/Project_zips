import React from "react";
import {
  Card, CardContent, Typography, IconButton, Modal, Box, LinearProgress, AvatarGroup, Avatar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatDistanceToNow } from 'date-fns';

const TaskDetailsCard = ({ task, onClose }) => {
  if (!task) return null;

  const getProgressColor = (progress) => {
    if (progress <= 40) return "#d32f2f"; // Red for low progress
    if (progress <= 70) return "#ff9800"; // Orange for medium progress
    return "#2e7d32"; // Green for high progress
  };

  const formatRelativeTime = (timestamp) => {
      if (!timestamp) return "Unknown";
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    };
    

  return (
    <Modal open={!!task} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "white",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <IconButton sx={{ position: "absolute", top: 8, right: 8 }} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Card sx={{ boxShadow: 0 }}>
          <CardContent>
            <Typography variant="h5" color="black" fontWeight="bold">
              Id:{task.id} | Title:{task.title}
            </Typography>
            <Typography variant="body1" color="gray" mt={1}>
              Description: {task.description}
            </Typography>
            <Typography variant="subtitle1" color="gray" mt={2}>
              Priority: {task.priority}
            </Typography>
            <Typography variant="subtitle1" color="gray">
              Status: {task.status}
            </Typography>
            <Typography variant="subtitle1" color="gray">
              Progress: {task.progress}%
            </Typography>
            <Typography variant="subtitle1" color="gray">
              Comments: {task.comments}
            </Typography>
            <Typography variant="subtitle1" color="gray" mt={2}>
              Assigned Date:{task.taskAssignedDate}
            </Typography>
            <Typography variant="subtitle1" color="gray" mt={2}>
              Deadline Date:{task.taskDeadlineDate}
            </Typography>
            <Typography variant="subtitle1" color="gray" mt={2}>
              LastCreated:{task.lastCreated ? formatRelativeTime(task.lastCreated) : "null"}
            </Typography>
            <Typography variant="subtitle1" color="gray" mt={2}>
              LastUpdated:{task.lastUpdated ? formatRelativeTime(task.lastUpdated) : "null"}
            </Typography>

            <Typography variant="subtitle1" color="gray" mt={2}>
              Assigned Employees:
            </Typography>

            <AvatarGroup max={4} sx={{ mt: 1 }}>
              {task.employees.map((email, index) => (
                <>
                <React.Fragment key={index}> 
                  <Avatar alt={email}>
                    {email.charAt(0).toUpperCase()}
                  </Avatar>
                </React.Fragment>
                </>
              ))}
            </AvatarGroup>
            {
              task.employees.map((email,index) => (
                <Typography sx={{ color: getProgressColor(task.progress), padding: "4px", borderRadius: "4px",scrollbarWidth:'15px' }}>
                {email}
              </Typography>
              ))
            }
            <Box >
            <LinearProgress
              variant="determinate"
              value={task.progress}
              sx={{
                height: 10,
                mt: 2,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: getProgressColor(task.progress),
                },
              }
              }
              
            />
            <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold", color: "#333" }}>
    {task.progress}% Completed
  </Typography></Box>
          </CardContent>
        </Card>
      </Box>
    </Modal>
  );
};

export default TaskDetailsCard;
