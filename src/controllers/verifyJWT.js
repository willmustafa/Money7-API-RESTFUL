const { UNAUTHORIZED, FORBIDDEN } = require("http-status-codes").StatusCodes;
const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(UNAUTHORIZED);
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(FORBIDDEN); //invalid token
    req.id = decoded.UserInfo.id;
    next();
  });
};

module.exports = verifyJWT;
