const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./config/dbConnect');
const bodyParser = require('body-parser');
const authRoute = require('./routes/authRoute')
const chaRoute = require('./routes/chatRoute')
const statusRoute = require('./routes/statusRoute')
const initializeSocket = require('./services/socketService')
const http = require('http')


dotenv.config();

const PORT = process.env.PORT;
const app = express();

// Middleware 
app.use(express.json()) // use for parse body data
app.use(cookieParser())// parse token on every request
app.use(bodyParser.urlencoded({extended:true})); //

// database connection
connectDb();


// create server
const server = http.createServer(app);
const io = initializeSocket(server);

// apply socket middleware before routes
app.use((req,res,next)=>{
  req.io = io;
  req.socketUserMap = io.socketUserMap
  next();
})

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
})); 




// Routes
app.use('/api/auth',authRoute)
app.use('/api/chat',chaRoute)
app.use('/api/status',statusRoute)

server.listen(PORT,()=>{
    console.log(`server running on this port ${PORT} `);
})
