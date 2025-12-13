import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/user-login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute, PublicRoute } from "./Protected";
import HomePage from "./components/HomePage";
import UserDetails from "./components/UserDetails";
import Status from "./pages/StatusSection/Status";
import Setting from "./pages/SettingSection/Setting";
import useUserStore from "./store/useUserStore";
import { disconnectSocket, initializeSocket } from "./services/chat.service";
import { useChatStore } from "./store/chatStore";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const {user} = useUserStore();
  const {setCurrentUser, initSocketListeners,cleanup} = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownLoader, setHasShownLoader] = useState(false);

  useEffect(()=>{
    // Only show loading screen once on initial app load
    if (!hasShownLoader) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasShownLoader(true);
      }, 2000); // Show loading for 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [hasShownLoader]);

  useEffect(()=>{
    if(user?._id){
      const socket = initializeSocket();
      if(socket){
        setCurrentUser(user);
        initSocketListeners();
      }
    }
    return ()=>{
      cleanup();
      disconnectSocket();
    }
  },[user,setCurrentUser,initSocketListeners,cleanup])

  if (isLoading && !hasShownLoader) {
    return <LoadingScreen onLoadingComplete={() => { setIsLoading(false); setHasShownLoader(true); }} />;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route element={<PublicRoute/>}>
            <Route path="/user-login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute/>}>
            <Route path="/" element={<HomePage />} />
            {/* AI assistant route removed */}
            <Route path="/user-profile" element={<UserDetails />} />
            <Route path="/status" element={<Status />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
