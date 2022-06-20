const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../models/UsersModel');

const login = (req, res) => {
  const user = Users.findOne({ where: { email: req.body.email } });

  if (user) {
    const passwordValid = bcrypt.compare(req.body.password, user.password);

    if (passwordValid) {
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.SECRET,
      );
      res.status(200).json({
        token, name: user.name, email: user.email, id: user.id,
      });
    } else {
      res.status(400).json({ error: 'Password Incorrect' });
    }
  } else {
    res.status(404).json({ error: 'User does not exist' });
  }
};

const register = (req, res) => {
  const salt = bcrypt.genSalt(10);
  const usr = {
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hash(req.body.password, salt),
  };
  const createdUser = Users.create(usr);
  res.status(201).json(createdUser);
};

module.exports = {
  login,
  register,
};
