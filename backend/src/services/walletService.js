const DEFAULT_WALLET = [
  { currency: "USD", balance: 1000 },
  { currency: "EUR", balance: 0 },
  { currency: "INR", balance: 0 },
  { currency: "GBP", balance: 0 },
];

const applyDefaultWallet = (user) => {
  if (!user.wallet || user.wallet.length === 0) {
    user.wallet = DEFAULT_WALLET.map((entry) => ({ ...entry }));
  }

  return user.wallet;
};

const normalizeWallet = (wallet = []) => {
  return wallet.map((entry) => ({
    currency: entry.currency.toUpperCase(),
    balance: Number(entry.balance.toFixed(4)),
  }));
};

const ensureCurrencyInWallet = (wallet, currency) => {
  const normalized = currency.toUpperCase();
  const existing = wallet.find((entry) => entry.currency === normalized);

  if (existing) {
    return existing;
  }

  const nextEntry = { currency: normalized, balance: 0 };
  wallet.push(nextEntry);
  return nextEntry;
};

module.exports = {
  DEFAULT_WALLET,
  applyDefaultWallet,
  normalizeWallet,
  ensureCurrencyInWallet,
};
