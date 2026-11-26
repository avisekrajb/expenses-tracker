import User from "../models/User.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { hashPassword, comparePassword } from "../utils/hashPw.js";
import { signToken } from "../utils/jwt.js";
import { validateSignup } from "../utils/validate.js";
import { uploadImage, destroyImage } from "../config/cloudinary.js";

export const signup = asyncHandler(async (req, res) => {
  const err = validateSignup(req.body);
  if (err) throw new HttpError(400, err);
  const email = req.body.email.trim().toLowerCase();
  if (await User.exists({ email })) throw new HttpError(409, "This email is already registered. Log in instead.");
  await User.create({ name: req.body.name.trim().slice(0, 60), email, password: await hashPassword(req.body.password) });
  res.status(201).json({ ok: true });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await comparePassword(req.body?.password, user.password))) throw new HttpError(401, "Wrong email or password.");
  res.json({ token: signToken(user.id), user });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(401, "Please log in again.");
  res.json(user);
});

// PUT /api/users/me  (multipart: optional "photo" file, optional "name")
export const updateProfile = asyncHandler(async (req, res) => {
  const current = await User.findById(req.userId).select("+photoPublicId");
  if (!current) throw new HttpError(401, "Please log in again.");

  const set = {};
  if (typeof req.body?.name === "string" && req.body.name.trim()) set.name = req.body.name.trim().slice(0, 60);

  if (req.file) {
    const uploaded = await uploadImage(req.file.buffer, "kharcha/avatars");
    if (uploaded) {
      set.photo = uploaded.url;
      set.photoPublicId = uploaded.publicId;
      if (current.photoPublicId) await destroyImage(current.photoPublicId);
    } else {
      // Local fallback when Cloudinary credentials are absent.
      set.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, set, { new: true });
  res.json(user);
});

export const removePhoto = asyncHandler(async (req, res) => {
  const current = await User.findById(req.userId).select("+photoPublicId");
  if (!current) throw new HttpError(401, "Please log in again.");
  if (current.photoPublicId) await destroyImage(current.photoPublicId);
  res.json(await User.findByIdAndUpdate(req.userId, { photo: null, photoPublicId: null }, { new: true }));
});
