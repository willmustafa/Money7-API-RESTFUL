const express = require('express');

const router = express.Router();
const cartoesController = require('../controllers/cartoesController');

router.get('/', cartoesController.getAll);
router.get('/byId/:id', cartoesController.getOne);
router.post('/', cartoesController.setOne);
router.put('/byId/:id', cartoesController.putOne);
router.delete('/byId/:id', cartoesController.deleteOne);

module.exports = router;
