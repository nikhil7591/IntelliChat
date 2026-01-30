const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./config/dbConnect');
const bodyParser = require('body-parser');
const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute')
const statusRoute = require('./routes/statusRoute')
const initializeSocket = require('./services/socketService')
const http = require('http')


dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

// CORS configuration - allow frontend origin
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://localhost:3000',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
].filter(Boolean);

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions));

// Middleware 
app.use(express.json()) // use for parse body data
app.use(cookieParser())// parse token on every request
app.use(bodyParser.urlencoded({extended:true})); //

// database connection
if (process.env.MONGO_URI) {
    connectDb();
} else {
    console.log('⚠️  MONGO_URI not found in environment variables. Database connection skipped.');
}

// create server
const server = http.createServer(app);
const io = initializeSocket(server);


// apply socket middleware before routes
app.use((req,res,next)=>{
  req.io = io;
  req.socketUserMap = io.socketUserMap
  next();
})


// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend is running',
        timestamp: new Date().toISOString(),
        env: {
            hasMongoUri: !!process.env.MONGO_URI,
            hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        }
    });
});

// Routes
app.use('/api/auth',authRoute)
app.use('/api/chat',chatRoute)
app.use('/api/status',statusRoute)
// AI routes removed to restore previous simple project state

server.listen(PORT,()=>{
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${corsOptions.origin}`);
    console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
    
    if (!process.env.MONGO_URI) {
        console.log('⚠️  MONGO_URI not configured - database features will not work');
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email credentials (EMAIL_USER, EMAIL_PASS) not configured - OTP email service will not work');
    }
})
