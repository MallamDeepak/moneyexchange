const express = require("express");
const {
	getLiveRates,
	getPublicLiveRates,
	exchangeAmount,
	getReceipt,
	getReceiptHistory,
	shareReceiptViaEmail,
	getWallet,
	getTransactionHistory,
} = require("../controllers/currencyController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/public-rates", getPublicLiveRates);
router.get("/wallet", authMiddleware, getWallet);
router.get("/transactions", authMiddleware, getTransactionHistory);
router.get("/receipts", authMiddleware, getReceiptHistory);
router.get("/receipts/:receiptId", authMiddleware, getReceipt);
router.post("/receipts/:receiptId/share", authMiddleware, shareReceiptViaEmail);
router.get("/rates", authMiddleware, getLiveRates);
router.post("/exchange", authMiddleware, exchangeAmount);

module.exports = router;
