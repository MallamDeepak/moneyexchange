import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReceiptModal from "../components/ReceiptModal";

const supportedBaseCurrencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "AED", "SGD"];

const formatMoney = (value, currency) => {
  return `${Number(value || 0).toFixed(2)} ${currency}`;
};

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [rates, setRates] = useState({});
  const [exchangeForm, setExchangeForm] = useState({ amount: "", from: "USD", to: "EUR" });
  const [wallet, setWallet] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loadingRates, setLoadingRates] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const currencies = useMemo(() => {
    const walletCurrencies = wallet.map((entry) => entry.currency);
    const list = Object.keys(rates);
    const merged = [baseCurrency, ...walletCurrencies, ...list].map((item) => item.toUpperCase());
    return [...new Set(merged)].sort();
  }, [baseCurrency, rates, wallet]);

  const totalBalance = useMemo(() => {
    return wallet.reduce((sum, entry) => {
      if (entry.currency === baseCurrency) {
        return sum + Number(entry.balance);
      }

      const conversionRate = rates[entry.currency];
      if (!conversionRate || Number(conversionRate) === 0) {
        return sum;
      }

      return sum + Number(entry.balance) / Number(conversionRate);
    }, 0);
  }, [baseCurrency, rates, wallet]);

  const exchangePreview = useMemo(() => {
    if (!exchangeForm.amount || !rates[exchangeForm.to] || exchangeForm.from !== baseCurrency) {
      return 0;
    }

    return Number(exchangeForm.amount) * Number(rates[exchangeForm.to]);
  }, [baseCurrency, exchangeForm.amount, exchangeForm.from, exchangeForm.to, rates]);

  const loadWallet = async () => {
    setLoadingWallet(true);

    try {
      const response = await api.get("/currency/wallet");
      setWallet(response.data.wallet || []);
      if (response.data.baseCurrency) {
        setBaseCurrency(response.data.baseCurrency);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load wallet balances.");
    } finally {
      setLoadingWallet(false);
    }
  };

  const loadTransactions = async () => {
    setLoadingTransactions(true);

    try {
      const response = await api.get("/currency/transactions");
      setTransactions(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load transaction history.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadRates = async () => {
    setLoadingRates(true);

    try {
      const response = await api.get(`/currency/rates?base=${baseCurrency}`);
      setRates(response.data.rates || {});
      setLastUpdated(response.data.date || new Date().toISOString().slice(0, 10));
    } catch (err) {
      setError(err.response?.data?.message || "Could not load live currency rates.");
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    loadRates();
    const intervalId = setInterval(loadRates, 30000);
    return () => clearInterval(intervalId);
  }, [baseCurrency]);

  useEffect(() => {
    loadWallet();
    loadTransactions();
  }, []);

  useEffect(() => {
    if (user?.baseCurrency) {
      setBaseCurrency(user.baseCurrency);
      setExchangeForm((prev) => ({ ...prev, from: user.baseCurrency }));
    }
  }, [user]);

  const handleExchangeChange = (event) => {
    setExchangeForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleExchange = async (event) => {
    event.preventDefault();
    setExchanging(true);
    setError("");

    try {
      const response = await api.post("/currency/exchange", {
        amount: Number(exchangeForm.amount),
        from: exchangeForm.from,
        to: exchangeForm.to,
      });

      setWallet(response.data.wallet || []);
      setTransactions((prev) => [response.data.transaction, ...prev].slice(0, 100));
      updateUser({ ...user, wallet: response.data.wallet || user?.wallet || [] });
      setExchangeForm((prev) => ({ ...prev, amount: "" }));

      if (response.data.receipt) {
        setReceipt(response.data.receipt);
        setIsReceiptModalOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Exchange request failed.");
    } finally {
      setExchanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl bg-gradient-to-r from-[#2157d8] to-[#3570ff] p-6 text-white shadow-lg">
          <p className="text-sm font-semibold text-blue-100">Total Balance</p>
          <h2 className="mt-2 text-5xl font-black tracking-tight">{formatMoney(totalBalance, baseCurrency)}</h2>
          <p className="mt-2 text-sm text-blue-100">Live rates refresh every 30 seconds • Last update {lastUpdated || "--"}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
            <span className="rounded-md bg-white/20 px-3 py-1">{baseCurrency} Primary</span>
            <span className="rounded-md bg-white/20 px-3 py-1">{wallet.length} Wallet Currencies</span>
            <span className="rounded-md bg-white/20 px-3 py-1">{transactions.length} Transfers</span>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Quick Exchange</h3>
          <form onSubmit={handleExchange} className="mt-4 space-y-3">
            <input
              type="number"
              name="amount"
              value={exchangeForm.amount}
              onChange={handleExchangeChange}
              min="0"
              step="any"
              placeholder="Amount"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#2157d8] focus:outline-none"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                name="from"
                value={exchangeForm.from}
                onChange={handleExchangeChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#2157d8] focus:outline-none"
              >
                {currencies.map((code) => (
                  <option key={`from-${code}`} value={code}>{code}</option>
                ))}
              </select>
              <select
                name="to"
                value={exchangeForm.to}
                onChange={handleExchangeChange}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#2157d8] focus:outline-none"
              >
                {currencies.map((code) => (
                  <option key={`to-${code}`} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={exchanging}
              className="w-full rounded-lg bg-[#2157d8] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1948b8] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {exchanging ? "Converting..." : "Convert"}
            </button>
          </form>

          <div className="mt-4 rounded-lg bg-[#f2f5fc] px-3 py-2 text-xs text-slate-600">
            <p>Preview recipient gets:</p>
            <p className="mt-1 text-lg font-black text-[#2157d8]">{formatMoney(exchangePreview, exchangeForm.to)}</p>
          </div>
          <Link to="/dashboard/send" className="mt-3 block text-center text-xs font-semibold text-[#2157d8] hover:text-[#1948b8]">
            Open full transfer flow
          </Link>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900">Recent Activity</h3>
            <Link to="/dashboard/history" className="text-sm font-bold text-[#2157d8] hover:text-[#1948b8]">
              View All
            </Link>
          </div>

          {loadingTransactions ? (
            <p className="text-sm text-slate-500">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transfers yet. Use Send Money to create your first transfer.</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {transaction.fromCurrency} to {transaction.toCurrency}
                    </p>
                    <p className="text-xs text-slate-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">-{formatMoney(transaction.sourceAmount, transaction.fromCurrency)}</p>
                    <p className="text-xs font-semibold text-emerald-700">+{formatMoney(transaction.convertedAmount, transaction.toCurrency)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Saved Balances</h3>
          {loadingWallet ? (
            <p className="mt-3 text-sm text-slate-500">Loading wallet balances...</p>
          ) : (
            <div className="mt-4 space-y-3">
              {wallet.map((entry) => (
                <div key={entry.currency} className="rounded-xl bg-[#f6f8fc] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{entry.currency}</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{Number(entry.balance).toFixed(4)}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">Live Market Rates</h3>
          <select
            value={baseCurrency}
            onChange={(event) => {
              const nextBase = event.target.value;
              setBaseCurrency(nextBase);
              setExchangeForm((prev) => ({ ...prev, from: nextBase }));
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold focus:border-[#2157d8] focus:outline-none"
          >
            {supportedBaseCurrencies.map((code) => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        {loadingRates ? (
          <p className="text-sm text-slate-500">Fetching live rates...</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(rates).slice(0, 12).map(([currency, rate]) => (
              <div key={currency} className="rounded-xl border border-slate-100 bg-[#f8f9fd] px-3 py-2">
                <p className="text-xs font-semibold text-slate-500">1 {baseCurrency}</p>
                <p className="text-lg font-black text-slate-900">{Number(rate).toFixed(4)} {currency}</p>
              </div>
            ))}
          </div>
        )}
      </article>

      {error && <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>}

      <ReceiptModal
        receipt={receipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        userName={user?.name || "User"}
        userEmail={user?.email || ""}
      />
    </div>
  );
};

export default DashboardPage;
