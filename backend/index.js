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

const PORT = process.env.PORT;
const app = express();


const corsOptions = {
    origin:process.env.FORNTEND_URL,  // should be FRONTEND_URL
    credentials : true,
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
            hasTwilioConfig: !!(process.env.TWILLO_ACCOUNT_SID && process.env.TWILLO_AUTH_TOKEN && process.env.TWILLO_SERVICE_SID)
        }
    });
});

// Routes
app.use('/api/auth',authRoute)
app.use('/api/chat',chatRoute)
app.use('/api/status',statusRoute)

server.listen(PORT,()=>{
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: http://localhost:8000`);
    console.log(`🔧 Health check: http://localhost:${PORT}/api/health`);
    
    if (!process.env.MONGO_URI) {
        console.log('⚠️  MONGO_URI not configured - database features will not work');
    }
    if (!process.env.TWILLO_ACCOUNT_SID || !process.env.TWILLO_AUTH_TOKEN || !process.env.TWILLO_SERVICE_SID) {
        console.log('⚠️  Twilio credentials not configured - SMS OTP will not work');
    }
})
