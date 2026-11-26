import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    device: { type: String, default: "This device" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("PushSubscription", subscriptionSchema);
