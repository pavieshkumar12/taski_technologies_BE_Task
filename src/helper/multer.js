import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "taski-technologies",
    allowedFormats: ["jpeg", "png", "jpg", "svg"],
    resource_type: "auto", // or 'video' if 'auto' doesn't work
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 24 * 1024 * 1024, // 24 MB
  },
});

// Custom error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File size should not exceed 24MB!" });
  }
  next(err);
};

export { upload, handleUploadError };