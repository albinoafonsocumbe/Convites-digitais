import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/Pages.css";

const API_URL = (process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : `https://${window.location.hostname}`)) + "/api";

function EsqueciSenha() {
  const navigate = useNavigate();
  // passo: "telefone" | "codigo" | "nova-senha"
  const [passo, setPasso] = useState("telefone");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Passo 1 — enviar código SMS
  const enviarCodigo = async (e) => {
    e.preventDefault(); setLoading(true); setErro("");
    try {
      const r = await fetch(`${API_URL}/auth/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMsg(data.message);
      setPasso("codigo");
    } catch (err) { setErro(err.message || "Erro ao enviar código."); }
    setLoading(false);
  };

  // Passo 2 — verificar código
  const verificarCodigo = async (e) => {
    e.preventDefault(); setLoading(true); setErro("");
    try {
      const r = await fetch(`${API_URL}/auth/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone, codigo }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setResetToken(data.token);
      setPasso("nova-senha");
    } catch (err) { setErro(err.message || "Código inválido."); }
    setLoading(false);
  };

  // Passo 3 — nova senha
  const redefinirSenha = async (e) => {
    e.preventDefault(); setErro("");
    if (novaSenha !== confirmar) return setErro("As senhas não coincidem.");
    if (novaSenha.length < 6) return setErro("Mínimo 6 caracteres.");
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/auth/reset-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, novaSenha }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      navigate("/login", { state: { mensagem: "Senha redefinida com sucesso! Faz login." } });
    } catch (err) { setErro(err.message || "Erro ao redefinir senha."); }
    setLoading(false);
  };

  const passos = ["telefone", "codigo", "nova-senha"];
  const passoIdx = passos.indexOf(passo);

  return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Recuperar Senha</h1>
          <p style={{ color: "white", fontSize: "14px", opacity: 0.85 }}>Vamos enviar um código para o teu telemóvel</p>
        </div>

        {/* Indicador de passos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          {["Telefone", "Código", "Nova Senha"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700,
                background: i <= passoIdx ? "#667eea" : "rgba(255,255,255,0.2)",
                color: "white",
              }}>{i + 1}</div>
              <span style={{ fontSize: "11px", color: i <= passoIdx ? "white" : "rgba(255,255,255,0.5)", fontWeight: i === passoIdx ? 700 : 400 }}>{label}</span>
              {i < 2 && <div style={{ width: "20px", height: "1px", background: i < passoIdx ? "#667eea" : "rgba(255,255,255,0.2)" }} />}
            </div>
          ))}
        </div>

        <div className="form-container">
          {/* Passo 1 */}
          {passo === "telefone" && (
            <form onSubmit={enviarCodigo}>
              <div className="form-group">
                <label>Número de Telefone</label>
                <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} required placeholder="+244 9XX XXX XXX" autoComplete="tel" />
                <small style={{ color: "#999", fontSize: "11px" }}>O número que registaste na conta</small>
              </div>
              {erro && <div className="alert alert-error" style={{ marginBottom: "14px" }}>{erro}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
                {loading ? "A enviar..." : "Enviar Código SMS"}
              </button>
              <div style={{ textAlign: "center", marginTop: "14px" }}>
                <Link to="/login" style={{ color: "#667eea", fontSize: "13px" }}>Voltar ao login</Link>
              </div>
            </form>
          )}

          {/* Passo 2 */}
          {passo === "codigo" && (
            <form onSubmit={verificarCodigo}>
              {msg && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{msg}</div>}
              <div className="form-group">
                <label>Código de Verificação</label>
                <input
                  type="text" value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required placeholder="000000" maxLength={6}
                  style={{ fontSize: "24px", letterSpacing: "8px", textAlign: "center" }}
                  autoComplete="one-time-code"
                />
                <small style={{ color: "#999", fontSize: "11px" }}>Código de 6 dígitos enviado para {telefone}</small>
              </div>
              {erro && <div className="alert alert-error" style={{ marginBottom: "14px" }}>{erro}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading || codigo.length < 6} style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
                {loading ? "A verificar..." : "Verificar Código"}
              </button>
              <div style={{ textAlign: "center", marginTop: "14px" }}>
                <button type="button" onClick={() => { setPasso("telefone"); setErro(""); setCodigo(""); }}
                  style={{ background: "none", border: "none", color: "#667eea", fontSize: "13px", cursor: "pointer" }}>
                  Reenviar código
                </button>
              </div>
            </form>
          )}

          {/* Passo 3 */}
          {passo === "nova-senha" && (
            <form onSubmit={redefinirSenha}>
              <div className="form-group">
                <label>Nova Senha</label>
                <input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label>Confirmar Senha</label>
                <input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required placeholder="Repete a senha" autoComplete="new-password" />
              </div>
              {erro && <div className="alert alert-error" style={{ marginBottom: "14px" }}>{erro}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
                {loading ? "A guardar..." : "Guardar Nova Senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;
