const express = require('express');

const router = express.Router();
const objetivosController = require('../controllers/objetivosController');

router.get('/', objetivosController.getAll);
router.get('/byId/:id', objetivosController.getOne);
router.post('/', objetivosController.setOne);
router.put('/byId/:id', objetivosController.putOne);
router.delete('/byId/:id', objetivosController.deleteOne);

module.exports = router;
