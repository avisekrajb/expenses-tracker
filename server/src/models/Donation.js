import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: ["esewa", "bank", "other"], default: "esewa" },
    note: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Donation", donationSchema);
