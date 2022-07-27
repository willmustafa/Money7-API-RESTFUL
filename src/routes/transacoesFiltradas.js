const express = require("express");

const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/somaMes", transactionController.getSomaMes);
router.get("/balancoMensal", transactionController.getBalancoMensal);
router.get(
  "/gastosReceitasMensal",
  transactionController.getGastosReceitasMensal
);
router.get("/despesaCategoria", transactionController.getDespesaCategoria);
router.get("/receitaCategoria", transactionController.getReceitaCategoria);
router.get("/pendencias", transactionController.getPendencias);
router.get("/desempenho", transactionController.getDesempenho);

module.exports = router;
