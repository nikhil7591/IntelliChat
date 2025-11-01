// const express = require('express');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const connectDb = require('./config/dbConnect');
// const bodyParser = require('body-parser');
// const authRoute = require('./routes/authRoute')
// const chatRoute = require('./routes/chatRoute')
// const statusRoute = require('./routes/statusRoute')
// const initializeSocket = require('./services/socketService')
// const http = require('http')


// dotenv.config();

// const PORT = process.env.PORT || 8000;
// const app = express();


// const corsOptions = {
//     // Support both correctly spelled FRONTEND_URL and the misspelled FORNTEND_URL
//     origin: process.env.FRONTEND_URL || process.env.FORNTEND_URL || 'http://localhost:3000',
//     credentials: true,
// }
// app.use(cors(corsOptions));

// // Middleware 
// app.use(express.json()) // use for parse body data
// app.use(cookieParser())// parse token on every request
// app.use(bodyParser.urlencoded({extended:true})); //

// // database connection
// if (process.env.MONGO_URI) {
//     connectDb();
// } else {
//     console.log('⚠️  MONGO_URI not found in environment variables. Database connection skipped.');
// }

// // create server
// const server = http.createServer(app);
// const io = initializeSocket(server);


// // apply socket middleware before routes
// app.use((req,res,next)=>{
//   req.io = io;
//   req.socketUserMap = io.socketUserMap
//   next();
// })


// // Health check endpoint
// app.get('/api/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         message: 'Backend is running',
//         timestamp: new Date().toISOString(),
//         env: {
//             hasMongoUri: !!process.env.MONGO_URI,
//             hasTwilioConfig: !!(process.env.TWILLO_ACCOUNT_SID && process.env.TWILLO_AUTH_TOKEN && process.env.TWILLO_SERVICE_SID)
//         }
//     });
// });

// // Routes
// app.use('/api/auth',authRoute)
// app.use('/api/chat',chatRoute)
// app.use('/api/status',statusRoute)
// // AI routes removed to restore previous simple project state

// server.listen(PORT,()=>{
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📱 Frontend URL: ${corsOptions.origin}`);
//     console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
    
//     if (!process.env.MONGO_URI) {
//         console.log('⚠️  MONGO_URI not configured - database features will not work');
//     }
//     if (!process.env.TWILLO_ACCOUNT_SID || !process.env.TWILLO_AUTH_TOKEN || !process.env.TWILLO_SERVICE_SID) {
//         console.log('⚠️  Twilio credentials not configured - SMS OTP will not work');
//     }
// })


const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./config/dbConnect');
const bodyParser = require('body-parser');
const authRoute = require('./routes/authRoute');
const chatRoute = require('./routes/chatRoute');
const statusRoute = require('./routes/statusRoute');
const initializeSocket = require('./services/socketService');
const http = require('http');

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

/* ---------------------- ✅ CORS CONFIGURATION ---------------------- */

// Read origin from env (with fallback)
const rawOrigin =
  process.env.FRONTEND_URL ||
  process.env.FORNTEND_URL || // backup in case of typo
  'http://localhost:3000';

// Remove trailing slash if present
const sanitizedOrigin = rawOrigin.replace(/\/$/, '');

// Allow multiple origins (for local + production)
const allowedOrigins = [
  sanitizedOrigin,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

// Configure CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🚫 Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* ---------------------- ✅ MIDDLEWARES ---------------------- */
app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // Parse cookies (JWT tokens)
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded data

/* ---------------------- ✅ DATABASE CONNECTION ---------------------- */
if (process.env.MONGO_URI) {
  connectDb();
} else {
  console.log('⚠️  MONGO_URI not found in environment variables. Database connection skipped.');
}

/* ---------------------- ✅ SOCKET.IO SERVER ---------------------- */
const server = http.createServer(app);
const io = initializeSocket(server);

// Attach socket instance to all requests
app.use((req, res, next) => {
  req.io = io;
  req.socketUserMap = io.socketUserMap;
  next();
});

/* ---------------------- ✅ HEALTH CHECK ROUTE ---------------------- */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    env: {
      hasMongoUri: !!process.env.MONGO_URI,
      hasTwilioConfig: !!(
        process.env.TWILLO_ACCOUNT_SID &&
        process.env.TWILLO_AUTH_TOKEN &&
        process.env.TWILLO_SERVICE_SID
      ),
    },
  });
});

/* ---------------------- ✅ MAIN ROUTES ---------------------- */
app.use('/api/auth', authRoute);
app.use('/api/chat', chatRoute);
app.use('/api/status', statusRoute);

/* ---------------------- ✅ SERVER START ---------------------- */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);

  if (!process.env.MONGO_URI) {
    console.log('⚠️  MONGO_URI not configured - database features will not work');
  }
  if (
    !process.env.TWILLO_ACCOUNT_SID ||
    !process.env.TWILLO_AUTH_TOKEN ||
    !process.env.TWILLO_SERVICE_SID
  ) {
    console.log('⚠️  Twilio credentials not configured - SMS OTP will not work');
  }
});

