const express = require("express");

const router = express.Router();
const contasController = require("../controllers/contasController");

router.get("/", contasController.getAll);
router.get("/:id", contasController.getOne);
router.post("/", contasController.setOne);
router.put("/:id", contasController.putOne);
router.delete("/:id", contasController.deleteOne);

module.exports = router;
