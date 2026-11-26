import app from "../src/app.js";
import connectDB from "../src/config/db.js";

// Vercel serverless entry point. The Express app handles every route.
export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error("Serverless handler error:", err);
    res.status(500).json({ error: "Server error. Try again." });
  }
}
