import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"; 

// LOAD ENV VARS HERE MANUALLY
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically detect resource type (image, video, etc.)
    });
    // console.log("File uploaded to Cloudinary:", result.url);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // fs.unlinkSync(filePath); // Remove the file to save space on our server
    return null;
  }
};

// Derives { publicId, resourceType } from a Cloudinary delivery URL.
// e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.pdf
//   -> { publicId: "folder/name", resourceType: "image" }
const parseCloudinaryUrl = (url) => {
  const match = url.match(/\/(image|video|raw)\/upload\/(.+)$/);
  if (!match) return null;
  const resourceType = match[1];
  const publicId = match[2]
    .replace(/^v\d+\//, "") // strip version segment
    .replace(/\.[^/.]+$/, ""); // strip file extension
  return { publicId, resourceType };
};

// Best-effort delete. Accepts a full Cloudinary URL (preferred — carries the
// resource type) or a bare public_id. Never throws; returns null on failure.
const deleteFromCloudinary = async (urlOrPublicId, { resourceType = "image" } = {}) => {
  try {
    if (!urlOrPublicId) return null;

    let publicId = urlOrPublicId;
    let type = resourceType;

    if (/^https?:\/\//.test(urlOrPublicId)) {
      const parsed = parseCloudinaryUrl(urlOrPublicId);
      if (!parsed) return null;
      publicId = parsed.publicId;
      type = parsed.resourceType;
    }

    return await cloudinary.uploader.destroy(publicId, { resource_type: type });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
