
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (
    !mongoUri ||
    mongoUri.includes("YOUR_CLUSTER") ||
    mongoUri.includes("example.mongodb.net")
  ) {
    throw new Error(
      "Please set a valid MongoDB Atlas connection string in .env"
    );
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB Atlas connected successfully");

  app.listen(PORT, () => {
    console.log(`LMS API running at http://localhost:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
