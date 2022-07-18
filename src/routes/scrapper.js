const express = require("express");

const router = express.Router();
const scrapperController = require("../controllers/scrapperController");

router.get("/account-feed", scrapperController.saveAccountFeed);
router.get("/card-feed", scrapperController.saveCartaoFeed);

router.post("/generate-certificate", scrapperController.generateCertificate);
router.post(
  "/generate-certificate-second",
  scrapperController.generateCertificate_second
);
router.get("/get-feed", scrapperController.getNubankFeed);

module.exports = router;
