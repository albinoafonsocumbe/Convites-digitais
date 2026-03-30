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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    await runMulter(req, res);

    if (!req.file) {
      console.error("❌ Upload: nenhum ficheiro recebido. Body:", req.body);
      return res.status(400).json({ error: "Nenhum ficheiro enviado" });
    }

    const tipo = req.body.tipo || "image";
    const isVideo = tipo === "video" || tipo === "audio";
    const resourceType = tipo === "image" ? "image" : "video";

    console.log(`📤 Upload: ${req.file.originalname} (${(req.file.size/1024).toFixed(1)}KB) tipo=${tipo} resource=${resourceType}`);

    const options = {
      resource_type: resourceType,
      folder: "convites",
      timeout: 300000,
    };

    const resultado = await new Promise((resolve, reject) => {
      const stream = isVideo
        ? cloudinary.uploader.upload_chunked_stream(
            (error, result) => { if (error) return reject(error); resolve(result); },
            { ...options, chunk_size: 6000000 }
          )
        : cloudinary.uploader.upload_stream(
            options,
            (error, result) => { if (error) return reject(error); resolve(result); }
          );

      stream.end(req.file.buffer);
    });

    console.log(`✅ Upload concluido: ${resultado.secure_url}`);
    res.json({ url: resultado.secure_url });
  } catch (err) {
    console.error("❌ Erro no upload:", err.message);
    if (err.code && err.code.startsWith("LIMIT_")) {
      return res.status(413).json({ error: "Ficheiro demasiado grande (máximo 200MB)" });
    }
    next(err);
  }
});

module.exports = router;
