const express = require('express');

const router = express.Router();
const instituicoesController = require('../controllers/instituicoesController');

router.get('/', instituicoesController.getAll);
router.get('/:id', instituicoesController.getOne);
router.post('/', instituicoesController.setOne);
router.put('/:id', instituicoesController.putOne);
router.delete('/:id', instituicoesController.deleteOne);

module.exports = router;
