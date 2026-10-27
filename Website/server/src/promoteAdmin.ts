
import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

async function promoteAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const mongoUri = process.env.MONGODB_URI;

  if (!email) {
    throw new Error("ADMIN_EMAIL is missing from .env");
  }

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from .env");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected.");

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(
        `No existing account found for ADMIN_EMAIL: ${email}`,
      );
    }

    if (!user.isActive) {
      throw new Error(
        "This account is inactive. Activate it through your normal admin process first.",
      );
    }

    if (user.role === "admin") {
      console.log("This account is already an admin.");
      return;
    }

    user.role = "admin";
    await user.save();

    console.log("Existing account successfully promoted to admin.");
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

promoteAdmin().catch((error: unknown) => {
  console.error(
    "Admin promotion failed:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
});
