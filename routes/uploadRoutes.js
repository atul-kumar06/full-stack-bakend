const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

//  cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Function to handle the stream uplaod to cloudinary

    const streamUpload = (filebuffer) => {
      return new Promise((res, rej) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            res(result);
          } else {
            rej(error);
          }
        });
        // Use streamifier to convert file buffer to a stream
        streamifier.createReadStream(filebuffer).pipe(stream);
      });
    };
    // Call the streamUpload function
    const result = await streamUpload(req.file.buffer);

    // Response with upload image url
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" }); // Consistency: return JSON instead of .send()
  }
});

module.exports = router;
