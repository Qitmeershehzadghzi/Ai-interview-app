const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app.js");
const connectDB = require("./src/config/db.js");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Serverless: connect DB on every cold start, then handle the request
// The connection is cached in db.js so it's only established once per container
const handler = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection failed:", err);
    return res.status(500).json({ error: "Database connection failed" });
  }
  return app(req, res);
};

// ✅ Local dev: use app.listen directly
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
    });
}

// ✅ Export for Vercel serverless
module.exports = app;