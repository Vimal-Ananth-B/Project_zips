// App.jsx
import Landing from './Components/Landing/LandingPage.jsx';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import { AuthProvider, useAuth } from "./Components/AuthContext/AuthContext.jsx";
import LoginPage from './Components/Login/LoginPage.jsx';
import LandingPage from './Components/Landing/LandingPage.jsx';
import RegisterPage from './Components/Login/RegisterPage.jsx';
import CreateTask from './Components/CreateTask/CreateTask.jsx';
import UpdateTask from './Components/UpdateTask/UpdateTask.jsx';
import DeleteTask from './Components/DeleteTask/DeleteTask.jsx';
import RestoreTask from './Components/RestoreTask/RestoreTask.jsx';
import ArchiveTask from './Components/ArchiveTask/ArchiveTask.jsx';
import ResetPassword from './Components/Login/ResetPassword.jsx';
import ForgotPassword from './Components/Login/ForgotPassword.jsx';
import Footer from './Components/Footer/Footer.jsx';
import EmployeeLandingPage from './Components/EmployeeHomePage/EmployeeLandingPage.jsx';
import EmployeeUpdateTask from './Components/EmployeeUpdateTask/EmployeeUpdateTask.jsx';
import AdminNotifications from './Components/AdminNotifications/adminNotifications.jsx';
import EmployeeNotifications from './Components/EmployeeNotifications/EmployeeNotification.jsx';

const RestrictedPage = () => (
  <div style={{ textAlign: "center", padding: "50px", color: "red", fontSize: "20px" }}>
    <h2>Restricted Access</h2>
    <p>You do not have permission to access this page.</p>
  </div>
);

function App() {

  return (
    <BrowserRouter>
    <AuthProvider>
      
        <AuthenticatedRoutes />
      
    </AuthProvider>
    </BrowserRouter>
  );
}

const AuthenticatedRoutes = () => {
  const { loggedIn,employeeRole } = useAuth();
  console.log("🔍 Stored Role in Local Storage:", localStorage.getItem("employeeRole"));
console.log("🔍 State Role in AuthContext:", employeeRole);
  console.log("🔍 LoggedIn:", loggedIn);
  console.log("🔍 Role:", employeeRole); // Now the context is available

  // if(!loggedIn && !employeeRole) return <div>Loading...</div>;
  return (
    <Routes>
      {loggedIn ? (
        <>
        {employeeRole === "admin" || employeeRole === "Admin" ? (
          <>
          <Route path='/home' element={<LandingPage/>}/>
          <Route path="/createTask" element={<CreateTask />} />
          <Route path="/updateTask" element={<UpdateTask />} />
          <Route path="/updateTask/:taskId" element={<UpdateTask />} />
          <Route path="/deleteTask" element={<DeleteTask/>}/>
          <Route path='/archiveTask' element={<ArchiveTask/>}/>
          <Route path='/restoreTask' element={<RestoreTask/>}/>
          <Route path="/adminNotification" element={<AdminNotifications />}/>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/deleteTask/:taskId" element={<DeleteTask />} />
          <Route path="/restoreTask/:taskId" element={<RestoreTask />} />
          </>
        ):(
          <>
          <Route path="/employeeProfilePage" element={<EmployeeLandingPage/>}/> 
          <Route path="/employeeUpdateTask" element={<EmployeeUpdateTask/>}/>
          <Route path='/employeeNotifications' element={<EmployeeNotifications/>}/>
          <Route path="/employeeUpdateTask/:taskId" element={<EmployeeUpdateTask />} />

          {/* ❌ Show Restricted Page if Employee Tries to Access Admin Pages */}
          <Route path="/home" element={<RestrictedPage />} />
              <Route path="/createTask" element={<RestrictedPage />} />
              <Route path="/updateTask/:taskId" element={<RestrictedPage />} />
              <Route path="/deleteTask/:taskId" element={<RestrictedPage />} />
              <Route path="/restoreTask/:taskId" element={<RestrictedPage />} />
              <Route path="/archiveTask" element={<RestrictedPage />} />
              <Route path="/adminNotification" element={<RestrictedPage />} />
              <Route path="/register" element={<RestrictedPage />} />
          </>
        )}
          </>
      ) : (
        <>
          <Route path="/" element={<LoginPage />} />
          <Route path='/resetPassword' element={<ResetPassword/>}/>
          <Route path='/forgotPassword' element={<ForgotPassword/>}/>
          <Route path="*" element={<LoginPage />} /> 
        </>
      )}
    </Routes>
  );
};

export default App;