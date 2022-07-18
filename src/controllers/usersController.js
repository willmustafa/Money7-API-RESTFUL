const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const categoriasInitialData = require("../config/categoriasInitialData");
const Categorias = require("../models/CategoriasModel");
const Users = require("../models/UsersModel");

const login = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const foundUser = await Users.findOne({ where: { email: user } });
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          id: foundUser.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { id: foundUser.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

const register = async (req, res) => {
  let { username, user, pwd } = req.body;
  if (!username || !user || !pwd)
    return res
      .status(400)
      .json({ message: "Username, user, pwd is required." });

  const salt = await bcrypt.genSalt(10);
  pwd = String(pwd.toString());
  const usr = {
    name: username,
    email: user,
    password: await bcrypt.hash(pwd, salt),
  };

  const createdUser = Users.create(usr, { raw: true });

  await Categorias.bulkCreate(
    categoriasInitialData.map((el) => {
      return { ...el, id_users: createdUser.id };
    }),
    {
      ignoreDuplicates: true,
    }
  );
  res.status(201).json(createdUser);
};

module.exports = {
  login,
  register,
};
