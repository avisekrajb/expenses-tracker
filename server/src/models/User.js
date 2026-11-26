import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    photo: { type: String, default: null },
    photoPublicId: { type: String, default: null },
    twoFactor: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, default: null, select: false },
      backupCodes: { type: [String], default: [], select: false },
      enabledAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_d, r) => {
        r.id = r._id.toString();
        delete r._id;
        delete r.password;
        delete r.photoPublicId;
        if (r.twoFactor) {
          delete r.twoFactor.secret;
          delete r.twoFactor.backupCodes;
        }
        return r;
      },
    },
  }
);

export default mongoose.model("User", userSchema);
