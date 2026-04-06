import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/global.css";
import "../styles/Pages.css";

const API_URL = (process.env.REACT_APP_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : `http://${window.location.hostname}:5000`)) + "/api";

function ResetSenha() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";
  const [form, setForm] = useState({ novaSenha: "", confirmar: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErro("");
    if (form.novaSenha !== form.confirmar) return setErro("As senhas não coincidem.");
    if (form.novaSenha.length < 6) return setErro("Mínimo 6 caracteres.");
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/auth/reset-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha: form.novaSenha }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      navigate("/login", { state: { mensagem: data.message } });
    } catch (err) {
      setErro(err.message || "Erro ao redefinir senha.");
    }
    setLoading(false);
  };

  if (!token) return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div className="form-container">
          <div className="alert alert-error">Link inválido. <Link to="/esqueci-senha" style={{ color: "#667eea" }}>Pede um novo.</Link></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="page-title" style={{ marginBottom: "8px" }}>Nova Senha</h1>
          <p style={{ color: "white", fontSize: "15px", opacity: 0.85 }}>Define a tua nova senha</p>
        </div>
        <div className="form-container">
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Nova senha</label>
              <input type="password" value={form.novaSenha} onChange={e => setForm(p => ({ ...p, novaSenha: e.target.value }))} required placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label>Confirmar senha</label>
              <input type="password" value={form.confirmar} onChange={e => setForm(p => ({ ...p, confirmar: e.target.value }))} required placeholder="Repete a senha" autoComplete="new-password" />
            </div>
            {erro && <div className="alert alert-error" style={{ marginBottom: "16px" }}>{erro}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
              {loading ? "A guardar..." : "Guardar nova senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetSenha;
