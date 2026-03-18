import { useState } from "react";
import api from "../api/client";

const ReceiptModal = ({ receipt, isOpen, onClose, userName, userEmail }) => {
  const [shareEmail, setShareEmail] = useState(userEmail || "");
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const handleShareReceipt = async () => {
    if (!shareEmail) {
      setShareMessage("Please enter an email address.");
      return;
    }

    setIsSharing(true);
    setShareMessage("");

    try {
      await api.post(`/currency/receipts/${receipt.receiptId}/share`, {
        recipientEmail: shareEmail,
      });

      setShareMessage("Receipt shared successfully!");
      setTimeout(() => {
        setShareEmail("");
        setShareMessage("");
      }, 3000);
    } catch (error) {
      setShareMessage(error.response?.data?.message || "Failed to share receipt.");
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen || !receipt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-2xl font-black text-slate-900">Receipt</h2>
          <button
            onClick={onClose}
            className="text-slate-500 transition hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-6">
          {/* Receipt Number */}
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-slate-600">Receipt Number</p>
            <p className="text-lg font-bold text-[#2157d8]">{receipt.receiptNumber}</p>
          </div>

          {/* Exchange Details */}
          <div className="space-y-2 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">You Sent</p>
              <p className="font-semibold text-slate-900">
                {Number(receipt.sourceAmount).toFixed(2)} {receipt.fromCurrency}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">They Received</p>
              <p className="font-semibold text-emerald-700">
                {Number(receipt.convertedAmount).toFixed(2)} {receipt.toCurrency}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Exchange Rate</p>
              <p className="font-semibold text-slate-900">
                1 {receipt.fromCurrency} = {Number(receipt.rate).toFixed(4)} {receipt.toCurrency}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Transfer Fee</p>
              <p className="font-semibold text-slate-900">Free</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs">
            <p className="text-slate-600">
              <strong>Date:</strong> {receipt.exchangeDate}
            </p>
            <p className="mt-1 text-slate-600">
              <strong>Account:</strong> {userName}
            </p>
            <p className="mt-1 text-slate-600">
              <strong>Status:</strong> <span className="text-emerald-700">Completed</span>
            </p>
          </div>

          {/* Share via Email */}
          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">Share Receipt via Email</p>
            <div className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(event) => setShareEmail(event.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#2157d8] focus:outline-none"
              />
              <button
                onClick={handleShareReceipt}
                disabled={isSharing}
                className="rounded-lg bg-[#2157d8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1948b8] disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSharing ? "Sending..." : "Send"}
              </button>
            </div>
            {shareMessage && (
              <p
                className={`mt-2 text-xs font-semibold ${
                  shareMessage.includes("successfully") ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {shareMessage}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              const receiptHTML = `
                Receipt #${receipt.receiptNumber}\n
                ${receipt.sourceAmount} ${receipt.fromCurrency} → ${receipt.convertedAmount} ${receipt.toCurrency}\n
                Rate: 1 ${receipt.fromCurrency} = ${receipt.rate} ${receipt.toCurrency}\n
                Date: ${receipt.exchangeDate}
              `;
              navigator.clipboard.writeText(receiptHTML);
              alert("Receipt copied to clipboard!");
            }}
            className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Copy Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
