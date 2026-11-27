import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    photo: { type: String, default: null },
    photoPublicId: { type: String, default: null },
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
        return r;
      },
    },
  }
);

export default mongoose.model("User", userSchema);
