const mongoose = require("mongoose");

// Cache the connection across serverless cold starts (Vercel/Lambda)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Already connected — reuse the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  const MONGO_URI = process.env.MONGODB_URL;
  if (!MONGO_URI) {
    throw new Error("MONGODB_URL is not defined in environment variables");
  }

  // If a connection is in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      })
      .then((m) => {
        console.log("MongoDB Connected ✅");
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;