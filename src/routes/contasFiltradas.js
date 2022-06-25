const express = require('express');

const router = express.Router();
const contasController = require('../controllers/contasController');

router.get('/saldoAtualPrevisto', contasController.getSaldoAtualPrevisto);

module.exports = router;
