require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const { DEFAULT_WALLET } = require("../services/walletService");

const seedUsers = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const plainPassword = "Password@123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  let created = 0;

  for (let index = 1; index <= 10; index += 1) {
    const suffix = String(index).padStart(2, "0");
    const email = `demo.user${suffix}@moneyexchange.local`;

    const existing = await User.findOne({ email });

    if (existing) {
      continue;
    }

    await User.create({
      name: `Demo User ${suffix}`,
      email,
      password: hashedPassword,
      baseCurrency: "USD",
      wallet: DEFAULT_WALLET.map((entry) => ({ ...entry })),
    });

    created += 1;
  }

  const totalSeedUsers = await User.countDocuments({
    email: { $regex: /^demo\.user\d{2}@moneyexchange\.local$/i },
  });

  console.log(`Seed complete. Created: ${created}. Total seeded users present: ${totalSeedUsers}.`);
  console.log("Seeded login password for all demo users: Password@123");
};

seedUsers()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
