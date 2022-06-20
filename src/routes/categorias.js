const express = require('express');

const router = express.Router();
const categoriasController = require('../controllers/categoriasController');

router.get('/', categoriasController.getAll);
router.get('/byId/:id', categoriasController.getOne);
router.post('/', categoriasController.setOne);
router.put('/byId/:id', categoriasController.putOne);
router.delete('/byId/:id', categoriasController.deleteOne);

module.exports = router;
