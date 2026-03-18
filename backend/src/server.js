require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const currencyRoutes = require("./routes/currencyRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/currency", currencyRoutes);

const PORT = Number(process.env.PORT) || 5000;

// Bind locally by default to avoid accidental public exposure.
// Set HOST=0.0.0.0 in production/container environments where you intend to expose it.
const HOST = process.env.HOST || "127.0.0.1";

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
