const mongoose = require("mongoose");

const connectDb = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment configuration.");
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    const message = error?.message || "Unknown MongoDB connection error";

    if (message.includes("whitelist") || message.includes("Could not connect to any servers")) {
      console.error("MongoDB Atlas rejected this connection. Add your current IP to Atlas Network Access and retry.");
      console.error("Atlas docs: https://www.mongodb.com/docs/atlas/security/ip-access-list/");
    }

    throw new Error(`MongoDB connection failed: ${message}`);
  }
};

module.exports = connectDb;
