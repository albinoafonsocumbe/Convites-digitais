import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convitesAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function CriarConvite() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ titulo: "", descricao: "", data: "", local: "" });
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
            Preenche os detalhes do teu evento e cria um convite profissional
          </p>
        </div>

        <div className="form-container" style={{ background: "white", borderRadius: "20px", padding: "50px", boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)" }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título do Evento *</label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Ex: Aniversário de 30 anos, Casamento, Formatura..."
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreve o teu evento..."
                rows="5"
              />
              <small>Esta descrição aparecerá no convite público</small>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div className="form-group">
                <label>Data do Evento *</label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>Local *</label>
                <input
                  type="text"
                  name="local"
                  value={formData.local}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Salão de Festas Central"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", fontSize: "18px", padding: "18px", marginTop: "10px" }}
            >
              {loading ? "Criando convite..." : "Criar Convite"}
            </button>
          </form>

          {mensagem && (
            <div
              className={mensagem.includes("sucesso") ? "alert alert-success" : "alert alert-error"}
              style={{ marginTop: "20px", textAlign: "center" }}
            >
              {mensagem}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={() => navigate("/meus-convites")}
            className="btn"
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid white" }}
          >
            Voltar para Meus Convites
          </button>
        </div>
      </div>
    </div>
  );
}

export default CriarConvite;
