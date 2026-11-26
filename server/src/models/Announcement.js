import mongoose from "mongoose";

// Admin announcements are both the push source and the in-app notification page.
// readBy keeps read state per user so one post can be sent to everyone.
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Kharcha update", trim: true, maxlength: 120 },
    message: { type: String, default: "", trim: true, maxlength: 2000 },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    url: { type: String, default: "/#/notifications" },
    audience: { type: String, enum: ["all"], default: "all", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.readBy;
        if (ret.image) delete ret.image.publicId;
        return ret;
      },
    },
  }
);

announcementSchema.index({ createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);
