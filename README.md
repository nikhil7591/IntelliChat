# 💬 IntelliChat

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node-dot-js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333?style=for-the-badge&logo=webrtc&logoColor=white)

---

## 🧠 About the Project

**IntelliChat** is a modern **real-time chat web application** built using the **MERN Stack**.  
It provides **secure user authentication**, **live messaging**, **file sharing**, **user status tracking**, and **video calling** — all in one elegant interface.

This project showcases **real-time communication** using **Socket.IO** and **WebRTC**, combined with a responsive **React + Tailwind CSS** frontend and a scalable **Node.js + MongoDB** backend.

---

## 🚀 Features

- 🔐 **JWT-based User Authentication**
- 💬 **Real-time Chat** with Socket.IO
- 👥 **Private and Group Chats**
- 🟢 **User Online/Offline Status**
- 📎 **File and Media Sharing**
- 🎨 **Beautiful Responsive UI (Tailwind CSS)**
- 👤 **User Profile Management**
- 🎥 **One-to-One Video Calling** using WebRTC
- ⚙️ **Optimized RESTful APIs with Express**
- 🧱 **Modular & Maintainable Code Architecture**

---

## 🧩 Project Structure
IntelliChat/
│
├── backend/ # Node.js + Express backend
│ ├── config/ # Environment and database setup
│ ├── controllers/ # Logic for chats, users, messages
│ ├── middleware/ # JWT auth, error handling
│ ├── models/ # MongoDB schemas
│ ├── routes/ # API endpoints
│ ├── services/ # File uploads, socket handlers
│ ├── utils/ # Helper functions
│ └── index.js # Main backend entry file
│
├── frontend/ # React + Tailwind frontend
│ ├── src/ # Components, pages, socket logic
│ ├── public/ # Static assets
│ └── tailwind.config.js
│
└── .gitignore


---

## 🛠️ Tech Stack

**Frontend:**
- ⚛️ React.js  
- 🎨 Tailwind CSS  
- 🌐 Socket.IO Client  
- 🎥 WebRTC API  

**Backend:**
- 🟩 Node.js + Express.js  
- 💾 MongoDB with Mongoose  
- 🔐 JWT Authentication  
- ⚡ Socket.IO for Real-time Events  
- ☁️ Multer / Cloudinary for Media Uploads  

---

## ⚙️ Installation & Setup Guide

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/IntelliChat.git
cd IntelliChat

```
## Backend Setup
```
cd backend
npm install
```

**Create a .env file inside the backend folder:**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Start the backend server:**
```
npm start
```
or
```
npm run dev
```
The backend will run on 👉 http://localhost:5000

## Frontend Setup
```
cd ../frontend
npm install
```

*Create a .env file inside the frontend folder:**
```
VITE_BACKEND_URL=http://localhost:5000
```

**Run the frontend app:**
```
npm run dev
```
The frontend will run on 👉 http://localhost:3000

### 🔄 Real-Time Communication (Socket.IO)

The chat system uses Socket.IO for instant messaging.
Flow:
- A user connects to the Socket.IO server after authentication.
- When a user sends a message, the backend emits a receiveMessage event.
- All connected users in that chat receive the message instantly.
- User typing and online status are updated dynamically.

Event Flow Example:
```
Client → emit('sendMessage', message)
Server → listens for 'sendMessage' → emit('receiveMessage')
Client → listens for 'receiveMessage' → updates chat instantly
```
### 📹 Video Calling (WebRTC)
The one-to-one video call feature is powered by WebRTC, using Socket.IO for signaling.
**WebRTC Flow:**
```
Caller → Create Offer (SDP)
↓
Send via Socket.IO
↓
Callee → Create Answer (SDP)
↓
Exchange ICE Candidates
↓
Live Video Stream Established
```
This enables peer-to-peer media streaming directly between browsers.

### 🗂️ Folder Overview (Backend)
| Folder         | Description                                      |
| -------------- | ------------------------------------------------ |
| `config/`      | MongoDB connection and environment configuration |
| `controllers/` | Logic for user, chat, and message handling       |
| `middleware/`  | JWT authentication and error management          |
| `models/`      | Mongoose models for data storage                 |
| `routes/`      | RESTful API routes                               |
| `services/`    | File upload and socket signaling                 |
| `utils/`       | Helper functions                                 |

### 🎨 Folder Overview (Frontend)
| Folder        | Description                                            |
| ------------- | ------------------------------------------------------ |
| `components/` | UI components (ChatBox, MessageBubble, etc.)           |
| `pages/`      | Application screens (Login, Register, Dashboard, etc.) |
| `contexts/`   | React Context API for global state                     |
| `utils/`      | Helper logic and Socket functions                      |

### 🧑‍💻 Available Scripts
**Backend**
```
npm run dev       # Run in development mode (nodemon)
npm start         # Start production server
```
**Frontend**
```
npm run dev       # Start local development server
npm run build     # Build production-ready frontend
```
### 🧠 Future Enhancements

- 🤖 AI Assistant Integration for Sentiment Analysis
- 🔔 Push Notifications
- 🧑‍🤝‍🧑 Group Video Calls
- 🕵️ End-to-End Message Encryption
- 🌓 Dark & Light Mode Toggle

### 👨‍💻 Author

Nikhil Kumar
B.Tech CSE (AI) | Full Stack Developer | Chat & Web3 Enthusiast

- 📧 Email: nikhil759100@gmail.com
- 🔗 LinkedIn: https://www.linkedin.com/in/nikhil-kumar-2974292a9/
- 💻 GitHub: https://github.com/nikhil7591

### 🪪 License
- This project is licensed under the MIT License.
- You are free to use and modify it with proper attribution.


