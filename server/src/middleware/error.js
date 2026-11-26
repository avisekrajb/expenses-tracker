export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (_req, res) => res.status(404).json({ error: "Not found." });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let msg = err.message;
  if (err.code === 11000) { status = 409; msg = "Already exists."; }
  else if (err.code === "LIMIT_FILE_SIZE") { status = 400; msg = "Image is too large. Try a smaller file."; }
  else if (err.code === "LIMIT_UNEXPECTED_FILE") { status = 400; msg = "Unexpected file upload."; }
  else if (err.type === "entity.parse.failed") { status = 400; msg = "Invalid JSON."; }
  else if (err.name === "CastError" || err.name === "ValidationError") { status = 400; msg = "Invalid data."; }
  if (status >= 500) { console.error(err); msg = "Server error. Try again."; }
  res.status(status).json({ error: msg });
};
