const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
    },
    sourceAmount: {
      type: Number,
      required: true,
    },
    convertedAmount: {
      type: Number,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    fees: {
      type: Number,
      default: 0,
    },
    exchangeDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Receipt", receiptSchema);
