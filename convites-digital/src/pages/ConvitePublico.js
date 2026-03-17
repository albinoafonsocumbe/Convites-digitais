import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { convitesAPI, confirmacoesAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function ConvitePublico() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome_convidado: "",
    email: "",
    telefone: "",
    confirmado: true,
    numero_acompanhantes: 0,
    mensagem: "",
  });

  useEffect(() => {
    carregarEvento();
  }, [id]);

  const carregarEvento = async () => {
    try {
      const data = await convitesAPI.buscarPorId(id);
      setEvento(data);
    } catch (error) {
      setErro("Convite não encontrado ou link inválido.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSubmitting(true);

    if (!formData.nome_convidado.trim()) {
      setErro("O nome é obrigatório.");
      setSubmitting(false);
      return;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErro("Email inválido.");
        setSubmitting(false);
        return;
      }
    }

    try {
      await confirmacoesAPI.criar(id, formData);
      setEnviado(true);
    } catch (error) {
      setErro(error.message || "Erro ao enviar confirmação. Tente novamente.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center", color: "white", fontSize: "18px", marginTop: "100px" }}>
          A carregar convite...
        </div>
      </div>
    );
  }

  if (erro && !evento) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: "500px", margin: "80px auto", textAlign: "center" }}>
          <h2 style={{ color: "#f5576c", marginBottom: "15px" }}>Convite não encontrado</h2>
          <p style={{ color: "#666" }}>O link pode estar incorreto ou o evento foi removido.</p>
        </div>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: "560px", margin: "80px auto", textAlign: "center", padding: "50px 40px" }}>
          <div style={{
            width: "72px", height: "72px", borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: "32px", color: "white"
          }}>
            {formData.confirmado ? "✓" : "✗"}
          </div>
          <h2 style={{ color: "#333", marginBottom: "12px", fontSize: "24px" }}>
            {formData.confirmado ? "Presença Confirmada!" : "Resposta Enviada"}
          </h2>
          <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.6", marginBottom: "24px" }}>
            {formData.confirmado
              ? `Obrigado, ${formData.nome_convidado}. A sua presença em "${evento.nome_evento}" foi confirmada.`
              : `Obrigado por responder, ${formData.nome_convidado}. A sua resposta foi registada.`
            }
          </p>
          <div style={{ background: "#f8f9ff", borderRadius: "8px", padding: "16px", textAlign: "left" }}>
            <p style={{ margin: "0 0 8px", color: "#555", fontSize: "14px" }}>
              <strong style={{ color: "#667eea" }}>Evento:</strong> {evento.nome_evento}
            </p>
            <p style={{ margin: "0 0 8px", color: "#555", fontSize: "14px" }}>
              <strong style={{ color: "#667eea" }}>Data:</strong>{" "}
              {new Date(evento.data_evento).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ margin: "0", color: "#555", fontSize: "14px" }}>
              <strong style={{ color: "#667eea" }}>Local:</strong> {evento.local_evento}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const dataFormatada = new Date(evento.data_evento).toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="page-container">
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>

        {/* Header do evento */}
        <div className="card" style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white", textAlign: "center", marginBottom: "24px", padding: "40px 32px"
        }}>
          <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", opacity: 0.8, marginBottom: "12px" }}>
            Convite
          </p>
          <h1 style={{ fontSize: "30px", fontWeight: "800", marginBottom: "16px", lineHeight: "1.2" }}>
            {evento.nome_evento}
          </h1>
          {evento.mensagem && (
            <p style={{ fontSize: "16px", opacity: 0.9, lineHeight: "1.6", fontStyle: "italic" }}>
              "{evento.mensagem}"
            </p>
          )}
        </div>

        {/* Detalhes */}
        <div className="card" style={{ marginBottom: "24px", padding: "24px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#667eea", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Data</p>
              <p style={{ fontSize: "15px", color: "#333", fontWeight: 600, margin: 0 }}>{dataFormatada}</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#667eea", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Local</p>
              <p style={{ fontSize: "15px", color: "#333", fontWeight: 600, margin: 0 }}>{evento.local_evento}</p>
            </div>
          </div>
        </div>

        {/* Formulário RSVP */}
        <div className="card" style={{ padding: "32px" }}>
          <h2 style={{ color: "#333", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>
            Confirmar Presença
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome completo *</label>
              <input
                type="text"
                value={formData.nome_convidado}
                onChange={(e) => setFormData({ ...formData, nome_convidado: e.target.value })}
                required
                placeholder="O seu nome"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+258 84 000 0000"
                />
              </div>
            </div>

            {/* Botões Sim/Não */}
            <div className="form-group">
              <label>Vai comparecer? *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, confirmado: true })}
                  style={{
                    padding: "14px",
                    border: `2px solid ${formData.confirmado ? "#667eea" : "#e0e0e0"}`,
                    borderRadius: "8px",
                    background: formData.confirmado ? "#f0f4ff" : "white",
                    color: formData.confirmado ? "#667eea" : "#666",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Sim, vou comparecer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, confirmado: false, numero_acompanhantes: 0 })}
                  style={{
                    padding: "14px",
                    border: `2px solid ${!formData.confirmado ? "#f5576c" : "#e0e0e0"}`,
                    borderRadius: "8px",
                    background: !formData.confirmado ? "#fff5f5" : "white",
                    color: !formData.confirmado ? "#f5576c" : "#666",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  Não poderei ir
                </button>
              </div>
            </div>

            {formData.confirmado && (
              <div className="form-group">
                <label>Número de acompanhantes</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.numero_acompanhantes}
                  onChange={(e) => setFormData({ ...formData, numero_acompanhantes: parseInt(e.target.value) || 0 })}
                />
                <small style={{ color: "#999" }}>Além de si, quantas pessoas virão?</small>
              </div>
            )}

            <div className="form-group">
              <label>Mensagem para o anfitrião (opcional)</label>
              <textarea
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                placeholder="Deixe uma mensagem..."
                rows="3"
              />
            </div>

            {erro && (
              <div className="alert alert-error" style={{ marginBottom: "16px" }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: "100%", fontSize: "16px", padding: "15px", fontWeight: 700 }}
            >
              {submitting ? "A enviar..." : formData.confirmado ? "Confirmar Presença" : "Enviar Resposta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: "13px", marginTop: "24px" }}>
          Convites Digitais
        </p>
      </div>
    </div>
  );
}

export default ConvitePublico;
