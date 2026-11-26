import mongoose from "mongoose";

// Per-user access granted when an admin approves a feature request.
const overrideSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    feature: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

overrideSchema.index({ userId: 1, feature: 1 }, { unique: true });
export default mongoose.model("FeatureOverride", overrideSchema);
