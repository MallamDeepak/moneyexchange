import axios from "axios";

const ensureApiBasePath = (value) => {
  if (!value) {
    return value;
  }

  const trimmed = value.trim().replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return trimmed;
  }

  return `${trimmed}/api`;
};

const configuredApiUrl = ensureApiBasePath(import.meta.env.VITE_API_URL);

const apiBaseUrl =
  configuredApiUrl ||
  (import.meta.env.DEV
    ? `http://localhost:${import.meta.env.VITE_API_PORT || "5000"}/api`
    : undefined);

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
