const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    sourceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    convertedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
