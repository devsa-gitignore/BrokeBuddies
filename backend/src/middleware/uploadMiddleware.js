const multer = require("multer");

/**
 * Configure multer for file uploads.
 * Supports: ID cards, Aadhaar, selfies, PPTs, profile photos.
 */

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allowed file types: Images, PDFs, PPTs, Videos
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "video/mp4",
    "video/webm",
    "application/octet-stream", // Allow generic streams (common in Postman/some clients)
  ];

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".pdf",
    ".ppt",
    ".pptx",
    ".mp4",
    ".webm",
  ];

  const fileExtension = file.originalname
    .toLowerCase()
    .substring(file.originalname.lastIndexOf("."));

  if (
    allowedMimeTypes.includes(file.mimetype) ||
    allowedExtensions.includes(fileExtension)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(`Unsupported file format: ${file.mimetype} (${fileExtension})`),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit to accommodate demo videos
});

module.exports = { upload };
