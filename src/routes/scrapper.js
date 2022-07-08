const express = require("express");

const router = express.Router();
const scrapperController = require("../controllers/scrapperController");

router.get("/account-feed", scrapperController.saveAccountFeed);
router.get("/card-feed", scrapperController.saveCartaoFeed);

module.exports = router;
