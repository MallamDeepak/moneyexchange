import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const initialRecipient = {
  fullName: "",
  email: "",
  country: "United Kingdom",
  currency: "EUR",
  iban: "",
  swift: "",
};

const SendMoneyPage = () => {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [transfer, setTransfer] = useState({ amount: "1000", from: "GBP", to: "EUR" });
  const [wallet, setWallet] = useState([]);
  const [rates, setRates] = useState({});
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const currencies = useMemo(() => {
    const walletCodes = wallet.map((entry) => entry.currency);
    const rateCodes = Object.keys(rates);
    return [...new Set([transfer.from, transfer.to, ...walletCodes, ...rateCodes])].sort();
  }, [rates, transfer.from, transfer.to, wallet]);

  const exchangeRate = rates[transfer.to] || 0;
  const recipientGets = Number(transfer.amount || 0) * Number(exchangeRate || 0);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [walletResponse, ratesResponse] = await Promise.all([
        api.get("/currency/wallet"),
        api.get(`/currency/rates?base=${transfer.from}`),
      ]);

      const nextWallet = walletResponse.data.wallet || [];
      setWallet(nextWallet);
      setRates(ratesResponse.data.rates || {});
      setRateDate(ratesResponse.data.date || "");

      if (nextWallet.length > 0 && !nextWallet.find((entry) => entry.currency === transfer.from)) {
        setTransfer((prev) => ({ ...prev, from: nextWallet[0].currency }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load transfer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await api.get(`/currency/rates?base=${transfer.from}`);
        setRates(response.data.rates || {});
        setRateDate(response.data.date || "");
      } catch (_err) {
        // The page already shows a global error for initial load.
      }
    };

    fetchRates();
  }, [transfer.from]);

  const handleRecipientChange = (event) => {
    const { name, value } = event.target;
    setRecipient((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransferChange = (event) => {
    const { name, value } = event.target;
    setTransfer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await api.post("/currency/exchange", {
        amount: Number(transfer.amount),
        from: transfer.from,
        to: transfer.to,
      });

      setNotice(`Transfer queued for ${recipient.fullName || "recipient"}. Wallet updated successfully.`);
      setTransfer((prev) => ({ ...prev, amount: "" }));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h2 className="text-3xl font-black text-slate-900">Recipient Details</h2>
          <p className="text-sm text-slate-500">Tell us who you are sending money to.</p>
        </div>

        <div className="grid gap-4">
          <label className="text-sm font-semibold text-slate-700">
            Full Legal Name
            <input
              type="text"
              name="fullName"
              value={recipient.fullName}
              onChange={handleRecipientChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              placeholder="e.g. Jane Doe"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Recipient Email (Optional)
            <input
              type="email"
              name="email"
              value={recipient.email}
              onChange={handleRecipientChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              placeholder="jane@example.com"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Country
              <input
                type="text"
                name="country"
                value={recipient.country}
                onChange={handleRecipientChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Currency
              <select
                name="currency"
                value={recipient.currency}
                onChange={handleRecipientChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              >
                {currencies.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            IBAN / Account Number
            <input
              type="text"
              name="iban"
              value={recipient.iban}
              onChange={handleRecipientChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              placeholder="DE00 0000 0000 0000 0000 00"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            BIC / SWIFT Code
            <input
              type="text"
              name="swift"
              value={recipient.swift}
              onChange={handleRecipientChange}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              placeholder="ABCDEFGH"
            />
          </label>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-5">
          <h3 className="text-lg font-bold text-slate-900">Transfer Details</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">
              Amount
              <input
                type="number"
                name="amount"
                value={transfer.amount}
                min="0"
                step="any"
                onChange={handleTransferChange}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              From
              <select
                name="from"
                value={transfer.from}
                onChange={handleTransferChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              >
                {currencies.map((code) => (
                  <option key={`from-${code}`} value={code}>{code}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-700">
              To
              <select
                name="to"
                value={transfer.to}
                onChange={handleTransferChange}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-medium focus:border-[#2157d8] focus:outline-none"
              >
                {currencies.map((code) => (
                  <option key={`to-${code}`} value={code}>{code}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="mt-5 rounded-lg bg-[#2157d8] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#1948b8] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Sending..." : "Continue to Review"}
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black text-slate-900">Transfer Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-500">
              <p>You send</p>
              <p className="font-bold text-slate-900">{Number(transfer.amount || 0).toFixed(2)} {transfer.from}</p>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <p>Total fees</p>
              <p className="font-bold text-emerald-700">Free</p>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <p>Exchange rate</p>
              <p className="font-bold text-slate-900">1 {transfer.from} = {Number(exchangeRate).toFixed(4)} {transfer.to}</p>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-sm font-semibold text-slate-500">Recipient gets</p>
              <p className="text-3xl font-black text-[#2157d8]">{recipientGets.toFixed(2)} {transfer.to}</p>
            </div>
            <p className="text-xs text-slate-400">Market data date: {rateDate || "--"}</p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#d9e3ff] bg-[#f2f6ff] p-4 text-sm text-slate-600">
          <p className="font-bold text-[#2157d8]">Secure Transfers</p>
          <p className="mt-1">Your data is protected with industry-standard encryption and token-based authentication.</p>
        </article>

        {notice && <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
        {error && <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>}
      </aside>
    </div>
  );
};

export default SendMoneyPage;
