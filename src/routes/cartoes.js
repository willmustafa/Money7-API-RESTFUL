const express = require('express')

const router = express.Router()
const cartoesController = require('../controllers/cartoesController')

router.get('/', cartoesController.getAll)
router.get('/:id', cartoesController.getOne)
router.post('/', cartoesController.setOne)
router.put('/:id', cartoesController.putOne)
router.delete('/:id', cartoesController.deleteOne)

module.exports = router
