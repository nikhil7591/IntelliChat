import { io } from "socket.io-client";
import useUserStore from "../store/useUserStore";

let socket = null;
const token =  localStorage.getItem("auth_token")
export const initializeSocket = () => {
  if (socket) {
    return socket;
  }
  const user = useUserStore.getState().user;
  const BACKEND_URL = process.env.REACT_APP_API_URL;
  socket = io(BACKEND_URL, {
    auth:{token},
    // withCredentials: true,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // connections events
  socket.on("connect", () => {
    console.log("socket connected", socket.id);
    socket.emit("user_connected", user._id);
  });
  socket.on("connect_error", (error) => {
    console.error("socket connection error", error);
  });

  // diconnection event
  socket.on("disconnect", (reason) => {
    console.log("socket disconnected", reason);
  });

  //
  return socket;
};

export const getSocket = ()=>{
    if(!socket){
        return initializeSocket();
    }
    return socket;
}

export const disconnectSocket = ()=>{
    if(socket){
        socket.disconnect();
        socket = null;
    }
}

