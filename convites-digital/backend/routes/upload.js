const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { authenticateToken } = require("../auth");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 200MB max para videos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.post("/", authenticateToken, upload.single("file"), async (req, res, next) => {
  // Timeout de 5 minutos para uploads grandes
  req.setTimeout(300000);
  res.setTimeout(300000);

  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum ficheiro enviado" });

    const tipo = req.body.tipo || "image";
    const resourceType = tipo === "image" ? "image" : "video";

    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: "convites",
          chunk_size: 6000000, // upload em chunks de 6MB
          timeout: 300000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({ url: resultado.secure_url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;