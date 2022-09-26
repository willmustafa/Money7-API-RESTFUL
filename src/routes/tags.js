const express = require("express");

const router = express.Router();
const {
  createOne,
  deleteById,
  getAll,
  getById,
  updateById,
} = require("../controllers/tags");

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", createOne);
router.put("/:id", updateById);
router.delete("/:id", deleteById);

module.exports = router;
