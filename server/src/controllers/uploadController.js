import { asyncHandler, HttpError } from "../middleware/error.js";
import { uploadImage, cloudinaryEnabled } from "../config/cloudinary.js";

// POST /api/uploads/receipt  (multipart "receipt")
// Returns { url, publicId }. Falls back to an inline data URL in local development.
export const uploadReceiptImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "Choose an image to upload.");
  const uploaded = await uploadImage(req.file.buffer, "kharcha/receipts");
  if (uploaded) return res.status(201).json(uploaded);
  res.status(201).json({
    url: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
    publicId: null,
    storage: cloudinaryEnabled ? "cloudinary" : "inline",
  });
});
