require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

const app = express();

const parseAllowedOrigins = () => {
  const defaults = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://moneyexchange-ten.vercel.app",
  ];
  const configured = [process.env.FRONTEND_URL, process.env.FRONTEND_URLS]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaults, ...configured]);
};

const allowedOrigins = parseAllowedOrigins();
const allowedOriginPatterns = [
  /^https:\/\/moneyexchange-[a-z0-9-]+-mallam-deepaks-projects\.vercel\.app$/i,
];

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.has(origin)) {
    return true;
  }

  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/currency", currencyRoutes);

const PORT = Number(process.env.PORT) || 5000;

// In hosted/container environments, bind to all interfaces so the platform can route traffic.
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
