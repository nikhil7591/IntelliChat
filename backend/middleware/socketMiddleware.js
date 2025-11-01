const response = require("../utils/responseHandler");
const jwt = require("jsonwebtoken");

const socketMiddleware = (socket, next) => {
 
  const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"]?.split(' ')[1];
  if (!token ) {
    return next(new Error("Authorization token missing. Please provide token"));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decode;
    console.log(socket.user);
    next();

    next();
  } catch (error) {
    console.error(error);
    return next(new Error ("Internal or expired token"));
  }
};

module.exports = socketMiddleware;
