import mongoose from "mongoose";
import { CATS } from "../utils/validate.js";

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: CATS },
    date: { type: String, required: true }, // YYYY-MM-DD (local date of the expense)
    desc: { type: String, default: "", maxlength: 200 },
    tags: { type: [String], default: [] },
    recurring: { type: Boolean, default: false },
    // Receipt image URL (Cloudinary) or inline data URL when Cloudinary is not configured.
    receipt: { type: String, default: null },
    receiptPublicId: { type: String, default: null, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_d, r) => {
        r.id = r._id.toString();
        delete r._id;
        delete r.userId;
        delete r.receiptPublicId;
        return r;
      },
    },
  }
);
expenseSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Expense", expenseSchema);
