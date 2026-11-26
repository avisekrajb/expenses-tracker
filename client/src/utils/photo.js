// Crops to a centred square and shrinks to 256px JPEG before upload.
export const resizePhoto = (file) => new Promise((resolve, reject) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const S = 256, c = document.createElement("canvas");
    c.width = c.height = S;
    const m = Math.min(img.width, img.height);
    c.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
    URL.revokeObjectURL(url);
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process the photo."))), "image/jpeg", 0.8);
  };
  img.onerror = () => reject(new Error("Could not read that photo."));
  img.src = url;
});

// Keeps the aspect ratio and shrinks the longest side to `max` px (receipts).
export const resizeImage = (file, max = 1400) => new Promise((resolve, reject) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    c.getContext("2d").drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process the image."))), "image/jpeg", 0.85);
  };
  img.onerror = () => reject(new Error("Could not read that image."));
  img.src = url;
});
