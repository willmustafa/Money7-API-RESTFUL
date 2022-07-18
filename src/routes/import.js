const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
const importController = require("../controllers/importController");

router.post(
  "/from-file",
  upload.array("file"),
  importController.importFromFile
);

module.exports = router;
