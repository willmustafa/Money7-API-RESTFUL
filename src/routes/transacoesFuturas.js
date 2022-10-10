const express = require("express");

const router = express.Router();
const {
  createOne,
  getAll,
  deleteById,
  getById,
  updateById,
} = require("../controllers/transacoesFuturas");

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", createOne);
router.put("/:id", updateById);
router.delete("/:id", deleteById);

module.exports = router;
