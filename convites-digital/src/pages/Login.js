import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const mensagem = location.state?.mensagem || "";
  const emailPre = location.state?.email || "";
  const [form, setForm] = useState({ email: emailPre, senha: "" });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const ch = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErro(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setErro("");
    try {
      const r = await authAPI.login(form);
      sessionStorage.setItem("token", r.token);
      sessionStorage.setItem("user", JSON.stringify(r.user));
      navigate("/home");
    } catch (err) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        setErro("Servidor a iniciar. Aguarda 30 segundos e tenta novamente.");
      } else {
        setErro(err.message || "Email ou senha incorrectos.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img src="/android-chrome-192x192.png" alt="Logo" style={{ width: "64px", height: "64px", borderRadius: "50%", marginBottom: "12px", objectFit: "cover" }} />
          <h1 className="page-title" style={{ marginBottom: "6px" }}>Entrar</h1>
          <p style={{ color: "white", fontSize: "14px", opacity: 0.8 }}>Gere os teus convites digitais</p>
        </div>

        <div className="form-container">
          {mensagem && <div className="alert alert-success" style={{ marginBottom: "16px" }}>{mensagem}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={ch} required placeholder="seu@email.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" name="senha" value={form.senha} onChange={ch} required placeholder="••••••••" autoComplete="current-password" />
              <div style={{ textAlign: "right", marginTop: "4px" }}>
                <Link to="/esqueci-senha" style={{ fontSize: "12px", color: "#667eea" }}>Esqueci a senha</Link>
              </div>
            </div>
            {erro && <div className="alert alert-error" style={{ marginBottom: "14px" }}>{erro}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", padding: "12px", fontSize: "15px" }}>
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "18px", paddingTop: "18px", borderTop: "1px solid #eee" }}>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>Ainda não tens conta?</p>
            <Link to="/registro">
              <button className="btn" style={{ background: "transparent", border: "1.5px solid #667eea", color: "#667eea", padding: "9px 24px", fontSize: "14px" }}>
                Criar Conta
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
