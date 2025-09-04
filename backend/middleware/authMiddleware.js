const response = require("../utils/responseHandler");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authToken = req.cookies?.auth_token;
  if (!authToken) {
    return response(
      res,
      401,
      "authorization token missing. please provide token"
    );
  }
  try {
    const decode = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = decode;
    console.log(req.user);

    next();
  } catch (error) {
    console.error(error);
    return response(res, 401, "Internal or expired token");
  }
};

module.exports = authMiddleware;
