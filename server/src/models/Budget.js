import mongoose from "mongoose";

// One budget document per user per month. `categories` maps category name -> limit.
const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    month: { type: String, required: true }, // YYYY-MM
    overall: { type: Number, default: 0, min: 0 },
    categories: { type: Object, default: {} },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_d, r) => {
        r.id = r._id.toString();
        delete r._id;
        delete r.userId;
        return r;
      },
    },
  }
);
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
