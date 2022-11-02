const { BAD_REQUEST, UNAUTHORIZED } = require("http-status-codes").StatusCodes;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../../models/UsersModel");

module.exports = async (req, res, next) => {
  const user = req.bodyString("user");
  const pwd = req.bodyString("pwd");

  if (!user || !pwd)
    return res
      .status(BAD_REQUEST)
      .json({ message: "Username and password are required." });

  let foundUser;
  try {
    foundUser = await Users.findOne({ where: { email: user } });
    if (!foundUser) return res.sendStatus(UNAUTHORIZED);
  } catch (error) {
    return next(error);
  }
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
    res.json({ accessToken, name: foundUser.name });
  } else {
    res.sendStatus(UNAUTHORIZED);
  }
};
