import mongoose from "mongoose";
import { env } from "./env.js";

// Cache the connection so serverless invocations (Vercel) can reuse it.
let cached = global.__kharchaMongo;
if (!cached) cached = global.__kharchaMongo = { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(env.MONGO_URI, {
        dbName: env.MONGODB_DB || undefined,
        serverSelectionTimeoutMS: 15000,
      })
      .then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  console.log("MongoDB connected:", mongoose.connection.name);
  return cached.conn;
}
