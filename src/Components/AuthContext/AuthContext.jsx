import React, { createContext, useContext, useState, useEffect,useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const[username,setUsername]=useState('');
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const [employeeRole, setEmployeeRole] = useState(localStorage.getItem("employeeRole") || ""); // Store employeeRole
  
  const employeeRoleRef = useRef(localStorage.getItem("employeeRole") || ""); 
  const navigate = useNavigate();
  
  const [openPopup, setOpenPopup] = useState(false);
  const [message, setMessage] = useState('');
  const[loggedIn,setLoggedIn]=useState(()=> localStorage.getItem("loggedIn")==="true" ? true : false );

  // Redirect based on employeeRole
  const gotoBoard = () => {
    if (employeeRole === "admin" || employeeRole === "Admin") {
      navigate("/home");
    } else {
      navigate("/employeeProfilePage");
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem("employeeRole");
    console.log("CurrentRole:",storedRole);
    employeeRoleRef.current=storedRole || "";
    if (storedRole) {
      setEmployeeRole(storedRole);
    }
    else
    {
      setEmployeeRole("");
    }
  }, [loggedIn]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user");
    const storedUsername= localStorage.getItem("username");
    const storedRole=localStorage.getItem("employeeRole");
    const token = localStorage.getItem("authToken");
    const currentPath=window.location.pathname;

    console.log("🔍 Checking Local Storage Values:");
    console.log("Email:", storedEmail);
    console.log("Username:", storedUsername);
    console.log("Role:", storedRole);
    console.log("Token:", token);

    if (storedEmail && storedUsername && storedRole && token) {
      setEmail(storedEmail);  // Directly use storedEmail
      setUsername(storedUsername); 
      setEmployeeRole(storedRole);
      setLoggedIn(true);
      // if(storedRole === "admin" || storedRole === "Admin"){
      //   alert("Welcome,Admin!");
      // }
    } else {
      setLoggedIn(false);
      setUsername("");
      setEmployeeRole("");
      localStorage.removeItem("employeeRole");
      const allowedPaths = ["/register", "/forgotPassword", "/resetPassword"];
      setTimeout(() => {
        if (!allowedPaths.includes(currentPath)) {
          navigate("/",{replace:true});
        }
      }, 0);
    }
  }, []);

    // ✅ Ensure employeeRole stays in sync when localStorage changes
    


  const makemelogin=(userEmail,userName,token,employeeRole)=>{

    console.log("🔄 Logging in with Role:", employeeRole);
    setLoggedIn(true);
    localStorage.setItem("loggedIn","true");
    localStorage.setItem("user",userEmail);
    localStorage.setItem("username", userName);
    localStorage.setItem("authToken",token);
    localStorage.setItem("employeeRole",employeeRole);
  console.log("🛠️ Stored Username:", localStorage.getItem("username"));
    console.log("🛠️ Stored Role Immediately:", localStorage.getItem("employeeRole"));
    employeeRoleRef.current=employeeRole;
    setEmail(userEmail);
    setUsername(userName);
    setEmployeeRole(employeeRole);

    setTimeout(() => {
      console.log("✅ Role in LocalStorage after setting:", localStorage.getItem("employeeRole"));
      console.log("✅ Role in variable employeeRole:", employeeRole);
      console.log("Role in useRef :",employeeRoleRef.current);
    }, 100);
  }  

  const makemelogout=()=>{
    setLoggedIn(false);
    setEmail('');
    employeeRoleRef.current="";
    setEmployeeRole("");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("employeeRole");
    navigate('/');
  }

  const closePopup = () => {
    setOpenPopup(false);
    setMessage('');
  };

  return (
    <AuthContext.Provider value={{
      loggedIn,
      gotoBoard,
      employeeRole,
      employeeRoleUseRef:employeeRoleRef.current,
      setEmployeeRole,
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
      closePopup, 
      gotoBoard }}>
      {children}
    </AuthContext.Provider>
  );
};
