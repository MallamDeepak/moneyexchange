const { fetchLatestRates } = require("../services/currencyService");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Receipt = require("../models/Receipt");
const { applyDefaultWallet, ensureCurrencyInWallet, normalizeWallet } = require("../services/walletService");
const { sendReceiptEmail } = require("../services/mailService");

const generateReceiptNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `RCP-${timestamp}-${random}`;
};

const getLiveRates = async (req, res) => {
  try {
    const base = req.query.base || "USD";
    const data = await fetchLatestRates(base);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch live rates", error: error.message });
  }
};

const getPublicLiveRates = async (req, res) => {
  try {
    const base = req.query.base || "USD";
    const data = await fetchLatestRates(base);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch live rates", error: error.message });
  }
};

const exchangeAmount = async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
      return res.status(400).json({ message: "amount, from and to are required" });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const sourceCurrency = from.toUpperCase();
    const targetCurrency = to.toUpperCase();

    if (sourceCurrency === targetCurrency) {
      return res.status(400).json({ message: "Source and target currencies must be different" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    applyDefaultWallet(user);

    const sourceWalletEntry = ensureCurrencyInWallet(user.wallet, sourceCurrency);
    const targetWalletEntry = ensureCurrencyInWallet(user.wallet, targetCurrency);

    if (sourceWalletEntry.balance < numericAmount) {
      return res.status(400).json({
        message: `Insufficient ${sourceCurrency} balance in wallet`,
      });
    }

    const liveData = await fetchLatestRates(sourceCurrency);
    const rate = liveData.rates[targetCurrency];

    if (!rate) {
      return res.status(400).json({ message: "Target currency not supported" });
    }

    const convertedAmount = Number((numericAmount * rate).toFixed(4));

    sourceWalletEntry.balance = Number((sourceWalletEntry.balance - numericAmount).toFixed(4));
    targetWalletEntry.balance = Number((targetWalletEntry.balance + convertedAmount).toFixed(4));

    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      fromCurrency: sourceCurrency,
      toCurrency: targetCurrency,
      sourceAmount: numericAmount,
      convertedAmount,
      rate,
      date: liveData.date,
    });

    const receiptNumber = generateReceiptNumber();

    const receipt = await Receipt.create({
      user: user._id,
      transaction: transaction._id,
      receiptNumber,
      fromCurrency: sourceCurrency,
      toCurrency: targetCurrency,
      sourceAmount: numericAmount,
      convertedAmount,
      rate,
      fees: 0,
      exchangeDate: liveData.date,
      status: "completed",
    });

    return res.json({
      from: sourceCurrency,
      to: targetCurrency,
      amount: numericAmount,
      rate,
      convertedAmount,
      date: liveData.date,
      wallet: normalizeWallet(user.wallet),
      transaction,
      receipt: {
        receiptNumber: receipt.receiptNumber,
        receiptId: receipt._id,
        status: receipt.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Exchange failed", error: error.message });
  }
};

const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("wallet baseCurrency");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    applyDefaultWallet(user);
    await user.save();

    return res.json({
      baseCurrency: user.baseCurrency,
      wallet: normalizeWallet(user.wallet),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load wallet", error: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load transaction history", error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const { receiptId } = req.params;

    const receipt = await Receipt.findById(receiptId).populate("transaction");
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to view this receipt" });
    }

    return res.json(receipt);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load receipt", error: error.message });
  }
};

const getReceiptHistory = async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(receipts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load receipt history", error: error.message });
  }
};

const shareReceiptViaEmail = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const receipt = await Receipt.findById(receiptId);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    if (receipt.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to share this receipt" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendReceiptEmail(recipientEmail, {
      receiptNumber: receipt.receiptNumber,
      fromCurrency: receipt.fromCurrency,
      toCurrency: receipt.toCurrency,
      sourceAmount: receipt.sourceAmount,
      convertedAmount: receipt.convertedAmount,
      rate: receipt.rate,
      exchangeDate: receipt.exchangeDate,
    }, user.name);

    return res.json({
      message: `Receipt shared successfully with ${recipientEmail}`,
      receiptNumber: receipt.receiptNumber,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to share receipt", error: error.message });
  }
};

module.exports = {
  getLiveRates,
  getPublicLiveRates,
  exchangeAmount,
  getReceipt,
  getReceiptHistory,
  shareReceiptViaEmail,
  getWallet,
  getTransactionHistory,
};
