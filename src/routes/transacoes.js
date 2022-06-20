const express = require('express');

const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAll);
router.get('/byId/:id', transactionController.getOne);
router.post('/', transactionController.setOne);
router.put('/byId/:id', transactionController.putOne);
router.delete('/byId/:id', transactionController.deleteOne);

router.get('/somaMes', transactionController.getSomaMes);
router.get('/balancoMensal', transactionController.getBalancoMensal);
router.get('/gastosReceitasMensal', transactionController.getGastosReceitasMensal);
router.get('/despesaCategoria', transactionController.getDespesaCategoria);
router.get('/receitaCategoria', transactionController.getReceitaCategoria);
router.get('/pendencias', transactionController.getPendencias);

module.exports = router;
