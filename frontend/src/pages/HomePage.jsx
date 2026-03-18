import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const CurrencyDropdown = ({ value, options, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-[#a9c0ff] focus:border-[#2157d8] focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={label}
      >
        <span>{value}</span>
        <svg
          className={`h-4 w-4 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          <ul className="max-h-52 overflow-y-auto" role="listbox" aria-label={label}>
            {options.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(code);
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    value === code
                      ? "bg-[#2157d8] text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  role="option"
                  aria-selected={value === code}
                >
                  {code}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const processSteps = [
  {
    title: "Check Rates",
    description: "Choose your currencies and lock your amount with transparent pricing.",
  },
  {
    title: "Set Up Transfer",
    description: "Add recipient details and review transfer cost before sending.",
  },
  {
    title: "Send And Track",
    description: "Track each transfer status from dashboard history in real-time.",
  },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("1000.00");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [rates, setRates] = useState({});
  const [rateDate, setRateDate] = useState("");
  const [ratesError, setRatesError] = useState("");

  const supportedCurrencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR"];

  const marketRows = useMemo(() => {
    const pairs = ["EUR", "GBP", "JPY"];

    return pairs
      .filter((code) => Boolean(rates[code]))
      .map((code) => ({
        pair: `${fromCurrency} / ${code}`,
        rate: Number(rates[code]).toFixed(4),
      }));
  }, [fromCurrency, rates]);

  const convertedAmount = useMemo(() => {
    const numericAmount = Number(amount);
    const marketRate = Number(rates[toCurrency] || 0);

    if (Number.isNaN(numericAmount) || numericAmount <= 0 || marketRate <= 0) {
      return "0.00";
    }

    return (numericAmount * marketRate).toFixed(2);
  }, [amount, rates, toCurrency]);

  const formattedConvertedAmount = useMemo(() => {
    const numeric = Number(convertedAmount);

    if (Number.isNaN(numeric)) {
      return "0.00";
    }

    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  }, [convertedAmount]);

  useEffect(() => {
    const loadPublicRates = async () => {
      try {
        const response = await api.get(`/currency/public-rates?base=${fromCurrency}`);
        setRates(response.data.rates || {});
        setRateDate(response.data.date || "");
        setRatesError("");
      } catch (error) {
        setRatesError(error.response?.data?.message || "Live market rates unavailable.");
      }
    };

    loadPublicRates();
    const intervalId = setInterval(loadPublicRates, 30000);
    return () => clearInterval(intervalId);
  }, [fromCurrency]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4f7ff] text-slate-900">
      <div className="bg-[radial-gradient(circle_at_top_left,#0d2f64,transparent_45%),linear-gradient(120deg,#05132b_0%,#0f2f62_48%,#13203d_100%)] text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center justify-between py-5">
            <Link to="/" className="text-xl font-black tracking-tight">
              X-Change
            </Link>

            <div className="hidden items-center gap-7 text-xs font-semibold text-slate-200 md:flex">
              <a href="#rates" className="hover:text-white">Exchange Rates</a>
              <a href="#how" className="hover:text-white">Personal</a>
              <a href="#how" className="hover:text-white">Business</a>
              <a href="#help" className="hover:text-white">Help</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="text-xs font-semibold text-slate-200 hover:text-white">
                Log In
              </Link>
              <Link to="/register" className="rounded-md bg-white px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100">
                Register
              </Link>
            </div>
          </nav>

          <section className="grid items-center gap-10 pb-20 pt-10 lg:grid-cols-[1fr_420px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Fast, transparent, global</p>
              <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">
                The World&apos;s Most Trusted Way to Exchange Money
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                Low fees, real-time exchange rates, and bank-level security. Transfer funds across 50+ currencies in seconds.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
                <p>No Hidden Fees</p>
                <p>Fast Transfers</p>
              </div>
            </div>

            <article className="rounded-2xl border border-white/20 bg-white p-5 text-slate-900 shadow-2xl">
              <h2 className="text-sm font-bold text-slate-600">Amount to convert</h2>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-lg font-bold"
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <CurrencyDropdown
                  value={fromCurrency}
                  options={supportedCurrencies}
                  onChange={setFromCurrency}
                  label="From currency"
                />
                <CurrencyDropdown
                  value={toCurrency}
                  options={supportedCurrencies}
                  onChange={setToCurrency}
                  label="To currency"
                />
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <p>Exchange Rate</p>
                  <p className="font-semibold text-slate-800">1 {fromCurrency} = {Number(rates[toCurrency] || 0).toFixed(4)} {toCurrency}</p>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p>Recipient Gets</p>
                  <p className="text-lg font-black text-[#2157d8]">{formattedConvertedAmount} {toCurrency}</p>
                </div>
                <p className="mt-2 text-[11px] text-slate-400">Live market date: {rateDate || "--"}</p>
              </div>

              {ratesError && <p className="mt-3 text-xs font-semibold text-rose-600">{ratesError}</p>}

              <Link
                to="/register"
                className="mt-4 block rounded-lg bg-[#14b874] px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-[#0fa064]"
              >
                Get Started Now
              </Link>
            </article>
          </section>
        </div>
      </div>

      <section id="rates" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 text-center">
            <h2 className="text-3xl font-black text-slate-900">Popular Currency Pairs</h2>
            <p className="mt-2 text-sm text-slate-500">Live mid-market rates update every 60 seconds</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Currency Pair</th>
                  <th className="px-3 py-3">Mid-Market Rate</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketRows.map((row) => (
                  <tr key={row.pair} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-3 font-bold text-slate-800">{row.pair}</td>
                    <td className="px-3 py-3">{row.rate}</td>
                    <td className="px-3 py-3">
                      <Link to="/login" className="font-semibold text-[#2157d8] hover:text-[#1948b8]">Exchange</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="how" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-900">How X-Change Works</h2>
            <p className="mt-2 text-sm text-slate-500">Sending and exchanging money is simple. We streamlined the process into three easy steps.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{index + 1}</p>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="help" className="bg-[#071533] py-10 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-semibold text-white">X-Change Financial Services</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
