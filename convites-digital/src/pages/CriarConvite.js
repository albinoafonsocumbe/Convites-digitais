import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { convitesAPI, uploadAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

async function uploadFicheiro(file, tipo) {
  const result = await uploadAPI.upload(file, tipo);
  return result.url;
}

const secaoStyle = {
  background: "#f8f9ff", borderRadius: "12px", padding: "24px",
  marginBottom: "24px", border: "1px solid #e8ecff"
};
const secaoTitulo = {
  fontSize: "15px", fontWeight: "700", color: "#667eea",
  marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px"
};

// Mini componente de upload de foto individual
function SlotFoto({ url, onUpload, onRemove, index }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploadedUrl = await uploadFicheiro(file, "image");
      onUpload(index, uploadedUrl);
    } catch (err) {
      alert("Erro no upload da foto: " + err.message);
    }
    setUploading(false);
  };

  if (url) {
    return (
      <div style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden" }}>
        <img src={url} alt={`Foto ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button type="button" onClick={() => onRemove(index)} style={{
          position: "absolute", top: "6px", right: "6px",
          background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%",
          color: "white", width: "26px", height: "26px", cursor: "pointer", fontSize: "14px",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>x</button>
      </div>
    );
  }

  return (
    <label style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      aspectRatio: "1", borderRadius: "10px", border: "2px dashed #c5cae9",
      background: "#f8f9ff", cursor: uploading ? "wait" : "pointer", transition: "all 0.2s"
    }}
      onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = "#667eea"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#c5cae9"; }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {uploading
        ? <span style={{ fontSize: "22px" }}>⏳</span>
        : <>
            <span style={{ fontSize: "28px", marginBottom: "4px" }}>+</span>
            <span style={{ fontSize: "11px", color: "#999" }}>Foto</span>
          </>
      }
    </label>
  );
}

function CriarConvite() {
  const navigate = useNavigate();
  const musicaInputRef = useRef();
  const videoInputRef = useRef();

  const [formData, setFormData] = useState({
    titulo: "", descricao: "", data: "", local: "",
    musica_url: "", video_url: "", fotos: []
  });
  const [uploadingMusica, setUploadingMusica] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Upload de música
  const handleMusica = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingMusica(true);
    try {
      const url = await uploadFicheiro(file, "video"); // audio usa endpoint video no Cloudinary
      setFormData(f => ({ ...f, musica_url: url }));
    } catch (err) {
      alert("Erro no upload da música: " + err.message);
    }
    setUploadingMusica(false);
  };

  // Upload de vídeo
  const handleVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadFicheiro(file, "video");
      setFormData(f => ({ ...f, video_url: url }));
    } catch (err) {
      alert("Erro no upload do vídeo: " + err.message);
    }
    setUploadingVideo(false);
  };

  // Fotos
  const handleFotoUpload = (index, url) => {
    const novas = [...formData.fotos];
    novas[index] = url;
    setFormData(f => ({ ...f, fotos: novas }));
  };

  const removerFoto = (index) => {
    setFormData(f => ({ ...f, fotos: f.fotos.filter((_, i) => i !== index) }));
  };

  const adicionarSlotFoto = () => {
    setFormData(f => ({ ...f, fotos: [...f.fotos, ""] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const novoEvento = await convitesAPI.criar(formData);
      setMensagem("Convite criado com sucesso!");
      setTimeout(() => navigate(`/evento/${novoEvento.id}`), 1500);
    } catch (error) {
      setMensagem("Erro ao criar convite: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className="page-title" style={{ marginBottom: "10px" }}>Criar Novo Convite</h1>
          <p style={{ color: "white", fontSize: "18px", opacity: 0.9 }}>
            Personaliza o teu evento com música, fotos e vídeo
          </p>
        </div>

        <div className="form-container" style={{ background: "white", borderRadius: "20px", padding: "50px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          <form onSubmit={handleSubmit}>

            {/* Informações básicas */}
            <div style={secaoStyle}>
              <p style={secaoTitulo}>Informacoes do Evento</p>
              <div className="form-group">
                <label>Titulo do Evento *</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange}
                  required placeholder="Ex: Aniversario de 30 anos, Casamento..." />
              </div>
              <div className="form-group">
                <label>Descricao / Mensagem</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange}
                  placeholder="Escreve uma mensagem especial para os teus convidados..." rows="4" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="form-group">
                  <label>Data do Evento *</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange}
                    required min={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="form-group">
                  <label>Local *</label>
                  <input type="text" name="local" value={formData.local} onChange={handleChange}
                    required placeholder="Ex: Salao de Festas Central" />
                </div>
              </div>
            </div>

            {/* Música */}
            <div style={secaoStyle}>
              <p style={secaoTitulo}>Musica de Fundo</p>
              <input ref={musicaInputRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={handleMusica} />
              {formData.musica_url ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f0f4ff", borderRadius: "10px", padding: "14px 16px" }}>
                  <span style={{ fontSize: "24px" }}>🎵</span>
                  <div style={{ flex: 1 }}>
                    <audio controls src={formData.musica_url} style={{ width: "100%", height: "36px" }} />
                  </div>
                  <button type="button" onClick={() => setFormData(f => ({ ...f, musica_url: "" }))}
                    style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: "8px",
                      color: "#f5576c", padding: "6px 12px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                    Remover
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => musicaInputRef.current.click()}
                  disabled={uploadingMusica}
                  style={{ width: "100%", padding: "20px", border: "2px dashed #c5cae9", borderRadius: "10px",
                    background: "#f8f9ff", cursor: uploadingMusica ? "wait" : "pointer",
                    color: "#667eea", fontSize: "15px", fontWeight: 600, display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  {uploadingMusica ? "A fazer upload..." : "Escolher ficheiro de musica (MP3, WAV...)"}
                </button>
              )}
              <small style={{ color: "#999", marginTop: "8px", display: "block" }}>
                Ou cola um link direto: <input type="url" name="musica_url" value={formData.musica_url}
                  onChange={handleChange} placeholder="https://..." style={{ border: "none", borderBottom: "1px solid #ddd",
                    outline: "none", fontSize: "13px", color: "#555", width: "60%", padding: "2px 4px" }} />
              </small>
            </div>

            {/* Vídeo */}
            <div style={secaoStyle}>
              <p style={secaoTitulo}>Video / Reels</p>
              <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideo} />
              {formData.video_url ? (
                <div>
                  <video controls src={formData.video_url} style={{ width: "100%", borderRadius: "10px", maxHeight: "240px" }} />
                  <button type="button" onClick={() => setFormData(f => ({ ...f, video_url: "" }))}
                    style={{ marginTop: "8px", background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: "8px",
                      color: "#f5576c", padding: "6px 14px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>
                    Remover video
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => videoInputRef.current.click()}
                  disabled={uploadingVideo}
                  style={{ width: "100%", padding: "20px", border: "2px dashed #c5cae9", borderRadius: "10px",
                    background: "#f8f9ff", cursor: uploadingVideo ? "wait" : "pointer",
                    color: "#667eea", fontSize: "15px", fontWeight: 600, display: "flex",
                    alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  {uploadingVideo ? "A fazer upload..." : "Escolher video (MP4, MOV...)"}
                </button>
              )}
              <small style={{ color: "#999", marginTop: "8px", display: "block" }}>
                Ou cola link do YouTube: <input type="url" name="video_url" value={formData.video_url}
                  onChange={handleChange} placeholder="https://youtube.com/..." style={{ border: "none", borderBottom: "1px solid #ddd",
                    outline: "none", fontSize: "13px", color: "#555", width: "55%", padding: "2px 4px" }} />
              </small>
            </div>

            {/* Fotos */}
            <div style={secaoStyle}>
              <p style={secaoTitulo}>Galeria de Fotos</p>
              <small style={{ color: "#999", display: "block", marginBottom: "16px" }}>
                Clica nos quadrados para adicionar fotos do teu dispositivo
              </small>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
                {formData.fotos.map((foto, i) => (
                  <SlotFoto key={i} url={foto} index={i} onUpload={handleFotoUpload} onRemove={removerFoto} />
                ))}
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  aspectRatio: "1", borderRadius: "10px", border: "2px dashed #c5cae9",
                  background: "#f8f9ff", cursor: "pointer"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#667eea"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#c5cae9"}
                  onClick={adicionarSlotFoto}
                >
                  <span style={{ fontSize: "28px", color: "#667eea" }}>+</span>
                  <span style={{ fontSize: "11px", color: "#999" }}>Adicionar</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: "100%", fontSize: "18px", padding: "18px", marginTop: "10px" }}>
              {loading ? "A criar convite..." : "Criar Convite"}
            </button>
          </form>

          {mensagem && (
            <div className={mensagem.includes("sucesso") ? "alert alert-success" : "alert alert-error"}
              style={{ marginTop: "20px", textAlign: "center" }}>
              {mensagem}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button onClick={() => navigate("/meus-convites")} className="btn"
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid white" }}>
            Voltar para Meus Convites
          </button>
        </div>
      </div>
    </div>
  );
}

export default CriarConvite;
