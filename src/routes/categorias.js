const express = require('express')

const router = express.Router()
const categoriasController = require('../controllers/categoriasController')

router.get('/', categoriasController.getAll)
router.get('/:id', categoriasController.getOne)
router.post('/', categoriasController.setOne)
router.put('/:id', categoriasController.putOne)
router.delete('/:id', categoriasController.deleteOne)

module.exports = router
