import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/Pages.css";

const API_URL = (process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : `http://${window.location.hostname}:5000`)) + "/api";

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setErro(""); setMsg("");
    try {
      const r = await fetch(`${API_URL}/auth/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMsg(data.message);
    } catch (err) {
      setErro(err.message || "Erro ao enviar email.");
    }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Recuperar Senha</h1>
          <p style={{ color: "white", fontSize: "15px", opacity: 0.85 }}>Envia-te um link para redefinir a senha</p>
        </div>
        <div className="form-container">
          {msg ? (
            <div>
              <div className="alert alert-success" style={{ marginBottom: "20px" }}>{msg}</div>
              <p style={{ color: "#888", fontSize: "13px", textAlign: "center" }}>Verifica a tua caixa de entrada (e spam).</p>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Link to="/login" style={{ color: "#667eea", fontSize: "14px", fontWeight: 600 }}>Voltar ao login</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Email da conta</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" autoComplete="email" />
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
