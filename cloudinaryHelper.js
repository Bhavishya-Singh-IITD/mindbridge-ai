import cloudinary from "../config/cloudinary.js";

// ── Upload a buffer to Cloudinary ─────────────────────────────
export const uploadToCloudinary = (fileBuffer, folder = "artisan-hub") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );
    stream.end(fileBuffer);
  });
};

// ── Delete an image from Cloudinary ───────────────────────────
export const deleteFromCloudinary = async (public_id) => {
  await cloudinary.uploader.destroy(public_id);
};
