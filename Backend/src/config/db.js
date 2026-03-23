const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL, {
      serverSelectionTimeoutMS: 30000,
    });

    isConnected = db.connections[0].readyState;
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("DB ERROR:", error.message);
    throw error;
  }
};

module.exports = connectDB;