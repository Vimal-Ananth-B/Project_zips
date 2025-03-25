import React, { useEffect, useState } from "react";
import { LinearProgress,CircularProgress, Typography, Box } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

const Analytics = () => {
  const [analyticsTask, setAnalyticsTask] = useState([]);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const token = localStorage.getItem("authToken");
        const role = localStorage.getItem("employeeRole");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }

        const apiUrl = role === "admin" 
        ? "http://localhost:8083/api/v1/tasks" 
        : "http://localhost:8083/api/v1/my-tasks";

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const fetchedTasks = response.data;
        setAnalyticsTask(fetchedTasks);
        calculateCompletionRate(fetchedTasks);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }
    fetchTasks();
  }, []);

  const calculateCompletionRate = (analyticsTask) => {
    const statusWeights = {
      "research": 0.33,
      "in progress": 0.66,
      "testing": 1.0,
      "completed": 1.0,
    };

    let totalCompletion = 0;
    let count = 0;

    analyticsTask.forEach((task) => {
      if (task.taskStatus.toLowerCase() !== "archived") {
        let baseCompletion = statusWeights[task.taskStatus.toLowerCase()] || 0;
        let progressFactor = task.taskProgress / 100;

        // let taskCompletion = baseCompletion * (1 - progressFactor) + 
        //                      (progressFactor * (statusWeights["testing"] || 1.0));
        
        let taskCompletion = baseCompletion + (progressFactor * (1 - baseCompletion));

        totalCompletion += taskCompletion;
        count++;
      }
    });

    setCompletionRate(count > 0 ? (totalCompletion / count) * 100 : 0);

    // const data = [{ name: "Completion Rate", value: completionRate }];
  };


  return (
    <Box
      sx={{
        background: "linear-gradient(to right, #1E293B, #111827)",
        display: "flex",
        minHeight:'0rem',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
      }}
    >
      <Typography variant="h5" sx={{ paddingRight:'50px' ,marginTop:'50px'}}>
        Completion Rate: 
      </Typography>

      {/* Circular Progress Bar */}
      <Box sx={{ width: "20%", textAlign: "center",marginTop:'30px' }}>
      {/* <Box sx={{ position: "relative", display: "inline-flex", mb: 4 }}> */}
        {/* <LinearProgress
          variant="determinate"
          value={completionRate}
          size={100}
          thickness={6}
          sx={{ color: "white",marginTop:'20px' }}
        /> */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          {completionRate.toFixed(2)}%
        </Typography>
         <LinearProgress
          variant="determinate"
          value={completionRate}
          sx={{
            height: 10,
            borderRadius: "5px",
            backgroundColor: "#4B5563",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "white",
            },
          }}
        />
        {/* <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {completionRate.toFixed(2)}%
          </Typography>
        </Box> */}
      </Box>
    </Box>
    // <Box
    //   sx={{
    //     background: "linear-gradient(to right, #1E293B, #111827)",
    //     display: "flex",
    //     flexDirection: "column",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     minHeight: 0, // ✅ Adjusted for correct placement
    //     color: "white",
    //     padding: 3,
    //   }}
    // >
    //   <Typography variant="h5" sx={{ mb: 2 }}>
    //     Task Completion Analytics
    //   </Typography>

    //   {/* Circular Progress Bar */}
    //   <Box sx={{ position: "relative", display: "inline-flex", mb: 4 }}>
    //     <CircularProgress
    //       variant="determinate"
    //       value={completionRate}
    //       size={100}
    //       thickness={6}
    //       sx={{ color: "white" }}
    //     />
    //     <Box
    //       sx={{
    //         position: "absolute",
    //         top: "50%",
    //         left: "50%",
    //         transform: "translate(-50%, -50%)",
    //       }}
    //     >
    //       <Typography variant="h6" fontWeight="bold">
    //         {completionRate.toFixed(2)}%
    //       </Typography>
    //     </Box>
    //   </Box>

    //   {/* Bar Chart for Completion Rate */}
    //   <ResponsiveContainer width="80%" height={250}>
    //     <BarChart data={data}>
    //       <XAxis dataKey="name" stroke="white" />
    //       <YAxis domain={[0, 100]} stroke="white" />
    //       <Tooltip />
    //       <Bar dataKey="value" fill={getProgressColor(completionRate)} barSize={80} />
    //     </BarChart>
    //   </ResponsiveContainer>
    // </Box>
  );
};

export default Analytics;