const axios = require("axios");

const API_BASE = "https://api.frankfurter.app";

const fetchLatestRates = async (base = "USD") => {
  const response = await axios.get(`${API_BASE}/latest`, {
    params: { from: base.toUpperCase() },
  });

  return response.data;
};

module.exports = {
  fetchLatestRates,
};
