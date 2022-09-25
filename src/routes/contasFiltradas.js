const express = require("express");

const router = express.Router();
const {
  saldoAtualePrevisto,
  contaseCartoes,
} = require("../controllers/contas");

router.get("/saldoAtualPrevisto", saldoAtualePrevisto);
router.get("/contasCartoes", contaseCartoes);

module.exports = router;
