import api from "./api";

export const uploadPhoto = (blob) => {
  const fd = new FormData();
  fd.append("photo", blob, "profile.jpg");
  return api.put("/users/me", fd).then((r) => r.data);
};
export const removePhoto = () => api.delete("/users/me/photo").then((r) => r.data);

// Uploads a receipt image and returns { url, publicId }.
export const uploadReceipt = (blob) => {
  const fd = new FormData();
  fd.append("receipt", blob, "receipt.jpg");
  return api.post("/uploads/receipt", fd).then((r) => r.data);
};
