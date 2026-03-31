/**
 * Cloud storage configuration using Cloudinary.
 * Used for uploading ID cards, Aadhaar, selfies, PPTs, certificates.
 */

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const initCloudStorage = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("Cloudinary credentials missing in .env");
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary Storage Initialized.");
};

/**
 * Upload a file to cloud storage.
 * @param {Buffer} fileBuffer - File data
 * @param {string} fileName - Destination file name
 * @param {string} folder - Destination folder/bucket path
 * @returns {Promise<Object>} The Cloudinary result object
 */
const uploadFile = async (fileBuffer, fileName, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    // Determine the resource type based on extension.
    // Cloudinary needs 'video' for MP4/WEBM, 'raw' for PDFs/PPTs, 'image' usually defaults.
    const ext = fileName.split(".").pop().toLowerCase();
    const isVideo = ["mp4", "webm", "avi", "mov", "mkv"].includes(ext);
    const isRaw = ["pdf", "ppt", "pptx", "zip"].includes(ext);

    let resourceType = "auto";
    if (isVideo) resourceType = "video";
    else if (isRaw) resourceType = "raw";

    const options = {
      folder: folder,
      resource_type: resourceType,
      // For raw files, Cloudinary needs the complete filename in public_id.
      // For images/videos, it's safer to provide the name without the extension, and pass the explicit format.
      public_id: isRaw
        ? fileName
        : fileName.substring(0, fileName.lastIndexOf(".")) || fileName,
    };

    if (!isRaw && ext && ext !== fileName.toLowerCase()) {
      options.format = ext;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/**
 * Delete a file from cloud storage.
 * @param {string} publicId - The Cloudinary public_id of the file to delete
 * @returns {Promise<boolean>}
 */
const deleteFile = async (publicId) => {
  try {
    // Cloudinary destroy defaults to 'image'. If it's a video or raw file, we must specify the resource_type.
    let res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (res.result !== "ok") {
      res = await cloudinary.uploader.destroy(publicId, {
        resource_type: "video",
      });
    }

    if (res.result !== "ok") {
      // For raw files, the publicId usually includes the extension.
      res = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    }

    return res.result === "ok";
  } catch (error) {
    console.error("Delete from Cloudinary failed:", error);
    return false;
  }
};

// --- Controllers explicitly placed here due to "no new files" constraint ---

const uploadFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const { originalname, buffer } = req.file;
    const folder = req.body.folder || "hackfire_general";

    const result = await uploadFile(buffer, originalname, folder);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: result.secure_url,
      fileName: originalname,
      fileId: encodeURIComponent(result.public_id), // URL-encode to safely pass in REST params
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Upload Failed" });
  }
};

const deleteFileController = async (req, res) => {
  try {
    let { fileId } = req.params;

    // Decode the ID in case it includes slash characters (e.g. hackfire_general/my_image)
    fileId = decodeURIComponent(fileId);

    await deleteFile(fileId);

    // If result was 'ok' or 'not found', respond success.
    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message || "Deletion Failed" });
  }
};

module.exports = {
  initCloudStorage,
  uploadFile,
  deleteFile,
  uploadFileController,
  deleteFileController,
};
