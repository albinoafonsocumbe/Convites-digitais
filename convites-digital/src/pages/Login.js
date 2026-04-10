import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "../styles/global.css";
import "../styles/Pages.css";

const API_HOST = process.env.REACT_APP_API_URL
  || (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : `http://${window.location.hostname}:5000`);

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
      navigate("/");
    } catch (err) {
      setErro(err.message || "Email ou senha incorrectos.");
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_HOST}/api/auth/google`;
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

          {/* Google */}
          <button type="button" onClick={handleGoogle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "12px 16px", background: "white", border: "1.5px solid #ddd", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "#333", marginBottom: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continuar com Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ flex: 1, height: "1px", background: "#eee" }}/>
            <span style={{ fontSize: "12px", color: "#aaa" }}>ou</span>
            <div style={{ flex: 1, height: "1px", background: "#eee" }}/>
          </div>

          {/* Email/senha */}
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
