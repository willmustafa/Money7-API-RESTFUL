const sequelize = require('sequelize')
const Instituicoes = require('../models/InstituicoesModel')

const getAll = (req, res) => {
	Instituicoes.findAll({
		attributes: ['id_instituicao', 'nome', 'cor', 'icone'],
		where: {
			nome: {
				[sequelize.Op.ne]: 'Objetivos'
			}
		}
	}).then((data) => res.json(data))
		.catch((err) => res.status(400).json(err))
}

const getOne = (req, res) => {
	Instituicoes.findByPk(req.params.id).then((data) => res.json(data))
		.catch((err) => res.status(400).json(err))
}

const setOne = (req, res) => {
	Instituicoes.create({
		nome: req.body.nome,
		cor: req.body.cor,
		icone: req.body.icone
	}).then((data) => res.json(data))
		.catch((error) => res.status(400).json(error))
}

const putOne = (req, res) => {
	Instituicoes.update({
		nome: req.body.nome,
		cor: req.body.cor,
		icone: req.body.icone
	}, {
		where: {
			id_instituicao: req.params.id,
		},
	}).then((data) => res.json(data))
		.catch((error) => res.status(400).json(error))
}

const deleteOne = (req, res) => {
	Instituicoes.destroy({
		where: {
			id_instituicao: req.params.id,
		},
	}).then((data) => res.json(data))
		.catch((error) => res.status(400).json(error))
}

module.exports = {
	getAll,
	getOne,
	setOne,
	putOne,
	deleteOne,
}
