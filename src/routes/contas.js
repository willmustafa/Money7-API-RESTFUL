const express = require('express');

const router = express.Router();
const contasController = require('../controllers/contasController');

router.get('/', contasController.getAll);
router.get('/byId/:id', contasController.getOne);
router.post('/', contasController.setOne);
router.put('/byId/:id', contasController.putOne);
router.delete('/byId/:id', contasController.deleteOne);

router.get('/saldoAtualPrevisto', contasController.getSaldoAtualPrevisto);
router.get('/instituicoes', contasController.getAllInstituicoes);

module.exports = router;
