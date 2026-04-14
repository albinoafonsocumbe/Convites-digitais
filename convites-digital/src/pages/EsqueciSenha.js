import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/Pages.css";

const API_URL = (process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : `https://${window.location.hostname}`)) + "/api";

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setErro("");
    try {
      const r = await fetch(`${API_URL}/auth/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setEnviado(true);
    } catch (err) { setErro(err.message || "Erro ao enviar email."); }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Recuperar Senha</h1>
          <p style={{ color: "white", fontSize: "14px", opacity: 0.85 }}>
            Envia-te um link para redefinir a senha
          </p>
        </div>

        <div className="form-container">
          {enviado ? (
            <div style={{ textAlign: "center" }}>
              {/* Ícone de email */}
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 style={{ color: "#333", marginBottom: "10px", fontSize: "18px" }}>Email enviado</h3>
              <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.6, marginBottom: "8px" }}>
                Enviámos um link de recuperação para <strong>{email}</strong>.
              </p>
              <p style={{ color: "#999", fontSize: "13px", marginBottom: "24px" }}>
                Verifica a caixa de entrada e a pasta de spam. O link expira em 1 hora.
              </p>
              <Link to="/login" style={{ color: "#667eea", fontSize: "14px", fontWeight: 600 }}>
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Email da conta</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="seu@email.com" autoComplete="email"
                />
              </div>
              {erro && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{erro}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
                {loading ? "A enviar..." : "Enviar link de recuperação"}
              </button>
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link to="/login" style={{ color: "#667eea", fontSize: "13px" }}>Voltar ao login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EsqueciSenha;
