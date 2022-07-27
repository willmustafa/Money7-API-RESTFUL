const express = require("express");

const router = express.Router();
const tagsController = require("../controllers/tagsController");

router.get("/", tagsController.getAll);
router.get("/:id", tagsController.getOne);
router.post("/", tagsController.setOne);
router.put("/:id", tagsController.putOne);
router.delete("/:id", tagsController.deleteOne);

module.exports = router;
