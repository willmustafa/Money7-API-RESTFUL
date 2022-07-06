const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Users = require('../models/UsersModel')

const login = async (req, res) => {
	const { user, pwd } = req.body
	if (!user || !pwd) return res.status(400).json({ 'message': 'Username and password are required.' })

	const foundUser = await Users.findOne({ where: {email: user }})
	if (!foundUser) return res.sendStatus(401) //Unauthorized 
	// evaluate password 
	const match = await bcrypt.compare(pwd, foundUser.password)
	if (match) {
		// create JWTs
		const accessToken = jwt.sign(
			{
				'UserInfo': {
					'username': foundUser.username,
				}
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: '1d' }
		)
		const refreshToken = jwt.sign(
			{ 'username': foundUser.username },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: '1d' }
		)
		// Saving refreshToken with current user
		foundUser.refreshToken = refreshToken
		const result = await foundUser.save()
		console.log(result)

		// Creates Secure Cookie with refresh token
		res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 })

		// Send authorization roles and access token to user
		res.json({ accessToken })

	} else {
		res.sendStatus(401)
	}
}

const register = (req, res) => {
	const salt = bcrypt.genSalt(10)
	const usr = {
		name: req.body.name,
		email: req.body.email,
		password: bcrypt.hash(req.body.password, salt),
	}
	const createdUser = Users.create(usr)
	res.status(201).json(createdUser)
}

module.exports = {
	login,
	register,
}
