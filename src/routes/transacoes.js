const express = require('express')

const router = express.Router()
const transactionController = require('../controllers/transactionController')

router.get('/', transactionController.getAll)
router.get('/:id', transactionController.getOne)
router.post('/', transactionController.setOne)
router.put('/:id', transactionController.putOne)
router.delete('/:id', transactionController.deleteOne)

module.exports = router
