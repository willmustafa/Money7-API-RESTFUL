const express = require("express");

const router = express.Router();
const objetivosController = require("../controllers/objetivosController");

router.get("/", objetivosController.getAll);
router.get("/:id", objetivosController.getOne);
router.post("/", objetivosController.setOne);
router.put("/:id", objetivosController.putOne);
router.delete("/:id", objetivosController.deleteOne);

module.exports = router;
