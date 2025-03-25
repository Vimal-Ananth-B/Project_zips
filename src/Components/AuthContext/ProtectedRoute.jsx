// // ProtectedRoute.jsx
// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../AuthContext/AuthContext';

// const ProtectedRoute = ({ children }) => {
//   const { loggedIn } = useAuth();
//   const token = localStorage.getItem('authToken');
//   const currentPath = window.location.pathname;

//   console.log("ProtectedRoute Check:");
//   console.log("loggedIn:", loggedIn);
//   console.log("Token Exists:", !!token);
//   console.log("Current Path:", currentPath);

//   if (!loggedIn || !token) {
//     if(currentPath !== "/register" && currentPath !== "/")
//     {
//         console.log("ProtectedRoute: Blocking access to protected route.");
//         return <Navigate to="/" replace />;
//     }
//   }

//   return children;
// };

// export default ProtectedRoute;
