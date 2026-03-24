const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET || "";

export async function uploadParaCloudinary(file, tipo) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary nao configurado. Verifica o ficheiro .env");
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const endpoint = tipo === "video"
    ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
    : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const res = await fetch(endpoint, { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Erro no upload");
  }
  const data = await res.json();
  return data.secure_url;
}
