import mongoose from "mongoose";
import { LOAN_TYPES } from "../utils/validate.js";

// type "given": you gave money to a friend (they owe you).
// type "taken": you borrowed money from a friend (you owe them).
const loanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: LOAN_TYPES, required: true },
    friend: { type: String, required: true, maxlength: 60 },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: String, required: true }, // YYYY-MM-DD (when money changed hands)
    dueDate: { type: String, default: null }, // YYYY-MM-DD, optional
    note: { type: String, default: "", maxlength: 200 },
    settled: { type: Boolean, default: false },
    settledAt: { type: Date, default: null },
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

loanSchema.index({ userId: 1, date: -1 });
export default mongoose.model("Loan", loanSchema);
