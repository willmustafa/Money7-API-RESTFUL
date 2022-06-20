const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function checkDate(body) {
  if (body.hasOwnProperty('date')) {
    if (body.date === undefined || body.date === null) {
      return false;
    }
    return true;
  }
  return true;
}

function authenticate(req) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  checkDate,
  authenticate,
};
