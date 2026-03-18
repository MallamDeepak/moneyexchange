import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const HistoryPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const [historyResponse, walletResponse] = await Promise.all([
          api.get("/currency/transactions"),
          api.get("/currency/wallet"),
        ]);

        setTransactions(historyResponse.data || []);
        if (walletResponse.data.baseCurrency) {
          setBaseCurrency(walletResponse.data.baseCurrency);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Could not load transfer history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const totals = useMemo(() => {
    const sentByCurrency = {};
    const receivedByCurrency = {};

    transactions.forEach((tx) => {
      const fromCurrency = tx.fromCurrency || "unknown";
      const toCurrency = tx.toCurrency || "unknown";
      const sentAmount = Number(tx.sourceAmount || 0);
      const receivedAmount = Number(tx.convertedAmount || 0);

      sentByCurrency[fromCurrency] = (sentByCurrency[fromCurrency] || 0) + sentAmount;
      receivedByCurrency[toCurrency] = (receivedByCurrency[toCurrency] || 0) + receivedAmount;
    });

    const totalSentAmount = Object.values(sentByCurrency).reduce((sum, val) => sum + val, 0);
    const totalReceivedAmount = Object.values(receivedByCurrency).reduce((sum, val) => sum + val, 0);

    return {
      count: transactions.length,
      totalSentAmount: totalSentAmount.toFixed(2),
      totalReceivedAmount: totalReceivedAmount.toFixed(2),
      sentByCurrency,
      receivedByCurrency,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Transfers</p>
          <p className="mt-2 text-4xl font-black text-slate-900">{totals.count}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Sent</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{totals.totalSentAmount}</p>
          <div className="mt-3 space-y-1">
            {Object.entries(totals.sentByCurrency).map(([currency, amount]) => (
              <p key={currency} className="text-xs font-semibold text-slate-600">
                {Number(amount).toFixed(2)} {currency}
              </p>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Received</p>
          <p className="mt-2 text-3xl font-black text-[#2157d8]">{totals.totalReceivedAmount}</p>
          <div className="mt-3 space-y-1">
            {Object.entries(totals.receivedByCurrency).map(([currency, amount]) => (
              <p key={currency} className="text-xs font-semibold text-[#2157d8]">
                {Number(amount).toFixed(2)} {currency}
              </p>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Transfer History</h2>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Latest 100 from backend</p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-slate-500">No transfers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">From</th>
                  <th className="px-3 py-3 font-semibold">To</th>
                  <th className="px-3 py-3 font-semibold">Rate</th>
                  <th className="px-3 py-3 font-semibold">Converted</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3 text-slate-600">{transaction.date}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {Number(transaction.sourceAmount).toFixed(4)} {transaction.fromCurrency}
                    </td>
                    <td className="px-3 py-3 text-slate-900">{transaction.toCurrency}</td>
                    <td className="px-3 py-3 text-slate-600">{Number(transaction.rate).toFixed(4)}</td>
                    <td className="px-3 py-3 font-semibold text-[#2157d8]">
                      {Number(transaction.convertedAmount).toFixed(4)} {transaction.toCurrency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {error && <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
};

export default HistoryPage;
