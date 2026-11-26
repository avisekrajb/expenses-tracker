import mongoose from "mongoose";

// One alert per type per user per day, so a cron run cannot spam devices.
const logSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    key: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

logSchema.index({ userId: 1, key: 1 }, { unique: true });

export default mongoose.model("NotificationLog", logSchema);
